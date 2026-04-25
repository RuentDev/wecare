'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPatientById } from '@/lib/mock-data';
import Link from 'next/link';
import { Calendar, Phone, Mail, AlertCircle, Heart, Pill, ClipboardList } from 'lucide-react';

export default function MedicalRecord() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (!isAuthenticated || user?.role !== 'patient') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'patient') {
    return null;
  }

  // In a real app, fetch the logged-in patient's data
  const patient = getPatientById('patient1');

  if (!patient) {
    return null;
  }

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth() - birth.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-light py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-dark mb-2">My Medical Record</h1>
              <p className="text-neutral-gray">Complete health profile and history</p>
            </div>
            <Button asChild variant="outline" className="rounded-[12px]">
              <Link href="/patient/appointments">Back to Appointments</Link>
            </Button>
          </div>

          {/* Personal Information */}
          <Card className="rounded-[12px] p-6 bg-white border border-neutral-gray mb-6">
            <h2 className="text-xl font-bold text-neutral-dark mb-6 flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-neutral-gray font-medium mb-1">Full Name</p>
                <p className="text-lg font-semibold text-neutral-dark">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-gray font-medium mb-1">Date of Birth</p>
                <p className="text-lg font-semibold text-neutral-dark">
                  {new Date(patient.dateOfBirth).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} ({calculateAge(patient.dateOfBirth)} years old)
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-gray font-medium mb-1">Gender</p>
                <p className="text-lg font-semibold text-neutral-dark capitalize">{patient.gender}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-gray font-medium mb-1">Email</p>
                <p className="text-lg font-semibold text-neutral-dark flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {patient.email}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-neutral-gray font-medium mb-1">Phone</p>
                <p className="text-lg font-semibold text-neutral-dark flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {patient.phone}
                </p>
              </div>
            </div>
          </Card>

          {/* Medical History */}
          <Card className="rounded-[12px] p-6 bg-white border border-neutral-gray mb-6">
            <h2 className="text-xl font-bold text-neutral-dark mb-6 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Medical History
            </h2>
            {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {patient.medicalHistory.map((condition, idx) => (
                  <div key={idx} className="bg-red-50 border border-red-200 rounded-[12px] p-4">
                    <p className="text-sm font-medium text-red-700">{condition}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-gray">No medical conditions recorded</p>
            )}
          </Card>

          {/* Allergies */}
          <Card className="rounded-[12px] p-6 bg-white border border-neutral-gray mb-6">
            <h2 className="text-xl font-bold text-neutral-dark mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Allergies
            </h2>
            {patient.allergies && patient.allergies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {patient.allergies.map((allergy, idx) => (
                  <div key={idx} className="bg-orange-50 border border-orange-200 rounded-[12px] p-4">
                    <p className="text-sm font-medium text-orange-700">{allergy}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-gray">No allergies recorded</p>
            )}
          </Card>

          {/* Current Medications */}
          <Card className="rounded-[12px] p-6 bg-white border border-neutral-gray mb-6">
            <h2 className="text-xl font-bold text-neutral-dark mb-6 flex items-center gap-2">
              <Pill className="w-5 h-5 text-blue-500" />
              Current Medications
            </h2>
            <p className="text-neutral-gray">No active medications recorded. Please contact your doctor to update this section.</p>
          </Card>

          {/* Emergency Contact */}
          <Card className="rounded-[12px] p-6 bg-white border border-neutral-gray">
            <h2 className="text-xl font-bold text-neutral-dark mb-6">Emergency Contact</h2>
            {patient.emergencyContact ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-neutral-gray font-medium mb-1">Contact Name</p>
                  <p className="text-lg font-semibold text-neutral-dark">{patient.emergencyContact.name}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-gray font-medium mb-1">Relationship</p>
                  <p className="text-lg font-semibold text-neutral-dark capitalize">{patient.emergencyContact.relationship}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-gray font-medium mb-1">Phone</p>
                  <p className="text-lg font-semibold text-neutral-dark">{patient.emergencyContact.phone}</p>
                </div>
              </div>
            ) : (
              <p className="text-neutral-gray">No emergency contact recorded</p>
            )}
          </Card>

          {/* Footer Note */}
          <Card className="rounded-[12px] p-4 bg-blue-50 border border-blue-200 mt-6">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> This is your official medical record. Please keep it updated and inform your healthcare provider of any changes to your medical history, allergies, or medications.
            </p>
          </Card>
        </div>
      </main>
    </>
  );
}
