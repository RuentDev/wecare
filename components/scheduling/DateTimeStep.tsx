"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { getAvailableSlots } from "@/lib/mock-data";

interface DateTimeStepProps {
  selectedDoctorId: string;
  selectedDate: string;
  selectedTime: string;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
}

export function DateTimeStep({
  selectedDoctorId,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
}: DateTimeStepProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const availableSlots = useMemo(() => {
    if (!selectedDoctorId || !selectedDate) return [];
    // Mock data uses 30 min slots
    return getAvailableSlots(selectedDoctorId, selectedDate, 30);
  }, [selectedDoctorId, selectedDate]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = [];

    // Adjust for Monday start (if desired, or keep Sunday)
    // The original code used 0-6 where 0 is Sunday.
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day,
      );
      const dateStr = date.toISOString().split("T")[0];
      const isDisabled = date < today;
      const isSelected = selectedDate === dateStr;

      days.push(
        <button
          key={day}
          onClick={() => !isDisabled && onDateSelect(dateStr)}
          disabled={isDisabled}
          className={`h-10 rounded-xl text-sm font-bold transition-all ${
            isDisabled
              ? "text-neutral-gray cursor-not-allowed opacity-30"
              : isSelected
                ? "bg-primary text-white shadow-lg scale-110 z-10"
                : "bg-neutral-light text-neutral-dark hover:bg-secondary hover:text-white"
          }`}
        >
          {day}
        </button>,
      );
    }

    return days;
  };

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
        <Card className="p-6 rounded-[24px] border-neutral-gray bg-white shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-bold text-neutral-dark">
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1,
                    ),
                  )
                }
                className="p-2 hover:bg-neutral-light rounded-full transition-colors border border-neutral-gray"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                    ),
                  )
                }
                className="p-2 hover:bg-neutral-light rounded-full transition-colors border border-neutral-gray"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-bold text-neutral-gray uppercase tracking-widest h-8 flex items-center justify-center"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
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
              <Calendar className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">Please select a date first</p>
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
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
