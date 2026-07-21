// src/components/ProductCard.jsx

import { ArrowUpRight, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
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
    <div className="bg-white rounded-3xl shadow-md overflow-hidden">
      <div className="relative">
        <ProductImageCarousel images={images} name={name} />
      </div>

      <div className="p-4">
        <Link to={`/product/${id}`}>
          <h3 className="font-bold text-lg text-stone-900 leading-tight hover:underline">
            {name}
          </h3>
        </Link>

        {tagline && (
          <p className="text-stone-400 text-sm mt-0.5">{tagline}</p>
        )}

        <p className="text-stone-500 text-sm mt-2">{description}</p>

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
          <span className="font-bold text-lg text-stone-900">{price}</span>
          <button
            type="button"
            onClick={() => addToCart(productItem)}
            disabled={isOutOfStock}
            className="bg-white text-black rounded-full px-3 py-2 flex items-center gap-2 text-sm font-semibold hover:bg-stone-100 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingCart size={20} />
            {isOutOfStock ? "Sold out" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}