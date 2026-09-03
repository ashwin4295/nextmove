import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const transcriptValidator = v.array(
  v.object({
    role: v.union(v.literal("assistant"), v.literal("user")),
    text: v.string(),
  }),
);

export const create = mutationGeneric({
  args: { source: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sessions", {
      createdAt: Date.now(),
      source: args.source,
      transcript: [],
      roadmap: null,
      actReached: null,
      selectedPath: null,
      shares: 0,
    });
  },
});

export const finish = mutationGeneric({
  args: {
    id: v.id("sessions"),
    transcript: transcriptValidator,
    roadmap: v.union(v.any(), v.null()),
  },
  handler: async (ctx, args) => {
    const actReached =
      args.roadmap && typeof args.roadmap.actReached === "number"
        ? args.roadmap.actReached
        : null;
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

export const get = queryGeneric({
  args: { id: v.id("sessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const stats = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("sessions").collect();
    return {
      started: rows.length,
      act1: rows.filter((r) => (r.actReached ?? 0) >= 1).length,
      act2: rows.filter((r) => (r.actReached ?? 0) >= 2).length,
      act3: rows.filter((r) => (r.actReached ?? 0) >= 3).length,
      roadmaps: rows.filter((r) => r.roadmap != null).length,
      selected: rows.filter((r) => r.selectedPath != null).length,
      shared: rows.filter((r) => (r.shares ?? 0) > 0).length,
    };
  },
});
