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

type Q = { key: string; label: string; options: string[] };

const RADIO_QUESTIONS: Q[] = [
  {
    key: "satisfaction",
    label: "How satisfied were you with the workshop?",
    options: ["Very satisfied", "Somewhat satisfied", "Neutral", "Somewhat dissatisfied", "Very dissatisfied"],
  },
  {
    key: "recommendation",
    label: "How likely are you to recommend this workshop to others?",
    options: ["Very likely", "Somewhat likely", "Neutral", "Somewhat unlikely", "Very unlikely"],
  },
  {
    key: "length_appropriate",
    label: "Was the workshop length appropriate?",
    options: ["Too short", "Just right", "Too long"],
  },
  {
    key: "expectations",
    label: "Did the workshop meet your expectations?",
    options: ["Exceeded expectations", "Met expectations", "Did not meet expectations"],
  },
  {
    key: "facilitators",
    label: "How engaging were the facilitators?",
    options: ["Extremely engaging", "Very engaging", "Somewhat engaging", "Not very engaging", "Not at all engaging"],
  },
  {
    key: "materials",
    label: "Were the materials and resources provided helpful?",
    options: ["Extremely helpful", "Very helpful", "Somewhat helpful", "Not very helpful", "Not at all helpful"],
  },
  {
    key: "source",
    label: "How did you hear about Terraria Workshops?",
    options: [
      "Instagram",
      "TikTok",
      "Facebook",
      "Google Search",
      "Friend or family recommendation",
      "Event / collaboration",
      "Walk-in / saw the place",
      "Other",
    ],
  },
];

const TEXT_QUESTIONS = [
  { key: "liked_most", label: "What did you like most about the workshop?" },
  { key: "suggestions", label: "Do you have any other comments or suggestions?" },
  { key: "effectiveness", label: "How do you think the workshop could have been made more effective?" },
];

export default function Feedback() {
  const navigate = useNavigate();
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
      toast({ title: "Could not submit", description: error.message, variant: "destructive" });
      return;
    }
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <SEOHead title="Thank you" description="Thank you for your feedback" path="/feedback" />
        <div className="max-w-md text-center bg-card rounded-2xl shadow-lg p-8 border">
          <CheckCircle2 className="w-14 h-14 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-2">Thank you!</h1>
          <p className="text-muted-foreground mb-6">
            Your feedback helps us make every workshop better.
          </p>
          <Button onClick={() => navigate("/")} variant="cta">Back to home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <SEOHead
        title="Workshop Feedback"
        description="Share your experience at our pottery workshop. Your feedback helps us improve."
        path="/feedback"
      />
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Pottery Workshop Feedback</h1>
          <p className="text-muted-foreground">
            We'd love to hear about your experience. It only takes a couple of minutes.
          </p>
        </header>

        <form onSubmit={onSubmit} className="space-y-6 bg-card rounded-2xl shadow-md border p-6 sm:p-8">
          <div className="space-y-2">
            <Label htmlFor="name">Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input id="name" value={form.name || ""} onChange={(e) => set("name", e.target.value)} maxLength={100} />
          </div>

          {RADIO_QUESTIONS.map((q) => (
            <div key={q.key} className="space-y-3">
              <Label className="text-base">{q.label}</Label>
              <RadioGroup
                value={form[q.key] || ""}
                onValueChange={(v) => set(q.key, v)}
                className="grid gap-2"
              >
                {q.options.map((opt) => (
                  <label
                    key={opt}
                    htmlFor={`${q.key}-${opt}`}
                    className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5 cursor-pointer hover:bg-accent/40 transition-colors"
                  >
                    <RadioGroupItem id={`${q.key}-${opt}`} value={opt} />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          ))}

          {TEXT_QUESTIONS.map((q) => (
            <div key={q.key} className="space-y-2">
              <Label htmlFor={q.key} className="text-base">{q.label}</Label>
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
            {submitting ? "Submitting..." : "Submit feedback"}
          </Button>
        </form>
      </div>
    </div>
  );
}
