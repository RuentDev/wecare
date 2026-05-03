"use client";

import { useEffect, useReducer } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { createGuestBooking } from "@/lib/actions/booking";
import {
  getPublicDoctors,
  getPublicServices,
  getPublicLocations,
  getDefaultLocationId,
} from "@/lib/actions/scheduling";
import { getMe } from "@/lib/actions/auth";
import { StepIndicator } from "../scheduling/StepIndicator";
import { LocationStep } from "../scheduling/LocationStep";
import { ServiceStep } from "../scheduling/ServiceStep";
import { DoctorStep } from "../scheduling/DoctorStep";
import { DateTimeStep } from "../scheduling/DateTimeStep";
import { PatientStep } from "../scheduling/PatientStep";
import { useToast } from "@/hooks/use-toast";
import { useAsyncState } from "@/hooks/use-async-state";
import type { SchedulingDoctor, SchedulingService, SchedulingLocation } from "@/lib/types/scheduling";

// ---------------------------------------------------------------------------
// State shape & reducer
// ---------------------------------------------------------------------------

interface BookingState {
  currentStep: number;
  selectedLocationId: string;
  selectedServiceId: string;
  selectedDoctorId: string;
  selectedDate: Date;
  selectedTime: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientReason: string;
  isSubmitting: boolean;
  bookingError: string;
  showSuccess: boolean;
  appointmentId: string;
}

type BookingAction =
  | { type: "SET_STEP"; step: number }
  | { type: "SELECT_LOCATION"; id: string }
  | { type: "SELECT_SERVICE"; id: string }
  | { type: "SELECT_DOCTOR"; id: string }
  | { type: "SELECT_DATE"; date: Date }
  | { type: "SELECT_TIME"; time: string }
  | {
      type: "SET_PATIENT_FIELD";
      field: keyof Pick<
        BookingState,
        "patientName" | "patientEmail" | "patientPhone" | "patientReason"
      >;
      value: string;
    }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS"; appointmentId: string }
  | { type: "SUBMIT_ERROR"; error: string }
  | {
      type: "SET_USER_DATA";
      data: { name: string; email: string; phone: string };
    };

function bookingReducer(
  state: BookingState,
  action: BookingAction
): BookingState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step };
    case "SELECT_LOCATION":
      return { ...state, selectedLocationId: action.id };
    case "SELECT_SERVICE":
      return { ...state, selectedServiceId: action.id, selectedDoctorId: "" };
    case "SELECT_DOCTOR":
      return { ...state, selectedDoctorId: action.id };
    case "SELECT_DATE":
      // Reset time when date changes so stale selection is cleared
      return { ...state, selectedDate: action.date, selectedTime: "" };
    case "SELECT_TIME":
      return { ...state, selectedTime: action.time };
    case "SET_PATIENT_FIELD":
      return { ...state, [action.field]: action.value };
    case "SUBMIT_START":
      return { ...state, isSubmitting: true, bookingError: "" };
    case "SUBMIT_SUCCESS":
      return {
        ...state,
        isSubmitting: false,
        showSuccess: true,
        appointmentId: action.appointmentId,
      };
    case "SUBMIT_ERROR":
      return { ...state, isSubmitting: false, bookingError: action.error };
    case "SET_USER_DATA":
      return {
        ...state,
        patientName: action.data.name,
        patientEmail: action.data.email,
        patientPhone: action.data.phone,
      };
    default:
      return state;
  }
}

const TOTAL_STEPS = 5;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface Props {
  date?: Date;
}

