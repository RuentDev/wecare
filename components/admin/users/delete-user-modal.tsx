"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Loader2 } from "lucide-react";
import { User } from "./columns";

interface DeleteUserModalProps {
  user: User | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: (userId: string) => Promise<void>;
}

const CONFIRMATION_PHRASE = "delete permanent";

export function DeleteUserModal({
  user,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteUserModalProps) {
  const [confirmationInput, setConfirmationInput] = useState("");

  if (!user) return null;

  const isConfirmed =
    confirmationInput.trim().toLowerCase() === CONFIRMATION_PHRASE;

  function handleClose() {
    if (isDeleting) return;
    setConfirmationInput("");
    onClose();
  }

  async function handleConfirm() {
    if (!isConfirmed || isDeleting || !user) return;
    await onConfirm(user.id);
    setConfirmationInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && isConfirmed && !isDeleting) {
      e.preventDefault();
      void handleConfirm();
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <AlertDialogContent className="glassmorphism max-w-md border-destructive/20 shadow-2xl p-6">
        <AlertDialogHeader className="space-y-3">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-2">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <AlertDialogTitle className="text-xl font-bold text-center text-neutral-dark">
            Delete User Permanently?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-sm text-muted-foreground space-y-2">
            <span>
              This will permanently delete the account for{" "}
              <strong className="text-foreground">
                {user.first_name} {user.last_name}
              </strong>{" "}
              (<span className="font-mono text-xs">{user.email}</span>).
            </span>
            <div className="pt-2 flex justify-center">
              <Badge variant="outline" className="capitalize">
                Role: {user.role || "No Role"}
              </Badge>
            </div>
            <span className="block text-destructive text-xs font-semibold pt-1">
              Warning: This action cannot be undone. All linked profile and user data will be removed.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4 space-y-2">
          <p className="text-xs text-muted-foreground">
            To confirm, please type{" "}
            <span className="font-mono font-semibold text-destructive select-all">
              {CONFIRMATION_PHRASE}
            </span>{" "}
            below:
          </p>
          <Input
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={CONFIRMATION_PHRASE}
            disabled={isDeleting}
            className="bg-white/60 border-neutral-light focus-visible:ring-destructive"
            autoFocus
          />
        </div>

        <AlertDialogFooter className="flex gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="rounded-xl border-neutral-light"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmed || isDeleting}
            className="rounded-xl shadow-lg shadow-destructive/20 gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Permanently"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
