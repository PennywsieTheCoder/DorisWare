// src/pages/ProductPage.jsx
//
// ============================================================
// LESSON 10: React Router — a dedicated page per product
// ============================================================
//
// Three router pieces used here:
//
// 1. useParams() — reads dynamic pieces of the CURRENT url. If the
//    route is defined as path="/product/:id" (set up in App.jsx),
//    and someone visits /product/skillet, then useParams() returns
//    { id: "skillet" }. The `:id` in the path is a placeholder —
//    whatever's actually in the url at that position becomes
//    available here.
//
// 2. useNavigate() — lets you send the user to a different url from
//    inside your JS code (e.g. after clicking a "Back" button),
//    rather than only via a clickable link.
//
// 3. <Link to="..."> (used elsewhere, e.g. in ProductCard) — the
//    router's version of <a href="...">. Regular <a> tags reload
//    the entire page from the server; <Link> just swaps out the
//    part of the page that changed, instantly, without a reload.
//    Always use <Link> for navigation WITHIN your own app; keep
//    plain <a> for things like the Stripe checkout link, which
//    genuinely needs to leave your app.

import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ShoppingCart, Heart, AlertCircle, Star } from "lucide-react";
import { PRODUCTS } from "../data/products";
import ProductImageCarousel from "../components/ProductImageCarousel";
import { useCart } from "../context/CartContext";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-stone-600 mb-6 text-lg">That product doesn't exist.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-black text-white rounded-full px-6 py-2 font-semibold hover:bg-stone-800 transition"
          >
            Back to shop
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = Number(product.quantity ?? 0) <= 0;
  const isLowStock = !isOutOfStock && Number(product.quantity ?? 0) < 5;
  const maxQuantity = Number(product.quantity ?? 0);

  const handleQuantityChange = (delta) => {
    const newQuantity = selectedQuantity + delta;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setSelectedQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < selectedQuantity; i++) {
      addToCart(product);
    }
    setSelectedQuantity(1);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="text-stone-600 hover:text-stone-900 text-xl"
          aria-label="Close"
        >
          ×
        </button>
        <h1 className="text-sm font-semibold text-stone-900 flex-1 text-center">Product Details</h1>
        <button
          type="button"
          className="text-stone-600 hover:text-stone-900"
          aria-label="Shopping cart"
        >
          <ShoppingCart size={20} />
        </button>
      </div>

      {/* Center Container */}
      <div className="flex-1 flex flex-col items-center w-full">
        {/* Product Image */}
        <div className="w-full max-w-md bg-stone-100 flex items-center justify-center py-6 px-4">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="max-h-80 object-contain"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-stone-400">No image</div>
          )}
        </div>

        {/* Product Details */}
        <div className="w-full max-w-md px-4 py-4 space-y-3">
          {/* Quantity and Wishlist */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={selectedQuantity <= 1 || isOutOfStock}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-300 text-sm text-stone-600 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-semibold text-stone-900">{String(selectedQuantity).padStart(2, "0")}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={selectedQuantity >= maxQuantity || isOutOfStock}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-300 text-sm text-stone-600 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="text-stone-400 hover:text-red-500 transition"
            >
              <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Product Name */}
          <h1 className="text-xl font-bold text-stone-900">{product.name}</h1>

          {/* Price and Rating */}
          <div className="flex items-baseline gap-3">
            <span className="text-xl font-bold text-stone-900">{product.price}</span>
            <span className="text-xs text-stone-500 line-through">£{Number(product.price.replace(/[^0-9.]/g, "")) * 1.2}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < 4 ? "fill-amber-400 text-amber-400" : "text-stone-300"}
                />
              ))}
            </div>
            <span className="text-xs text-stone-600">4.5 Rating</span>
          </div>

          {/* Stock Status */}
          {isOutOfStock ? (
            <div className="flex gap-2 items-start px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">This product is limited and may change at anytime depending on product availability.</p>
            </div>
          ) : isLowStock ? (
            <div className="flex gap-2 items-start px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">Only {maxQuantity} item{maxQuantity !== 1 ? "s" : ""} left in stock.</p>
            </div>
          ) : null}

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-stone-900 mb-1">Description</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {product.description}
              {product.description && (
                <button className="ml-1 font-semibold text-stone-900 hover:underline">
                  Read More
                </button>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Add to Cart Button - Sticky Bottom */}
      <div className="bg-white border-t border-stone-200 px-4 py-3">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full bg-black text-white rounded-full py-3 font-semibold flex items-center justify-center gap-2 text-sm hover:bg-stone-800 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingCart size={18} />
            {isOutOfStock ? "Sold out" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TRY THIS (once wired up per the instructions file):
//   1. Visit /product/skillet directly by typing it in the browser
//      address bar — the page loads that specific product, proving
//      the url itself carries real information now.
//   2. Visit /product/nonsense — confirm the "doesn't exist" message
//      shows instead of a crash.
//   3. Click "Back to the shop" and confirm it uses the app's
//      internal navigation (instant, no full page reload) rather
//      than a normal link.
// ============================================================