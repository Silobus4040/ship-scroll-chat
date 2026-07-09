import { createFileRoute } from "@tanstack/react-router";
import { Ship, Plane, Truck, Warehouse, Check } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Ocean, Air, Land & Warehousing | Zipco International" },
      { name: "description", content: "Full-service freight from Zipco: ocean containers, air cargo, land transport and global warehousing." },
      { property: "og:title", content: "Zipco Services" },
      { property: "og:description", content: "Ocean, air, land and warehousing freight services." },
    ],
  }),
  component: ServicesPage,
});

const services = [
  { icon: Ship, title: "Ocean Freight", desc: "Full-container (FCL) and less-than-container (LCL) ocean shipping across 220+ ports with weekly sailings.", features: ["FCL & LCL", "Reefer & special equipment", "Port-to-port or door-to-door", "Customs brokerage"] },
  { icon: Plane, title: "Air Cargo", desc: "Express and standard air freight through 180 airport hubs. Perfect for time-critical shipments.", features: ["24-72hr express", "Consolidated air freight", "Charter services", "Dangerous goods certified"] },
  { icon: Truck, title: "Land Transport", desc: "Cross-border trucking, intermodal rail and last-mile delivery across every major trade corridor.", features: ["FTL & LTL", "Rail intermodal", "Cross-border customs", "Last-mile delivery"] },
  { icon: Warehouse, title: "Warehousing & 3PL", desc: "Bonded and non-bonded storage, pick-and-pack, inventory management in 45 hubs worldwide.", features: ["Bonded warehouses", "Pick & pack", "Real-time inventory", "Distribution & fulfillment"] },
];

function ServicesPage() {
  return (
    <>
      <section className="bg-navy py-20 text-navy-foreground">
        <div className="container-wide">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Our Services</p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-6xl">Every mode. Every route.</h1>
          <p className="mt-4 max-w-2xl text-navy-foreground/80">One partner for ocean, air, land and warehousing — with the network and technology to move your cargo anywhere.</p>
        </div>
      </section>

      <section className="container-wide py-20">
        <div className="grid gap-8 md:grid-cols-2">
          {services.map((s) => (
            <div key={s.title} className="rounded-2xl border bg-card p-8 shadow-sm">
              <span className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-gold shadow-gold">
                <s.icon className="h-7 w-7" />
              </span>
              <h2 className="mt-6 font-display text-2xl font-bold">{s.title}</h2>
              <p className="mt-2 text-muted-foreground">{s.desc}</p>
              <ul className="mt-6 space-y-2">
                {s.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-accent" />{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
