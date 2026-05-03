"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
import { deleteArticle } from "@/lib/actions/articles";
import type { AdminArticle } from "@/lib/types/articles";

interface DeleteArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: AdminArticle | null;
}

export function DeleteArticleDialog({
  open,
  onOpenChange,
  article,
}: DeleteArticleDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!article) return null;

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const result = await deleteArticle(article!.id);
      if (result.success) {
        toast.success("Article deleted successfully");
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to delete article");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the article <strong>{article.title}</strong> and remove its data from the server. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
