import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQ() {
  const faqs = [
    {
      question: "Are DorisWare cast iron products pre-seasoned?",
      answer: "Yes! All our Cast Iron Skillets and Dutch Ovens come pre-seasoned with 100% natural vegetable oil, making them ready to use right out of the box. We include a simple care guide to help you maintain the seasoning over time.",
    },
    {
      question: "What is your standard delivery timeline in Ghana?",
      answer: "For orders within Greater Accra, we deliver within 24 to 48 hours. Orders for Ashanti, Central, Eastern, and Western regions are dispatched via our express courier partners and arrive in 2 to 4 business days.",
    },
    {
      question: "Do you offer returns or exchanges?",
      answer: "Absolutely. We stand behind our quality. If you receive an item with any manufacturing defects or shipping damage, we offer a hassle-free 14-day replacement or refund policy. Please keep the original packaging.",
    },
    {
      question: "Is your cookware safe for induction cooktops?",
      answer: "Our Cast Iron Skillets, Stoneware, and Stainless Steel lines are fully compatible with induction hobs, gas stove tops, electric ovens, and grills. Please note that stoneware should not be used on direct open flame.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[3px] text-amber-600">
          Got questions?
        </p>
        <h2 className="mt-2 font-serif text-3xl font-semibold text-stone-850 dark:text-stone-100 md:text-4xl">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-white transition-all dark:border-stone-800 dark:bg-stone-900"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-stone-850 hover:bg-stone-50 dark:text-stone-100 dark:hover:bg-stone-850"
              >
                <span className="flex items-center gap-3">
                  <HelpCircle size={18} className="text-amber-500 shrink-0" />
                  {faq.question}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-stone-400 transition-transform duration-300 ${
                    isOpen ? "rotate-180 text-amber-500" : ""
                  }`}
                />
              </button>
              <div
                className={`transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-60 opacity-100 border-t border-stone-100 dark:border-stone-800" : "max-h-0 opacity-0 pointer-events-none"
                }`}
              >
                <p className="px-6 py-5 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
