import { mutation } from "./_generated/server";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("users").take(1);
    if (existing.length > 0) return "Already seeded";

    // Users
    const director = await ctx.db.insert("users", {
      clerkId: "user_director_001", name: "Sarah Mitchell", email: "sarah@nonprofit.org",
      role: "CampaignDirector", status: "Active", createdAt: Date.now(),
    });
    const officer1 = await ctx.db.insert("users", {
      clerkId: "user_officer_001", name: "James Chen", email: "james@nonprofit.org",
      role: "DevelopmentOfficer", status: "Active", createdAt: Date.now(),
    });
    const officer2 = await ctx.db.insert("users", {
      clerkId: "user_officer_002", name: "Maria Rodriguez", email: "maria@nonprofit.org",
      role: "DevelopmentOfficer", status: "Active", createdAt: Date.now(),
    });
    const board = await ctx.db.insert("users", {
      clerkId: "user_board_001", name: "Robert Thompson", email: "robert@board.org",
      role: "BoardMember", status: "Active", createdAt: Date.now(),
    });
    const dataEntry = await ctx.db.insert("users", {
      clerkId: "user_entry_001", name: "Lisa Park", email: "lisa@nonprofit.org",
      role: "DataEntry", status: "Active", createdAt: Date.now(),
    });

    // Campaign
    const campaign = await ctx.db.insert("campaigns", {
      name: "Building Tomorrow Campaign",
      description: "A $5M capital campaign for a new community center, endowment, and program expansion.",
      goalAmount: 5000000, startDate: "2024-01-15", endDate: "2025-12-31",
      currentPhase: "PublicPhase", status: "Active", thermometerAmount: 2400000,
      createdById: director, createdAt: Date.now(),
    });

    // Phases
    await ctx.db.insert("campaignPhases", {
      campaignId: campaign, name: "Quiet Phase", description: "Board giving and leadership gifts",
      goalAmount: 1500000, startDate: "2024-01-15", endDate: "2024-06-30",
      sequence: 1, status: "Completed", createdAt: Date.now(),
    });
    await ctx.db.insert("campaignPhases", {
      campaignId: campaign, name: "Board Giving", description: "100% board participation",
      goalAmount: 750000, startDate: "2024-07-01", endDate: "2024-09-30",
      sequence: 2, status: "Active", createdAt: Date.now(),
    });
    await ctx.db.insert("campaignPhases", {
      campaignId: campaign, name: "Major Gifts", description: "Major gift prospects",
      goalAmount: 1750000, startDate: "2024-10-01", endDate: "2025-06-30",
      sequence: 3, status: "Upcoming", createdAt: Date.now(),
    });
    await ctx.db.insert("campaignPhases", {
      campaignId: campaign, name: "Community Phase", description: "Broad community outreach",
      goalAmount: 1000000, startDate: "2025-07-01", endDate: "2025-12-31",
      sequence: 4, status: "Upcoming", createdAt: Date.now(),
    });

    // Milestones
    await ctx.db.insert("milestones", {
      campaignId: campaign, name: "25% Goal Reached", milestoneType: "Financial",
      targetAmount: 1250000, status: "Achieved", achievedDate: "2024-04-15", createdAt: Date.now(),
    });
    await ctx.db.insert("milestones", {
      campaignId: campaign, name: "Board 100% Participation", milestoneType: "Participation",
      targetDate: "2024-09-30", status: "Pending", createdAt: Date.now(),
    });
    await ctx.db.insert("milestones", {
      campaignId: campaign, name: "50% Goal Reached", milestoneType: "Financial",
      targetAmount: 2500000, status: "Pending", createdAt: Date.now(),
    });
    await ctx.db.insert("milestones", {
      campaignId: campaign, name: "Groundbreaking Ceremony", milestoneType: "Construction",
      targetDate: "2025-03-01", status: "Pending", createdAt: Date.now(),
    });

    // Donors
    const donor1 = await ctx.db.insert("donors", {
      firstName: "Eleanor", lastName: "Whitfield", email: "eleanor@whitfield.com",
      phone: "512-555-0101", street: "100 Capital Ave", city: "Austin", state: "TX", zip: "78701",
      donorType: "Individual", cultivationStage: "Stewarding", donorTier: "Leadership",
      assignedOfficerId: officer1, capacity: "Over1M",
      relationshipNotes: "Major philanthropist, longtime supporter.", status: "Active", createdAt: Date.now(),
    });
    const donor2 = await ctx.db.insert("donors", {
      firstName: "David", lastName: "Nakamura", email: "david@nakamura-foundation.org",
      phone: "512-555-0102", organizationName: "Nakamura Family Foundation",
      donorType: "Foundation", cultivationStage: "Pledged", donorTier: "Major",
      assignedOfficerId: officer1, capacity: "From500Kto1M",
      relationshipNotes: "Foundation focuses on education.", status: "Active", createdAt: Date.now(),
    });
    const donor3 = await ctx.db.insert("donors", {
      firstName: "Patricia", lastName: "Okonkwo", email: "patricia@okonkwo.com",
      phone: "512-555-0103", donorType: "Individual", cultivationStage: "Cultivated",
      donorTier: "Major", assignedOfficerId: officer2, capacity: "From100Kto500K",
      relationshipNotes: "Interested in endowment.", status: "Active", createdAt: Date.now(),
    });
    const donor4 = await ctx.db.insert("donors", {
      firstName: "TechForward", lastName: "Inc.", email: "giving@techforward.com",
      organizationName: "TechForward Inc.", donorType: "Corporation",
      cultivationStage: "Solicited", donorTier: "Mid", assignedOfficerId: officer2,
      capacity: "From50Kto100K", status: "Active", createdAt: Date.now(),
    });
    const donor5 = await ctx.db.insert("donors", {
      firstName: "Anonymous", lastName: "Donor", donorType: "Anonymous",
      cultivationStage: "Pledged", donorTier: "Major", capacity: "From100Kto500K",
      status: "Active", createdAt: Date.now(),
    });

    // Pledges
    const pledge1 = await ctx.db.insert("pledges", {
      campaignId: campaign, donorId: donor1, totalAmount: 500000,
      pledgeDate: "2024-02-01", startDate: "2024-03-01", endDate: "2025-03-01",
      frequency: "Quarterly", numberOfPayments: 8, amountPaid: 375000, amountRemaining: 125000,
      status: "Active", designation: "Building Fund", isAnonymous: false,
      pledgedToId: officer1, createdAt: Date.now(),
    });
    const pledge2 = await ctx.db.insert("pledges", {
      campaignId: campaign, donorId: donor2, totalAmount: 250000,
      pledgeDate: "2024-03-15", startDate: "2024-04-01", endDate: "2025-04-01",
      frequency: "Annual", numberOfPayments: 2, amountPaid: 125000, amountRemaining: 125000,
      status: "Active", designation: "Endowment", isAnonymous: false,
      pledgedToId: officer1, createdAt: Date.now(),
    });

    // Gifts
    await ctx.db.insert("gifts", {
      pledgeId: pledge1, campaignId: campaign, donorId: donor1, amount: 125000,
      giftDate: "2024-03-01", giftType: "Wire", designation: "Building Fund",
      isAnonymous: false, acknowledgmentStatus: "Sent", acknowledgmentDate: "2024-03-05",
      receivedById: dataEntry, createdAt: Date.now(),
    });
    await ctx.db.insert("gifts", {
      pledgeId: pledge1, campaignId: campaign, donorId: donor1, amount: 125000,
      giftDate: "2024-06-01", giftType: "Wire", designation: "Building Fund",
      isAnonymous: false, acknowledgmentStatus: "Sent", acknowledgmentDate: "2024-06-05",
      receivedById: dataEntry, createdAt: Date.now(),
    });
    await ctx.db.insert("gifts", {
      campaignId: campaign, donorId: donor3, amount: 50000,
      giftDate: "2024-07-15", giftType: "Check", checkNumber: "4521",
      designation: "General", isAnonymous: false, acknowledgmentStatus: "Sent",
      receivedById: dataEntry, createdAt: Date.now(),
    });
    await ctx.db.insert("gifts", {
      campaignId: campaign, donorId: donor4, amount: 25000,
      giftDate: "2024-08-20", giftType: "CreditCard", designation: "Program Expansion",
      isAnonymous: false, acknowledgmentStatus: "Pending",
      receivedById: dataEntry, createdAt: Date.now(),
    });

    // Cultivation Activities
    await ctx.db.insert("cultivationActivities", {
      donorId: donor1, campaignId: campaign, activityDate: "2024-01-20",
      activityType: "Meeting", description: "Initial meeting to discuss campaign vision and leadership gift.",
      outcome: "Positive", nextStepDate: "2024-02-15",
      nextStepDescription: "Follow up with formal proposal",
      loggedById: officer1, createdAt: Date.now(),
    });
    await ctx.db.insert("cultivationActivities", {
      donorId: donor3, campaignId: campaign, activityDate: "2024-03-10",
      activityType: "Tour", description: "Facility tour showing current limitations and plans.",
      outcome: "Positive", nextStepDate: "2024-04-01",
      nextStepDescription: "Send endowment proposal",
      loggedById: officer2, createdAt: Date.now(),
    });

    return "Database seeded successfully";
  },
});
