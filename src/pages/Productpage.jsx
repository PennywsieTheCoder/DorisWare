import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AlertCircle, ChevronLeft, Heart, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { useCart } from "../context/Cartcontext";
import { useAuth } from "../context/Authcontext";
import ProductCard from "../components/Productcard";
import { useProducts } from "../hooks/useProducts";

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

  if (loading) return <div className="flex min-h-[65vh] items-center justify-center text-sm text-stone-500">Loading product…</div>;
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
            <div className="mt-5 flex flex-wrap items-center gap-3"><div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"><Star size={15} className="fill-amber-400 text-amber-400" /> 4.5 <span className="text-amber-700/70 dark:text-amber-300/70">(24 reviews)</span></div><span className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Ready to dispatch</span></div>
            <div className="mt-7 flex flex-wrap items-end gap-3 border-y border-stone-100 py-6 dark:border-stone-800"><span className="text-3xl font-bold text-stone-900 dark:text-stone-100">{product.price}</span>{originalPrice && <span className="mb-1 text-sm text-stone-400 line-through">{money(originalPrice)}</span>}{product.discountPercent > 0 && <span className="mb-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">Save {product.discountPercent}%</span>}</div>
            <p className="mt-6 leading-7 text-stone-600 dark:text-stone-300">{product.description}</p>
            {isOutOfStock ? <Notice tone="red" text="This product is currently out of stock. Check back soon for availability." /> : isLowStock ? <Notice tone="amber" text={`Limited availability — only ${stock} left in stock.`} /> : <Notice tone="green" text="In stock and ready for fast delivery." />}
            <div className="mt-7 flex flex-col gap-4 sm:flex-row"><div className="flex h-13 items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 p-1.5 dark:border-stone-700 dark:bg-stone-800"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1 || isOutOfStock} className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:text-stone-100 dark:hover:bg-stone-700" aria-label="Reduce quantity"><Minus size={18} /></button><span className="w-9 text-center font-semibold text-stone-900 dark:text-stone-100">{quantity}</span><button onClick={() => setQuantity(Math.min(stock, quantity + 1))} disabled={quantity >= stock || isOutOfStock} className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:text-stone-100 dark:hover:bg-stone-700" aria-label="Increase quantity"><Plus size={18} /></button></div><button onClick={add} disabled={isOutOfStock} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-green-600/20 transition hover:-translate-y-0.5 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"><ShoppingCart size={19} />{isOutOfStock ? "Sold out" : "Add to cart"}</button></div>
            <p className="mt-5 text-center text-xs text-stone-500 dark:text-stone-400">Secure payment is handled at checkout. Free delivery options will be shown before payment.</p>
          </section>
        </div>
      </main>
      <section className="border-t border-stone-200 bg-white py-16 dark:border-stone-800 dark:bg-stone-900 sm:py-20"><div className="mx-auto max-w-6xl px-4 sm:px-6"><div className="mb-8 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-amber-600">Keep exploring</p><h2 className="mt-2 font-serif text-3xl font-semibold text-stone-900 dark:text-stone-100">You may also like</h2></div><button type="button" onClick={() => navigate("/shop")} className="text-sm font-semibold text-green-700 hover:text-green-800 dark:text-green-400">View all products →</button></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">{recommendations.map((item) => <ProductCard key={item.id} {...item} />)}</div></div></section>
    </div>
  );
}

function Unavailable({ navigate }) { return <div className="flex min-h-[65vh] items-center justify-center px-4"><div className="text-center"><p className="text-lg text-stone-600 dark:text-stone-300">That product is no longer available.</p><button onClick={() => navigate("/shop")} className="mt-5 rounded-full bg-green-600 px-6 py-3 font-semibold text-white">Return to shop</button></div></div>; }
function Notice({ tone, text }) { const styles = { red: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300", amber: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300", green: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300" }; return <div className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${styles[tone]}`}><AlertCircle size={18} /><p>{text}</p></div>; }
