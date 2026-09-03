import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
    createdAt: v.number(),
    source: v.string(),
    transcript: v.array(
      v.object({
        role: v.union(v.literal("assistant"), v.literal("user")),
        text: v.string(),
      }),
    ),
    roadmap: v.union(v.any(), v.null()),
    actReached: v.union(v.number(), v.null()),
    selectedPath: v.union(v.string(), v.null()),
    shares: v.number(),
  }),
});
