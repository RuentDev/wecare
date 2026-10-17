"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAvailableClinicStaff, addStaffToConversation } from "@/lib/actions/chat";
import { StaffCandidate } from "@/types/chat";
import { ShieldAlert, UserPlus, Users, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddStaffDialogProps {
  conversationId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStaffAdded?: () => void;
}

export function AddStaffDialog({
  conversationId,
  isOpen,
  onOpenChange,
  onStaffAdded,
}: AddStaffDialogProps) {
  const [candidates, setCandidates] = useState<StaffCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedStaffId(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    getAvailableClinicStaff(conversationId)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setCandidates(res.data);
        } else {
          toast.error(res.error || "Failed to load clinic staff.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [conversationId, isOpen]);

  const handleAddStaff = async () => {
    if (!selectedStaffId) return;

    setIsSubmitting(true);
    try {
      const res = await addStaffToConversation(conversationId, selectedStaffId);
      if (res.success) {
        toast.success("Staff member successfully added to the care team.");
        onOpenChange(false);
        onStaffAdded?.();
      } else {
        toast.error(res.error || "Could not add staff member.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <UserPlus className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Add Care Team Member
              </DialogTitle>
              <DialogDescription className="text-xs">
                Delegate clinical triage or follow-up to a Nurse or Clinic Staff.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Doctor Privacy Warning Notice */}
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-50/80 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p>
            <strong className="font-semibold text-amber-950 dark:text-amber-100">
              Doctor Privacy Notice:
            </strong>{" "}
            Newly invited members will only be permitted to view messages sent{" "}
            <em className="font-semibold underline">after</em> they join. Prior patient
            history remains strictly confidential between you and the patient.
          </p>
        </div>

        {/* Staff Selection List */}
        <div className="space-y-2 py-2">
          <div className="text-xs font-medium text-muted-foreground">
            Available Clinic Personnel:
          </div>

          {isLoading ? (
            <div className="flex h-36 items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-teal-600" />
              Loading staff directory...
            </div>
          ) : candidates.length === 0 ? (
            <div className="flex h-36 flex-col items-center justify-center gap-1 text-center text-xs text-muted-foreground">
              <Users className="size-6 text-muted-foreground/40" />
              <p>No available nurses or staff found for this branch.</p>
            </div>
          ) : (
            <div className="max-h-60 space-y-1.5 overflow-y-auto pr-1">
              {candidates.map((staff) => {
                const isSelected = selectedStaffId === staff.id;
                const isDisabled = staff.isAlreadyParticipant;

                return (
                  <button
                    key={staff.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setSelectedStaffId(staff.id)}
                    className={`flex w-full items-center justify-between rounded-lg border p-2.5 text-left text-xs transition-colors ${
                      isDisabled
                        ? "cursor-not-allowed border-muted bg-muted/40 opacity-60"
                        : isSelected
                        ? "border-teal-600 bg-teal-50/50 dark:border-teal-500 dark:bg-teal-950/30"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {staff.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className="px-1.5 py-0 text-[10px] capitalize"
                        >
                          {staff.role}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {staff.email}
                      </span>
                    </div>

                    <div>
                      {isDisabled ? (
                        <span className="text-[11px] text-muted-foreground">
                          Enrolled
                        </span>
                      ) : isSelected ? (
                        <div className="flex size-5 items-center justify-center rounded-full bg-teal-600 text-white">
                          <Check className="size-3" />
                        </div>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleAddStaff}
            disabled={!selectedStaffId || isSubmitting}
            className="bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                Adding...
              </>
            ) : (
              "Add to Care Team"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
