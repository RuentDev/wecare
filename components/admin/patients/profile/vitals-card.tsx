"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, History, Plus, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateVitals, getVitalsHistory } from "@/lib/actions/patients";
import { toast } from "sonner";
import { format } from "date-fns";

interface VitalsCardProps {
  vitals: any;
  patientId: string;
  onVitalsUpdate: (vitals: any) => void;
}

export function LatestVitalsCard({ vitals, patientId, onVitalsUpdate }: VitalsCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    blood_glucose_before: "",
    blood_glucose_after: "",
    temperature: "",
    blood_pressure: "",
    height: "",
    weight: "",
  });

  const handleUpdateClick = () => {
    // Requirement: "clicking update will remove the previous data"
    setFormData({
      blood_glucose_before: "",
      blood_glucose_after: "",
      temperature: "",
      blood_pressure: "",
      height: "",
      weight: "",
    });
    setIsUpdating(true);
  };

  const handleHistoryClick = async () => {
    setIsHistoryOpen(true);
    setIsLoadingHistory(true);
    try {
      const data = await getVitalsHistory(patientId);
      setHistory(data);
    } catch (error) {
      toast.error("Failed to load history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const result = await updateVitals(patientId, formData);
      if (result.success) {
        toast.success("Vitals updated successfully");
        onVitalsUpdate({ ...formData, created_at: new Date().toISOString() });
        setIsUpdating(false);
      } else {
        toast.error("Failed to update vitals");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const displayVitals = vitals || {
    blood_glucose_before: "---",
    blood_glucose_after: "---",
    temperature: "---",
    blood_pressure: "---",
    height: "---",
    weight: "---",
  };

  if (isUpdating) {
    return (
      <Card className="border-none shadow-sm bg-white overflow-hidden h-full">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
          <CardTitle className="text-xl font-black text-slate-800">New Vitals Update</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsUpdating(false)} className="rounded-xl">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 pt-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase">Blood Glucose (Before)</Label>
              <Input 
                value={formData.blood_glucose_before} 
                onChange={(e) => setFormData({...formData, blood_glucose_before: e.target.value})}
                placeholder="e.g. 120mg/dl"
                className="h-10 bg-slate-50 border-none rounded-xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase">Blood Glucose (After)</Label>
              <Input 
                value={formData.blood_glucose_after} 
                onChange={(e) => setFormData({...formData, blood_glucose_after: e.target.value})}
                placeholder="e.g. 140mg/dl"
                className="h-10 bg-slate-50 border-none rounded-xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase">Temperature</Label>
              <Input 
                value={formData.temperature} 
                onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                placeholder="e.g. 98.1 °F"
                className="h-10 bg-slate-50 border-none rounded-xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase">Blood Pressure</Label>
              <Input 
                value={formData.blood_pressure} 
                onChange={(e) => setFormData({...formData, blood_pressure: e.target.value})}
                placeholder="e.g. 120/80"
                className="h-10 bg-slate-50 border-none rounded-xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase">Height</Label>
              <Input 
                value={formData.height} 
                onChange={(e) => setFormData({...formData, height: e.target.value})}
                placeholder="e.g. 160 cm"
                className="h-10 bg-slate-50 border-none rounded-xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase">Weight</Label>
              <Input 
                value={formData.weight} 
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                placeholder="e.g. 55 Kg"
                className="h-10 bg-slate-50 border-none rounded-xl font-bold"
              />
            </div>
            <div className="col-span-2 pt-2">
              <Button type="submit" className="w-full h-12 rounded-xl font-black shadow-lg shadow-primary/20" disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Save Vitals
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden h-full">
      <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
        <CardTitle className="text-xl font-black text-slate-800">Latest Vitals</CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleHistoryClick} className="text-slate-500 font-bold hover:bg-slate-50">
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
          <Button variant="ghost" size="sm" onClick={handleUpdateClick} className="text-blue-500 font-bold hover:bg-blue-50">
            <Edit2 className="w-4 h-4 mr-2" />
            Update
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-4">
        <div className="grid grid-cols-3 gap-y-10 gap-x-4">
          <VitalsItem 
            value={displayVitals.blood_glucose_before} 
            label="Blood Glucose (Before)" 
            date={displayVitals.created_at ? format(new Date(displayVitals.created_at), "dd/MM/yy") : "N/A"} 
          />
          <VitalsItem 
            value={displayVitals.temperature} 
            label="Temperature" 
            date={displayVitals.created_at ? format(new Date(displayVitals.created_at), "dd/MM/yy") : "Today"} 
          />
          <VitalsItem 
            value={displayVitals.blood_pressure} 
            label="Blood Pressure" 
            date={displayVitals.created_at ? format(new Date(displayVitals.created_at), "dd/MM/yy") : "Today"} 
            align="right"
          />
          <VitalsItem 
            value={displayVitals.blood_glucose_after} 
            label="Blood Glucose (After)" 
            date={displayVitals.created_at ? format(new Date(displayVitals.created_at), "dd/MM/yy") : "N/A"} 
          />
          <VitalsItem 
            value={displayVitals.height} 
            label="Height" 
            date={displayVitals.created_at ? format(new Date(displayVitals.created_at), "dd/MM/yy") : "N/A"} 
          />
          <VitalsItem 
            value={displayVitals.weight} 
            label="Weight" 
            date={displayVitals.created_at ? format(new Date(displayVitals.created_at), "dd/MM/yy") : "N/A"} 
            align="right"
          />
        </div>
      </CardContent>

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Vitals History</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
            {isLoadingHistory ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : history.length > 0 ? (
              history.map((record) => (
                <div key={record.id} className="p-4 bg-slate-50 rounded-2xl grid grid-cols-3 gap-4 border border-slate-100/50">
                  <div className="col-span-3 border-b border-slate-200/50 pb-2 mb-2 flex justify-between items-center">
                    <span className="font-black text-slate-800">{format(new Date(record.created_at), "PPP")}</span>
                    <span className="text-[10px] font-black uppercase text-slate-400">{format(new Date(record.created_at), "p")}</span>
                  </div>
                  <HistoryItem label="Glucose (B/A)" value={`${record.blood_glucose_before || "-"} / ${record.blood_glucose_after || "-"}`} />
                  <HistoryItem label="Temperature" value={record.temperature || "-"} />
                  <HistoryItem label="BP" value={record.blood_pressure || "-"} />
                  <HistoryItem label="Height" value={record.height || "-"} />
                  <HistoryItem label="Weight" value={record.weight || "-"} />
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 font-bold">No history available</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function VitalsItem({ value, label, date, align = "left" }: { value: string; label: string; date: string; align?: "left" | "right" }) {
  return (
    <div className={`space-y-1 ${align === "right" ? "text-right md:text-left" : ""}`}>
      <p className="text-xl font-black text-slate-900">{value}</p>
      <p className="text-sm font-bold text-slate-500 leading-tight">{label}</p>
      <p className="text-[11px] font-bold text-slate-400 uppercase">{date}</p>
    </div>
  );
}

function HistoryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-black text-slate-700">{value}</p>
    </div>
  );
}
