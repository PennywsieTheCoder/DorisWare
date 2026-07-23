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

      <div className="p-4">
        <h3 className="text-lg font-bold leading-tight text-stone-900 dark:text-stone-100">{name}</h3>

        {tagline && (
          <p className="text-stone-400 dark:text-stone-400 text-sm mt-0.5">{tagline}</p>
        )}

        <p className="text-stone-500 dark:text-stone-300 text-sm mt-2">{description}</p>

        <div className="mt-3">
          {isOutOfStock ? (
            <p className="text-sm font-medium text-red-600">Out of stock</p>
          ) : isLowStock ? (
            <p className="text-sm font-medium text-amber-600">Only {quantity} left</p>
          ) : (
            <p className="text-sm font-medium text-emerald-600">In stock</p>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="font-bold text-lg text-stone-900 dark:text-stone-100">{price}</span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              addToCart(productItem);
            }}
            disabled={isOutOfStock}
            className="bg-stone-100 text-stone-900 rounded-full px-3 py-2 flex items-center gap-2 text-sm font-semibold hover:bg-amber-100 transition-colors disabled:cursor-not-allowed disabled:opacity-60 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
          >
            <ShoppingCart size={20} />
            {isOutOfStock ? "Sold out" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
