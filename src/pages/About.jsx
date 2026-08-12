// src/pages/About.jsx
//
// Same route (/about), same export name (About) as before — this is
// purely a richer layout, no functionality changes. New sections:
// a hero intro, a "what we care about" values grid using icons,
// a founder highlight, and the quote pulled out as its own visual
// moment instead of a small box at the bottom.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, Truck, ShieldCheck, Heart } from "lucide-react";
import { supabase } from "../lib/supabase";

const VALUES = [
  {
    icon: Leaf,
    title: "Chosen, Not Sourced",
    description: "Every item earns its place on our own shelves first, before it's ever offered for sale.",
  },
  {
    icon: ShieldCheck,
    title: "Built to Last",
    description: "We look for tools that outlive trends — cast iron, real wood, honest materials.",
  },
  {
    icon: Truck,
    title: "Fast, Careful Delivery",
    description: "Packed properly, shipped quickly, and it actually arrives the way it left.",
  },
  {
    icon: Heart,
    title: "Genuinely Family Run",
    description: "This isn't a brand voice — it's one person's actual taste in kitchen tools.",
  },
];

export default function About() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadContent() {
      const { data } = await supabase
        .from("about_content")
        .select("eyebrow, title, description, image_url")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (isMounted && data) setContent(data);
    }

    loadContent();
    return () => { isMounted = false; };
  }, []);

  const story = content ?? {
    eyebrow: "Our story",
    title: "A shop built one kitchen drawer at a time.",
    description: "DorisWare started as one home cook's personal collection of tools worth keeping — not the ones that looked good in a photo, the ones that actually got used every week.",
    image_url: null,
  };

  return (
    <div className="bg-white dark:bg-stone-950">

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[3px] text-amber-700 dark:text-amber-500 mb-4">
          {story.eyebrow}
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-100 leading-tight mb-6">
          {story.title}
        </h1>
        <p className="text-lg text-stone-600 dark:text-stone-300 max-w-xl mx-auto">
          {story.description}
        </p>
      </section>

      {/* FOUNDER HIGHLIGHT */}
      <section className="max-w-5xl mx-auto grid gap-10 px-4 pb-20 sm:grid-cols-2 sm:px-6">
        <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800">
          {story.image_url ? (
            <img src={story.image_url} alt="DorisWare story" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center px-8 text-center text-sm text-stone-400 dark:text-stone-500">
              A photo from the DorisWare story will appear here.
            </div>
          )}
        </div>

        <div>
          <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
            Why this shop exists
          </h2>
          <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
            DorisWare is for the tools that become part of a home: reliable
            cookware, practical details, and pieces chosen for daily use.
          </p>
          <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
            Every product is selected with care for usefulness, durability,
            and the pleasure of cooking at home.
          </p>
        </div>
      </section>

      {/* VALUES GRID */}
      <section className="bg-stone-50 dark:bg-stone-900 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-10 text-center">
            What We Care About
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-6"
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-amber-700 dark:text-amber-400" />
                </div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center sm:px-6">
        <p className="font-serif italic text-2xl md:text-3xl text-stone-800 dark:text-stone-100 leading-snug">
          "A good knife and a good pan will outlast most of the things you own."
        </p>
      </section>

      {/* CTA */}
      <section className="border-t border-stone-200 dark:border-stone-800 py-16 text-center">
        <p className="text-stone-600 dark:text-stone-300 mb-5">
          See what's currently in the collection.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-black dark:bg-amber-500 text-white dark:text-stone-950 rounded-full px-8 py-3 font-semibold hover:bg-stone-800 dark:hover:bg-amber-400 transition-colors"
        >
          Shop the Collection
        </Link>
      </section>

    </div>
  );
}


// Alt About Code
// // src/pages/AboutPage.jsx

// import { Link } from "react-router-dom";
// import {
//   Heart,
//   ShieldCheck,
//   Truck,
//   Star,
//   ChefHat,
//   Sparkles,
//   ArrowRight,
// } from "lucide-react";

// export default function AboutPage() {
//   return (
//     <div className="bg-white dark:bg-stone-950">

//       {/* ================= HERO ================= */}

//       <section className="relative h-[500px] overflow-hidden">
//         <img
//           src="https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1800&q=80"
//           alt="Kitchen"
//           className="absolute inset-0 h-full w-full object-cover"
//         />

//         <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />

//         <div className="relative max-w-7xl mx-auto h-full flex items-center px-6">
//           <div className="max-w-2xl text-white">

//             <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur">
//               <Sparkles size={18} />
//               Trusted Kitchen Essentials
//             </span>

//             <h1 className="mt-6 text-5xl md:text-6xl font-serif font-bold leading-tight">
//               More Than a Store.
//               <br />
//               We're Part of Your Kitchen.
//             </h1>

//             <p className="mt-6 text-lg text-stone-200 leading-relaxed">
//               DorisWare was inspired by a simple belief:
//               everyone deserves reliable, beautiful kitchenware
//               that makes cooking enjoyable every single day.
//             </p>

//             <Link
//               to="/shop"
//               className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-4 font-semibold text-white transition hover:bg-amber-600"
//             >
//               Shop Collection
//               <ArrowRight size={18} />
//             </Link>