const Scheduling = ({ date = new Date() }: Props) => {
  const { toast } = useToast();

  const [state, dispatch] = useReducer(bookingReducer, {
    currentStep: 1,
    selectedLocationId: "",
    selectedServiceId: "",
    selectedDoctorId: "",
    selectedDate: date,
    selectedTime: "",
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    patientReason: "",
    isSubmitting: false,
    bookingError: "",
    showSuccess: false,
    appointmentId: "",
  });

  // Remote data via useAsyncState
  const locations = useAsyncState<SchedulingLocation[]>([]);
  const doctors = useAsyncState<SchedulingDoctor[]>([]);
  const services = useAsyncState<SchedulingService[]>([]);
  const defaultLocationId = useAsyncState<string>("");

  // Fetch all remote data once on mount
  useEffect(() => {
    locations.load(() => getPublicLocations().then((r) => r.data ?? []));
    doctors.load(() => getPublicDoctors().then((r) => r.data ?? []));
    services.load(() => getPublicServices().then((r) => r.data ?? []));
    defaultLocationId.load(() => getDefaultLocationId().then((r) => r.data ?? ""));

    // Fetch user session for pre-filling
    getMe().then((user) => {
      if (user) {
        dispatch({
          type: "SET_USER_DATA",
          data: {
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            phone: user.phone ?? "",
          },
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived: find the currently selected doctor/service objects
  const selectedDoctor = doctors.data.find(
    (d) => d.id === state.selectedDoctorId
  );
  const selectedService = services.data.find(
    (s) => s.id === state.selectedServiceId
  );

  // Navigation
  const goToStep = (step: number) => {
    dispatch({ type: "SET_STEP", step });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleNext = () => {
    if (state.currentStep < TOTAL_STEPS) goToStep(state.currentStep + 1);
  };
  const handleBack = () => {
    if (state.currentStep > 1) goToStep(state.currentStep - 1);
  };

  const isStepValid = (): boolean => {
    switch (state.currentStep) {
      case 1:
        return !!state.selectedLocationId;
      case 2:
        return !!state.selectedServiceId;
      case 3:
        return !!state.selectedDoctorId;
      case 4:
        return !!state.selectedDate && !!state.selectedTime;
      case 5:
        return (
          !!state.patientName &&
          !!state.patientEmail &&
          !!state.patientPhone &&
          !!state.patientReason
        );
      default:
        return false;
    }
  };

  const handleConfirmBooking = async () => {
    if (!isStepValid()) return;

    dispatch({ type: "SUBMIT_START" });

    try {
      const durationMinutes = selectedService?.durationMinutes ?? 30;
      const [hours, minutes] = state.selectedTime.split(":").map(Number);
      const endDate = new Date();
      endDate.setHours(hours, minutes + durationMinutes);
      const endTime = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;

      const result = await createGuestBooking({
        firstName: state.patientName.split(" ")[0],
        lastName:
          state.patientName.split(" ").slice(1).join(" ") || "Guest",
        email: state.patientEmail,
        phone: state.patientPhone,
        reason: state.patientReason,
        doctorId: state.selectedDoctorId,
        serviceId: state.selectedServiceId,
        locationId: state.selectedLocationId,
        appointmentDate: state.selectedDate.toISOString(),
        startTime: state.selectedTime,
        endTime,
      });

      if (result.success) {
        dispatch({
          type: "SUBMIT_SUCCESS",
          appointmentId: result.appointmentId!,
        });
        toast({
          title: "Booking Successful",
          description: "Your appointment has been scheduled.",
        });
      } else {
        dispatch({
          type: "SUBMIT_ERROR",
          error: result.error ?? "Failed to book appointment",
        });
        toast({
          variant: "destructive",
          title: "Booking Failed",
          description: result.error,
        });
      }
    } catch {
      dispatch({
        type: "SUBMIT_ERROR",
        error: "An unexpected error occurred. Please try again.",
      });
    }
  };

  // ------ Success screen ------
  if (state.showSuccess) {
    return (
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-neutral-light min-h-[50vh] flex items-center">
        <div className="max-w-3xl mx-auto w-full">
          <div className="bg-white rounded-[32px] p-12 shadow-xl text-center space-y-8 animate-in zoom-in duration-500">
            <div className="inline-flex bg-green-100 rounded-full p-6 text-green-600 animate-bounce">
              <CheckCircle className="w-16 h-16" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-neutral-dark">
                Appointment Confirmed!
              </h2>
              <p className="text-xl text-neutral-gray max-w-lg mx-auto">
                We&apos;ve scheduled your visit with{" "}
                <span className="text-primary font-bold">
                  {selectedDoctor?.name}
                </span>{" "}
                for{" "}
                <span className="text-neutral-dark font-bold">
                  {state.selectedDate.toLocaleDateString()}
                </span>{" "}
                at{" "}
                <span className="text-neutral-dark font-bold">
                  {state.selectedTime}
                </span>
                .
              </p>
              {state.appointmentId && (
                <div className="bg-blue-50 rounded-[12px] p-4 max-w-sm mx-auto text-left border border-blue-100">
                  <p className="text-sm text-neutral-gray mb-1">
                    Appointment ID
                  </p>
                  <p className="font-mono text-primary font-bold break-all">
                    {state.appointmentId}
                  </p>
                </div>
              )}
            </div>
            <div className="pt-8 border-t border-neutral-gray/30 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                className="border-2 border-neutral-gray text-neutral-dark font-bold py-4 px-8 rounded-2xl h-auto text-lg hover:bg-neutral-light transition-all"
              >
                Download Receipt
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ------ Main wizard ------
  return (
    <section className="py-10 px-5 sm:px-6 lg:px-8 bg-neutral-light min-h-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black text-neutral-dark mb-4 tracking-tight">
            Book Your Appointment
          </h2>
          <p className="text-lg text-neutral-gray max-w-2xl mx-auto">
            Experience premium healthcare with our easy scheduling system.
            Follow the steps below to secure your consultation.
          </p>
        </div>

        <StepIndicator currentStep={state.currentStep} totalSteps={TOTAL_STEPS} />

        {/* Error banner */}
        {state.bookingError && (
          <div className="max-w-3xl mx-auto mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{state.bookingError}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="min-h-auto">
          {state.currentStep === 1 && (
            <LocationStep
              locations={locations.data}
              selectedLocationId={state.selectedLocationId}
              isLoading={locations.loading}
              onSelect={(id) => {
                dispatch({ type: "SELECT_LOCATION", id });
                setTimeout(handleNext, 300);
              }}
            />
          )}
          {state.currentStep === 2 && (
            <ServiceStep
              services={services.data}
              selectedServiceId={state.selectedServiceId}
              isLoading={services.loading}
              onSelect={(id) => {
                dispatch({ type: "SELECT_SERVICE", id });
                setTimeout(handleNext, 300);
              }}
            />
          )}
          {state.currentStep === 3 && (
            <DoctorStep
              doctors={doctors.data.filter((doc) =>
                state.selectedServiceId
                  ? doc.serviceIds.includes(state.selectedServiceId)
                  : true
              )}
              selectedDoctorId={state.selectedDoctorId}
              isLoading={doctors.loading}
              onSelect={(id) => {
                dispatch({ type: "SELECT_DOCTOR", id });
                setTimeout(handleNext, 300);
              }}
            />
          )}
          {state.currentStep === 4 && (
            <DateTimeStep
              selectedDoctorId={state.selectedDoctorId}
              selectedLocationId={state.selectedLocationId}
              selectedServiceId={state.selectedServiceId}
              selectedDate={state.selectedDate}
              selectedTime={state.selectedTime}
              onDateSelect={(date) =>
                dispatch({ type: "SELECT_DATE", date })
              }
              onTimeSelect={(time) =>
                dispatch({ type: "SELECT_TIME", time })
              }
            />
          )}
          {state.currentStep === 5 && (
            <PatientStep
              patientName={state.patientName}
              patientEmail={state.patientEmail}
              patientPhone={state.patientPhone}
              patientReason={state.patientReason}
              doctor={selectedDoctor}
              service={selectedService}
              selectedDate={state.selectedDate}
              selectedTime={state.selectedTime}
              setPatientName={(v) =>
                dispatch({
                  type: "SET_PATIENT_FIELD",
                  field: "patientName",
                  value: v,
                })
              }
              setPatientEmail={(v) =>
                dispatch({
                  type: "SET_PATIENT_FIELD",
                  field: "patientEmail",
                  value: v,
                })
              }
              setPatientPhone={(v) =>
                dispatch({
                  type: "SET_PATIENT_FIELD",
                  field: "patientPhone",
                  value: v,
                })
              }
              setPatientReason={(v) =>
                dispatch({
                  type: "SET_PATIENT_FIELD",
                  field: "patientReason",
                  value: v,
                })
              }
            />
          )}
        </div>

        {/* Navigation Footer */}
        <div className="mt-16">
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[32px] p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500">
            {/* Back */}
            <div className="w-full md:w-auto order-2 md:order-1">
              <Button
                onClick={handleBack}
                disabled={state.currentStep === 1}
                variant="ghost"
                className={`w-full md:w-auto flex items-center justify-center gap-2 text-neutral-gray hover:text-neutral-dark font-bold text-lg h-14 px-8 rounded-2xl transition-all duration-300 ${
                  state.currentStep === 1
                    ? "opacity-0 pointer-events-none"
                    : "opacity-100"
                }`}
              >
                <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                Previous
              </Button>
            </div>

            {/* Progress */}
            <div className="flex flex-col items-center gap-3 order-1 md:order-2">
              <div className="flex items-center gap-3 bg-neutral-light/50 px-4 py-2 rounded-full border border-neutral-gray/10">
                <div className="flex items-center gap-2 text-secondary font-bold text-xs uppercase tracking-widest">
                  <Shield className="w-4 h-4" />
                  Secure Booking
                </div>
                <div className="w-1 h-1 bg-neutral-gray/30 rounded-full" />
                <p className="text-xs font-bold text-neutral-gray uppercase tracking-widest">
                  Step {state.currentStep} of {TOTAL_STEPS}
                </p>
              </div>
              <div className="hidden md:flex gap-1">
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      i + 1 <= state.currentStep
                        ? "w-6 bg-primary"
                        : "w-2 bg-neutral-gray/20"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Next / Confirm */}
            <div className="w-full md:w-auto order-3">
              {state.currentStep < TOTAL_STEPS ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="w-full md:w-auto group bg-primary text-white font-black py-4 px-10 rounded-2xl h-14 text-lg transition-all duration-300 shadow-[0_10px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 disabled:bg-neutral-gray disabled:shadow-none disabled:translate-y-0"
                >
                  Continue
                  <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleConfirmBooking}
                  disabled={!isStepValid() || state.isSubmitting}
                  className="w-full md:w-auto group bg-secondary hover:bg-teal-700 text-white font-black py-4 px-10 rounded-2xl h-14 text-lg transition-all duration-300 shadow-[0_10px_20px_rgba(20,184,166,0.2)] hover:shadow-[0_15px_30px_rgba(20,184,166,0.3)] hover:-translate-y-0.5 disabled:bg-neutral-gray disabled:shadow-none disabled:translate-y-0"
                >
                  {state.isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Booking…
                    </>
                  ) : (
                    <>
                      Confirm Booking
                      <CheckCircle className="w-5 h-5 ml-2 transition-all group-hover:scale-110" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Scheduling;
