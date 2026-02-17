import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, UserPlus } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

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

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("role", "admin")
      .maybeSingle();

    if (!roles) {
      await supabase.auth.signOut();
      setError("Access denied — admin only");
      setLoading(false);
      return;
    }

    navigate("/admin");
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
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cta/10 border-2 border-cta/20 flex items-center justify-center">
            {isSignUp ? <UserPlus className="w-6 h-6 text-cta" /> : <Lock className="w-6 h-6 text-cta" />}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{isSignUp ? "Create Account" : "Admin Login"}</h1>
          <p className="text-sm text-muted-foreground">Terraria Workshops Dashboard</p>
        </div>

        <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4 bg-card p-6 rounded-3xl border-2 border-border/40">
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
    </main>
  );
};

export default AdminLogin;
