import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck, Truck } from "lucide-react";
import { useHeroImages } from "../hooks/useHeroImages";

export default function Hero() {
  const images = useHeroImages();
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (images.length < 2) return undefined;
    const timer = setInterval(() => setActiveImage((current) => (current + 1) % images.length), 6500);
    return () => clearInterval(timer);
  }, [images.length]);

  const imageUrls = images.map((image) => image.startsWith("http")
    ? image
    : `${import.meta.env.BASE_URL}${image.replace(/^\//, "")}`);
  const displayedImage = Math.min(activeImage, Math.max(imageUrls.length - 1, 0));

  return (
    <section className="relative h-[330px] w-full overflow-hidden sm:h-[350px] lg:h-[380px]">
      {/* Background Image with Ambient Pan-Zoom Animation */}
      <div className="absolute inset-0 select-none overflow-hidden">
        {imageUrls.map((url, index) => <img key={url} src={url} alt={index === displayedImage ? "DorisWare premium kitchenware" : ""} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 scale-105 animate-[zoomPan_20s_infinite_alternate] ${index === displayedImage ? "opacity-100" : "opacity-0"}`} />)}
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
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 pb-8 sm:px-6 sm:pb-0 lg:px-8">
        <div className="max-w-2xl text-left">
          <h1 className="font-serif text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl">
            Crafted for
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-300 bg-clip-text text-transparent">
              Exquisite Cooking.
            </span>
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-relaxed text-stone-200 sm:text-base md:text-lg">
            Elevate your culinary craft with premium pre-seasoned cast iron, 
            hand-carved olive utensils, and state-of-the-art kitchenware designed for generations.
          </p>

          {/* Action buttons */}
          <div className="mt-4 flex items-center gap-3">
            <Link
              to="/shop"
              className="flex-1 whitespace-nowrap rounded-xl bg-amber-500 px-4 py-2.5 text-center text-sm font-bold text-stone-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 hover:shadow-amber-500/30 active:scale-98 sm:flex-none sm:px-6"
            >
              Shop Collection
            </Link>
            <Link
              to="/about"
              className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-98 sm:flex-none sm:px-6"
            >
              Our Story
              <ChevronRight size={16} />
            </Link>
          </div>

          {/* Trust points */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-white/10 pt-3 text-xs text-stone-300">
            <div className="flex items-center gap-2">
              <Truck size={15} className="text-amber-400" />
              <span>Delivery across Ghana · options shown at checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-400" />
              <span>Lifetime Durability Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shallow curved transition into the page content */}
      <div className="pointer-events-none absolute -bottom-px left-0 z-10 w-full overflow-hidden leading-none" aria-hidden="true">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="block h-6 w-full" xmlns="http://www.w3.org/2000/svg">
          <path className="fill-stone-50 transition-colors duration-200 dark:fill-stone-950" d="M0,31 C320,44 650,42 900,25 C1110,11 1285,16 1440,27 L1440,48 L0,48 Z" />
        </svg>
      </div>

    </section>
  );
}
