import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AlertCircle, ChevronLeft, Heart, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { useCart } from "../context/Cartcontext";
import { useAuth } from "../context/Authcontext";
import ProductCard from "../components/Productcard";
import { useProducts } from "../hooks/useProducts";
import { supabase } from "../lib/supabase";

const money = (value) => `₵${value.toFixed(2)}`;

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const product = products.find((item) => item.id === id);
  const { addToCart, openCart } = useCart();
  const { user, isFavorite, toggleFavorite } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", body: "" });
  const [reviewMessage, setReviewMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function loadReviews() {
      setReviewsLoading(true);
      const { data, error } = await supabase.from("product_reviews").select("id, user_id, rating, title, body, is_visible, created_at").eq("product_id", id).order("created_at", { ascending: false });
      if (active) {
        setReviews(error ? [] : data ?? []);
        setReviewsLoading(false);
      }
    }
    loadReviews();
    return () => { active = false; };
  }, [id]);

  if (loading) return <ProductLoading />;
  if (!product) return <Unavailable navigate={navigate} />;

  const stock = Number(product.quantity ?? 0);
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock < 5;
  const originalPrice = product.originalPrice;
  const recommendations = products.filter((item) => item.id !== product.id).slice(0, 3);

  function favorite() {
    if (!user) { navigate("/login", { state: { from: `/product/${id}` } }); return; }
    toggleFavorite(product);
  }
  function add() {
    for (let index = 0; index < quantity; index += 1) addToCart(product);
    setQuantity(1); openCart();
  }
  const canReview = user?.orders?.some((order) => order.status === "Delivered" && order.items?.some((item) => item.id === product?.id));
  const ownReview = reviews.find((review) => review.user_id === user?.id);
  async function submitReview(event) {
    event.preventDefault();
    if (!user) { navigate("/login", { state: { from: `/product/${id}` } }); return; }
    const { data, error } = await supabase.from("product_reviews").insert({ user_id: user.id, product_id: product.id, rating: Number(reviewForm.rating), title: reviewForm.title.trim() || null, body: reviewForm.body.trim() || null }).select("id, user_id, rating, title, body, is_visible, created_at").single();
    if (error) { setReviewMessage(error.message.includes("row-level security") ? "Reviews are available after a paid order is marked delivered." : "Your review could not be submitted. Please try again."); return; }
    setReviews((current) => [data, ...current]);
    setReviewMessage("Thanks — your review is waiting for approval.");
  }

  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <button onClick={() => navigate("/shop")} className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 transition hover:text-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:text-stone-400 dark:hover:text-green-400"><ChevronLeft size={18} /> Back to shop</button>
        <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-start lg:gap-14">
          <section>
            <div className="flex min-h-[340px] items-center justify-center overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:min-h-[500px]">
              <img src={product.images?.[imageIndex]} alt={product.name} className="max-h-[380px] max-w-full object-contain mix-blend-multiply dark:mix-blend-normal" />
            </div>
            {product.images?.length > 1 && <div className="mt-4 flex gap-3">{product.images.map((image, index) => <button type="button" key={image} onClick={() => setImageIndex(index)} className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border p-1 transition ${imageIndex === index ? "border-green-600 ring-2 ring-green-100 dark:ring-green-900" : "border-stone-200 dark:border-stone-700"}`} aria-label={`View product image ${index + 1}`}><img src={image} alt="" className="h-full w-full object-contain" /></button>)}</div>}
          </section>
          <section className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-stone-900 sm:p-8">
            <div className="flex items-start justify-between gap-5"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-amber-600">DorisWare essentials</p><h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-stone-900 dark:text-stone-100 sm:text-4xl">{product.name}</h1></div><button onClick={favorite} aria-label={isFavorite(product.id) ? "Remove from favorites" : "Add to favorites"} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition ${isFavorite(product.id) ? "border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-900 dark:bg-rose-950/40" : "border-stone-200 text-stone-500 hover:border-rose-200 hover:text-rose-500 dark:border-stone-700 dark:text-stone-300"}`}><Heart size={20} fill={isFavorite(product.id) ? "currentColor" : "none"} /></button></div>
            <div className="mt-5 flex flex-wrap items-center gap-3"><div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">{product.reviewCount ? <span className="flex items-center gap-0.5" aria-label={`${product.ratingAverage.toFixed(1)} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} fill={index < Math.round(product.ratingAverage) ? "currentColor" : "none"} className={index < Math.round(product.ratingAverage) ? "text-amber-400" : "text-amber-200 dark:text-amber-900"} />)}</span> : "New"}</div><span className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Ready to dispatch</span></div>
            <div className="mt-7 flex flex-wrap items-end gap-3 border-y border-stone-100 py-6 dark:border-stone-800"><span className="text-3xl font-bold text-stone-900 dark:text-stone-100">{product.price}</span>{originalPrice && <span className="mb-1 text-sm text-stone-400 line-through">{money(originalPrice)}</span>}{product.discountPercent > 0 && <span className="mb-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">Save {product.discountPercent}%</span>}</div>
            <p className="mt-6 leading-7 text-stone-600 dark:text-stone-300">{product.description}</p>
            {isOutOfStock ? <Notice tone="red" text="This product is currently out of stock. Check back soon for availability." /> : isLowStock ? <Notice tone="amber" text={`Limited availability — only ${stock} left in stock.`} /> : <Notice tone="green" text="In stock and ready for fast delivery." />}
            <div className="mt-7 flex flex-col gap-4 sm:flex-row"><div className="flex h-13 items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 p-1.5 dark:border-stone-700 dark:bg-stone-800"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1 || isOutOfStock} className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:text-stone-100 dark:hover:bg-stone-700" aria-label="Reduce quantity"><Minus size={18} /></button><span className="w-9 text-center font-semibold text-stone-900 dark:text-stone-100">{quantity}</span><button onClick={() => setQuantity(Math.min(stock, quantity + 1))} disabled={quantity >= stock || isOutOfStock} className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:text-stone-100 dark:hover:bg-stone-700" aria-label="Increase quantity"><Plus size={18} /></button></div><button onClick={add} disabled={isOutOfStock} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-green-600/20 transition hover:-translate-y-0.5 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"><ShoppingCart size={19} />{isOutOfStock ? "Sold out" : "Add to cart"}</button></div>
            <p className="mt-5 text-center text-xs text-stone-500 dark:text-stone-400">Secure payment is handled at checkout. Free delivery options will be shown before payment.</p>
          </section>
        </div>
        <ReviewSection reviews={reviews} loading={reviewsLoading} canReview={canReview} ownReview={ownReview} form={reviewForm} setForm={setReviewForm} message={reviewMessage} onSubmit={submitReview} onLogin={() => navigate("/login", { state: { from: `/product/${id}` } })} signedIn={Boolean(user)} />
      </main>
      <section className="border-t border-stone-200 bg-white py-16 dark:border-stone-800 dark:bg-stone-900 sm:py-20"><div className="mx-auto max-w-6xl px-4 sm:px-6"><div className="mb-8 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-amber-600">Keep exploring</p><h2 className="mt-2 font-serif text-3xl font-semibold text-stone-900 dark:text-stone-100">You may also like</h2></div><button type="button" onClick={() => navigate("/shop")} className="text-sm font-semibold text-green-700 hover:text-green-800 dark:text-green-400">View all products →</button></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">{recommendations.map((item) => <ProductCard key={item.id} {...item} />)}</div></div></section>
    </div>
  );
}

