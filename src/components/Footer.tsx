import { Link } from "@tanstack/react-router";
import { Ship, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="container-wide grid gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-gradient-gold">
              <Ship className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold">ZIPCO International</span>
          </div>
          <p className="mt-4 text-sm text-navy-foreground/70">
            Moving the world's cargo across oceans, skies and continents since 2004.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold text-gold">Services</h4>
          <ul className="mt-4 space-y-2 text-sm text-navy-foreground/75">
            <li>Ocean Freight</li>
            <li>Air Cargo</li>
            <li>Land Transport</li>
            <li>Warehousing</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold text-gold">Company</h4>
          <ul className="mt-4 space-y-2 text-sm text-navy-foreground/75">
            <li><Link to="/about" className="hover:text-gold">About Us</Link></li>
            <li><Link to="/track" className="hover:text-gold">Track Shipment</Link></li>
            <li><Link to="/quote" className="hover:text-gold">Request Quote</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold text-gold">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-navy-foreground/75">
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gold" />1200 Harbor Drive, Long Beach, CA 90802</li>
            <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 shrink-0 text-gold" />+1 (555) 947-2600</li>
            <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 shrink-0 text-gold" />ops@zipco-intl.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-wide flex flex-col justify-between gap-2 py-5 text-xs text-navy-foreground/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Zipco International Delivery Service. All rights reserved.</p>
          <p>Global logistics · Trusted worldwide</p>
        </div>
      </div>
    </footer>
  );
}
