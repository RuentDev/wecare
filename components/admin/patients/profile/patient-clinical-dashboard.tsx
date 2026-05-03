"use client";

import { useState } from "react";
import { PatientProfileCard } from "./patient-profile-card";
import { LatestVitalsCard } from "./vitals-card";
import { ClinicalSection } from "./clinical-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveClinicalRecord } from "@/lib/actions/patients";
import { toast } from "sonner";

interface PatientClinicalDashboardProps {
  patient: any;
  vitals: any;
}

export function PatientClinicalDashboard({
  patient,
  vitals: initialVitals,
}: PatientClinicalDashboardProps) {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [followUpDate, setFollowUpDate] = useState<Date>();
  const [isSaving, setIsSaving] = useState(false);
  const [vitals, setVitals] = useState(initialVitals);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await saveClinicalRecord(patient.id, {
        diagnosis: diagnoses.map((d: any) => `${d.name} (${d.type})`).join(", "),
        treatment: consultations.map((c: any) => c.name).join(", "),
        prescription: medications.map((m: any) => m.name).join(", "),
        followUpDate: followUpDate?.toISOString(),
        raw_data: { consultations, diagnoses, medications },
      });
      if (result.success) {
        toast.success("Clinical record saved successfully");
      } else {
        toast.error("Failed to save record");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto space-y-6 ">
      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <PatientProfileCard patient={patient} />
        </div>
        <div className="lg:col-span-3">
          <LatestVitalsCard vitals={vitals} patientId={patient.id} onVitalsUpdate={setVitals} />
        </div>
      </div>

      {/* Past Records Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value="past-records"
          className="border-none shadow-sm bg-white rounded-xl overflow-hidden px-6"
        >
          <AccordionTrigger className="text-xl font-black text-slate-800 hover:no-underline py-6">
            Past Records ({patient.medical_records?.length || 0})
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            {patient.medical_records?.length > 0 ? (
              <div className="space-y-4">
                {patient.medical_records.map((record: any) => (
                  <div key={record.id} className="p-4 bg-slate-50 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700">
                        {format(new Date(record.created_at), "PPP")}
                      </span>
                      {record.follow_up_date && (
                        <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">
                          Follow-up: {format(new Date(record.follow_up_date), "PP")}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400 font-bold uppercase text-[10px]">Diagnosis</p>
                        <p className="font-medium text-slate-600">{record.diagnosis || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-bold uppercase text-[10px]">Treatment</p>
                        <p className="font-medium text-slate-600">{record.treatment || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-bold uppercase text-[10px]">Prescription</p>
                        <p className="font-medium text-slate-600">{record.prescription || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 font-medium">
                No previous records found for this patient.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Clinical Sections */}
      <div className="space-y-6">
        <ClinicalSection
          title="Reasons for Consultation"
          type="consultation"
          items={consultations}
          onAdd={() =>
            setConsultations([
              ...consultations,
              { name: "", type: "", details: "" },
            ])
          }
          onRemove={(idx) =>
            setConsultations(consultations.filter((_, i) => i !== idx))
          }
          onUpdate={(idx, field, val) => {
            const next = [...consultations];
            next[idx] = { ...next[idx], [field]: val };
            setConsultations(next);
          }}
        />

        <ClinicalSection
          title="Diagnosis"
          type="diagnosis"
          items={diagnoses}
          onAdd={() =>
            setDiagnoses([...diagnoses, { name: "", type: "", details: "" }])
          }
          onRemove={(idx) =>
            setDiagnoses(diagnoses.filter((_, i) => i !== idx))
          }
          onUpdate={(idx, field, val) => {
            const next = [...diagnoses];
            next[idx] = { ...next[idx], [field]: val };
            setDiagnoses(next);
          }}
        />

        <ClinicalSection
          title="Medication"
          type="medication"
          items={medications}
          onAdd={() =>
            setMedications([
              ...medications,
              { name: "", frequency: "", duration: "", instruction: "" },
            ])
          }
          onRemove={(idx) =>
            setMedications(medications.filter((_, i) => i !== idx))
          }
          onUpdate={(idx, field, val) => {
            const next = [...medications];
            next[idx] = { ...next[idx], [field]: val };
            setMedications(next);
          }}
        />

        {/* Follow Up Section */}
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xl font-black text-slate-800">Follow Up</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full md:w-[280px] h-12 justify-start text-left font-bold rounded-xl bg-slate-50/30 border-none",
                    !followUpDate && "text-slate-400",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {followUpDate ? (
                    format(followUpDate, "PPP")
                  ) : (
                    <span>Follow Up Date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl shadow-2xl border-none">
                <Calendar
                  mode="single"
                  selected={followUpDate}
                  onSelect={setFollowUpDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end pt-6">
        <Button
          size="lg"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-white font-black px-12 rounded-xl shadow-xl shadow-primary/20 h-14 text-lg transition-all active:scale-95"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Save Record
        </Button>
      </div>
    </div>
  );
}
