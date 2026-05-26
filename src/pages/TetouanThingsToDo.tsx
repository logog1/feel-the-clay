import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Sparkles, Clock, BookOpen, Compass } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { useBlogPosts } from "@/hooks/use-blog-posts";

const t = {
  en: {
    eyebrow: "Tetouan, Morocco",
    title: "Things to Do in Tetouan",
    subtitle:
      "Hands-on artisan workshops, UNESCO medina walks, mountain hikes and sunsets on the Mediterranean. A local hub to plan your day in Tetouan.",
    workshopsTitle: "Authentic workshops in Tetouan",
    workshopsSub: "Small groups, master artisans, all materials included.",
    blogsTitle: "Plan your trip with our local guides",
    blogsSub: "Itineraries, hidden spots and practical tips from people who live here.",
    readGuide: "Read the guide",
    bookCta: "Book a workshop",
    bookExplore: "Explore workshops",
    minRead: "min read",
    finalCta: "Spend a morning with us",
    finalCtaSub: "Book a workshop and discover Tetouan through the hands of its artisans.",
  },
  ar: {
    eyebrow: "تطوان، المغرب",
    title: "أشياء تفعلها في تطوان",
    subtitle:
      "ورش حرفية يدوية، جولات في المدينة العتيقة (تراث اليونسكو)، مشي جبلي وغروب على البحر الأبيض المتوسط. دليلك المحلي لتخطيط يومك في تطوان.",
    workshopsTitle: "ورش أصيلة في تطوان",
    workshopsSub: "مجموعات صغيرة، حرفيون مهرة، وجميع المواد متوفرة.",
    blogsTitle: "خطط رحلتك مع أدلتنا المحلية",
    blogsSub: "برامج وأماكن مخفية ونصائح عملية من أناس يعيشون هنا.",
    readGuide: "اقرأ الدليل",
    bookCta: "احجز ورشة",
    bookExplore: "استكشف الورش",
    minRead: "دقائق قراءة",
    finalCta: "اقضِ صباحاً معنا",
    finalCtaSub: "احجز ورشة واكتشف تطوان من خلال أيدي حرفييها.",
  },
  es: {
    eyebrow: "Tetuán, Marruecos",
    title: "Qué hacer en Tetuán",
    subtitle:
      "Talleres artesanos, paseos por la medina (Patrimonio UNESCO), rutas de montaña y atardeceres en el Mediterráneo. Tu guía local para planear el día.",
    workshopsTitle: "Talleres auténticos en Tetuán",
    workshopsSub: "Grupos pequeños, maestros artesanos, materiales incluidos.",
    blogsTitle: "Planea tu viaje con nuestras guías locales",
    blogsSub: "Itinerarios, rincones secretos y consejos prácticos.",
    readGuide: "Leer la guía",
    bookCta: "Reservar un taller",
    bookExplore: "Ver talleres",
    minRead: "min de lectura",
    finalCta: "Pasa una mañana con nosotros",
    finalCtaSub: "Reserva un taller y descubre Tetuán de la mano de sus artesanos.",
  },
  fr: {
    eyebrow: "Tétouan, Maroc",
    title: "Que faire à Tétouan",
    subtitle:
      "Ateliers d'artisans, balades dans la médina (UNESCO), randonnées en montagne et couchers de soleil sur la Méditerranée. Votre guide local.",
    workshopsTitle: "Ateliers authentiques à Tétouan",
    workshopsSub: "Petits groupes, maîtres artisans, tout le matériel inclus.",
    blogsTitle: "Préparez votre voyage avec nos guides locaux",
    blogsSub: "Itinéraires, lieux secrets et conseils pratiques.",
    readGuide: "Lire le guide",
    bookCta: "Réserver un atelier",
    bookExplore: "Voir les ateliers",
    minRead: "min de lecture",
    finalCta: "Passez une matinée avec nous",
    finalCtaSub: "Réservez un atelier et découvrez Tétouan par les mains de ses artisans.",
  },
};

