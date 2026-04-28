"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  LayoutGrid,
  Search,
  Plus,
  Package,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

import { ServiceCard } from "@/components/admin/services/service-card";
import { ServiceFormDialog } from "@/components/admin/services/service-form-dialog";
import { DeleteServiceDialog } from "@/components/admin/services/delete-service-dialog";
import type { AdminService, ServiceStats } from "@/lib/types/services";

interface ServicesPageClientProps {
  services: AdminService[];
  stats: ServiceStats;
}

export function ServicesPageClient({
  services,
  stats,
}: ServicesPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<AdminService | null>(
    null,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingService, setDeletingService] = useState<AdminService | null>(
    null,
  );

  // Filter services by search query
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;
    const query = searchQuery.toLowerCase();
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query) ||
        s.category?.toLowerCase().includes(query),
    );
  }, [services, searchQuery]);

  // Group services by category
  const groupedServices = useMemo(() => {
    const groups: Record<string, AdminService[]> = {};
    for (const service of filteredServices) {
      const key = service.category || "Uncategorized";
      if (!groups[key]) groups[key] = [];
      groups[key].push(service);
    }
    // Sort category keys alphabetically, but "Uncategorized" goes last
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === "Uncategorized") return 1;
      if (b === "Uncategorized") return -1;
      return a.localeCompare(b);
    });
    return sortedKeys.map((key) => ({ category: key, services: groups[key] }));
  }, [filteredServices]);

  function handleEdit(service: AdminService) {
    setEditingService(service);
    setFormOpen(true);
  }

  function handleDelete(service: AdminService) {
    setDeletingService(service);
    setDeleteOpen(true);
  }

  function handleAddNew() {
    setEditingService(null);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Services Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your clinic&apos;s services and pricing
          </p>
        </div>
        <Button
          id="add-service-button"
          onClick={handleAddNew}
          className="gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="py-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Total Services
              </p>
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0">
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

        <Card className="py-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <LayoutGrid className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Categories
              </p>
              <p className="text-xl font-bold text-foreground">
                {stats.activeCategories}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-950/30">
              <TrendingUp className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Avg. Price
              </p>
              <p className="text-xl font-bold text-foreground">
                ₱{Math.round(stats.averagePrice).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          id="service-search"
          type="text"
          placeholder="Search services by name, description, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      {/* Search results indicator */}
      {searchQuery.trim() && (
        <p className="text-sm text-muted-foreground">
          {filteredServices.length} result
          {filteredServices.length !== 1 ? "s" : ""} for &quot;{searchQuery}
          &quot;
        </p>
      )}

      {/* Services Accordion */}
      {groupedServices.length > 0 ? (
        <Accordion
          type="multiple"
          defaultValue={groupedServices.map((g) => g.category)}
          className="space-y-3"
        >
          {groupedServices.map((group) => (
            <AccordionItem
              key={group.category}
              value={group.category}
              className="border rounded-xl px-4 bg-card shadow-sm"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <span className="text-base font-semibold text-foreground">
                    {group.category}
                  </span>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {group.services.length} service
                    {group.services.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {group.services.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Empty className="border rounded-xl py-16">
          <EmptyMedia variant="icon">
            <Package />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>
              {searchQuery.trim() ? "No services found" : "No services yet"}
            </EmptyTitle>
            <EmptyDescription>
              {searchQuery.trim()
                ? "Try adjusting your search query or clear the filter."
                : "Get started by adding your first service."}
            </EmptyDescription>
          </EmptyHeader>
          {!searchQuery.trim() && (
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Service
            </Button>
          )}
        </Empty>
      )}

      {/* Dialogs */}
      <ServiceFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingService(null);
        }}
        service={editingService}
      />

      <DeleteServiceDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeletingService(null);
        }}
        service={deletingService}
      />
    </div>
  );
}
