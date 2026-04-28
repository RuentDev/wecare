"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AvailabilityCalendarProps {
  timeSlots: any[];
  doctorId: string;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AvailabilityCalendar({ timeSlots, doctorId }: AvailabilityCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const selectedDay = date ? date.getDay() : -1;
  const daySlots = timeSlots.filter(slot => slot.day_of_week === selectedDay);

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
            onSelect={setDate}
            className="rounded-xl border-none"
            classNames={{
              day_selected: "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white rounded-xl font-bold",
              day_today: "bg-slate-100 text-slate-900 rounded-xl font-bold",
              day: "h-10 w-10 p-0 font-bold aria-selected:opacity-100 hover:bg-slate-50 rounded-xl transition-all",
            }}
          />
          <div className="mt-6 space-y-3 px-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span>Available</span>
              </div>
              <span className="font-bold text-slate-700">12 slots</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span>Partially Booked</span>
              </div>
              <span className="font-bold text-slate-700">4 slots</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Fully Booked</span>
              </div>
              <span className="font-bold text-slate-700">2 days</span>
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
            <p className="text-sm text-slate-500 font-medium mt-1">Configured availability for this day</p>
          </div>
          <Button variant="outline" className="rounded-xl border-slate-200 font-bold gap-2">
            <Plus className="w-4 h-4" /> Add Slot
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {daySlots.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Clock className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">No slots configured</h3>
              <p className="text-slate-500 mt-1 max-w-[280px] mx-auto">
                You haven't set any available hours for {date ? DAYS[selectedDay] : "this day"}.
              </p>
              <Button className="mt-6 rounded-xl font-bold">Configure Availability</Button>
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
                        {format(new Date(slot.start_time), "hh:mm a")} - {format(new Date(slot.end_time), "hh:mm a")}
                      </p>
                      <Badge className="mt-1 bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-black uppercase">
                         Available
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
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
                   <h4 className="font-bold text-slate-900">Weekly Schedule Pattern</h4>
                   <p className="text-sm text-slate-500 font-medium">This schedule repeats every {date ? DAYS[selectedDay] : "week"}.</p>
                 </div>
              </div>
              <Button variant="ghost" className="text-primary font-bold hover:bg-primary/10 gap-2 rounded-xl">
                 Edit Pattern <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
