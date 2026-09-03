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

export const create = mutationGeneric({
  args: {
    source: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
    };
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
      shares: r.shares ?? 0,
      email: r.email ?? null,
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
