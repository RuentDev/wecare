"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvailabilityCalendar } from "./availability-calendar";
import { UpcomingAppointments } from "./upcoming-appointments";
import { TelemedicineSection } from "./telemedicine-section";
import { Calendar, List, Video, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlockTimeDialog } from "./block-time-dialog";

interface ScheduleClientProps {
  data: any;
  doctorId: string;
}

export function ScheduleClient({ data, doctorId }: ScheduleClientProps) {
  const [activeTab, setActiveTab] = useState("calendar");
  const [isBlockTimeOpen, setIsBlockTimeOpen] = useState(false);

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
        <Button
          className="rounded-xl gap-2 shadow-lg shadow-primary/20"
          onClick={() => setIsBlockTimeOpen(true)}
        >
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
            locations={data.activeLocations}
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

      <BlockTimeDialog
        isOpen={isBlockTimeOpen}
        onOpenChange={setIsBlockTimeOpen}
        doctorId={doctorId}
        onSuccess={() => {
          // If we want to reload the calendar when blocked, we might just let it naturally re-fetch
          // or we can reload the window to be simple, since the calendar does its own fetch when active
          // The next time the calendar component remounts or the month changes it will fetch.
          // For immediate update we can dispatch a custom event or just let it be if it's acceptable.
          // Since it's a client component, `AvailabilityCalendar` has a fetch on mount and month change.
          // In a real app we might use a global state or React Context, but a simple reload works well for server components.
          window.location.reload();
        }}
      />
    </div>
  );
}
