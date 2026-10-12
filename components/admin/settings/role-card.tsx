"use client";

import { useMemo, useState } from "react";
import {
  Shield,
  Save,
  Loader2,
  CheckCircle2,
  CheckSquare,
  SquareX,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Accordion } from "@/components/ui/accordion";
import { ResourceAccordionItem } from "./resource-accordion-item";
import { groupPermissionsByModule } from "@/lib/utils/rbac-helpers";
import type {
  PermissionRecord,
  RoleWithPermissions,
} from "@/lib/types/rbac";
import { cn } from "@/lib/utils";

interface RoleCardProps {
  role: RoleWithPermissions;
  permissions: PermissionRecord[];
  matrix: Record<string, string[]>;
  onToggle: (roleId: string, permId: string) => void;
  onToggleModule: (
    roleId: string,
    permIds: string[],
    selectAll: boolean,
  ) => void;
  onSetRoleAll: (roleId: string, selectAll: boolean) => void;
  onSave: (roleId: string) => Promise<void>;
  isSaving: boolean;
  defaultExpanded?: boolean;
}

export function RoleCard({
  role,
  permissions,
  matrix,
  onToggle,
  onToggleModule,
  onSetRoleAll,
  onSave,
  isSaving,
  defaultExpanded = false,
}: RoleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const [justSaved, setJustSaved] = useState(false);

  const groupedModules = useMemo(
    () => groupPermissionsByModule(permissions),
    [permissions],
  );

  const selectedPermissionIds = matrix[role.id] || [];
  const totalCount = permissions.length;
  const selectedCount = selectedPermissionIds.length;

  const isAllRoleSelected = totalCount > 0 && selectedCount === totalCount;
  const isNoneRoleSelected = selectedCount === 0;

  async function handleSave() {
    await onSave(role.id);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Card className="glassmorphism-card border border-white/50 dark:border-slate-800/70 overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
        {/* Non-nested Accessible Header Container */}
        <div
          className={cn(
            "relative bg-white/70 dark:bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 sm:p-5 select-none transition-colors",
            isOpen && "border-b border-slate-200/60 dark:border-slate-800/60",
          )}
        >
          {/* Left: Role identification (Interactive toggle for expand/collapse) */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsOpen(!isOpen);
              }
            }}
            aria-expanded={isOpen}
            aria-label={`Toggle role settings for ${role.name}`}
            className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/40 p-1 -m-1 transition-colors hover:opacity-95"
          >
            <div className="p-2.5 sm:p-3 bg-primary/10 rounded-2xl shrink-0 transition-transform group-hover:scale-105">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg sm:text-xl font-bold capitalize tracking-tight text-slate-900 dark:text-slate-100">
                  {role.name}
                </CardTitle>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
                  {selectedCount} of {totalCount} active
                </span>
              </div>
              <CardDescription className="text-xs sm:text-sm font-medium text-muted-foreground/90 line-clamp-1">
                {role.description || "No description provided."}
              </CardDescription>
            </div>
          </div>

          {/* Right: Action controls & Collapse toggle (Sibling buttons, zero nesting) */}
          <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/50 dark:border-slate-800/50">
            {/* Bulk and Save buttons — displayed only when expanded */}
            {isOpen && (
              <div className="flex flex-wrap items-center gap-2 animate-in-fade">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onSetRoleAll(role.id, true)}
                  disabled={isSaving || isAllRoleSelected}
                  className="h-8.5 rounded-xl border-slate-200/90 dark:border-slate-700/90 text-xs font-semibold gap-1.5 shadow-2xs hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all cursor-pointer"
                >
                  <CheckSquare className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline">Grant All</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onSetRoleAll(role.id, false)}
                  disabled={isSaving || isNoneRoleSelected}
                  className="h-8.5 rounded-xl border-slate-200/90 dark:border-slate-700/90 text-xs font-semibold gap-1.5 shadow-2xs hover:bg-destructive/5 hover:border-destructive/40 hover:text-destructive transition-all cursor-pointer"
                >
                  <SquareX className="h-3.5 w-3.5 text-destructive" />
                  <span className="hidden sm:inline">Revoke All</span>
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  size="sm"
                  className={cn(
                    "relative min-w-[130px] h-8.5 rounded-xl transition-all duration-300 font-semibold shadow-md cursor-pointer",
                    justSaved
                      ? "bg-emerald-600 hover:bg-emerald-600 shadow-emerald-200 dark:shadow-emerald-950 text-white"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20",
                  )}
                >
                  {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : justSaved ? (
                    <div className="flex items-center gap-1.5 animate-in-fade text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Saved</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Save className="h-3.5 w-3.5" />
                      <span>Save Changes</span>
                    </div>
                  )}
                </Button>
              </div>
            )}

            {/* Chevron toggle button */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label={isOpen ? `Collapse ${role.name}` : `Expand ${role.name}`}
            >
              <ChevronDown
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
              />
            </button>
          </div>
        </div>

        {/* Collapsible Content Area */}
        <CollapsibleContent>
          <CardContent className="p-4 sm:p-6 bg-slate-50/20 dark:bg-slate-900/10">
            <Accordion type="multiple" className="space-y-3">
              {groupedModules.map((module) => (
                <ResourceAccordionItem
                  key={module.key}
                  module={module}
                  selectedPermissionIds={selectedPermissionIds}
                  onTogglePermission={(permId) => onToggle(role.id, permId)}
                  onToggleAllInModule={(permIds, selectAll) =>
                    onToggleModule(role.id, permIds, selectAll)
                  }
                />
              ))}
            </Accordion>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
