"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, MapPin, Building2, CheckCircle2, Map } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";

import { getColumns } from "./columns";
import { LocationFormSheet } from "./location-form-sheet";
import { DeleteLocationDialog } from "./delete-location-dialog";
import type { AdminLocation, LocationStats } from "@/lib/types/locations";

interface LocationsPageClientProps {
  locations: AdminLocation[];
  stats: LocationStats;
}

export function LocationsPageClient({
  locations,
  stats,
}: LocationsPageClientProps) {
  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<AdminLocation | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingLocation, setDeletingLocation] = useState<AdminLocation | null>(null);

  function handleEdit(location: AdminLocation) {
    setEditingLocation(location);
    setFormOpen(true);
  }

  function handleDelete(location: AdminLocation) {
    setDeletingLocation(location);
    setDeleteOpen(true);
  }

  function handleAddNew() {
    setEditingLocation(null);
    setFormOpen(true);
  }

  const columns = getColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Locations Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your clinic branches and operational details
          </p>
        </div>
        <Button
          id="add-location-button"
          onClick={handleAddNew}
          className="gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Location
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={locations}
        searchKey="name"
      />

      {/* Dialogs */}
      <LocationFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingLocation(null);
        }}
        location={editingLocation}
      />

      <DeleteLocationDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeletingLocation(null);
        }}
        location={deletingLocation}
      />
    </div>
  );
}
