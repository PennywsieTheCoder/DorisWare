import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  X,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { useCart } from "../context/Cartcontext";

/* ──────────────────────────────────────────────────────────────
   Empty state illustration
────────────────────────────────────────────────────────────── */
function EmptyCart({ onClose }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 py-12 text-center">
      {/* Icon */}
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
          <ShoppingBag className="h-10 w-10 text-stone-300 dark:text-stone-600" />
        </div>
        <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/60 text-lg">
          🍳
        </span>
      </div>

      <div>
        <p className="text-lg font-semibold text-stone-800 dark:text-stone-100">
          Your cart is empty
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-400 dark:text-stone-500">
          Looks like you haven't added anything yet.
          <br />
          Browse our cookware collection to get started.
        </p>
      </div>

      <Link
        to="/shop"
        onClick={onClose}
        className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:from-green-500 hover:to-emerald-500 active:scale-[0.98]"
      >
        Browse the shop
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>

      {/* Trust badges */}
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {[
          { icon: Truck, label: "Delivery fee shown at checkout" },
          { icon: RotateCcw, label: "30-day returns" },
          { icon: Shield, label: "Secure checkout" },
        ].map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="flex items-center gap-1.5 rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1.5 text-xs text-stone-500 dark:text-stone-400"
          >
            <Icon className="h-3 w-3" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Single cart item row
────────────────────────────────────────────────────────────── */
function CartItem({ item, onRemove, onUpdate }) {
  const [removing, setRemoving] = useState(false);

  function handleRemove() {
    setRemoving(true);
    setTimeout(() => onRemove(item.id), 280);
  }

  return (
    <div
      className={`group relative flex gap-3.5 rounded-2xl p-3 transition-all duration-300 hover:bg-stone-50 dark:hover:bg-stone-800/60 ${
        removing ? "scale-95 opacity-0" : "scale-100 opacity-100"
      }`}
    >
      {/* Product image */}
      <div className="relative shrink-0 overflow-visible rounded-xl bg-stone-100 dark:bg-stone-800">
        {item.images?.[0] ? (
          <img
            src={item.images[0]}
            alt={item.name}
            className="h-20 w-20 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center text-2xl">
            🍳
          </div>
        )}
        {/* Quantity badge */}
        <span className="absolute -right-1 -top-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 px-1 text-[10px] font-bold leading-none text-white shadow">
          {item.quantity}
        </span>
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">
              {item.name}
            </p>
            {item.category && (
              <p className="mt-0.5 truncate text-xs text-stone-400 dark:text-stone-500">
                {item.category}
              </p>
            )}
          </div>
          {/* Remove */}
          <button
            type="button"
            onClick={handleRemove}
            aria-label={`Remove ${item.name}`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-stone-300 dark:text-stone-600 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/50 dark:hover:text-red-400 opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Price + stepper */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
            ₵{(item.unitPrice * item.quantity).toFixed(2)}
          </p>

          {/* Quantity stepper */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900 p-0.5">
            <button
              type="button"
              onClick={() => onUpdate(item.id, item.quantity - 1)}
              aria-label="Decrease quantity"
              className="flex h-6 w-6 items-center justify-center rounded-xl text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-700 dark:hover:text-stone-100 disabled:opacity-30"
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="min-w-[1.25rem] text-center text-xs font-semibold text-stone-800 dark:text-stone-200">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdate(item.id, item.quantity + 1)}
              aria-label="Increase quantity"
              disabled={item.quantity >= (item.stockQuantity ?? 99)}
              className="flex h-6 w-6 items-center justify-center rounded-xl text-stone-500 transition-colors hover:bg-green-500 hover:text-white disabled:opacity-30"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Promo code input
────────────────────────────────────────────────────────────── */
function PromoCode() {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");

  function apply(e) {
    e.preventDefault();
    if (code.trim().toUpperCase() === "DORIS10") {
      setApplied(true);
      setError("");
    } else {
      setError("Invalid code. Try DORIS10 for 10% off.");
    }
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-2xl bg-green-50 dark:bg-green-950/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-semibold text-green-700 dark:text-green-400">
            DORIS10 — 10% off applied!
          </span>
        </div>
        <button
          type="button"
          onClick={() => { setApplied(false); setCode(""); }}
          className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={apply} className="flex flex-wrap gap-2">
      <div className="relative flex-1">
        <Tag className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(""); }}
          placeholder="Promo code"
          className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-8 pr-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:bg-stone-900"
        />
      </div>
      <button
        type="submit"
        disabled={!code.trim()}
        className="rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-stone-700 disabled:opacity-40 dark:bg-stone-700 dark:hover:bg-stone-600"
      >
        Apply
      </button>
      {error && <p role="alert" className="basis-full text-xs text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main Cart Drawer
────────────────────────────────────────────────────────────── */
export default function Cart() {
  const {
    items,
    count,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartAlert,
    clearCartAlert,
    isCartOpen,
    closeCart,
  } = useCart();

  const navigate = useNavigate();
  const drawerRef = useRef(null);
  const [confirmClear, setConfirmClear] = useState(false);

  /* Trap focus & close on Escape */
  useEffect(() => {
    if (!isCartOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  /* Calculated values */
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const savings = items.reduce((s, i) => {
    const original = i.originalPrice ? parseFloat(String(i.originalPrice).replace(/[^0-9.]/g, "")) : 0;
    return original > i.unitPrice ? s + (original - i.unitPrice) * i.quantity : s;
  }, 0);

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 opacity-100 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="absolute inset-y-0 right-0 flex w-full translate-x-0 flex-col bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] dark:bg-stone-950 sm:max-w-[420px]"
      >
        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-b border-stone-100 px-5 py-4 dark:border-stone-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 dark:bg-green-950/60">
              <ShoppingBag className="h-4.5 w-4.5 text-green-700 dark:text-green-400" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 dark:text-stone-100 leading-tight">
                Your Cart
              </h2>
              <p className="text-xs text-stone-400 dark:text-stone-500">
                {count === 0
                  ? "No items"
                  : `${count} item${count !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2"><button type="button" onClick={() => setConfirmClear(true)} disabled={items.length === 0} className="rounded-lg px-2.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:pointer-events-none disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-950/30">Clear cart</button><button type="button" onClick={closeCart} aria-label="Close cart" className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 text-stone-400 transition-all hover:border-stone-300 hover:bg-stone-50 hover:text-stone-700 dark:border-stone-800 dark:hover:bg-stone-800 dark:hover:text-stone-300"><X className="h-4 w-4" /></button></div>
        </div>

        {confirmClear && <div className="mx-5 mt-3 flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm dark:border-red-900/60 dark:bg-red-950/30"><p className="text-red-800 dark:text-red-200">Remove all items from your cart?</p><div className="flex shrink-0 gap-2"><button type="button" onClick={() => setConfirmClear(false)} className="rounded-lg px-2 py-1.5 text-xs font-semibold text-stone-600 hover:bg-white dark:text-stone-300 dark:hover:bg-stone-800">Keep</button><button type="button" onClick={() => { clearCart(); setConfirmClear(false); }} className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700">Clear</button></div></div>}

        {/* ── Stock / promo alert ────────────────────────── */}
        {cartAlert && (
          <div className="mx-5 mt-3 shrink-0 flex items-start justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/50 dark:bg-amber-950/30">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              {cartAlert}
            </p>
            <button
              type="button"
              onClick={clearCartAlert}
              className="mt-0.5 shrink-0 text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
              aria-label="Dismiss alert"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* ── Items / empty state ────────────────────────── */}
        {items.length === 0 ? (
          <EmptyCart onClose={closeCart} />
        ) : (
          <>
            {/* Item list */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={removeFromCart}
                  onUpdate={updateQuantity}
                />
              ))}

              {/* Promo code */}
              <div className="px-2 pt-3 pb-2">
                <PromoCode />
              </div>
            </div>

            {/* ── Order summary + CTA ────────────────────── */}
            <div className="shrink-0 border-t border-stone-100 dark:border-stone-800/80">
              {/* Summary rows */}
              <div className="space-y-2 px-5 pt-4 pb-3">
                <div className="flex justify-between text-sm text-stone-500 dark:text-stone-400">
                  <span>Subtotal ({count} items)</span>
                  <span>₵{subtotal.toFixed(2)}</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>You saved</span>
                    <span>−₵{savings.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-stone-500 dark:text-stone-400">
                  <span>Delivery</span>
                  <span>Calculated at checkout</span>
                </div>

                <div className="flex justify-between border-t border-stone-100 pt-2 text-base font-bold text-stone-900 dark:border-stone-800 dark:text-stone-100">
                  <span>Items subtotal</span>
                  <span>₵{subtotal.toFixed(2)}</span>
                </div>
              </div>

              {/* CTA */}
              <div className="px-5 pb-5 pt-1 space-y-2">
                <button
                  type="button"
                  id="cart-checkout-btn"
                  onClick={() => { closeCart(); navigate("/checkout"); }}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 py-4 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:from-green-500 hover:to-emerald-500 hover:shadow-xl hover:-translate-y-px active:scale-[0.98]"
                >
                  Checkout
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  {/* Shimmer */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </button>

                <button
                  type="button"
                  onClick={closeCart}
                  className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-stone-200 py-3 text-sm font-medium text-stone-600 transition hover:bg-stone-50 dark:border-stone-800 dark:text-stone-400 dark:hover:bg-stone-900"
                >
                  Continue shopping
                </button>

                {/* Trust row */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  {[
                    { icon: Shield, label: "Secure pay" },
                    { icon: RotateCcw, label: "30-day returns" },
                    { icon: Package, label: "Fast dispatch" },
                  ].map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      className="flex items-center gap-1 text-[10px] text-stone-400 dark:text-stone-500"
                    >
                      <Icon className="h-3 w-3" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
