// src/components/PromoBanner.jsx

import { ArrowRight } from "lucide-react";

export default function PromoBanner() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-100 via-amber-50 to-stone-100 px-8 py-14 md:px-16 md:py-20">

        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-200/50 blur-2xl" />

        <div className="pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-emerald-200/40 blur-2xl" />


        <div className="relative z-10 max-w-xl">

          <p className="font-mono text-xs uppercase tracking-[3px] text-amber-700">
            Limited time offer
          </p>


          <h2 className="mt-3 font-serif text-4xl font-bold leading-tight text-stone-800 md:text-5xl">
            Summer Sale
            <span className="block text-amber-600">
              Up to 30% Off
            </span>
          </h2>


          <p className="mt-4 text-base text-stone-600 md:text-lg">
            Refresh your kitchen with premium cookware and tools at
            our best prices of the season. Offer ends soon.
          </p>


          <a
            href="#shop"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-stone-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-stone-900"
          >
            Shop the Sale
            <ArrowRight size={18} />
          </a>

        </div>
      </div>
    </section>
  );
}