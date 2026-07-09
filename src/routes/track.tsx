import { createFileRoute, useNavigate, Outlet, useLocation } from "@tanstack/react-router";
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
  const location = useLocation();
  const isExact = location.pathname === '/track' || location.pathname === '/track/';

  return (
    <>
      {isExact && (
        <section className="bg-navy min-h-[70vh] text-navy-foreground">
          <div className="container-wide py-24">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Track</p>
            <h1 className="mt-3 font-display text-4xl font-bold sm:text-6xl">Where is my cargo?</h1>
            <p className="mt-4 max-w-xl text-navy-foreground/80">Enter your Zipco tracking number to see live location, milestones and estimated delivery.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (n.trim()) nav({ to: "/track/$number", params: { number: n.trim() } });
              }}
              className="mt-8 flex max-w-xl flex-col gap-3 rounded-xl bg-white/10 p-3 backdrop-blur sm:flex-row"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-foreground/50" />
                <input
                  type="text"
                  placeholder="ZIP-000"
                  value={n}
                  onChange={(e) => setN(e.target.value)}
                  className="h-12 w-full rounded-lg bg-white/5 pl-12 pr-4 text-navy-foreground outline-none transition-colors focus:bg-white/10 placeholder:text-navy-foreground/30"
                />
              </div>
              <button type="submit" className="h-12 rounded-lg bg-gold px-8 font-semibold text-navy transition-colors hover:bg-gold-light">
                Track
              </button>
            </form>
          </div>
        </section>
      )}
      <Outlet />
    </>
  );
}
