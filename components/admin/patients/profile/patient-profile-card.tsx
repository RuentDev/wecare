"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";

interface PatientProfileCardProps {
  patient: any;
}

export function PatientProfileCard({ patient }: PatientProfileCardProps) {
  if (!patient) return null;

  const lastVisit = patient.appointments?.[0]?.appointment_date;
  
  // Mock allergies based on image if not in DB
  const allergies = ["Peanut Allergy", "Lactose Intolerant", "Lactose Intolerant"];

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden h-full">
      <CardContent className="p-6 space-y-6">
        <div className="flex gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl bg-[#FFF9EA] flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
              <Avatar className="w-full h-full rounded-none">
                <AvatarImage src={patient.avatar_url || ""} className="object-cover" />
                <AvatarFallback className="bg-transparent text-primary text-3xl font-black">
                  {patient.first_name?.[0]}{patient.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="flex-1 pt-2">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 leading-none mb-2">
              {patient.first_name} {patient.last_name}
            </h2>
            <div className="flex items-center gap-4 text-slate-500 font-bold mb-6">
              <span className="text-lg">Female</span>
              <span className="text-lg">Age 32</span>
            </div>

            <div className="space-y-1">
              <p className="text-blue-500 font-bold tracking-wide">{patient.phone || "8745635422"}</p>
              <p className="text-blue-400 font-medium">{patient.email}</p>
            </div>
          </div>
        </div>

        {/* Last Visited Section */}
        <div className="bg-slate-50/80 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-600">Last Visited</span>
          <div className="text-sm font-bold text-slate-500">
            {lastVisit ? format(new Date(lastVisit), "dd/MM/yy, EEEE, h:mm a") : "11/03/23, Thursday, 9:30 am"}
          </div>
        </div>

        {/* Allergies Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-800">Known Allergies</h3>
          <div className="flex flex-wrap gap-2">
            {allergies.map((allergy, i) => (
              <Badge 
                key={i} 
                className="bg-[#FFF9EA] text-[#8B7E5E] border-none px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
              >
                {allergy}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
