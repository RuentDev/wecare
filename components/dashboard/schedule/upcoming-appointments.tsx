"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Search, 
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UpcomingAppointmentsProps {
  today: any[];
  upcoming: any[];
}

export function UpcomingAppointments({ today, upcoming }: UpcomingAppointmentsProps) {
  const AppointmentCard = ({ apt }: { apt: any }) => (
    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all group overflow-hidden">
      <CardContent className="p-0 flex">
        <div className={cn(
          "w-2 transition-colors",
          apt.status === "confirmed" ? "bg-blue-500" : 
          apt.status === "completed" ? "bg-emerald-500" : "bg-slate-200"
        )}></div>
        <div className="p-5 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="text-center min-w-[70px] py-2 px-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                {format(new Date(apt.appointment_date), "MMM dd")}
              </p>
              <p className="text-lg font-black text-slate-900 leading-none">
                {format(new Date(apt.start_time), "hh:mm")}
              </p>
              <p className="text-[10px] font-bold text-slate-500 uppercase leading-none mt-1">
                {format(new Date(apt.start_time), "aaa")}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-lg text-slate-900 leading-tight">
                  {apt.users.first_name} {apt.users.last_name}
                </h4>
                {apt.users.is_guest && <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-tighter h-4 px-1.5">Guest</Badge>}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-slate-500">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary/60" /> {apt.locations.name}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary/60" /> {apt.services.name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-1 mr-2">
               <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5">
                 <Phone className="w-4 h-4" />
               </Button>
               <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5">
                 <Mail className="w-4 h-4" />
               </Button>
             </div>

             <div className="flex items-center gap-2">
               <Button variant="outline" className="rounded-xl border-slate-200 font-bold h-10" asChild>
                 <Link href={`/dashboard/patients/${apt.patient_id}`}>
                   EMR <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-50" />
                 </Link>
               </Button>
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:bg-slate-50">
                     <MoreHorizontal className="w-5 h-5" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-100">
                    <DropdownMenuItem className="font-bold gap-2">Confirm Appointment</DropdownMenuItem>
                    <DropdownMenuItem className="font-bold gap-2">Reschedule</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="font-bold gap-2 text-red-500 focus:text-red-500 focus:bg-red-50">Cancel Visit</DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-12">
      {/* Search/Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search patient, service, or date..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
          />
        </div>
        <Button variant="outline" className="rounded-2xl gap-2 border-slate-200 font-bold px-6 h-12 shadow-sm">
          <Filter className="w-4 h-4" /> Filter Status
        </Button>
      </div>

      {/* Today Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 px-1">
          Today, {format(new Date(), "MMMM do")} 
          <Badge className="bg-primary/10 text-primary border-none font-black ml-2">{today.length}</Badge>
        </h3>
        <div className="space-y-4">
          {today.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 border-dashed">
               <p className="text-slate-400 font-medium">No appointments scheduled for today.</p>
             </div>
          ) : today.map(apt => <AppointmentCard key={apt.id} apt={apt} />)}
        </div>
      </div>

      {/* Upcoming Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 px-1">
          Upcoming Schedule
          <Badge className="bg-slate-100 text-slate-500 border-none font-black ml-2">{upcoming.length}</Badge>
        </h3>
        <div className="space-y-4">
          {upcoming.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 border-dashed">
               <p className="text-slate-400 font-medium">No upcoming appointments found.</p>
             </div>
          ) : upcoming.map(apt => <AppointmentCard key={apt.id} apt={apt} />)}
        </div>
      </div>
    </div>
  );
}

// Helper function for conditional classes
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
