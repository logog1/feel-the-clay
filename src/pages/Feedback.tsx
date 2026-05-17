import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";
import { CheckCircle2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import feedbackHero from "@/assets/feedback-hero.jpg";

type Lang = "en" | "fr" | "es" | "ar";
type L = Record<Lang, string>;

const UI: Record<string, L> = {
  title: {
    en: "Pottery Workshop Feedback",
    fr: "Avis sur l'atelier de poterie",
    es: "Opinión sobre el taller de cerámica",
    ar: "تقييم ورشة الفخار",
  },
  intro: {
    en: "We'd love to hear about your experience. It only takes a couple of minutes.",
    fr: "Nous aimerions connaître votre expérience. Cela ne prend que quelques minutes.",
    es: "Nos encantaría saber tu experiencia. Solo toma un par de minutos.",
    ar: "يسعدنا معرفة رأيك. لن يستغرق الأمر سوى دقيقتين.",
  },
  name: { en: "Name", fr: "Nom", es: "Nombre", ar: "الاسم" },
  email: { en: "Email", fr: "E-mail", es: "Correo electrónico", ar: "البريد الإلكتروني" },
  phone: { en: "Phone number", fr: "Numéro de téléphone", es: "Número de teléfono", ar: "رقم الهاتف" },
  optional: { en: "(optional)", fr: "(facultatif)", es: "(opcional)", ar: "(اختياري)" },
  submit: { en: "Send feedback ✨", fr: "Envoyer ✨", es: "Enviar ✨", ar: "إرسال ✨" },
  submitting: { en: "Sending...", fr: "Envoi...", es: "Enviando...", ar: "جارٍ الإرسال..." },
  thanks: { en: "Thank you!", fr: "Merci !", es: "¡Gracias!", ar: "شكراً لك!" },
  thanksBody: {
    en: "Your feedback helps us make every workshop better.",
    fr: "Vos retours nous aident à améliorer chaque atelier.",
    es: "Tu opinión nos ayuda a mejorar cada taller.",
    ar: "ملاحظاتك تساعدنا على تحسين كل ورشة.",
  },
  back: { en: "Back to home", fr: "Retour à l'accueil", es: "Volver al inicio", ar: "العودة للرئيسية" },
  error: { en: "Could not submit", fr: "Échec de l'envoi", es: "No se pudo enviar", ar: "تعذر الإرسال" },
  next: { en: "Next", fr: "Suivant", es: "Siguiente", ar: "التالي" },
  prev: { en: "Back", fr: "Retour", es: "Atrás", ar: "السابق" },
  skip: { en: "Skip", fr: "Passer", es: "Saltar", ar: "تخطي" },
  start: { en: "Let's go", fr: "C'est parti", es: "¡Empezamos!", ar: "هيا بنا" },
  aboutYou: { en: "About you", fr: "À propos de vous", es: "Sobre ti", ar: "نبذة عنك" },
  aboutYouSub: {
    en: "All optional — leave blank if you prefer.",
    fr: "Tout est facultatif — laissez vide si vous préférez.",
    es: "Todo es opcional — déjalo en blanco si prefieres.",
    ar: "كل شيء اختياري — اتركه فارغًا إذا أردت.",
  },
  stepOf: { en: "Step {n} of {t}", fr: "Étape {n} sur {t}", es: "Paso {n} de {t}", ar: "خطوة {n} من {t}" },
  almost: { en: "Almost there!", fr: "Presque fini !", es: "¡Ya casi!", ar: "اقتربنا!" },
};

type Q = { key: string; label: L; options: { value: string; label: L; emoji?: string }[] };

const RADIO_QUESTIONS: Q[] = [
  {
    key: "satisfaction",
    label: {
      en: "How satisfied were you with the workshop?",
      fr: "Quel est votre niveau de satisfaction concernant l'atelier ?",
      es: "¿Qué tan satisfecho estuviste con el taller?",
      ar: "ما مدى رضاك عن الورشة؟",
    },
    options: [
      { value: "Very satisfied", emoji: "🤩", label: { en: "Very satisfied", fr: "Très satisfait", es: "Muy satisfecho", ar: "راضٍ جدًا" } },
      { value: "Somewhat satisfied", emoji: "😊", label: { en: "Somewhat satisfied", fr: "Plutôt satisfait", es: "Algo satisfecho", ar: "راضٍ نوعًا ما" } },
      { value: "Neutral", emoji: "😐", label: { en: "Neutral", fr: "Neutre", es: "Neutral", ar: "محايد" } },
      { value: "Somewhat dissatisfied", emoji: "😕", label: { en: "Somewhat dissatisfied", fr: "Plutôt insatisfait", es: "Algo insatisfecho", ar: "غير راضٍ نوعًا ما" } },
      { value: "Very dissatisfied", emoji: "😞", label: { en: "Very dissatisfied", fr: "Très insatisfait", es: "Muy insatisfecho", ar: "غير راضٍ تمامًا" } },
    ],
  },
  {
    key: "recommendation",
    label: {
      en: "Would you recommend this workshop to others?",
      fr: "Recommanderiez-vous cet atelier à d'autres ?",
      es: "¿Recomendarías este taller a otros?",
      ar: "هل توصي بهذه الورشة للآخرين؟",
    },
    options: [
      { value: "Very likely", emoji: "💯", label: { en: "Very likely", fr: "Très probable", es: "Muy probable", ar: "محتمل جدًا" } },
      { value: "Somewhat likely", emoji: "👍", label: { en: "Somewhat likely", fr: "Plutôt probable", es: "Algo probable", ar: "محتمل نوعًا ما" } },
      { value: "Neutral", emoji: "🤔", label: { en: "Neutral", fr: "Neutre", es: "Neutral", ar: "محايد" } },
      { value: "Somewhat unlikely", emoji: "👎", label: { en: "Somewhat unlikely", fr: "Plutôt improbable", es: "Algo improbable", ar: "غير محتمل نوعًا ما" } },
      { value: "Very unlikely", emoji: "🙅", label: { en: "Very unlikely", fr: "Très improbable", es: "Muy improbable", ar: "غير محتمل أبدًا" } },
    ],
  },
  {
    key: "length_appropriate",
    label: {
      en: "Was the workshop length right?",
      fr: "La durée de l'atelier était-elle adaptée ?",
      es: "¿La duración del taller fue adecuada?",
      ar: "هل كانت مدة الورشة مناسبة؟",
    },
    options: [
      { value: "Too short", emoji: "⏱️", label: { en: "Too short", fr: "Trop courte", es: "Muy corta", ar: "قصيرة جدًا" } },
      { value: "Just right", emoji: "✅", label: { en: "Just right", fr: "Parfaite", es: "Adecuada", ar: "مناسبة" } },
      { value: "Too long", emoji: "🐢", label: { en: "Too long", fr: "Trop longue", es: "Muy larga", ar: "طويلة جدًا" } },
    ],
  },
  {
    key: "expectations",
    label: {
      en: "Did the workshop meet your expectations?",
      fr: "L'atelier a-t-il répondu à vos attentes ?",
      es: "¿El taller cumplió tus expectativas?",
      ar: "هل لبت الورشة توقعاتك؟",
    },
    options: [
      { value: "Exceeded expectations", emoji: "🚀", label: { en: "Exceeded expectations", fr: "A dépassé mes attentes", es: "Superó las expectativas", ar: "فاقت التوقعات" } },
      { value: "Met expectations", emoji: "🎯", label: { en: "Met expectations", fr: "A répondu à mes attentes", es: "Cumplió las expectativas", ar: "لبّت التوقعات" } },
      { value: "Did not meet expectations", emoji: "😔", label: { en: "Did not meet expectations", fr: "N'a pas répondu à mes attentes", es: "No cumplió las expectativas", ar: "لم تلبِّ التوقعات" } },
    ],
  },
  {
    key: "facilitators",
    label: {
      en: "How engaging were the facilitators?",
      fr: "Les animateurs étaient-ils captivants ?",
      es: "¿Qué tan atractivos fueron los facilitadores?",
      ar: "ما مدى تفاعل المُيسّرين معك؟",
    },
    options: [
      { value: "Extremely engaging", emoji: "🔥", label: { en: "Extremely engaging", fr: "Extrêmement captivants", es: "Extremadamente atractivos", ar: "متفاعلون للغاية" } },
      { value: "Very engaging", emoji: "😄", label: { en: "Very engaging", fr: "Très captivants", es: "Muy atractivos", ar: "متفاعلون جدًا" } },
      { value: "Somewhat engaging", emoji: "🙂", label: { en: "Somewhat engaging", fr: "Assez captivants", es: "Algo atractivos", ar: "متفاعلون نوعًا ما" } },
      { value: "Not very engaging", emoji: "😐", label: { en: "Not very engaging", fr: "Peu captivants", es: "Poco atractivos", ar: "غير متفاعلين كثيرًا" } },
      { value: "Not at all engaging", emoji: "😴", label: { en: "Not at all engaging", fr: "Pas du tout captivants", es: "Nada atractivos", ar: "غير متفاعلين إطلاقًا" } },
    ],
  },
  {
    key: "materials",
    label: {
      en: "Were the materials and resources helpful?",
      fr: "Le matériel et les ressources fournis ont-ils été utiles ?",
      es: "¿Los materiales y recursos fueron útiles?",
      ar: "هل كانت المواد والموارد المقدمة مفيدة؟",
    },
    options: [
      { value: "Extremely helpful", emoji: "🌟", label: { en: "Extremely helpful", fr: "Extrêmement utiles", es: "Extremadamente útiles", ar: "مفيدة للغاية" } },
      { value: "Very helpful", emoji: "👌", label: { en: "Very helpful", fr: "Très utiles", es: "Muy útiles", ar: "مفيدة جدًا" } },
      { value: "Somewhat helpful", emoji: "🙂", label: { en: "Somewhat helpful", fr: "Assez utiles", es: "Algo útiles", ar: "مفيدة نوعًا ما" } },
      { value: "Not very helpful", emoji: "😐", label: { en: "Not very helpful", fr: "Peu utiles", es: "Poco útiles", ar: "غير مفيدة كثيرًا" } },
      { value: "Not at all helpful", emoji: "👎", label: { en: "Not at all helpful", fr: "Pas du tout utiles", es: "Nada útiles", ar: "غير مفيدة إطلاقًا" } },
    ],
  },
  {
    key: "source",
    label: {
      en: "How did you hear about us?",
      fr: "Comment avez-vous entendu parler de nous ?",
      es: "¿Cómo te enteraste de nosotros?",
      ar: "كيف سمعت عنا؟",
    },
    options: [
      { value: "Instagram", emoji: "📸", label: { en: "Instagram", fr: "Instagram", es: "Instagram", ar: "إنستغرام" } },
      { value: "TikTok", emoji: "🎵", label: { en: "TikTok", fr: "TikTok", es: "TikTok", ar: "تيك توك" } },
      { value: "Facebook", emoji: "📘", label: { en: "Facebook", fr: "Facebook", es: "Facebook", ar: "فيسبوك" } },
      { value: "Google Search", emoji: "🔍", label: { en: "Google Search", fr: "Recherche Google", es: "Búsqueda en Google", ar: "بحث Google" } },
      { value: "Friend or family recommendation", emoji: "👥", label: { en: "Friend or family", fr: "Un proche", es: "Amigo o familiar", ar: "صديق أو عائلة" } },
      { value: "Event / collaboration", emoji: "🎪", label: { en: "Event / collaboration", fr: "Événement / collaboration", es: "Evento / colaboración", ar: "فعالية / تعاون" } },
      { value: "Walk-in / saw the place", emoji: "🚶", label: { en: "Walked by", fr: "De passage", es: "De paso", ar: "زيارة عابرة" } },
      { value: "Other", emoji: "✨", label: { en: "Other", fr: "Autre", es: "Otro", ar: "أخرى" } },
    ],
  },
];

const TEXT_QUESTIONS: { key: string; label: L; placeholder: L }[] = [
  {
    key: "liked_most",
    label: {
      en: "What did you like most? 💛",
      fr: "Qu'avez-vous le plus apprécié ? 💛",
      es: "¿Qué fue lo que más te gustó? 💛",
      ar: "ما الذي أعجبك أكثر؟ 💛",
    },
    placeholder: {
      en: "The clay, the music, the people...",
      fr: "L'argile, la musique, les gens...",
      es: "La arcilla, la música, la gente...",
      ar: "الطين، الموسيقى، الناس...",
    },
  },
  {
    key: "suggestions",
    label: {
      en: "Any comments or suggestions? 💭",
      fr: "Commentaires ou suggestions ? 💭",
      es: "¿Comentarios o sugerencias? 💭",
      ar: "تعليقات أو اقتراحات؟ 💭",
    },
    placeholder: {
      en: "Tell us anything on your mind",
      fr: "Dites-nous tout",
      es: "Cuéntanos lo que sea",
      ar: "أخبرنا بأي شيء",
    },
  },
  {
    key: "effectiveness",
    label: {
      en: "How could the workshop be even better? 🚀",
      fr: "Comment rendre l'atelier encore meilleur ? 🚀",
      es: "¿Cómo podría ser aún mejor el taller? 🚀",
      ar: "كيف يمكن أن تكون الورشة أفضل؟ 🚀",
    },
    placeholder: {
      en: "Ideas welcome!",
      fr: "Vos idées sont les bienvenues !",
      es: "¡Ideas bienvenidas!",
      ar: "أفكارك مرحب بها!",
    },
  },
];

type Step =
  | { kind: "intro" }
  | { kind: "about" }
  | { kind: "radio"; q: Q }
  | { kind: "text"; q: (typeof TEXT_QUESTIONS)[number] }
  | { kind: "review" };

export default function Feedback() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const lang = language as Lang;
  const tr = (l: L) => l[lang] || l.en;
  const isRtl = lang === "ar";

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [stepIdx, setStepIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [animKey, setAnimKey] = useState(0);

  const steps = useMemo<Step[]>(
    () => [
      { kind: "intro" },
      { kind: "about" },
      ...RADIO_QUESTIONS.map((q) => ({ kind: "radio" as const, q })),
      ...TEXT_QUESTIONS.map((q) => ({ kind: "text" as const, q })),
      { kind: "review" as const },
    ],
    []
  );

  const totalQuestionSteps = steps.length - 1; // excluding intro
  const currentQNum = Math.max(0, stepIdx); // intro = 0
  const progress = stepIdx === 0 ? 0 : (stepIdx / (steps.length - 1)) * 100;

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const goNext = () => {
    if (stepIdx < steps.length - 1) {
      setDir(1);
      setAnimKey((k) => k + 1);
      setStepIdx((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const goPrev = () => {
    if (stepIdx > 0) {
      setDir(-1);
      setAnimKey((k) => k + 1);
      setStepIdx((i) => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Keyboard: enter to advance on simple steps
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.target as HTMLElement)?.tagName !== "TEXTAREA") {
        const s = steps[stepIdx];
        if (s.kind === "intro") goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stepIdx, steps]);

  const onPickRadio = (qKey: string, v: string) => {
    set(qKey, v);
    // small haptic-feel delay then advance
    setTimeout(() => {
      setDir(1);
      setAnimKey((k) => k + 1);
      setStepIdx((i) => Math.min(i + 1, steps.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 280);
  };

  const onSubmit = async () => {
    setSubmitting(true);
    const payload = {
      name: form.name?.trim() || null,
      email: form.email?.trim() || null,
      phone: form.phone?.trim() || null,
      satisfaction: form.satisfaction || null,
      recommendation: form.recommendation || null,
      length_appropriate: form.length_appropriate || null,
      expectations: form.expectations || null,
      facilitators: form.facilitators || null,
      materials: form.materials || null,
      source: form.source || null,
      liked_most: form.liked_most?.trim() || null,
      suggestions: form.suggestions?.trim() || null,
      effectiveness: form.effectiveness?.trim() || null,
    };
    const { error } = await supabase.from("feedback").insert(payload);
    setSubmitting(false);
    if (error) {
      toast({ title: tr(UI.error), description: error.message, variant: "destructive" });
      return;
    }
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
        <SEOHead title={tr(UI.thanks)} description={tr(UI.thanksBody)} path="/feedback" />
        {/* floating confetti */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-2xl animate-[float_6s_ease-in-out_infinite]"
              style={{
                left: `${(i * 53) % 100}%`,
                top: `${(i * 37) % 100}%`,
                animationDelay: `${(i % 6) * 0.4}s`,
              }}
            >
              {["✨", "🎉", "💛", "🏺", "🌟"][i % 5]}
            </span>
          ))}
        </div>
        <div className="relative max-w-md w-full text-center bg-card rounded-3xl shadow-xl p-8 border animate-scale-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{tr(UI.thanks)}</h1>
          <p className="text-muted-foreground mb-6">{tr(UI.thanksBody)}</p>
          <Button onClick={() => navigate("/")} variant="cta" size="lg" className="w-full">
            {tr(UI.back)}
          </Button>
        </div>
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
            50% { transform: translateY(-20px) rotate(15deg); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  const step = steps[stepIdx];
  const animClass = dir === 1 ? "animate-fade-in" : "animate-fade-in";

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col" dir={isRtl ? "rtl" : "ltr"}>
      <SEOHead title={tr(UI.title)} description={tr(UI.intro)} path="/feedback" />

      {/* Sticky progress header */}
      {stepIdx > 0 && (
        <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-md border-b">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
              <button
                onClick={goPrev}
                className="flex items-center gap-1 hover:text-foreground transition-colors active:scale-95"
                aria-label={tr(UI.prev)}
              >
                {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                <span>{tr(UI.prev)}</span>
              </button>
              <span className="font-medium tabular-nums">
                {stepIdx} / {steps.length - 1}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 flex flex-col px-4 py-6 sm:py-10">
        <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col">
          <div key={animKey} className={`flex-1 flex flex-col ${animClass}`}>
            {step.kind === "intro" && (
              <div className="flex-1 flex flex-col">
                <div className="relative rounded-3xl overflow-hidden shadow-lg mb-6 aspect-[4/5] sm:aspect-[16/10]">
                  <img
                    src={feedbackHero}
                    alt={tr(UI.title)}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium mb-3">
                      <Sparkles className="w-3.5 h-3.5" /> 2 min
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-2">
                      {tr(UI.title)}
                    </h1>
                    <p className="text-white/90 text-sm sm:text-base">{tr(UI.intro)}</p>
                  </div>
                </div>
                <Button
                  onClick={goNext}
                  variant="cta"
                  size="lg"
                  className="w-full h-14 text-base rounded-2xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  {tr(UI.start)} {isRtl ? "←" : "→"}
                </Button>
              </div>
            )}

            {step.kind === "about" && (
              <div className="flex-1 flex flex-col">
                <div className="mb-6">
                  <div className="text-xs uppercase tracking-wide text-primary font-semibold mb-2">
                    {tr(UI.aboutYou)}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">👋</h2>
                  <p className="text-muted-foreground">{tr(UI.aboutYouSub)}</p>
                </div>
                <div className="space-y-4 bg-card rounded-2xl border p-5 shadow-sm">
                  <div className="space-y-2">
                    <Label htmlFor="name">{tr(UI.name)}</Label>
                    <Input
                      id="name"
                      value={form.name || ""}
                      onChange={(e) => set("name", e.target.value)}
                      maxLength={100}
                      className="h-12 rounded-xl text-base"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{tr(UI.email)}</Label>
                    <Input
                      id="email"
                      type="email"
                      inputMode="email"
                      value={form.email || ""}
                      onChange={(e) => set("email", e.target.value)}
                      maxLength={255}
                      autoComplete="email"
                      className="h-12 rounded-xl text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{tr(UI.phone)}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      value={form.phone || ""}
                      onChange={(e) => set("phone", e.target.value)}
                      maxLength={30}
                      autoComplete="tel"
                      className="h-12 rounded-xl text-base"
                    />
                  </div>
                </div>
                <div className="mt-auto pt-6">
                  <Button
                    onClick={goNext}
                    variant="cta"
                    size="lg"
                    className="w-full h-14 text-base rounded-2xl"
                  >
                    {tr(UI.next)} {isRtl ? "←" : "→"}
                  </Button>
                </div>
              </div>
            )}

            {step.kind === "radio" && (
              <div className="flex-1 flex flex-col">
                <div className="mb-5">
                  <div className="text-xs uppercase tracking-wide text-primary font-semibold mb-2">
                    {tr(UI.stepOf).replace("{n}", String(stepIdx)).replace("{t}", String(steps.length - 1))}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold leading-snug">
                    {tr(step.q.label)}
                  </h2>
                </div>

                <div className="grid gap-2.5">
                  {step.q.options.map((opt, i) => {
                    const selected = form[step.q.key] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onPickRadio(step.q.key, opt.value)}
                        className={[
                          "group w-full flex items-center gap-4 rounded-2xl border-2 px-4 py-4 text-start transition-all",
                          "active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-md",
                          selected
                            ? "border-primary bg-primary/10 shadow-md scale-[1.01]"
                            : "border-border bg-card hover:border-primary/40",
                        ].join(" ")}
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <span
                          className={[
                            "text-3xl transition-transform",
                            selected ? "scale-125" : "group-hover:scale-110",
                          ].join(" ")}
                          aria-hidden
                        >
                          {opt.emoji}
                        </span>
                        <span className="flex-1 text-base font-medium">{tr(opt.label)}</span>
                        <span
                          className={[
                            "w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center",
                            selected ? "border-primary bg-primary" : "border-muted-foreground/30",
                          ].join(" ")}
                          aria-hidden
                        >
                          {selected && <span className="w-2 h-2 rounded-full bg-primary-foreground" />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-auto pt-6 flex items-center justify-between gap-3">
                  <button
                    onClick={goNext}
                    className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline px-2 py-2"
                  >
                    {tr(UI.skip)}
                  </button>
                </div>
              </div>
            )}

            {step.kind === "text" && (
              <div className="flex-1 flex flex-col">
                <div className="mb-5">
                  <div className="text-xs uppercase tracking-wide text-primary font-semibold mb-2">
                    {tr(UI.stepOf).replace("{n}", String(stepIdx)).replace("{t}", String(steps.length - 1))}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold leading-snug">{tr(step.q.label)}</h2>
                </div>
                <Textarea
                  value={form[step.q.key] || ""}
                  onChange={(e) => set(step.q.key, e.target.value)}
                  maxLength={2000}
                  rows={6}
                  placeholder={tr(step.q.placeholder)}
                  className="rounded-2xl text-base p-4 min-h-[160px] resize-none"
                  autoFocus
                />
                <div className="mt-auto pt-6 flex items-center gap-3">
                  <button
                    onClick={goNext}
                    className="text-sm text-muted-foreground hover:text-foreground px-3 py-2"
                  >
                    {tr(UI.skip)}
                  </button>
                  <Button
                    onClick={goNext}
                    variant="cta"
                    size="lg"
                    className="flex-1 h-14 text-base rounded-2xl"
                  >
                    {tr(UI.next)} {isRtl ? "←" : "→"}
                  </Button>
                </div>
              </div>
            )}

            {step.kind === "review" && (
              <div className="flex-1 flex flex-col">
                <div className="mb-6 text-center">
                  <div className="text-5xl mb-3">🎉</div>
                  <h2 className="text-3xl font-bold mb-2">{tr(UI.almost)}</h2>
                  <p className="text-muted-foreground">{tr(UI.thanksBody)}</p>
                </div>
                <Button
                  onClick={onSubmit}
                  disabled={submitting}
                  variant="cta"
                  size="lg"
                  className="w-full h-14 text-base rounded-2xl shadow-md hover:shadow-lg"
                >
                  {submitting ? tr(UI.submitting) : tr(UI.submit)}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
