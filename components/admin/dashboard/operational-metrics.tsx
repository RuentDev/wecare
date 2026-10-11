import React from "react";
import { PatientQueueCard } from "./patient-queue-card";
import { DoorAvailabilityCard } from "./door-availability-card";
import type {
  PatientQueueSummary,
  PhysicianDoorStatus,
} from "@/lib/types/admin-dashboard";

interface OperationalMetricsProps {
  queue: PatientQueueSummary;
  physicians: PhysicianDoorStatus[];
}

export function OperationalMetrics({
  queue,
  physicians,
}: OperationalMetricsProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Operational &amp; Appointment Metrics
          </h2>
          <p className="text-sm text-muted-foreground">
            Live patient queue throughput and clinical room availability overview.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <PatientQueueCard queue={queue} />
        <DoorAvailabilityCard physicians={physicians} />
      </div>
    </section>
  );
}
