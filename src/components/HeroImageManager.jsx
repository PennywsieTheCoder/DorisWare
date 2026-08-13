import { useEffect, useState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function HeroImageManager() {
  const [imageUrls, setImageUrls] = useState([]);
  const [primaryImage, setPrimaryImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      const { data, error: loadError } = await supabase.from("homepage_hero_settings").select("image_urls").eq("id", true).maybeSingle();
      if (loadError) setError("Hero settings could not load. Run migration 033, then refresh.");
      else setImageUrls(data?.image_urls ?? []);
      setLoading(false);
    }
    loadSettings();
  }, []);

  async function uploadImages(files) {
    const urls = [];
    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `hero/${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("promo-banners").upload(path, file, { contentType: file.type });
      if (uploadError) return { error: uploadError };
      urls.push(supabase.storage.from("promo-banners").getPublicUrl(path).data.publicUrl);
    }
    return { data: urls };
  }

  async function saveHeroImages(event) {
    event.preventDefault();
    const files = [primaryImage, ...galleryImages].filter(Boolean);
    if (!files.length) { setError("Choose a primary image before saving a replacement gallery."); return; }

    setSaving(true); setError("");
    const upload = await uploadImages(files);
    if (upload.error) setError("Hero image upload failed. Please try again.");
    else {
      const { error: saveError } = await supabase.from("homepage_hero_settings").update({ image_urls: upload.data }).eq("id", true);
      if (saveError) setError("Hero images could not be saved.");
      else { setImageUrls(upload.data); setPrimaryImage(null); setGalleryImages([]); }
    }
    setSaving(false);
  }

  return <section className="mt-6 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-green-700 dark:text-green-400">Homepage content</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">Hero banner</h2><p className="mt-1 text-sm text-stone-500 dark:text-stone-400">The first image is shown first; the homepage automatically rotates through the rest.</p></div>{loading ? <div className="mt-5 flex items-center gap-2 text-sm text-stone-500"><LoaderCircle className="animate-spin" size={16} /> Loading hero images…</div> : <><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{imageUrls.map((url, index) => <div key={url} className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800"><img src={url} alt={`Hero slide ${index + 1}`} className="h-full w-full object-cover" /><span className="absolute left-2 top-2 rounded-full bg-stone-950/75 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">{index === 0 ? "Primary" : `Slide ${index + 1}`}</span></div>)}</div><form onSubmit={saveHeroImages} className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-stone-700 dark:text-stone-300">Replace primary image<input type="file" accept="image/*" onChange={(event) => setPrimaryImage(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm" /></label><label className="text-sm font-medium text-stone-700 dark:text-stone-300">Additional carousel images<input type="file" accept="image/*" multiple onChange={(event) => setGalleryImages(Array.from(event.target.files ?? []))} className="mt-1.5 block w-full text-sm" /><span className="mt-1 block text-xs font-normal text-stone-500">Selecting files replaces the whole gallery.</span></label>{error && <p role="alert" className="sm:col-span-2 text-sm text-red-600 dark:text-red-400">{error}</p>}<button type="submit" disabled={saving} className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-wait disabled:opacity-60">{saving ? <LoaderCircle className="animate-spin" size={16} /> : <Save size={16} />}{saving ? "Saving hero images…" : "Save hero gallery"}</button></form></>}</section>;
}
