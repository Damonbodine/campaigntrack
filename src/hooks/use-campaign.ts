"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function useActiveCampaign(): Id<"campaigns"> | null | undefined {
  const campaigns = useQuery(api.campaigns.list);
  if (campaigns === undefined) return undefined; // loading
  if (!campaigns || campaigns.length === 0) return null; // no campaigns
  // Return first active campaign, or just first campaign
  const active = campaigns.find((c) => c.status === "Active");
  return (active ?? campaigns[0])._id;
}
