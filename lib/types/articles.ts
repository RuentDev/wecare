export interface AdminArticle {
  id: string;
  author_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  category: string | null;
  tags: string[];
  is_published: boolean;
  published_at: Date | null;
  views: number;
  created_at: Date;
  updated_at: Date;
  users?: {
    first_name: string;
    last_name: string;
  } | null;
}

export interface ArticleStats {
  total: number;
  published: number;
  drafts: number;
  views: number;
}
