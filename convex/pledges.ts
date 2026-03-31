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
    if (currentUser.role === "BoardMember") return [];
    const pledges = await ctx.db
      .query("pledges")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .take(100);
    if (currentUser.role === "DevelopmentOfficer") {
      const filtered: typeof pledges = [];
      for (const pledge of pledges) {
        const donor = await ctx.db.get(pledge.donorId);
        if (donor && donor.assignedOfficerId === currentUser._id) {
          filtered.push(pledge);
        }
      }
      const result = [];
      for (const pledge of filtered) {
        const donor = await ctx.db.get(pledge.donorId);
        const donorName = donor ? `${donor.firstName} ${donor.lastName}` : "Unknown";
        result.push({ ...pledge, donorName });
      }
      return result;
    }
    const result = [];
    for (const pledge of pledges) {
      const donor = await ctx.db.get(pledge.donorId);
      const donorName = donor ? `${donor.firstName} ${donor.lastName}` : "Unknown";
      result.push({ ...pledge, donorName });
    }
    return result;
  },
});

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
      .query("pledges")
      .withIndex("by_donorId", (q) => q.eq("donorId", args.donorId))
      .take(100);
  },
});

export const get = query({
  args: { pledgeId: v.id("pledges") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();
    if (!currentUser) return null;
    if (currentUser.role === "BoardMember") return null;
    const pledge = await ctx.db.get(args.pledgeId);
    if (!pledge) return null;
    if (currentUser.role === "DevelopmentOfficer") {
      const donor = await ctx.db.get(pledge.donorId);
      if (!donor || donor.assignedOfficerId !== currentUser._id) return null;
    }
    return pledge;
  },
});

export const create = mutation({
  args: {
    campaignId: v.id("campaigns"),
    donorId: v.id("donors"),
    totalAmount: v.number(),
    pledgeDate: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    frequency: v.union(
      v.literal("OneTime"),
      v.literal("Monthly"),
      v.literal("Quarterly"),
      v.literal("Annual")
    ),
    numberOfPayments: v.number(),
    designation: v.optional(v.string()),
    isAnonymous: v.boolean(),
    notes: v.optional(v.string()),
    pledgedToId: v.optional(v.id("users")),
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
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status === "Completed") {
      throw new Error("Cannot create pledges for a completed campaign");
    }
    const pledgeId = await ctx.db.insert("pledges", {
      campaignId: args.campaignId,
      donorId: args.donorId,
      totalAmount: args.totalAmount,
      pledgeDate: args.pledgeDate,
      startDate: args.startDate,
      endDate: args.endDate,
      frequency: args.frequency,
      numberOfPayments: args.numberOfPayments,
      amountPaid: 0,
      amountRemaining: args.totalAmount,
      status: "Active",
      designation: args.designation,
      isAnonymous: args.isAnonymous,
      notes: args.notes,
      pledgedToId: args.pledgedToId,
      createdAt: Date.now(),
    });
    return pledgeId;
  },
});

export const update = mutation({
  args: {
    pledgeId: v.id("pledges"),
    designation: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    pledgedToId: v.optional(v.id("users")),
    status: v.optional(
      v.union(
        v.literal("Active"),
        v.literal("Fulfilled"),
        v.literal("Delinquent"),
        v.literal("Cancelled"),
        v.literal("WrittenOff")
      )
    ),
    endDate: v.optional(v.string()),
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
    const pledge = await ctx.db.get(args.pledgeId);
    if (!pledge) throw new Error("Pledge not found");
    if (currentUser.role === "DevelopmentOfficer") {
      const donor = await ctx.db.get(pledge.donorId);
      if (!donor || donor.assignedOfficerId !== currentUser._id) {
        throw new Error("Unauthorized: not assigned to this donor");
      }
    }
    const { pledgeId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    if (fields.designation !== undefined) updates.designation = fields.designation;
    if (fields.isAnonymous !== undefined) updates.isAnonymous = fields.isAnonymous;
    if (fields.notes !== undefined) updates.notes = fields.notes;
    if (fields.pledgedToId !== undefined) updates.pledgedToId = fields.pledgedToId;
    if (fields.status !== undefined) updates.status = fields.status;
    if (fields.endDate !== undefined) updates.endDate = fields.endDate;
    await ctx.db.patch(pledgeId, updates);
  },
});
