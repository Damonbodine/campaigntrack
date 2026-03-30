import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    return user;
  },
});

export const upsertCurrentUser = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        firstName: args.firstName,
        lastName: args.lastName,
        email: args.email,
      });
      return existing._id;
    }
    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      role: "DataEntry",
      status: "Active",
      createdAt: Date.now(),
    });
    return userId;
  },
});

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
    if (currentUser.role !== "CampaignDirector") return [];
    return await ctx.db.query("users").collect();
  },
});

export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("CampaignDirector"),
      v.literal("DevelopmentOfficer"),
      v.literal("BoardMember"),
      v.literal("DataEntry")
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
    if (currentUser.role !== "CampaignDirector") throw new Error("Unauthorized");
    await ctx.db.patch(args.userId, { role: args.role });
  },
});

export const updateStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(v.literal("Active"), v.literal("Inactive")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!currentUser) throw new Error("User not found");
    if (currentUser.role !== "CampaignDirector") throw new Error("Unauthorized");
    await ctx.db.patch(args.userId, { status: args.status });
  },
});