const workshops = [
  {
    slug: "handbuilding",
    href: "/workshop/handbuilding",
    title: { en: "Handbuilding Pottery", ar: "ورشة فخار يدوي", es: "Cerámica a mano", fr: "Poterie à la main" },
    desc: {
      en: "Shape clay with your hands like the artisans of the medina. 2 hours, no experience needed.",
      ar: "اصنع الفخار بيديك مثل حرفيي المدينة العتيقة. ساعتان، بدون خبرة سابقة.",
      es: "Da forma a la arcilla como los artesanos de la medina. 2 horas, sin experiencia.",
      fr: "Façonnez l'argile comme les artisans de la médina. 2 heures, sans expérience.",
    },
    duration: { en: "2h", ar: "ساعتان", es: "2h", fr: "2h" },
  },
  {
    slug: "zellij",
    href: "/workshop/zellij",
    title: { en: "Zellige Mosaic", ar: "ورشة الزليج", es: "Mosaico Zellige", fr: "Mosaïque Zellige" },
    desc: {
      en: "Cut and assemble traditional Moroccan tiles into your own geometric piece.",
      ar: "قص وركب البلاط المغربي التقليدي لتصنع قطعة هندسية خاصة بك.",
      es: "Corta y monta azulejos marroquíes tradicionales en tu propia obra.",
      fr: "Coupez et assemblez des carreaux marocains traditionnels en votre œuvre.",
    },
    duration: { en: "2-3h", ar: "2-3 ساعات", es: "2-3h", fr: "2-3h" },
  },
  {
    slug: "pottery-experience",
    href: "/workshop/pottery-experience",
    title: { en: "Wheel Pottery", ar: "الفخار على العجلة", es: "Torno alfarero", fr: "Tour de potier" },
    desc: {
      en: "Throw your own bowl on the wheel under the guidance of a master potter.",
      ar: "اصنع وعاءك الخاص على العجلة بإشراف معلم فخار.",
      es: "Modela tu propio cuenco al torno con un maestro alfarero.",
      fr: "Tournez votre propre bol au tour avec un maître potier.",
    },
    duration: { en: "2h", ar: "ساعتان", es: "2h", fr: "2h" },
  },
  {
    slug: "carpets",
    href: "/workshop/carpets",
    title: { en: "Amazigh Weaving", ar: "النسيج الأمازيغي", es: "Tejido amazigh", fr: "Tissage amazigh" },
    desc: {
      en: "Weave a small Amazigh rug on a traditional loom with weavers from the Atlas.",
      ar: "اصنع سجادة أمازيغية صغيرة على نول تقليدي مع نساجات من الأطلس.",
      es: "Teje una alfombra amazigh en un telar tradicional.",
      fr: "Tissez un petit tapis amazigh sur un métier traditionnel.",
    },
    duration: { en: "2-3h", ar: "2-3 ساعات", es: "2-3h", fr: "2-3h" },
  },
  {
    slug: "embroidery",
    href: "/workshop/embroidery",
    title: { en: "Tetouan Embroidery", ar: "التطريز التطواني", es: "Bordado de Tetuán", fr: "Broderie de Tétouan" },
    desc: {
      en: "Stitch a piece in the floral Andalusian-Moroccan style unique to Tetouan.",
      ar: "اصنع قطعة بالأسلوب الأندلسي-المغربي الزهري الفريد لتطوان.",
      es: "Borda al estilo andalusí-marroquí floral único de Tetuán.",
      fr: "Brodez dans le style andalou-marocain floral propre à Tétouan.",
    },
    duration: { en: "2h", ar: "ساعتان", es: "2h", fr: "2h" },
  },
  {
    slug: "gardening",
    href: "/workshop/gardening",
    title: { en: "Terrarium & Gardening", ar: "تيراريوم وبستنة", es: "Terrario y jardinería", fr: "Terrarium & jardinage" },
    desc: {
      en: "Build a tiny living garden inside glass. Great for kids and families.",
      ar: "اصنع حديقة صغيرة حية داخل زجاج. تجربة رائعة للأطفال والعائلات.",
      es: "Crea un pequeño jardín vivo dentro de cristal. Ideal en familia.",
      fr: "Composez un petit jardin vivant sous verre. Idéal en famille.",
    },
    duration: { en: "1-2h", ar: "1-2 ساعة", es: "1-2h", fr: "1-2h" },
  },
];

