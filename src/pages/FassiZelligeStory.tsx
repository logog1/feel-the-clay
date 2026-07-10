import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Hammer, Flame, Sparkles, Hand, MapPin } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";

/**
 * A dedicated, non-blog "digital story" page for the Fassi zellige artisans.
 * Reached via a QR code shown during workshops so visitors can dive deeper
 * into the heritage while they are cutting tiles.
 *
 * Design: full-bleed hero, chapter-by-chapter narrative, pull quotes,
 * portrait moments, closing reflection. Uses semantic design tokens.
 */

const chapters = [
  {
    n: "01",
    icon: Hand,
    title: "Hands that remember",
    body:
      "In the medina of Fes, before the sun climbs over the tanneries, the maallem is already at his low wooden bench. His hands know the geometry by memory. No ruler, no printout. Only a hammer, a shard of terracotta, and centuries of muscle memory passed from father to son.",
    quote: "The tile does not obey the hand. The hand learns to listen to the clay.",
  },
  {
    n: "02",
    icon: Flame,
    title: "Earth, water, fire",
    body:
      "Zellige begins in the hills around Fes, where a specific grey clay is dug, kneaded with bare feet, and shaped into square blanks. The tiles are fired once in wood-burning kilns fueled by olive pits. The uneven heat is not a flaw. It is the reason every zellige surface breathes with tiny variations of color no machine can copy.",
    quote: "A perfect tile is a dead tile.",
  },
  {
    n: "03",
    icon: Hammer,
    title: "The chisel and the star",
    body:
      "Once glazed and fired, tiles are handed to the mfarrez, the cutter. With a sharp hammer called a menqach, he chips each piece into a furmah, a precise shape from a vocabulary of more than three hundred. Stars, almonds, teardrops, crosses. Each strike is a decision that cannot be undone. A skilled cutter shapes one piece every ten seconds, for eight hours a day.",
    quote: "We do not draw the pattern. The pattern is already inside the tile. We only remove what is not the pattern.",
  },
  {
    n: "04",
    icon: Sparkles,
    title: "Assembly, upside down",
    body:
      "The most surprising moment is the last one. The finished shapes are laid face-down on the floor, glazed side against the ground, following a chalk grid the maallem draws from memory. Cement is poured over the back. When the slab is flipped, the pattern reveals itself for the first time, complete, radiant. The artisan sees his own work only at the very end.",
    quote: "You spend a month working blind, and then the star opens its eyes.",
  },
];

const FassiZelligeStory = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setProgress(total > 0 ? (h.scrollTop / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SEOHead
        title="The Fassi Zellige Story — Voices from the Medina of Fes"
        description="A digital story of the Fassi zellige artisans: the earth, the hammer, the star. Discover the heritage behind the tiles you are shaping in the workshop."
        path="/story/fassi-zellige"
        type="article"
      />

      {/* Reading progress */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] bg-primary z-50 origin-left transition-transform duration-150"
        style={{ transform: `scaleX(${progress / 100})` }}
        aria-hidden
      />

      {/* Hero */}
      <header className="relative min-h-[80vh] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=2000&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
        <div className="relative container-narrow py-16 md:py-24">
          <Link
            to="/workshop/zellij"
            className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground mb-8"
          >
            <ArrowLeft size={16} /> Back to the workshop
          </Link>
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium tracking-wide uppercase">
              <MapPin size={12} /> A digital story · Fes, Morocco
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              The Fassi Zellige Story
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
              Four chapters, one thousand years. Meet the artisans behind the
              tile you are holding in your hands.
            </p>
            <p className="text-sm text-foreground/60">
              Scan · Read · Feel · About a 6 minute read
            </p>
          </div>
        </div>
      </header>

      {/* Opening line */}
      <section className="py-16 md:py-24">
        <div className="container-narrow max-w-2xl">
          <p className="text-2xl md:text-3xl leading-relaxed font-light text-foreground/90">
            The piece of zellige you are shaping today did not begin this
            morning. It began in the 10th century, in a small workshop in
            Fes el Bali, where an unknown craftsman first realised that
            geometry could be worship.
          </p>
        </div>
      </section>

      {/* Chapters */}
      {chapters.map((c, i) => {
        const Icon = c.icon;
        return (
          <section
            key={c.n}
            className={`py-16 md:py-24 ${i % 2 === 1 ? "bg-sand-light/40" : ""}`}
          >
            <div className="container-narrow max-w-3xl space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-xs tracking-widest text-foreground/50 uppercase">
                    Chapter {c.n}
                  </p>
                  <h2 className="text-2xl md:text-4xl font-bold">{c.title}</h2>
                </div>
              </div>
              <p className="text-lg leading-relaxed text-foreground/80">
                {c.body}
              </p>
              <blockquote className="border-l-4 border-primary pl-6 py-2 italic text-xl md:text-2xl text-foreground/90">
                &ldquo;{c.quote}&rdquo;
              </blockquote>
            </div>
          </section>
        );
      })}

      {/* Meet the artisans */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container-narrow max-w-3xl space-y-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            The hands behind the tiles
          </h2>
          <p className="text-foreground/80 leading-relaxed">
            The Fassi zellige tradition survives thanks to fewer than two
            hundred active maallems today. Many are the last in their family
            line. Every workshop we run in Tetouan sends a direct
            contribution to their cooperative in Fes, so the geometry keeps
            being taught to a new generation.
          </p>
          <p className="text-sm text-foreground/60 italic">
            When you cut your first star today, you are joining a chain that
            is more than a thousand years long. Take your time.
          </p>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20 md:py-28">
        <div className="container-narrow max-w-2xl text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Now, back to your hammer.
          </h2>
          <p className="text-foreground/70 leading-relaxed">
            The rest of the story is the one you are about to write on your
            own tile. Ask your maallem anything. They love the questions
            more than the compliments.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/workshop/zellij">Return to workshop</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/blog">Read more stories</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FassiZelligeStory;
