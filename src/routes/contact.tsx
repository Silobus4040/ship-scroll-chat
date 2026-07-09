import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Zipco International — 24/7 Global Support" },
      { name: "description", content: "Get in touch with Zipco International. Global offices, 24/7 customer support and dedicated shipment coordinators." },
      { property: "og:title", content: "Contact Zipco International" },
      { property: "og:description", content: "24/7 global freight support." },
    ],
  }),
  component: ContactPage,
});

const offices = [
  { city: "Long Beach, USA", addr: "1200 Harbor Drive, Long Beach, CA 90802", phone: "+1 (555) 947-2600" },
  { city: "Singapore", addr: "10 Marina Boulevard, Singapore 018983", phone: "+65 6222 4800" },
  { city: "Rotterdam, NL", addr: "Wilhelminakade 909, 3072 AP Rotterdam", phone: "+31 10 288 4000" },
  { city: "Shanghai, CN", addr: "88 Century Ave, Pudong, Shanghai 200120", phone: "+86 21 6841 9000" },
];

function ContactPage() {
  return (
    <>
      <section className="bg-navy py-20 text-navy-foreground">
        <div className="container-wide">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Contact</p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-6xl">Get in touch.</h1>
          <p className="mt-4 max-w-2xl text-navy-foreground/80">Reach out any time — our coordinators answer 24 hours a day, every day of the year.</p>
        </div>
      </section>

      <section className="container-wide py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Phone, label: "Call us", value: "+1 (555) 947-2600" },
            { icon: Mail, label: "Email", value: "ops@zipco-intl.com" },
            { icon: MapPin, label: "Headquarters", value: "Long Beach, California" },
            { icon: Clock, label: "Hours", value: "24 / 7 / 365" },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border bg-card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-accent/15 text-accent"><c.icon className="h-5 w-5" /></span>
              <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">{c.label}</p>
              <p className="mt-1 font-semibold">{c.value}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-16 font-display text-3xl font-bold">Global offices</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {offices.map((o) => (
            <div key={o.city} className="rounded-xl border bg-card p-6">
              <h3 className="font-display text-lg font-bold">{o.city}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{o.addr}</p>
              <p className="mt-2 text-sm font-medium text-accent">{o.phone}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
