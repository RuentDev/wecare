"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  FileText, 
  Stethoscope, 
  Pill,
  ClipboardList
} from "lucide-react";
import { toast } from "sonner";
import { saveClinicalRecord } from "@/lib/actions/patients";
import { useRouter } from "next/navigation";

interface TreatmentLogEditorProps {
  patientId: string;
  doctorId: string;
}

export function TreatmentLogEditor({ patientId, doctorId }: TreatmentLogEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    diagnosis: "",
    treatment: "",
    prescription: "",
    notes: ""
  });

  const handleSave = async () => {
    if (!formData.diagnosis || !formData.treatment) {
      toast.error("Please fill in at least the diagnosis and treatment.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveClinicalRecord(patientId, {
        ...formData,
        doctor_id: doctorId
      });

      if (result.success) {
        toast.success("Clinical record saved successfully");
        setFormData({ diagnosis: "", treatment: "", prescription: "", notes: "" });
        router.refresh();
      } else {
        toast.error("Failed to save clinical record");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[32px]">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-primary" /> New Clinical Record
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Stethoscope className="w-3.5 h-3.5" /> Primary Diagnosis
              </label>
              <input 
                type="text" 
                placeholder="e.g. Acute Bronchitis"
                value={formData.diagnosis}
                onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> Treatment Plan
              </label>
              <textarea 
                placeholder="Describe the clinical treatment or procedures performed..."
                rows={4}
                value={formData.treatment}
                onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-primary/5 transition-all resize-none"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Pill className="w-3.5 h-3.5" /> Prescribed Medication
              </label>
              <input 
                type="text" 
                placeholder="e.g. Amoxicillin 500mg, 3x daily for 7 days"
                value={formData.prescription}
                onChange={(e) => setFormData({...formData, prescription: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Internal Notes
              </label>
              <textarea 
                placeholder="Additional observations or follow-up instructions..."
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-primary/5 transition-all resize-none"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                size="lg" 
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-2xl h-14 px-12 font-black text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95 gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Saving Record...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Save Record
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[32px]">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
            <CardTitle className="text-lg font-bold">Quick Templates</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start font-bold h-12 rounded-xl text-slate-600 hover:bg-slate-50">
              <Plus className="w-4 h-4 mr-3 text-primary" /> Regular Checkup
            </Button>
            <Button variant="ghost" className="w-full justify-start font-bold h-12 rounded-xl text-slate-600 hover:bg-slate-50">
              <Plus className="w-4 h-4 mr-3 text-primary" /> Follow-up Visit
            </Button>
            <Button variant="ghost" className="w-full justify-start font-bold h-12 rounded-xl text-slate-600 hover:bg-slate-50">
              <Plus className="w-4 h-4 mr-3 text-primary" /> Lab Review
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-amber-50/50 border border-amber-100 rounded-[32px]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-amber-800">Security Note</h4>
            </div>
            <p className="text-sm text-amber-700/80 font-medium leading-relaxed">
              Every clinical record entry is logged and timestamped for the audit trail. Please ensure all medical information is accurate and HIPAA compliant.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Missing Icon import
import { Activity, AlertCircle } from "lucide-react";