const TetouanThingsToDo = () => {
  const { language, isRTL } = useLanguage() as any;
  const lang = (language || "en") as "en" | "ar" | "es" | "fr";
  const copy = t[lang] || t.en;
  const { posts } = useBlogPosts();

  const guides = posts
    .filter((p) => p.category === "tetouan" || /tetouan|zellige/i.test(p.slug))
    .slice(0, 9);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: "Tetouan, Morocco",
    description: copy.subtitle,
    url: "https://www.terrariaworkshops.com/tetouan/things-to-do",
    touristType: ["culture", "craft", "family", "couples"],
    includesAttraction: workshops.map((w) => ({
      "@type": "TouristAttraction",
      name: w.title.en,
      url: `https://www.terrariaworkshops.com${w.href}`,
    })),
  };

  return (
    <main className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <SEOHead
        title={`${copy.title} | ${copy.eyebrow}`}
        description={copy.subtitle}
        path="/tetouan/things-to-do"
        type="website"
        locale={lang}
        jsonLd={jsonLd}
        noSuffix
      />

      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cta/5 via-background to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-cta/10 text-cta border-cta/20 hover:bg-cta/10">
              <MapPin className="w-3 h-3 mr-1" />
              {copy.eyebrow}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-5 leading-tight">
              {copy.title}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
              {copy.subtitle}
            </p>
            <Button asChild size="lg" className="bg-cta hover:bg-cta/90 text-white rounded-full px-8">
              <a href="#workshops">
                <Sparkles className="w-4 h-4 mr-2" />
                {copy.bookExplore}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Workshops cluster */}
      <section id="workshops" className="py-16 md:py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-10">
            <div className="flex items-center gap-2 text-cta text-sm font-medium mb-2">
              <Compass className="w-4 h-4" />
              <span>01</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {copy.workshopsTitle}
            </h2>
            <p className="text-muted-foreground">{copy.workshopsSub}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {workshops.map((w) => (
              <Link
                key={w.slug}
                to={w.href}
                className="group bg-card rounded-2xl border border-border p-6 hover:border-cta/40 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-cta transition-colors">
                    {w.title[lang]}
                  </h3>
                  <Badge variant="outline" className="text-xs gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {w.duration[lang]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {w.desc[lang]}
                </p>
                <span className="inline-flex items-center text-sm font-medium text-cta">
                  {copy.bookCta}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? "mr-1 rotate-180" : "ml-1"} group-hover:translate-x-1 transition-transform`} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog cluster */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-10">
            <div className="flex items-center gap-2 text-cta text-sm font-medium mb-2">
              <BookOpen className="w-4 h-4" />
              <span>02</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {copy.blogsTitle}
            </h2>
            <p className="text-muted-foreground">{copy.blogsSub}</p>
          </div>

          {guides.length === 0 ? (
            <p className="text-muted-foreground">No guides yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((p) => (
                <Link
                  key={p.slug}
                  to={`/blog/${p.slug}`}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-cta/40 hover:shadow-lg transition-all"
                >
                  {p.coverImage && (
                    <div className="aspect-[16/10] overflow-hidden bg-secondary">
                      <img
                        src={p.coverImage}
                        alt={p.title[lang]}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <Badge className="mb-3 bg-cta/10 text-cta border-cta/20 hover:bg-cta/10 text-xs">
                      {p.category}
                    </Badge>
                    <h3 className="text-base md:text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-cta transition-colors">
                      {p.title[lang]}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {p.excerpt[lang]}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {p.readTime} {copy.minRead}
                      </span>
                      <span className="inline-flex items-center font-medium text-cta">
                        {copy.readGuide}
                        <ArrowRight className={`w-3 h-3 ${isRTL ? "mr-1 rotate-180" : "ml-1"}`} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-cta/5">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {copy.finalCta}
            </h2>
            <p className="text-muted-foreground mb-7">{copy.finalCtaSub}</p>
            <Button asChild size="lg" className="bg-cta hover:bg-cta/90 text-white rounded-full px-8">
              <a href="#workshops">
                {copy.bookCta}
                <ArrowRight className={`w-4 h-4 ${isRTL ? "mr-2 rotate-180" : "ml-2"}`} />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default TetouanThingsToDo;
