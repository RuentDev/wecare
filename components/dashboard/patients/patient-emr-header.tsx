"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Mail, 
  Calendar, 
  Droplets, 
  Scale, 
  Ruler, 
  Thermometer,
  ShieldCheck
} from "lucide-react";
import { format, differenceInYears } from "date-fns";

interface PatientEMRHeaderProps {
  patient: any;
  vitals: any;
}

export function PatientEMRHeader({ patient, vitals }: PatientEMRHeaderProps) {
  const age = patient.date_of_birth ? differenceInYears(new Date(), new Date(patient.date_of_birth)) : "N/A";

  return (
    <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[32px]">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 md:p-12 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="relative">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white/10 rounded-[40px]">
                <AvatarImage src={patient.avatar_url || ""} />
                <AvatarFallback className="bg-primary/20 text-white font-black text-3xl">
                  {patient.first_name?.[0]}{patient.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-2xl border-4 border-slate-900">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-black">{patient.first_name} {patient.last_name}</h1>
                {patient.is_guest && <Badge className="bg-white/10 text-white border-white/20 font-black tracking-widest uppercase text-[10px]">Guest Patient</Badge>}
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-400 font-bold text-sm">
                <span className="flex items-center gap-2 capitalize"><Droplets className="w-4 h-4 text-primary" /> {patient.gender?.toLowerCase() || "Not specified"}</span>
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {age} years old</span>
                <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> {patient.phone || "No phone"}</span>
                <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> {patient.email}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 md:flex-col lg:flex-row">
            <div className="bg-white/5 border border-white/10 p-4 rounded-3xl min-w-[140px]">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Last Visit</p>
               <p className="text-lg font-black">{patient.appointments?.[0]?.appointment_date ? format(new Date(patient.appointments[0].appointment_date), "MMM dd, yyyy") : "No records"}</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-3xl min-w-[140px]">
               <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Status</p>
               <p className="text-lg font-black text-emerald-400">Stable</p>
            </div>
          </div>
        </div>

        {/* Vitals Quick View */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-slate-100 divide-x divide-slate-100">
           <div className="p-6 flex items-center justify-center gap-4 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood Pressure</p>
                <p className="text-xl font-black text-slate-900">{vitals?.blood_pressure || "-- / --"}</p>
              </div>
           </div>
           <div className="p-6 flex items-center justify-center gap-4 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temperature</p>
                <p className="text-xl font-black text-slate-900">{vitals?.temperature ? `${vitals.temperature}°C` : "-- °C"}</p>
              </div>
           </div>
           <div className="p-6 flex items-center justify-center gap-4 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight</p>
                <p className="text-xl font-black text-slate-900">{vitals?.weight ? `${vitals.weight} kg` : "-- kg"}</p>
              </div>
           </div>
           <div className="p-6 flex items-center justify-center gap-4 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Ruler className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Height</p>
                <p className="text-xl font-black text-slate-900">{vitals?.height ? `${vitals.height} cm` : "-- cm"}</p>
              </div>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
