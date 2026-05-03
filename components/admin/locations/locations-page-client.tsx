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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="py-0 border-white/20 bg-white/30 backdrop-blur-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Total Locations
              </p>
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0 border-white/20 bg-white/30 backdrop-blur-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Active
              </p>
              <p className="text-xl font-bold text-foreground">
                {stats.active}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0 border-white/20 bg-white/30 backdrop-blur-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Inactive
              </p>
              <p className="text-xl font-bold text-foreground">
                {stats.inactive}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0 border-white/20 bg-white/30 backdrop-blur-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-950/30">
              <Map className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Cities Covered
              </p>
              <p className="text-xl font-bold text-foreground">
                {stats.cities}
              </p>
            </div>
          </CardContent>
        </Card>
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
