import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { generateRouteEvents } from "@/lib/ai";

export const Route = createFileRoute("/_authenticated/admin_/shipments/new")({
  head: () => ({ meta: [{ title: "New Shipment — Zipco Admin" }, { name: "robots", content: "noindex" }] }),
  component: NewShipmentPage,
});

type EventRow = { status: string; location: string; description: string; event_time: string };

const STATUS_TEMPLATES = [
  "Item Processed at Origin Warehouse",
  "Picked up by Carrier",
  "Departed Origin Port",
  "In Transit via Ocean Freight",
  "In Transit via Air Freight",
  "Arrived at Transit Hub",
  "Customs Clearance in Progress",
  "Customs Released",
  "Arrived at Destination Port",
  "Out for Delivery",
  "Delivered",
  "DELAYED",
  "MOVING",
  "STOP",
  "FLIGHT CHANGE",
  "FLIGHT CHANGE CHARGES",
  "SHIPMENT CHANGE",
  "SHIPMENT CHANGE CHARGES",
  "CUSTOM IMPOUND",
  "CUSTOM IMPOUND CHARGES",
  "ANTI MONEY LAUNDERING CLEARANCE",
  "CLEARANCE FEE",
  "INVESTIGATION",
  "Final FBI Clearance",
  "FBI IMPOUND",
  "FBI IMPOUND CHARGES"
];

