// src/components/Header.jsx
//
// Nothing new here vs what you built in Lesson 3 — nav links, a
// mobile menu toggle using useState, and the storeName prop so this
// component isn't locked to one hardcoded name.

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {ShoppingCart,CircleX,Trash2 } from "lucide-react";
import { useCart } from "../context/Cartcontext";

export default function Header({ storeName }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isProductPage = location.pathname.startsWith("/product/");
  const { count, items, removeFromCart, updateQuantity, total, cartAlert, clearCartAlert, isCartOpen, openCart, closeCart } = useCart();

  return (
    <header className="bg-stone-100 border-b border-stone-300 px-6 py-4 sticky top-0 z-10">
      <div className="mx-auto flex items-center justify-between">
        <Link
  to="/"
  className="font-serif text-xl font-semibold text-stone-800"
>
  {storeName}
</Link>
        {/* <span className="font-serif text-xl font-semibold text-stone-800">
          {storeName}
        </span> */}

        <nav className="hidden sm:flex gap-6 text-sm font-medium text-stone-600 items-center">

  <Link
    to="/"
    className="hover:text-stone-900"
  >
    Home
  </Link>


  <Link
    to="/shop"
    className="hover:text-stone-900"
  >
    Shop
  </Link>


  <a
    href="#about"
    className="hover:text-stone-900"
  >
    About
  </a>


  <a
    href="#contact"
    className="hover:text-stone-900"
  >
    Contact
  </a>


  {!isProductPage && (
    <button
      type="button"
      onClick={openCart}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-800 shadow-sm ring-1 ring-stone-200 transition hover:bg-stone-100"
      aria-label="View cart"
    >
      <ShoppingCart size={20} />

      {count > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 px-1.5 text-[0.65rem] font-semibold text-white">
          {count}
        </span>
      )}
    </button>
  )}

</nav>

        {/* <nav className="hidden sm:flex gap-6 text-sm font-medium text-stone-600 items-center">
          <a href="#shop" className="hover:text-stone-900">Shop</a>
          <a href="#about" className="hover:text-stone-900">About</a>
          <a href="#contact" className="hover:text-stone-900">Contact</a>
          {!isProductPage && (
            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-800 shadow-sm ring-1 ring-stone-200 transition hover:bg-stone-100"
              aria-label="View cart"
            >
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 px-1.5 text-[0.65rem] font-semibold text-white">
                  {count}
                </span>
              )}
            </button>
          )}
        </nav> */}

        <button
          className="sm:hidden text-stone-700 font-medium"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? "Close ✕" : "Menu ☰"}
        </button>
      </div>

      {isOpen && (
        <nav className="sm:hidden flex flex-col mt-4 gap-3 text-sm font-medium text-stone-600">

  <Link
    to="/"
    onClick={() => setIsOpen(false)}
    className="hover:text-stone-900"
  >
    Home
  </Link>


  <Link
    to="/shop"
    onClick={() => setIsOpen(false)}
    className="hover:text-stone-900"
  >
    Shop
  </Link>


  <a
    href="#about"
    onClick={() => setIsOpen(false)}
    className="hover:text-stone-900"
  >
    About
  </a>


  <a
    href="#contact"
    onClick={() => setIsOpen(false)}
    className="hover:text-stone-900"
  >
    Contact
  </a>


  {!isProductPage && (
    <button
      type="button"
      onClick={() => {
        openCart();
        setIsOpen(false);
      }}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-800 text-white shadow-sm transition hover:bg-stone-700"
      aria-label="View cart"
    >
      <ShoppingCart size={20} />

      {count > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white text-[0.65rem] font-semibold text-stone-900">
          {count}
        </span>
      )}
    </button>
  )}

</nav>


        // <nav className="sm:hidden flex flex-col mt-4 gap-3 text-sm font-medium text-stone-600">
        //   <a href="#shop" onClick={() => setIsOpen(false)}>Shop</a>
        //   <a href="#about" onClick={() => setIsOpen(false)}>About</a>
        //   <a href="#contact" onClick={() => setIsOpen(false)}>Contact</a>
        //   {!isProductPage && (
        //     <button
        //       type="button"
        //       onClick={() => {
        //         openCart();
        //         setIsOpen(false);
        //       }}
        //       className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-800 text-white shadow-sm transition hover:bg-stone-700"
        //       aria-label="View cart"
        //     >
        //       <ShoppingCart size={20} />
        //       {count > 0 && (
        //         <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white text-[0.65rem] font-semibold text-stone-900">
        //           {count}
        //         </span>
        //       )}
        //     </button>
        //   )}
        // </nav>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-end bg-black/40 px-4 py-6">
          <button
            type="button"
            className="absolute inset-0"
            onClick={closeCart}
            aria-label="Close cart modal"
          />
          <div
            className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col h-[90vh]"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <button
                type="button"
                onClick={closeCart}
                className=" text-red-500 hover:text-stone-900"
                aria-label="Close cart"
              >
                <CircleX size={20} />
              </button>
              <h2 className="text-lg font-semibold text-stone-900">Cart</h2>
              {<button
                type="button"
                className="text-stone-600 hover:text-stone-900"
                aria-label="More options"
              >
                
              </button>}
            </div>

            {/* Alert */}
            {cartAlert && (
              <div className="mx-4 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {cartAlert}
                <button type="button" onClick={clearCartAlert} className="ml-2 font-semibold">×</button>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {items.length === 0 ? (
                <p className="text-center text-sm text-stone-500 py-8">Your cart is empty</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-stone-200 last:border-0">
                    {/* Image */}
                    <div className="shrink-0">
                      {item.images && item.images[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="h-20 w-20 rounded-lg object-contain bg-stone-100"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-stone-200 text-xs text-stone-500">
                          IMG
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900 truncate">{item.name}</p>
                      <p className="text-xs text-stone-500 truncate">{item.description}</p>
                      <p className="text-sm font-semibold text-stone-900 mt-1">£{item.unitPrice.toFixed(2)}</p>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="text-stone-400 hover:text-red-500 transition mt-1"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <>
                {/* Quantity and Total Controls */}
                <div className="px-4 py-4 border-t border-stone-200 space-y-4">
                  {/* Items with quantity controls */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <span className="text-sm text-stone-600">{item.name}</span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={Number(item.stockQuantity ?? 0) <= 0}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm font-medium text-stone-900">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={Number(item.stockQuantity ?? 0) <= 0}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                          <span className="w-14 text-right text-sm font-semibold text-stone-900">£{(item.unitPrice * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 pt-4 border-t border-stone-200">
                    <div className="flex justify-between text-sm text-stone-600">
                      <span>Sub total</span>
                      <span>£{(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-stone-600">
                      <span>Shipping & tax</span>
                      <span>£5.00</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                      <span>Total</span>
                      <span>{total}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <div className="px-4 pb-4">
                  <button
                    type="button"
                    className="w-full rounded-full bg-orange-500 text-white font-semibold py-3 hover:bg-orange-600 transition"
                  >
                    Checkout Now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}