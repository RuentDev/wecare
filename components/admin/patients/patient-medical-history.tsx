"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getPatientMedicalHistory } from "@/lib/actions/patients";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  Loader2, 
  Stethoscope, 
  FileText, 
  Calendar,
  Pill,
  Activity,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface PatientMedicalHistoryProps {
  patientId: string | null;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientMedicalHistory({ 
  patientId, 
  patientName,
  isOpen, 
  onClose 
}: PatientMedicalHistoryProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patientId && isOpen) {
      fetchHistory();
    }
  }, [patientId, isOpen]);

  async function fetchHistory() {
    setLoading(true);
    try {
      const data = await getPatientMedicalHistory(patientId!);
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch medical history", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl glassmorphism border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <History className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">Medical History</DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground">
                Detailed chronological records for <span className="text-foreground font-bold">{patientName}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator className="bg-primary/5" />

        <div className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
              <p className="text-muted-foreground font-medium animate-pulse">Retrieving historical records...</p>
            </div>
          ) : history.length > 0 ? (
            <ScrollArea className="h-[500px]">
              <div className="p-6 space-y-8">
                {history.map((record, index) => (
                  <div key={record.id} className="relative pl-8 group">
                    {/* Timeline Line */}
                    {index !== history.length - 1 && (
                      <div className="absolute left-[11px] top-8 bottom-[-32px] w-[2px] bg-linear-to-b from-primary/20 to-transparent" />
                    )}
                    
                    {/* Timeline Dot */}
                    <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full bg-white border-2 border-primary shadow-sm flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>

                    <div className="space-y-4 bg-white/40 border border-primary/5 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-foreground">
                              {format(new Date(record.created_at), "MMMM dd, yyyy")}
                            </p>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">
                              {format(new Date(record.created_at), "hh:mm a")}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold px-3 py-1">
                          {record.appointments?.services?.name || "General Visit"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <Stethoscope className="h-3 w-3" />
                            Attending Doctor
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-foreground">
                              Dr. {record.doctors?.users?.first_name} {record.doctors?.users?.last_name}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <Activity className="h-3 w-3" />
                            Diagnosis
                          </div>
                          <p className="text-sm font-medium text-foreground leading-relaxed">
                            {record.diagnosis || "No diagnosis recorded"}
                          </p>
                        </div>
                      </div>

                      {(record.treatment || record.prescription) && (
                        <div className="pt-2 space-y-4">
                          <Separator className="bg-primary/5" />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {record.treatment && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                                  <FileText className="h-3 w-3" />
                                  Treatment Plan
                                </div>
                                <p className="text-xs font-medium text-muted-foreground italic">
                                  {record.treatment}
                                </p>
                              </div>
                            )}
                            {record.prescription && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-600">
                                  <Pill className="h-3 w-3" />
                                  Prescription
                                </div>
                                <p className="text-xs font-medium text-muted-foreground italic">
                                  {record.prescription}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="p-4 bg-muted/20 rounded-full">
                <FileText className="h-12 w-12 text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground font-medium">No medical records found for this patient.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
