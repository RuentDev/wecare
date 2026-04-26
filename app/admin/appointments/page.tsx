"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockAppointments, mockDoctors, mockServices } from "@/lib/mock-data";
import { Search } from "lucide-react";

export default function AppointmentsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "scheduled" | "completed" | "cancelled"
  >("all");

  const filteredAppointments = mockAppointments.filter((apt) => {
    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;
    const matchesSearch = apt.id.includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <main className="min-h-full bg-neutral-light">
      {/* Filters */}
      <Card className="rounded-[12px] p-6 bg-white border border-neutral-gray mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-gray" />
            <input
              type="text"
              placeholder="Search by appointment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-[12px] border border-neutral-gray focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {["all", "scheduled", "completed", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-2 rounded-[12px] font-medium transition-colors capitalize ${
                  filterStatus === status
                    ? "bg-primary text-white"
                    : "bg-neutral-light text-neutral-dark hover:bg-neutral-gray"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Appointments Table */}
      <Card className="rounded-[12px] overflow-hidden bg-white border border-neutral-gray">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-light border-b border-neutral-gray">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-neutral-dark">
                  ID
                </th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-dark">
                  Date
                </th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-dark">
                  Time
                </th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-dark">
                  Doctor
                </th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-dark">
                  Service
                </th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-dark">
                  Status
                </th>
                <th className="text-left py-4 px-6 font-semibold text-neutral-dark">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    className="border-b border-neutral-gray hover:bg-neutral-light transition-colors"
                  >
                    <td className="py-4 px-6 text-neutral-dark font-mono text-xs">
                      {apt.id}
                    </td>
                    <td className="py-4 px-6 text-neutral-dark">
                      {new Date(apt.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-neutral-dark">{apt.time}</td>
                    <td className="py-4 px-6 text-neutral-dark">
                      {mockDoctors.find((d) => d.id === apt.doctorId)?.name}
                    </td>
                    <td className="py-4 px-6 text-neutral-dark">
                      {mockServices.find((s) => s.id === apt.serviceId)?.name}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          apt.status === "scheduled"
                            ? "bg-blue-100 text-primary"
                            : apt.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-[12px]"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 px-6 text-center text-neutral-gray"
                  >
                    No appointments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}
