import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    campaignId: v.optional(v.id("campaigns")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();
    if (!currentUser) return [];
    if (currentUser.role === "BoardMember") return [];
    let allDonors = await ctx.db.query("donors").take(100);
    if (currentUser.role === "DevelopmentOfficer") {
      allDonors = allDonors.filter(
        (d) => d.assignedOfficerId === currentUser._id
      );
    }
    return allDonors.map((donor) => ({
      ...donor,
      email: currentUser.role === "DataEntry" ? donor.email : donor.email,
      phone: currentUser.role === "DataEntry" ? donor.phone : donor.phone,
    }));
  },
});

export const get = query({
  args: { donorId: v.id("donors") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();
    if (!currentUser) return null;
    if (currentUser.role === "BoardMember") return null;
    const donor = await ctx.db.get(args.donorId);
    if (!donor) return null;
    if (
      currentUser.role === "DevelopmentOfficer" &&
      donor.assignedOfficerId !== currentUser._id
    ) {
      return null;
    }
    return donor;
  },
});

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    street: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    organizationName: v.optional(v.string()),
    donorType: v.union(
      v.literal("Individual"),
      v.literal("Corporation"),
      v.literal("Foundation"),
      v.literal("Organization"),
      v.literal("Anonymous")
    ),
    cultivationStage: v.union(
      v.literal("Prospect"),
      v.literal("Identified"),
      v.literal("Qualified"),
      v.literal("Cultivated"),
      v.literal("Solicited"),
      v.literal("Pledged"),
      v.literal("Stewarding"),
      v.literal("Lapsed")
    ),
    donorTier: v.union(
      v.literal("Leadership"),
      v.literal("Major"),
      v.literal("Mid"),
      v.literal("Annual"),
      v.literal("Prospect")
    ),
    assignedOfficerId: v.optional(v.id("users")),
    capacity: v.optional(
      v.union(
        v.literal("Under10K"),
        v.literal("From10Kto50K"),
        v.literal("From50Kto100K"),
        v.literal("From100Kto500K"),
        v.literal("From500Kto1M"),
        v.literal("Over1M")
      )
    ),
    relationshipNotes: v.optional(v.string()),
    status: v.union(v.literal("Active"), v.literal("Inactive")),
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
    const donorId = await ctx.db.insert("donors", {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      street: args.street,
      city: args.city,
      state: args.state,
      zip: args.zip,
      organizationName: args.organizationName,
      donorType: args.donorType,
      cultivationStage: args.cultivationStage,
      donorTier: args.donorTier,
      assignedOfficerId: args.assignedOfficerId,
      capacity: args.capacity,
      relationshipNotes: args.relationshipNotes,
      status: args.status,
      createdAt: Date.now(),
    });
    return donorId;
  },
});

export const update = mutation({
  args: {
    donorId: v.id("donors"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    street: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    organizationName: v.optional(v.string()),
    donorType: v.optional(
      v.union(
        v.literal("Individual"),
        v.literal("Corporation"),
        v.literal("Foundation"),
        v.literal("Organization"),
        v.literal("Anonymous")
      )
    ),
    cultivationStage: v.optional(
      v.union(
        v.literal("Prospect"),
        v.literal("Identified"),
        v.literal("Qualified"),
        v.literal("Cultivated"),
        v.literal("Solicited"),
        v.literal("Pledged"),
        v.literal("Stewarding"),
        v.literal("Lapsed")
      )
    ),
    donorTier: v.optional(
      v.union(
        v.literal("Leadership"),
        v.literal("Major"),
        v.literal("Mid"),
        v.literal("Annual"),
        v.literal("Prospect")
      )
    ),
    assignedOfficerId: v.optional(v.id("users")),
    capacity: v.optional(
      v.union(
        v.literal("Under10K"),
        v.literal("From10Kto50K"),
        v.literal("From50Kto100K"),
        v.literal("From100Kto500K"),
        v.literal("From500Kto1M"),
        v.literal("Over1M")
      )
    ),
    relationshipNotes: v.optional(v.string()),
    status: v.optional(v.union(v.literal("Active"), v.literal("Inactive"))),
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
    const donor = await ctx.db.get(args.donorId);
    if (!donor) throw new Error("Donor not found");
    if (
      currentUser.role === "DevelopmentOfficer" &&
      donor.assignedOfficerId !== currentUser._id
    ) {
      throw new Error("Unauthorized: not assigned to this donor");
    }
    const { donorId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    if (fields.firstName !== undefined) updates.firstName = fields.firstName;
    if (fields.lastName !== undefined) updates.lastName = fields.lastName;
    if (fields.email !== undefined) updates.email = fields.email;
    if (fields.phone !== undefined) updates.phone = fields.phone;
    if (fields.street !== undefined) updates.street = fields.street;
    if (fields.city !== undefined) updates.city = fields.city;
    if (fields.state !== undefined) updates.state = fields.state;
    if (fields.zip !== undefined) updates.zip = fields.zip;
    if (fields.organizationName !== undefined) updates.organizationName = fields.organizationName;
    if (fields.donorType !== undefined) updates.donorType = fields.donorType;
    if (fields.cultivationStage !== undefined) updates.cultivationStage = fields.cultivationStage;
    if (fields.donorTier !== undefined) updates.donorTier = fields.donorTier;
    if (fields.assignedOfficerId !== undefined) updates.assignedOfficerId = fields.assignedOfficerId;
    if (fields.capacity !== undefined) updates.capacity = fields.capacity;
    if (fields.relationshipNotes !== undefined) updates.relationshipNotes = fields.relationshipNotes;
    if (fields.status !== undefined) updates.status = fields.status;
    await ctx.db.patch(donorId, updates);
  },
});
