import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";
import { CheckCircle2 } from "lucide-react";
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
  optional: { en: "(optional)", fr: "(facultatif)", es: "(opcional)", ar: "(اختياري)" },
  submit: { en: "Submit feedback", fr: "Envoyer", es: "Enviar", ar: "إرسال" },
  submitting: { en: "Submitting...", fr: "Envoi...", es: "Enviando...", ar: "جارٍ الإرسال..." },
  thanks: { en: "Thank you!", fr: "Merci !", es: "¡Gracias!", ar: "شكراً لك!" },
  thanksBody: {
    en: "Your feedback helps us make every workshop better.",
    fr: "Vos retours nous aident à améliorer chaque atelier.",
    es: "Tu opinión nos ayuda a mejorar cada taller.",
    ar: "ملاحظاتك تساعدنا على تحسين كل ورشة.",
  },
  back: { en: "Back to home", fr: "Retour à l'accueil", es: "Volver al inicio", ar: "العودة للرئيسية" },
  error: { en: "Could not submit", fr: "Échec de l'envoi", es: "No se pudo enviar", ar: "تعذر الإرسال" },
};

type Q = { key: string; label: L; options: { value: string; label: L }[] };

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
      { value: "Very satisfied", label: { en: "Very satisfied", fr: "Très satisfait", es: "Muy satisfecho", ar: "راضٍ جدًا" } },
      { value: "Somewhat satisfied", label: { en: "Somewhat satisfied", fr: "Plutôt satisfait", es: "Algo satisfecho", ar: "راضٍ نوعًا ما" } },
      { value: "Neutral", label: { en: "Neutral", fr: "Neutre", es: "Neutral", ar: "محايد" } },
      { value: "Somewhat dissatisfied", label: { en: "Somewhat dissatisfied", fr: "Plutôt insatisfait", es: "Algo insatisfecho", ar: "غير راضٍ نوعًا ما" } },
      { value: "Very dissatisfied", label: { en: "Very dissatisfied", fr: "Très insatisfait", es: "Muy insatisfecho", ar: "غير راضٍ تمامًا" } },
    ],
  },
  {
    key: "recommendation",
    label: {
      en: "How likely are you to recommend this workshop to others?",
      fr: "Quelle est la probabilité que vous recommandiez cet atelier ?",
      es: "¿Qué tan probable es que recomiendes este taller?",
      ar: "ما مدى احتمال أن توصي بهذه الورشة للآخرين؟",
    },
    options: [
      { value: "Very likely", label: { en: "Very likely", fr: "Très probable", es: "Muy probable", ar: "محتمل جدًا" } },
      { value: "Somewhat likely", label: { en: "Somewhat likely", fr: "Plutôt probable", es: "Algo probable", ar: "محتمل نوعًا ما" } },
      { value: "Neutral", label: { en: "Neutral", fr: "Neutre", es: "Neutral", ar: "محايد" } },
      { value: "Somewhat unlikely", label: { en: "Somewhat unlikely", fr: "Plutôt improbable", es: "Algo improbable", ar: "غير محتمل نوعًا ما" } },
      { value: "Very unlikely", label: { en: "Very unlikely", fr: "Très improbable", es: "Muy improbable", ar: "غير محتمل أبدًا" } },
    ],
  },
  {
    key: "length_appropriate",
    label: {
      en: "Was the workshop length appropriate?",
      fr: "La durée de l'atelier était-elle adaptée ?",
      es: "¿La duración del taller fue adecuada?",
      ar: "هل كانت مدة الورشة مناسبة؟",
    },
    options: [
      { value: "Too short", label: { en: "Too short", fr: "Trop courte", es: "Muy corta", ar: "قصيرة جدًا" } },
      { value: "Just right", label: { en: "Just right", fr: "Parfaite", es: "Adecuada", ar: "مناسبة" } },
      { value: "Too long", label: { en: "Too long", fr: "Trop longue", es: "Muy larga", ar: "طويلة جدًا" } },
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
      { value: "Exceeded expectations", label: { en: "Exceeded expectations", fr: "A dépassé mes attentes", es: "Superó las expectativas", ar: "فاقت التوقعات" } },
      { value: "Met expectations", label: { en: "Met expectations", fr: "A répondu à mes attentes", es: "Cumplió las expectativas", ar: "لبّت التوقعات" } },
      { value: "Did not meet expectations", label: { en: "Did not meet expectations", fr: "N'a pas répondu à mes attentes", es: "No cumplió las expectativas", ar: "لم تلبِّ التوقعات" } },
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
      { value: "Extremely engaging", label: { en: "Extremely engaging", fr: "Extrêmement captivants", es: "Extremadamente atractivos", ar: "متفاعلون للغاية" } },
      { value: "Very engaging", label: { en: "Very engaging", fr: "Très captivants", es: "Muy atractivos", ar: "متفاعلون جدًا" } },
      { value: "Somewhat engaging", label: { en: "Somewhat engaging", fr: "Assez captivants", es: "Algo atractivos", ar: "متفاعلون نوعًا ما" } },
      { value: "Not very engaging", label: { en: "Not very engaging", fr: "Peu captivants", es: "Poco atractivos", ar: "غير متفاعلين كثيرًا" } },
      { value: "Not at all engaging", label: { en: "Not at all engaging", fr: "Pas du tout captivants", es: "Nada atractivos", ar: "غير متفاعلين إطلاقًا" } },
    ],
  },
  {
    key: "materials",
    label: {
      en: "Were the materials and resources provided helpful?",
      fr: "Le matériel et les ressources fournis ont-ils été utiles ?",
      es: "¿Los materiales y recursos proporcionados fueron útiles?",
      ar: "هل كانت المواد والموارد المقدمة مفيدة؟",
    },
    options: [
      { value: "Extremely helpful", label: { en: "Extremely helpful", fr: "Extrêmement utiles", es: "Extremadamente útiles", ar: "مفيدة للغاية" } },
      { value: "Very helpful", label: { en: "Very helpful", fr: "Très utiles", es: "Muy útiles", ar: "مفيدة جدًا" } },
      { value: "Somewhat helpful", label: { en: "Somewhat helpful", fr: "Assez utiles", es: "Algo útiles", ar: "مفيدة نوعًا ما" } },
      { value: "Not very helpful", label: { en: "Not very helpful", fr: "Peu utiles", es: "Poco útiles", ar: "غير مفيدة كثيرًا" } },
      { value: "Not at all helpful", label: { en: "Not at all helpful", fr: "Pas du tout utiles", es: "Nada útiles", ar: "غير مفيدة إطلاقًا" } },
    ],
  },
  {
    key: "source",
    label: {
      en: "How did you hear about Terraria Workshops?",
      fr: "Comment avez-vous entendu parler de Terraria Workshops ?",
      es: "¿Cómo te enteraste de Terraria Workshops?",
      ar: "كيف سمعت عن Terraria Workshops؟",
    },
    options: [
      { value: "Instagram", label: { en: "Instagram", fr: "Instagram", es: "Instagram", ar: "إنستغرام" } },
      { value: "TikTok", label: { en: "TikTok", fr: "TikTok", es: "TikTok", ar: "تيك توك" } },
      { value: "Facebook", label: { en: "Facebook", fr: "Facebook", es: "Facebook", ar: "فيسبوك" } },
      { value: "Google Search", label: { en: "Google Search", fr: "Recherche Google", es: "Búsqueda en Google", ar: "بحث Google" } },
      { value: "Friend or family recommendation", label: { en: "Friend or family recommendation", fr: "Recommandation d'un proche", es: "Recomendación de un amigo o familiar", ar: "توصية من صديق أو فرد من العائلة" } },
      { value: "Event / collaboration", label: { en: "Event / collaboration", fr: "Événement / collaboration", es: "Evento / colaboración", ar: "فعالية / تعاون" } },
      { value: "Walk-in / saw the place", label: { en: "Walk-in / saw the place", fr: "De passage / vu sur place", es: "De paso / vi el lugar", ar: "زيارة عابرة / شاهدت المكان" } },
      { value: "Other", label: { en: "Other", fr: "Autre", es: "Otro", ar: "أخرى" } },
    ],
  },
];

