import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, UserPlus } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { IconTile } from "@/components/ui/icon-tile";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [partnerPicks, setPartnerPicks] = useState<Array<{ slug: string; name: string }>>([]);


  // Guard against concurrent routeByRole runs (post-signIn call vs. onAuthStateChange('SIGNED_IN')).
  const routingRef = useRef(false);

  // Route the signed-in user based on their role.
  // - admin        → /admin
  // - hotel_staff  → /partners/<slug>/concierge (their assigned property)
  // - no role      → sign out, show "pending approval"
  const routeByRole = async () => {
    if (routingRef.current) return;
    routingRef.current = true;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (roleRow?.role === "admin") {
        navigate("/admin");
        return;
      }

      if (roleRow?.role === "hotel_staff") {
        // Look up all partner assignments — staff can be linked to multiple properties.
        const { data: staffRows } = await (supabase as any)
          .from("partner_staff")
          .select("partner_id, hotel_partners:partner_id(slug, name)")
          .eq("user_id", session.user.id);

        const picks = (staffRows || [])
          .map((r: any) => ({ slug: r.hotel_partners?.slug, name: r.hotel_partners?.name }))
          .filter((r: any) => r.slug);

        if (picks.length === 1) {
          navigate(`/partners/${picks[0].slug}/concierge`);
        } else if (picks.length > 1) {
          setPartnerPicks(picks);
          setLoading(false);
        } else {
          await supabase.auth.signOut();
          setError("Your staff account is not linked to a property yet. Please contact the Terraria team.");
          setLoading(false);
        }
        return;
      }


      // No role at all — pending approval
      await supabase.auth.signOut();
      setError("Your account is pending approval. Please wait for an admin to grant you access.");
      setLoading(false);
    } finally {
      // Release the guard so a subsequent auth event (e.g. re-login after signOut) can route again.
      routingRef.current = false;
    }
  };

  // Auto-redirect if already authenticated (e.g. after Google OAuth redirect).
  // The onAuthStateChange listener is the single source of truth for post-sign-in routing;
  // handleLogin only kicks off the sign-in and lets the listener drive navigation.
  useEffect(() => {
    routeByRole();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        routeByRole();
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("Invalid credentials");
      setLoading(false);
      return;
    }
    // Routing is handled by the onAuthStateChange('SIGNED_IN') listener.
  };



  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      setError(error.message || "Google sign-in failed");
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess("Account created! Check your email to verify, then ask the owner to assign your admin role.");
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <SEOHead title="Admin Login" description="Admin login for Terraria Workshops" path="/admin/login" />
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <IconTile icon={isSignUp ? UserPlus : Lock} size="lg" className="mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">{isSignUp ? "Create Account" : "Admin Login"}</h1>
          <p className="text-sm text-muted-foreground">Terraria Workshops Dashboard</p>
        </div>

        <div className="bg-card p-6 rounded-3xl border-2 border-border/40 space-y-4">
          {/* Google Sign-In */}
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl gap-3 h-12 text-sm font-medium"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/40" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">or</span></div>
          </div>

          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-password">Password</Label>
              <Input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl" required />
            </div>
            {error && <p className="text-xs text-destructive text-center">{error}</p>}
            {success && <p className="text-xs text-primary text-center">{success}</p>}
            <Button type="submit" variant="cta" className="w-full" disabled={loading}>
              {loading ? (isSignUp ? "Creating..." : "Signing in...") : (isSignUp ? "Sign Up" : "Sign In")}
            </Button>
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(""); setSuccess(""); }}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default AdminLogin;
