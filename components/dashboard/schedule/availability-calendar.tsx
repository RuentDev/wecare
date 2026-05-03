"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Plus, Trash2, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { TimeSlotDialog } from "./time-slot-dialog";
import {
  getDoctorMonthlyStats,
  deleteTimeSlot,
} from "@/lib/actions/time-slots";
import { toast } from "sonner";

/** Format a UTC-stored time (@db.Time) as "hh:mm AM/PM" without timezone shift */
function formatTimeUTC(dateValue: string | Date): string {
  const d = new Date(dateValue);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}

interface AvailabilityCalendarProps {
  timeSlots: any[];
  doctorId: string;
  locations: any[];
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

export function AvailabilityCalendar({
  timeSlots: initialTimeSlots,
  doctorId,
  locations,
}: AvailabilityCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isSlotDialogOpen, setIsSlotDialogOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const [stats, setStats] = useState({ available: 0, partial: 0, full: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [timeSlots, setTimeSlots] = useState(initialTimeSlots);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Fetch monthly stats whenever the month changes
  const fetchMonthData = async (year: number, month: number) => {
    setIsLoadingStats(true);
    const result = await getDoctorMonthlyStats(doctorId, year, month);
    if (result.success && result.data) {
      setAppointments(result.data.appointments);
      setExceptions(result.data.exceptions);
      setTimeSlots(result.data.timeSlots);

      // Calculate Stats
      let availableSlots = 0;
      let partialDays = 0;
      let fullDays = 0;

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const currentDate = new Date(year, month, d);
        const dayOfWeek = currentDate.getDay();
        const dateStr = currentDate.toISOString().split("T")[0];

        // Check for full day exception
        const dayExceptions = result.data.exceptions.filter((e) =>
          e.date.startsWith(dateStr),
        );
        const isFullDayException = dayExceptions.some((e) => e.is_full_day);

        // Calculate total possible slots for this day from weekly template
        const slotsForDay = result.data.timeSlots.filter(
          (ts: any) => ts.day_of_week === dayOfWeek,
        );

        if (slotsForDay.length > 0) {
          if (isFullDayException) {
            fullDays++;
            continue; // No available slots today
          }

          // Count appointments on this day
          const dayAppointments = result.data.appointments.filter((a) =>
            a.appointment_date.startsWith(dateStr),
          );
          const bookedCount = dayAppointments.length;

          // Total slots is slotsForDay.length minus any partial day exceptions (omitted for simplicity, assume each slot is 1 appointment)
          const totalSlots = slotsForDay.length;
          const remainingSlots = Math.max(0, totalSlots - bookedCount);

          availableSlots += remainingSlots;

          if (bookedCount >= totalSlots) {
            fullDays++;
          } else if (bookedCount > 0) {
            partialDays++;
          }
        }
      }

      setStats({
        available: availableSlots,
        partial: partialDays,
        full: fullDays,
      });
    }
    setIsLoadingStats(false);
  };

  useEffect(() => {
    fetchMonthData(currentMonth.year, currentMonth.month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMonthChange = (newDate: Date) => {
    const month = newDate.getMonth();
    const year = newDate.getFullYear();
    if (month !== currentMonth.month || year !== currentMonth.year) {
      setCurrentMonth({ month, year });
      fetchMonthData(year, month);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    setIsDeleting(slotId);
    const res = await deleteTimeSlot(slotId);
    if (res.success) {
      toast.success("Time slot deleted");
      fetchMonthData(currentMonth.year, currentMonth.month);
    } else {
      toast.error(res.error || "Failed to delete time slot");
    }
    setIsDeleting(null);
  };

  const selectedDay = date ? date.getDay() : -1;
  const daySlots = timeSlots.filter((slot) => slot.day_of_week === selectedDay);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Calendar Card */}
      <Card className="border-none shadow-sm bg-white overflow-hidden lg:col-span-1 h-fit">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg font-bold">Select Date</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              if (d) {
                setDate(d);
                handleMonthChange(d);
              }
            }}
            onMonthChange={handleMonthChange}
            className="rounded-xl border-none"
            // classNames={{
            //   day_selected:
            //     "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white rounded-xl font-bold",
            //   day_today: "bg-slate-100 text-slate-900 rounded-xl font-bold",
            //   day: "h-10 w-10 p-0 font-bold aria-selected:opacity-100 hover:bg-slate-50 rounded-xl transition-all",
            // }}
          />
          <div className="mt-6 space-y-3 px-2 relative">
            {isLoadingStats && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-xl">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span>Available</span>
              </div>
              <span className="font-bold text-slate-700">
                {stats.available} slots
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span>Partially Booked</span>
              </div>
              <span className="font-bold text-slate-700">
                {stats.partial} days
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Fully Booked</span>
              </div>
              <span className="font-bold text-slate-700">
                {stats.full} days
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slots Detail Card */}
      <Card className="border-none shadow-sm bg-white overflow-hidden lg:col-span-2">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between p-6">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              {date ? format(date, "EEEE, MMMM do") : "Select a date"}
            </CardTitle>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Configured availability for this day
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-xl border-slate-200 font-bold gap-2"
            onClick={() => setIsSlotDialogOpen(true)}
          >
            <Plus className="w-4 h-4" /> Add Slot
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {daySlots.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Clock className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">
                No slots configured
              </h3>
              <p className="text-slate-500 mt-1 max-w-[280px] mx-auto">
                You haven't set any available hours for{" "}
                {date ? DAYS[selectedDay] : "this day"}.
              </p>
              <Button
                className="mt-6 rounded-xl font-bold"
                onClick={() => setIsSlotDialogOpen(true)}
              >
                Configure Availability
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {daySlots.map((slot: any) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:bg-white hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-primary">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {formatTimeUTC(slot.start_time)} -{" "}
                        {formatTimeUTC(slot.end_time)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-black uppercase">
                          Available
                        </Badge>
                        {slot.locations && (
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            • {slot.locations.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => handleDeleteSlot(slot.id)}
                      disabled={isDeleting === slot.id}
                    >
                      {isDeleting === slot.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {daySlots.length > 0 && (
            <div className="mt-12 p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">
                    Weekly Schedule Pattern
                  </h4>
                  <p className="text-sm text-slate-500 font-medium">
                    This schedule repeats every{" "}
                    {date ? DAYS[selectedDay] : "week"}.
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-primary font-bold hover:bg-primary/10 gap-2 rounded-xl"
                onClick={() => setIsSlotDialogOpen(true)}
              >
                Edit Pattern <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <TimeSlotDialog
        isOpen={isSlotDialogOpen}
        onOpenChange={setIsSlotDialogOpen}
        doctorId={doctorId}
        locations={locations}
        initialDayOfWeek={selectedDay !== -1 ? selectedDay : undefined}
        onSuccess={() => fetchMonthData(currentMonth.year, currentMonth.month)}
      />
    </div>
  );
}