const TEXT_QUESTIONS: { key: string; label: L }[] = [
  {
    key: "liked_most",
    label: {
      en: "What did you like most about the workshop?",
      fr: "Qu'avez-vous le plus apprécié dans l'atelier ?",
      es: "¿Qué fue lo que más te gustó del taller?",
      ar: "ما الذي أعجبك أكثر في الورشة؟",
    },
  },
  {
    key: "suggestions",
    label: {
      en: "Do you have any other comments or suggestions?",
      fr: "Avez-vous d'autres commentaires ou suggestions ?",
      es: "¿Tienes algún otro comentario o sugerencia?",
      ar: "هل لديك أي تعليقات أو اقتراحات أخرى؟",
    },
  },
  {
    key: "effectiveness",
    label: {
      en: "How do you think the workshop could have been made more effective?",
      fr: "Comment l'atelier aurait-il pu être plus efficace selon vous ?",
      es: "¿Cómo crees que el taller podría haber sido más eficaz?",
      ar: "كيف يمكن جعل الورشة أكثر فعالية برأيك؟",
    },
  },
];

export default function Feedback() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const lang = language as Lang;
  const tr = (l: L) => l[lang] || l.en;

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      name: form.name?.trim() || null,
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
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <SEOHead title={tr(UI.thanks)} description={tr(UI.thanksBody)} path="/feedback" />
        <div className="max-w-md text-center bg-card rounded-2xl shadow-lg p-8 border">
          <CheckCircle2 className="w-14 h-14 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-2">{tr(UI.thanks)}</h1>
          <p className="text-muted-foreground mb-6">{tr(UI.thanksBody)}</p>
          <Button onClick={() => navigate("/")} variant="cta">{tr(UI.back)}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <SEOHead
        title={tr(UI.title)}
        description={tr(UI.intro)}
        path="/feedback"
      />
      <div className="max-w-2xl mx-auto">
        <img
          src={feedbackHero}
          alt={tr(UI.title)}
          className="w-full rounded-2xl shadow-md mb-6 object-cover"
          loading="eager"
        />
        <header className="mb-8 text-center">
          <h1 className="sr-only">{tr(UI.title)}</h1>
          <p className="text-muted-foreground">{tr(UI.intro)}</p>
        </header>

        <form onSubmit={onSubmit} className="space-y-6 bg-card rounded-2xl shadow-md border p-6 sm:p-8">
          <div className="space-y-2">
            <Label htmlFor="name">
              {tr(UI.name)} <span className="text-muted-foreground text-xs">{tr(UI.optional)}</span>
            </Label>
            <Input id="name" value={form.name || ""} onChange={(e) => set("name", e.target.value)} maxLength={100} />
          </div>

          {RADIO_QUESTIONS.map((q) => (
            <div key={q.key} className="space-y-3">
              <Label className="text-base">{tr(q.label)}</Label>
              <RadioGroup
                value={form[q.key] || ""}
                onValueChange={(v) => set(q.key, v)}
                className="grid gap-2"
              >
                {q.options.map((opt) => (
                  <label
                    key={opt.value}
                    htmlFor={`${q.key}-${opt.value}`}
                    className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5 cursor-pointer hover:bg-accent/40 transition-colors"
                  >
                    <RadioGroupItem id={`${q.key}-${opt.value}`} value={opt.value} />
                    <span className="text-sm">{tr(opt.label)}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          ))}

          {TEXT_QUESTIONS.map((q) => (
            <div key={q.key} className="space-y-2">
              <Label htmlFor={q.key} className="text-base">{tr(q.label)}</Label>
              <Textarea
                id={q.key}
                value={form[q.key] || ""}
                onChange={(e) => set(q.key, e.target.value)}
                maxLength={2000}
                rows={4}
              />
            </div>
          ))}

          <Button type="submit" variant="cta" size="lg" className="w-full" disabled={submitting}>
            {submitting ? tr(UI.submitting) : tr(UI.submit)}
          </Button>
        </form>
      </div>
    </div>
  );
}
