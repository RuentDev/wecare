"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Coins, Edit, Trash2, Users } from "lucide-react";
import type { AdminService } from "@/lib/types/services";

interface ServiceCardProps {
  service: AdminService;
  onEdit: (service: AdminService) => void;
  onDelete: (service: AdminService) => void;
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  return (
    <Card
      className={`group relative overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        service.isActive
          ? "bg-card border-border"
          : "bg-muted/40 border-border/60 opacity-75"
      }`}
    >
      <CardContent className="p-5">
        {/* Header: Name + Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold text-foreground leading-tight line-clamp-2 flex-1">
            {service.name}
          </h3>
          <Badge
            variant={service.isActive ? "default" : "destructive"}
            className="shrink-0 text-[11px] px-2 py-0.5"
          >
            {service.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Description */}
        {service.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {service.description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-950/30">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground leading-none mb-0.5">
                Duration
              </p>
              <p className="text-sm font-medium text-foreground leading-none">
                {service.durationMinutes} min
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-50 dark:bg-emerald-950/30">
              <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground leading-none mb-0.5">
                Price
              </p>
              <p className="text-sm font-medium text-foreground leading-none">
                ₱{service.price.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-violet-50 dark:bg-violet-950/30">
              <Users className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground leading-none mb-0.5">
                Doctors
              </p>
              <p className="text-sm font-medium text-foreground leading-none">
                {service.doctorCount}
              </p>
            </div>
          </div>
        </div>

        {/* Category Badge */}
        {service.category && (
          <div className="mb-4">
            <Badge variant="secondary" className="text-xs font-normal">
              {service.category}
            </Badge>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border/50">
          <Button
            id={`edit-service-${service.id}`}
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 text-xs h-8"
            onClick={() => onEdit(service)}
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </Button>
          <Button
            id={`delete-service-${service.id}`}
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(service)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
