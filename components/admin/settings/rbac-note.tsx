"use client";

import { Info, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function RBACNote() {
  return (
    <Card className="bg-amber-50/50 dark:bg-amber-900/10 border-amber-200/50 dark:border-amber-800/30 overflow-hidden">
      <CardContent className="p-5 flex gap-4">
        <div className="mt-1">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400 flex items-center gap-2">
            Important Considerations
          </h4>
          <p className="text-xs text-amber-800/80 dark:text-amber-500/80 leading-relaxed max-w-3xl">
            Changes to role permissions are applied immediately system-wide. Active users may need to re-authenticate to see changes. 
            Ensure the <strong className="text-amber-950 dark:text-amber-200">Administrator</strong> role maintains <code>roles:manage</code> access to prevent administrative lockouts.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
