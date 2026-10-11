"use client";

import { useEffect, useState } from "react";
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
import { blockTimeSlot } from "@/lib/actions/time-slots";
import { toast } from "sonner";
import { Loader2, CalendarOff, Calendar, AlertCircle } from "lucide-react";
import type { DoctorScheduleException } from "@/lib/types/scheduling";

const exceptionSchema = z
  .object({
    date: z.string().min(1, "Date is required"),
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
    reason: z.string().optional(),
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

type ExceptionFormValues = z.infer<typeof exceptionSchema>;

interface ScheduleExceptionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: string;
  initialDate?: Date;
  onSuccess?: (newException?: DoctorScheduleException) => void;
}

export function ScheduleExceptionDialog({
  isOpen,
  onOpenChange,
  doctorId,
  initialDate,
  onSuccess,
}: ScheduleExceptionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDateValue = (d?: Date) => {
    if (!d) return new Date().toISOString().split("T")[0];
    return d.toISOString().split("T")[0];
  };

  const form = useForm<ExceptionFormValues>({
    resolver: zodResolver(exceptionSchema),
    defaultValues: {
      date: formatDateValue(initialDate),
      isFullDay: true,
      startTime: "",
      endTime: "",
      reason: "Leave / Unavailable",
    },
  });

  useEffect(() => {
    if (initialDate) {
      form.setValue("date", formatDateValue(initialDate));
    }
  }, [initialDate, form]);

  const isFullDay = form.watch("isFullDay");

  const onSubmit = async (values: ExceptionFormValues) => {
    setIsSubmitting(true);
    try {
      const selectedDate = new Date(`${values.date}T00:00:00Z`);
      const result = await blockTimeSlot({
        doctorId,
        date: selectedDate,
        isFullDay: values.isFullDay,
        startTime: !values.isFullDay && values.startTime ? values.startTime : null,
        endTime: !values.isFullDay && values.endTime ? values.endTime : null,
        reason: values.reason || "Doctor Unavailable",
      });

      if (result.success) {
        toast.success("Schedule exception recorded", {
          description: `Blocked ${values.date}${values.reason ? ` (${values.reason})` : ""}.`,
        });
        onOpenChange(false);
        form.reset();
        if (onSuccess) {
          onSuccess(result.data as DoctorScheduleException | undefined);
        }
      } else {
        toast.error(result.error || "Failed to block time");
      }
    } catch (error) {
      console.error("[SCHEDULE_EXCEPTION_SUBMIT]", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 glassmorphism border-white/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-destructive">
            <CalendarOff className="w-5 h-5 text-destructive" />
            Block Doctor Availability / Record Leave
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Mark this doctor as unavailable on a specific date to prevent appointments from being booked.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Target Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Blackout Date
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

            {/* Full Day Toggle */}
            <FormField
              control={form.control}
              name="isFullDay"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-2xl border border-white/10 p-3 bg-muted/20">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-semibold cursor-pointer">
                      Full Day Blackout
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Block the entire calendar day from bookings.
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
                        Block From (HH:mm)
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
                        Block Until (HH:mm)
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
                    <AlertCircle className="w-3.5 h-3.5 text-primary" /> Reason / Notes
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Sick Leave, Annual Conference, Personal Emergency"
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
                variant="destructive"
                className="rounded-xl font-semibold gap-2 cursor-pointer shadow-md"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Blackout
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
