"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { User, getUserByEmail, mockUsers } from "./mock-data";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("wecare_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("wecare_user");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Simulate API call
    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password,
    );

    if (!foundUser) {
      throw new Error("Invalid email or password");
    }

    // Don't store password, just user info
    const userToStore = { ...foundUser };
    delete (userToStore as any).password;

    setUser(userToStore);
    localStorage.setItem("wecare_user", JSON.stringify(userToStore));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("wecare_user");
  }, []);

  const value: AuthContextType = {
    user: user ? { ...user } : null,
    loading,
    login,
    logout,
    isAuthenticated: user !== null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