//           </div>
//         </div>
//       </section>

//       {/* ================= STORY ================= */}

//       <section className="max-w-7xl mx-auto px-6 py-24">

//         <div className="grid lg:grid-cols-2 gap-16 items-center">

//           <div>
//             <img
//               src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=900&q=80"
//               alt="Founder"
//               className="rounded-3xl shadow-2xl"
//             />
//           </div>

//           <div>

//             <span className="text-amber-600 font-semibold uppercase tracking-wider">
//               Our Story
//             </span>

//             <h2 className="mt-4 text-4xl font-serif font-bold text-stone-900 dark:text-white">
//               Built from a Love for Cooking
//             </h2>

//             <div className="mt-8 space-y-6 text-lg text-stone-600 dark:text-stone-300 leading-8">

//               <p>
//                 DorisWare began with one simple goal — helping families
//                 cook with dependable kitchen tools that last.
//               </p>

//               <p>
//                 Every product is selected with care, focusing on quality,
//                 durability, practicality, and everyday usefulness rather
//                 than trends.
//               </p>

//               <p>
//                 Whether you're preparing breakfast for your children,
//                 hosting family dinners, or learning your first recipe,
//                 DorisWare is here to make every cooking experience easier
//                 and more enjoyable.
//               </p>

//             </div>

//           </div>

//         </div>

//       </section>

//       {/* ================= VALUES ================= */}

//       <section className="bg-stone-100 dark:bg-stone-900 py-24">

//         <div className="max-w-7xl mx-auto px-6">

//           <div className="text-center">

//             <h2 className="text-4xl font-serif font-bold">
//               What We Believe
//             </h2>

//             <p className="mt-4 text-stone-600 dark:text-stone-400">
//               Everything we sell reflects these principles.
//             </p>

//           </div>

//           <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8">

//             <ValueCard
//               icon={<ChefHat />}
//               title="Quality First"
//               text="Kitchen tools chosen for performance and durability."
//             />

//             <ValueCard
//               icon={<Heart />}
//               title="Made for Families"
//               text="Products designed to make everyday cooking easier."
//             />

//             <ValueCard
//               icon={<ShieldCheck />}
//               title="Trusted Products"
//               text="Carefully selected items we would confidently recommend."
//             />

//             <ValueCard
//               icon={<Truck />}
//               title="Reliable Delivery"
//               text="Fast and secure shipping straight to your doorstep."
//             />

//           </div>

//         </div>

//       </section>

//       {/* ================= STATS ================= */}

//       <section className="py-24">

//         <div className="max-w-6xl mx-auto px-6">

//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">

//             <Stat number="1000+" label="Happy Customers" />

//             <Stat number="50+" label="Kitchen Products" />

//             <Stat number="4.9★" label="Average Rating" />

//             <Stat number="100%" label="Customer Focused" />

//           </div>

//         </div>

//       </section>

//       {/* ================= QUOTE ================= */}

//       <section className="max-w-5xl mx-auto px-6 pb-24">

//         <div className="rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 p-12 text-center shadow-xl">

//           <Star
//             className="mx-auto text-white"
//             fill="white"
//           />

//           <p className="mt-8 text-3xl md:text-4xl font-serif italic text-white leading-relaxed">
//             "Great meals begin with great tools."
//           </p>

//           <p className="mt-6 text-white/90">
//             — DorisWare
//           </p>

//         </div>

//       </section>

//       {/* ================= CTA ================= */}

//       <section className="pb-28">

//         <div className="max-w-6xl mx-auto px-6">

//           <div className="rounded-[40px] bg-stone-900 text-white p-14 text-center">

//             <h2 className="text-4xl font-serif font-bold">
//               Ready to Upgrade Your Kitchen?
//             </h2>

//             <p className="mt-5 max-w-2xl mx-auto text-stone-300">
//               Browse our carefully selected collection of cookware,
//               utensils, storage solutions, and kitchen accessories.
//             </p>

//             <Link
//               to="/shop"
//               className="mt-10 inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-4 font-semibold hover:bg-amber-600 transition"
//             >
//               Explore Products
//               <ArrowRight size={18} />
//             </Link>

//           </div>

//         </div>

//       </section>

//     </div>
//   );
// }

// function ValueCard({ icon, title, text }) {
//   return (
//     <div className="rounded-3xl bg-white dark:bg-stone-800 p-8 shadow-lg hover:-translate-y-2 transition-all duration-300">

//       <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
//         {icon}
//       </div>

//       <h3 className="mt-6 text-xl font-semibold text-stone-900 dark:text-white">
//         {title}
//       </h3>

//       <p className="mt-3 text-stone-600 dark:text-stone-400 leading-7">
//         {text}
//       </p>

//     </div>
//   );
// }

// function Stat({ number, label }) {
//   return (
//     <div>
//       <h3 className="text-5xl font-bold text-amber-500">
//         {number}
//       </h3>

//       <p className="mt-3 text-stone-600 dark:text-stone-400">
//         {label}
//       </p>
//     </div>
//   );
// }
