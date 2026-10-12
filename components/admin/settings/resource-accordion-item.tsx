"use client";

import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { PermissionActionCard } from "./permission-action-card";
import type { GroupedResourceModule } from "@/lib/types/rbac";
import { cn } from "@/lib/utils";

interface ResourceAccordionItemProps {
  module: GroupedResourceModule;
  selectedPermissionIds: string[];
  onTogglePermission: (permissionId: string) => void;
  onToggleAllInModule: (permissionIds: string[], selectAll: boolean) => void;
}

export function ResourceAccordionItem({
  module,
  selectedPermissionIds,
  onTogglePermission,
  onToggleAllInModule,
}: ResourceAccordionItemProps) {
  const totalCount = module.permissions.length;
  const selectedCount = module.permissions.filter((p) =>
    selectedPermissionIds.includes(p.id),
  ).length;

  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

  const ModuleIcon = module.icon;

  const badgeClass = isAllSelected
    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40"
    : selectedCount > 0
      ? "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary-foreground dark:border-primary/30"
      : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";

  return (
    <AccordionItem
      value={module.key}
      className="border border-slate-200/90 dark:border-slate-800/90 rounded-2xl overflow-hidden bg-white/60 dark:bg-slate-900/40 backdrop-blur-xs shadow-2xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
        <AccordionTrigger className="flex-1 py-0 hover:no-underline [&>svg]:size-5 [&>svg]:text-muted-foreground/80">
          <div className="flex items-center gap-3.5 text-left">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 transition-transform group-hover:scale-105">
              <ModuleIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-bold text-foreground tracking-tight">
                {module.label}
              </div>
              <div className="text-xs text-muted-foreground font-normal line-clamp-1">
                {module.description}
              </div>
            </div>
          </div>
        </AccordionTrigger>

        {/* Right side: Count badge and Select All Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-slate-200/70 dark:border-slate-800/70 sm:pl-4">
          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-full border shadow-2xs whitespace-nowrap",
              badgeClass,
            )}
          >
            {isAllSelected
              ? "All enabled"
              : `${selectedCount} / ${totalCount} enabled`}
          </span>

          <label
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800 hover:border-primary/40 text-xs font-semibold text-foreground transition-all cursor-pointer shadow-2xs active:scale-97 select-none"
            aria-label={`Select all permissions for ${module.label}`}
          >
            <Checkbox
              checked={
                isAllSelected
                  ? true
                  : isPartiallySelected
                    ? "indeterminate"
                    : false
              }
              onCheckedChange={() =>
                onToggleAllInModule(
                  module.permissions.map((p) => p.id),
                  !isAllSelected,
                )
              }
              className="h-4 w-4"
            />
            <span>Select All</span>
          </label>
        </div>
      </div>

      <AccordionContent className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-950/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {module.permissions.map((perm) => (
            <PermissionActionCard
              key={perm.id}
              id={perm.id}
              name={perm.name}
              description={perm.description}
              isChecked={selectedPermissionIds.includes(perm.id)}
              onToggle={() => onTogglePermission(perm.id)}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
