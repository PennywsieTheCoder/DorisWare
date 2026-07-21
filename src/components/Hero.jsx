// src/components/Hero.jsx

import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-[650px] overflow-hidden">

      {/* Background Image */}
      <img
        src="./images/herobanner.png"
        alt="DorisWare premium kitchenware"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-transparent" />


      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-6">
        <div className="max-w-2xl text-white">

          <span className="text-sm font-medium uppercase tracking-[4px] text-amber-300">
            DorisWare Collection
          </span>


          <h1 className="mt-4 text-5xl font-bold leading-tight md:text-7xl">
            Cook Better.
            <br />
            Live Better.
          </h1>


          <p className="mt-6 text-lg text-gray-200 md:text-xl">
            Premium cookware, kitchen tools, and household essentials
            carefully selected for every home kitchen.
          </p>


          <div className="mt-8 flex flex-wrap gap-4">

            {/* Shop Page Button */}
            <Link
              to="/shop"
              className="rounded-lg bg-amber-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-amber-600"
            >
              Shop Collection
            </Link>


            {/* About Section Button */}
            <a
              href="#about"
              className="flex items-center gap-2 rounded-lg border border-white px-6 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-stone-900"
            >
              Our Story
              <ChevronRight size={18} />
            </a>

          </div>

        </div>
      </div>


      {/* Curved Divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">

        <svg
          viewBox="0 0 1440 120"
          className="block h-auto w-full"
          xmlns="http://www.w3.org/2000/svg"
        >

          <path
            fill="#ffffff"
            d="M0,64L80,69.3C160,75,320,85,480,85.3C640,85,800,75,960,69.3C1120,64,1280,64,1360,64L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          />

        </svg>

      </div>

    </section>
  );
}