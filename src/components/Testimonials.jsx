import { useEffect, useState } from "react";
import { CheckCircle, Star } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    supabase.rpc("get_homepage_reviews", { p_limit: 3 })
      .then(({ data, error }) => { if (!error) setReviews(data ?? []); });
  }, []);

  if (!reviews.length) return null;
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return <section className="bg-stone-50 py-14 dark:bg-stone-950 sm:py-18"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="text-center"><p className="font-mono text-xs uppercase tracking-[3px] text-amber-600">Verified purchases</p><h2 className="mt-2 font-serif text-3xl font-semibold text-stone-850 dark:text-stone-100 md:text-4xl">What Home Chefs are Saying</h2><p className="mx-auto mt-3 flex items-center justify-center gap-2 text-sm text-stone-500 dark:text-stone-400"><span className="font-semibold text-stone-800 dark:text-stone-200">{average.toFixed(1)}</span><Star size={15} fill="currentColor" className="text-amber-400" /> from {reviews.length} approved review{reviews.length === 1 ? "" : "s"}</p></div><div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 md:grid-cols-3">{reviews.map((review) => <article key={review.id} className="flex w-[min(19rem,calc(100vw-2.5rem))] shrink-0 snap-center flex-col justify-between rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:w-auto"><div><div className="flex gap-1 text-amber-400">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={16} fill={index < review.rating ? "currentColor" : "none"} className={index < review.rating ? "text-amber-400" : "text-stone-300 dark:text-stone-600"} />)}</div>{review.title && <h3 className="mt-4 font-semibold text-stone-900 dark:text-stone-100">{review.title}</h3>}<p className="mt-3 text-sm leading-relaxed text-stone-600 italic dark:text-stone-300">“{review.body || "Verified customer review."}”</p></div><div className="mt-6 border-t border-stone-100 pt-4 dark:border-stone-800"><div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300"><CheckCircle size={15} /> Verified purchase</div><p className="mt-2 text-xs text-stone-500 dark:text-stone-400">{review.reviewer_name || "DorisWare customer"} · Purchased: <span className="font-semibold text-stone-700 dark:text-stone-200">{review.product_name ?? "DorisWare product"}</span></p></div></article>)}</div></div></section>;
}
