"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockAppointments, mockDoctors, mockPatients } from "@/lib/mock-data";
import {
  Calendar,
  Users,
  AlertCircle,
  Bell,
  Search,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertOctagon,
} from "lucide-react";
import Link from "next/link";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");

  // Get today's date
  const today = new Date();
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Get today's appointments
  const todayAppointments = mockAppointments
    .filter((apt) => new Date(apt.date).toDateString() === today.toDateString())
    .sort((a, b) => a.time.localeCompare(b.time));

  // Get all scheduled appointments for patient status
  const scheduledAppointments = mockAppointments
    .filter((apt) => apt.status !== "cancelled")
    .slice(0, 5);

  // Filter appointments by search
  const filteredAppointments = scheduledAppointments.filter((apt) => {
    const patient = mockPatients.find((p) => p.id === apt.patientId);
    return patient?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const stats = [
    {
      icon: <Calendar className="w-6 h-6" />,
      label: "Total Appointments",
      value: mockAppointments.length,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: "New Patients",
      value: Math.floor(mockPatients.length * 0.3),
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      label: "Pending Requests",
      value: 12,
      bgColor: "bg-pink-100",
      iconColor: "text-pink-600",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
            <Clock className="w-3 h-3" /> IN-ROOM
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" /> COMPLETED
          </span>
        );
      case "waiting":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
            WAITING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-700">
            <AlertOctagon className="w-3 h-3" /> URGENT
          </span>
        );
    }
  };

  return (
    <div className="p-8">
      {/* Header with Doctor Profile */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark">
            Doctor Dashboard
          </h1>
          <p className="text-neutral-gray mt-1">
            {dateFormatter.format(today)}
          </p>
        </div>

        {/* Doctor Profile & Notifications */}
        <div className="flex items-center gap-6">
          <button className="relative p-2 hover:bg-neutral-light rounded-lg transition-colors">
            <Bell className="w-6 h-6 text-neutral-dark" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-3 pl-6 border-l border-neutral-gray">
            <div className="text-right">
              <p className="font-semibold text-neutral-dark">
                {user?.name || "Dr. Julian Thorne"}
              </p>
              <p className="text-xs text-neutral-gray">Senior Oncologist</p>
            </div>
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-white font-bold">JT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <Card
            key={idx}
            className="rounded-[12px] p-6 bg-white border border-neutral-gray"
          >
            <div className="flex items-center gap-4">
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <div className={stat.iconColor}>{stat.icon}</div>
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-gray uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-neutral-dark mt-1">
                  {String(stat.value).padStart(2, "0")}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Daily Agenda */}
        <div className="lg:col-span-1">
          <Card className="rounded-[12px] p-6 bg-white border border-neutral-gray">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-neutral-dark">
                Daily Agenda
              </h2>
              <Link
                href="/admin/appointments"
                className="text-primary text-xs font-semibold hover:underline"
              >
                VIEW ALL
              </Link>
            </div>

            <div className="space-y-4">
              {todayAppointments.length > 0 ? (
                todayAppointments.map((apt) => {
                  const patient = mockPatients.find(
                    (p) => p.id === apt.patientId,
                  );
                  const doctor = mockDoctors.find((d) => d.id === apt.doctorId);
                  return (
                    <div
                      key={apt.id}
                      className="flex gap-4 pb-4 border-b border-neutral-gray last:border-0"
                    >
                      <div>
                        <p className="text-sm font-bold text-primary">
                          {apt.time}
                        </p>
                        <p className="text-xs text-neutral-gray">AM</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-neutral-dark">
                          {patient?.name}
                        </p>
                        <p className="text-xs text-neutral-gray">
                          {/* {apt.service} */}
                        </p>
                        <button className="text-blue-600 mt-2">
                          <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          </div>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-8 h-8 text-neutral-gray mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-neutral-gray">
                    No appointments today
                  </p>
                </div>
              )}
              {todayAppointments.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-neutral-gray">
                    11:00 AM - No Appointments
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Patient Status Monitor */}
        <div className="lg:col-span-2">
          <Card className="rounded-[12px] p-6 bg-white border border-neutral-gray">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-neutral-dark">
                Patient Status Monitor
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-gray" />
                  <Input
                    type="text"
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-neutral-gray focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-gray">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-dark">
                      Patient Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-dark">
                      ID Number
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-dark">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-dark">
                      Time
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-neutral-dark">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((apt) => {
                    const patient = mockPatients.find(
                      (p) => p.id === apt.patientId,
                    );
                    const initials =
                      patient?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("") || "P";
                    return (
                      <tr
                        key={apt.id}
                        className="border-b border-neutral-gray hover:bg-neutral-light transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
                              <span className="text-xs font-semibold text-blue-700">
                                {initials}
                              </span>
                            </div>
                            <span className="font-medium text-neutral-dark">
                              {patient?.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-neutral-dark font-mono">
                          #{1000 + Math.floor(Math.random() * 9000)}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(apt.status)}
                        </td>
                        <td className="py-3 px-4 text-neutral-dark">
                          {apt.time}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button className="p-2 hover:bg-neutral-light rounded transition-colors">
                            <MoreVertical className="w-4 h-4 text-neutral-gray" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Link
              href="/admin/appointments"
              className="inline-block mt-4 text-primary text-sm font-semibold hover:underline"
            >
              LOAD FULL PATIENT DIRECTORY →
            </Link>
          </Card>
        </div>
      </div>

      {/* Clinic Performance */}
      <Card className="rounded-[12px] p-6 bg-white border border-neutral-gray">
        <h2 className="text-lg font-bold text-neutral-dark mb-2">
          Clinic Performance
        </h2>
        <p className="text-sm text-neutral-gray mb-6">
          Patient satisfaction up by 12% this week.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chart Placeholder */}
          <div className="md:col-span-1 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg p-6 flex items-end justify-around h-40">
            <div className="w-8 bg-blue-200 h-16 rounded-t"></div>
            <div className="w-8 bg-blue-200 h-20 rounded-t"></div>
            <div className="w-8 bg-primary h-28 rounded-t"></div>
            <div className="w-8 bg-blue-200 h-24 rounded-t"></div>
            <div className="w-8 bg-blue-200 h-18 rounded-t"></div>
          </div>

          {/* EHR Updates */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <p className="font-semibold text-neutral-dark">EHR Updates</p>
              <p className="text-sm text-neutral-gray">
                4 records require signing
              </p>
            </div>
          </div>

          {/* Lab Results */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🧪</span>
            </div>
            <div>
              <p className="font-semibold text-neutral-dark">Lab Results</p>
              <p className="text-sm text-neutral-gray">
                2 critical findings ready
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
