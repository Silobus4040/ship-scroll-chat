import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Ship } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Login — Zipco International" },
      { name: "description", content: "Zipco International admin sign-in." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) nav({ to: "/admin", replace: true });
    });
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
      if (error) { toast.error(error.message); setLoading(false); return; }
      toast.success("Account created — signing in…");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { toast.error(error.message); setLoading(false); return; }
    }
    setLoading(false);
    nav({ to: "/admin", replace: true });
  }

  return (
    <section className="grid min-h-[80vh] place-items-center bg-secondary px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-elegant">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-gradient-gold"><Ship className="h-5 w-5" /></span>
          <div>
            <h1 className="font-display text-2xl font-bold">Zipco Admin</h1>
            <p className="text-sm text-muted-foreground">{mode === "signin" ? "Sign in to your dashboard" : "Create an admin account"}</p>
          </div>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <button disabled={loading} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "signin" ? (
            <>Need an account? <button className="text-accent font-semibold" onClick={() => setMode("signup")}>Sign up</button></>
          ) : (
            <>Already have an account? <button className="text-accent font-semibold" onClick={() => setMode("signin")}>Sign in</button></>
          )}
        </p>
        <p className="mt-4 rounded-md bg-secondary p-3 text-xs text-muted-foreground">
          <strong>Admin access:</strong> First create your account. Then message the site owner to be granted the <code>admin</code> role.
        </p>
      </div>
    </section>
  );
}
