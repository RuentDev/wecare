"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { blockTimeSlot } from "@/lib/actions/time-slots";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const blockTimeSchema = z.object({
  date: z.string().min(1, "Date is required"),
  isFullDay: z.boolean().default(true),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  reason: z.string().optional(),
}).refine((data) => {
  if (!data.isFullDay) {
    if (!data.startTime || !data.endTime) return false;
    return data.startTime < data.endTime;
  }
  return true;
}, {
  message: "Valid start and end time required if not full day",
  path: ["endTime"],
});

interface BlockTimeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: string;
  initialDate?: Date;
  onSuccess?: () => void;
}

export function BlockTimeDialog({
  isOpen,
  onOpenChange,
  doctorId,
  initialDate,
  onSuccess,
}: BlockTimeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof blockTimeSchema>>({
    resolver: zodResolver(blockTimeSchema),
    defaultValues: {
      date: initialDate ? format(initialDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      isFullDay: true,
      startTime: "09:00",
      endTime: "17:00",
      reason: "",
    },
  });

  const isFullDay = form.watch("isFullDay");

  const onSubmit = async (values: z.infer<typeof blockTimeSchema>) => {
    setIsSubmitting(true);
    try {
      let startDateTime = null;
      let endDateTime = null;

      if (!values.isFullDay && values.startTime && values.endTime) {
        startDateTime = values.startTime;
        endDateTime = values.endTime;
      }

      const result = await blockTimeSlot({
        doctorId,
        date: new Date(values.date),
        startTime: startDateTime,
        endTime: endDateTime,
        isFullDay: values.isFullDay,
        reason: values.reason,
      });

      if (result.success) {
        toast.success("Time blocked successfully");
        onOpenChange(false);
        form.reset();
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.error || "Failed to block time");
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
          <DialogTitle>Block Time Slot</DialogTitle>
          <DialogDescription>
            Block a specific date or time range to prevent bookings.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFullDay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      All Day Event
                    </FormLabel>
                    <p className="text-sm text-slate-500">
                      Block the entire day from bookings.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {!isFullDay && (
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
            )}

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Vacation, Medical Leave"
                      className="resize-none rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              <Button type="submit" variant="destructive" className="rounded-xl" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Blocking...
                  </>
                ) : (
                  "Block Time"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
