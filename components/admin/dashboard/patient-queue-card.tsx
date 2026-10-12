"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Activity,
  CheckCircle2,
  Users,
  ArrowUpRight,
  User,
  Calendar,
} from "lucide-react";
import type {
  PatientQueueSummary,
  QueuedPatient,
  QueueStage,
} from "@/lib/types/admin-dashboard";

interface PatientQueueCardProps {
  queue: PatientQueueSummary;
}

type FilterType = "all" | QueueStage;

export function PatientQueueCard({ queue }: PatientQueueCardProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filteredPatients = queue.queue.filter((patient) => {
    if (activeFilter === "all") return true;
    return patient.queueStage === activeFilter;
  });

  const getStageBadge = (stage: QueueStage) => {
    switch (stage) {
      case "in_consultation":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:border-emerald-800 dark:text-emerald-400 gap-1.5 font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            In-Consultation
          </Badge>
        );
      case "waiting":
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-700 border-blue-300 dark:border-blue-800 dark:text-blue-400 gap-1.5 font-medium"
          >
            <Clock className="w-3 h-3 text-blue-500" />
            Waiting
          </Badge>
        );
      case "checked_out":
        return (
          <Badge
            variant="outline"
            className="bg-slate-500/10 text-slate-700 border-slate-300 dark:border-slate-700 dark:text-slate-400 gap-1.5 font-medium"
          >
            <CheckCircle2 className="w-3 h-3 text-slate-500" />
            Checked Out
          </Badge>
        );
    }
  };

  return (
    <Card className="flex flex-col h-full shadow-sm hover:shadow transition-shadow duration-200">
      <CardHeader className="py-5 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Users className="w-5 h-5" />
              </div>
              <CardTitle className="text-xl font-bold">Patient Queue Status</CardTitle>
            </div>
            <CardDescription className="mt-1">
              Real-time patient clinic queue and consultation throughput today.
            </CardDescription>
          </div>

          <Link href="/admin/appointments">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              All Appointments
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-3 gap-2.5 pt-3">
          <div
            onClick={() => setActiveFilter("waiting")}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${activeFilter === "waiting"
              ? "bg-blue-50/80 border-blue-300 dark:bg-blue-950/40 dark:border-blue-800 shadow-xs"
              : "bg-card hover:bg-muted/40 border-border"
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Waiting</span>
              <Clock className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {queue.waitingCount}
            </p>
          </div>

          <div
            onClick={() => setActiveFilter("in_consultation")}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${activeFilter === "in_consultation"
              ? "bg-emerald-50/80 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 shadow-xs"
              : "bg-card hover:bg-muted/40 border-border"
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">In Consultation</span>
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {queue.inConsultationCount}
            </p>
          </div>

          <div
            onClick={() => setActiveFilter("checked_out")}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${activeFilter === "checked_out"
              ? "bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700 shadow-xs"
              : "bg-card hover:bg-muted/40 border-border"
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Checked Out</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <p className="text-2xl font-bold text-slate-700 dark:text-slate-300 mt-1">
              {queue.checkedOutCount}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-10 flex-1 flex flex-col">
        {/* Filters bar */}
        <div className="flex items-center justify-between pb-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-2.5 py-1 rounded-md transition-colors ${activeFilter === "all"
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
            >
              All ({queue.queue.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("waiting")}
              className={`px-2.5 py-1 rounded-md transition-colors ${activeFilter === "waiting"
                ? "bg-blue-600 text-white font-semibold"
                : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
            >
              Waiting ({queue.waitingCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("in_consultation")}
              className={`px-2.5 py-1 rounded-md transition-colors ${activeFilter === "in_consultation"
                ? "bg-emerald-600 text-white font-semibold"
                : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
            >
              In-Consultation ({queue.inConsultationCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("checked_out")}
              className={`px-2.5 py-1 rounded-md transition-colors ${activeFilter === "checked_out"
                ? "bg-slate-700 text-white font-semibold"
                : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
            >
              Checked Out ({queue.checkedOutCount})
            </button>
          </div>
        </div>

        {/* Patients Queue List */}
        {filteredPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center border rounded-xl border-dashed border-border/80 bg-muted/20 my-auto">
            <Calendar className="w-8 h-8 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-semibold text-foreground">No patients in this stage</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Appointments scheduled for today will automatically show in the queue.
            </p>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
            {filteredPatients.map((patient: QueuedPatient) => (
              <div
                key={patient.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border/70 hover:border-border hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {patient.patientName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                      <span className="font-medium text-foreground/80">{patient.doctorName}</span>
                      <span>•</span>
                      <span>{patient.serviceName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
                  {getStageBadge(patient.queueStage)}
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {patient.timeSlot}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
