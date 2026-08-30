import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Ship, MapPin, CheckCircle2, Circle, Package, Clock } from "lucide-react";
import { getConsignmentPhotoUrl } from "@/lib/storage-url";

export const Route = createFileRoute("/track/$number")({
  head: ({ params }) => ({
    meta: [
      { title: `Tracking ${params.number} — Zipco International` },
      { name: "description", content: `Live tracking status for Zipco shipment ${params.number}.` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrackingDetail,
});

type Shipment = {
  id: string; tracking_number: string; sender_name: string; recipient_name: string;
  origin: string; destination: string; service_type: string; current_status: string;
  progress_percent: number; estimated_delivery: string | null; shipped_at: string | null;
  weight_kg: number | null; package_type: string | null; consignment_photo_url: string | null;
};
type Event = { id: string; status: string; location: string | null; description: string | null; event_time: string };

function TrackingDetail() {
  const { number } = Route.useParams();
  const trackingNumber = number.trim().toUpperCase();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      const { data: s } = await supabase.from("shipments").select("*").eq("tracking_number", trackingNumber).maybeSingle();
      if (cancelled) return;
      if (!s) { setNotFound(true); setLoading(false); return; }
      const row = s as Shipment;
      setShipment(row);
      setPhotoUrl(await getConsignmentPhotoUrl(row.consignment_photo_url));
      const { data: ev } = await supabase.from("shipment_events").select("*").eq("shipment_id", s.id).order("event_time", { ascending: true });
      if (!cancelled) { setEvents((ev as Event[]) ?? []); setLoading(false); }
    })();

    const ch = supabase.channel(`ship-${trackingNumber}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "shipment_events" }, () => {
        supabase.from("shipments").select("*").eq("tracking_number", trackingNumber).maybeSingle().then(async ({ data }) => {
          if (!data) return;
          const row = data as Shipment;
          setShipment(row);
          setPhotoUrl(await getConsignmentPhotoUrl(row.consignment_photo_url));
          supabase.from("shipment_events").select("*").eq("shipment_id", data.id).order("event_time", { ascending: true }).then(({ data: ev }) => setEvents((ev as Event[]) ?? []));
        });
      }).subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [trackingNumber]);

  if (loading) return <div className="container-wide py-24 text-center text-muted-foreground">Loading tracking data…</div>;

  if (notFound) return (
    <div className="container-wide py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Tracking number not found</h1>
      <p className="mt-2 text-muted-foreground">We couldn't find a shipment with number <span className="font-mono">{number}</span>.</p>
      <Link to="/track" className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Try another number</Link>
    </div>
  );

  if (!shipment) return null;

  const pct = shipment.progress_percent ?? 0;

  const currentLocation = events.length > 0 && events[events.length - 1].location 
    ? events[events.length - 1].location 
    : (shipment.destination || shipment.origin);

  return (
    <>
      <section className="bg-navy py-14 text-navy-foreground">
        <div className="container-wide">
          <p className="text-xs uppercase tracking-widest text-gold">Tracking Number</p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-5xl">{shipment.tracking_number}</h1>
          <p className="mt-3 text-navy-foreground/80">{shipment.current_status}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto_1fr] items-center">
            <div className="rounded-xl bg-white/10 p-5">
              <p className="text-xs uppercase tracking-widest text-gold">Origin</p>
              <p className="mt-1 flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4" />{shipment.origin}</p>
            </div>
            <div className="hidden sm:block text-gold"><Ship className="h-8 w-8" /></div>
            <div className="rounded-xl bg-white/10 p-5">
              <p className="text-xs uppercase tracking-widest text-gold">Destination</p>
              <p className="mt-1 flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4" />{shipment.destination}</p>
            </div>
          </div>

          {/* Progress bar with ship */}
          <div className="relative mt-8">
            <div className="h-2 rounded-full bg-white/15">
              <div className="h-full rounded-full bg-gradient-gold transition-all duration-1000" style={{ width: `${pct}%` }} />
            </div>
            <div className="absolute -top-3 transition-all duration-1000" style={{ left: `calc(${pct}% - 12px)` }}>
              <Ship className="h-6 w-6 text-gold drop-shadow" />
            </div>
            <div className="mt-2 flex justify-between text-xs text-navy-foreground/70">
              <span>{shipment.shipped_at ? new Date(shipment.shipped_at).toLocaleDateString() : "Shipped"}</span>
              <span>{pct}% Complete</span>
              <span>{shipment.estimated_delivery ? `ETA ${new Date(shipment.estimated_delivery).toLocaleDateString()}` : "Delivery"}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container-wide grid gap-10 py-16 lg:grid-cols-[2fr_1fr]">
        <div>
          <h2 className="font-display text-2xl font-bold">Shipment Timeline</h2>
          {events.length === 0 ? (
            <p className="mt-6 text-muted-foreground">No status updates yet.</p>
          ) : (
            <ol className="mt-8 relative border-l-2 border-border pl-8 space-y-8">
              {events.map((e, i) => {
                const isLast = i === events.length - 1;
                return (
                  <li key={e.id} className="relative">
                    <span className={`absolute -left-[38px] grid h-7 w-7 place-items-center rounded-full ${isLast ? "bg-gradient-gold shadow-gold" : "bg-accent/20 text-accent"}`}>
                      {isLast ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-3 w-3 fill-current" />}
                    </span>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-semibold">{e.status}</h3>
                      <time className="text-xs text-muted-foreground">{new Date(e.event_time).toLocaleString()}</time>
                    </div>
                    {e.location && <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3 w-3" />{e.location}</p>}
                    {e.description && <p className="mt-2 text-sm text-foreground/80">{e.description}</p>}
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-display font-bold">Shipment Details</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Service"><span className="flex items-center gap-1"><Ship className="h-4 w-4 text-accent" />{shipment.service_type}</span></Row>
              <Row label="Sender">{shipment.sender_name}</Row>
              <Row label="Recipient">{shipment.recipient_name}</Row>
              {shipment.weight_kg != null && <Row label="Weight">{shipment.weight_kg} kg</Row>}
              {shipment.package_type && <Row label="Package"><span className="flex items-center gap-1"><Package className="h-4 w-4 text-accent" />{shipment.package_type}</span></Row>}
              {shipment.estimated_delivery && <Row label="ETA"><span className="flex items-center gap-1"><Clock className="h-4 w-4 text-accent" />{new Date(shipment.estimated_delivery).toLocaleDateString()}</span></Row>}
            </dl>
          </div>
          {photoUrl && (
            <div className="rounded-xl border bg-card p-5">
              <h3 className="font-display font-bold">Consignment Photo</h3>
              <div className="mt-4 overflow-hidden rounded-lg">
                <img src={photoUrl} alt="Consignment" className="w-full h-auto object-cover" />
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-display font-bold">Live Location</h3>
            <div className="mt-4 overflow-hidden rounded-lg h-64 bg-muted">
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0} 
                src={`https://maps.google.com/maps?q=${encodeURIComponent(currentLocation || "")}&t=&z=10&ie=UTF8&iwloc=&output=embed`}
              />
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-right">{children}</dd>
    </div>
  );
}
