"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Mail,
  Phone,
  Stethoscope,
  Loader2,
  CheckCircle2,
  MapPin,
  Award,
  Clock,
  Wallet,
  BookOpen,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { updateDoctor, createDoctor } from "@/lib/actions/doctors";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const phoneRegex = /^(09|\+639)\d{9}$/;

const doctorFormSchema = z.object({
  // User fields
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string()
    .refine((val) => !val || phoneRegex.test(val.replace(/\s/g, "")), {
      message: "Invalid Philippine phone format (e.g. 09123456789 or +639123456789)",
    })
    .optional()
    .nullable(),
  is_active: z.boolean().default(true),

  // Doctor fields
  specialization: z.string().optional().nullable(),
  license_number: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  years_of_experience: z.string().or(z.number()).optional().nullable(),
  consultation_fee: z.string().or(z.number()).optional().nullable(),
  location_id: z.string().optional().nullable(),
  is_available: z.boolean().default(true),
  
  // Optional password for creation
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  confirm_password: z.string().optional(),
}).refine((data) => {
  if (data.password && data.confirm_password) {
    return data.password === data.confirm_password;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

interface DoctorInfoFormProps {
  doctor?: any;
  locations: any[];
  onSuccess?: (data: any) => void;
}

const SPECIALIZATIONS = [
  "OB_GYN", "IM", "Pedia", "Gastro", "Liver", "Infectious", 
  "Nephro", "Rheuma", "Surgery", "ENT", "Rehab", "Derma", "Ultrasound"
];

export function DoctorInfoForm({ doctor, locations, onSuccess }: DoctorInfoFormProps) {
  const router = useRouter();
  const isEditing = !!doctor;

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      first_name: doctor?.users?.first_name || "",
      last_name: doctor?.users?.last_name || "",
      email: doctor?.users?.email || "",
      phone: doctor?.users?.phone || "",
      is_active: doctor?.users?.is_active ?? true,
      specialization: doctor?.specialization || "",
      license_number: doctor?.license_number || "",
      bio: doctor?.bio || "",
      years_of_experience: doctor?.years_of_experience?.toString() || "0",
      consultation_fee: doctor?.consultation_fee?.toString() || "0",
      location_id: doctor?.location_id || "",
      is_available: doctor?.is_available ?? true,
      password: "",
      confirm_password: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(data: DoctorFormValues) {
    try {
      let result;
      if (isEditing) {
        result = await updateDoctor(doctor.id, doctor.user_id, data);
      } else {
        result = await createDoctor(data);
      }

      if (result.success) {
        toast.success(isEditing ? "Profile updated successfully" : "Doctor created successfully");
        if (onSuccess) onSuccess(result.data);
        if (!isEditing && result.data?.id) {
          router.push(`/admin/users/doctors/${result.data.id}`);
        } else {
          router.refresh();
        }
      } else {
        toast.error(result.error || "Failed to save doctor profile");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {isEditing ? "General Information" : "Create New Doctor"}
          </h3>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="rounded-xl shadow-lg shadow-primary/20 gap-2 px-6"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEditing ? "Save Changes" : "Create Doctor"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glassmorphism-card border-none overflow-hidden rounded-[24px]">
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          First Name <span className="text-destructive ml-0.5">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John" className="glassmorphism-input" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Last Name <span className="text-destructive ml-0.5">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Doe" className="glassmorphism-input" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email Address <span className="text-destructive ml-0.5">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              placeholder="doctor@example.com"
                              className="glassmorphism-input pl-10"
                              disabled={isEditing}
                            />
                          </div>
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
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              value={field.value || ""}
                              placeholder="+63 900 000 0000"
                              className="glassmorphism-input pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {!isEditing && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Initial Password <span className="text-destructive ml-0.5">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Min. 6 characters"
                              className="glassmorphism-input"
                            />
                          </FormControl>
                          <FormDescription>
                            Min. 6 chars (default: Temporary123!)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirm_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Confirm Password <span className="text-destructive ml-0.5">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Repeat password"
                              className="glassmorphism-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" /> Biography
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write a brief professional bio..."
                          className="glassmorphism-input min-h-[150px] resize-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glassmorphism-card border-none overflow-hidden rounded-[24px]">
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-bold">Account Active</FormLabel>
                          <FormDescription className="text-[10px]">Enable/Disable login</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_available"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-bold">Available for Booking</FormLabel>
                          <FormDescription className="text-[10px]">Show in public booking</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
                    <Stethoscope className="w-4 h-4" /> Professional Profile
                  </h4>
                  
                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialization</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger className="glassmorphism-input">
                              <SelectValue placeholder="Select specialization" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SPECIALIZATIONS.map((spec) => (
                              <SelectItem key={spec} value={spec}>
                                {spec.replace("_", " ")}
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
                    name="license_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Award className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              value={field.value || ""}
                              placeholder="PRC-0000000"
                              className="glassmorphism-input pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="years_of_experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                {...field}
                                value={field.value || ""}
                                className="glassmorphism-input pl-10"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="consultation_fee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fee (PHP)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Wallet className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                value={field.value || ""}
                                className="glassmorphism-input pl-10"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinic Location</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger className="glassmorphism-input">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Select location" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locations.map((loc) => (
                              <SelectItem key={loc.id} value={loc.id}>
                                {loc.name} - {loc.city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
