import { Link } from "react-router-dom";
import {
  SiFacebook,
  SiInstagram,
  SiX,
  SiTiktok,
  SiPinterest,
  SiVisa,
  SiMastercard,
} from "@icons-pack/react-simple-icons";
import { useEffect, useState } from "react";
import { supabase, withRequestTimeout } from "../lib/supabase";
import { useStoreLogo } from "../hooks/useStoreLogo";

const socialPlatforms = {
  facebook: { label: "Facebook", icon: SiFacebook }, instagram: { label: "Instagram", icon: SiInstagram }, x: { label: "X", icon: SiX }, tiktok: { label: "TikTok", icon: SiTiktok }, pinterest: { label: "Pinterest", icon: SiPinterest },
};

function PaymentBadge({ children }) {
  return <div className="flex h-8 w-11 items-center justify-center rounded-md bg-white px-1.5">{children}</div>;
}

function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim()) return;
    setSaving(true);
    setError("");
    if (!navigator.onLine) { setError("You’re offline. Reconnect and try again."); setSaving(false); return; }
    const { error: subscribeError } = await withRequestTimeout(supabase
      .from("newsletter_subscribers")
      .insert({ email: email.trim().toLowerCase() }));
    if (subscribeError) {
      setError(subscribeError.code === "23505" ? "This email is already on the list." : "We could not save your email. Please try again.");
    } else {
      setSubmitted(true);
    }
    setSaving(false);
  }

  return <div className="max-w-sm"><p className="text-sm font-semibold text-white">A little note from the kitchen</p><p className="mt-2 text-sm leading-6 text-stone-400">New arrivals, practical finds, and occasional offers.</p>{submitted ? <p className="mt-4 text-sm font-medium text-emerald-400">Thanks — you&apos;re on the list.</p> : <><form onSubmit={handleSubmit} className="mt-4 flex gap-2"><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="min-w-0 flex-1 rounded-xl border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 placeholder:text-stone-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30" aria-label="Email address" /><button type="submit" disabled={saving} className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:opacity-60">{saving ? "Joining…" : "Join"}</button></form>{error && <p className="mt-3 text-sm text-rose-400">{error}</p>}</>}</div>;
}

export default function Footer({ storeName }) {
  const [socialLinks, setSocialLinks] = useState([]);
  const logoUrl = useStoreLogo();
  useEffect(() => {
    const loadSocialLinks = () => supabase.from("store_social_links").select("platform, url").eq("is_active", true).order("sort_order").then(({ data }) => setSocialLinks((data ?? []).map((link) => ({ ...socialPlatforms[link.platform], href: link.url })).filter((link) => link.label)));
    loadSocialLinks();
    const channel = supabase.channel("store-social-links").on("postgres_changes", { event: "*", schema: "public", table: "store_social_links" }, loadSocialLinks).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);
  return <footer id="contact" className="bg-stone-950 px-4 pt-12 text-stone-200 sm:px-6 sm:pt-14"><div className="mx-auto max-w-6xl"><div className="grid gap-10 md:grid-cols-[1.05fr_.8fr_1.1fr] md:gap-12"><div><Link to="/" className="inline-flex items-center gap-2.5" aria-label={`${storeName} home`}><img src={logoUrl} alt="" className="h-9 w-9 object-contain" /><span className="font-serif text-xl font-semibold tracking-tight text-white">{storeName}</span></Link><p className="mt-4 max-w-xs text-sm leading-6 text-stone-400">Kitchenware chosen for the tools that earn a permanent place at home.</p><div className="mt-5 flex flex-wrap gap-2">{socialLinks.map(({ label, href, icon: Icon }) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-800 text-stone-400 transition hover:border-amber-500 hover:bg-amber-500 hover:text-stone-950"><Icon size={15} /></a>)}</div></div><div><p className="text-sm font-semibold text-white">Help & policies</p><nav className="mt-4 flex flex-col items-start gap-2.5 text-sm"><Link to="/about" className="text-stone-400 transition hover:text-amber-400">About DorisWare</Link><Link to="/contact" className="text-stone-400 transition hover:text-amber-400">Contact</Link><Link to="/delivery" className="text-stone-400 transition hover:text-amber-400">Delivery information</Link><Link to="/returns" className="text-stone-400 transition hover:text-amber-400">Returns & refunds</Link></nav></div><FooterNewsletter /></div><div className="mt-12 flex flex-col gap-5 border-t border-stone-800 py-5 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap items-center gap-3"><span>Secure payments via Paystack</span><div className="flex items-center gap-2"><PaymentBadge><SiVisa size={22} className="text-blue-600" /></PaymentBadge><PaymentBadge><SiMastercard size={22} className="text-stone-900" /></PaymentBadge><PaymentBadge><img src={`${import.meta.env.BASE_URL}mobile-money.png`} alt="Mobile Money" className="max-h-5 max-w-full object-contain" /></PaymentBadge></div></div><div className="flex flex-wrap items-center gap-x-4 gap-y-2"><Link to="/privacy" className="transition hover:text-amber-400">Privacy</Link><Link to="/terms" className="transition hover:text-amber-400">Terms</Link><span>© {new Date().getFullYear()} {storeName}</span></div></div></div></footer>;
}
