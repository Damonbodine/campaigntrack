"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const giftSchema = z.object({
  donorId: z.string().min(1, "Donor is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  giftDate: z.string().min(1, "Gift date is required"),
  giftType: z.enum(["Cash", "Check", "CreditCard", "Stock", "InKind", "DAF", "Wire", "Other"]),
  pledgeId: z.string().optional(),
  checkNumber: z.string().optional(),
  inKindDescription: z.string().optional(),
  inKindFairMarketValue: z.coerce.number().optional(),
  designation: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  acknowledgmentStatus: z.enum(["Pending", "Sent", "NotRequired"]),
  notes: z.string().optional(),
});

type GiftEntryFormValues = z.infer<typeof giftSchema>;

interface GiftEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: Id<"campaigns">;
  batchMode?: boolean;
}

export function GiftEntryForm({ open, onOpenChange, campaignId, batchMode = false }: GiftEntryFormProps) {
  const createGift = useMutation(api.gifts.create);
  const donors = useQuery(api.donors.list) ?? [];
  const pledges = useQuery(api.pledges.list) ?? [];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [batchCount, setBatchCount] = useState(0);

  const form = useForm<GiftEntryFormValues>({
    resolver: zodResolver(giftSchema),
    defaultValues: {
      donorId: "",
      amount: 0,
      giftDate: new Date().toISOString().split("T")[0],
      giftType: "Cash",
      pledgeId: "",
      checkNumber: "",
      inKindDescription: "",
      inKindFairMarketValue: undefined,
      designation: "",
      isAnonymous: false,
      acknowledgmentStatus: "Pending",
      notes: "",
    },
  });

  const selectedGiftType = form.watch("giftType");
  const isCheck = selectedGiftType === "Check";
  const isInKind = selectedGiftType === "InKind";

  const onSubmit = async (values: GiftEntryFormValues) => {
    setIsSubmitting(true);
    try {
      await createGift({
        campaignId,
        donorId: values.donorId as Id<"donors">,
        amount: values.amount,
        giftDate: values.giftDate,
        giftType: values.giftType,
        pledgeId: values.pledgeId ? (values.pledgeId as Id<"pledges">) : undefined,
        checkNumber: isCheck ? values.checkNumber : undefined,
        inKindDescription: isInKind ? values.inKindDescription : undefined,
        inKindFairMarketValue: isInKind ? values.inKindFairMarketValue : undefined,
        designation: values.designation,
        isAnonymous: values.isAnonymous,
        acknowledgmentStatus: values.acknowledgmentStatus,
        notes: values.notes,
      });

      if (batchMode) {
        setBatchCount((c) => c + 1);
        toast.success(`Gift recorded! (${batchCount + 1} in this batch)`);
        form.reset({
          donorId: "",
          amount: 0,
          giftDate: values.giftDate,
          giftType: values.giftType,
          pledgeId: "",
          checkNumber: "",
          inKindDescription: "",
          inKindFairMarketValue: undefined,
          designation: values.designation,
          isAnonymous: false,
          acknowledgmentStatus: values.acknowledgmentStatus,
          notes: "",
        });
      } else {
        toast.success("Gift recorded successfully");
        form.reset();
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("Failed to record gift. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    if (batchCount > 0) {
      toast.success(`Batch complete — ${batchCount} gift${batchCount > 1 ? "s" : ""} recorded.`);
    }
    setBatchCount(0);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-card border-border">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <SheetTitle className="text-foreground">Record Gift</SheetTitle>
            {batchMode && batchCount > 0 && (
              <Badge variant="secondary">{batchCount} in batch</Badge>
            )}
          </div>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={0.01} placeholder="500.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="giftDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gift Date</FormLabel>
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
                name="giftType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gift Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Check">Check</SelectItem>
                        <SelectItem value="CreditCard">Credit Card</SelectItem>
                        <SelectItem value="Stock">Stock</SelectItem>
                        <SelectItem value="InKind">In-Kind</SelectItem>
                        <SelectItem value="DAF">DAF</SelectItem>
                        <SelectItem value="Wire">Wire</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pledgeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apply to Pledge (optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="No pledge" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No pledge</SelectItem>
                        {pledges.map((pledge) => (
                          <SelectItem key={pledge._id} value={pledge._id}>
                            ${pledge.totalAmount.toLocaleString()} pledge
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isCheck && (
              <FormField
                control={form.control}
                name="checkNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check Number</FormLabel>
                    <FormControl>
                      <Input placeholder="1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isInKind && (
              <>
                <FormField
                  control={form.control}
                  name="inKindDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>In-Kind Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the in-kind gift..."
                          className="resize-none"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inKindFairMarketValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fair Market Value ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          placeholder="0.00"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl>
                    <Input placeholder="Building Fund, Endowment..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acknowledgmentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acknowledgment Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Sent">Sent</SelectItem>
                      <SelectItem value="NotRequired">Not Required</SelectItem>
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
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel>Anonymous Gift</FormLabel>
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
                      placeholder="Additional notes..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <SheetFooter className="flex-col sm:flex-row gap-2">
              {batchMode ? (
                <>
                  <Button type="button" variant="outline" onClick={handleDone} disabled={isSubmitting}>
                    Done ({batchCount} recorded)
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save & Next"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Recording..." : "Record Gift"}
                  </Button>
                </>
              )}
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
