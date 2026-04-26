"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserForm } from "./user-form";
import { UserPlus, Sparkles } from "lucide-react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] glassmorphism-card border-none p-0 overflow-hidden rounded-[24px]">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        
        <DialogHeader className="p-6 pb-0 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                Add New User <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
              </DialogTitle>
              <DialogDescription className="text-neutral-gray font-medium">
                Create a new staff, doctor, or patient account.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 pt-2 relative z-10">
          <UserForm mode="create" onSuccess={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
