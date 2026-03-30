import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!currentUser) return [];
    if (currentUser.role === "BoardMember") return [];
    const gifts = await ctx.db
      .query("gifts")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .collect();
    if (currentUser.role === "DevelopmentOfficer") {
      const filtered: typeof gifts = [];
      for (const gift of gifts) {
        const donor = await ctx.db.get(gift.donorId);
        if (donor && donor.assignedOfficerId === currentUser._id) {
          filtered.push(gift);
        }
      }
      return filtered;
    }
    return gifts;
  },
});

export const listByDonor = query({
  args: { donorId: v.id("donors") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!currentUser) return [];
    if (currentUser.role === "BoardMember") return [];
    if (currentUser.role === "DevelopmentOfficer") {
      const donor = await ctx.db.get(args.donorId);
      if (!donor || donor.assignedOfficerId !== currentUser._id) return [];
    }
    return await ctx.db
      .query("gifts")
      .withIndex("by_donorId", (q) => q.eq("donorId", args.donorId))
      .collect();
  },
});

export const listByPledge = query({
  args: { pledgeId: v.id("pledges") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!currentUser) return [];
    if (currentUser.role === "BoardMember") return [];
    const pledge = await ctx.db.get(args.pledgeId);
    if (!pledge) return [];
    if (currentUser.role === "DevelopmentOfficer") {
      const donor = await ctx.db.get(pledge.donorId);
      if (!donor || donor.assignedOfficerId !== currentUser._id) return [];
    }
    return await ctx.db
      .query("gifts")
      .withIndex("by_pledgeId", (q) => q.eq("pledgeId", args.pledgeId))
      .collect();
  },
});

export const create = mutation({
  args: {
    pledgeId: v.optional(v.id("pledges")),
    campaignId: v.id("campaigns"),
    donorId: v.id("donors"),
    amount: v.number(),
    giftDate: v.string(),
    giftType: v.union(
      v.literal("Cash"),
      v.literal("Check"),
      v.literal("CreditCard"),
      v.literal("Stock"),
      v.literal("InKind"),
      v.literal("DAF"),
      v.literal("Wire"),
      v.literal("Other")
    ),
    checkNumber: v.optional(v.string()),
    inKindDescription: v.optional(v.string()),
    inKindFairMarketValue: v.optional(v.number()),
    designation: v.optional(v.string()),
    isAnonymous: v.boolean(),
    acknowledgmentStatus: v.union(
      v.literal("Pending"),
      v.literal("Sent"),
      v.literal("NotRequired")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!currentUser) throw new Error("User not found");
    if (currentUser.role === "BoardMember") throw new Error("Unauthorized");
    const giftId = await ctx.db.insert("gifts", {
      pledgeId: args.pledgeId,
      campaignId: args.campaignId,
      donorId: args.donorId,
      amount: args.amount,
      giftDate: args.giftDate,
      giftType: args.giftType,
      checkNumber: args.checkNumber,
      inKindDescription: args.inKindDescription,
      inKindFairMarketValue: args.inKindFairMarketValue,
      designation: args.designation,
      isAnonymous: args.isAnonymous,
      acknowledgmentStatus: args.acknowledgmentStatus,
      acknowledgmentDate: undefined,
      receivedById: currentUser._id,
      notes: args.notes,
      createdAt: Date.now(),
    });
    const campaign = await ctx.db.get(args.campaignId);
    if (campaign) {
      const newThermometerAmount = (campaign.thermometerAmount ?? 0) + args.amount;
      await ctx.db.patch(args.campaignId, {
        thermometerAmount: newThermometerAmount,
      });
      const pendingMilestones = await ctx.db
        .query("milestones")
        .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
        .collect();
      for (const milestone of pendingMilestones) {
        if (
          milestone.milestoneType === "Financial" &&
          milestone.status === "Pending" &&
          milestone.targetAmount !== undefined &&
          milestone.targetAmount !== null &&
          newThermometerAmount >= milestone.targetAmount
        ) {
          await ctx.db.patch(milestone._id, {
            status: "Achieved",
            achievedDate: args.giftDate,
          });
        }
      }
    }
    if (args.pledgeId) {
      const pledge = await ctx.db.get(args.pledgeId);
      if (pledge) {
        const newAmountPaid = (pledge.amountPaid ?? 0) + args.amount;
        const newAmountRemaining = pledge.totalAmount - newAmountPaid;
        const newStatus =
          newAmountPaid >= pledge.totalAmount ? "Fulfilled" : pledge.status;
        await ctx.db.patch(args.pledgeId, {
          amountPaid: newAmountPaid,
          amountRemaining: Math.max(0, newAmountRemaining),
          status: newStatus,
        });
      }
    }
    return giftId;
  },
});

export const updateAcknowledgment = mutation({
  args: {
    giftId: v.id("gifts"),
    acknowledgmentStatus: v.union(
      v.literal("Pending"),
      v.literal("Sent"),
      v.literal("NotRequired")
    ),
    acknowledgmentDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!currentUser) throw new Error("User not found");
    if (currentUser.role === "BoardMember") throw new Error("Unauthorized");
    await ctx.db.patch(args.giftId, {
      acknowledgmentStatus: args.acknowledgmentStatus,
      acknowledgmentDate: args.acknowledgmentDate,
    });
  },
});
