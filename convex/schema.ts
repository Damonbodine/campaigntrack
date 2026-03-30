import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("CampaignDirector"), v.literal("DevelopmentOfficer"), v.literal("BoardMember"), v.literal("DataEntry")),
    status: v.union(v.literal("Active"), v.literal("Inactive")),
    createdAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  campaigns: defineTable({
    name: v.string(),
    description: v.string(),
    goalAmount: v.number(),
    startDate: v.string(),
    endDate: v.string(),
    currentPhase: v.union(v.literal("QuietPhase"), v.literal("PublicPhase"), v.literal("CloseOut"), v.literal("Completed")),
    status: v.union(v.literal("Planning"), v.literal("Active"), v.literal("Paused"), v.literal("Completed"), v.literal("Cancelled")),
    thermometerAmount: v.number(),
    createdById: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_createdById", ["createdById"]),

  campaignPhases: defineTable({
    campaignId: v.id("campaigns"),
    name: v.string(),
    description: v.optional(v.string()),
    goalAmount: v.number(),
    startDate: v.string(),
    endDate: v.string(),
    sequence: v.number(),
    status: v.union(v.literal("Upcoming"), v.literal("Active"), v.literal("Completed")),
    createdAt: v.number(),
  })
    .index("by_campaignId", ["campaignId"])
    .index("by_campaignId_sequence", ["campaignId", "sequence"]),

  milestones: defineTable({
    campaignId: v.id("campaigns"),
    name: v.string(),
    description: v.optional(v.string()),
    targetDate: v.optional(v.string()),
    achievedDate: v.optional(v.string()),
    milestoneType: v.union(v.literal("Financial"), v.literal("Participation"), v.literal("Event"), v.literal("Construction"), v.literal("Other")),
    targetAmount: v.optional(v.number()),
    status: v.union(v.literal("Pending"), v.literal("Achieved"), v.literal("Missed")),
    createdAt: v.number(),
  })
    .index("by_campaignId", ["campaignId"])
    .index("by_campaignId_status", ["campaignId", "status"]),

  donors: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    street: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    organizationName: v.optional(v.string()),
    donorType: v.union(v.literal("Individual"), v.literal("Corporation"), v.literal("Foundation"), v.literal("Organization"), v.literal("Anonymous")),
    cultivationStage: v.union(v.literal("Prospect"), v.literal("Identified"), v.literal("Qualified"), v.literal("Cultivated"), v.literal("Solicited"), v.literal("Pledged"), v.literal("Stewarding"), v.literal("Lapsed")),
    donorTier: v.union(v.literal("Leadership"), v.literal("Major"), v.literal("Mid"), v.literal("Annual"), v.literal("Prospect")),
    assignedOfficerId: v.optional(v.id("users")),
    capacity: v.optional(v.union(v.literal("Under10K"), v.literal("From10Kto50K"), v.literal("From50Kto100K"), v.literal("From100Kto500K"), v.literal("From500Kto1M"), v.literal("Over1M"))),
    relationshipNotes: v.optional(v.string()),
    status: v.union(v.literal("Active"), v.literal("Inactive")),
    createdAt: v.number(),
  })
    .index("by_assignedOfficerId", ["assignedOfficerId"])
    .index("by_cultivationStage", ["cultivationStage"])
    .index("by_donorTier", ["donorTier"])
    .index("by_status", ["status"])
    .index("by_donorType", ["donorType"]),

  pledges: defineTable({
    campaignId: v.id("campaigns"),
    donorId: v.id("donors"),
    totalAmount: v.number(),
    pledgeDate: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    frequency: v.union(v.literal("OneTime"), v.literal("Monthly"), v.literal("Quarterly"), v.literal("Annual")),
    numberOfPayments: v.number(),
    amountPaid: v.number(),
    amountRemaining: v.number(),
    status: v.union(v.literal("Active"), v.literal("Fulfilled"), v.literal("Delinquent"), v.literal("Cancelled"), v.literal("WrittenOff")),
    designation: v.optional(v.string()),
    isAnonymous: v.boolean(),
    notes: v.optional(v.string()),
    pledgedToId: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_campaignId", ["campaignId"])
    .index("by_donorId", ["donorId"])
    .index("by_status", ["status"])
    .index("by_campaignId_status", ["campaignId", "status"])
    .index("by_pledgedToId", ["pledgedToId"])
    .index("by_donorId_campaignId", ["donorId", "campaignId"]),

  gifts: defineTable({
    pledgeId: v.optional(v.id("pledges")),
    campaignId: v.id("campaigns"),
    donorId: v.id("donors"),
    amount: v.number(),
    giftDate: v.string(),
    giftType: v.union(v.literal("Cash"), v.literal("Check"), v.literal("CreditCard"), v.literal("Stock"), v.literal("InKind"), v.literal("DAF"), v.literal("Wire"), v.literal("Other")),
    checkNumber: v.optional(v.string()),
    inKindDescription: v.optional(v.string()),
    inKindFairMarketValue: v.optional(v.number()),
    designation: v.optional(v.string()),
    isAnonymous: v.boolean(),
    acknowledgmentStatus: v.union(v.literal("Pending"), v.literal("Sent"), v.literal("NotRequired")),
    acknowledgmentDate: v.optional(v.string()),
    receivedById: v.id("users"),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_campaignId", ["campaignId"])
    .index("by_donorId", ["donorId"])
    .index("by_pledgeId", ["pledgeId"])
    .index("by_campaignId_giftDate", ["campaignId", "giftDate"])
    .index("by_acknowledgmentStatus", ["acknowledgmentStatus"])
    .index("by_receivedById", ["receivedById"])
    .index("by_donorId_campaignId", ["donorId", "campaignId"]),

  cultivationActivities: defineTable({
    donorId: v.id("donors"),
    campaignId: v.id("campaigns"),
    activityDate: v.string(),
    activityType: v.union(v.literal("PhoneCall"), v.literal("Meeting"), v.literal("Tour"), v.literal("Email"), v.literal("Event"), v.literal("Proposal"), v.literal("ThankYou"), v.literal("Letter"), v.literal("Other")),
    description: v.string(),
    outcome: v.optional(v.union(v.literal("Positive"), v.literal("Neutral"), v.literal("Negative"), v.literal("NeedsFollowUp"))),
    nextStepDate: v.optional(v.string()),
    nextStepDescription: v.optional(v.string()),
    loggedById: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_donorId", ["donorId"])
    .index("by_campaignId", ["campaignId"])
    .index("by_loggedById", ["loggedById"])
    .index("by_donorId_campaignId", ["donorId", "campaignId"])
    .index("by_activityType", ["activityType"]),
});
