"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { createDoctorLeaveRequest } from "@/lib/actions/doctor-leaves";
import { toast } from "sonner";
import { Loader2, CalendarOff, Calendar, AlertCircle } from "lucide-react";

const leaveSchema = z
  .object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    isFullDay: z.boolean().default(true),
    startTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time (HH:mm)")
      .optional()
      .or(z.literal("")),
    endTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time (HH:mm)")
      .optional()
      .or(z.literal("")),
    reason: z.string().min(3, "Please provide a reason for the leave"),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "End date cannot be earlier than start date",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      if (!data.isFullDay && data.startTime && data.endTime) {
        return data.startTime < data.endTime;
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

type LeaveFormValues = z.infer<typeof leaveSchema>;

interface DoctorLeaveModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: string;
  onSuccess?: () => void;
}

export function DoctorLeaveModal({
  isOpen,
  onOpenChange,
  doctorId,
  onSuccess,
}: DoctorLeaveModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      startDate: todayStr,
      endDate: todayStr,
      isFullDay: true,
      startTime: "",
      endTime: "",
      reason: "",
    },
  });

  const isFullDay = form.watch("isFullDay");

  const onSubmit = async (values: LeaveFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await createDoctorLeaveRequest({
        doctorId,
        startDate: values.startDate,
        endDate: values.endDate,
        isFullDay: values.isFullDay,
        startTime: !values.isFullDay && values.startTime ? values.startTime : null,
        endTime: !values.isFullDay && values.endTime ? values.endTime : null,
        reason: values.reason,
      });

      if (res.success) {
        toast.success("Leave request submitted", {
          description: "Your request has been routed to clinic administration for review.",
        });
        onOpenChange(false);
        form.reset({
          startDate: todayStr,
          endDate: todayStr,
          isFullDay: true,
          startTime: "",
          endTime: "",
          reason: "",
        });
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Failed to submit leave request");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 glassmorphism border-white/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CalendarOff className="w-5 h-5 text-primary" />
            Request Time Off / Leave
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Submit a leave request for administrative review. Approved leaves automatically block appointment slots.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> Start Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="rounded-xl font-medium"
                      />
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
                    <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> End Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="rounded-xl font-medium"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Full Day Toggle */}
            <FormField
              control={form.control}
              name="isFullDay"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-2xl border border-white/10 p-3 bg-muted/20">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-semibold cursor-pointer">
                      Full Day Leave
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Block the entire working day(s).
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="cursor-pointer"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Custom Hours (if not full day) */}
            {!isFullDay && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">
                        From Time (HH:mm)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          className="rounded-xl font-medium"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">
                        To Time (HH:mm)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          className="rounded-xl font-medium"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-primary" /> Reason / Justification
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Vacation, Sick Leave, Family Event, Medical Conference"
                      {...field}
                      className="rounded-xl font-medium"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end gap-2 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl cursor-pointer"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl font-semibold gap-2 cursor-pointer shadow-md"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Request
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
