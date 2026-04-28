"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Video, 
  Monitor, 
  ExternalLink, 
  Calendar, 
  Clock, 
  User,
  Settings
} from "lucide-react";
import { format } from "date-fns";

interface TelemedicineSectionProps {
  appointments: any[];
}

export function TelemedicineSection({ appointments }: TelemedicineSectionProps) {
  // Mock filter for telemed (in real app, would check a field)
  const telemedApts = appointments.filter((_, i) => i % 3 === 0); 

  return (
    <div className="space-y-8 animate-in-fade">
      {/* Telemed Hero */}
      <Card className="border-none shadow-xl bg-gradient-to-br from-primary to-primary-foreground text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Monitor className="w-64 h-64 rotate-12" />
        </div>
        <CardContent className="p-8 md:p-12 relative z-10">
          <div className="max-w-2xl">
            <Badge className="bg-white/20 text-white border-white/20 mb-6 font-black uppercase tracking-widest px-3 py-1">Telemedicine Module Active</Badge>
            <h2 className="text-4xl md:text-5xl font-black leading-tight">Virtual Care Portal</h2>
            <p className="text-primary-foreground/80 text-lg mt-4 font-bold max-w-lg">
              Manage your remote consultations with HIPAA-compliant video calls. Secure, fast, and integrated directly with patient records.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <Button size="lg" className="bg-white text-primary hover:bg-slate-100 font-black rounded-2xl h-14 px-8 text-lg shadow-xl shadow-black/10">
                Configure Virtual Office
              </Button>
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 font-bold rounded-2xl h-14 px-8">
                <Settings className="w-5 h-5 mr-2" /> Connection Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Virtual Appointments Grid */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-slate-900 px-1">Upcoming Video Visits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {telemedApts.length === 0 ? (
            <Card className="col-span-full border-2 border-dashed border-slate-100 bg-white p-12 text-center rounded-3xl">
               <Video className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-500 font-bold">No virtual appointments scheduled.</p>
            </Card>
          ) : telemedApts.map((apt: any) => (
            <Card key={apt.id} className="border-none shadow-sm bg-white hover:shadow-lg transition-all group rounded-3xl overflow-hidden">
               <CardHeader className="bg-slate-50/50 p-6 flex flex-row items-center justify-between space-y-0">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                    <Video className="w-6 h-6" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black px-2.5 py-1">READY</Badge>
               </CardHeader>
               <CardContent className="p-6">
                  <h4 className="text-lg font-black text-slate-900 leading-tight">
                    {apt.users.first_name} {apt.users.last_name}
                  </h4>
                  <p className="text-slate-500 text-sm font-bold mt-1 uppercase tracking-tighter">{apt.services.name}</p>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{format(new Date(apt.appointment_date), "EEEE, MMM dd")}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{format(new Date(apt.start_time), "hh:mm a")}</span>
                    </div>
                  </div>

                  <Button className="w-full mt-8 rounded-2xl h-14 font-black text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 gap-2">
                    Join Meeting <ExternalLink className="w-5 h-5" />
                  </Button>
               </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
