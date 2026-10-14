import { Suspense } from "react";
import Scheduling from "@/components/sections/scheduling";

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-neutral-light">
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center text-sm font-medium text-muted-foreground">
            Loading booking schedule...
          </div>
        }
      >
        <Scheduling />
      </Suspense>
    </main>
  );
}

