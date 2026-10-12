"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function RolesLoading() {
  return (
    <div className="space-y-6 animate-in-fade">
      <div className="grid gap-3.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card
            key={i}
            className="glassmorphism-card border border-white/50 dark:border-slate-800/70 overflow-hidden shadow-md"
          >
            <div className="flex items-center justify-between p-4 sm:p-5 bg-white/70 dark:bg-slate-900/60">
              <div className="flex items-center gap-3.5">
                <Skeleton className="h-11 w-11 rounded-2xl" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-28 rounded-md" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-3.5 w-52 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-6 w-6 rounded-md" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
