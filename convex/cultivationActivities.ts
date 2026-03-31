import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByDonor = query({
  args: { donorId: v.id("donors") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();
    if (!currentUser) return [];
    if (currentUser.role === "BoardMember") return [];
    if (currentUser.role === "DevelopmentOfficer") {
      const donor = await ctx.db.get(args.donorId);
      if (!donor || donor.assignedOfficerId !== currentUser._id) return [];
    }
    return await ctx.db
      .query("cultivationActivities")
      .withIndex("by_donorId", (q) => q.eq("donorId", args.donorId))
      .take(100);
  },
});

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
    if (currentUser.role === "BoardMember") return [];
    const activities = await ctx.db
      .query("cultivationActivities")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .take(100);
    if (currentUser.role === "DevelopmentOfficer") {
      const filtered: typeof activities = [];
      for (const activity of activities) {
        const donor = await ctx.db.get(activity.donorId);
        if (donor && donor.assignedOfficerId === currentUser._id) {
          filtered.push(activity);
        }
      }
      return filtered;
    }
    return activities;
  },
});

export const create = mutation({
  args: {
    donorId: v.id("donors"),
    campaignId: v.id("campaigns"),
    activityDate: v.string(),
    activityType: v.union(
      v.literal("PhoneCall"),
      v.literal("Meeting"),
      v.literal("Tour"),
      v.literal("Email"),
      v.literal("Event"),
      v.literal("Proposal"),
      v.literal("ThankYou"),
      v.literal("Letter"),
      v.literal("Other")
    ),
    description: v.string(),
    outcome: v.optional(
      v.union(
        v.literal("Positive"),
        v.literal("Neutral"),
        v.literal("Negative"),
        v.literal("NeedsFollowUp")
      )
    ),
    nextStepDate: v.optional(v.string()),
    nextStepDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();
    if (!currentUser) throw new Error("User not found");
    if (currentUser.role === "BoardMember") throw new Error("Unauthorized");
    if (currentUser.role === "DataEntry") throw new Error("Unauthorized");
    if (currentUser.role === "DevelopmentOfficer") {
      const donor = await ctx.db.get(args.donorId);
      if (!donor || donor.assignedOfficerId !== currentUser._id) {
        throw new Error("Unauthorized: not assigned to this donor");
      }
    }
    const activityId = await ctx.db.insert("cultivationActivities", {
      donorId: args.donorId,
      campaignId: args.campaignId,
      activityDate: args.activityDate,
      activityType: args.activityType,
      description: args.description,
      outcome: args.outcome,
      nextStepDate: args.nextStepDate,
      nextStepDescription: args.nextStepDescription,
      loggedById: currentUser._id,
      createdAt: Date.now(),
    });
    return activityId;
  },
});

export const update = mutation({
  args: {
    activityId: v.id("cultivationActivities"),
    activityDate: v.optional(v.string()),
    activityType: v.optional(
      v.union(
        v.literal("PhoneCall"),
        v.literal("Meeting"),
        v.literal("Tour"),
        v.literal("Email"),
        v.literal("Event"),
        v.literal("Proposal"),
        v.literal("ThankYou"),
        v.literal("Letter"),
        v.literal("Other")
      )
    ),
    description: v.optional(v.string()),
    outcome: v.optional(
      v.union(
        v.literal("Positive"),
        v.literal("Neutral"),
        v.literal("Negative"),
        v.literal("NeedsFollowUp")
      )
    ),
    nextStepDate: v.optional(v.string()),
    nextStepDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();
    if (!currentUser) throw new Error("User not found");
    if (currentUser.role === "BoardMember") throw new Error("Unauthorized");
    if (currentUser.role === "DataEntry") throw new Error("Unauthorized");
    const activity = await ctx.db.get(args.activityId);
    if (!activity) throw new Error("Activity not found");
    if (currentUser.role === "DevelopmentOfficer") {
      const donor = await ctx.db.get(activity.donorId);
      if (!donor || donor.assignedOfficerId !== currentUser._id) {
        throw new Error("Unauthorized: not assigned to this donor");
      }
    }
    const { activityId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    if (fields.activityDate !== undefined) updates.activityDate = fields.activityDate;
    if (fields.activityType !== undefined) updates.activityType = fields.activityType;
    if (fields.description !== undefined) updates.description = fields.description;
    if (fields.outcome !== undefined) updates.outcome = fields.outcome;
    if (fields.nextStepDate !== undefined) updates.nextStepDate = fields.nextStepDate;
    if (fields.nextStepDescription !== undefined) updates.nextStepDescription = fields.nextStepDescription;
    await ctx.db.patch(activityId, updates);
  },
});
