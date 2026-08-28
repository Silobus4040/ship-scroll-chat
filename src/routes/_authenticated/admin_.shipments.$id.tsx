import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import { generateRouteEvents } from "@/lib/ai";
import { getConsignmentPhotoUrl } from "@/lib/storage-url";

export const Route = createFileRoute("/_authenticated/admin_/shipments/$id")({
  head: () => ({ meta: [{ title: "Edit Shipment — Zipco Admin" }, { name: "robots", content: "noindex" }] }),
  component: EditShipmentPage,
});

type EventRow = { id?: string; status: string; location: string; description: string; event_time: string };

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

function EditShipmentPage() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const generateRouteEventsFn = useServerFn(generateRouteEvents);
  const [shipment, setShipment] = useState<any>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("shipments").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      if (data) {
        setShipment(data);
        getConsignmentPhotoUrl(data.consignment_photo_url).then(setPhotoUrl);
      }
    });
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
    
    let consignment_photo_url = shipment.consignment_photo_url;
    if (photoFile && photoFile.size > 0) {
      const ext = photoFile.name.split('.').pop();
      const path = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("consignment_photos").upload(path, photoFile);
      if (uploadError) { toast.error("Photo upload failed: " + uploadError.message); setSaving(false); return; }
      const { data: publicUrlData } = supabase.storage.from("consignment_photos").getPublicUrl(path);
      consignment_photo_url = publicUrlData.publicUrl;
    }

    const patch = {
      tracking_number: shipment.tracking_number,
      sender_name: shipment.sender_name, recipient_name: shipment.recipient_name,
      origin: shipment.origin, destination: shipment.destination,
      service_type: shipment.service_type,
      current_status: events[events.length - 1]?.status || shipment.current_status,
      progress_percent: Number(shipment.progress_percent) || 0,
      estimated_delivery: shipment.estimated_delivery,
      weight_kg: shipment.weight_kg, package_type: shipment.package_type,
      consignment_photo_url,
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

  async function handleAIGenerate() {
    if (!shipment.origin || !shipment.destination) {
      toast.error("Please ensure Origin and Destination are set first!");
      return;
    }
    setGeneratingAI(true);
    toast.info("AI Route Agent is analyzing logistics...");
    try {
      const generated = await generateRouteEventsFn({ data: { origin: shipment.origin, destination: shipment.destination, serviceType: shipment.service_type } });
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
          <div>
            <label className="block text-sm font-medium">Consignment Photo</label>
            <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm" />
            {shipment.consignment_photo_url && !photoFile && <p className="mt-1 text-xs text-muted-foreground">Current photo uploaded. Uploading a new one will replace it.</p>}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold">Tracking events</h2>
            <p className="mt-1 text-xs text-muted-foreground">Timeline entries shown to customers. Last one becomes current status.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleAIGenerate} disabled={generatingAI} className="inline-flex items-center gap-1.5 rounded-md border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-600 hover:bg-purple-500/20 disabled:opacity-50">
              {generatingAI ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {generatingAI ? "Agent is routing..." : "AI Shipping Route Agent"}
            </button>
            <button onClick={() => setEvents((e) => [...e, { status: "", location: "", description: "", event_time: new Date().toISOString().slice(0, 16) }])} className="inline-flex items-center gap-1 rounded-md bg-gradient-gold px-3 py-1.5 text-xs font-semibold"><Plus className="h-3 w-3" />Add</button>
          </div>
        </div>
        <div className="mt-4 space-y-4">
          {events.map((ev, i) => (
            <div key={i} className="rounded-xl border p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium">Status</label>
                  <select value={ev.status} onChange={(e) => setEvents((evs) => evs.map((r, idx) => idx === i ? { ...r, status: e.target.value } : r))} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm">
                    <option value="" disabled>Select status...</option>
                    {STATUS_TEMPLATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    {ev.status && !STATUS_TEMPLATES.includes(ev.status) && <option value={ev.status}>{ev.status}</option>}
                  </select>
                </div>
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
