"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientEMRHeader } from "./patient-emr-header";
import { MedicalHistoryTimeline } from "./medical-history-timeline";
import { TreatmentLogEditor } from "./treatment-log-editor";
import { PrescriptionManager } from "./prescription-manager";
import { InsuranceDetails } from "./insurance-details";
import { VitalsHistoryTable } from "./vitals-history-table";
import { History, FileText, Pill, Activity, ArrowLeft, Shield, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PatientEMRClientProps {
  data: {
    patient: any;
    history: any[];
    vitals: any[];
    insurance: any;
  };
  doctorId: string;
}

export function PatientEMRClient({ data, doctorId }: PatientEMRClientProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-8 animate-in-fade">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="rounded-xl gap-2 text-slate-500 font-bold hover:bg-slate-100" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4" /> Back to Workspace
          </Link>
        </Button>
      </div>

      <PatientEMRHeader patient={data.patient} vitals={data.vitals[0]} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm h-14 overflow-x-auto flex-nowrap justify-start md:justify-center">
          <TabsTrigger value="overview" className="rounded-xl px-6 h-12 data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all gap-2 flex-shrink-0">
            <Activity className="w-4 h-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="vitals" className="rounded-xl px-6 h-12 data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all gap-2 flex-shrink-0">
            <LineChart className="w-4 h-4" /> Vitals History
          </TabsTrigger>
          <TabsTrigger value="insurance" className="rounded-xl px-6 h-12 data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all gap-2 flex-shrink-0">
            <Shield className="w-4 h-4" /> Insurance
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl px-6 h-12 data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all gap-2 flex-shrink-0">
            <History className="w-4 h-4" /> Medical History
          </TabsTrigger>
          <TabsTrigger value="notes" className="rounded-xl px-6 h-12 data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all gap-2 flex-shrink-0">
            <FileText className="w-4 h-4" /> Treatment Logs
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="rounded-xl px-6 h-12 data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all gap-2 flex-shrink-0">
            <Pill className="w-4 h-4" /> Prescriptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="outline-none space-y-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <MedicalHistoryTimeline history={data.history.slice(0, 3)} />
              <div className="space-y-8">
                <PrescriptionManager history={data.history} compact />
              </div>
           </div>
        </TabsContent>

        <TabsContent value="vitals" className="outline-none">
          <VitalsHistoryTable vitals={data.vitals} />
        </TabsContent>

        <TabsContent value="insurance" className="outline-none">
          <InsuranceDetails insurance={data.insurance} />
        </TabsContent>

        <TabsContent value="history" className="outline-none">
          <MedicalHistoryTimeline history={data.history} />
        </TabsContent>

        <TabsContent value="notes" className="outline-none">
          <TreatmentLogEditor patientId={data.patient.id} doctorId={doctorId} />
        </TabsContent>

        <TabsContent value="prescriptions" className="outline-none">
          <PrescriptionManager history={data.history} patientId={data.patient.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
