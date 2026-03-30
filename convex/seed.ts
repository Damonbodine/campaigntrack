import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Idempotency check — if any users exist, skip seeding
    const existingUsers = await ctx.db.query("users").take(1);
    if (existingUsers.length > 0) {
      return { message: "Database already seeded", skipped: true };
    }

    const now = Date.now();

    // ── Users ────────────────────────────────────────────────────────────────
    const directorId = await ctx.db.insert("users", {
      clerkId: "seed_director_001",
      firstName: "Sarah",
      lastName: "Mitchell",
      email: "sarah.mitchell@campaigntrack.dev",
      role: "CampaignDirector",
      status: "Active",
      createdAt: now,
    });

    const officer1Id = await ctx.db.insert("users", {
      clerkId: "seed_officer_001",
      firstName: "James",
      lastName: "Chen",
      email: "james.chen@campaigntrack.dev",
      role: "DevelopmentOfficer",
      status: "Active",
      createdAt: now,
    });

    const officer2Id = await ctx.db.insert("users", {
      clerkId: "seed_officer_002",
      firstName: "Maria",
      lastName: "Rodriguez",
      email: "maria.rodriguez@campaigntrack.dev",
      role: "DevelopmentOfficer",
      status: "Active",
      createdAt: now,
    });

    const boardMemberId = await ctx.db.insert("users", {
      clerkId: "seed_board_001",
      firstName: "Robert",
      lastName: "Thompson",
      email: "robert.thompson@campaigntrack.dev",
      role: "BoardMember",
      status: "Active",
      createdAt: now,
    });

    const dataEntryId = await ctx.db.insert("users", {
      clerkId: "seed_dataentry_001",
      firstName: "Lisa",
      lastName: "Park",
      email: "lisa.park@campaigntrack.dev",
      role: "DataEntry",
      status: "Active",
      createdAt: now,
    });

    // ── Campaign ─────────────────────────────────────────────────────────────
    const campaignId = await ctx.db.insert("campaigns", {
      name: "Building Tomorrow Capital Campaign",
      description:
        "A comprehensive capital campaign to fund our new community center expansion, enhance programming capacity, and endow key staff positions.",
      goal: 5000000,
      startDate: now - 90 * 24 * 60 * 60 * 1000, // 90 days ago
      endDate: now + 275 * 24 * 60 * 60 * 1000,   // ~9 months from now
      status: "Active",
      campaignDirectorId: directorId,
      createdAt: now,
    });

    // ── Campaign Phases ───────────────────────────────────────────────────────
    const phase1Id = await ctx.db.insert("campaignPhases", {
      campaignId,
      name: "Quiet Phase — Leadership Gifts",
      description: "Secure 50% of goal from major donors before public launch.",
      goal: 2500000,
      startDate: now - 90 * 24 * 60 * 60 * 1000,
      endDate: now - 10 * 24 * 60 * 60 * 1000,
      status: "Completed",
      order: 1,
      createdAt: now,
    });

    const phase2Id = await ctx.db.insert("campaignPhases", {
      campaignId,
      name: "Public Launch Phase",
      description: "Broad outreach to expand donor base and build momentum.",
      goal: 1500000,
      startDate: now - 9 * 24 * 60 * 60 * 1000,
      endDate: now + 90 * 24 * 60 * 60 * 1000,
      status: "Active",
      order: 2,
      createdAt: now,
    });

    const phase3Id = await ctx.db.insert("campaignPhases", {
      campaignId,
      name: "Community Phase",
      description: "Engage broader community with events and grassroots giving.",
      goal: 750000,
      startDate: now + 91 * 24 * 60 * 60 * 1000,
      endDate: now + 180 * 24 * 60 * 60 * 1000,
      status: "Upcoming",
      order: 3,
      createdAt: now,
    });

    const phase4Id = await ctx.db.insert("campaignPhases", {
      campaignId,
      name: "Final Push",
      description: "Close the gap and reach the campaign goal.",
      goal: 250000,
      startDate: now + 181 * 24 * 60 * 60 * 1000,
      endDate: now + 275 * 24 * 60 * 60 * 1000,
      status: "Upcoming",
      order: 4,
      createdAt: now,
    });

    // ── Milestones ────────────────────────────────────────────────────────────
    await ctx.db.insert("milestones", {
      campaignId,
      phaseId: phase1Id,
      name: "First $1M Raised",
      description: "Celebrate reaching the first million-dollar milestone.",
      targetAmount: 1000000,
      targetDate: now - 30 * 24 * 60 * 60 * 1000,
      status: "Achieved",
      createdAt: now,
    });

    await ctx.db.insert("milestones", {
      campaignId,
      phaseId: phase1Id,
      name: "Quiet Phase Goal Achieved",
      description: "Complete the quiet phase with $2.5M secured.",
      targetAmount: 2500000,
      targetDate: now - 10 * 24 * 60 * 60 * 1000,
      status: "Achieved",
      createdAt: now,
    });

    await ctx.db.insert("milestones", {
      campaignId,
      phaseId: phase2Id,
      name: "Public Launch — 100 New Donors",
      description: "Acquire 100 new donors during the public launch phase.",
      targetAmount: 500000,
      targetDate: now + 45 * 24 * 60 * 60 * 1000,
      status: "InProgress",
      createdAt: now,
    });

    await ctx.db.insert("milestones", {
      campaignId,
      name: "Campaign Total — $4M",
      description: "Reach $4 million total raised across all phases.",
      targetAmount: 4000000,
      targetDate: now + 150 * 24 * 60 * 60 * 1000,
      status: "Pending",
      createdAt: now,
    });

    // ── Donors ────────────────────────────────────────────────────────────────
    const donor1Id = await ctx.db.insert("donors", {
      firstName: "William",
      lastName: "Hargrove",
      email: "w.hargrove@hargrovegroup.com",
      phone: "512-555-0101",
      organization: "Hargrove Group",
      type: "Corporate",
      status: "Active",
      assignedOfficerId: officer1Id,
      campaignId,
      totalGiven: 750000,
      notes: "Lead donor for the quiet phase. Interested in naming rights for the main hall.",
      createdAt: now,
    });

    const donor2Id = await ctx.db.insert("donors", {
      firstName: "Eleanor",
      lastName: "Whitfield",
      email: "ewhitfield@whitfieldfoundation.org",
      phone: "512-555-0202",
      organization: "Whitfield Family Foundation",
      type: "Foundation",
      status: "Active",
      assignedOfficerId: officer1Id,
      campaignId,
      totalGiven: 500000,
      notes: "Foundation board meets quarterly. Next proposal window opens in 60 days.",
      createdAt: now,
    });

    const donor3Id = await ctx.db.insert("donors", {
      firstName: "Marcus",
      lastName: "Webb",
      email: "marcuswebb@gmail.com",
      phone: "512-555-0303",
      type: "Individual",
      status: "Cultivating",
      assignedOfficerId: officer2Id,
      campaignId,
      totalGiven: 0,
      notes: "Attended gala last year. Capacity estimated at $50K-$100K.",
      createdAt: now,
    });

    const donor4Id = await ctx.db.insert("donors", {
      firstName: "City of Austin",
      lastName: "Parks Dept",
      email: "grants@austintexas.gov",
      type: "Government",
      status: "Solicited",
      assignedOfficerId: officer2Id,
      campaignId,
      totalGiven: 0,
      notes: "Applied for community infrastructure grant. Decision expected in 45 days.",
      createdAt: now,
    });

    const donor5Id = await ctx.db.insert("donors", {
      firstName: "Patricia",
      lastName: "Okonkwo",
      email: "p.okonkwo@email.com",
      phone: "512-555-0505",
      type: "Individual",
      status: "Prospect",
      campaignId,
      totalGiven: 0,
      notes: "Referred by board member Robert Thompson. Alumni of our programs.",
      createdAt: now,
    });

    // ── Pledges ───────────────────────────────────────────────────────────────
    const pledge1Id = await ctx.db.insert("pledges", {
      donorId: donor1Id,
      campaignId,
      amount: 750000,
      pledgeDate: now - 60 * 24 * 60 * 60 * 1000,
      dueDate: now + 180 * 24 * 60 * 60 * 1000,
      status: "PartiallyFulfilled",
      notes: "Payable in 3 installments of $250K each. First installment received.",
      createdAt: now,
    });

    const pledge2Id = await ctx.db.insert("pledges", {
      donorId: donor2Id,
      campaignId,
      amount: 500000,
      pledgeDate: now - 45 * 24 * 60 * 60 * 1000,
      dueDate: now + 90 * 24 * 60 * 60 * 1000,
      status: "PartiallyFulfilled",
      notes: "Foundation grant, two-year commitment. 50% received, 50% pending annual report.",
      createdAt: now,
    });

    // ── Gifts ─────────────────────────────────────────────────────────────────
    await ctx.db.insert("gifts", {
      donorId: donor1Id,
      campaignId,
      pledgeId: pledge1Id,
      phaseId: phase1Id,
      amount: 250000,
      giftDate: now - 55 * 24 * 60 * 60 * 1000,
      paymentMethod: "Wire",
      status: "Acknowledged",
      notes: "First installment of leadership gift. Wire transfer confirmed.",
      createdAt: now,
    });

    await ctx.db.insert("gifts", {
      donorId: donor1Id,
      campaignId,
      pledgeId: pledge1Id,
      phaseId: phase1Id,
      amount: 250000,
      giftDate: now - 20 * 24 * 60 * 60 * 1000,
      paymentMethod: "Wire",
      status: "Acknowledged",
      notes: "Second installment received on schedule.",
      createdAt: now,
    });

    await ctx.db.insert("gifts", {
      donorId: donor2Id,
      campaignId,
      pledgeId: pledge2Id,
      phaseId: phase1Id,
      amount: 250000,
      giftDate: now - 40 * 24 * 60 * 60 * 1000,
      paymentMethod: "Check",
      status: "Acknowledged",
      notes: "Year-one foundation grant disbursement.",
      createdAt: now,
    });

    await ctx.db.insert("gifts", {
      donorId: donor2Id,
      campaignId,
      pledgeId: pledge2Id,
      phaseId: phase2Id,
      amount: 250000,
      giftDate: now - 5 * 24 * 60 * 60 * 1000,
      paymentMethod: "Check",
      status: "Received",
      notes: "Year-two disbursement. Thank you letter pending.",
      createdAt: now,
    });

    // ── Cultivation Activities ────────────────────────────────────────────────
    await ctx.db.insert("cultivationActivities", {
      donorId: donor3Id,
      campaignId,
      officerId: officer2Id,
      type: "Meeting",
      subject: "Introductory Lunch — Campaign Overview",
      notes:
        "Met at Uchi downtown. Shared campaign case for support and facility renderings. Marcus expressed strong interest in youth programming space naming opportunity.",
      activityDate: now - 14 * 24 * 60 * 60 * 1000,
      nextSteps: "Send follow-up with naming rights brochure and schedule site tour.",
      createdAt: now,
    });

    await ctx.db.insert("cultivationActivities", {
      donorId: donor4Id,
      campaignId,
      officerId: officer2Id,
      type: "Proposal",
      subject: "City Infrastructure Grant Application Submitted",
      notes:
        "Submitted $200K grant application to City of Austin Parks & Recreation Department. Application number: COA-2026-0147.",
      activityDate: now - 30 * 24 * 60 * 60 * 1000,
      nextSteps: "Follow up with grants coordinator in 2 weeks. Decision expected by end of Q2.",
      createdAt: now,
    });

    return {
      message: "Database seeded successfully",
      skipped: false,
      counts: {
        users: 5,
        campaigns: 1,
        campaignPhases: 4,
        milestones: 4,
        donors: 5,
        pledges: 2,
        gifts: 4,
        cultivationActivities: 2,
      },
    };
  },
});
