import { useParams, Link, Navigate } from "react-router-dom";
import { Calendar, Clock, ArrowLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { BlogPost as BlogPostType } from "@/data/blogPosts";
import { useBlogPosts } from "@/hooks/use-blog-posts";
import { useLanguage } from "@/i18n/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const categoryColors: Record<string, string> = {
  pottery: "bg-cta/10 text-cta border-cta/20",
  tetouan: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  culture: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

const categoryLabels: Record<string, Record<string, string>> = {
  pottery: { en: "Pottery", ar: "الفخار", es: "Cerámica", fr: "Poterie" },
  tetouan: { en: "Tetouan", ar: "تطوان", es: "Tetuán", fr: "Tétouan" },
  culture: { en: "Culture", ar: "الثقافة", es: "Cultura", fr: "Culture" },
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const { posts, loading, getPost } = useBlogPosts();
  const post = slug ? getPost(slug) : undefined;

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-28 pb-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cta" />
        </div>
      </main>
    );
  }

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(
      language === "ar" ? "ar-MA" : language === "es" ? "es-ES" : language === "fr" ? "fr-FR" : "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    );
  };

  const relatedPosts = posts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title.en,
    description: post.excerpt.en,
    image: `https://www.terrariaworkshops.com${post.coverImage}`,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: "Terraria Workshops" },
  };

  const renderContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("## ")) return <h2 key={i} className="text-2xl font-bold mt-10 mb-4 text-foreground">{line.replace("## ", "")}</h2>;
      if (line.startsWith("### ")) return <h3 key={i} className="text-xl font-semibold mt-8 mb-3 text-foreground">{line.replace("### ", "")}</h3>;
      if (line.startsWith("- **")) {
        const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
        if (match) return <li key={i} className="ml-4 mb-2"><strong className="text-foreground">{match[1]}</strong>{match[2] && `: ${match[2]}`}</li>;
      }
      if (line.startsWith("- ")) return <li key={i} className="ml-4 mb-2">{line.replace("- ", "")}</li>;
      if (line.match(/^\d+\.\s/)) {
        const match = line.match(/^\d+\.\s\*\*(.+?)\*\*\.?\s*(.*)/);
        if (match) return <p key={i} className="mb-3"><strong className="text-foreground">{match[1]}.</strong> {match[2]}</p>;
        return <p key={i} className="mb-3">{line}</p>;
      }
      if (line.trim() === "") return <div key={i} className="h-2" />;
      const parts = line.split(/\*\*(.+?)\*\*/g);
      return <p key={i} className="mb-4 leading-relaxed">{parts.map((part, j) => (j % 2 === 1 ? <strong key={j}>{part}</strong> : part))}</p>;
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <SEOHead title={post.title[language]} description={post.excerpt[language]} path={`/blog/${post.slug}`} type="article" jsonLd={jsonLd} />
      <Header />

      <section className="pt-24 pb-8 px-5 bg-foreground">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-6">
            <Link to="/" className="hover:text-white transition-colors">{language === "ar" ? "الرئيسية" : language === "es" ? "Inicio" : language === "fr" ? "Accueil" : "Home"}</Link>
            <ChevronRight size={14} />
            <Link to="/blog" className="hover:text-white transition-colors">{language === "ar" ? "المدونة" : "Blog"}</Link>
            <ChevronRight size={14} />
            <span className="text-white/70 truncate max-w-[200px]">{post.title[language]}</span>
          </nav>
          <Badge variant="outline" className={`${categoryColors[post.category] || ""} mb-4`}>{categoryLabels[post.category]?.[language] || post.category}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">{post.title[language]}</h1>
          <div className="flex items-center gap-4 text-white/60 text-sm">
            <span className="flex items-center gap-1.5"><Calendar size={14} />{formatDate(post.publishedAt)}</span>
            <span className="flex items-center gap-1.5"><Clock size={14} />{post.readTime} min {language === "ar" ? "قراءة" : language === "es" ? "de lectura" : language === "fr" ? "de lecture" : "read"}</span>
          </div>
        </div>
      </section>

      <div className="relative -mt-2">
        <div className="max-w-5xl mx-auto px-5">
          <div className="aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl">
            <img src={post.coverImage} alt={post.title[language]} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <article className="py-12 px-5">
        <div className="max-w-3xl mx-auto prose prose-lg text-muted-foreground">{renderContent(post.content[language])}</div>
      </article>

      <section className="py-12 px-5 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-3">{language === "ar" ? "هل أنت مستعد للتجربة؟" : language === "es" ? "¿Listo para experimentarlo?" : language === "fr" ? "Prêt à vivre l'expérience ?" : "Ready to experience it yourself?"}</h3>
          <p className="text-muted-foreground mb-6">{language === "ar" ? "احجز ورشة فخار في تطوان واصنع ذكريات تدوم" : language === "es" ? "Reserva un taller de cerámica en Tetuán y crea recuerdos duraderos" : language === "fr" ? "Réservez un atelier de poterie à Tétouan et créez des souvenirs durables" : "Book a pottery workshop in Tetouan and create lasting memories"}</p>
          <Button asChild size="lg" className="bg-cta hover:bg-cta-hover">
            <Link to="/#booking">{language === "ar" ? "احجز مكانك" : language === "es" ? "Reserva tu lugar" : language === "fr" ? "Réservez votre place" : "Book Your Spot"}</Link>
          </Button>
        </div>
      </section>

      {relatedPosts.length > 0 && (
        <section className="py-16 px-5">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold mb-8">{language === "ar" ? "مقالات ذات صلة" : language === "es" ? "Artículos relacionados" : language === "fr" ? "Articles connexes" : "Related Articles"}</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map((related) => (
                <Link key={related.slug} to={`/blog/${related.slug}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all h-full">
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={related.coverImage} alt={related.title[language]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <CardContent className="p-5">
                      <h4 className="font-semibold group-hover:text-cta transition-colors line-clamp-2">{related.title[language]}</h4>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{related.excerpt[language]}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="pb-16 px-5">
        <div className="max-w-3xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-cta transition-colors">
            <ArrowLeft size={16} />
            {language === "ar" ? "العودة إلى المدونة" : language === "es" ? "Volver al blog" : language === "fr" ? "Retour au blog" : "Back to Blog"}
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default BlogPost;
