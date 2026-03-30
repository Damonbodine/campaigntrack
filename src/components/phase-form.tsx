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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const phaseSchema = z.object({
  name: z.string().min(1, "Phase name is required"),
  goalAmount: z.coerce.number().positive("Goal must be positive"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  sequence: z.coerce.number().int().positive("Sequence must be a positive integer"),
  description: z.string().optional(),
});

type PhaseFormValues = z.infer<typeof phaseSchema>;

interface PhaseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: Id<"campaigns">;
  phaseId?: Id<"campaignPhases">;
  defaultValues?: Partial<PhaseFormValues>;
  nextSequence?: number;
}

export function PhaseForm({
  open,
  onOpenChange,
  campaignId,
  phaseId,
  defaultValues,
  nextSequence = 1,
}: PhaseFormProps) {
  const createPhase = useMutation(api.campaignPhases.create);
  const updatePhase = useMutation(api.campaignPhases.update);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PhaseFormValues>({
    resolver: zodResolver(phaseSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      goalAmount: defaultValues?.goalAmount ?? 0,
      startDate: defaultValues?.startDate ?? "",
      endDate: defaultValues?.endDate ?? "",
      sequence: defaultValues?.sequence ?? nextSequence,
      description: defaultValues?.description ?? "",
    },
  });

  const onSubmit = async (values: PhaseFormValues) => {
    setIsSubmitting(true);
    try {
      if (phaseId) {
        await updatePhase({ id: phaseId, ...values });
        toast.success("Phase updated successfully");
      } else {
        await createPhase({ campaignId, ...values });
        toast.success("Phase created successfully");
      }
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save phase. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {phaseId ? "Edit Phase" : "Add Campaign Phase"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Phase Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Quiet Phase" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sequence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} step={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="goalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phase Goal Amount ($)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={1000} placeholder="500000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this phase's focus and goals..."
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
                {isSubmitting ? "Saving..." : phaseId ? "Update Phase" : "Add Phase"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
