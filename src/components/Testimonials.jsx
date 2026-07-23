// src/components/Testimonials.jsx

import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah M.",
      review:
        "The cookware quality exceeded my expectations. Delivery was fast and everything arrived perfectly packaged.",
    },
    {
      name: "James K.",
      review:
        "I've ordered several kitchen tools from DorisWare. Great quality and excellent customer service.",
    },
    {
      name: "Emily R.",
      review:
        "Beautiful products and very durable. My cast iron skillet has become my favorite kitchen item.",
    },
  ];

  return (
    <section className="bg-white py-20 dark:bg-stone-950">
      <div className="mx-auto max-w-6xl px-6">
        {/* Heading */}
        <div className="mb-12 text-center">
          <p className="font-mono text-xs uppercase tracking-[3px] text-amber-600">
            Customer Reviews
          </p>

          <h2 className="mt-2 font-serif text-3xl font-semibold text-stone-800 dark:text-stone-100 md:text-4xl">
            What Our Customers Are Saying
          </h2>
        </div>

        {/* Review Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:shadow-lg dark:border-stone-700 dark:bg-stone-900 dark:shadow-black/20"
            >
              <div className="mb-4 flex gap-1 text-amber-500">
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
              </div>

              <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                "{testimonial.review}"
              </p>

              <div className="mt-5 border-t border-stone-200 pt-4 dark:border-stone-700">
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  {testimonial.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
