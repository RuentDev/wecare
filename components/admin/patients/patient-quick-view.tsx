"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { getPatientById } from "@/lib/actions/patients";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  MapPin, 
  Activity,
  History,
  ClipboardList,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PatientQuickViewProps {
  patientId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientQuickView({ patientId, isOpen, onClose }: PatientQuickViewProps) {
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patientId && isOpen) {
      fetchPatient();
    }
  }, [patientId, isOpen]);

  async function fetchPatient() {
    setLoading(true);
    try {
      const data = await getPatientById(patientId!);
      setPatient(data);
    } catch (error) {
      console.error("Failed to fetch patient details", error);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md border-none glassmorphism shadow-2xl p-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">Fetching details...</p>
          </div>
        ) : patient ? (
          <ScrollArea className="h-full">
            <div className="p-6 space-y-8">
              {/* Profile Header */}
              <SheetHeader className="text-left space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-md">
                    <AvatarImage src={patient.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                      {patient.first_name?.[0]}{patient.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-2xl font-extrabold tracking-tight">
                      {patient.first_name} {patient.last_name}
                    </SheetTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                        Patient
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        ID: {patient.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                </div>
                <SheetDescription className="text-sm font-medium">
                  Detailed overview of patient profile and recent activities.
                </SheetDescription>
              </SheetHeader>

              <Separator className="bg-primary/5" />

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  Contact Information
                </h3>
                <div className="grid gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/40 border border-primary/5 shadow-sm">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">Email Address</p>
                      <p className="text-sm font-semibold">{patient.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/40 border border-primary/5 shadow-sm">
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">Phone Number</p>
                      <p className="text-sm font-semibold">{patient.phone || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/40 border border-primary/5 shadow-sm">
                    <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">Address</p>
                      <p className="text-sm font-semibold truncate max-w-[250px]">{patient.address || "No address recorded"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats & Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                  <p className="text-[10px] uppercase font-bold text-primary/60 mb-1">Total Visits</p>
                  <p className="text-2xl font-black text-primary">{patient._count.appointments}</p>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-center">
                  <p className="text-[10px] uppercase font-bold text-purple-600/60 mb-1">Member Since</p>
                  <p className="text-lg font-bold text-purple-600">
                    {format(new Date(patient.created_at), "MMM yyyy")}
                  </p>
                </div>
              </div>

              {/* Recent Appointments */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <History className="h-3.5 w-3.5" />
                  Recent Appointments
                </h3>
                <div className="space-y-3">
                  {patient.appointments.length > 0 ? (
                    patient.appointments.map((apt: any) => (
                      <div key={apt.id} className="p-3 rounded-xl bg-white/40 border border-primary/5 shadow-sm flex items-center justify-between group hover:bg-white/60 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{apt.services.name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase">
                              {format(new Date(apt.appointment_date), "MMM dd, yyyy")} • {apt.doctors.users.first_name} {apt.doctors.users.last_name}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold capitalize">
                          {apt.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic text-center py-4 bg-muted/20 rounded-xl">No recent appointments</p>
                  )}
                </div>
              </div>

              {/* Medical Summary */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ClipboardList className="h-3.5 w-3.5" />
                  Medical Notes Summary
                </h3>
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 italic text-sm text-amber-900/70 leading-relaxed">
                  {patient.medical_records[0]?.diagnosis || "No specific diagnosis notes recorded in recent visits."}
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="p-6 text-center text-muted-foreground">Patient not found</div>
        )}
      </SheetContent>
    </Sheet>
  );
}