function NewShipmentPage() {
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState<EventRow[]>([
    { status: "Item Processed at Origin Warehouse", location: "", description: "", event_time: new Date().toISOString().slice(0, 16) },
  ]);

  function addEvent() {
    setEvents((e) => [...e, { status: "", location: "", description: "", event_time: new Date().toISOString().slice(0, 16) }]);
  }
  function removeEvent(i: number) { setEvents((e) => e.filter((_, idx) => idx !== i)); }
  function updateEvent(i: number, k: keyof EventRow, v: string) {
    setEvents((e) => e.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)));
  }

  const [generatingAI, setGeneratingAI] = useState(false);
  async function handleAIGenerate() {
    const form = document.querySelector("form");
    if (!form) return;
    const origin = (form.elements.namedItem("origin") as HTMLInputElement).value;
    const dest = (form.elements.namedItem("destination") as HTMLInputElement).value;
    const type = (form.elements.namedItem("service_type") as HTMLInputElement).value;
    
    if (!origin || !dest) {
      toast.error("Please enter both Origin and Destination first!");
      return;
    }

    setGeneratingAI(true);
    toast.info("AI Route Agent is analyzing logistics...");
    try {
      const generated = await generateRouteEvents(origin, dest, type);
      if (Array.isArray(generated) && generated.length > 0) {
        setEvents(generated.map(g => ({
          status: g.status || "Item Processed at Origin Warehouse",
          location: g.location || "",
          description: g.description || "",
          event_time: g.event_time ? new Date(g.event_time).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
        })));
        toast.success("AI generated a highly realistic route!");
      }
    } catch (err: any) {
      toast.error(err.message || "AI failed to generate route");
    } finally {
      setGeneratingAI(false);
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const shipment = {
      tracking_number: String(fd.get("tracking_number") || "").trim().toUpperCase(),
      sender_name: String(fd.get("sender_name") || ""),
      sender_address: String(fd.get("sender_address") || "") || null,
      recipient_name: String(fd.get("recipient_name") || ""),
      recipient_address: String(fd.get("recipient_address") || "") || null,
      origin: String(fd.get("origin") || ""),
      destination: String(fd.get("destination") || ""),
      service_type: String(fd.get("service_type") || "Ocean Freight"),
      weight_kg: fd.get("weight_kg") ? Number(fd.get("weight_kg")) : null,
      package_type: String(fd.get("package_type") || "") || null,
      current_status: events[events.length - 1]?.status || "Item Processed",
      progress_percent: Number(fd.get("progress_percent") || 0),
      shipped_at: fd.get("shipped_at") ? new Date(String(fd.get("shipped_at"))).toISOString() : null,
      estimated_delivery: fd.get("estimated_delivery") ? String(fd.get("estimated_delivery")) : null,
      notes: String(fd.get("notes") || "") || null,
    };

    const { data: created, error } = await supabase.from("shipments").insert(shipment).select().single();
    if (error || !created) { toast.error(error?.message || "Failed"); setSaving(false); return; }

    if (events.length) {
      const rows = events.filter((ev) => ev.status.trim()).map((ev, i) => ({
        shipment_id: created.id,
        status: ev.status,
        location: ev.location || null,
        description: ev.description || null,
        event_time: new Date(ev.event_time).toISOString(),
        sort_order: i,
      }));
      if (rows.length) {
        const { error: e2 } = await supabase.from("shipment_events").insert(rows);
        if (e2) toast.error(`Events: ${e2.message}`);
      }
    }

    toast.success("Shipment created");
    nav({ to: "/admin" });
  }

  return (
    <div className="container-wide py-10 max-w-4xl">
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back</Link>
      <h1 className="mt-3 font-display text-3xl font-bold">New Shipment</h1>
      <p className="mt-1 text-sm text-muted-foreground">Create a tracking record with a full timeline of events.</p>

      <form onSubmit={submit} className="mt-8 space-y-8">
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Shipment details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <F name="tracking_number" label="Tracking Number" required placeholder="ZIP-DEMO-001" />
            <F name="service_type" label="Service Type" defaultValue="Ocean Freight" />
            <F name="sender_name" label="Sender Name" required />
            <F name="recipient_name" label="Recipient Name" required />
            <F name="sender_address" label="Sender Address" />
            <F name="recipient_address" label="Recipient Address" />
            <F name="origin" label="Origin" required placeholder="Los Angeles, USA" />
            <F name="destination" label="Destination" required placeholder="Singapore" />
            <F name="weight_kg" label="Weight (kg)" type="number" step="0.01" />
            <F name="package_type" label="Package Type" placeholder="40ft Container" />
            <F name="shipped_at" label="Shipped At" type="datetime-local" />
            <F name="estimated_delivery" label="Estimated Delivery" type="date" />
            <F name="progress_percent" label="Progress %" type="number" min={0} max={100} defaultValue={0} />
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium">Notes</label>
              <textarea name="notes" rows={2} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold">Tracking events</h2>
              <p className="mt-1 text-xs text-muted-foreground">Timeline entries shown to customers. Last one becomes current status.</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={handleAIGenerate} disabled={generatingAI} className="inline-flex items-center gap-1.5 rounded-md border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-600 hover:bg-purple-500/20 disabled:opacity-50">
                {generatingAI ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {generatingAI ? "Agent is routing..." : "Ask AI Agent"}
              </button>
              <button type="button" onClick={addEvent} className="inline-flex items-center gap-1 rounded-md bg-gradient-gold px-3 py-1.5 text-xs font-semibold"><Plus className="h-3 w-3" />Add event</button>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {events.map((ev, i) => (
              <div key={i} className="rounded-xl border p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Status</label>
                    <select value={ev.status} onChange={(e) => updateEvent(i, "status", e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                      <option value="" disabled>Select status...</option>
                      {STATUS_TEMPLATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      {ev.status && !STATUS_TEMPLATES.includes(ev.status) && <option value={ev.status}>{ev.status}</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Location</label>
                    <input value={ev.location} onChange={(e) => updateEvent(i, "location", e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Port of Los Angeles" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Timestamp</label>
                    <input type="datetime-local" value={ev.event_time} onChange={(e) => updateEvent(i, "event_time", e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Description</label>
                    <input value={ev.description} onChange={(e) => updateEvent(i, "description", e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Container loaded onto vessel MSC Aurora" />
                  </div>
                </div>
                {events.length > 1 && (
                  <button type="button" onClick={() => removeEvent(i)} className="mt-3 inline-flex items-center gap-1 text-xs text-destructive"><Trash2 className="h-3 w-3" />Remove</button>
                )}
              </div>
            ))}
          </div>
          <datalist id="status-templates">
          </datalist>
        </section>

        <button disabled={saving} className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-60">
          {saving ? "Creating…" : "Create Shipment"}
        </button>
      </form>
    </div>
  );
}

function F({ name, label, type = "text", required, placeholder, defaultValue, step, min, max }: any) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}{required && " *"}</label>
      <input name={name} type={type} step={step} min={min} max={max} required={required} placeholder={placeholder} defaultValue={defaultValue} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm" />
    </div>
  );
}
