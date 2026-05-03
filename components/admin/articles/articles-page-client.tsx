"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileText, CheckCircle2, FileEdit, Eye } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";

import { getColumns } from "./columns";
import { ArticleFormSheet } from "./article-form-sheet";
import { DeleteArticleDialog } from "./delete-article-dialog";
import type { AdminArticle, ArticleStats } from "@/lib/types/articles";

interface ArticlesPageClientProps {
  articles: AdminArticle[];
  stats: ArticleStats;
}

export function ArticlesPageClient({
  articles,
  stats,
}: ArticlesPageClientProps) {
  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<AdminArticle | null>(null);
  
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingArticle, setDeletingArticle] = useState<AdminArticle | null>(null);

  function handleEdit(article: AdminArticle) {
    setEditingArticle(article);
    setFormOpen(true);
  }

  function handleDelete(article: AdminArticle) {
    setDeletingArticle(article);
    setDeleteOpen(true);
  }

  function handleAddNew() {
    setEditingArticle(null);
    setFormOpen(true);
  }

  const columns = getColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Articles Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage blog posts and articles for the clinic
          </p>
        </div>
        <Button
          id="add-article-button"
          onClick={handleAddNew}
          className="gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Article
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="py-0 border-white/20 bg-white/30 backdrop-blur-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Total Articles
              </p>
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0 border-white/20 bg-white/30 backdrop-blur-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Published
              </p>
              <p className="text-xl font-bold text-foreground">
                {stats.published}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0 border-white/20 bg-white/30 backdrop-blur-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <FileEdit className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Drafts
              </p>
              <p className="text-xl font-bold text-foreground">
                {stats.drafts}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0 border-white/20 bg-white/30 backdrop-blur-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-950/30">
              <Eye className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Total Views
              </p>
              <p className="text-xl font-bold text-foreground">
                {stats.views.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={articles}
        searchKey="title"
      />

      {/* Dialogs */}
      <ArticleFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingArticle(null);
        }}
        article={editingArticle}
      />

      <DeleteArticleDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeletingArticle(null);
        }}
        article={deletingArticle}
      />
    </div>
  );
}
