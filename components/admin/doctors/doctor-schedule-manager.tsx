"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import {
  Clock,
  Plus,
  Trash2,
  CalendarDays,
  CalendarOff,
  MapPin,
  Calendar as CalendarIcon,
  CheckCircle2,
  Loader2,
  AlertCircle,
  LayoutGrid,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleSlotDialog } from "./schedule-slot-dialog";
import { ScheduleExceptionDialog } from "./schedule-exception-dialog";
import {
  deleteTimeSlot,
  deleteBlockedTime,
  getDoctorMonthlyStats,
} from "@/lib/actions/time-slots";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ClinicLocation } from "@/lib/types/locations";
import type {
  DoctorTimeSlot,
  DoctorScheduleException,
  SerializedAppointmentSlot,
} from "@/lib/types/scheduling";

/** Format a UTC-stored time (@db.Time) as "hh:mm AM/PM" without timezone shift */
function formatTimeUTC(dateValue: string | Date): string {
  const d = new Date(dateValue);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}

const ORDERED_DAYS = [
  { index: 1, name: "Monday" },
  { index: 2, name: "Tuesday" },
  { index: 3, name: "Wednesday" },
  { index: 4, name: "Thursday" },
  { index: 5, name: "Friday" },
  { index: 6, name: "Saturday" },
  { index: 0, name: "Sunday" },
];

interface DoctorScheduleManagerProps {
  doctorId: string;
  initialTimeSlots?: DoctorTimeSlot[];
  initialExceptions?: DoctorScheduleException[];
  locations: ClinicLocation[];
}

