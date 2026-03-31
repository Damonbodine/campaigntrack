import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();
    if (!currentUser) return [];
    const phases = await ctx.db
      .query("campaignPhases")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .take(100);
    const gifts = await ctx.db
      .query("gifts")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .take(100);
    return phases.map((phase) => {
      const phaseStart = new Date(phase.startDate).getTime();
      const phaseEnd = new Date(phase.endDate).getTime();
      const raisedAmount = gifts
        .filter((g) => {
          const giftTime = new Date(g.giftDate).getTime();
          return giftTime >= phaseStart && giftTime <= phaseEnd;
        })
        .reduce((sum, g) => sum + g.amount, 0);
      return { ...phase, raisedAmount };
    });
  },
});

export const create = mutation({
  args: {
    campaignId: v.id("campaigns"),
    name: v.string(),
    description: v.optional(v.string()),
    goalAmount: v.number(),
    startDate: v.string(),
    endDate: v.string(),
    sequence: v.number(),
    status: v.union(
      v.literal("Upcoming"),
      v.literal("Active"),
      v.literal("Completed")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();
    if (!currentUser) throw new Error("User not found");
    if (currentUser.role !== "CampaignDirector") throw new Error("Unauthorized");
    const phaseId = await ctx.db.insert("campaignPhases", {
      campaignId: args.campaignId,
      name: args.name,
      description: args.description,
      goalAmount: args.goalAmount,
      startDate: args.startDate,
      endDate: args.endDate,
      sequence: args.sequence,
      status: args.status,
      createdAt: Date.now(),
    });
    return phaseId;
  },
});

export const update = mutation({
  args: {
    phaseId: v.id("campaignPhases"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    goalAmount: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    sequence: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("Upcoming"),
        v.literal("Active"),
        v.literal("Completed")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();
    if (!currentUser) throw new Error("User not found");
    if (currentUser.role !== "CampaignDirector") throw new Error("Unauthorized");
    const { phaseId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    if (fields.name !== undefined) updates.name = fields.name;
    if (fields.description !== undefined) updates.description = fields.description;
    if (fields.goalAmount !== undefined) updates.goalAmount = fields.goalAmount;
    if (fields.startDate !== undefined) updates.startDate = fields.startDate;
    if (fields.endDate !== undefined) updates.endDate = fields.endDate;
    if (fields.sequence !== undefined) updates.sequence = fields.sequence;
    if (fields.status !== undefined) updates.status = fields.status;
    await ctx.db.patch(phaseId, updates);
  },
});
