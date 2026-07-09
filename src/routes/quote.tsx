import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: "Request a Freight Quote — Zipco International" },
      { name: "description", content: "Get a free freight quote from Zipco. Ocean, air, land — tell us where and we'll price it." },
      { property: "og:title", content: "Get a Freight Quote" },
      { property: "og:description", content: "Free freight quote — ocean, air and land." },
    ],
  }),
  component: QuotePage,
});

const schema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional(),
  company: z.string().trim().max(100).optional(),
  origin: z.string().trim().min(2).max(120),
  destination: z.string().trim().min(2).max(120),
  service_type: z.string().min(1),
  weight_kg: z.number().nonnegative().optional(),
  details: z.string().trim().max(2000).optional(),
});

function QuotePage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = {
      full_name: String(fd.get("full_name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || "") || undefined,
      company: String(fd.get("company") || "") || undefined,
      origin: String(fd.get("origin") || ""),
      destination: String(fd.get("destination") || ""),
      service_type: String(fd.get("service_type") || ""),
      weight_kg: fd.get("weight_kg") ? Number(fd.get("weight_kg")) : undefined,
      details: String(fd.get("details") || "") || undefined,
    };
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("quote_requests").insert(parsed.data);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
    toast.success("Quote request sent — we'll reply within a business day.");
  }

  return (
    <>
      <section className="bg-navy py-20 text-navy-foreground">
        <div className="container-wide">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Get a Quote</p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-6xl">Tell us where it needs to go.</h1>
          <p className="mt-4 max-w-2xl text-navy-foreground/80">We'll reply within one business day with pricing and lead time.</p>
        </div>
      </section>

      <section className="container-wide py-16">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-6 shadow-elegant sm:p-10">
          {sent ? (
            <div className="text-center py-10">
              <h2 className="font-display text-3xl font-bold">Thank you.</h2>
              <p className="mt-3 text-muted-foreground">Your quote request is in our system. A coordinator will be in touch shortly.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
              <Field name="full_name" label="Full name" required />
              <Field name="email" label="Email" type="email" required />
              <Field name="phone" label="Phone" />
              <Field name="company" label="Company" />
              <Field name="origin" label="Origin (city/country)" required />
              <Field name="destination" label="Destination (city/country)" required />
              <div>
                <label className="block text-sm font-medium">Service type *</label>
                <select name="service_type" required className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="">Select…</option>
                  <option>Ocean Freight (FCL)</option>
                  <option>Ocean Freight (LCL)</option>
                  <option>Air Cargo</option>
                  <option>Land Transport</option>
                  <option>Warehousing / 3PL</option>
                </select>
              </div>
              <Field name="weight_kg" label="Weight (kg)" type="number" step="0.01" />
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">Additional details</label>
                <textarea name="details" rows={4} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Package dimensions, hazardous materials, timing…" />
              </div>
              <div className="sm:col-span-2">
                <button disabled={loading} className="w-full rounded-lg bg-gradient-gold px-6 py-3 font-semibold shadow-gold disabled:opacity-60">
                  {loading ? "Sending…" : "Request Quote"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

function Field({ name, label, type = "text", required = false, step }: { name: string; label: string; type?: string; required?: boolean; step?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}{required && " *"}</label>
      <input name={name} type={type} step={step} required={required} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm" />
    </div>
  );
}
