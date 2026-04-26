"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AppProvider } from "@/contexts/app-context";

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
      </NextThemesProvider>
    </AppProvider>
  );
}
