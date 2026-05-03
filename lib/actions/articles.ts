"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma-db";

export async function getAdminArticles() {
  try {
    const articles = await prisma.articles.findMany({
      orderBy: { created_at: "desc" },
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    return {
      success: true,
      data: articles.map((article) => ({
        ...article,
        is_published: article.is_published ?? false,
        views: article.views ?? 0,
        created_at: article.created_at ?? new Date(),
        updated_at: article.updated_at ?? new Date(),
      })),
    };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return { success: false, error: "Failed to fetch articles" };
  }
}

export async function getArticleStats() {
  try {
    const [total, published, drafts, viewsAgg] = await Promise.all([
      prisma.articles.count(),
      prisma.articles.count({ where: { is_published: true } }),
      prisma.articles.count({ where: { is_published: false } }),
      prisma.articles.aggregate({
        _sum: {
          views: true,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        published,
        drafts,
        views: viewsAgg._sum.views ?? 0,
      },
    };
  } catch (error) {
    console.error("Error fetching article stats:", error);
    return { success: false, error: "Failed to fetch article stats" };
  }
}

export async function createArticle(data: any) {
  try {
    // Generate a slug if not provided, or sanitize the provided one
    let slug = data.slug;
    if (!slug) {
      slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }

    const article = await prisma.articles.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        featured_image: data.featured_image,
        category: data.category,
        tags: data.tags || [],
        is_published: data.is_published,
        published_at: data.is_published ? new Date() : null,
      },
    });

    revalidatePath("/admin/articles");
    return { success: true, data: article };
  } catch (error) {
    console.error("Error creating article:", error);
    return { success: false, error: "Failed to create article" };
  }
}

export async function updateArticle(id: string, data: any) {
  try {
    const updateData: any = {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      featured_image: data.featured_image,
      category: data.category,
      tags: data.tags || [],
      is_published: data.is_published,
      updated_at: new Date(),
    };

    if (data.is_published !== undefined) {
      const existing = await prisma.articles.findUnique({ where: { id } });
      if (existing && !existing.is_published && data.is_published) {
        updateData.published_at = new Date();
      } else if (existing && existing.is_published && !data.is_published) {
        updateData.published_at = null;
      }
    }

    const article = await prisma.articles.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/articles");
    return { success: true, data: article };
  } catch (error) {
    console.error("Error updating article:", error);
    return { success: false, error: "Failed to update article" };
  }
}

export async function deleteArticle(id: string) {
  try {
    await prisma.articles.delete({
      where: { id },
    });

    revalidatePath("/admin/articles");
    return { success: true };
  } catch (error) {
    console.error("Error deleting article:", error);
    return { success: false, error: "Failed to delete article" };
  }
}
