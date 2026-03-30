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
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const pledgeSchema = z.object({
  donorId: z.string().min(1, "Donor is required"),
  totalAmount: z.coerce.number().positive("Amount must be positive"),
  pledgeDate: z.string().min(1, "Pledge date is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  frequency: z.enum(["OneTime", "Monthly", "Quarterly", "Annual"]),
  numberOfPayments: z.coerce.number().int().positive("Must be at least 1"),
  designation: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  notes: z.string().optional(),
  pledgedToId: z.string().optional(),
});

type PledgeFormValues = z.infer<typeof pledgeSchema>;

interface PledgeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: Id<"campaigns">;
  preselectedDonorId?: Id<"donors">;
}

export function PledgeForm({ open, onOpenChange, campaignId, preselectedDonorId }: PledgeFormProps) {
  const createPledge = useMutation(api.pledges.create);
  const donors = useQuery(api.donors.list) ?? [];
  const officers = useQuery(api.users.list) ?? [];
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PledgeFormValues>({
    resolver: zodResolver(pledgeSchema),
    defaultValues: {
      donorId: preselectedDonorId ?? "",
      totalAmount: 0,
      pledgeDate: new Date().toISOString().split("T")[0],
      startDate: "",
      endDate: "",
      frequency: "OneTime",
      numberOfPayments: 1,
      designation: "",
      isAnonymous: false,
      notes: "",
      pledgedToId: "",
    },
  });

  const onSubmit = async (values: PledgeFormValues) => {
    setIsSubmitting(true);
    try {
      await createPledge({
        campaignId,
        donorId: values.donorId as Id<"donors">,
        totalAmount: values.totalAmount,
        pledgeDate: values.pledgeDate,
        startDate: values.startDate,
        endDate: values.endDate,
        frequency: values.frequency,
        numberOfPayments: values.numberOfPayments,
        designation: values.designation,
        isAnonymous: values.isAnonymous,
        notes: values.notes,
        pledgedToId: values.pledgedToId ? (values.pledgedToId as Id<"users">) : undefined,
      });
      toast.success("Pledge recorded successfully");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to record pledge. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Record Pledge</DialogTitle>
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
                          {donor.organizationName ? ` (${donor.organizationName})` : ""}
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
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Pledge Amount ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={100} placeholder="50000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pledgeDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pledge Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OneTime">One Time</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numberOfPayments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Payments</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} step={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payments Start</FormLabel>
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
                    <FormLabel>Payments End</FormLabel>
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
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl>
                    <Input placeholder="Building Fund, Endowment, General..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pledgedToId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pledge Secured By</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select officer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Not specified</SelectItem>
                      {officers.map((officer) => (
                        <SelectItem key={officer._id} value={officer._id}>
                          {officer.name ?? officer.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAnonymous"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Anonymous Pledge</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this pledge..."
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
                {isSubmitting ? "Recording..." : "Record Pledge"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
