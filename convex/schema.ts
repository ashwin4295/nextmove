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
    // Field name stays `roadmap` (no migration). Value is now a NextMove object.
    roadmap: v.union(v.any(), v.null()),
    actReached: v.union(v.number(), v.null()),
    selectedPath: v.union(v.string(), v.null()),
    shares: v.number(),
    sent: v.optional(v.boolean()),
    contactName: v.optional(v.union(v.string(), v.null())),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    payLinkUrl: v.optional(v.string()),
    payLinkId: v.optional(v.string()),
    paid: v.optional(v.boolean()),
  }).index("by_createdAt", ["createdAt"]),
});
