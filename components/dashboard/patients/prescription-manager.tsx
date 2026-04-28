"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Pill, 
  Plus, 
  History, 
  CheckCircle2, 
  RotateCcw,
  ExternalLink,
  Printer,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";

interface PrescriptionManagerProps {
  history: any[];
  compact?: boolean;
  patientId?: string;
}

export function PrescriptionManager({ history, compact, patientId }: PrescriptionManagerProps) {
  const prescriptions = history
    .filter(record => record.prescription)
    .map(record => ({
      id: record.id,
      medication: record.prescription,
      date: record.created_at,
      doctor: `${record.doctors?.users?.first_name} ${record.doctors?.users?.last_name}`,
      diagnosis: record.diagnosis
    }));

  if (compact) {
    return (
      <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[32px]">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary" /> Active Prescriptions
          </CardTitle>
          <Badge className="bg-primary/10 text-primary border-none font-black">{prescriptions.length}</Badge>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {prescriptions.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium text-center py-4">No active prescriptions.</p>
          ) : (
            prescriptions.slice(0, 3).map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 leading-tight">{item.medication}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{item.diagnosis}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            ))
          )}
          <Button variant="ghost" className="w-full text-primary font-bold hover:bg-primary/5 rounded-xl h-10 mt-2">
            View All History
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Medication Management</h2>
          <p className="text-slate-500 font-medium">Issue and track patient prescriptions.</p>
        </div>
        <Button className="rounded-2xl h-12 px-6 font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2">
          <Plus className="w-5 h-5" /> Issue New Prescription
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {prescriptions.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-100 bg-white p-20 text-center rounded-[32px]">
             <Pill className="w-16 h-16 text-slate-200 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-slate-700">No prescriptions recorded</h3>
             <p className="text-slate-500 mt-2">Start by issuing a new medication for this patient.</p>
          </Card>
        ) : (
          prescriptions.map((item) => (
            <Card key={item.id} className="border-none shadow-sm bg-white hover:shadow-md transition-all group overflow-hidden rounded-[24px]">
              <CardContent className="p-0 flex flex-col md:flex-row">
                <div className="w-full md:w-2 bg-primary/20 group-hover:bg-primary transition-colors"></div>
                <div className="p-6 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-primary border border-slate-100 shadow-inner group-hover:bg-white transition-colors">
                      <Pill className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-xl font-black text-slate-900 leading-tight">{item.medication}</h4>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold uppercase text-[9px]">Active</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-2 text-sm font-bold text-slate-500">
                        <span className="flex items-center gap-1.5"><History className="w-3.5 h-3.5 text-primary/60" /> Issued: {format(new Date(item.date), "MMM dd, yyyy")}</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary/60" /> By: Dr. {item.doctor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl border-slate-200 font-bold h-11 px-5 shadow-sm gap-2">
                      <Printer className="w-4 h-4" /> Print Rx
                    </Button>
                    <Button variant="ghost" className="rounded-xl font-bold h-11 px-5 text-slate-500 hover:bg-slate-100 gap-2">
                      <RotateCcw className="w-4 h-4" /> Refill
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden rounded-[32px]">
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="space-y-2 text-center md:text-left">
             <h3 className="text-2xl font-black">E-Prescription Integration</h3>
             <p className="text-slate-400 font-medium">Send prescriptions directly to the patient's preferred pharmacy.</p>
           </div>
           <Button className="bg-white text-slate-900 hover:bg-slate-100 font-black rounded-2xl h-14 px-8 text-lg shadow-xl shadow-white/5 gap-2">
             Configure Pharmacy <ExternalLink className="w-5 h-5" />
           </Button>
        </CardContent>
      </Card>
    </div>
  );
}
