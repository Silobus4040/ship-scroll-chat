import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Ship } from "lucide-react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/track", label: "Track" },
  { to: "/about", label: "About" },
  { to: "/quote", label: "Get a Quote" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 transition-all ${scrolled ? "bg-navy/95 backdrop-blur shadow-lg" : "bg-navy"}`}>
      <div className="container-wide flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-navy-foreground">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-gradient-gold shadow-gold">
            <Ship className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight">ZIPCO</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gold">International</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded px-3 py-2 text-sm font-medium text-navy-foreground/85 transition hover:text-gold"
              activeProps={{ className: "text-gold" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <button onClick={() => setOpen(!open)} className="lg:hidden text-navy-foreground p-2" aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/10 bg-navy">
          <nav className="container-wide flex flex-col py-3">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-3 text-sm font-medium text-navy-foreground/85 hover:text-gold" activeProps={{ className: "text-gold" }} activeOptions={{ exact: n.to === "/" }}>
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
