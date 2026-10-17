"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AppProvider } from "@/contexts/app-context";
import { Toaster } from "@/components/ui/sonner";

// Suppress React 19 false-positive warning for next-themes inline script injection
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster position="top-right" richColors />
      </NextThemesProvider>
    </AppProvider>
  );
}
