"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  CalendarOff,
  Clock,
  Loader2,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cancelDoctorLeaveRequest } from "@/lib/actions/doctor-leaves";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { DoctorLeaveRequest } from "@/lib/types/leave-requests";

interface DoctorLeaveHistoryProps {
  requests: DoctorLeaveRequest[];
  onRefresh?: () => void;
  onRequestNew: () => void;
}

export function DoctorLeaveHistory({
  requests,
  onRefresh,
  onRequestNew,
}: DoctorLeaveHistoryProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      const res = await cancelDoctorLeaveRequest(id);
      if (res.success) {
        toast.success("Leave request cancelled");
        if (onRefresh) onRefresh();
      } else {
        toast.error(res.error || "Failed to cancel request");
      }
    } catch {
      toast.error("Failed to cancel request");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: DoctorLeaveRequest["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 rounded-full text-xs font-semibold">
            <Clock className="w-3 h-3 mr-1" /> Pending Review
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-full text-xs font-semibold">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 rounded-full text-xs font-semibold">
            <XCircle className="w-3 h-3 mr-1" /> Declined
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="secondary" className="rounded-full text-xs font-semibold text-muted-foreground">
            Cancelled
          </Badge>
        );
    }
  };

  return (
    <Card className="glassmorphism-card border-none overflow-hidden rounded-[24px]">
      <CardHeader className="bg-linear-to-r from-primary/5 to-transparent border-b border-white/20 p-6 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <CalendarOff className="w-5 h-5 text-primary" />
            My Time Off & Leave Requests
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Track submitted leave applications and administrative decisions.
          </p>
        </div>

        <Button
          onClick={onRequestNew}
          className="rounded-xl text-xs font-semibold gap-1.5 cursor-pointer shadow-sm"
          size="sm"
        >
          <CalendarOff className="w-3.5 h-3.5" /> Request Leave
        </Button>
      </CardHeader>

      <CardContent className="p-6">
        {requests.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground border-2 border-dashed border-white/10 rounded-2xl">
            <Calendar className="w-8 h-8 stroke-1 opacity-40 mb-1" />
            <p className="text-sm font-semibold text-foreground">No leave requests submitted</p>
            <p className="text-xs max-w-sm">
              Need time off for vacation, illness, or personal matters? Submit a leave request for administrative approval.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onRequestNew}
              className="mt-3 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Request Time Off
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className={cn(
                  "p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                  req.status === "pending"
                    ? "bg-amber-500/5 border-amber-500/20"
                    : req.status === "approved"
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : req.status === "rejected"
                        ? "bg-rose-500/5 border-rose-500/20"
                        : "bg-muted/10 border-white/10 opacity-70",
                )}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-foreground">
                      {req.start_date === req.end_date
                        ? format(new Date(`${req.start_date}T00:00:00Z`), "MMMM d, yyyy")
                        : `${format(new Date(`${req.start_date}T00:00:00Z`), "MMM d")} - ${format(new Date(`${req.end_date}T00:00:00Z`), "MMM d, yyyy")}`}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      {req.is_full_day ? "Full Day" : "Partial Hours"}
                    </Badge>
                    {getStatusBadge(req.status)}
                  </div>

                  <p className="text-xs text-foreground font-medium">
                    {req.reason}
                  </p>

                  {req.status === "rejected" && req.rejection_reason && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-500/10 p-2 rounded-lg mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Admin note: {req.rejection_reason}</span>
                    </div>
                  )}

                  {req.status === "approved" && req.reviewer && (
                    <p className="text-[11px] text-muted-foreground">
                      Approved by {req.reviewer.first_name} {req.reviewer.last_name}
                    </p>
                  )}
                </div>

                {req.status === "pending" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer self-start sm:self-center shrink-0"
                    onClick={() => handleCancel(req.id)}
                    disabled={cancellingId === req.id}
                  >
                    {cancellingId === req.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                    )}
                    Cancel Request
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
