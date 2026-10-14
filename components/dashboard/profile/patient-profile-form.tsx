"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  UserCircle,
  Mail,
  Phone,
  Loader2,
  Save,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  patientProfileSchema,
  type PatientProfileFormValues,
} from "@/lib/validations/patient-profile";
import { updatePatientProfile } from "@/lib/actions/patients";
import type { User } from "@/lib/types/user";

interface PatientProfileFormProps {
  user: User;
}

export function PatientProfileForm({ user }: PatientProfileFormProps) {
  const router = useRouter();

  const form = useForm<PatientProfileFormValues>({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: {
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone: user.phone || "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const isDirty = form.formState.isDirty;

  async function onSubmit(data: PatientProfileFormValues) {
    try {
      const result = await updatePatientProfile(data);

      if (result.success) {
        toast.success("Profile updated successfully", {
          description: "Your contact information has been updated.",
        });
        form.reset({
          first_name: result.user.first_name,
          last_name: result.user.last_name,
          phone: result.user.phone || "",
        });
        router.refresh();
      } else {
        toast.error("Failed to update profile", {
          description: result.error,
        });
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 animate-in fade-in-50 duration-200"
      >
        {/* Name Fields: 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FormLabel className="text-sm font-semibold flex items-center gap-2">
                  <UserCircle className="size-4 text-primary" /> First Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your first name"
                    {...field}
                    className="h-11 rounded-xl border-neutral-gray/30 focus:ring-primary/20 transition-all bg-white/50 backdrop-blur-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FormLabel className="text-sm font-semibold flex items-center gap-2">
                  <UserCircle className="size-4 text-primary" /> Last Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your last name"
                    {...field}
                    className="h-11 rounded-xl border-neutral-gray/30 focus:ring-primary/20 transition-all bg-white/50 backdrop-blur-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Email Field (Disabled/Read-only per specification) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="profile-email-readonly"
              className="text-sm font-semibold flex items-center gap-2 text-foreground"
            >
              <Mail className="size-4 text-primary" /> Email Address
            </label>
            <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Lock className="size-3 text-muted-foreground" /> Read-only
            </span>
          </div>
          <Input
            id="profile-email-readonly"
            type="email"
            value={user.email}
            disabled
            readOnly
            className="h-11 rounded-xl border-neutral-gray/20 bg-slate-100/70 dark:bg-slate-800/40 text-muted-foreground cursor-not-allowed select-none"
          />
          <p className="text-[11px] text-muted-foreground">
            Primary email address cannot be changed directly as it is your clinical identifier.
          </p>
        </div>

        {/* Contact / Phone Number */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1.5">
              <FormLabel className="text-sm font-semibold flex items-center gap-2">
                <Phone className="size-4 text-primary" /> Contact Number
              </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+63 912 345 6789"
                  {...field}
                  className="h-11 rounded-xl border-neutral-gray/30 focus:ring-primary/20 transition-all bg-white/50 backdrop-blur-sm"
                />
              </FormControl>
              <FormDescription className="text-[11px]">
                Used for clinical appointment reminders and SMS verification.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="h-11 px-6 rounded-xl font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving Changes...
              </>
            ) : isDirty ? (
              <>
                <Save className="size-4" data-icon="inline-start" />
                Save Changes
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" data-icon="inline-start" />
                Saved
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
