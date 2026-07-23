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
      <div className="relative z-1 mx-auto flex h-full max-w-6xl items-center px-6">
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
            <Link
              to="/#about"
              className="flex items-center gap-2 rounded-lg border border-white px-6 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-stone-900"
            >
              Our Story
              <ChevronRight size={18} />
            </Link>

          </div>

        </div>
      </div>

{/* Curved Divider */}
<div className="absolute -bottom-1 left-0 w-full overflow-hidden leading-none">
  <svg
    viewBox="0 0 1440 120"
    preserveAspectRatio="none"
    className="block h-auto w-full"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      className="fill-white dark:fill-stone-950 transition-colors duration-200"
      d="M0,64L80,69.3C160,75,320,85,480,85.3C640,85,800,75,960,69.3C1120,64,1280,64,1360,64L1440,64L1440,130L1360,130C1280,130,1120,130,960,130C800,130,640,130,480,130C320,130,160,130,80,130L0,130Z"
    />
  </svg>
</div>
      

    </section>
  );
}
