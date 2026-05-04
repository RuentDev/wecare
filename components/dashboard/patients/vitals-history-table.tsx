"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Calendar, Droplets, Thermometer, Scale, Ruler } from "lucide-react";
import { format } from "date-fns";

interface VitalsHistoryTableProps {
  vitals: any[];
}

export function VitalsHistoryTable({ vitals }: VitalsHistoryTableProps) {
  if (!vitals || vitals.length === 0) {
    return (
      <Card className="border-none shadow-xl bg-white rounded-[32px] p-12 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
          <Activity className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">No Vitals History</h3>
        <p className="text-slate-500 font-bold max-w-xs mx-auto">There are no vital sign records for this patient yet.</p>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-xl bg-white rounded-[32px] overflow-hidden">
      <CardHeader className="p-8 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-black text-slate-900">Vitals History</CardTitle>
          <p className="text-slate-500 font-bold text-sm">Longitudinal view of patient's health indicators</p>
        </div>
        <div className="p-3 bg-primary/5 rounded-2xl">
          <Activity className="w-6 h-6 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-b border-slate-100 hover:bg-transparent">
              <TableHead className="px-8 h-16 font-black text-slate-500 uppercase tracking-widest text-[10px]">Date Recorded</TableHead>
              <TableHead className="h-16 font-black text-slate-500 uppercase tracking-widest text-[10px]">BP (mmHg)</TableHead>
              <TableHead className="h-16 font-black text-slate-500 uppercase tracking-widest text-[10px]">Temp (°C)</TableHead>
              <TableHead className="h-16 font-black text-slate-500 uppercase tracking-widest text-[10px]">Glucose (Before/After)</TableHead>
              <TableHead className="h-16 font-black text-slate-500 uppercase tracking-widest text-[10px]">Weight (kg)</TableHead>
              <TableHead className="px-8 h-16 font-black text-slate-500 uppercase tracking-widest text-[10px]">Height (cm)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vitals.map((vital, index) => (
              <TableRow key={index} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                <TableCell className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-slate-900 font-black">{format(new Date(vital.created_at), "MMM dd, yyyy")}</span>
                    <span className="text-slate-400 font-bold text-xs">{format(new Date(vital.created_at), "hh:mm aa")}</span>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-red-50 text-red-500 rounded-lg">
                      <Droplets className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-slate-900 font-black">{vital.blood_pressure || "--"}</span>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg">
                      <Thermometer className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-slate-900 font-black">{vital.temperature ? `${vital.temperature}°` : "--"}</span>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex flex-col">
                    <span className="text-slate-900 font-black">{vital.blood_glucose_before || "--"} / {vital.blood_glucose_after || "--"}</span>
                    <span className="text-slate-400 font-bold text-[10px] uppercase">mg/dL</span>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                      <Scale className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-slate-900 font-black">{vital.weight || "--"}</span>
                  </div>
                </TableCell>
                <TableCell className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg">
                      <Ruler className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-slate-900 font-black">{vital.height || "--"}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
