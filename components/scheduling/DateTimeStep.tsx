"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { getAvailableTimeSlots } from "@/lib/actions/scheduling";
import { cn } from "@/lib/utils";
import type { TimeSlotInfo } from "@/lib/types/scheduling";

interface DateTimeStepProps {
  selectedDoctorId: string;
  selectedLocationId: string;
  selectedServiceId: string;
  selectedDate: Date;
  selectedTime: string;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
}

/** Converts "HH:mm" → "HH:MM AM/PM" for display */
function formatTimeLabel(value: string): string {
  const [h, m] = value.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function DateTimeStep({
  selectedDoctorId,
  selectedLocationId,
  selectedServiceId,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
}: DateTimeStepProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlotInfo[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch real time slots from DB whenever doctor or date changes
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) {
      setAvailableSlots([]);
      return;
    }

    let cancelled = false;
    setIsLoadingSlots(true);
    setSlotsError("");

    getAvailableTimeSlots(
      selectedDoctorId,
      selectedDate,
      selectedLocationId,
      selectedServiceId,
    ).then((result) => {
      if (cancelled) return;
      if (result.success && result.data) {
        setAvailableSlots(result.data);
      } else {
        setSlotsError(result.error ?? "Failed to load time slots");
        setAvailableSlots([]);
      }
      setIsLoadingSlots(false);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedDoctorId, selectedDate, selectedLocationId, selectedServiceId]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold text-neutral-dark">
          Pick Date &amp; Time
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <Card className="p-10 rounded-[24px] border-neutral-gray bg-white shadow-md flex flex-col items-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateSelect(date)}
            disabled={(date) => date < today}
            className="w-full p-0"
            classNames={{
              months: "w-full",
              month: "w-full space-y-8",
              month_caption:
                "flex justify-between items-center h-12 w-full mb-8 relative",
              caption_label: "text-2xl font-black text-neutral-dark",
              nav: "flex items-center gap-3",
              button_previous: cn(
                "h-10 w-10 bg-white p-0 opacity-50 hover:opacity-100 transition-all rounded-full border border-neutral-gray flex items-center justify-center hover:bg-neutral-light shadow-sm",
              ),
              button_next: cn(
                "h-10 w-10 bg-white p-0 opacity-50 hover:opacity-100 transition-all rounded-full border border-neutral-gray flex items-center justify-center hover:bg-neutral-light shadow-sm",
              ),
              month_grid: "w-full border-collapse",
              weekdays: "flex w-full justify-between mb-6",
              weekday:
                "text-neutral-gray w-full font-bold text-[11px] uppercase tracking-[0.2em] text-center",
              week: "flex w-full mt-4 justify-between",
              day: cn(
                "h-12 w-12 p-0 font-bold aria-selected:opacity-100 rounded-xl transition-all hover:bg-secondary hover:text-white flex items-center justify-center text-base",
              ),
              day_button: "w-full h-full flex items-center justify-center",
              selected:
                "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)] scale-110 z-10",
              today: "text-primary border-2 border-primary/20",
              outside: "text-neutral-gray opacity-20",
              disabled: "text-neutral-gray cursor-not-allowed",
              hidden: "invisible",
            }}
          />
        </Card>

        {/* Time Slots */}
        <Card className="p-6 rounded-[24px] border-neutral-gray bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-4 h-4 text-primary" />
            <h4 className="text-lg font-bold text-neutral-dark">
              Available Slots
            </h4>
          </div>

          {!selectedDate ? (
            <EmptyPlaceholder
              icon={<CalendarIcon />}
              message="Please select a date first"
            />
          ) : isLoadingSlots ? (
            <div className="h-[280px] flex flex-col items-center justify-center gap-3 text-neutral-gray">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Loading available slots…</p>
            </div>
          ) : slotsError ? (
            <EmptyPlaceholder icon={<Clock />} message={slotsError} />
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-full pr-2 custom-scrollbar">
              {availableSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                const isBooked = slot.status === "booked";
                const isPast = slot.status === "past";
                const isDisabled = isBooked || isPast;

                return (
                  <button
                    key={slot.time}
                    onClick={() => !isDisabled && onTimeSelect(slot.time)}
                    disabled={isDisabled}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all text-xs font-bold relative overflow-hidden",
                      isSelected
                        ? "border-primary bg-primary text-white shadow-md"
                        : isDisabled
                          ? "border-neutral-gray/10 bg-neutral-light/30 text-neutral-gray/40 cursor-not-allowed"
                          : "border-neutral-gray bg-white text-neutral-dark hover:border-secondary hover:text-secondary",
                    )}
                  >
                    <span className={cn(isBooked && "opacity-40")}>
                      {formatTimeLabel(slot.time)}
                    </span>
                    {isBooked && (
                      <span className="absolute inset-0 flex items-center justify-center bg-red-50/10 text-[8px] uppercase tracking-tighter text-red-500 font-black rotate-[-15deg] pointer-events-none">
                        Occupied
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyPlaceholder
              icon={<Clock />}
              message="No slots available for this day"
            />
          )}
        </Card>
      </div>
    </div>
  );
}

function EmptyPlaceholder({
  icon,
  message,
}: {
  icon: React.ReactNode;
  message: string;
}) {
  return (
    <div className="h-[280px] flex flex-col items-center justify-center text-neutral-gray bg-neutral-light/50 rounded-[16px] border-2 border-dashed border-neutral-gray/30">
      <span className="w-12 h-12 mb-3 opacity-20 flex items-center justify-center [&>svg]:w-12 [&>svg]:h-12">
        {icon}
      </span>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
