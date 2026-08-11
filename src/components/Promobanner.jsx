import { useState, useEffect } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { usePromoBanner } from "../hooks/usePromoBanner";

export default function PromoBanner() {
  const banner = usePromoBanner();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!banner?.ends_at) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [banner?.ends_at]);

  const remaining = banner?.ends_at ? Math.max(0, new Date(banner.ends_at).getTime() - now) : null;
  const timeLeft = remaining === null ? null : {
    hours: Math.floor(remaining / 3600000),
    minutes: Math.floor((remaining % 3600000) / 60000),
    seconds: Math.floor((remaining % 60000) / 1000),
  };

  const formatNum = (num) => String(num).padStart(2, "0");

  if (!banner || remaining === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-amber-100/50 to-stone-100 px-6 py-12 shadow-sm sm:px-8 sm:py-16 md:px-16 md:py-20 dark:from-amber-950/40 dark:via-stone-900 dark:to-stone-850 dark:border dark:border-stone-800">
        {banner.image_url && <img src={banner.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-15" />}
        {/* Glow bubbles */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-1 grid gap-8 md:grid-cols-[1.1fr_.9fr] md:items-center">
          <div className="max-w-xl text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              {banner.eyebrow}
            </span>

            <h2 className="mt-4 font-serif text-3xl font-extrabold leading-tight text-stone-850 dark:text-stone-100 sm:text-4xl md:text-5xl">
              {banner.title}
              <span className="block text-amber-600 dark:text-amber-500 mt-1">
                {banner.highlight}
              </span>
            </h2>

            <p className="mt-5 text-sm leading-relaxed text-stone-600 dark:text-stone-300 sm:text-base">
              {banner.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to={banner.cta_path}
                className="inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-6 py-3.5 font-semibold text-white shadow-md transition hover:bg-stone-900 active:scale-95 dark:bg-amber-500 dark:text-stone-950 dark:hover:bg-amber-400"
              >
                {banner.cta_label}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-6 shadow-md border border-stone-100 dark:bg-stone-900 dark:border-stone-800">
            <Clock className="text-amber-500 animate-pulse" size={28} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {timeLeft ? "Offer Ends In" : "Current offer"}
            </h3>

            {timeLeft && <div className="mt-5 flex gap-3 text-stone-950 dark:text-white">
              <div className="flex flex-col items-center">
                <span className="font-mono text-3xl font-bold sm:text-4xl">
                  {formatNum(timeLeft.hours)}
                </span>
                <span className="text-[10px] uppercase font-bold text-stone-400 mt-1">Hours</span>
              </div>
              <span className="text-2xl font-bold text-stone-300 dark:text-stone-700 mt-1">:</span>
              <div className="flex flex-col items-center">
                <span className="font-mono text-3xl font-bold sm:text-4xl">
                  {formatNum(timeLeft.minutes)}
                </span>
                <span className="text-[10px] uppercase font-bold text-stone-400 mt-1">Mins</span>
              </div>
              <span className="text-2xl font-bold text-stone-300 dark:text-stone-700 mt-1">:</span>
              <div className="flex flex-col items-center">
                <span className="font-mono text-3xl font-bold sm:text-4xl text-amber-600 dark:text-amber-500">
                  {formatNum(timeLeft.seconds)}
                </span>
                <span className="text-[10px] uppercase font-bold text-stone-400 mt-1">Secs</span>
              </div>
            </div>}

            <div className="mt-6 w-full rounded-2xl bg-amber-50 p-3.5 text-center text-xs font-semibold text-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
              {Number(banner.discount_percent) > 0 ? `${banner.discount_percent}% off is already applied to eligible product prices.` : "Shop this hand-picked collection while the offer is live."}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
