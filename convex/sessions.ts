import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const transcriptValidator = v.array(
  v.object({
    role: v.union(v.literal("assistant"), v.literal("user")),
    text: v.string(),
  }),
);

function extractedAct(roadmap: unknown): number | null {
  if (
    roadmap &&
    typeof roadmap === "object" &&
    "actReached" in roadmap &&
    typeof (roadmap as { actReached: unknown }).actReached === "number"
  ) {
    return (roadmap as { actReached: number }).actReached;
  }
  return null;
}

const profileStatusValidator = v.union(
  v.literal("pending"),
  v.literal("ready"),
  v.literal("failed"),
  v.literal("none"),
);

export const create = mutationGeneric({
  args: {
    source: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    profileStatus: v.optional(profileStatusValidator),
    profile: v.optional(v.union(v.any(), v.null())),
  },
  handler: async (ctx, args) => {
    const linkedinUrl = args.linkedinUrl || undefined;
    return await ctx.db.insert("sessions", {
      createdAt: Date.now(),
      source: args.source,
      transcript: [],
      roadmap: null,
      actReached: null,
      selectedPath: null,
      shares: 0,
      sent: false,
      contactName: null,
      ...(args.name ? { name: args.name } : {}),
      ...(args.email ? { email: args.email } : {}),
      ...(args.phone ? { phone: args.phone } : {}),
      ...(linkedinUrl ? { linkedinUrl } : {}),
      profileStatus:
        args.profileStatus ?? (linkedinUrl ? "pending" : "none"),
      profile: args.profile ?? null,
      startedAt: null,
      pack: null,
      packFailed: false,
    });
  },
});

export const setProfile = mutationGeneric({
  args: {
    id: v.id("sessions"),
    status: profileStatusValidator,
    profile: v.union(v.any(), v.null()),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id);
    if (!row) return;
    await ctx.db.patch(args.id, {
      profileStatus: args.status,
      profile: args.profile,
    });
  },
});

export const finish = mutationGeneric({
  args: {
    id: v.id("sessions"),
    transcript: transcriptValidator,
    roadmap: v.union(v.any(), v.null()),
    actReached: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const clientAct =
      typeof args.actReached === "number" ? args.actReached : 0;
    const extracted = extractedAct(args.roadmap) ?? 0;
    const actReached = Math.max(clientAct, extracted) || null;
    await ctx.db.patch(args.id, {
      transcript: args.transcript,
      roadmap: args.roadmap,
      actReached,
    });
  },
});

export const selectPath = mutationGeneric({
  args: { id: v.id("sessions"), path: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { selectedPath: args.path });
  },
});

export const share = mutationGeneric({
  args: { id: v.id("sessions") },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id);
    if (!row) return;
    await ctx.db.patch(args.id, { shares: (row.shares ?? 0) + 1 });
  },
});

export const markSent = mutationGeneric({
  args: { id: v.id("sessions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { sent: true });
  },
});

export const setContact = mutationGeneric({
  args: {
    id: v.id("sessions"),
    contactName: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id);
    if (!row) return;
    const prev =
      row.roadmap && typeof row.roadmap === "object"
        ? (row.roadmap as Record<string, unknown>)
        : null;
    const prevContact =
      prev && prev.contact && typeof prev.contact === "object"
        ? (prev.contact as Record<string, unknown>)
        : {};
    const roadmap = prev
      ? {
          ...prev,
          message: args.message,
          contact: {
            ...prevContact,
            name: args.contactName,
          },
        }
      : prev;
    await ctx.db.patch(args.id, {
      contactName: args.contactName,
      roadmap,
    });
  },
});

export const get = queryGeneric({
  args: { id: v.id("sessions") },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id);
    if (!row) return null;
    return {
      ...row,
      sent: row.sent ?? false,
      contactName: row.contactName ?? null,
      payLinkUrl: row.payLinkUrl ?? null,
      payLinkId: row.payLinkId ?? null,
      paid: row.paid ?? false,
      linkedinUrl: row.linkedinUrl ?? null,
      profileStatus: row.profileStatus ?? "none",
      profile: row.profile ?? null,
      startedAt: row.startedAt ?? null,
      pack: row.pack ?? null,
      packFailed: row.packFailed === true,
    };
  },
});

