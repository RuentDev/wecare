"use client";

import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react";

// Types
export type UserRole = "admin" | "staff" | "patient";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  email_verified: boolean;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  email: string | null;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  duration_minutes: number;
  price: number;
  image_url: string | null;
}

export interface Dentist {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  specialization: string | null;
  bio: string | null;
  avatar_url: string | null;
  consultation_fee: number | null;
}

export interface Appointment {
  id: string;
  patient_id: string;
  dentist_id: string;
  service_id: string;
  location_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  notes: string | null;
}

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  discount_percentage: number | null;
  discount_amount: number | null;
  promo_code: string | null;
  image_url: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

// State
interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  locations: Location[];
  services: Service[];
  dentists: Dentist[];
  promotions: Promotion[];
  selectedLocation: Location | null;
  error: string | null;
}

// Actions
type AppAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_LOCATIONS"; payload: Location[] }
  | { type: "SET_SERVICES"; payload: Service[] }
  | { type: "SET_DENTISTS"; payload: Dentist[] }
  | { type: "SET_PROMOTIONS"; payload: Promotion[] }
  | { type: "SET_SELECTED_LOCATION"; payload: Location | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "LOGOUT" };

// Initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  locations: [],
  services: [],
  dentists: [],
  promotions: [],
  selectedLocation: null,
  error: null,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_LOCATIONS":
      return { ...state, locations: action.payload };
    case "SET_SERVICES":
      return { ...state, services: action.payload };
    case "SET_DENTISTS":
      return { ...state, dentists: action.payload };
    case "SET_PROMOTIONS":
      return { ...state, promotions: action.payload };
    case "SET_SELECTED_LOCATION":
      return { ...state, selectedLocation: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "LOGOUT":
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

// Context
interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchLocations: () => Promise<void>;
  fetchServices: () => Promise<void>;
  fetchDentists: () => Promise<void>;
  fetchPromotions: () => Promise<void>;
  setSelectedLocation: (location: Location | null) => void;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: "SET_USER", payload: data.user });
      } else {
        dispatch({ type: "SET_USER", payload: null });
      }
    } catch {
      dispatch({ type: "SET_USER", payload: null });
    }
  };

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({ type: "SET_USER", payload: data.user });
        return true;
      } else {
        dispatch({ type: "SET_ERROR", payload: data.error || "Login failed" });
        dispatch({ type: "SET_LOADING", payload: false });
        return false;
      }
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Network error. Please try again." });
      dispatch({ type: "SET_LOADING", payload: false });
      return false;
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        dispatch({ type: "SET_USER", payload: result.user });
        return true;
      } else {
        dispatch({ type: "SET_ERROR", payload: result.error || "Registration failed" });
        dispatch({ type: "SET_LOADING", payload: false });
        return false;
      }
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Network error. Please try again." });
      dispatch({ type: "SET_LOADING", payload: false });
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      dispatch({ type: "LOGOUT" });
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

  const fetchPromotions = useCallback(async () => {
    try {
      const response = await fetch("/api/promotions");
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: "SET_PROMOTIONS", payload: data.promotions });
      }
    } catch (error) {
      console.error("Failed to fetch promotions:", error);
    }
  }, []);

  const setSelectedLocation = useCallback((location: Location | null) => {
    dispatch({ type: "SET_SELECTED_LOCATION", payload: location });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", payload: null });
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        fetchLocations,
        fetchServices,
        fetchDentists,
        fetchPromotions,
        setSelectedLocation,
        clearError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
