import { useState, useEffect } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function PromoBanner() {
  // Simple countdown timer logic
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset to 12 hours for continuous premium demo effect
          return { hours: 12, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNum = (num) => String(num).padStart(2, "0");

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-amber-100/50 to-stone-100 px-6 py-12 shadow-sm sm:px-8 sm:py-16 md:px-16 md:py-20 dark:from-amber-950/40 dark:via-stone-900 dark:to-stone-850 dark:border dark:border-stone-800">
        {/* Glow bubbles */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-1 grid gap-8 md:grid-cols-[1.1fr_.9fr] md:items-center">
          <div className="max-w-xl text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Limited Time Special Offer
            </span>

            <h2 className="mt-4 font-serif text-3xl font-extrabold leading-tight text-stone-850 dark:text-stone-100 sm:text-4xl md:text-5xl">
              Summer Sale
              <span className="block text-amber-600 dark:text-amber-500 mt-1">
                Up to 30% Off Premium Ware
              </span>
            </h2>

            <p className="mt-5 text-sm leading-relaxed text-stone-600 dark:text-stone-300 sm:text-base">
              Refresh your kitchen with heirloom-quality cast iron skillets, weighted stoneware, and carbon steel knives at our best prices of the season. Free shipping on all orders over ₵50.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-6 py-3.5 font-semibold text-white shadow-md transition hover:bg-stone-900 active:scale-95 dark:bg-amber-500 dark:text-stone-950 dark:hover:bg-amber-400"
              >
                Shop the Sale
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Interactive Countdown Card */}
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-6 shadow-md border border-stone-100 dark:bg-stone-900 dark:border-stone-800">
            <Clock className="text-amber-500 animate-pulse" size={28} />
            <h3 className="mt-3 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Offer Ends In
            </h3>

            {/* Timer boxes */}
            <div className="mt-5 flex gap-3 text-stone-950 dark:text-white">
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
            </div>

            <div className="mt-6 w-full rounded-2xl bg-amber-50 p-3.5 text-center text-xs font-semibold text-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
              Discounts automatically applied at checkout.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
