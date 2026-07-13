import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  id: string;
  contact_address: string;
  contact_phone: string;
  contact_email: string;
  headquarters_label: string;
};

const defaults: SiteSettings = {
  id: "",
  contact_address: "1200 Harbor Drive, Long Beach, CA 90802",
  contact_phone: "+1 (555) 947-2600",
  contact_email: "ops@zipco-intl.com",
  headquarters_label: "Long Beach, California",
};

const Ctx = createContext<SiteSettings>(defaults);

export function useSiteSettings() {
  return useContext(Ctx);
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaults);

  useEffect(() => {
    supabase
      .from("site_settings" as any)
      .select("*")
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setSettings(data as unknown as SiteSettings);
      });
  }, []);

  return <Ctx.Provider value={settings}>{children}</Ctx.Provider>;
}
