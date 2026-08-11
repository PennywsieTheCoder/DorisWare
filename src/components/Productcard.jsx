// src/components/ProductCard.jsx

import { Heart, ShoppingCart, Star } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductImageCarousel from "./Productimagecarousel";
import { useCart } from "../context/Cartcontext";
import { useAuth } from "../context/Authcontext";

export default function ProductCard({
  id,
  name,
  price,
  description,
  originalPrice = null,
  discountPercent = 0,
  ratingAverage = 0,
  reviewCount = 0,
  stripeLink,
  quantity,
  images,       // now an ARRAY, not a single string
  tagline = null,
})

{

  const { addToCart } = useCart();
  const { user, isFavorite, toggleFavorite } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const productItem = {
    id,
    name,
    price,
    description,
    stripeLink,
    quantity,
    images,
  };

  const isOutOfStock = Number(quantity ?? 0) <= 0;
  const isLowStock = !isOutOfStock && Number(quantity ?? 0) < 5;

  return (
    <div
      className="cursor-pointer overflow-hidden rounded-3xl bg-white shadow-md transition-shadow hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:bg-stone-900 dark:shadow-black/30"
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/product/${id}`)}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          navigate(`/product/${id}`);
        }
      }}
      aria-label={`View ${name}`}
    >
      <div className="relative">
        <ProductImageCarousel images={images} name={name} />
        <button type="button" onClick={(event) => { event.stopPropagation(); if (!user) { navigate("/login", { state: { from: location.pathname } }); return; } toggleFavorite(productItem); }} aria-label={isFavorite(id) ? `Remove ${name} from favorites` : `Add ${name} to favorites`} className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-105 dark:bg-stone-900/90 ${isFavorite(id) ? "text-rose-500" : "text-stone-600 dark:text-stone-300"}`}><Heart size={16} fill={isFavorite(id) ? "currentColor" : "none"} /></button>
      </div>

      <div className="p-3">
        <h3 className="text-sm font-bold leading-tight text-stone-900 dark:text-stone-100 sm:text-base">{name}</h3>

        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
          <Star size={13} className={reviewCount ? "fill-amber-400 text-amber-400" : "text-stone-300 dark:text-stone-600"} />
          <span className="font-semibold text-stone-700 dark:text-stone-200">{reviewCount ? ratingAverage.toFixed(1) : "New"}</span>
          {reviewCount > 0 && <span className="text-stone-400">({reviewCount})</span>}
        </div>

        {tagline && (
          <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-400">{tagline}</p>
        )}

        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-stone-500 dark:text-stone-300">{description}</p>

        <div className="mt-2">
          {isOutOfStock ? (
            <p className="text-xs font-medium text-red-600 sm:text-sm">Out of stock</p>
          ) : isLowStock ? (
            <p className="text-xs font-medium text-amber-600 sm:text-sm">Only {quantity} left</p>
          ) : (
            <p className="text-xs font-medium text-emerald-600 sm:text-sm">In stock</p>
          )}
        </div>

        <div className="mt-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-bold text-stone-900 dark:text-stone-100 sm:text-base">{price}</span>
            {originalPrice && <span className="text-xs text-stone-400 line-through">₵{Number(originalPrice).toFixed(2)}</span>}
            {discountPercent > 0 && <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">-{discountPercent}%</span>}
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              addToCart(productItem);
            }}
            disabled={isOutOfStock}
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-900 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700 sm:w-auto"
          >
            <ShoppingCart size={16} />
            {isOutOfStock ? "Sold out" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
