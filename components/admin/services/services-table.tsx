"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Package,
  Plus,
  RotateCcw,
} from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  useServices,
  ServiceSortField,
} from "./services-context";
import type { AdminService } from "@/lib/types/services";

export function ServicesTable() {
  const {
    paginatedServices,
    sortField,
    sortOrder,
    handleSort,
    hasActiveFilters,
    resetFilters,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    totalFilteredCount,
  } = useServices();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderSortIndicator = (field: ServiceSortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/60 transition-colors group-hover:text-foreground" />
      );
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-primary font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-primary font-bold" />
    );
  };

  if (totalFilteredCount === 0) {
    return (
      <div className="rounded-xl border border-border/70 bg-card p-12 shadow-xs">
        <Empty className="py-8">
          <EmptyMedia variant="icon">
            <Package className="w-8 h-8 text-muted-foreground" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>
              {hasActiveFilters ? "No matching services found" : "No services registered"}
            </EmptyTitle>
            <EmptyDescription>
              {hasActiveFilters
                ? "Try adjusting your search criteria or clearing applied filters."
                : "Get started by adding your clinic's first medical service or procedure."}
            </EmptyDescription>
          </EmptyHeader>
          <div className="flex items-center justify-center gap-3 mt-4">
            {hasActiveFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Clear Filters
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={openCreateDialog}
                className="gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Add Service
              </Button>
            )}
          </div>
        </Empty>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-muted/40 border-b border-border/70">
          <TableRow className="hover:bg-transparent">
            {/* Service Name */}
            <TableHead className="py-3.5 pl-4 pr-3 text-left">
              <button
                type="button"
                onClick={() => handleSort("name")}
                className="group flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
              >
                <span>Service</span>
                {renderSortIndicator("name")}
              </button>
            </TableHead>

            {/* Category */}
            <TableHead className="py-3.5 px-3 text-left">
              <button
                type="button"
                onClick={() => handleSort("category")}
                className="group flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
              >
                <span>Category</span>
                {renderSortIndicator("category")}
              </button>
            </TableHead>

            {/* Duration */}
            <TableHead className="py-3.5 px-3 text-left">
              <button
                type="button"
                onClick={() => handleSort("durationMinutes")}
                className="group flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
              >
                <span>Duration</span>
                {renderSortIndicator("durationMinutes")}
              </button>
            </TableHead>

            {/* Price */}
            <TableHead className="py-3.5 px-3 text-left">
              <button
                type="button"
                onClick={() => handleSort("price")}
                className="group flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
              >
                <span>Price</span>
                {renderSortIndicator("price")}
              </button>
            </TableHead>

            {/* Doctors */}
            <TableHead className="py-3.5 px-3 text-left">
              <button
                type="button"
                onClick={() => handleSort("doctorCount")}
                className="group flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
              >
                <span>Doctors</span>
                {renderSortIndicator("doctorCount")}
              </button>
            </TableHead>

            {/* Status */}
            <TableHead className="py-3.5 px-3 text-left">
              <button
                type="button"
                onClick={() => handleSort("isActive")}
                className="group flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
              >
                <span>Status</span>
                {renderSortIndicator("isActive")}
              </button>
            </TableHead>

            {/* Actions */}
            <TableHead className="py-3.5 pr-4 pl-3 text-right">
              <span className="text-xs font-semibold text-muted-foreground">
                Actions
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedServices.map((service: AdminService) => (
            <TableRow
              key={service.id}
              className="hover:bg-muted/30 transition-colors border-b border-border/50 group"
            >
              {/* Service Name & Description */}
              <TableCell className="py-3.5 pl-4 pr-3 align-middle">
                <div className="flex flex-col gap-0.5 max-w-sm sm:max-w-md">
                  <span className="font-semibold text-sm text-foreground tracking-tight line-clamp-1">
                    {service.name}
                  </span>
                  {service.description ? (
                    <span className="text-xs text-muted-foreground line-clamp-1 font-normal">
                      {service.description}
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground/60 italic font-normal">
                      No description provided
                    </span>
                  )}
                </div>
              </TableCell>

              {/* Category */}
              <TableCell className="py-3.5 px-3 align-middle">
                {service.category ? (
                  <Badge
                    variant="outline"
                    className="font-normal text-xs bg-muted/30 border-border text-foreground px-2 py-0.5"
                  >
                    {service.category.name}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground/60 italic">
                    Uncategorized
                  </span>
                )}
              </TableCell>

              {/* Duration */}
              <TableCell className="py-3.5 px-3 align-middle">
                <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{service.durationMinutes} mins</span>
                </div>
              </TableCell>

              {/* Price */}
              <TableCell className="py-3.5 px-3 align-middle">
                <span className="text-sm font-semibold font-mono text-foreground">
                  {formatCurrency(service.price)}
                </span>
              </TableCell>

              {/* Doctors Linked */}
              <TableCell className="py-3.5 px-3 align-middle">
                <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>
                    {service.doctorCount}{" "}
                    {service.doctorCount === 1 ? "doc" : "docs"}
                  </span>
                </div>
              </TableCell>

              {/* Status */}
              <TableCell className="py-3.5 px-3 align-middle">
                {service.isActive ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:border-emerald-800 dark:text-emerald-400 gap-1.5 text-xs font-medium py-0.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Active
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-slate-500/10 text-slate-700 border-slate-300 dark:border-slate-700 dark:text-slate-400 gap-1.5 text-xs font-medium py-0.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                    Inactive
                  </Badge>
                )}
              </TableCell>

              {/* Actions Dropdown */}
              <TableCell className="py-3.5 pr-4 pl-3 align-middle text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      id={`service-actions-${service.id}`}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                      <span className="sr-only">Open actions menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={() => openEditDialog(service)}
                      className="cursor-pointer gap-2 text-xs"
                    >
                      <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                      Edit Service
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog(service)}
                      className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Service
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
