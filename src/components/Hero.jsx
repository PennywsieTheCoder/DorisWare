import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck, Sparkles, Truck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-[430px] w-full overflow-hidden sm:h-[470px] lg:h-[500px]">
      {/* Background Image with Ambient Pan-Zoom Animation */}
      <div className="absolute inset-0 select-none overflow-hidden">
        <img
          src="./images/herobanner.png"
          alt="DorisWare premium kitchenware"
          className="h-full w-full object-cover transition-all duration-[10s] scale-105 animate-[zoomPan_20s_infinite_alternate]"
        />
        {/* CSS Animation injection inline for the zoomPan effect */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes zoomPan {
            0% { transform: scale(1.02) translate(0px, 0px); }
            50% { transform: scale(1.07) translate(-10px, -5px); }
            100% { transform: scale(1.02) translate(0px, 0px); }
          }
        `}} />
      </div>

      {/* Dark Overlay with Ambient Radial Gradient for premium contrast */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-900/60 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_100%)]" />

      {/* Hero Content Wrapper */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-left">
          {/* Tag badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 border border-amber-400/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300 backdrop-blur-md">
            <Sparkles size={13} className="text-amber-400" />
            <span>Premium 2026 Collection</span>
          </div>

          <h1 className="mt-4 font-serif text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl">
            Crafted for
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-300 bg-clip-text text-transparent">
              Exquisite Cooking.
            </span>
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-stone-200 sm:text-base md:text-lg">
            Elevate your culinary craft with premium pre-seasoned cast iron, 
            hand-carved olive utensils, and state-of-the-art kitchenware designed for generations.
          </p>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/shop"
              className="w-full rounded-xl bg-amber-500 px-6 py-3 text-center text-sm font-bold text-stone-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 hover:shadow-amber-500/30 active:scale-98 sm:w-auto"
            >
              Shop Collection
            </Link>
            <Link
              to="/about"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-98 sm:w-auto"
            >
              Our Story
              <ChevronRight size={16} />
            </Link>
          </div>

          {/* Trust points */}
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-xs text-stone-300">
            <div className="flex items-center gap-2">
              <Truck size={15} className="text-amber-400" />
              <span>Free Delivery in Accra over ₵50</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-400" />
              <span>Lifetime Durability Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Curved Wave Bottom Divider */}
      <div className="absolute -bottom-1 left-0 w-full overflow-hidden leading-none z-10">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="block h-auto w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className="fill-stone-50 dark:fill-stone-950 transition-colors duration-200"
            d="M0,64L80,69.3C160,75,320,85,480,85.3C640,85,800,75,960,69.3C1120,64,1280,64,1360,64L1440,64L1440,130L1360,130C1280,130,1120,130,960,130C800,130,640,130,480,130C320,130,160,130,80,130L0,130Z"
          />
        </svg>
      </div>
    </section>
  );
}
