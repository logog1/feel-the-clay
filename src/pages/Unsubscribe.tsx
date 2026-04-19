import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

type State = "loading" | "valid" | "already" | "invalid" | "confirming" | "done" | "error";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    fetch(`${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${token}`, {
      headers: { apikey: SUPABASE_KEY },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.valid) setState("valid");
        else if (d.reason === "already_unsubscribed") setState("already");
        else setState("invalid");
      })
      .catch(() => setState("error"));
  }, [token]);

  const confirm = async () => {
    setState("confirming");
    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/handle-email-unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY },
        body: JSON.stringify({ token }),
      });
      const d = await r.json();
      if (d.success || d.reason === "already_unsubscribed") setState("done");
      else setState("error");
    } catch { setState("error"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full bg-card border border-border/40 rounded-2xl p-8 shadow-sm text-center space-y-4">
        {state === "loading" && (<><Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" /><p className="text-muted-foreground">Verifying…</p></>)}
        {state === "valid" && (<>
          <h1 className="text-2xl font-bold">Unsubscribe from Terraria emails?</h1>
          <p className="text-muted-foreground">You won't receive any further emails from us.</p>
          <Button onClick={confirm} className="w-full">Confirm unsubscribe</Button>
        </>)}
        {state === "confirming" && (<><Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" /><p>Processing…</p></>)}
        {state === "done" && (<><CheckCircle2 className="w-12 h-12 mx-auto text-primary" /><h1 className="text-2xl font-bold">You're unsubscribed</h1><p className="text-muted-foreground">We won't email you again. Sorry to see you go.</p></>)}
        {state === "already" && (<><CheckCircle2 className="w-12 h-12 mx-auto text-primary" /><h1 className="text-2xl font-bold">Already unsubscribed</h1><p className="text-muted-foreground">This email is no longer on our list.</p></>)}
        {state === "invalid" && (<><AlertCircle className="w-12 h-12 mx-auto text-destructive" /><h1 className="text-2xl font-bold">Invalid link</h1><p className="text-muted-foreground">This unsubscribe link is invalid or expired.</p></>)}
        {state === "error" && (<><AlertCircle className="w-12 h-12 mx-auto text-destructive" /><h1 className="text-2xl font-bold">Something went wrong</h1><p className="text-muted-foreground">Please try again later.</p></>)}
      </div>
    </div>
  );
}