function Unavailable({ navigate }) { return <div className="flex min-h-[65vh] items-center justify-center px-4"><div className="text-center"><p className="text-lg text-stone-600 dark:text-stone-300">That product is no longer available.</p><button onClick={() => navigate("/shop")} className="mt-5 rounded-full bg-green-600 px-6 py-3 font-semibold text-white">Return to shop</button></div></div>; }
function ProductLoading() { return <div className="mx-auto max-w-6xl animate-pulse px-4 py-8 sm:px-6 sm:py-12" aria-label="Loading product"><div className="mb-7 h-5 w-28 rounded bg-stone-200 dark:bg-stone-800" /><div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-14"><div className="min-h-[340px] rounded-[2rem] bg-stone-200 dark:bg-stone-800 sm:min-h-[500px]" /><div className="rounded-[2rem] bg-white p-8 shadow-sm dark:bg-stone-900"><div className="h-3 w-28 rounded bg-stone-200 dark:bg-stone-800" /><div className="mt-5 h-11 w-3/4 rounded bg-stone-200 dark:bg-stone-800" /><div className="mt-8 h-9 w-32 rounded bg-stone-200 dark:bg-stone-800" /><div className="mt-8 space-y-3"><div className="h-4 rounded bg-stone-200 dark:bg-stone-800" /><div className="h-4 w-5/6 rounded bg-stone-200 dark:bg-stone-800" /><div className="h-4 w-2/3 rounded bg-stone-200 dark:bg-stone-800" /></div><div className="mt-8 h-14 rounded-2xl bg-stone-200 dark:bg-stone-800" /></div></div></div>; }
function Notice({ tone, text }) { const styles = { red: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300", amber: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300", green: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300" }; return <div className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${styles[tone]}`}><AlertCircle size={18} /><p>{text}</p></div>; }

function ReviewSection({ reviews, loading, canReview, ownReview, form, setForm, message, onSubmit, onLogin, signedIn }) {
  const visibleReviews = reviews.filter((review) => review.is_visible);
  return <section className="mt-12 border-t border-stone-200 pt-10 dark:border-stone-800"><div className={`grid gap-7 ${ownReview ? "" : "lg:grid-cols-[minmax(0,1fr)_340px]"}`}><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-amber-600">Verified customer reviews</p><h2 className="mt-2 font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100">What customers say</h2>{loading ? <p className="mt-5 text-sm text-stone-500">Loading reviews…</p> : visibleReviews.length ? <div className="mt-6 space-y-4">{visibleReviews.map((review) => <article key={review.id} className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900"><div className="flex items-center justify-between gap-3"><div className="flex text-amber-400">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} fill={index < review.rating ? "currentColor" : "none"} className={index < review.rating ? "text-amber-400" : "text-stone-300 dark:text-stone-700"} />)}</div><span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Verified buyer</span></div>{review.title && <h3 className="mt-3 font-semibold text-stone-900 dark:text-stone-100">{review.title}</h3>}{review.body && <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">{review.body}</p>}<p className="mt-3 text-xs text-stone-400">{new Date(review.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p></article>)}</div> : <p className="mt-5 rounded-2xl border border-dashed border-stone-300 p-5 text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">No approved reviews yet. The first verified customer review will appear here.</p>}</div>{!ownReview && <aside className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900"><h2 className="font-semibold text-stone-900 dark:text-stone-100">Share a review</h2>{!signedIn ? <><p className="mt-2 text-sm leading-6 text-stone-500 dark:text-stone-400">Sign in after delivery to review this purchase.</p><button type="button" onClick={onLogin} className="mt-5 w-full rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white dark:bg-emerald-600">Sign in to review</button></> : !canReview ? <p className="mt-3 text-sm leading-6 text-stone-500 dark:text-stone-400">Reviews unlock after this product has been paid for and marked delivered.</p> : <form className="mt-4 space-y-4" onSubmit={onSubmit}><label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Rating<select value={form.rating} onChange={(event) => setForm({ ...form, rating: event.target.value })} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 dark:border-stone-700 dark:bg-stone-800"><option value="5">5 — Excellent</option><option value="4">4 — Good</option><option value="3">3 — Average</option><option value="2">2 — Fair</option><option value="1">1 — Poor</option></select></label><label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Title <input maxLength="100" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 dark:border-stone-700 dark:bg-stone-800" /></label><label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Review <textarea required maxLength="1000" rows="4" value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 dark:border-stone-700 dark:bg-stone-800" /></label><button type="submit" className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Submit for approval</button></form>}{message && <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-400">{message}</p>}</aside>}</div></section>;
}
