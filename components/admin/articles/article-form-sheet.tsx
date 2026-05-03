"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

import { createArticle, updateArticle } from "@/lib/actions/articles";
import type { AdminArticle } from "@/lib/types/articles";

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  featured_image: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  category: z.string().optional(),
  tags: z.string().optional(), // Will split by comma
  is_published: z.boolean().default(false),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

interface ArticleFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: AdminArticle | null;
}

export function ArticleFormSheet({
  open,
  onOpenChange,
  article,
}: ArticleFormSheetProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featured_image: "",
      category: "",
      tags: "",
      is_published: false,
    },
  });

  useEffect(() => {
    if (open && article) {
      form.reset({
        title: article.title,
        slug: article.slug || "",
        excerpt: article.excerpt || "",
        content: article.content,
        featured_image: article.featured_image || "",
        category: article.category || "",
        tags: article.tags ? article.tags.join(", ") : "",
        is_published: article.is_published,
      });
    } else if (open && !article) {
      form.reset({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        featured_image: "",
        category: "",
        tags: "",
        is_published: false,
      });
    }
  }, [open, article, form]);

  async function onSubmit(data: ArticleFormValues) {
    setIsPending(true);
    try {
      const payload = {
        ...data,
        tags: data.tags
          ? data.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      if (article) {
        const result = await updateArticle(article.id, payload);
        if (result.success) {
          toast.success("Article updated successfully");
          onOpenChange(false);
        } else {
          toast.error(result.error || "Failed to update article");
        }
      } else {
        const result = await createArticle(payload);
        if (result.success) {
          toast.success("Article created successfully");
          onOpenChange(false);
        } else {
          toast.error(result.error || "Failed to create article");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[90%] max-h-[90vh] overflow-y-auto pb-0">
        <DialogHeader className="mb-6">
          <DialogTitle>
            {article ? "Edit Article" : "Create New Article"}
          </DialogTitle>
          <DialogDescription>
            {article
              ? "Update the details of the article."
              : "Add a new article for your website. You can publish it immediately or save it as a draft."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full relative pb-5"
          >
            <div className="flex justify-end">
              <FormField
                control={form.control}
                name="is_published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-4">
                    <FormLabel className="text-base font-semibold mt-1">
                      Status:
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "published")}
                      defaultValue={field.value ? "published" : "draft"}
                    >
                      <FormControl>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Publish</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter article title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="my-article-title (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave blank to auto-generate from title
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Health Tips" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="featured_image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Featured Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A short description of the article"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Diet, Fitness, Wellness"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Separate multiple tags with commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-3 p-5 bg-neutral-500 rounded-t-sm sticky bottom-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {article ? "Save Changes" : "Create Article"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
