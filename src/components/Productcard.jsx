// src/components/ProductCard.jsx

import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductImageCarousel from "./Productimagecarousel";
import { useCart } from "../context/Cartcontext";

export default function ProductCard({
  id,
  name,
  price,
  description,
  stripeLink,
  quantity,
  images,       // now an ARRAY, not a single string
  tagline = null,
})

{

  const { addToCart } = useCart();
  const navigate = useNavigate();

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
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="text-base font-bold leading-tight text-stone-900 dark:text-stone-100 sm:text-lg">{name}</h3>

        {tagline && (
          <p className="text-stone-400 dark:text-stone-400 text-sm mt-0.5">{tagline}</p>
        )}

        <p className="mt-2 text-xs leading-relaxed text-stone-500 dark:text-stone-300 sm:text-sm">{description}</p>

        <div className="mt-3">
          {isOutOfStock ? (
            <p className="text-xs font-medium text-red-600 sm:text-sm">Out of stock</p>
          ) : isLowStock ? (
            <p className="text-xs font-medium text-amber-600 sm:text-sm">Only {quantity} left</p>
          ) : (
            <p className="text-xs font-medium text-emerald-600 sm:text-sm">In stock</p>
          )}
        </div>

        <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-base font-bold text-stone-900 dark:text-stone-100 sm:text-lg">{price}</span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              addToCart(productItem);
            }}
            disabled={isOutOfStock}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-900 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700 sm:w-auto sm:text-sm"
          >
            <ShoppingCart size={20} />
            {isOutOfStock ? "Sold out" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
