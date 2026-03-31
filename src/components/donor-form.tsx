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
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const donorSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  donorType: z.enum(["Individual", "Corporation", "Foundation", "Organization", "Anonymous"]),
  cultivationStage: z.enum(["Prospect", "Identified", "Qualified", "Cultivated", "Solicited", "Pledged", "Stewarding", "Lapsed"]),
  donorTier: z.enum(["Leadership", "Major", "Mid", "Annual", "Prospect"]),
  capacity: z.enum(["Under10K", "From10Kto50K", "From50Kto100K", "From100Kto500K", "From500Kto1M", "Over1M"]).optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  organizationName: z.string().optional(),
  assignedOfficerId: z.string().optional(),
  relationshipNotes: z.string().optional(),
});

type DonorFormValues = z.infer<typeof donorSchema>;

interface DonorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donorId?: Id<"donors">;
  defaultValues?: Partial<DonorFormValues>;
}

export function DonorForm({ open, onOpenChange, donorId, defaultValues }: DonorFormProps) {
  const createDonor = useMutation(api.donors.create);
  const updateDonor = useMutation(api.donors.update);
  const officers = useQuery(api.users.list) ?? [];
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DonorFormValues>({
    resolver: zodResolver(donorSchema) as never,
    defaultValues: {
      firstName: defaultValues?.firstName ?? "",
      lastName: defaultValues?.lastName ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      donorType: defaultValues?.donorType ?? "Individual",
      cultivationStage: defaultValues?.cultivationStage ?? "Prospect",
      donorTier: defaultValues?.donorTier ?? "Prospect",
      capacity: defaultValues?.capacity,
      street: defaultValues?.street ?? "",
      city: defaultValues?.city ?? "",
      state: defaultValues?.state ?? "",
      zip: defaultValues?.zip ?? "",
      organizationName: defaultValues?.organizationName ?? "",
      assignedOfficerId: defaultValues?.assignedOfficerId ?? "",
      relationshipNotes: defaultValues?.relationshipNotes ?? "",
    },
  });

  const onSubmit = async (values: DonorFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        assignedOfficerId: values.assignedOfficerId
          ? (values.assignedOfficerId as Id<"users">)
          : undefined,
      };
      if (donorId) {
        await updateDonor({ donorId, ...payload });
        toast.success("Donor updated successfully");
      } else {
        await createDonor({ ...payload, status: "Active" as const });
        toast.success("Donor created successfully");
      }
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save donor. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-card border-border">
        <SheetHeader>
          <SheetTitle className="text-foreground">
            {donorId ? "Edit Donor" : "Add Donor"}
          </SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="jane@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="organizationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Foundation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="donorType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Donor Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Individual">Individual</SelectItem>
                        <SelectItem value="Corporation">Corporation</SelectItem>
                        <SelectItem value="Foundation">Foundation</SelectItem>
                        <SelectItem value="Organization">Organization</SelectItem>
                        <SelectItem value="Anonymous">Anonymous</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="donorTier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Donor Tier</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Leadership">Leadership</SelectItem>
                        <SelectItem value="Major">Major</SelectItem>
                        <SelectItem value="Mid">Mid</SelectItem>
                        <SelectItem value="Annual">Annual</SelectItem>
                        <SelectItem value="Prospect">Prospect</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cultivationStage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Prospect">Prospect</SelectItem>
                        <SelectItem value="Identified">Identified</SelectItem>
                        <SelectItem value="Qualified">Qualified</SelectItem>
                        <SelectItem value="Cultivated">Cultivated</SelectItem>
                        <SelectItem value="Solicited">Solicited</SelectItem>
                        <SelectItem value="Pledged">Pledged</SelectItem>
                        <SelectItem value="Stewarding">Stewarding</SelectItem>
                        <SelectItem value="Lapsed">Lapsed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giving Capacity</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select capacity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Under10K">Under $10K</SelectItem>
                      <SelectItem value="From10Kto50K">$10K – $50K</SelectItem>
                      <SelectItem value="From50Kto100K">$50K – $100K</SelectItem>
                      <SelectItem value="From100Kto500K">$100K – $500K</SelectItem>
                      <SelectItem value="From500Kto1M">$500K – $1M</SelectItem>
                      <SelectItem value="Over1M">Over $1M</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />
            <p className="text-sm font-medium text-muted-foreground">Address</p>

            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Austin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="TX" maxLength={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP</FormLabel>
                    <FormControl>
                      <Input placeholder="78701" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="assignedOfficerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Development Officer</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Assign officer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
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
              name="relationshipNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notes about this donor relationship..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : donorId ? "Update Donor" : "Add Donor"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
