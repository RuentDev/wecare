"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { getAvailableSlots } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface DateTimeStepProps {
  selectedDoctorId: string;
  selectedDate: Date;
  selectedTime: string;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
}

export function DateTimeStep({
  selectedDoctorId,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
}: DateTimeStepProps) {
  const availableSlots = useMemo(() => {
    if (!selectedDoctorId || !selectedDate) return [];
    return getAvailableSlots(selectedDoctorId, selectedDate, 30);
  }, [selectedDoctorId, selectedDate]);

  // Define display times (mapping to HH:mm)
  const timeSlots = [
    { label: "09:00 AM", value: "09:00" },
    { label: "09:30 AM", value: "09:30" },
    { label: "10:00 AM", value: "10:00" },
    { label: "10:30 AM", value: "10:30" },
    { label: "11:00 AM", value: "11:00" },
    { label: "11:30 AM", value: "11:30" },
    { label: "01:00 PM", value: "13:00" },
    { label: "01:30 PM", value: "13:30" },
    { label: "02:00 PM", value: "14:00" },
    { label: "02:30 PM", value: "14:30" },
    { label: "03:00 PM", value: "15:00" },
    { label: "03:30 PM", value: "15:30" },
    { label: "04:00 PM", value: "16:00" },
    { label: "04:30 PM", value: "16:30" },
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold text-neutral-dark">
          Pick Date & Time
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card className="p-8 rounded-[32px] border-neutral-gray bg-white shadow-sm flex flex-col items-center">
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
            <div className="h-[280px] flex flex-col items-center justify-center text-neutral-gray bg-neutral-light/50 rounded-[16px] border-2 border-dashed border-neutral-gray/30">
              <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">Please select a date first</p>
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
              {timeSlots.map((slot) => {
                const isAvailable = availableSlots.includes(slot.value);
                const isSelected = selectedTime === slot.value;

                return (
                  <button
                    key={slot.value}
                    onClick={() => isAvailable && onTimeSelect(slot.value)}
                    disabled={!isAvailable}
                    className={`p-3 rounded-xl border-2 transition-all text-xs font-bold ${
                      isSelected
                        ? "border-primary bg-primary text-white shadow-md"
                        : isAvailable
                          ? "border-neutral-gray bg-white text-neutral-dark hover:border-secondary hover:text-secondary"
                          : "border-neutral-gray bg-neutral-light text-neutral-gray opacity-30 cursor-not-allowed"
                    }`}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="h-[280px] flex flex-col items-center justify-center text-neutral-gray bg-neutral-light/50 rounded-[16px] border-2 border-dashed border-neutral-gray/30">
              <Clock className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">
                No slots available for this day
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
