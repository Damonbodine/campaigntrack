"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const activitySchema = z.object({
  donorId: z.string().min(1, "Donor is required"),
  activityDate: z.string().min(1, "Activity date is required"),
  activityType: z.enum(["PhoneCall", "Meeting", "Tour", "Email", "Event", "Proposal", "ThankYou", "Letter", "Other"]),
  description: z.string().min(1, "Description is required"),
  outcome: z.enum(["Positive", "Neutral", "Negative", "NeedsFollowUp"]).optional(),
  nextStepDate: z.string().optional(),
  nextStepDescription: z.string().optional(),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

interface CultivationActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: Id<"campaigns">;
  preselectedDonorId?: Id<"donors">;
}

export function CultivationActivityForm({
  open,
  onOpenChange,
  campaignId,
  preselectedDonorId,
}: CultivationActivityFormProps) {
  const createActivity = useMutation(api.cultivationActivities.create);
  const donors = useQuery(api.donors.list) ?? [];
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      donorId: preselectedDonorId ?? "",
      activityDate: new Date().toISOString().split("T")[0],
      activityType: "Meeting",
      description: "",
      outcome: undefined,
      nextStepDate: "",
      nextStepDescription: "",
    },
  });

  const onSubmit = async (values: ActivityFormValues) => {
    setIsSubmitting(true);
    try {
      await createActivity({
        campaignId,
        donorId: values.donorId as Id<"donors">,
        activityDate: values.activityDate,
        activityType: values.activityType,
        description: values.description,
        outcome: values.outcome,
        nextStepDate: values.nextStepDate || undefined,
        nextStepDescription: values.nextStepDescription || undefined,
      });
      toast.success("Activity logged successfully");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to log activity. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activityTypeLabels: Record<string, string> = {
    PhoneCall: "Phone Call",
    Meeting: "Meeting",
    Tour: "Tour",
    Email: "Email",
    Event: "Event",
    Proposal: "Proposal",
    ThankYou: "Thank You",
    Letter: "Letter",
    Other: "Other",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Log Cultivation Activity</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="donorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Donor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select donor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {donors.map((donor) => (
                        <SelectItem key={donor._id} value={donor._id}>
                          {donor.firstName} {donor.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="activityDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="activityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(activityTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What happened / What was discussed</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the activity and key discussion points..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outcome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outcome</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select outcome" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Positive">Positive</SelectItem>
                      <SelectItem value="Neutral">Neutral</SelectItem>
                      <SelectItem value="Negative">Negative</SelectItem>
                      <SelectItem value="NeedsFollowUp">Needs Follow-Up</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nextStepDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Step Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nextStepDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Step</FormLabel>
                    <FormControl>
                      <Input placeholder="Schedule site visit..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Log Activity"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
