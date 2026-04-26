"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { BookingWidget } from "@/components/booking-widget";
import { PatientBookingForm } from "@/components/patient-booking-form";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

type BookingStep = "select" | "form" | "success";

export default function BookingPage() {
  const [step, setStep] = useState<BookingStep>("select");
  const [bookingData, setBookingData] = useState<{
    doctorId: string;
    serviceId: string;
    date: string;
    time: string;
  } | null>(null);
  const [appointmentId, setAppointmentId] = useState<string>("");

  const handleBookingStart = (data: {
    doctorId: string;
    serviceId: string;
    date: string;
    time: string;
  }) => {
    setBookingData(data);
    setStep("form");
  };

  const handleBookingSuccess = (id: string) => {
    setAppointmentId(id);
    setStep("success");
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-light py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-dark mb-3">
              Book Your Appointment
            </h1>
            <p className="text-neutral-gray text-lg">
              Schedule your visit with our healthcare professionals
            </p>
          </div>

          {/* Step 1: Select Appointment */}
          {step === "select" && (
            <div>
              <BookingWidget onBookingStart={handleBookingStart} />
            </div>
          )}

          {/* Step 2: Patient Details */}
          {step === "form" && bookingData && (
            <Card className="rounded-[12px] shadow-md p-6 sm:p-8">
              <PatientBookingForm
                bookingData={bookingData}
                onSuccess={handleBookingSuccess}
              />
            </Card>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <Card className="rounded-[12px] shadow-md p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-neutral-dark mb-2">
                Appointment Confirmed!
              </h2>
              <p className="text-neutral-gray mb-6">
                Your appointment has been successfully booked. A confirmation
                email will be sent to you shortly.
              </p>
              <div className="bg-blue-50 rounded-[12px] p-4 mb-6 text-left">
                <p className="text-sm text-neutral-gray mb-1">Appointment ID</p>
                <p className="font-mono text-primary font-semibold">
                  {appointmentId}
                </p>
              </div>
              <button
                onClick={() => (window.location.href = "/")}
                className="bg-primary hover:bg-blue-900 text-white font-semibold py-3 px-8 rounded-[12px] transition-colors"
              >
                Return to Home
              </button>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
