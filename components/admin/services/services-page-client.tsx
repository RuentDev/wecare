"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Stethoscope } from "lucide-react";
import {
  ServicesProvider,
  useServices,
} from "@/components/admin/services/services-context";
import { ServicesFilters } from "@/components/admin/services/services-filters";
import { ServicesTable } from "@/components/admin/services/services-table";
import { ServicesPagination } from "@/components/admin/services/services-pagination";
import { ServiceFormDialog } from "@/components/admin/services/service-form-dialog";
import { DeleteServiceDialog } from "@/components/admin/services/delete-service-dialog";
import { ImportServicesDialog } from "@/components/admin/services/import-services-dialog";
import type { AdminService } from "@/lib/types/services";

interface ServicesPageClientProps {
  services: AdminService[];
  categories: { id: string; name: string }[];
}

function ServicesContent() {
  const {
    categories,
    openCreateDialog,
    formOpen,
    setFormOpen,
    editingService,
    closeFormDialog,
    deleteOpen,
    setDeleteOpen,
    deletingService,
    importOpen,
    setImportOpen,
  } = useServices();

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Services Management
            </h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your clinic&apos;s healthcare services, consultation pricing, durations, and medical categories.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            id="import-service-button"
            variant="outline"
            onClick={() => setImportOpen(true)}
            className="gap-2 text-xs font-semibold shadow-xs hover:bg-muted"
          >
            <Upload className="w-3.5 h-3.5" />
            Import CSV
          </Button>
          <Button
            id="add-service-button"
            onClick={openCreateDialog}
            className="gap-2 text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="space-y-4">
        <ServicesFilters />
        <ServicesTable />
        <ServicesPagination />
      </div>

      {/* Dialog Modals */}
      <ServiceFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) closeFormDialog();
        }}
        service={editingService}
        categories={categories}
      />

      <DeleteServiceDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        service={deletingService}
      />

      <ImportServicesDialog
        open={importOpen}
        onOpenChange={setImportOpen}
      />
    </div>
  );
}

export function ServicesPageClient({
  services,
  categories,
}: ServicesPageClientProps) {
  return (
    <ServicesProvider initialServices={services} categories={categories}>
      <ServicesContent />
    </ServicesProvider>
  );
}
