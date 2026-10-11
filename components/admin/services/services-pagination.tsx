"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useServices } from "./services-context";

export function ServicesPagination() {
  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalFilteredCount,
  } = useServices();

  if (totalFilteredCount === 0) {
    return null;
  }

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalFilteredCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-1">
      {/* Page Size & Record Counts */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground order-2 sm:order-1">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => setPageSize(Number(val))}
          >
            <SelectTrigger className="h-8 w-[70px] text-xs bg-background border-border/70 shadow-xs">
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <span className="hidden sm:inline-block text-border">•</span>

        <span>
          Showing <span className="font-semibold text-foreground">{startRecord}</span> to{" "}
          <span className="font-semibold text-foreground">{endRecord}</span> of{" "}
          <span className="font-semibold text-foreground">{totalFilteredCount}</span> entries
        </span>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <span className="text-xs text-muted-foreground mr-2 font-medium">
          Page {currentPage} of {totalPages}
        </span>

        {/* First page */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage <= 1}
          aria-label="First page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </Button>

        {/* Previous page */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>

        {/* Next page */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage >= totalPages}
          aria-label="Last page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
