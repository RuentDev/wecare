"use client";

import { Shield, Save, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PermissionItem } from "./permission-item";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface RoleCardProps {
  role: {
    id: string;
    name: string;
    description: string | null;
  };
  permissions: any[];
  matrix: Record<string, string[]>;
  onToggle: (roleId: string, permId: string) => void;
  onSave: (roleId: string) => Promise<void>;
  isSaving: boolean;
}

export function RoleCard({
  role,
  permissions,
  matrix,
  onToggle,
  onSave,
  isSaving,
}: RoleCardProps) {
  const [justSaved, setJustSaved] = useState(false);

  async function handleSave() {
    await onSave(role.id);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }

  return (
    <Card className="glassmorphism-card border-none overflow-hidden transition-all duration-300">
      <CardHeader className="relative bg-white/50 dark:bg-slate-900/50 border-b border-white/20 dark:border-slate-800/20 flex flex-col md:flex-row md:items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold capitalize tracking-tight text-slate-900 dark:text-slate-100">
              {role.name}
            </CardTitle>
            <CardDescription className="text-sm font-medium text-muted-foreground/80">
              {role.description || "No description provided."}
            </CardDescription>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
          className={cn(
            "relative min-w-[160px] h-11 rounded-xl transition-all duration-300 font-semibold",
            justSaved
              ? "bg-green-600 hover:bg-green-600 shadow-green-200"
              : "shadow-lg shadow-primary/20",
          )}
        >
          {isSaving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : justSaved ? (
            <div className="flex items-center gap-2 animate-in-fade">
              <CheckCircle2 className="h-5 w-5" />
              Saved
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Save Changes
            </div>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {permissions.map((perm) => (
            <PermissionItem
              key={perm.id}
              id={perm.id}
              name={perm.name}
              description={perm.description}
              isChecked={matrix[role.id]?.includes(perm.id) || false}
              onToggle={() => onToggle(role.id, perm.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
