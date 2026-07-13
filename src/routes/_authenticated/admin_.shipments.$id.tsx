import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin_/shipments/$id")({
  head: () => ({ meta: [{ title: "Edit Shipment — Zipco Admin" }, { name: "robots", content: "noindex" }] }),
  component: EditShipmentPage,
});

type EventRow = { id?: string; status: string; location: string; description: string; event_time: string };

function EditShipmentPage() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const [shipment, setShipment] = useState<any>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("shipments").select("*").eq("id", id).maybeSingle().then(({ data }) => setShipment(data));
    supabase.from("shipment_events").select("*").eq("shipment_id", id).order("event_time").then(({ data }) => {
      setEvents(((data as any[]) ?? []).map((e) => ({
        id: e.id, status: e.status, location: e.location ?? "", description: e.description ?? "",
        event_time: new Date(e.event_time).toISOString().slice(0, 16),
      })));
    });
  }, [id]);

  if (!shipment) return <div className="container-wide py-20 text-center text-muted-foreground">Loading…</div>;

  function upd(k: string, v: any) { setShipment((s: any) => ({ ...s, [k]: v })); }

  async function save() {
    setSaving(true);
    const patch = {
      tracking_number: shipment.tracking_number,
      sender_name: shipment.sender_name, recipient_name: shipment.recipient_name,
      origin: shipment.origin, destination: shipment.destination,
      service_type: shipment.service_type,
      current_status: events[events.length - 1]?.status || shipment.current_status,
      progress_percent: Number(shipment.progress_percent) || 0,
      estimated_delivery: shipment.estimated_delivery,
      weight_kg: shipment.weight_kg, package_type: shipment.package_type,
    };
    const { error } = await supabase.from("shipments").update(patch).eq("id", id);
    if (error) { toast.error(error.message); setSaving(false); return; }
    // Replace all events (simple approach)
    await supabase.from("shipment_events").delete().eq("shipment_id", id);
    const rows = events.filter((ev) => ev.status.trim()).map((ev, i) => ({
      shipment_id: id, status: ev.status, location: ev.location || null,
      description: ev.description || null, event_time: new Date(ev.event_time).toISOString(), sort_order: i,
    }));
    if (rows.length) await supabase.from("shipment_events").insert(rows);
    toast.success("Saved");
    setSaving(false);
    nav({ to: "/admin" });
  }

  return (
    <div className="container-wide py-10 max-w-4xl">
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back</Link>
      <h1 className="mt-3 font-display text-3xl font-bold">Edit Shipment</h1>
      <p className="mt-1 text-sm text-muted-foreground font-mono">{shipment.tracking_number}</p>

      <section className="mt-8 rounded-2xl border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FI label="Tracking Number" value={shipment.tracking_number} onChange={(v) => upd("tracking_number", v)} />
          <FI label="Service Type" value={shipment.service_type} onChange={(v) => upd("service_type", v)} />
          <FI label="Sender" value={shipment.sender_name} onChange={(v) => upd("sender_name", v)} />
          <FI label="Recipient" value={shipment.recipient_name} onChange={(v) => upd("recipient_name", v)} />
          <FI label="Origin" value={shipment.origin} onChange={(v) => upd("origin", v)} />
          <FI label="Destination" value={shipment.destination} onChange={(v) => upd("destination", v)} />
          <FI label="Progress %" type="number" value={String(shipment.progress_percent ?? 0)} onChange={(v) => upd("progress_percent", Number(v))} />
          <FI label="ETA" type="date" value={shipment.estimated_delivery ?? ""} onChange={(v) => upd("estimated_delivery", v || null)} />
          <FI label="Weight (kg)" type="number" value={String(shipment.weight_kg ?? "")} onChange={(v) => upd("weight_kg", v ? Number(v) : null)} />
          <FI label="Package Type" value={shipment.package_type ?? ""} onChange={(v) => upd("package_type", v)} />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Tracking events</h2>
          <button onClick={() => setEvents((e) => [...e, { status: "", location: "", description: "", event_time: new Date().toISOString().slice(0, 16) }])} className="inline-flex items-center gap-1 rounded-md bg-gradient-gold px-3 py-1.5 text-xs font-semibold"><Plus className="h-3 w-3" />Add</button>
        </div>
        <div className="mt-4 space-y-4">
          {events.map((ev, i) => (
            <div key={i} className="rounded-xl border p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <FI label="Status" value={ev.status} onChange={(v) => setEvents((e) => e.map((r, idx) => idx === i ? { ...r, status: v } : r))} />
                <FI label="Location" value={ev.location} onChange={(v) => setEvents((e) => e.map((r, idx) => idx === i ? { ...r, location: v } : r))} />
                <FI label="Timestamp" type="datetime-local" value={ev.event_time} onChange={(v) => setEvents((e) => e.map((r, idx) => idx === i ? { ...r, event_time: v } : r))} />
                <FI label="Description" value={ev.description} onChange={(v) => setEvents((e) => e.map((r, idx) => idx === i ? { ...r, description: v } : r))} />
              </div>
              <button onClick={() => setEvents((e) => e.filter((_, idx) => idx !== i))} className="mt-3 inline-flex items-center gap-1 text-xs text-destructive"><Trash2 className="h-3 w-3" />Remove</button>
            </div>
          ))}
        </div>
      </section>

      <button onClick={save} disabled={saving} className="mt-6 w-full rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-60">
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}

function FI({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm" />
    </div>
  );
}
