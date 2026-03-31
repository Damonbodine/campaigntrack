import { query } from "./_generated/server";
import { v } from "convex/values";

export const getStats = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();
    if (!currentUser) return null;
    if (currentUser.role === "BoardMember") return null;
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) return null;
    const allGifts = await ctx.db
      .query("gifts")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .take(100);
    const allPledges = await ctx.db
      .query("pledges")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .take(100);
    const allMilestones = await ctx.db
      .query("milestones")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .take(100);
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const giftsThisWeek = allGifts.filter((g) => {
      const giftTime = new Date(g.giftDate).getTime();
      return giftTime >= oneWeekAgo;
    });
    const giftsThisMonth = allGifts.filter((g) => {
      const giftTime = new Date(g.giftDate).getTime();
      return giftTime >= oneMonthAgo;
    });
    const activePledges = allPledges.filter((p) => p.status === "Active");
    const totalPledged = allPledges.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalPaid = allPledges.reduce((sum, p) => sum + (p.amountPaid ?? 0), 0);
    const pledgeFulfillmentRate =
      totalPledged > 0 ? (totalPaid / totalPledged) * 100 : 0;
    const achievedMilestones = allMilestones.filter(
      (m) => m.status === "Achieved"
    );
    const pendingMilestones = allMilestones.filter(
      (m) => m.status === "Pending"
    );
    const thermometerAmount = campaign.thermometerAmount ?? 0;
    const progressPercent =
      campaign.goalAmount > 0
        ? (thermometerAmount / campaign.goalAmount) * 100
        : 0;
    return {
      campaign,
      thermometerAmount,
      goalAmount: campaign.goalAmount,
      progressPercent,
      giftsThisWeekCount: giftsThisWeek.length,
      giftsThisWeekTotal: giftsThisWeek.reduce((sum, g) => sum + g.amount, 0),
      giftsThisMonthCount: giftsThisMonth.length,
      giftsThisMonthTotal: giftsThisMonth.reduce((sum, g) => sum + g.amount, 0),
      activePledgesCount: activePledges.length,
      totalPledged,
      pledgeFulfillmentRate,
      milestonesAchieved: achievedMilestones.length,
      milestonesPending: pendingMilestones.length,
    };
  },
});

export const getBoardView = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();
    if (!currentUser) return null;
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) return null;
    const allGifts = await ctx.db
      .query("gifts")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .take(100);
    const allPledges = await ctx.db
      .query("pledges")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .take(100);
    const allMilestones = await ctx.db
      .query("milestones")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .take(100);
    const allPhases = await ctx.db
      .query("campaignPhases")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .take(100);
    const allDonors = await ctx.db.query("donors").take(100);
    const thermometerAmount = campaign.thermometerAmount ?? 0;
    const progressPercent =
      campaign.goalAmount > 0
        ? (thermometerAmount / campaign.goalAmount) * 100
        : 0;
    const donorTierCounts: Record<string, number> = {};
    const donorTierTotals: Record<string, number> = {};
    for (const donor of allDonors) {
      const tier = donor.donorTier ?? "Prospect";
      donorTierCounts[tier] = (donorTierCounts[tier] ?? 0) + 1;
    }
    const totalPledged = allPledges.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalGifts = allGifts.reduce((sum, g) => sum + g.amount, 0);
    const milestonesAchieved = allMilestones.filter(
      (m) => m.status === "Achieved"
    );
    const milestonesPending = allMilestones.filter(
      (m) => m.status === "Pending"
    );
    const phaseBreakdown = allPhases
      .sort((a, b) => a.sequence - b.sequence)
      .map((phase) => {
        const phaseStart = new Date(phase.startDate).getTime();
        const phaseEnd = new Date(phase.endDate).getTime();
        const raisedAmount = allGifts
          .filter((g) => {
            const giftTime = new Date(g.giftDate).getTime();
            return giftTime >= phaseStart && giftTime <= phaseEnd;
          })
          .reduce((sum, g) => sum + g.amount, 0);
        return {
          name: phase.name,
          goalAmount: phase.goalAmount,
          raisedAmount,
          status: phase.status,
          sequence: phase.sequence,
        };
      });
    return {
      campaignName: campaign.name,
      goalAmount: campaign.goalAmount,
      thermometerAmount,
      progressPercent,
      currentPhase: campaign.currentPhase,
      status: campaign.status,
      totalPledged,
      totalGifts,
      donorTierCounts,
      donorTierTotals,
      milestonesAchieved: milestonesAchieved.map((m) => ({
        name: m.name,
        achievedDate: m.achievedDate,
        milestoneType: m.milestoneType,
      })),
      milestonesPending: milestonesPending.map((m) => ({
        name: m.name,
        targetDate: m.targetDate,
        milestoneType: m.milestoneType,
        targetAmount: m.targetAmount,
      })),
      phaseBreakdown,
    };
  },
});

export const getRecentGifts = query({
  args: { campaignId: v.id("campaigns"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();
    if (!currentUser) return [];
    const limit = args.limit ?? 5;
    const gifts = await ctx.db
      .query("gifts")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .order("desc")
      .take(limit);
    const result: Array<{
      giftId: string;
      amount: number | null;
      giftDate: string;
      giftType: string;
      donorName: string;
      isAnonymous: boolean;
      acknowledgmentStatus: string;
    }> = [];
    for (const gift of gifts) {
      let donorName = "Anonymous";
      if (!gift.isAnonymous) {
        const donor = await ctx.db.get(gift.donorId);
        if (donor) {
          donorName = `${donor.firstName} ${donor.lastName}`;
          if (donor.organizationName) donorName = donor.organizationName;
        }
      }
      const isBoard = currentUser.role === "BoardMember";
      result.push({
        giftId: gift._id,
        amount: isBoard ? null : gift.amount,
        giftDate: gift.giftDate,
        giftType: gift.giftType,
        donorName: gift.isAnonymous ? "Anonymous" : donorName,
        isAnonymous: gift.isAnonymous,
        acknowledgmentStatus: gift.acknowledgmentStatus,
      });
    }
    return result;
  },
});
