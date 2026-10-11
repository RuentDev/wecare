"use client";

import { useState, useCallback, useMemo } from "react";
import { format } from "date-fns";
import {
  CalendarOff,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Calendar,
  Send,
  User,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  approveLeaveRequest,
  rejectLeaveRequest,
  getAdminLeaveRequests,
  getConflictingAppointments,
} from "@/lib/actions/doctor-leaves";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  DoctorLeaveRequest,
  ConflictingAppointment,
} from "@/lib/types/leave-requests";

interface DoctorLeavesClientProps {
  initialLeaveRequests: DoctorLeaveRequest[];
}

export function DoctorLeavesClient({
  initialLeaveRequests,
}: DoctorLeavesClientProps) {
  const [requests, setRequests] =
    useState<DoctorLeaveRequest[]>(initialLeaveRequests);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  // Approval Modal State
  const [approvingRequest, setApprovingRequest] =
    useState<DoctorLeaveRequest | null>(null);
  const [conflicts, setConflicts] = useState<ConflictingAppointment[]>([]);
  const [isLoadingConflicts, setIsLoadingConflicts] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Rejection Modal State
  const [rejectingRequest, setRejectingRequest] =
    useState<DoctorLeaveRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const refreshRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminLeaveRequests(statusFilter);
      if (res.success && res.data) {
        setRequests(res.data);
      }
    } catch {
      toast.error("Failed to refresh leave requests");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  // Open Approval Dialog and fetch conflicts
  const handleOpenApprove = async (req: DoctorLeaveRequest) => {
    setApprovingRequest(req);
    setIsLoadingConflicts(true);
    try {
      const res = await getConflictingAppointments(
        req.doctor_id,
        req.start_date,
        req.end_date,
      );
      if (res.success && res.data) {
        setConflicts(res.data);
      } else {
        setConflicts([]);
      }
    } catch {
      setConflicts([]);
    } finally {
      setIsLoadingConflicts(false);
    }
  };

  // Execute Approval
  const handleConfirmApprove = async () => {
    if (!approvingRequest) return;
    setIsApproving(true);
    try {
      const res = await approveLeaveRequest(approvingRequest.id);
      if (res.success) {
        toast.success("Doctor leave approved", {
          description:
            res.affectedAppointmentsCount && res.affectedAppointmentsCount > 0
              ? `Approved! ${res.affectedAppointmentsCount} conflicting appointments cancelled and patients notified via email.`
              : "Approved and schedule blocked for this doctor.",
        });
        setApprovingRequest(null);
        refreshRequests();
      } else {
        toast.error(res.error || "Failed to approve leave");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsApproving(false);
    }
  };

  // Open Rejection Dialog
  const handleOpenReject = (req: DoctorLeaveRequest) => {
    setRejectingRequest(req);
    setRejectionReason("");
  };

  // Execute Rejection
  const handleConfirmReject = async () => {
    if (!rejectingRequest) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setIsRejecting(true);
    try {
      const res = await rejectLeaveRequest(
        rejectingRequest.id,
        rejectionReason.trim(),
      );
      if (res.success) {
        toast.success("Leave request declined", {
          description: "The doctor has been notified in their schedule portal.",
        });
        setRejectingRequest(null);
        refreshRequests();
      } else {
        toast.error(res.error || "Failed to decline request");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsRejecting(false);
    }
  };

  // Filter requests
  const filteredRequests = useMemo(() => {
    if (statusFilter === "all") return requests;
    return requests.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter]);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          value={statusFilter}
          onValueChange={(val) => setStatusFilter(val)}
          className="w-auto"
        >
          <TabsList className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 h-10 p-1">
            <TabsTrigger
              value="all"
              className="rounded-xl text-xs font-semibold px-4 cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              All Requests ({requests.length})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="rounded-xl text-xs font-semibold px-4 cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-white gap-1.5"
            >
              Pending
              {pendingCount > 0 && (
                <Badge className="bg-amber-500 text-white border-none text-[10px] h-4 px-1.5 min-w-4 flex justify-center">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="rounded-xl text-xs font-semibold px-4 cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Approved
            </TabsTrigger>
            <TabsTrigger
              value="rejected"
              className="rounded-xl text-xs font-semibold px-4 cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Declined
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            Updating queue...
          </div>
        )}
      </div>

      {/* Leave Requests Table Card */}
      <Card className="glassmorphism-card border-none overflow-hidden rounded-[24px]">
        <CardHeader className="bg-linear-to-r from-primary/5 to-transparent border-b border-white/20 p-6">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <CalendarOff className="w-5 h-5 text-primary" />
            Doctor Leave & Absence Review Queue
          </CardTitle>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Review time-off requests submitted by clinical practitioners, assess appointment conflicts, and notify patients.
          </p>
        </CardHeader>

        <CardContent className="p-6">
          {filteredRequests.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground border-2 border-dashed border-white/10 rounded-2xl">
              <Calendar className="w-10 h-10 stroke-1 opacity-30 mb-1" />
              <p className="text-base font-bold text-foreground">No leave requests found</p>
              <p className="text-xs max-w-sm">
                There are no leave applications matching the selected status filter.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((req) => {
                const doctorUser = req.doctors?.users;
                const doctorName = doctorUser
                  ? `Dr. ${doctorUser.first_name} ${doctorUser.last_name}`
                  : "Practitioner";
                const conflictCount = req.conflictingAppointmentsCount || 0;

                return (
                  <div
                    key={req.id}
                    className={cn(
                      "p-4 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4",
                      req.status === "pending"
                        ? "bg-white/60 dark:bg-slate-900/60 border-amber-500/30 shadow-xs"
                        : "bg-white/30 dark:bg-slate-900/30 border-white/10 opacity-80",
                    )}
                  >
                    {/* Left: Doctor & Date details */}
                    <div className="flex items-start gap-4">
                      <Avatar className="h-11 w-11 rounded-2xl border border-white/20 shadow-xs shrink-0">
                        <AvatarImage src={doctorUser?.avatar_url || ""} />
                        <AvatarFallback className="rounded-2xl font-bold bg-primary/10 text-primary">
                          {doctorUser?.first_name?.[0]}
                          {doctorUser?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-foreground">
                            {doctorName}
                          </span>
                          {req.doctors?.specialization && (
                            <Badge variant="outline" className="text-[10px] font-semibold">
                              {req.doctors.specialization}
                            </Badge>
                          )}
                          <Badge
                            className={cn(
                              "rounded-full text-[10px] font-semibold",
                              req.status === "pending"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                : req.status === "approved"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : req.status === "rejected"
                                    ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                    : "bg-muted text-muted-foreground",
                            )}
                          >
                            {req.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>
                            {req.start_date === req.end_date
                              ? format(new Date(`${req.start_date}T00:00:00Z`), "MMMM d, yyyy")
                              : `${format(new Date(`${req.start_date}T00:00:00Z`), "MMM d")} - ${format(new Date(`${req.end_date}T00:00:00Z`), "MMM d, yyyy")}`}
                          </span>
                          <span className="text-muted-foreground font-normal">
                            ({req.is_full_day ? "Full Day" : "Partial Hours"})
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">Reason:</span> {req.reason}
                        </p>

                        {req.status === "rejected" && req.rejection_reason && (
                          <p className="text-[11px] text-rose-600 font-medium">
                            Declined Note: {req.rejection_reason}
                          </p>
                        )}

                        {req.status === "approved" && req.reviewer && (
                          <p className="text-[11px] text-muted-foreground">
                            Approved by {req.reviewer.first_name} {req.reviewer.last_name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Conflict Warning & Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                      {/* Conflict Indicator */}
                      {req.status === "pending" && (
                        <div className="flex items-center gap-1.5 text-xs">
                          {conflictCount > 0 ? (
                            <Badge
                              variant="outline"
                              className="bg-rose-500/10 text-rose-600 border-rose-500/30 gap-1 rounded-xl py-1 px-2.5 font-bold"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {conflictCount} {conflictCount === 1 ? "Appointment" : "Appointments"} at Risk
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1 rounded-xl py-1 px-2.5 font-semibold"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Zero Conflicts
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Action Buttons for Pending Requests */}
                      {req.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
                            onClick={() => handleOpenReject(req)}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                          </Button>

                          <Button
                            size="sm"
                            className="rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm"
                            onClick={() => handleOpenApprove(req)}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve Leave
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* APPROVAL & CONFLICT RESOLUTION MODAL */}
      <Dialog
        open={!!approvingRequest}
        onOpenChange={(open) => !open && setApprovingRequest(null)}
      >
        <DialogContent className="sm:max-w-[540px] rounded-3xl p-6 glassmorphism border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Approve Doctor Leave Request
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review affected appointments before granting leave.
            </DialogDescription>
          </DialogHeader>

          {approvingRequest && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-muted/20 border border-white/10 space-y-1">
                <p className="font-bold text-sm text-foreground">
                  {approvingRequest.doctors?.users
                    ? `Dr. ${approvingRequest.doctors.users.first_name} ${approvingRequest.doctors.users.last_name}`
                    : "Doctor"}
                </p>
                <p className="text-muted-foreground">
                  Dates:{" "}
                  <span className="font-semibold text-foreground">
                    {approvingRequest.start_date} to {approvingRequest.end_date}
                  </span>{" "}
                  ({approvingRequest.is_full_day ? "Full Day" : "Partial Hours"})
                </p>
                <p className="text-muted-foreground">
                  Reason:{" "}
                  <span className="font-semibold text-foreground">
                    {approvingRequest.reason}
                  </span>
                </p>
              </div>

              {/* Conflict Analysis Section */}
              {isLoadingConflicts ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <p>Analyzing conflicting patient appointments...</p>
                </div>
              ) : conflicts.length > 0 ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {conflicts.length} Booked Appointment(s) Affected
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Approving this leave will automatically cancel these appointments and send an automated email to each patient advising them of the doctor&apos;s unavailability with reschedule instructions.
                    </p>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {conflicts.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-2.5 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/10 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-foreground">
                            {apt.patient_name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {apt.service_name} • {apt.appointment_date} at {apt.start_time}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary">
                          {apt.patient_email}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  No booked appointments are affected during this leave period.
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-white/10">
            <Button
              variant="outline"
              className="rounded-xl cursor-pointer"
              onClick={() => setApprovingRequest(null)}
              disabled={isApproving}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 cursor-pointer shadow-md"
              onClick={handleConfirmApprove}
              disabled={isApproving || isLoadingConflicts}
            >
              {isApproving && <Loader2 className="w-4 h-4 animate-spin" />}
              <Send className="w-3.5 h-3.5" />
              Approve & Notify Patients
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REJECTION MODAL */}
      <Dialog
        open={!!rejectingRequest}
        onOpenChange={(open) => !open && setRejectingRequest(null)}
      >
        <DialogContent className="sm:max-w-[440px] rounded-3xl p-6 glassmorphism border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-rose-600">
              <XCircle className="w-5 h-5 text-rose-600" />
              Decline Doctor Leave Request
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide an explanatory note for why this leave application cannot be approved.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <label className="font-semibold text-foreground">
              Rejection Reason / Administrative Feedback
            </label>
            <Input
              placeholder="e.g. Inadequate clinical coverage, critical clinic surgery day"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="rounded-xl font-medium"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-white/10">
            <Button
              variant="outline"
              className="rounded-xl cursor-pointer"
              onClick={() => setRejectingRequest(null)}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl font-semibold gap-2 cursor-pointer shadow-md"
              onClick={handleConfirmReject}
              disabled={isRejecting}
            >
              {isRejecting && <Loader2 className="w-4 h-4 animate-spin" />}
              Decline Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
