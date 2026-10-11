"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Loader2, Sparkles } from "lucide-react";
import { updateDoctorShiftStatus } from "@/lib/actions/doctors";
import { toast } from "sonner";

export interface StartShiftDialogProps {
  doctorId: string;
  doctorName: string;
  isOnShift: boolean;
}

const STORAGE_KEY = "wecare_doctor_shift_modal_dismissed";

export function StartShiftDialog({
  doctorId,
  doctorName,
  isOnShift,
}: StartShiftDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Only prompt if doctor is not currently on shift and hasn't dismissed in this browser session
    if (!isOnShift) {
      const isDismissed = sessionStorage.getItem(STORAGE_KEY);
      if (!isDismissed) {
        setIsOpen(true);
      }
    } else {
      // If already on shift, ensure modal is closed
      setIsOpen(false);
    }
  }, [isOnShift]);

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleStartShift = () => {
    startTransition(async () => {
      const result = await updateDoctorShiftStatus(doctorId, true);
      if (result.success) {
        sessionStorage.setItem(STORAGE_KEY, "true");
        toast.success("Shift started! You are now active and receiving patients.");
        setIsOpen(false);
      } else {
        toast.error(result.error || "Failed to start shift");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 border-slate-100 shadow-xl">
        <DialogHeader className="gap-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Start Your Shift, Dr. {doctorName}?
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium leading-relaxed">
            Starting your shift enables patient check-ins and signals clinic staff
            that your consultation room is active and open for today.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={handleDismiss}
            disabled={isPending}
            className="rounded-xl text-slate-600 hover:text-slate-900 font-semibold"
          >
            Not Now
          </Button>
          <Button
            type="button"
            onClick={handleStartShift}
            disabled={isPending}
            className="rounded-xl gap-2 bg-primary hover:bg-primary/90 font-bold shadow-md shadow-primary/20"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Start Shift
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
