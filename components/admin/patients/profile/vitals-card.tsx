"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";

interface VitalsCardProps {
  vitals: any;
}

export function LatestVitalsCard({ vitals }: VitalsCardProps) {
  const displayVitals = vitals || {
    blood_glucose_before: "120mg/dl",
    blood_glucose_after: "120mg/dl",
    temperature: "98.1 °F",
    blood_pressure: "120/80 mm hg",
    height: "160 cm",
    weight: "55 Kg",
  };

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden h-full">
      <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
        <CardTitle className="text-xl font-black text-slate-800">Latest Vitals</CardTitle>
        <Button variant="ghost" size="sm" className="text-blue-500 font-bold hover:bg-blue-50">
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="p-6 pt-4">
        <div className="grid grid-cols-3 gap-y-10 gap-x-4">
          <div className="space-y-1">
            <p className="text-xl font-black text-slate-900">{displayVitals.blood_glucose_before || "120mg/dl"}</p>
            <p className="text-sm font-bold text-slate-500 leading-tight">Blood Glucose Level</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Before meal - 11/03/23</p>
          </div>

          <div className="space-y-1">
            <p className="text-xl font-black text-slate-900">{displayVitals.temperature || "98.1 °F"}</p>
            <p className="text-sm font-bold text-slate-500 leading-tight">Temperature</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Today</p>
          </div>

          <div className="space-y-1 text-right md:text-left">
            <p className="text-xl font-black text-slate-900">{displayVitals.blood_pressure || "120/80 mm hg"}</p>
            <p className="text-sm font-bold text-slate-500 leading-tight">Blood Pressure</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Today</p>
          </div>

          <div className="space-y-1">
            <p className="text-xl font-black text-slate-900">{displayVitals.blood_glucose_after || "120mg/dl"}</p>
            <p className="text-sm font-bold text-slate-500 leading-tight">Blood Glucose Level</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase">After meal - 11/03/23</p>
          </div>

          <div className="space-y-1">
            <p className="text-xl font-black text-slate-900">{displayVitals.height || "160 cm"}</p>
            <p className="text-sm font-bold text-slate-500 leading-tight">Height</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase">20/03/23</p>
          </div>

          <div className="space-y-1 text-right md:text-left">
            <p className="text-xl font-black text-slate-900">{displayVitals.weight || "55 Kg"}</p>
            <p className="text-sm font-bold text-slate-500 leading-tight">Weight</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase">20/03/23</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
