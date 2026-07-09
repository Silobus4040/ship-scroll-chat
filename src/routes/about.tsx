import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Zipco International — Two decades in global logistics" },
      { name: "description", content: "Learn about Zipco International — our story, mission and the team moving cargo across the world since 2004." },
      { property: "og:title", content: "About Zipco International" },
      { property: "og:description", content: "Two decades moving cargo across the world." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="bg-navy py-20 text-navy-foreground">
        <div className="container-wide">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">About Zipco</p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-6xl">Built by shippers, <span className="text-gold">for shippers.</span></h1>
          <p className="mt-6 max-w-3xl text-lg text-navy-foreground/85">Since 2004, Zipco International has grown from a single port office in Long Beach to a truly global freight forwarder operating on six continents.</p>
        </div>
      </section>

      <section className="container-wide py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold">Our mission</h2>
            <p className="mt-4 text-muted-foreground">To move the world's cargo with clarity, speed and integrity. Every container we handle carries someone's livelihood — from Colombian coffee farmers to Japanese electronics manufacturers. We treat every shipment like it's our own.</p>

            <h2 className="mt-10 font-display text-3xl font-bold">Our approach</h2>
            <p className="mt-4 text-muted-foreground">Technology-forward, human-led. Our platform gives you real-time visibility, and every account has a dedicated coordinator who answers the phone. No call centers. No black boxes.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { n: "12,400+", l: "Shipments per year" },
              { n: "32", l: "Countries with offices" },
              { n: "98.6%", l: "On-time delivery" },
              { n: "24/7", l: "Live support" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border bg-card p-6 text-center">
                <div className="font-display text-4xl font-bold text-accent">{s.n}</div>
                <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary py-20">
        <div className="container-wide">
          <h2 className="font-display text-3xl font-bold text-center">Our journey</h2>
          <div className="mt-12 space-y-6">
            {[
              { y: "2004", t: "Founded in Long Beach, CA with a single ocean freight team." },
              { y: "2010", t: "Opened first international offices in Shanghai and Singapore." },
              { y: "2015", t: "Launched integrated air cargo network across Asia-Pacific." },
              { y: "2020", t: "Deployed our proprietary real-time tracking platform." },
              { y: "2024", t: "Reached 32 country offices and 45 warehouse hubs worldwide." },
            ].map((m) => (
              <div key={m.y} className="grid grid-cols-[80px_1fr] items-start gap-6 rounded-xl bg-card p-5">
                <div className="font-display text-2xl font-bold text-accent">{m.y}</div>
                <p className="text-sm text-foreground/80 pt-1">{m.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
