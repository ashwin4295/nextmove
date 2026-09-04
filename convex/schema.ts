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
    phone: v.optional(v.string()),
    payLinkUrl: v.optional(v.string()),
    payLinkId: v.optional(v.string()),
    paid: v.optional(v.boolean()),
    startedAt: v.optional(v.union(v.number(), v.null())),
    pack: v.optional(v.union(v.any(), v.null())),
    packFailed: v.optional(v.boolean()),
    linkedinUrl: v.optional(v.string()),
    profileStatus: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("ready"),
        v.literal("failed"),
        v.literal("none"),
      ),
    ),
    profile: v.optional(v.union(v.any(), v.null())),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_email", ["email"])
    .index("by_startedAt", ["startedAt"]),
});
