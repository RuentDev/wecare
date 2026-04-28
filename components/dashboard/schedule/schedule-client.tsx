"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvailabilityCalendar } from "./availability-calendar";
import { UpcomingAppointments } from "./upcoming-appointments";
import { TelemedicineSection } from "./telemedicine-section";
import { Calendar, List, Video, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScheduleClientProps {
  data: any;
  doctorId: string;
}

export function ScheduleClient({ data, doctorId }: ScheduleClientProps) {
  const [activeTab, setActiveTab] = useState("calendar");

  return (
    <div className="space-y-8 animate-in-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Appointment & Schedule
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Manage your clinical availability and monitor upcoming visits.
          </p>
        </div>
        <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" /> Block Time Slot
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm h-14">
          <TabsTrigger
            value="calendar"
            className="rounded-xl px-8 h-12 data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all gap-2"
          >
            <Calendar className="w-4 h-4" /> Availability Calendar
          </TabsTrigger>
          <TabsTrigger
            value="list"
            className="rounded-xl px-8 h-12 data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all gap-2"
          >
            <List className="w-4 h-4" /> Appointment List
          </TabsTrigger>
          <TabsTrigger
            value="telemed"
            className="rounded-xl px-8 h-12 data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all gap-2"
          >
            <Video className="w-4 h-4" /> Telemedicine
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="outline-none">
          <AvailabilityCalendar
            timeSlots={data.timeSlots}
            doctorId={doctorId}
          />
        </TabsContent>

        <TabsContent value="list" className="outline-none">
          <UpcomingAppointments
            today={data.todayAppointments}
            upcoming={data.upcomingAppointments}
          />
        </TabsContent>

        <TabsContent value="telemed" className="outline-none">
          <TelemedicineSection
            appointments={[
              ...data.todayAppointments,
              ...data.upcomingAppointments,
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
