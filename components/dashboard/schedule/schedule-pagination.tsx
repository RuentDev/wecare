"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSchedule } from "./schedule-context";

export function SchedulePagination() {
  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalFilteredCount,
  } = useSchedule();

  if (totalFilteredCount === 0) {
    return null;
  }

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalFilteredCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
      {/* Records Info & Page Size */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground order-2 sm:order-1">
        <span>
          Showing <span className="font-semibold text-foreground">{startRecord}</span> to{" "}
          <span className="font-semibold text-foreground">{endRecord}</span> of{" "}
          <span className="font-semibold text-foreground">{totalFilteredCount}</span> visits
        </span>

        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(val) => {
              setPageSize(Number(val));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-18 rounded-lg text-xs bg-card border-border/80">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border">
              <SelectItem value="10" className="text-xs rounded-lg">10</SelectItem>
              <SelectItem value="25" className="text-xs rounded-lg">25</SelectItem>
              <SelectItem value="50" className="text-xs rounded-lg">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Page Navigation Controls */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <span className="text-xs text-muted-foreground mr-2">
          Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
          <span className="font-semibold text-foreground">{totalPages}</span>
        </span>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-border/80 disabled:opacity-40"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          aria-label="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-border/80 disabled:opacity-40"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-border/80 disabled:opacity-40"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-border/80 disabled:opacity-40"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
