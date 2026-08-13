import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const fallbackImages = ["/images/herobanner.png"];

export function useHeroImages() {
  const [images, setImages] = useState(fallbackImages);

  useEffect(() => {
    let active = true;
    async function loadHeroImages() {
      const { data } = await supabase.from("homepage_hero_settings").select("image_urls").eq("id", true).maybeSingle();
      if (active && data?.image_urls?.length) setImages(data.image_urls);
    }

    loadHeroImages();
    const channel = supabase.channel(`homepage-hero-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "homepage_hero_settings" }, loadHeroImages)
      .subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, []);

  return images;
}
