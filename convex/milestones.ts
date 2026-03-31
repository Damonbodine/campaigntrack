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
    return await ctx.db
      .query("milestones")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .take(100);
  },
});

export const create = mutation({
  args: {
    campaignId: v.id("campaigns"),
    name: v.string(),
    description: v.optional(v.string()),
    targetDate: v.optional(v.string()),
    milestoneType: v.union(
      v.literal("Financial"),
      v.literal("Participation"),
      v.literal("Event"),
      v.literal("Construction"),
      v.literal("Other")
    ),
    targetAmount: v.optional(v.number()),
    status: v.union(
      v.literal("Pending"),
      v.literal("Achieved"),
      v.literal("Missed")
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
    const milestoneId = await ctx.db.insert("milestones", {
      campaignId: args.campaignId,
      name: args.name,
      description: args.description,
      targetDate: args.targetDate,
      milestoneType: args.milestoneType,
      targetAmount: args.targetAmount,
      status: args.status,
      achievedDate: undefined,
      createdAt: Date.now(),
    });
    return milestoneId;
  },
});

export const update = mutation({
  args: {
    milestoneId: v.id("milestones"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    targetDate: v.optional(v.string()),
    achievedDate: v.optional(v.string()),
    milestoneType: v.optional(
      v.union(
        v.literal("Financial"),
        v.literal("Participation"),
        v.literal("Event"),
        v.literal("Construction"),
        v.literal("Other")
      )
    ),
    targetAmount: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("Pending"),
        v.literal("Achieved"),
        v.literal("Missed")
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
    const { milestoneId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    if (fields.name !== undefined) updates.name = fields.name;
    if (fields.description !== undefined) updates.description = fields.description;
    if (fields.targetDate !== undefined) updates.targetDate = fields.targetDate;
    if (fields.achievedDate !== undefined) updates.achievedDate = fields.achievedDate;
    if (fields.milestoneType !== undefined) updates.milestoneType = fields.milestoneType;
    if (fields.targetAmount !== undefined) updates.targetAmount = fields.targetAmount;
    if (fields.status !== undefined) updates.status = fields.status;
    await ctx.db.patch(milestoneId, updates);
  },
});
