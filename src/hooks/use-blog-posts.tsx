import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { blogPosts as staticPosts, BlogPost } from "@/data/blogPosts";

interface DbBlogPost {
  id: string;
  slug: string;
  title_en: string; title_ar: string; title_es: string; title_fr: string;
  excerpt_en: string; excerpt_ar: string; excerpt_es: string; excerpt_fr: string;
  content_en: string; content_ar: string; content_es: string; content_fr: string;
  cover_image: string;
  category: string;
  published_at: string;
  read_time: number;
  is_published: boolean;
}

function dbToFrontend(row: DbBlogPost): BlogPost {
  return {
    slug: row.slug,
    title: { en: row.title_en, ar: row.title_ar, es: row.title_es, fr: row.title_fr },
    excerpt: { en: row.excerpt_en, ar: row.excerpt_ar, es: row.excerpt_es, fr: row.excerpt_fr },
    content: { en: row.content_en, ar: row.content_ar, es: row.content_es, fr: row.content_fr },
    coverImage: row.cover_image,
    category: row.category as BlogPost["category"],
    publishedAt: row.published_at,
    readTime: row.read_time,
  };
}

export function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>(staticPosts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (data && data.length > 0) {
        const dbPosts = (data as DbBlogPost[]).map(dbToFrontend);
        // Merge: DB posts first, then static posts not overridden by DB slugs
        const dbSlugs = new Set(dbPosts.map((p) => p.slug));
        const merged = [...dbPosts, ...staticPosts.filter((p) => !dbSlugs.has(p.slug))];
        setPosts(merged);
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const getPost = (slug: string) => posts.find((p) => p.slug === slug);

  return { posts, loading, getPost };
}
