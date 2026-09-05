import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

export const joinWaitlist = mutationGeneric({
  args: { email: v.string(), source: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (!existing) {
      await ctx.db.insert("waitlist", {
        email,
        source: args.source,
        createdAt: Date.now(),
      });
    }
    return { ok: true as const };
  },
});

export const count = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("waitlist").withIndex("by_email").collect();
    return rows.length;
  },
});
