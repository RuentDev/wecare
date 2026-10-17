"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  getAvailableClinicStaff,
  addStaffToConversation,
  removeStaffFromConversation,
} from "@/lib/actions/chat";
import { ConversationSummary, ChatParticipant, StaffCandidate } from "@/types/chat";
import {
  Users,
  UserPlus,
  UserMinus,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Search,
  Check,
  Loader2,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface CareTeamDialogProps {
  conversation: ConversationSummary;
  currentUserId: string;
  currentUserRole: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamUpdated?: () => void;
}

export function CareTeamDialog({
  conversation,
  currentUserId,
  currentUserRole,
  isOpen,
  onOpenChange,
  onTeamUpdated,
}: CareTeamDialogProps) {
  const [activeTab, setActiveTab] = useState<"members" | "add">("members");
  const [candidates, setCandidates] = useState<StaffCandidate[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  // Removal state for AlertDialog
  const [staffToRemove, setStaffToRemove] = useState<ChatParticipant | null>(null);
  const [isSubmittingRemove, setIsSubmittingRemove] = useState(false);

  const canManageTeam =
    currentUserRole === "doctor" ||
    currentUserRole === "admin" ||
    conversation.participants.some(
      (p) => p.userId === currentUserId && p.isAdmin
    );

  // Load candidates when dialog is opened and user is on "add" tab
  useEffect(() => {
    if (!isOpen) {
      setSelectedStaffId(null);
      setSearchQuery("");
      setStaffToRemove(null);
      setActiveTab("members");
      return;
    }

    if (canManageTeam) {
      let isMounted = true;
      setIsLoadingCandidates(true);

      getAvailableClinicStaff(conversation.id)
        .then((res) => {
          if (!isMounted) return;
          if (res.success && res.data) {
            setCandidates(res.data);
          } else {
            toast.error(res.error || "Failed to load clinic staff.");
          }
        })
        .finally(() => {
          if (isMounted) setIsLoadingCandidates(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [conversation.id, isOpen, canManageTeam]);

  // Filter candidates by search term
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return candidates;
    const q = searchQuery.toLowerCase();
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q)
    );
  }, [candidates, searchQuery]);

  // Deduplicate participants by userId for clean rendering
  const deduplicatedParticipants = useMemo(() => {
    const map = new Map<string, ChatParticipant>();
    for (const p of conversation.participants) {
      if (!map.has(p.userId)) {
        map.set(p.userId, p);
      }
    }
    return Array.from(map.values());
  }, [conversation.participants]);

  // Sort: Doctor first, Patient second, then added care team staff
  const sortedParticipants = useMemo(() => {
    return [...deduplicatedParticipants].sort((a, b) => {
      const order = { doctor: 0, patient: 1, nurse: 2, staff: 3, admin: 4 };
      const aVal = order[a.userRole as keyof typeof order] ?? 5;
      const bVal = order[b.userRole as keyof typeof order] ?? 5;
      return aVal - bVal;
    });
  }, [deduplicatedParticipants]);

  const handleAddStaff = async () => {
    if (!selectedStaffId) return;

    setIsSubmittingAdd(true);
    try {
      const res = await addStaffToConversation(conversation.id, selectedStaffId);
      if (res.success) {
        toast.success("Staff member successfully added to the care team.");
        setSelectedStaffId(null);
        setActiveTab("members");
        onTeamUpdated?.();
      } else {
        toast.error(res.error || "Could not add staff member.");
      }
    } catch {
      toast.error("An unexpected error occurred while adding staff.");
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const handleConfirmRemoveStaff = async () => {
    if (!staffToRemove) return;

    setIsSubmittingRemove(true);
    try {
      const res = await removeStaffFromConversation(conversation.id, staffToRemove.userId);
      if (res.success) {
        toast.success(`Removed ${staffToRemove.userName} from the care team.`);
        setStaffToRemove(null);
        onTeamUpdated?.();
      } else {
        toast.error(res.error || "Could not remove staff member.");
      }
    } catch {
      toast.error("An unexpected error occurred while removing staff.");
    } finally {
      setIsSubmittingRemove(false);
    }
  };

  const formatJoinedDate = (isoString?: string | null): string => {
    if (!isoString) return "Active";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Active";
    }
  };

  // Reusable Member Card Rendering
  const renderMemberItem = (p: ChatParticipant) => {
    const isCurrentUser = p.userId === currentUserId;
    const isPatient = p.userRole === "patient";
    const isDoctor = p.userRole === "doctor";
    const isRemovableStaff =
      (p.userRole === "nurse" || p.userRole === "staff") && canManageTeam;

    return (
      <div
        key={`care-team-member-${p.id}-${p.userId}`}
        className="flex items-center justify-between gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-border/70 bg-card hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <Avatar className="size-8 sm:size-9 border border-border shrink-0">
            <AvatarImage src={p.avatarUrl || undefined} />
            <AvatarFallback className="bg-teal-100 text-xs font-semibold text-teal-800 dark:bg-teal-950 dark:text-teal-200">
              {p.userName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-semibold text-foreground truncate max-w-[130px] sm:max-w-[200px]">
                {p.userName}
              </span>
              {isCurrentUser && (
                <span className="text-[10px] text-muted-foreground font-normal shrink-0">
                  (You)
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-0.5">
              {isDoctor && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900 text-[10px] px-1.5 py-0 capitalize shrink-0"
                >
                  Lead Physician
                </Badge>
              )}
              {isPatient && (
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900 text-[10px] px-1.5 py-0 capitalize shrink-0"
                >
                  Patient
                </Badge>
              )}
              {p.userRole === "nurse" && (
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900 text-[10px] px-1.5 py-0 capitalize shrink-0"
                >
                  Nurse
                </Badge>
              )}
              {p.userRole === "staff" && (
                <Badge
                  variant="outline"
                  className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 text-[10px] px-1.5 py-0 capitalize shrink-0"
                >
                  Clinic Staff
                </Badge>
              )}

              <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
                <Calendar className="size-2.5 opacity-60" />
                {formatJoinedDate(p.joinedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Action: Protected Lock or Doctor Remove Action */}
        <div className="shrink-0">
          {isPatient || isDoctor ? (
            <div
              className="flex items-center gap-1 text-[11px] text-muted-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 bg-muted/40 rounded-lg select-none"
              title={
                isPatient
                  ? "Patients cannot be removed from consultation channels."
                  : "Primary practitioner cannot be removed."
              }
            >
              <Lock className="size-3 text-muted-foreground/70" />
              <span className="hidden sm:inline text-[10px] font-medium">
                Protected
              </span>
            </div>
          ) : isRemovableStaff ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStaffToRemove(p)}
              className="size-8 p-0 sm:size-auto sm:h-8 sm:px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg gap-1 shrink-0 transition-colors"
              aria-label={`Remove ${p.userName} from care team`}
            >
              <UserMinus className="size-3.5" />
              <span className="hidden sm:inline">Remove</span>
            </Button>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-[540px] max-h-[88dvh] p-0 overflow-hidden flex flex-col rounded-2xl border border-border/80 shadow-2xl">
          {/* Header */}
          <DialogHeader className="p-3.5 sm:p-5 pb-3 sm:pb-4 border-b border-border/70 bg-card shrink-0 pr-10">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 shrink-0">
                <Users className="size-4 sm:size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-sm sm:text-base font-semibold tracking-tight text-foreground truncate">
                  {canManageTeam ? "Care Team Management" : "Your Care Team"}
                </DialogTitle>
                <DialogDescription className="text-[11px] sm:text-xs text-muted-foreground truncate">
                  {canManageTeam
                    ? "Manage clinical participants and staff delegation for this consultation."
                    : "Clinical practitioners assigned to your consultation."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* VIEW 1: Patient Read-Only View (Zero Tabs) */}
          {!canManageTeam ? (
            <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 space-y-3 sm:space-y-4">
              {/* HIPAA Protected Consultation Callout */}
              <div className="flex items-start gap-2.5 rounded-xl border border-teal-500/20 bg-teal-50/60 p-2.5 sm:p-3 text-xs leading-relaxed text-teal-900 dark:border-teal-900/40 dark:bg-teal-950/30 dark:text-teal-200">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal-600 dark:text-teal-400" />
                <p className="text-[11px] sm:text-xs">
                  <strong className="font-semibold text-teal-950 dark:text-teal-100">
                    Confidential Clinical Encounter:
                  </strong>{" "}
                  Your consultation is handled by certified medical personnel and encrypted under HIPAA Security Standards § 164.312.
                </p>
              </div>

              {/* Members List */}
              <div className="space-y-2">
                {sortedParticipants.map(renderMemberItem)}
              </div>
            </div>
          ) : (
            /* VIEW 2: Doctor / Admin View (Full Tabs: Active Team & Add Member) */
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as "members" | "add")}
              className="w-full flex-1 flex flex-col min-h-0 overflow-hidden"
            >
              <div className="px-3.5 sm:px-5 pt-2.5 sm:pt-3 border-b border-border/50 bg-muted/20 shrink-0">
                <TabsList className="grid w-full grid-cols-2 h-9 p-1 bg-muted/60">
                  <TabsTrigger value="members" className="text-xs font-medium gap-1.5">
                    <Users className="size-3.5" />
                    Active Team ({deduplicatedParticipants.length})
                  </TabsTrigger>
                  <TabsTrigger value="add" className="text-xs font-medium gap-1.5">
                    <UserPlus className="size-3.5" />
                    Add Member
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* TAB 1: Active Care Team List */}
              <TabsContent
                value="members"
                className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 space-y-3 sm:space-y-4 m-0 focus-visible:outline-none"
              >
                {/* HIPAA Security & Continuity Callout */}
                <div className="flex items-start gap-2.5 rounded-xl border border-teal-500/20 bg-teal-50/60 p-2.5 sm:p-3 text-xs leading-relaxed text-teal-900 dark:border-teal-900/40 dark:bg-teal-950/30 dark:text-teal-200">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal-600 dark:text-teal-400" />
                  <p className="text-[11px] sm:text-xs">
                    <strong className="font-semibold text-teal-950 dark:text-teal-100">
                      Protected Clinical Consultation:
                    </strong>{" "}
                    Lead physician and patient memberships are permanent. Delegated nurses and staff members only view messages sent during their enrollment.
                  </p>
                </div>

                {/* Members List */}
                <div className="space-y-2">
                  {sortedParticipants.map(renderMemberItem)}
                </div>
              </TabsContent>

              {/* TAB 2: Add New Care Team Member */}
              <TabsContent
                value="add"
                className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 space-y-3 sm:space-y-4 m-0 focus-visible:outline-none"
              >
                {/* Doctor Privacy Notice */}
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-50/80 p-2.5 sm:p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                  <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <p className="text-[11px] sm:text-xs">
                    <strong className="font-semibold text-amber-950 dark:text-amber-100">
                      Privacy Invariant:
                    </strong>{" "}
                    Newly invited nurses and staff will only be permitted to view messages sent{" "}
                    <em className="font-semibold underline">after</em> they join. Prior clinical history remains confidential.
                  </p>
                </div>

                {/* Candidate Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search nurses and clinic staff..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 sm:h-9 text-xs rounded-xl"
                  />
                </div>

                {/* Staff Selection List */}
                <div className="space-y-1.5 max-h-[180px] sm:max-h-[220px] overflow-y-auto pr-1">
                  {isLoadingCandidates ? (
                    <div className="flex h-28 sm:h-32 items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="size-4 animate-spin text-teal-600" />
                      Loading staff directory...
                    </div>
                  ) : filteredCandidates.length === 0 ? (
                    <div className="flex h-28 sm:h-32 flex-col items-center justify-center gap-1 text-center text-xs text-muted-foreground">
                      <Users className="size-5 sm:size-6 text-muted-foreground/40" />
                      <p>No available clinic staff found.</p>
                    </div>
                  ) : (
                    filteredCandidates.map((staff) => {
                      const isSelected = selectedStaffId === staff.id;
                      const isDisabled = staff.isAlreadyParticipant;

                      return (
                        <button
                          key={`staff-candidate-${staff.id}`}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => setSelectedStaffId(staff.id)}
                          className={`flex w-full items-center justify-between rounded-xl border p-2.5 text-left text-xs transition-colors ${
                            isDisabled
                              ? "cursor-not-allowed border-muted bg-muted/40 opacity-60"
                              : isSelected
                              ? "border-teal-600 bg-teal-50/50 dark:border-teal-500 dark:bg-teal-950/30"
                              : "border-border hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex flex-col gap-0.5 min-w-0 flex-1 mr-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground truncate">
                                {staff.name}
                              </span>
                              <Badge
                                variant="secondary"
                                className="px-1.5 py-0 text-[10px] capitalize shrink-0"
                              >
                                {staff.role}
                              </Badge>
                            </div>
                            <span className="text-[11px] text-muted-foreground truncate max-w-[170px] sm:max-w-none">
                              {staff.email}
                            </span>
                          </div>

                          <div className="shrink-0">
                            {isDisabled ? (
                              <span className="text-[11px] text-muted-foreground font-medium">
                                Enrolled
                              </span>
                            ) : isSelected ? (
                              <div className="flex size-5 items-center justify-center rounded-full bg-teal-600 text-white shadow-xs">
                                <Check className="size-3" />
                              </div>
                            ) : null}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 sm:pt-3 border-t border-border/60 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("members")}
                    disabled={isSubmittingAdd}
                    className="h-8 text-xs rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddStaff}
                    disabled={!selectedStaffId || isSubmittingAdd}
                    className="h-8 text-xs bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 rounded-xl"
                  >
                    {isSubmittingAdd ? (
                      <>
                        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add to Care Team"
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Explicit AlertDialog Confirmation for Staff Removal */}
      <AlertDialog
        open={staffToRemove !== null}
        onOpenChange={(open) => !open && setStaffToRemove(null)}
      >
        <AlertDialogContent className="w-[calc(100%-1.5rem)] sm:max-w-[420px] max-h-[90dvh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
          <AlertDialogHeader>
            <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-2">
              <UserMinus className="size-4 sm:size-5" />
            </div>
            <AlertDialogTitle className="text-sm sm:text-base font-semibold">
              Remove {staffToRemove?.userName} from Care Team?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {staffToRemove?.userRole === "nurse" ? "Nurse" : "Staff"}{" "}
              <strong className="text-foreground">{staffToRemove?.userName}</strong> will
              immediately lose access to this consultation. Messages exchanged prior to removal
              remain preserved in the patient record under HIPAA § 164.312 continuity standards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
            <AlertDialogCancel
              disabled={isSubmittingRemove}
              className="rounded-xl text-xs h-9 sm:w-auto w-full"
            >
              Keep Member
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmRemoveStaff();
              }}
              disabled={isSubmittingRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl text-xs h-9 sm:w-auto w-full"
            >
              {isSubmittingRemove ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Member"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
