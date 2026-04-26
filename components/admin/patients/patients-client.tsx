"use client";

import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getColumns, Patient } from "./columns";
import { Users, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { PatientQuickView } from "./patient-quick-view";
import { PatientMedicalHistory } from "./patient-medical-history";
import { PatientMessageModal } from "./patient-message-modal";
import { useRouter } from "next/navigation";

interface PatientsClientProps {
  initialPatients: Patient[];
}

export function PatientsClient({ initialPatients: data }: PatientsClientProps) {
  const router = useRouter();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  const handleViewProfile = (patient: Patient) => {
    router.push(`/admin/users/patients/${patient.id}`);
  };

  const handleQuickView = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsQuickViewOpen(true);
  };

  const handleViewHistory = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsHistoryOpen(true);
  };

  const handleSendMessage = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsMessageOpen(true);
  };

  const columns = getColumns({
    onViewProfile: handleViewProfile,
    onQuickView: handleQuickView,
    onViewHistory: handleViewHistory,
    onSendMessage: handleSendMessage,
  });

  return (
    <div className="space-y-6">
      <Card className="glassmorphism border-none shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="p-6 border-b border-primary/5 bg-primary/2 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">Patient Directory</h2>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Manage and monitor registered patients
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1 bg-white/50 border-primary/10 text-primary font-bold shadow-sm">
                {data.length} Total Patients
              </Badge>
            </div>
          </div>

          <div className="p-6">
            <DataTable 
              columns={columns} 
              data={data} 
              searchKey="name"
            />
          </div>
        </CardContent>
      </Card>

      <PatientQuickView
        patientId={selectedPatient?.id || null}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />

      <PatientMedicalHistory
        patientId={selectedPatient?.id || null}
        patientName={selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : ""}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      <PatientMessageModal
        patientId={selectedPatient?.id || null}
        patientName={selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : ""}
        isOpen={isMessageOpen}
        onClose={() => setIsMessageOpen(false)}
      />
    </div>
  );
}
