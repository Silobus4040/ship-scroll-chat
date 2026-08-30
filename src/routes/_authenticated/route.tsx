import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const timeout = window.setTimeout(() => {
      if (!active) return;
      navigate({ to: "/auth", replace: true });
    }, 2500);

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        window.clearTimeout(timeout);

        if (!data.session) {
          navigate({ to: "/auth", replace: true });
          return;
        }

        setReady(true);
      })
      .catch(() => {
        if (!active) return;
        window.clearTimeout(timeout);
        navigate({ to: "/auth", replace: true });
      });

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [navigate]);

  if (!ready) {
    return (
      <div className="container-wide py-20 text-center text-muted-foreground">
        Loading admin...
      </div>
    );
  }

  return <Outlet />;
}
