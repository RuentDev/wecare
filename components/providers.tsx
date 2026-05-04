"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AppProvider } from "@/contexts/app-context";
import { Toaster } from "@/components/ui/sonner";

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
