import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Your Shipment — Zipco International" },
      { name: "description", content: "Real-time shipment tracking. Enter your Zipco tracking number to see your cargo's live status." },
      { property: "og:title", content: "Track Your Zipco Shipment" },
      { property: "og:description", content: "Real-time global cargo tracking." },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const [n, setN] = useState("");
  const nav = useNavigate();
  return (
    <section className="bg-navy min-h-[70vh] text-navy-foreground">
      <div className="container-wide py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Track</p>
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-6xl">Where is my cargo?</h1>
        <p className="mt-4 max-w-xl text-navy-foreground/80">Enter your Zipco tracking number to see live location, milestones and estimated delivery.</p>
        <form onSubmit={(e) => { e.preventDefault(); if (n.trim()) nav({ to: "/track/$number", params: { number: n.trim() } }); }} className="mt-8 flex max-w-xl flex-col gap-3 rounded-xl bg-white/10 p-3 backdrop-blur sm:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-lg bg-white px-4 py-3 text-foreground">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input value={n} onChange={(e) => setN(e.target.value)} placeholder="Tracking number (e.g. ZIP-DEMO-001)" className="flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <button className="rounded-lg bg-gradient-gold px-6 py-3 text-sm font-semibold shadow-gold">Track</button>
        </form>
      </div>
    </section>
  );
}
