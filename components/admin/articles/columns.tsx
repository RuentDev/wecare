"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminArticle } from "@/lib/types/articles";
import Link from "next/link";

interface ColumnProps {
  onEdit: (article: AdminArticle) => void;
  onDelete: (article: AdminArticle) => void;
}

export const getColumns = ({
  onEdit,
  onDelete,
}: ColumnProps): ColumnDef<AdminArticle>[] => [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="font-medium text-foreground max-w-[300px] truncate">
        {row.original.title}
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.original.category || "Uncategorized"}
      </div>
    ),
  },
  {
    accessorKey: "is_published",
    header: "Status",
    cell: ({ row }) => {
      const isPublished = row.original.is_published;
      return (
        <Badge
          variant={isPublished ? "default" : "secondary"}
          className={
            isPublished
              ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
              : ""
          }
        >
          {isPublished ? "Published" : "Draft"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "views",
    header: "Views",
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.original.views.toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Date Created",
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground whitespace-nowrap">
          {format(new Date(row.original.created_at), "MMM d, yyyy")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const article = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {article.is_published && (
              <DropdownMenuItem asChild>
                <Link href={`/blog/${article.slug}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Live
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(article)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Article
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(article)}
              className="text-destructive focus:text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Article
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
