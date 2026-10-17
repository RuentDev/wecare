"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";

export function DashboardSidebarFooter() {
  const { toggleSidebar } = useSidebar();

  return (
    <>
      {/* Collapsed Rail View: Centered Expand Icon with Tooltip */}
      <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center py-1 w-full">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="size-10 rounded-xl text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors active:scale-95"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" align="center">
            Expand Sidebar
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Expanded View: Clean Collapse Button */}
      <div className="flex group-data-[collapsible=icon]:hidden items-center justify-between w-full">
        <Button
          variant="ghost"
          onClick={toggleSidebar}
          className="flex items-center justify-between w-full h-9 px-3 rounded-xl text-xs font-medium text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors active:scale-95"
          aria-label="Collapse sidebar"
        >
          <span>Collapse Sidebar</span>
          <ChevronLeft className="size-4" />
        </Button>
      </div>
    </>
  );
}

