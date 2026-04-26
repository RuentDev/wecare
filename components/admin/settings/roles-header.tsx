"use client";

import { ShieldCheck } from "lucide-react";

export function RolesHeader() {
  return (
    <div className="flex flex-col gap-2 animate-in-slide-up">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Roles & Permissions
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Configure system-wide access levels and fine-tune permission mapping.
          </p>
        </div>
      </div>
    </div>
  );
}
