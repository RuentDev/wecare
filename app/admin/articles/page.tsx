import { getAdminArticles, getArticleStats } from "@/lib/actions/articles";
import { ArticlesPageClient } from "@/components/admin/articles/articles-page-client";

export default async function ArticlesManagement() {
  const [articlesResult, statsResult] = await Promise.all([
    getAdminArticles(),
    getArticleStats(),
  ]);

  const articles = articlesResult.data ?? [];
  const stats = statsResult.data ?? {
    total: 0,
    published: 0,
    drafts: 0,
    views: 0,
  };

  return (
    <main className="min-h-full">
      <ArticlesPageClient articles={articles} stats={stats} />
    </main>
  );
}
