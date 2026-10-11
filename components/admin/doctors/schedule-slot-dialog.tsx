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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTimeSlot } from "@/lib/actions/time-slots";
import { toast } from "sonner";
import { Loader2, Clock, CalendarDays, MapPin } from "lucide-react";
import type { ClinicLocation } from "@/lib/types/locations";
import type { DoctorTimeSlot } from "@/lib/types/scheduling";

const timeSlotSchema = z
  .object({
    dayOfWeek: z.string(),
    locationId: z.string().min(1, "Please select a clinic location"),
    startTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
    endTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

type TimeSlotFormValues = z.infer<typeof timeSlotSchema>;

interface ScheduleSlotDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: string;
  locations: ClinicLocation[];
  initialDayOfWeek?: number;
  onSuccess?: (newSlot?: DoctorTimeSlot) => void;
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function ScheduleSlotDialog({
  isOpen,
  onOpenChange,
  doctorId,
  locations,
  initialDayOfWeek,
  onSuccess,
}: ScheduleSlotDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TimeSlotFormValues>({
    resolver: zodResolver(timeSlotSchema),
    defaultValues: {
      dayOfWeek:
        initialDayOfWeek !== undefined ? initialDayOfWeek.toString() : "1",
      locationId: locations?.[0]?.id || "",
      startTime: "09:00",
      endTime: "17:00",
    },
  });

  useEffect(() => {
    if (initialDayOfWeek !== undefined) {
      form.setValue("dayOfWeek", initialDayOfWeek.toString());
    }
  }, [initialDayOfWeek, form]);

  useEffect(() => {
    if (!form.getValues("locationId") && locations.length > 0) {
      form.setValue("locationId", locations[0].id);
    }
  }, [locations, form]);

  const onSubmit = async (values: TimeSlotFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createTimeSlot({
        doctorId,
        locationId: values.locationId,
        dayOfWeek: parseInt(values.dayOfWeek, 10),
        startTime: values.startTime,
        endTime: values.endTime,
      });

      if (result.success) {
        toast.success("Clinic shift added successfully", {
          description: `Configured for every ${DAYS[parseInt(values.dayOfWeek, 10)]} from ${values.startTime} to ${values.endTime}.`,
        });
        onOpenChange(false);
        form.reset({
          dayOfWeek:
            initialDayOfWeek !== undefined ? initialDayOfWeek.toString() : "1",
          locationId: locations?.[0]?.id || "",
          startTime: "09:00",
          endTime: "17:00",
        });
        if (onSuccess) {
          onSuccess(result.data as DoctorTimeSlot | undefined);
        }
      } else {
        toast.error(result.error || "Failed to add time slot");
      }
    } catch (error) {
      console.error("[SCHEDULE_SLOT_DIALOG_SUBMIT]", error);
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
            <Clock className="w-5 h-5 text-primary" />
            Add Recurring Clinic Shift
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Define recurring working hours and clinic location for this practitioner.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Day of Week */}
            <FormField
              control={form.control}
              name="dayOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-primary" /> Day of Week
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl font-medium cursor-pointer">
                        <SelectValue placeholder="Select day of week" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {DAYS.map((day, idx) => (
                        <SelectItem
                          key={day}
                          value={idx.toString()}
                          className="font-medium cursor-pointer"
                        >
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Clinic Location */}
            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> Clinic Location
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl font-medium cursor-pointer">
                        <SelectValue placeholder="Select clinic facility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {locations.map((loc) => (
                        <SelectItem
                          key={loc.id}
                          value={loc.id}
                          className="font-medium cursor-pointer"
                        >
                          {loc.name} ({loc.city})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" /> Start Time
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
                    <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" /> End Time
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
                Add Shift Slot
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
