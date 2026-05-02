"use client";

import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  LayoutDashboard,
  CalendarDays,
  BriefcaseMedical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DoctorInfoForm } from "./doctor-info-form";
import { DoctorDangerZone } from "./doctor-danger-zone";
import { DoctorAppointments } from "./doctor-appointments";
import { DoctorServicesManager } from "./doctor-services-manager";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EditDoctorClientProps {
  doctor?: any;
  locations: any[];
  allServices: any[];
}

export function EditDoctorClient({
  doctor,
  locations,
  allServices,
}: EditDoctorClientProps) {
  const isEditing = !!doctor;
  const doctorUser = doctor?.users;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full hover:bg-white/50"
          >
            <Link href="/admin/users/doctors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditing
                ? `Dr. ${doctorUser?.first_name} ${doctorUser?.last_name}`
                : "Register New Doctor"}
            </h1>
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-2">
            <Badge
              className={
                doctorUser?.is_active
                  ? "bg-success text-white px-3 py-1 rounded-full"
                  : "bg-destructive text-white px-3 py-1 rounded-full"
              }
            >
              {doctorUser?.is_active ? "Active Account" : "Inactive Account"}
            </Badge>
            <Badge
              className={cn(
                "px-3 py-1 rounded-full",
                doctor.is_available
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-red-500/10 text-red-500 border-red-500/20",
              )}
              variant="outline"
            >
              {doctor.is_available ? "Available" : "Unavailable"}
            </Badge>
          </div>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 h-10">
          <TabsTrigger
            value="profile"
            className="cursor-pointer px-5 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all gap-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            Information
          </TabsTrigger>
          {isEditing && (
            <>
              <TabsTrigger
                value="appointments"
                className="cursor-pointer px-5 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all gap-2"
              >
                <CalendarDays className="h-4 w-4" />
                Appointments
                {doctor.appointments?.length > 0 && (
                  <Badge className="ml-1 bg-white/20 text-white border-none text-[10px] h-4 px-1.5 min-w-4 flex justify-center">
                    {doctor.appointments.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="services"
                className="cursor-pointer px-5 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all gap-2"
              >
                <BriefcaseMedical className="h-4 w-4" />
                Managed Services
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <DoctorInfoForm doctor={doctor} locations={locations} />
          {/* {isEditing && <DoctorDangerZone doctor={doctor} />} */}
        </TabsContent>

        {isEditing && (
          <>
            <TabsContent value="appointments">
              <Card className="glassmorphism-card border-none overflow-hidden rounded-[24px]">
                <CardHeader className="bg-linear-to-r from-primary/5 to-transparent border-b border-white/20">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <CalendarDays className="w-5 h-5 text-primary" />{" "}
                    Appointment History
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <DoctorAppointments
                    appointments={doctor.appointments || []}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services">
              <DoctorServicesManager
                doctorId={doctor.id}
                allServices={allServices}
                currentServices={doctor.doctor_services || []}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
