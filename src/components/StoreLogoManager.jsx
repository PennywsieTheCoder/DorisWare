import { useEffect, useState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function StoreLogoManager() {
  const [logoUrl, setLogoUrl] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLogo() {
      const { data, error: loadError } = await supabase.from("store_contact_settings").select("logo_url").eq("id", true).maybeSingle();
      if (loadError) setError("Logo settings could not load. Run migration 034, then refresh.");
      else setLogoUrl(data?.logo_url ?? "/logo.png");
      setLoading(false);
    }
    loadLogo();
  }, []);

  async function saveLogo(event) {
    event.preventDefault();
    if (!file) { setError("Choose a logo image first."); return; }
    setSaving(true); setError("");
    const extension = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `branding/logo-${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("promo-banners").upload(path, file, { contentType: file.type });
    if (uploadError) setError("Logo upload failed. Please try again.");
    else {
      const nextLogoUrl = supabase.storage.from("promo-banners").getPublicUrl(path).data.publicUrl;
      const { error: saveError } = await supabase.from("store_contact_settings").update({ logo_url: nextLogoUrl }).eq("id", true);
      if (saveError) setError("Logo could not be saved.");
      else { setLogoUrl(nextLogoUrl); setFile(null); }
    }
    setSaving(false);
  }

  return <section className="mt-6 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-sky-700 dark:text-sky-400">Storefront identity</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">Site logo</h2><p className="mt-1 text-sm text-stone-500 dark:text-stone-400">This logo appears in the public header and footer. A square PNG with a transparent background works best.</p></div>{loading ? <div className="mt-5 flex items-center gap-2 text-sm text-stone-500"><LoaderCircle size={16} className="animate-spin" /> Loading logo…</div> : <form onSubmit={saveLogo} className="mt-5 grid items-end gap-4 sm:grid-cols-[96px_1fr_auto]"><div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800"><img src={logoUrl.startsWith("http") ? logoUrl : `${import.meta.env.BASE_URL}${logoUrl.replace(/^\//, "")}`} alt="Current store logo" className="h-full w-full object-contain" /></div><label className="text-sm font-medium text-stone-700 dark:text-stone-300">New logo<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm" /><span className="mt-1 block text-xs font-normal text-stone-500">PNG, JPEG, WebP, or SVG.</span></label><button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-wait disabled:opacity-60">{saving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}{saving ? "Saving…" : "Save logo"}</button>{error && <p role="alert" className="sm:col-span-3 text-sm text-red-600 dark:text-red-400">{error}</p>}</form>}</section>;
}
