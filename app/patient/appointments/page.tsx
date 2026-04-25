'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAppointmentsByPatient, getDoctorById, getServiceById, mockAppointments } from '@/lib/mock-data';
import Link from 'next/link';
import { Calendar, Clock, User, FileText } from 'lucide-react';

export default function PatientAppointments() {
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

  const patientAppointments = mockAppointments; // In a real app, filter by logged-in patient
  const upcomingAppointments = patientAppointments.filter(apt => apt.status === 'scheduled');
  const pastAppointments = patientAppointments.filter(apt => apt.status === 'completed' || apt.status === 'cancelled');

  const AppointmentCard = ({ appointment }: { appointment: typeof patientAppointments[0] }) => {
    const doctor = getDoctorById(appointment.doctorId);
    const service = getServiceById(appointment.serviceId);
    const appointmentDate = new Date(appointment.date);
    const isUpcoming = appointment.status === 'scheduled';

    return (
      <Card className={`rounded-[12px] p-6 border-l-4 ${isUpcoming ? 'border-l-primary border-neutral-gray' : 'border-l-green-600 border-neutral-gray'}`}>
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold text-neutral-dark">{service?.name}</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${
                appointment.status === 'scheduled'
                  ? 'bg-blue-100 text-primary'
                  : appointment.status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {appointment.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-neutral-gray" />
                <span className="text-neutral-dark">{doctor?.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-neutral-gray" />
                <span className="text-neutral-dark">{appointmentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-neutral-gray" />
                <span className="text-neutral-dark">{appointment.time}</span>
              </div>
            </div>

            {appointment.reason && (
              <div className="mt-3 p-3 bg-neutral-light rounded-[12px]">
                <p className="text-xs text-neutral-gray font-medium mb-1">Reason for visit:</p>
                <p className="text-sm text-neutral-dark">{appointment.reason}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 md:w-40">
            {isUpcoming && (
              <>
                <Button asChild className="bg-primary hover:bg-blue-900 text-white rounded-[12px]">
                  <Link href={`/patient/appointments/${appointment.id}`}>Reschedule</Link>
                </Button>
                <Button variant="outline" className="rounded-[12px]">
                  Cancel
                </Button>
              </>
            )}
            {appointment.status === 'completed' && (
              <Button asChild className="bg-secondary hover:bg-teal-700 text-white rounded-[12px]">
                <Link href={`/patient/medical-record/${appointment.id}`}>
                  <FileText className="w-4 h-4 mr-2" />
                  View Records
                </Link>
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-light py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-dark mb-2">My Appointments</h1>
              <p className="text-neutral-gray">View and manage your healthcare appointments</p>
            </div>
            <Button asChild className="bg-primary hover:bg-blue-900 text-white rounded-[12px]">
              <Link href="/booking">Book New</Link>
            </Button>
          </div>

          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-neutral-dark mb-4">Upcoming Appointments</h2>
              <div className="space-y-4">
                {upcomingAppointments.map(apt => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))}
              </div>
            </div>
          )}

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-neutral-dark mb-4">Past Appointments</h2>
              <div className="space-y-4">
                {pastAppointments.map(apt => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {patientAppointments.length === 0 && (
            <Card className="rounded-[12px] p-12 bg-white border border-neutral-gray text-center">
              <Calendar className="w-12 h-12 text-neutral-gray mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-neutral-dark mb-2">No appointments yet</h3>
              <p className="text-neutral-gray mb-6">You haven't booked any appointments. Schedule one now to get started.</p>
              <Button asChild className="bg-primary hover:bg-blue-900 text-white rounded-[12px]">
                <Link href="/booking">Book Your First Appointment</Link>
              </Button>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
