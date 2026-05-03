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
import { Loader2 } from "lucide-react";

const timeSlotSchema = z.object({
  dayOfWeek: z.string(),
  locationId: z.string().min(1, "Please select a location"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
}).refine((data) => {
  return data.startTime < data.endTime;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

interface TimeSlotDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: string;
  locations: any[];
  initialDayOfWeek?: number;
  onSuccess?: () => void;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function TimeSlotDialog({
  isOpen,
  onOpenChange,
  doctorId,
  locations,
  initialDayOfWeek,
  onSuccess,
}: TimeSlotDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof timeSlotSchema>>({
    resolver: zodResolver(timeSlotSchema),
    defaultValues: {
      dayOfWeek: initialDayOfWeek !== undefined ? initialDayOfWeek.toString() : "1",
      locationId: locations?.[0]?.id || "",
      startTime: "09:00",
      endTime: "17:00",
    },
  });

  // Reset form when initialDayOfWeek changes
  useState(() => {
    if (initialDayOfWeek !== undefined) {
      form.setValue("dayOfWeek", initialDayOfWeek.toString());
    }
  });

  const onSubmit = async (values: z.infer<typeof timeSlotSchema>) => {
    setIsSubmitting(true);
    try {
      // Send raw HH:mm strings — the server action handles UTC-safe storage
      const result = await createTimeSlot({
        doctorId,
        locationId: values.locationId,
        dayOfWeek: parseInt(values.dayOfWeek),
        startTime: values.startTime,
        endTime: values.endTime,
      });

      if (result.success) {
        toast.success("Time slot added successfully");
        onOpenChange(false);
        form.reset();
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.error || "Failed to add time slot");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add Time Slot</DialogTitle>
          <DialogDescription>
            Configure a recurring weekly time slot for appointments.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="dayOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of the Week</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select a day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DAYS.map((day, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {day}
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
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinic Location</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
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
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" className="rounded-xl" {...field} />
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
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Slot"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
