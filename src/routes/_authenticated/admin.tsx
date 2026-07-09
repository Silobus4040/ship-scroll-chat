import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Ship, Plus, LogOut, MessageSquare, FileText, Trash2, Shield } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Zipco" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type Shipment = { id: string; tracking_number: string; origin: string; destination: string; current_status: string; progress_percent: number; created_at: string };
type Quote = { id: string; full_name: string; email: string; origin: string; destination: string; service_type: string; created_at: string };
type Session = { id: string; visitor_name: string | null; visitor_email: string | null; last_message_at: string };

function AdminPage() {
  const nav = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"shipments" | "quotes" | "chats">("shipments");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setUserId(u.user.id);
      const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!role);
    })();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("shipments").select("id, tracking_number, origin, destination, current_status, progress_percent, created_at").order("created_at", { ascending: false }).then(({ data }) => setShipments((data as Shipment[]) ?? []));
    supabase.from("quote_requests").select("*").order("created_at", { ascending: false }).then(({ data }) => setQuotes((data as Quote[]) ?? []));
    supabase.from("chat_sessions").select("*").order("last_message_at", { ascending: false }).then(({ data }) => setSessions((data as Session[]) ?? []));
  }, [isAdmin, tab]);

  async function signOut() {
    await supabase.auth.signOut();
    nav({ to: "/", replace: true });
  }

  async function grantSelfAdmin() {
    if (!userId) return;
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (error) { toast.error(error.message); return; }
    toast.success("You are now an admin. Reloading…");
    setTimeout(() => location.reload(), 800);
  }

  async function deleteShipment(id: string) {
    if (!confirm("Delete this shipment?")) return;
    const { error } = await supabase.from("shipments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setShipments((s) => s.filter((x) => x.id !== id));
    toast.success("Deleted");
  }

  if (isAdmin === null) return <div className="container-wide py-20 text-center text-muted-foreground">Loading…</div>;

  if (!isAdmin) {
    // Bootstrap: any signed-in user can grant themselves admin if no admin exists yet.
    // For strict security, remove this in production and grant roles via SQL.
    return (
      <div className="container-wide py-20 max-w-lg">
        <div className="rounded-2xl border bg-card p-8 shadow-elegant text-center">
          <span className="inline-grid h-14 w-14 place-items-center rounded-full bg-accent/15 text-accent"><Shield className="h-7 w-7" /></span>
          <h1 className="mt-4 font-display text-2xl font-bold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">This account isn't yet an admin. If you are the site owner, click below to grant yourself admin access.</p>
          <button onClick={grantSelfAdmin} className="mt-6 rounded-lg bg-gradient-gold px-6 py-3 text-sm font-semibold shadow-gold">Make me admin</button>
          <button onClick={signOut} className="mt-3 block w-full text-xs text-muted-foreground hover:text-foreground">Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-wide py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent">Zipco Admin</p>
          <h1 className="font-display text-3xl font-bold">Operations Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/shipments/new" className="inline-flex items-center gap-2 rounded-lg bg-gradient-gold px-4 py-2 text-sm font-semibold shadow-gold"><Plus className="h-4 w-4" />New Shipment</Link>
          <button onClick={signOut} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm"><LogOut className="h-4 w-4" />Sign out</button>
        </div>
      </div>

      <div className="mt-6 flex gap-1 border-b">
        {([["shipments", Ship, `Shipments (${shipments.length})`], ["quotes", FileText, `Quotes (${quotes.length})`], ["chats", MessageSquare, `Chats (${sessions.length})`]] as const).map(([id, Icon, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium ${tab === id ? "border-accent text-accent" : "border-transparent text-muted-foreground"}`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "shipments" && (
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3">Tracking</th><th className="p-3">Route</th><th className="p-3">Status</th><th className="p-3">Progress</th><th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-3 font-mono">{s.tracking_number}</td>
                    <td className="p-3">{s.origin} → {s.destination}</td>
                    <td className="p-3">{s.current_status}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-secondary"><div className="h-full rounded-full bg-gradient-gold" style={{ width: `${s.progress_percent}%` }} /></div>
                        <span className="text-xs text-muted-foreground">{s.progress_percent}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <Link to="/admin/shipments/$id" params={{ id: s.id }} className="text-accent font-medium hover:underline">Edit</Link>
                      <button onClick={() => deleteShipment(s.id)} className="ml-3 text-destructive"><Trash2 className="h-4 w-4 inline" /></button>
                    </td>
                  </tr>
                ))}
                {shipments.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No shipments yet. Create one to get started.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === "quotes" && (
          <div className="grid gap-3">
            {quotes.map((q) => (
              <div key={q.id} className="rounded-xl border bg-card p-5">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="font-semibold">{q.full_name} · <span className="text-muted-foreground">{q.email}</span></p>
                    <p className="text-sm text-muted-foreground">{q.origin} → {q.destination} · {q.service_type}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {quotes.length === 0 && <p className="p-8 text-center text-muted-foreground">No quote requests yet.</p>}
          </div>
        )}

        {tab === "chats" && (
          <div className="grid gap-3">
            {sessions.map((s) => (
              <div key={s.id} className="rounded-xl border bg-card p-5">
                <p className="font-semibold">{s.visitor_name || "Anonymous"}{s.visitor_email && <span className="text-muted-foreground"> · {s.visitor_email}</span>}</p>
                <p className="text-xs text-muted-foreground mt-1">Last message: {new Date(s.last_message_at).toLocaleString()}</p>
              </div>
            ))}
            {sessions.length === 0 && <p className="p-8 text-center text-muted-foreground">No chat sessions yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
