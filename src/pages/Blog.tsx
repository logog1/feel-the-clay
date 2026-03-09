import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { blogPosts, BlogPost } from "@/data/blogPosts";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const categoryColors: Record<BlogPost["category"], string> = {
  pottery: "bg-cta/10 text-cta border-cta/20",
  tetouan: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  culture: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

const categoryLabels: Record<BlogPost["category"], Record<string, string>> = {
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === "ar" ? "ar-MA" : language === "es" ? "es-ES" : language === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        title="Blog"
        description="Explore articles about pottery traditions, things to do in Tetouan, and Moroccan craft culture."
        path="/blog"
        jsonLd={jsonLd}
      />
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-16 px-5 bg-gradient-to-b from-foreground to-foreground/95">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {language === "ar" ? "المدونة" : language === "es" ? "Blog" : language === "fr" ? "Blog" : "Blog"}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {language === "ar"
              ? "اكتشف قصص الفخار والثقافة وما يمكنك فعله في تطوان"
              : language === "es"
              ? "Descubre historias sobre cerámica, cultura y qué hacer en Tetuán"
              : language === "fr"
              ? "Découvrez des histoires sur la poterie, la culture et que faire à Tétouan"
              : "Discover stories about pottery, culture, and things to do in Tetouan"}
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts.map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`}>
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 h-full">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={post.coverImage}
                      alt={post.title[language]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className={categoryColors[post.category]}>
                        {categoryLabels[post.category][language]}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={12} />
                        {post.readTime} min
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold mb-2 group-hover:text-cta transition-colors line-clamp-2">
                      {post.title[language]}
                    </h2>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {post.excerpt[language]}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar size={12} />
                        {formatDate(post.publishedAt)}
                      </span>
                      <span className="flex items-center gap-1 text-sm font-medium text-cta group-hover:gap-2 transition-all">
                        {language === "ar" ? "اقرأ المزيد" : language === "es" ? "Leer más" : language === "fr" ? "Lire plus" : "Read more"}
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Blog;