export function DoctorScheduleManager({
  doctorId,
  initialTimeSlots = [],
  initialExceptions = [],
  locations,
}: DoctorScheduleManagerProps) {
  const [timeSlots, setTimeSlots] = useState<DoctorTimeSlot[]>(initialTimeSlots);
  const [exceptions, setExceptions] = useState<DoctorScheduleException[]>(
    initialExceptions,
  );
  const [appointments, setAppointments] = useState<SerializedAppointmentSlot[]>(
    [],
  );

  // Active view tab inside schedule manager
  const [activeTab, setActiveTab] = useState<"matrix" | "calendar">("matrix");

  // Dialog states
  const [isSlotDialogOpen, setIsSlotDialogOpen] = useState(false);
  const [isExceptionDialogOpen, setIsExceptionDialogOpen] = useState(false);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number | undefined>(
    1,
  );
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(
    new Date(),
  );

  // Action loaders
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);
  const [deletingExceptionId, setDeletingExceptionId] = useState<string | null>(
    null,
  );
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);

  // Current calendar month view
  const [calendarMonth, setCalendarMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });

  // Fetch month data (appointments, exceptions, slots)
  const fetchMonthData = useCallback(
    async (year: number, month: number) => {
      setIsLoadingMonth(true);
      try {
        const res = await getDoctorMonthlyStats(doctorId, year, month);
        if (res.success && res.data) {
          setAppointments(res.data.appointments);
          setExceptions(res.data.exceptions);
          setTimeSlots(res.data.timeSlots);
        }
      } catch (err) {
        console.error("[FETCH_MONTH_DATA]", err);
      } finally {
        setIsLoadingMonth(false);
      }
    },
    [doctorId],
  );

  useEffect(() => {
    fetchMonthData(calendarMonth.year, calendarMonth.month);
  }, [calendarMonth, fetchMonthData]);

  // Handle Month Change in calendar
  const handleMonthChange = (newDate: Date) => {
    const year = newDate.getFullYear();
    const month = newDate.getMonth();
    setCalendarMonth({ year, month });
  };

  // Open Add Slot Dialog for a specific day
  const handleOpenAddSlot = (dayIndex?: number) => {
    setSelectedDayOfWeek(dayIndex !== undefined ? dayIndex : 1);
    setIsSlotDialogOpen(true);
  };

  // Delete a recurring time slot
  const handleDeleteSlot = async (slotId: string) => {
    setDeletingSlotId(slotId);
    try {
      const res = await deleteTimeSlot(slotId);
      if (res.success) {
        toast.success("Shift slot removed");
        setTimeSlots((prev) => prev.filter((s) => s.id !== slotId));
        fetchMonthData(calendarMonth.year, calendarMonth.month);
      } else {
        toast.error(res.error || "Failed to remove time slot");
      }
    } catch {
      toast.error("Failed to remove time slot");
    } finally {
      setDeletingSlotId(null);
    }
  };

  // Delete a blocked time exception
  const handleDeleteException = async (exceptionId: string) => {
    setDeletingExceptionId(exceptionId);
    try {
      const res = await deleteBlockedTime(exceptionId);
      if (res.success) {
        toast.success("Schedule blackout removed");
        setExceptions((prev) => prev.filter((e) => e.id !== exceptionId));
        fetchMonthData(calendarMonth.year, calendarMonth.month);
      } else {
        toast.error(res.error || "Failed to remove blackout exception");
      }
    } catch {
      toast.error("Failed to remove blackout exception");
    } finally {
      setDeletingExceptionId(null);
    }
  };

  // Group slots by day_of_week
  const slotsByDay = useMemo(() => {
    const map = new Map<number, DoctorTimeSlot[]>();
    for (let i = 0; i < 7; i++) {
      map.set(i, []);
    }
    timeSlots.forEach((slot) => {
      const day = slot.day_of_week ?? 0;
      const current = map.get(day) || [];
      current.push(slot);
      map.set(day, current);
    });
    return map;
  }, [timeSlots]);

  // Calculate stats for current month
  const monthStats = useMemo(() => {
    let totalAvailableSlots = 0;
    const daysInMonth = new Date(
      calendarMonth.year,
      calendarMonth.month + 1,
      0,
    ).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const currentDate = new Date(calendarMonth.year, calendarMonth.month, d);
      const dayOfWeek = currentDate.getDay();
      const dateStr = currentDate.toISOString().split("T")[0];

      // Check full day exception
      const dayExceptions = exceptions.filter((e) =>
        typeof e.date === "string"
          ? e.date.startsWith(dateStr)
          : e.date.toISOString().startsWith(dateStr),
      );
      if (dayExceptions.some((e) => e.is_full_day)) continue;

      const dailyTemplateSlots = slotsByDay.get(dayOfWeek) || [];
      const dayAppointments = appointments.filter((a) =>
        a.appointment_date.startsWith(dateStr),
      );

      const remaining = Math.max(
        0,
        dailyTemplateSlots.length - dayAppointments.length,
      );
      totalAvailableSlots += remaining;
    }

    return {
      totalSlots: timeSlots.length,
      activeDaysCount: Array.from(slotsByDay.values()).filter(
        (slots) => slots.length > 0,
      ).length,
      monthAvailableSlots: totalAvailableSlots,
      blackoutsCount: exceptions.length,
    };
  }, [calendarMonth, exceptions, slotsByDay, appointments, timeSlots.length]);

  // Check details for selected calendar date
  const selectedDateStr = selectedCalendarDate
    ? selectedCalendarDate.toISOString().split("T")[0]
    : "";
  const selectedDateExceptions = exceptions.filter((e) =>
    typeof e.date === "string"
      ? e.date.startsWith(selectedDateStr)
      : e.date.toISOString().startsWith(selectedDateStr),
  );
  const selectedDaySlots = selectedCalendarDate
    ? slotsByDay.get(selectedCalendarDate.getDay()) || []
    : [];
  const selectedDateAppointments = appointments.filter((a) =>
    a.appointment_date.startsWith(selectedDateStr),
  );

  return (
    <div className="space-y-6">
      {/* Top Action Bar & Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glassmorphism-card border-none rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Recurring Shifts
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {monthStats.totalSlots}
              </p>
            </div>
          </div>
        </Card>

        <Card className="glassmorphism-card border-none rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Working Days / Wk
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {monthStats.activeDaysCount} <span className="text-xs font-normal text-muted-foreground">/ 7 days</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="glassmorphism-card border-none rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Est. Monthly Capacity
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {monthStats.monthAvailableSlots}
              </p>
            </div>
          </div>
        </Card>

        <Card className="glassmorphism-card border-none rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <CalendarOff className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Recorded Leaves
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {monthStats.blackoutsCount}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Container with View Switcher */}
      <Card className="glassmorphism-card border-none overflow-hidden rounded-[24px]">
        <CardHeader className="bg-linear-to-r from-primary/5 to-transparent border-b border-white/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock className="w-5 h-5 text-primary" />
              Practitioner Clinic Schedule
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5 font-medium">
              Configure weekly recurring working shifts, clinic facilities, and manage leave blackouts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as "matrix" | "calendar")}
              className="w-auto"
            >
              <TabsList className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 h-9 p-0.5">
                <TabsTrigger
                  value="matrix"
                  className="rounded-lg text-xs font-semibold px-3 h-8 cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-white gap-1.5"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Weekly Matrix
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="rounded-lg text-xs font-semibold px-3 h-8 cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-white gap-1.5"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  Monthly Calendar
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              onClick={() => handleOpenAddSlot(1)}
              className="rounded-xl text-xs font-semibold gap-1.5 cursor-pointer shadow-sm"
              size="sm"
            >
              <Plus className="w-4 h-4" /> Add Clinic Shift
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* VIEW 1: WEEKLY SHIFT MATRIX */}
          {activeTab === "matrix" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {ORDERED_DAYS.map((day) => {
                  const daySlots = slotsByDay.get(day.index) || [];
                  const hasSlots = daySlots.length > 0;

                  return (
                    <div
                      key={day.index}
                      className={cn(
                        "rounded-2xl p-4 border transition-all flex flex-col justify-between",
                        hasSlots
                          ? "bg-white/40 dark:bg-slate-900/40 border-primary/20 shadow-xs"
                          : "bg-muted/10 border-white/10 opacity-80",
                      )}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">
                              {day.name}
                            </span>
                            {hasSlots && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] h-5 px-1.5 bg-primary/10 text-primary border-primary/20 font-bold"
                              >
                                {daySlots.length} {daySlots.length === 1 ? "shift" : "shifts"}
                              </Badge>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                            onClick={() => handleOpenAddSlot(day.index)}
                            title={`Add shift on ${day.name}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        {/* List of Shifts for this Day */}
                        {hasSlots ? (
                          <div className="space-y-2">
                            {daySlots.map((slot) => (
                              <div
                                key={slot.id}
                                className="group/slot flex items-center justify-between p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-white/20 hover:border-primary/30 transition-all text-xs"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                                    <Clock className="w-3 h-3 text-primary shrink-0" />
                                    <span>
                                      {formatTimeUTC(slot.start_time)} -{" "}
                                      {formatTimeUTC(slot.end_time)}
                                    </span>
                                  </div>

                                  {slot.locations && (
                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                                      <MapPin className="w-3 h-3 text-primary/70 shrink-0" />
                                      <span className="truncate max-w-[130px]">
                                        {slot.locations.name}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover/slot:opacity-100 transition-opacity cursor-pointer shrink-0"
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  disabled={deletingSlotId === slot.id}
                                  title="Delete shift"
                                >
                                  {deletingSlotId === slot.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-6 flex flex-col items-center justify-center text-center space-y-1 text-muted-foreground">
                            <Clock className="w-6 h-6 stroke-1 opacity-40 mb-1" />
                            <p className="text-xs font-medium">No shifts configured</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[11px] h-7 rounded-lg mt-2 font-semibold border-dashed cursor-pointer"
                              onClick={() => handleOpenAddSlot(day.index)}
                            >
                              + Add Working Hours
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: MONTHLY CALENDAR & BLACKOUT EXCEPTIONS */}
          {activeTab === "calendar" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar Column */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="glassmorphism border-none rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3 px-2">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      Select Calendar Date
                    </h4>
                    {isLoadingMonth && (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    )}
                  </div>

                  <Calendar
                    mode="single"
                    selected={selectedCalendarDate}
                    onSelect={(d) => {
                      if (d) {
                        setSelectedCalendarDate(d);
                        handleMonthChange(d);
                      }
                    }}
                    onMonthChange={handleMonthChange}
                    className="rounded-2xl border-none p-0"
                  />

                  <div className="mt-4 pt-3 border-t border-white/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Available Shifts Configured
                      </span>
                      <span className="font-bold text-foreground">
                        {monthStats.totalSlots}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Leaves / Blackouts
                      </span>
                      <span className="font-bold text-foreground">
                        {exceptions.length}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4 rounded-xl text-xs font-semibold gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 cursor-pointer"
                    onClick={() => setIsExceptionDialogOpen(true)}
                  >
                    <CalendarOff className="w-3.5 h-3.5" />
                    Record Doctor Leave / Blackout
                  </Button>
                </Card>
              </div>

              {/* Day Breakdown & Active Exceptions Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Selected Date Summary */}
                <Card className="glassmorphism border-none rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <h4 className="font-bold text-lg text-foreground flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-primary" />
                        {selectedCalendarDate
                          ? format(selectedCalendarDate, "EEEE, MMMM do, yyyy")
                          : "Select Date"}
                      </h4>
                      <p className="text-xs text-muted-foreground font-medium">
                        Schedule details and capacity for this day.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedDateExceptions.length > 0 ? (
                        <Badge variant="destructive" className="rounded-full text-xs gap-1 font-semibold">
                          <CalendarOff className="w-3 h-3" /> Blocked / On Leave
                        </Badge>
                      ) : selectedDaySlots.length > 0 ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-full text-xs font-semibold">
                          Working Day ({selectedDaySlots.length} shifts)
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-full text-xs font-semibold">
                          Off Day
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Day Status Details */}
                  {selectedDateExceptions.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs space-y-2">
                      <div className="font-bold text-destructive flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        Active Blackout / Leave Exception
                      </div>
                      {selectedDateExceptions.map((exc) => (
                        <div
                          key={exc.id}
                          className="flex items-center justify-between bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-lg border border-destructive/20"
                        >
                          <div>
                            <p className="font-semibold text-foreground">
                              {exc.reason || "Doctor Unavailable"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {exc.is_full_day
                                ? "Full day unavailable"
                                : `Blocked from ${exc.start_time ? formatTimeUTC(exc.start_time) : ""} to ${exc.end_time ? formatTimeUTC(exc.end_time) : ""}`}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/20 rounded-lg cursor-pointer"
                            onClick={() => handleDeleteException(exc.id)}
                            disabled={deletingExceptionId === exc.id}
                            title="Remove exception"
                          >
                            {deletingExceptionId === exc.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Configured Shifts for Selected Day */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Configured Working Hours
                    </h5>
                    {selectedDaySlots.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic py-2">
                        No recurring shifts configured for this day of the week.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedDaySlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/20 flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3 text-primary" />
                                {formatTimeUTC(slot.start_time)} -{" "}
                                {formatTimeUTC(slot.end_time)}
                              </p>
                              {slot.locations && (
                                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-primary/70" />
                                  {slot.locations.name} ({slot.locations.city})
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                              onClick={() => handleDeleteSlot(slot.id)}
                              disabled={deletingSlotId === slot.id}
                            >
                              {deletingSlotId === slot.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Booked Appointments for Selected Date */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Booked Patient Visits ({selectedDateAppointments.length})
                      </h5>
                    </div>
                    {selectedDateAppointments.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic py-2">
                        No patient appointments scheduled for this date.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedDateAppointments.map((apt, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between text-xs font-medium"
                          >
                            <span className="flex items-center gap-1.5 text-foreground font-semibold">
                              <Clock className="w-3.5 h-3.5 text-primary" />
                              {formatTimeUTC(apt.start_time)} -{" "}
                              {formatTimeUTC(apt.end_time)}
                            </span>
                            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                              Booked Slot
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                {/* All Active Exceptions / Leave Schedule Table */}
                <Card className="glassmorphism border-none rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        <CalendarOff className="w-4 h-4 text-destructive" />
                        Upcoming Leaves & Blackout Dates ({exceptions.length})
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Dates where this practitioner is unavailable.
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs font-semibold gap-1.5 cursor-pointer border-destructive/20 text-destructive hover:bg-destructive/10"
                      onClick={() => setIsExceptionDialogOpen(true)}
                    >
                      <Plus className="w-3.5 h-3.5" /> Record Leave
                    </Button>
                  </div>

                  {exceptions.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-3 text-center bg-muted/10 rounded-xl">
                      No leave blackouts or exceptions recorded for this practitioner.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {exceptions.map((exc) => {
                        const dateFormatted =
                          typeof exc.date === "string"
                            ? exc.date.split("T")[0]
                            : exc.date.toISOString().split("T")[0];

                        return (
                          <div
                            key={exc.id}
                            className="p-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/20 flex items-center justify-between text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground">
                                  {dateFormatted}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] bg-destructive/10 text-destructive border-destructive/20 font-semibold"
                                >
                                  {exc.is_full_day ? "Full Day" : "Partial Day"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground font-medium">
                                {exc.reason || "Doctor Unavailable"}
                              </p>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                              onClick={() => handleDeleteException(exc.id)}
                              disabled={deletingExceptionId === exc.id}
                              title="Delete blackout"
                            >
                              {deletingExceptionId === exc.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Slot Dialog */}
      <ScheduleSlotDialog
        isOpen={isSlotDialogOpen}
        onOpenChange={setIsSlotDialogOpen}
        doctorId={doctorId}
        locations={locations}
        initialDayOfWeek={selectedDayOfWeek}
        onSuccess={() => fetchMonthData(calendarMonth.year, calendarMonth.month)}
      />

      {/* Add Exception / Blackout Dialog */}
      <ScheduleExceptionDialog
        isOpen={isExceptionDialogOpen}
        onOpenChange={setIsExceptionDialogOpen}
        doctorId={doctorId}
        initialDate={selectedCalendarDate}
        onSuccess={() => fetchMonthData(calendarMonth.year, calendarMonth.month)}
      />
    </div>
  );
}
