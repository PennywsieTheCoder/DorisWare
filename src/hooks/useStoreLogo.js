import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const fallbackLogo = "/logo.png";

function resolveLogo(url) {
  if (!url) return `${import.meta.env.BASE_URL}logo.png`;
  return url.startsWith("http") ? url : `${import.meta.env.BASE_URL}${url.replace(/^\//, "")}`;
}

export function useStoreLogo() {
  const [logoUrl, setLogoUrl] = useState(resolveLogo(fallbackLogo));

  useEffect(() => {
    let active = true;
    async function loadLogo() {
      const { data } = await supabase.from("store_contact_settings").select("logo_url").eq("id", true).maybeSingle();
      if (active) setLogoUrl(resolveLogo(data?.logo_url || fallbackLogo));
    }
    loadLogo();
    const channel = supabase.channel(`store-logo-${crypto.randomUUID()}`).on("postgres_changes", { event: "UPDATE", schema: "public", table: "store_contact_settings" }, loadLogo).subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, []);

  return logoUrl;
}
