import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Calendar, Clock, ArrowLeft, ChevronRight, ArrowRight, Share2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { BlogPost as BlogPostType } from "@/data/blogPosts";
import { useBlogPosts } from "@/hooks/use-blog-posts";
import { useLanguage } from "@/i18n/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  pottery: "bg-cta/10 text-cta border-cta/20",
  Pottery: "bg-cta/10 text-cta border-cta/20",
  tetouan: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  culture: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

const categoryLabels: Record<string, Record<string, string>> = {
  pottery: { en: "Pottery", ar: "الفخار", es: "Cerámica", fr: "Poterie" },
  Pottery: { en: "Pottery", ar: "الفخار", es: "Cerámica", fr: "Poterie" },
  tetouan: { en: "Tetouan", ar: "تطوان", es: "Tetuán", fr: "Tétouan" },
  culture: { en: "Culture", ar: "الثقافة", es: "Cultura", fr: "Culture" },
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const { posts, loading, getPost } = useBlogPosts();
  const post = slug ? getPost(slug) : undefined;
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const article = document.getElementById("blog-article");
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = rect.height;
      const scrolled = window.scrollY - articleTop;
      const progress = Math.min(Math.max(scrolled / (articleHeight - window.innerHeight * 0.5), 0), 1);
      setReadProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [post]);

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
    .slice(0, 3);

  const allRelated = relatedPosts.length < 3
    ? [...relatedPosts, ...posts.filter((p) => p.slug !== post.slug && !relatedPosts.find((r) => r.slug === p.slug)).slice(0, 3 - relatedPosts.length)]
    : relatedPosts;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title.en,
    description: post.excerpt.en,
    image: `https://www.terrariaworkshops.com${post.coverImage}`,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: "Terraria Workshops" },
  };

  const handleShare = async () => {
    const url = `https://www.terrariaworkshops.com/blog/${post.slug}`;
    if (navigator.share) {
      await navigator.share({ title: post.title[language], text: post.excerpt[language], url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const renderInline = (text: string) => {
    const tokens: React.ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let match;
    let key = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) tokens.push(text.slice(lastIndex, match.index));
      if (match[1]) {
        tokens.push(<strong key={key++} className="text-foreground font-semibold">{match[1]}</strong>);
      } else if (match[2] && match[3]) {
        const isInternal = match[3].startsWith("/");
        tokens.push(
          isInternal
            ? <Link key={key++} to={match[3]} className="text-cta hover:text-cta-hover underline underline-offset-2 decoration-cta/30 hover:decoration-cta transition-colors">{match[2]}</Link>
            : <a key={key++} href={match[3]} target="_blank" rel="noopener noreferrer" className="text-cta hover:text-cta-hover underline underline-offset-2 decoration-cta/30 hover:decoration-cta transition-colors">{match[2]}</a>
        );
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) tokens.push(text.slice(lastIndex));
    return tokens;
  };

  const renderContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("## ")) {
        return (
          <h2 key={i} className="text-xl md:text-2xl font-bold mt-12 mb-4 text-foreground leading-tight">
            {line.replace("## ", "")}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={i} className="text-lg md:text-xl font-semibold mt-8 mb-3 text-foreground">
            {line.replace("### ", "")}
          </h3>
        );
      }
      if (line.startsWith("- **")) {
        const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
        if (match) return (
          <li key={i} className="ml-5 mb-2.5 text-muted-foreground leading-relaxed list-disc">
            <strong className="text-foreground font-semibold">{match[1]}</strong>
            {match[2] && <span className="text-muted-foreground">{match[2].startsWith(":") ? match[2] : `. ${match[2]}`}</span>}
          </li>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li key={i} className="ml-5 mb-2 text-muted-foreground leading-relaxed list-disc">
            {renderInline(line.replace("- ", ""))}
          </li>
        );
      }
      if (line.match(/^\d+\.\s/)) {
        const match = line.match(/^\d+\.\s\*\*(.+?)\*\*\.?\s*(.*)/);
        if (match) return (
          <p key={i} className="mb-3 text-muted-foreground leading-relaxed">
            <strong className="text-foreground font-semibold">{match[1]}.</strong> {match[2]}
          </p>
        );
        return <p key={i} className="mb-3 text-muted-foreground leading-relaxed">{renderInline(line)}</p>;
      }
      if (line.trim() === "") return <div key={i} className="h-3" />;
      return (
        <p key={i} className="mb-5 text-muted-foreground leading-[1.8] text-[15px] md:text-base">
          {renderInline(line)}
        </p>
      );
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <SEOHead title={post.title[language]} description={post.excerpt[language]} path={`/blog/${post.slug}`} type="article" jsonLd={jsonLd} />

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-transparent">
        <div
          className="h-full bg-cta transition-[width] duration-100 ease-out"
          style={{ width: `${readProgress * 100}%` }}
        />
      </div>

      <Header />

      {/* Breadcrumb */}
      <section className="pt-24 pb-2 px-5">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              {language === "ar" ? "الرئيسية" : language === "es" ? "Inicio" : language === "fr" ? "Accueil" : "Home"}
            </Link>
            <ChevronRight size={12} className="text-muted-foreground/50" />
            <Link to="/blog" className="hover:text-foreground transition-colors">
              {language === "ar" ? "المدونة" : "Blog"}
            </Link>
            <ChevronRight size={12} className="text-muted-foreground/50" />
            <span className="text-foreground/70 truncate max-w-[180px]">{post.title[language]}</span>
          </nav>
        </div>
      </section>

      {/* Article header */}
      <section className="px-5 pt-6 pb-8">
        <div className="max-w-3xl mx-auto">
          <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider mb-5", categoryColors[post.category] || "")}>
            {categoryLabels[post.category]?.[language] || post.category}
          </Badge>
          <h1 className="text-3xl md:text-[2.5rem] lg:text-5xl font-bold text-foreground mb-5 leading-[1.15] tracking-tight">
            {post.title[language]}
          </h1>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6 max-w-2xl">
            {post.excerpt[language]}
          </p>
          <div className="flex items-center justify-between border-y border-border py-3">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {formatDate(post.publishedAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {post.readTime} min {language === "ar" ? "قراءة" : language === "es" ? "de lectura" : language === "fr" ? "de lecture" : "read"}
              </span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Share2 size={13} />
              {language === "ar" ? "شارك" : language === "es" ? "Compartir" : language === "fr" ? "Partager" : "Share"}
            </button>
          </div>
        </div>
      </section>

      {/* Cover image */}
      <div className="px-5 pb-10">
        <div className="max-w-4xl mx-auto">
          <div className="aspect-[2/1] rounded-2xl overflow-hidden">
            <img src={post.coverImage} alt={post.title[language]} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Article body */}
      <article id="blog-article" className="px-5 pb-16">
        <div className="max-w-3xl mx-auto">
          {renderContent(post.content[language])}
        </div>
      </article>

      {/* CTA */}
      <section className="px-5 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl bg-foreground p-8 md:p-10 text-center">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
              {language === "ar" ? "هل أنت مستعد للتجربة؟" : language === "es" ? "¿Listo para experimentarlo?" : language === "fr" ? "Prêt a vivre l'experience ?" : "Ready to experience it yourself?"}
            </h3>
            <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
              {language === "ar" ? "احجز ورشة فخار في تطوان واصنع ذكريات تدوم" : language === "es" ? "Reserva un taller de cerámica en Tetuán y crea recuerdos duraderos" : language === "fr" ? "Reservez un atelier de poterie a Tetouan et creez des souvenirs durables" : "Book a pottery workshop in Tetouan and create lasting memories"}
            </p>
            <Button asChild size="lg" className="bg-cta hover:bg-cta-hover rounded-full px-8">
              <Link to="/#booking">
                {language === "ar" ? "احجز مكانك" : language === "es" ? "Reserva tu lugar" : language === "fr" ? "Reservez votre place" : "Book Your Spot"}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Related / more to read */}
      {allRelated.length > 0 && (
        <section className="px-5 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-foreground">
                {language === "ar" ? "تابع القراءة" : language === "es" ? "Sigue leyendo" : language === "fr" ? "Continuez a lire" : "Keep reading"}
              </h3>
              <Link to="/blog" className="text-sm text-muted-foreground hover:text-cta transition-colors flex items-center gap-1">
                {language === "ar" ? "جميع المقالات" : language === "es" ? "Todos los articulos" : language === "fr" ? "Tous les articles" : "All articles"}
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allRelated.map((related) => (
                <Link key={related.slug} to={`/blog/${related.slug}`} className="group">
                  <div className="aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-muted">
                    <img
                      src={related.coverImage}
                      alt={related.title[language]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider mb-2", categoryColors[related.category] || "")}>
                    {categoryLabels[related.category]?.[language] || related.category}
                  </Badge>
                  <h4 className="font-semibold text-foreground group-hover:text-cta transition-colors leading-snug line-clamp-2 mb-1.5">
                    {related.title[language]}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(related.publishedAt)} · {related.readTime} min
                  </p>
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

export default BlogPost;
