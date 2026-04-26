"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  status: string;
  patient_first_name: string;
  patient_last_name: string;
  service_name: string;
}

interface CalendarProps {
  date: Date;
}

export function Calendar({ date }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (date) {
      fetchAppointments(date);
    }
  }, [date]);

  const fetchAppointments = async (date: Date) => {
    setIsLoading(true);
    try {
      const dateStr = date.toISOString().split("T")[0];
      const response = await fetch(`/api/appointments?date=${dateStr}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const disabledDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    no_show: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="flex gap-5">
      {/* Calendar */}
      <div className="flex justify-center">
        {selectedDate && (
          <CalendarUI
            mode="single"
            selected={selectedDate}
            disabled={disabledDates}
            onSelect={setSelectedDate}
            classNames={{
              root: "rounded-none",
              week: "flex justify-between",
              day: "flex items-center justify-center h-15 w-15",
              day_button: "!rounded-none !bg-none",
            }}
          />
        )}
      </div>

      <div>
        <h3
          className="font-semibold text-foreground mb-4"
          suppressHydrationWarning
        >
          {selectedDate?.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : appointments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No appointments for this day
          </p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-primary">
                    {formatTime(apt.start_time)}
                  </span>
                  <Badge
                    className={
                      statusColors[apt.status as keyof typeof statusColors]
                    }
                  >
                    {apt.status}
                  </Badge>
                </div>
                <p className="font-medium text-foreground">
                  {apt.patient_first_name} {apt.patient_last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {apt.service_name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
