"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";

import { getColumns } from "./columns";
import { LocationFormSheet } from "./location-form-sheet";
import { DeleteLocationDialog } from "./delete-location-dialog";
import { LocationsFilters } from "./locations-filters";
import {
  LocationsProvider,
  useLocations,
} from "@/contexts/locations-context";
import type { AdminLocation, LocationStats } from "@/lib/types/locations";

interface LocationsPageClientProps {
  locations: AdminLocation[];
  stats: LocationStats;
}

function LocationsContent() {
  const {
    filteredLocations,
    formOpen,
    setFormOpen,
    editingLocation,
    openCreate,
    openEdit,
    closeForm,
    deleteOpen,
    setDeleteOpen,
    deletingLocation,
    openDelete,
    closeDelete,
  } = useLocations();

  const columns = getColumns({
    onEdit: openEdit,
    onDelete: openDelete,
  });

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <MapPin className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Locations Management
            </h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your clinic branches and operational details.
          </p>
        </div>
        <Button
          id="add-location-button"
          onClick={openCreate}
          className="gap-2 text-xs font-semibold shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Location
        </Button>
      </div>

      {/* Main Table Container with Filter Toolbar */}
      <div className="space-y-4">
        <LocationsFilters />
        <DataTable columns={columns} data={filteredLocations} />
      </div>

      {/* Dialogs */}
      <LocationFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) closeForm();
        }}
        location={editingLocation}
      />

      <DeleteLocationDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) closeDelete();
        }}
        location={deletingLocation}
      />
    </div>
  );
}

export function LocationsPageClient({
  locations,
  stats,
}: LocationsPageClientProps) {
  return (
    <LocationsProvider locations={locations} stats={stats}>
      <LocationsContent />
    </LocationsProvider>
  );
}
