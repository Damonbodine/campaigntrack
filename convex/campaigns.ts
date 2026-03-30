import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!currentUser) return [];
    return await ctx.db.query("campaigns").collect();
  },
});

export const get = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!currentUser) return null;
    return await ctx.db.get(args.campaignId);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    goalAmount: v.number(),
    startDate: v.string(),
    endDate: v.string(),
    currentPhase: v.union(
      v.literal("QuietPhase"),
      v.literal("PublicPhase"),
      v.literal("CloseOut"),
      v.literal("Completed")
    ),
    status: v.union(
      v.literal("Planning"),
      v.literal("Active"),
      v.literal("Paused"),
      v.literal("Completed"),
      v.literal("Cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!currentUser) throw new Error("User not found");
    if (currentUser.role !== "CampaignDirector") throw new Error("Unauthorized: only Campaign Directors can create campaigns");
    const campaignId = await ctx.db.insert("campaigns", {
      name: args.name,
      description: args.description,
      goalAmount: args.goalAmount,
      startDate: args.startDate,
      endDate: args.endDate,
      currentPhase: args.currentPhase,
      status: args.status,
      thermometerAmount: 0,
      createdById: currentUser._id,
      createdAt: Date.now(),
    });
    return campaignId;
  },
});

export const update = mutation({
  args: {
    campaignId: v.id("campaigns"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    goalAmount: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    currentPhase: v.optional(
      v.union(
        v.literal("QuietPhase"),
        v.literal("PublicPhase"),
        v.literal("CloseOut"),
        v.literal("Completed")
      )
    ),
    status: v.optional(
      v.union(
        v.literal("Planning"),
        v.literal("Active"),
        v.literal("Paused"),
        v.literal("Completed"),
        v.literal("Cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!currentUser) throw new Error("User not found");
    if (currentUser.role !== "CampaignDirector") throw new Error("Unauthorized: only Campaign Directors can update campaigns");
    const { campaignId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    if (fields.name !== undefined) updates.name = fields.name;
    if (fields.description !== undefined) updates.description = fields.description;
    if (fields.goalAmount !== undefined) updates.goalAmount = fields.goalAmount;
    if (fields.startDate !== undefined) updates.startDate = fields.startDate;
    if (fields.endDate !== undefined) updates.endDate = fields.endDate;
    if (fields.currentPhase !== undefined) updates.currentPhase = fields.currentPhase;
    if (fields.status !== undefined) updates.status = fields.status;
    await ctx.db.patch(campaignId, updates);
  },
});
