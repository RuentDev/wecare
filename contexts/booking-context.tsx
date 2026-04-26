"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { createXenditInvoice } from "@/app/actions/xendit";

// Types
export interface BookingService {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
}

export interface BookingDentist {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string | null;
  avatar_url: string | null;
}

export interface BookingLocation {
  id: string;
  name: string;
  address: string;
  city: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

// State
interface BookingState {
  step: number;
  selectedService: BookingService | null;
  selectedDentist: BookingDentist | null;
  selectedLocation: BookingLocation | null;
  selectedDate?: Date;
  selectedTime?: string;
  notes: string;
  isLoading: boolean;
  error: string | null;
  services: BookingService[];
  dentists: BookingDentist[];
  locations: BookingLocation[];
  availableSlots: TimeSlot[];
  bookingComplete: boolean;
  appointmentId: string | null;
  xenditInvoiceUrl: string | null;
}

// Actions
type BookingAction =
  | { type: "SET_STEP"; payload: number }
  | { type: "SET_SERVICE"; payload: BookingService | null }
  | { type: "SET_DENTIST"; payload: BookingDentist | null }
  | { type: "SET_LOCATION"; payload: BookingLocation | null }
  | { type: "SET_DATE"; payload: Date | undefined }
  | { type: "SET_TIME"; payload: string | undefined }
  | { type: "SET_NOTES"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SERVICES"; payload: BookingService[] }
  | { type: "SET_DENTISTS"; payload: BookingDentist[] }
  | { type: "SET_LOCATIONS"; payload: BookingLocation[] }
  | { type: "SET_AVAILABLE_SLOTS"; payload: TimeSlot[] }
  | {
      type: "SET_BOOKING_COMPLETE";
      payload: {
        complete: boolean;
        appointmentId: string | null;
        xenditInvoiceUrl?: string | null;
      };
    }
  | { type: "RESET" };

// Initial state
const initialState: BookingState = {
  step: 1,
  selectedService: null,
  selectedDentist: null,
  selectedLocation: null,
  selectedDate: undefined,
  selectedTime: undefined,
  notes: "",
  isLoading: false,
  error: null,
  services: [],
  dentists: [],
  locations: [],
  availableSlots: [],
  bookingComplete: false,
  appointmentId: null,
  xenditInvoiceUrl: null,
};

// Reducer
function bookingReducer(
  state: BookingState,
  action: BookingAction,
): BookingState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.payload };
    case "SET_SERVICE":
      return { ...state, selectedService: action.payload };
    case "SET_DENTIST":
      return { ...state, selectedDentist: action.payload };
    case "SET_LOCATION":
      return { ...state, selectedLocation: action.payload };
    case "SET_DATE":
      return {
        ...state,
        selectedDate: action.payload,
        selectedTime: undefined,
        availableSlots: [],
      };
    case "SET_TIME":
      return { ...state, selectedTime: action.payload };
    case "SET_NOTES":
      return { ...state, notes: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_SERVICES":
      return { ...state, services: action.payload };
    case "SET_DENTISTS":
      return { ...state, dentists: action.payload };
    case "SET_LOCATIONS":
      return { ...state, locations: action.payload };
    case "SET_AVAILABLE_SLOTS":
      return { ...state, availableSlots: action.payload };
    case "SET_BOOKING_COMPLETE":
      return {
        ...state,
        bookingComplete: action.payload.complete,
        appointmentId: action.payload.appointmentId,
        xenditInvoiceUrl: action.payload.xenditInvoiceUrl || null,
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// Context
interface BookingContextType extends BookingState {
  setStep: (step: number) => void;
  setService: (service: BookingService | null) => void;
  setDentist: (dentist: BookingDentist | null) => void;
  setLocation: (location: BookingLocation | null) => void;
  setDate: (date?: Date) => void;
  setTime: (time?: string) => void;
  setNotes: (notes: string) => void;
  fetchServices: () => Promise<void>;
  fetchDentists: () => Promise<void>;
  fetchLocations: () => Promise<void>;
  fetchAvailableSlots: () => Promise<void>;
  submitBooking: () => Promise<boolean>;
  reset: () => void;
  nextStep: () => void;
  prevStep: () => void;
  canProceed: () => boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Provider
export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const setStep = useCallback((step: number) => {
    dispatch({ type: "SET_STEP", payload: step });
  }, []);

  const setService = useCallback((service: BookingService | null) => {
    dispatch({ type: "SET_SERVICE", payload: service });
  }, []);

  const setDentist = useCallback((dentist: BookingDentist | null) => {
    dispatch({ type: "SET_DENTIST", payload: dentist });
  }, []);

  const setLocation = useCallback((location: BookingLocation | null) => {
    dispatch({ type: "SET_LOCATION", payload: location });
  }, []);

  const setDate = useCallback((date?: Date) => {
    dispatch({ type: "SET_DATE", payload: date });
  }, []);

  const setTime = useCallback((time?: string) => {
    dispatch({ type: "SET_TIME", payload: time });
  }, []);

  const setNotes = useCallback((notes: string) => {
    dispatch({ type: "SET_NOTES", payload: notes });
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch("/api/services");
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: "SET_SERVICES", payload: data.services });
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  }, []);

  const fetchDentists = useCallback(async () => {
    try {
      const response = await fetch("/api/dentists");
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: "SET_DENTISTS", payload: data.dentists });
      }
    } catch (error) {
      console.error("Failed to fetch dentists:", error);
    }
  }, []);

  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch("/api/locations");
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: "SET_LOCATIONS", payload: data.locations });
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  }, []);

  const fetchAvailableSlots = useCallback(async () => {
    if (
      !state.selectedDentist ||
      !state.selectedDate ||
      !state.selectedLocation
    ) {
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const dateStr = state.selectedDate.toISOString().split("T")[0];
      const params = new URLSearchParams({
        dentist_id: state.selectedDentist.id,
        date: dateStr,
        location_id: state.selectedLocation.id,
      });

      const response = await fetch(
        `/api/appointments/available-slots?${params}`,
      );
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: "SET_AVAILABLE_SLOTS", payload: data.slots });
      }
    } catch (error) {
      console.error("Failed to fetch available slots:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.selectedDentist, state.selectedDate, state.selectedLocation]);

  const submitBooking = useCallback(async (): Promise<boolean> => {
    if (
      !state.selectedService ||
      !state.selectedDentist ||
      !state.selectedLocation ||
      !state.selectedDate ||
      !state.selectedTime
    ) {
      dispatch({
        type: "SET_ERROR",
        payload: "Please complete all required fields",
      });
      return false;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: state.selectedService.id,
          dentist_id: state.selectedDentist.id,
          location_id: state.selectedLocation.id,
          appointment_date: state.selectedDate.toISOString().split("T")[0],
          start_time: state.selectedTime,
          notes: state.notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Create Xendit Invoice
        try {
          const xenditResponse = await createXenditInvoice({
            externalId: data.appointment.id,
            amount: Number(state.selectedService.price),
            description: `Dental Appointment: ${state.selectedService.name}`,
          });

          dispatch({
            type: "SET_BOOKING_COMPLETE",
            payload: {
              complete: true,
              appointmentId: data.appointment.id,
              xenditInvoiceUrl: xenditResponse.invoiceUrl,
            },
          });
          return true;
        } catch (xenditError: any) {
          console.error("Xendit integration error:", xenditError);
          // If Xendit fails, we still have the appointment, but maybe we should show an error
          dispatch({
            type: "SET_ERROR",
            payload:
              "Appointment created but failed to initialize payment. Our staff will contact you.",
          });
          return false;
        }
      } else {
        dispatch({
          type: "SET_ERROR",
          payload: data.error || "Booking failed",
        });
        return false;
      }
    } catch (error) {
      console.error("Booking error:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Network error. Please try again.",
      });
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state]);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const nextStep = useCallback(() => {
    if (state.step < 5) {
      dispatch({ type: "SET_STEP", payload: state.step + 1 });
    }
  }, [state.step]);

  const prevStep = useCallback(() => {
    if (state.step > 1) {
      dispatch({ type: "SET_STEP", payload: state.step - 1 });
    }
  }, [state.step]);

  const canProceed = useCallback((): boolean => {
    switch (state.step) {
      case 1:
        return !!state.selectedLocation;
      case 2:
        return !!state.selectedService;
      case 3:
        return !!state.selectedDentist;
      case 4:
        return !!state.selectedDate && !!state.selectedTime;
      default:
        return true;
    }
  }, [
    state.step,
    state.selectedLocation,
    state.selectedService,
    state.selectedDentist,
    state.selectedDate,
    state.selectedTime,
  ]);

  return (
    <BookingContext.Provider
      value={{
        ...state,
        setStep,
        setService,
        setDentist,
        setLocation,
        setDate,
        setTime,
        setNotes,
        fetchServices,
        fetchDentists,
        fetchLocations,
        fetchAvailableSlots,
        submitBooking,
        reset,
        nextStep,
        prevStep,
        canProceed,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

// Hook
export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
