"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
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

const milestoneSchema = z.object({
  name: z.string().min(1, "Milestone name is required"),
  milestoneType: z.enum(["Financial", "Participation", "Event", "Construction", "Other"]),
  targetDate: z.string().optional(),
  targetAmount: z.coerce.number().positive().optional(),
  description: z.string().optional(),
});

type MilestoneFormValues = z.infer<typeof milestoneSchema>;

interface MilestoneFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: Id<"campaigns">;
  milestoneId?: Id<"milestones">;
  defaultValues?: Partial<MilestoneFormValues>;
}

export function MilestoneForm({
  open,
  onOpenChange,
  campaignId,
  milestoneId,
  defaultValues,
}: MilestoneFormProps) {
  const createMilestone = useMutation(api.milestones.create);
  const updateMilestone = useMutation(api.milestones.update);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      milestoneType: defaultValues?.milestoneType ?? "Financial",
      targetDate: defaultValues?.targetDate ?? "",
      targetAmount: defaultValues?.targetAmount,
      description: defaultValues?.description ?? "",
    },
  });

  const milestoneType = form.watch("milestoneType");
  const isFinancial = milestoneType === "Financial";

  const onSubmit = async (values: MilestoneFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: values.name,
        milestoneType: values.milestoneType,
        targetDate: values.targetDate || undefined,
        targetAmount: isFinancial ? values.targetAmount : undefined,
        description: values.description,
      };
      if (milestoneId) {
        await updateMilestone({ id: milestoneId, ...payload });
        toast.success("Milestone updated successfully");
      } else {
        await createMilestone({ campaignId, ...payload });
        toast.success("Milestone created successfully");
      }
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save milestone. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {milestoneId ? "Edit Milestone" : "Add Milestone"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Milestone Name</FormLabel>
                  <FormControl>
                    <Input placeholder="25% Goal Reached, Groundbreaking..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="milestoneType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Milestone Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Financial">Financial</SelectItem>
                      <SelectItem value="Participation">Participation</SelectItem>
                      <SelectItem value="Event">Event</SelectItem>
                      <SelectItem value="Construction">Construction</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isFinancial && (
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        placeholder="250000"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="targetDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this milestone..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isSubmitting ? "Saving..." : milestoneId ? "Update Milestone" : "Add Milestone"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
