import { CheckCircle, Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah M.",
      location: "Accra, GH",
      avatarBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
      review: "The Cast Iron Skillet's pre-seasoning was flawless. I cooked eggs on the first try with absolutely no sticking. Exceeded all my expectations!",
      purchasedItem: "Cast Iron Skillet",
      date: "August 2, 2026",
    },
    {
      name: "Kofi A.",
      location: "Kumasi, GH",
      avatarBg: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
      review: "The Chef's Knife holds its edge for weeks. Extremely well-balanced, comfortable weight, and cuts cleanly. Fast delivery service to Kumasi.",
      purchasedItem: "Chef's Knife, 8-inch",
      date: "July 28, 2026",
    },
    {
      name: "Emily R.",
      location: "London, UK",
      avatarBg: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300",
      review: "Stoneware Mixing Bowls are beautifully crafted and heavy enough that they don't slide around the counter. Love the natural beige color.",
      purchasedItem: "Stoneware Mixing Bowl",
      date: "July 15, 2026",
    },
  ];

  const initials = (name) => {
    return name.split(" ").map(n => n[0]).join("");
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      {/* Heading */}
      <div className="mb-12 text-center">
        <p className="font-mono text-xs uppercase tracking-[3px] text-amber-600">
          Community Voices
        </p>
        <h2 className="mt-2 font-serif text-3xl font-semibold text-stone-850 dark:text-stone-100 md:text-4xl">
          What Home Chefs are Saying
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-stone-500 dark:text-stone-400">
          Real feedback from kitchens around the globe.
        </p>
      </div>

      {/* Review Cards Grid */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 md:grid-cols-3">
        {testimonials.map((testimonial, i) => (
          <div
            key={i}
            className="flex w-[min(19rem,calc(100vw-2.5rem))] shrink-0 snap-center flex-col justify-between rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-stone-800 dark:bg-stone-900 sm:w-auto"
          >
            <div>
              {/* Star Rating & Verified tag */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1 text-amber-500">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  <CheckCircle size={11} /> Verified Buyer
                </span>
              </div>

              {/* Review Text */}
              <p className="mt-4 text-sm leading-relaxed text-stone-600 dark:text-stone-300 italic">
                "{testimonial.review}"
              </p>
            </div>

            {/* Author details */}
            <div className="mt-6 border-t border-stone-100 pt-4 dark:border-stone-800">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm ${testimonial.avatarBg}`}>
                  {initials(testimonial.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm">
                    {testimonial.name}
                  </h4>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                    {testimonial.location} · {testimonial.date}
                  </p>
                </div>
              </div>

              {/* Linked purchased product info */}
              <div className="mt-3.5 rounded-xl bg-stone-50 px-3 py-2 text-[10px] font-semibold text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                Purchased: <span className="text-stone-800 dark:text-stone-200">{testimonial.purchasedItem}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
