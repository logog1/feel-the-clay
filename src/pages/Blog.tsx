import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { BlogPost } from "@/data/blogPosts";
import { useBlogPosts } from "@/hooks/use-blog-posts";
import { useLanguage } from "@/i18n/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  pottery: "bg-cta/10 text-cta border-cta/20 hover:bg-cta/20",
  tetouan: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20",
  culture: "bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20",
  Pottery: "bg-cta/10 text-cta border-cta/20 hover:bg-cta/20",
};

const categoryLabels: Record<string, Record<string, string>> = {
  pottery: { en: "Pottery", ar: "الفخار", es: "Cerámica", fr: "Poterie" },
  Pottery: { en: "Pottery", ar: "الفخار", es: "Cerámica", fr: "Poterie" },
  tetouan: { en: "Tetouan", ar: "تطوان", es: "Tetuán", fr: "Tétouan" },
  culture: { en: "Culture", ar: "الثقافة", es: "Cultura", fr: "Culture" },
};

const filterLabels: Record<string, Record<string, string>> = {
  all: { en: "All", ar: "الكل", es: "Todos", fr: "Tous" },
  pottery: { en: "Pottery", ar: "الفخار", es: "Cerámica", fr: "Poterie" },
  tetouan: { en: "Tetouan", ar: "تطوان", es: "Tetuán", fr: "Tétouan" },
  culture: { en: "Culture", ar: "الثقافة", es: "Cultura", fr: "Culture" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Terraria Workshops Blog",
  description: "Articles about pottery, Tetouan, and Moroccan craft culture",
  url: "https://www.terrariaworkshops.com/blog",
};

const Blog = () => {
  const { language } = useLanguage();
  const { posts } = useBlogPosts();
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredPosts = activeFilter === "all"
    ? posts
    : posts.filter((p) => p.category.toLowerCase() === activeFilter);

  const [featuredPost, ...restPosts] = filteredPosts;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === "ar" ? "ar-MA" : language === "es" ? "es-ES" : language === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const categories = ["all", ...Array.from(new Set(posts.map((p) => p.category.toLowerCase())))];

  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        title="Blog"
        description="Explore articles about pottery traditions, things to do in Tetouan, and Moroccan craft culture."
        path="/blog"
        jsonLd={jsonLd}
      />
      <Header />

      {/* Minimal header */}
      <section className="pt-28 pb-6 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cta font-medium mb-2">
                {language === "ar" ? "المدونة" : language === "es" ? "Nuestro blog" : language === "fr" ? "Notre blog" : "Our blog"}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {language === "ar" ? "قصص ورؤى" : language === "es" ? "Historias e ideas" : language === "fr" ? "Histoires et idées" : "Stories & Insights"}
              </h1>
            </div>

            {/* Category filters */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                    activeFilter === cat
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                  )}
                >
                  {filterLabels[cat]?.[language] || categoryLabels[cat]?.[language] || cat}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full h-px bg-border mt-6" />
        </div>
      </section>

      {/* Featured post - hero card */}
      {featuredPost && (
        <section className="px-5 pb-8">
          <div className="max-w-6xl mx-auto">
            <Link to={`/blog/${featuredPost.slug}`} className="group block">
              <div className="relative rounded-2xl overflow-hidden bg-foreground">
                <div className="grid md:grid-cols-2">
                  <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
                    <img
                      src={featuredPost.coverImage}
                      alt={featuredPost.title[language]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-8 md:p-10 lg:p-14 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="outline" className="bg-white/10 text-white/80 border-white/20 text-[10px] uppercase tracking-wider">
                        {categoryLabels[featuredPost.category]?.[language] || featuredPost.category}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-white/50">
                        <Sparkles size={10} />
                        {language === "ar" ? "مميز" : language === "es" ? "Destacado" : language === "fr" ? "À la une" : "Featured"}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight group-hover:text-cta transition-colors duration-300">
                      {featuredPost.title[language]}
                    </h2>
                    <p className="text-white/60 text-sm md:text-base leading-relaxed mb-6 line-clamp-3">
                      {featuredPost.excerpt[language]}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-white/40 text-xs">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {formatDate(featuredPost.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} />
                          {featuredPost.readTime} min
                        </span>
                      </div>
                      <span className="flex items-center gap-1.5 text-sm font-medium text-cta group-hover:gap-3 transition-all duration-300">
                        {language === "ar" ? "اقرأ" : language === "es" ? "Leer" : language === "fr" ? "Lire" : "Read"}
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Rest of posts - clean list layout */}
      {restPosts.length > 0 && (
        <section className="px-5 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-0 divide-y divide-border">
              {restPosts.map((post, index) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="group py-8 first:pt-4"
                >
                  <div className="grid md:grid-cols-[1fr_240px] gap-6 items-center">
                    <div className="order-2 md:order-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", categoryColors[post.category] || "")}>
                          {categoryLabels[post.category]?.[language] || post.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(post.publishedAt)}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock size={10} />
                          {post.readTime} min
                        </span>
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold text-foreground group-hover:text-cta transition-colors duration-200 mb-2 leading-snug">
                        {post.title[language]}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed max-w-xl">
                        {post.excerpt[language]}
                      </p>
                    </div>
                    <div className="order-1 md:order-2 aspect-[16/10] rounded-xl overflow-hidden bg-muted">
                      <img
                        src={post.coverImage}
                        alt={post.title[language]}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
};

export default Blog;
