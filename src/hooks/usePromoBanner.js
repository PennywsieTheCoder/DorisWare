import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function usePromoBanner() {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    let active = true;
    const loadBanner = async () => {
      const { data } = await supabase.from("promo_banners").select("id, eyebrow, title, highlight, description, cta_label, cta_path, image_url, ends_at, discount_percent").eq("is_active", true).order("sort_order").limit(1).maybeSingle();
      const hasEnded = data?.ends_at && new Date(data.ends_at).getTime() <= Date.now();
      if (active) setBanner(hasEnded ? null : data);
    };
    loadBanner();
    const channel = supabase.channel("homepage-promo").on("postgres_changes", { event: "*", schema: "public", table: "promo_banners" }, loadBanner).subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, []);

  return banner;
}
