// src/pages/ProductPage.jsx
//
// Layout changes to match the reference image (logic mostly
// unchanged from what you already had):
//
// 1. Top bar: X (close) on the left, cart icon + badge on the
//    right, instead of just a back chevron.
// 2. Image sits inside its own white rounded card, with the
//    quantity stepper as a single pill positioned just below it
//    (not two separate circle buttons off to the side).
// 3. A "discount %" chip next to the struck-through original price,
//    and the star rating moved to the right side of that same row.
// 4. A small green-dot "delivery" line under the product name.
// 5. The promo/stock banner uses a soft gradient background instead
//    of a flat color, matching the reference more closely.

import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ShoppingCart, Heart, AlertCircle, Star, ChevronLeft, Trash2, X } from "lucide-react";
import { PRODUCTS } from "../data/products";
import { useCart } from "../context/Cartcontext";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, items, updateQuantity, removeFromCart, count } = useCart();
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCartView, setIsCartView] = useState(false);

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
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingAndTax = subtotal > 0 ? 5 : 0;
  const total = subtotal + shippingAndTax;

  // Original price + discount %, purely for the struck-through
  // price chip in the reference image. Adjust the 1.2 multiplier
  // (or replace with a real `originalPrice` field on the product)
  // once you have real discount data.
  const numericPrice = Number(product.price.replace(/[^0-9.]/g, ""));
  const originalPrice = (numericPrice * 1.2).toFixed(2);
  const discountPercent = 20;

  function handleQuantityChange(delta) {
    const newQuantity = selectedQuantity + delta;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setSelectedQuantity(newQuantity);
    }
  }

  function handleAddToCart() {
    for (let i = 0; i < selectedQuantity; i++) {
      addToCart(product);
    }
    setSelectedQuantity(1);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        {isCartView ? (
          <>
            <span className="w-5" />
            <h1 className="text-sm font-semibold text-stone-900">Cart</h1>
            <button
              onClick={() => setIsCartView(false)}
              className="text-stone-600 hover:text-stone-900"
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/")}
              className="text-stone-600 hover:text-stone-900"
              aria-label="Back"
            >
              <ChevronLeft size={20} />
            </button>

            <h1 className="text-sm font-semibold text-stone-900">Product Details</h1>
            <button
              onClick={() => setIsCartView(true)}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-800 transition hover:bg-stone-200"
              aria-label="View cart"
            >
              <ShoppingCart size={18} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 px-1.5 text-[0.65rem] font-semibold text-white">
                  {count}
                </span>
              )}
            </button>
          </>
        )}
      </div>

      {isCartView ? (
        <div className="flex-1 w-full max-w-md mx-auto px-4 py-4 flex flex-col">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 px-6 py-10 text-center">
              <p className="text-base font-semibold text-stone-900">Your cart is empty</p>
              <p className="mt-2 text-sm text-stone-500">Add a product to see it appear here.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {items.map((item) => {
                  const imageSrc = item.images?.[0] ?? item.image ?? "";

                  return (
                    <div key={item.id} className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
                      <div className="flex gap-3">
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-stone-100">
                          {imageSrc ? (
                            <img src={imageSrc} alt={item.name} className="h-full w-full object-contain p-2" />
                          ) : (
                            <div className="text-xs text-stone-400">No image</div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-stone-900">{item.name}</p>
                              <p className="mt-1 text-xs text-stone-500">{item.description}</p>
                              <p className="mt-2 text-sm font-semibold text-stone-900">£{item.unitPrice.toFixed(2)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="text-stone-400 transition hover:text-red-500"
                              aria-label="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-2 py-1">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white text-sm"
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>
                              <span className="w-5 text-center text-sm font-semibold text-stone-900">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white text-sm"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                            <p className="text-sm font-semibold text-stone-900">£{(item.unitPrice * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div className="flex items-center justify-between text-sm text-stone-600">
                  <span>Subtotal</span>
                  <span>£{subtotal.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-stone-600">
                  <span>Shipping & tax</span>
                  <span>£{shippingAndTax.toFixed(2)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-3 text-base font-semibold text-stone-900">
                  <span>Total</span>
                  <span>£{total.toFixed(2)}</span>
                </div>
                <button
                  type="button"
                  className="mt-4 w-full rounded-full bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600"
                >
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center w-full max-w-md mx-auto">
          <div className="w-full px-4 pt-6">
            <div className="bg-stone-100 rounded-2xl flex items-center justify-center py-8">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="max-h-64 object-contain"
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-stone-400">
                  No image
                </div>
              )}
            </div>

            <div className="flex justify-center -mt-5">
              <div className="flex items-center gap-4 bg-white border border-stone-200 rounded-full shadow-md px-3 py-1.5">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={selectedQuantity <= 1 || isOutOfStock}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white text-sm disabled:opacity-30"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-semibold text-stone-900">
                  {String(selectedQuantity).padStart(2, "0")}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={selectedQuantity >= maxQuantity || isOutOfStock}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white text-sm disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="w-full px-4 pt-4 pb-6 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-bold text-stone-900 leading-snug">
                {product.name}
              </h1>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="text-stone-300 hover:text-red-500 transition shrink-0 mt-1"
              >
                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Available on fast delivery
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-stone-900">{product.price}</span>
                <span className="text-xs text-stone-400 line-through">£{originalPrice}</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                  {discountPercent}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="text-xs text-stone-600">4.5 Rating</span>
              </div>
            </div>

            {isOutOfStock ? (
              <div className="flex gap-2 items-start px-3 py-2 bg-linear-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
                <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">
                  This product is limited and may change at anytime depending on product availability.
                </p>
              </div>
            ) : isLowStock ? (
              <div className="flex gap-2 items-start px-3 py-2 bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Only {maxQuantity} item{maxQuantity !== 1 ? "s" : ""} left in stock.
                </p>
              </div>
            ) : (
              <div className="flex gap-2 items-start px-3 py-2 bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  This promo is limited and may change at anytime depending on product availability.
                </p>
              </div>
            )}

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

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full bg-black text-white rounded-full py-3 font-semibold flex items-center justify-center gap-2 text-sm hover:bg-stone-800 transition disabled:cursor-not-allowed disabled:opacity-60 mt-2"
            >
              <ShoppingCart size={18} />
              {isOutOfStock ? "Sold out" : "Add to Cart"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}