function utcDayStart(ts: number) {
  const d = new Date(ts);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export const markStarted = mutationGeneric({
  args: { id: v.id("sessions") },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id);
    if (!row) return;
    if (typeof row.startedAt === "number") return;
    await ctx.db.patch(args.id, { startedAt: Date.now() });
  },
});

export const setPack = mutationGeneric({
  args: {
    id: v.id("sessions"),
    pack: v.union(v.any(), v.null()),
    failed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id);
    if (!row) return;
    await ctx.db.patch(args.id, {
      pack: args.pack,
      packFailed: args.failed === true,
    });
  },
});

export const caps = queryGeneric({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim();
    const variants = Array.from(new Set([email, email.toLowerCase()]));
    const seen = new Set<string>();
    let emailStarted = 0;
    for (const variant of variants) {
      const rows = await ctx.db
        .query("sessions")
        .withIndex("by_email", (q) => q.eq("email", variant))
        .collect();
      for (const r of rows) {
        const id = String(r._id);
        if (seen.has(id)) continue;
        seen.add(id);
        const used =
          typeof r.startedAt === "number" ||
          r.roadmap != null ||
          (Array.isArray(r.transcript) && r.transcript.length > 0);
        if (used) emailStarted += 1;
      }
    }

    const start = utcDayStart(Date.now());
    const end = start + 86_400_000;
    const todayRows = await ctx.db
      .query("sessions")
      .withIndex("by_startedAt", (q) =>
        q.gte("startedAt", start).lt("startedAt", end),
      )
      .collect();
    const todayStarted = todayRows.filter(
      (r) => typeof r.startedAt === "number",
    ).length;

    return { emailStarted, todayStarted };
  },
});

export const setPayLink = mutationGeneric({
  args: { id: v.id("sessions"), url: v.string(), linkId: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id);
    if (!row) return;
    await ctx.db.patch(args.id, {
      payLinkUrl: args.url,
      payLinkId: args.linkId,
    });
  },
});

export const markPaid = mutationGeneric({
  args: { id: v.id("sessions"), paymentId: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id);
    if (!row) return;
    if (row.paid === true) return;
    void args.paymentId;
    await ctx.db.patch(args.id, { paid: true });
  },
});

export const stats = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("sessions").collect();
    const written = rows.filter((r) => r.roadmap != null).length;
    return {
      started: rows.length,
      act1: rows.filter((r) => (r.actReached ?? 0) >= 1).length,
      act2: rows.filter((r) => (r.actReached ?? 0) >= 2).length,
      act3: rows.filter((r) => (r.actReached ?? 0) >= 3).length,
      written,
      roadmaps: written,
      sent: rows.filter((r) => r.sent === true).length,
      paid: rows.filter((r) => r.paid === true).length,
      selected: rows.filter((r) => r.selectedPath != null).length,
      shared: rows.filter((r) => (r.shares ?? 0) > 0).length,
    };
  },
});

export const listRecent = queryGeneric({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit, 1), 25);
    const rows = await ctx.db
      .query("sessions")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
    return rows.map((r) => ({
      _id: r._id,
      createdAt: r.createdAt,
      source: r.source,
      actReached: r.actReached,
      sent: r.sent ?? false,
      paid: r.paid ?? false,
      shares: r.shares ?? 0,
      email: r.email ?? null,
      profileStatus: r.profileStatus ?? "none",
      hasPack: r.pack != null,
      packFailed: r.packFailed === true,
    }));
  },
});

export const countUnique = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("sessions").collect();
    const emails = new Set<string>();
    for (const r of rows) {
      if (r.roadmap != null && r.email) {
        emails.add(r.email.toLowerCase());
      }
    }
    return emails.size;
  },
});
