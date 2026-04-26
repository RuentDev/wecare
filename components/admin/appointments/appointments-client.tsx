"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getColumns, AppointmentColumn } from "./columns";
import { AppointmentDetailsModal } from "./appointment-details-modal";
import { format } from "date-fns";
import { CalendarDays, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface AppointmentsClientProps {
  initialAppointments: any[];
}

export function AppointmentsClient({ initialAppointments }: AppointmentsClientProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleView = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const formattedData: AppointmentColumn[] = useMemo(() => {
    return initialAppointments.map((apt) => ({
      id: apt.id,
      patientName: `${apt.users?.first_name} ${apt.users?.last_name}`,
      doctorName: `${apt.doctors?.users?.first_name} ${apt.doctors?.users?.last_name}`,
      serviceName: apt.services?.name || "N/A",
      date: format(new Date(apt.appointment_date), "MMM dd, yyyy"),
      time: format(new Date(apt.start_time), "hh:mm a"),
      status: apt.status || "pending",
      raw: apt,
    }));
  }, [initialAppointments]);

  const filteredData = useMemo(() => {
    return formattedData.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesSearch = 
        item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [formattedData, statusFilter, searchQuery]);

  const columns = getColumns(handleView);

  return (
    <div className="space-y-6 animate-in-fade">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glassmorphism-card border-none shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Appointments</p>
              <h3 className="text-2xl font-bold">{initialAppointments.length}</h3>
            </div>
          </CardContent>
        </Card>

        {/* You could add more stats cards here if needed */}
      </div>

      <Card className="glassmorphism border-none shadow-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient, doctor, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/50 border-white/20 rounded-xl focus-visible:ring-primary/50"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Filter className="w-4 h-4" />
                Filter by:
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-white/50 border-white/20 rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="glassmorphism border-none shadow-xl">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DataTable 
            columns={columns} 
            data={filteredData} 
          />
        </CardContent>
      </Card>

      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
