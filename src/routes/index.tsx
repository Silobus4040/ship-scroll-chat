import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Ship, Plane, Truck, Warehouse, Search, Globe2, Shield, Clock, ArrowRight } from "lucide-react";
import heroShip from "@/assets/hero-ship.jpg";
import oceanBg from "@/assets/ocean-bg.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zipco International — Global Freight & Delivery Services" },
      { name: "description", content: "Ocean, air and land freight solutions from Zipco International. Real-time tracking, dedicated support, worldwide reach." },
      { property: "og:title", content: "Zipco International — Global Freight & Delivery Services" },
      { property: "og:description", content: "Ocean, air and land freight solutions from Zipco International. Real-time tracking, dedicated support, worldwide reach." },
      { property: "og:image", content: heroShip },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const shipX = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const shipY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const shipScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const waterY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const overlay = useTransform(scrollYProgress, [0, 1], [0.35, 0.85]);

  const [track, setTrack] = useState("");
  const navigate = useNavigate();

  return (
    <>
      {/* HERO with parallax ship */}
      <section ref={heroRef} className="relative h-[92vh] min-h-[600px] overflow-hidden bg-navy">
        {/* Water backdrop layer */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center will-change-transform"
          style={{ backgroundImage: `url(${oceanBg})`, y: waterY as unknown as string }}
          aria-hidden
        />
        {/* Ship layer */}
        <motion.img
          src={heroShip}
          alt="Cargo ship at sea"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          style={{ x: shipX, y: shipY, scale: shipScale }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(10,25,48,0.25) 0%, rgba(10,25,48,0.85) 100%)" }}
          aria-hidden
        />
        {/* Subtle animated wave line at bottom */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy to-transparent"
          aria-hidden
        />

        <div className="relative z-10 container-wide flex h-full flex-col justify-center text-navy-foreground">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
            Global Freight · Delivered
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-6xl md:text-7xl">
            The world's cargo, <span className="text-gold">moved with precision.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-navy-foreground/85">
            Ocean, air and land freight solutions trusted by thousands of shippers across six continents.
          </p>

          {/* Tracking bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); if (track.trim()) navigate({ to: "/track/$number", params: { number: track.trim() } }); }}
            className="mt-10 flex max-w-xl flex-col gap-3 rounded-xl bg-white/10 p-3 backdrop-blur sm:flex-row"
          >
            <div className="flex flex-1 items-center gap-3 rounded-lg bg-white px-4 py-3 text-foreground">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                placeholder="Enter tracking number (e.g. ZIP-000)"
                className="flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button className="rounded-lg bg-gradient-gold px-6 py-3 text-sm font-semibold shadow-gold transition hover:opacity-90">
              Track Shipment
            </button>
          </form>
        </div>
      </section>

      {/* Services */}
      <section className="container-wide py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">What We Do</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Freight solutions, end to end</h2>
          <p className="mt-4 text-muted-foreground">From a single pallet to fleets of containers — we operate the global logistics network your cargo needs.</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Ship, title: "Ocean Freight", desc: "FCL & LCL container shipping via 220+ global ports with weekly departures." },
            { icon: Plane, title: "Air Cargo", desc: "Express and standard air freight with door-to-door delivery in 24-72 hours." },
            { icon: Truck, title: "Land Transport", desc: "Cross-border trucking, rail and last-mile delivery across major corridors." },
            { icon: Warehouse, title: "Warehousing", desc: "Bonded storage, distribution and inventory management in 45 hubs worldwide." },
          ].map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group rounded-xl border bg-card p-6 shadow-sm transition hover:shadow-elegant hover:-translate-y-1"
            >
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-gold shadow-gold">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-navy py-20 text-navy-foreground">
        <div className="container-wide grid gap-8 text-center md:grid-cols-4">
          {[
            { n: "220+", l: "Global Ports" },
            { n: "6", l: "Continents" },
            { n: "45", l: "Warehouses" },
            { n: "20yr+", l: "Experience" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-5xl font-bold text-gold">{s.n}</div>
              <div className="mt-2 text-sm uppercase tracking-widest text-navy-foreground/70">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="container-wide py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Why Zipco</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Two decades. One promise.</h2>
            <p className="mt-4 text-muted-foreground">We combine a global operations network with hands-on customer service. Every shipment is tracked, every client has a dedicated coordinator, and every arrival is guaranteed.</p>
            <div className="mt-8 space-y-5">
              {[
                { icon: Globe2, t: "Truly global reach", d: "Direct offices in 32 countries and partner network in 100+ more." },
                { icon: Shield, t: "Cargo insurance included", d: "All-risk coverage available on every mode of transport." },
                { icon: Clock, t: "24/7 live support", d: "Chat with a real coordinator around the clock, in your timezone." },
              ].map((f) => (
                <div key={f.t} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent"><f.icon className="h-5 w-5" /></span>
                  <div>
                    <h4 className="font-semibold">{f.t}</h4>
                    <p className="text-sm text-muted-foreground">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/quote" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:opacity-90">
              Request a Quote <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-2xl shadow-elegant">
            <img src={heroShip} alt="Container ship" width={1920} height={1088} loading="lazy" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-navy py-20 text-navy-foreground">
        <div className="container-wide text-center">
          <h2 className="font-display text-3xl font-bold sm:text-5xl">Ready to ship?</h2>
          <p className="mx-auto mt-4 max-w-xl text-navy-foreground/80">Tell us where it needs to go. We'll handle the rest.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/quote" className="rounded-lg bg-gradient-gold px-8 py-3 font-semibold shadow-gold">Get a Quote</Link>
            <Link to="/contact" className="rounded-lg border border-gold/40 px-8 py-3 font-semibold text-gold hover:bg-gold/10">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
