// src/components/Header.jsx

import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { CircleX, Leaf, Menu, Search, ShoppingCart, Trash2, User, X, Sun, Moon } from "lucide-react";
import { useCart } from "../context/Cartcontext";
import { useTheme } from "../context/Themecontext ";


export default function Header({ storeName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const isProductPage = location.pathname.startsWith("/product/");
  const { count, items, removeFromCart, updateQuantity, total, cartAlert, clearCartAlert, isCartOpen, openCart, closeCart } = useCart();
  const { theme, toggleTheme } = useTheme();

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/shop?search=${encodeURIComponent(query)}` : "/shop");
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-stone-900/90 shadow-sm backdrop-blur">
        <div className="flex h-20 w-full items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 sm:h-11 sm:w-11">
              <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="truncate text-lg font-bold text-gray-800 dark:text-stone-100 sm:text-2xl">{storeName}</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
            <NavLink to="/" end className={({ isActive }) => isActive ? "border-b-2 border-green-500 pb-1 text-green-600" : "text-gray-600 dark:text-stone-300 hover:text-green-600"}>Home</NavLink>
            <NavLink to="/shop" className={({ isActive }) => isActive ? "border-b-2 border-green-500 pb-1 text-green-600" : "text-gray-600 dark:text-stone-300 hover:text-green-600"}>Shop</NavLink>
            <Link to="/#about" className="text-gray-600 dark:text-stone-300 hover:text-green-600">About</Link>
            <Link to="/#contact" className="text-gray-600 dark:text-stone-300 hover:text-green-600">Contact</Link>
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            <form onSubmit={handleSearch} className="flex items-center rounded-full bg-gray-100 dark:bg-stone-800 px-4 py-2">
              <Search size={18} className="text-gray-400" />
              <input
                aria-label="Search products by name or category"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by product or category..."
                className="ml-2 w-56 bg-transparent outline-none xl:w-72 text-gray-800 dark:text-stone-100 placeholder:text-gray-400 dark:placeholder:text-stone-500"
              />
            </form>
            {!isProductPage && (
              <button type="button" onClick={openCart} className="relative" aria-label="View cart">
                <ShoppingCart className="text-gray-700 dark:text-stone-300" />
                {count > 0 && <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-white">{count}</span>}
              </button>
            )}

            {/* Dark mode toggle — desktop */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              aria-pressed={theme === "dark"}
              className="text-gray-700 dark:text-stone-300 hover:text-green-600 dark:hover:text-green-400 transition"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button type="button" aria-label="User account"><User className="text-gray-700 dark:text-stone-300" /></button>
          </div>

          <div className="flex shrink-0 items-center gap-3 lg:hidden">
            {!isProductPage && (
              <button type="button" onClick={openCart} className="relative" aria-label="View cart">
                <ShoppingCart className="text-gray-700 dark:text-stone-300" />
                {count > 0 && <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-white">{count}</span>}
              </button>
            )}
            <button type="button" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
              {isOpen ? <X className="dark:text-stone-100" /> : <Menu className="dark:text-stone-100" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <nav className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 lg:hidden">
            <div className="flex flex-col gap-4 p-6 text-gray-600 dark:text-stone-300">
              <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
              <Link to="/shop" onClick={() => setIsOpen(false)}>Shop</Link>
              <Link to="/#about" onClick={() => setIsOpen(false)}>About</Link>
              <Link to="/#contact" onClick={() => setIsOpen(false)}>Contact</Link>

              {/* Dark mode toggle — mobile */}
              <button
              type="button"
              onClick={() => { toggleTheme(); setIsOpen(false); }}
              aria-pressed={theme === "dark"}
              className="flex items-center gap-2 text-left"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
            </div>
          </nav>
        )}
      </header>

      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/50 px-3 pt-20 pb-3 backdrop-blur-sm sm:px-6 sm:pt-24 sm:pb-6">
          <button
            type="button"
            className="absolute inset-0"
            onClick={closeCart}
            aria-label="Close cart modal"
          />
          <div
            className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white dark:bg-stone-900 shadow-[0_25px_70px_rgba(0,0,0,0.18)] flex flex-col max-h-[calc(100vh-8rem)] animate-[slideIn_.25s_ease-out]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 bg-white px-4 py-4 dark:border-stone-800 dark:bg-stone-900 sm:px-7 sm:py-5">
              <button
                type="button"
                onClick={closeCart}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-stone-800 text-gray-500 dark:text-stone-400 transition hover:bg-red-50 hover:text-red-500"
                aria-label="Close cart"
              >
                <CircleX size={20} />
              </button>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-stone-100">Cart</h2>
              <span className="w-10" />
            </div>

            {cartAlert && (
              <div className="mx-4 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {cartAlert}
                <button type="button" onClick={clearCartAlert} className="ml-2 font-semibold">×</button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {items.length === 0 ? (
                <p className="text-center text-sm text-stone-500 dark:text-stone-400 py-8">Your cart is empty</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 rounded-2xl p-3 transition hover:bg-gray-50 dark:hover:bg-stone-800">
                    <div className="shrink-0">
                      {item.images && item.images[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="h-24 w-24 rounded-2xl bg-gray-100 dark:bg-stone-800 object-contain p-2"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-stone-200 dark:bg-stone-700 text-xs text-stone-500">
                          IMG
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900 dark:text-stone-100 truncate">{item.name}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{item.description}</p>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 mt-1">£{item.unitPrice.toFixed(2)}</p>
                    </div>

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
                <div className="px-4 py-4 border-t border-stone-200 dark:border-stone-800 space-y-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2">
                        <span className="min-w-0 flex-1 truncate text-sm text-stone-600 dark:text-stone-300">{item.name}</span>
                        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={Number(item.stockQuantity ?? 0) <= 0}
                            className="flex h-6 w-6 items-center justify-center rounded-xl border border-gray-200 dark:border-stone-700 bg-gray-50 dark:bg-stone-800 hover:bg-green-500 hover:text-white transition text-stone-600 dark:text-stone-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm font-medium text-stone-900 dark:text-stone-100">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={Number(item.stockQuantity ?? 0) <= 0}
                            className="flex h-6 w-6 items-center justify-center rounded-xl border border-gray-200 dark:border-stone-700 bg-gray-50 dark:bg-stone-800 hover:bg-green-500 hover:text-white transition text-stone-600 dark:text-stone-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                          <span className="w-14 text-right text-sm font-semibold text-stone-900 dark:text-stone-100">£{(item.unitPrice * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 rounded-2xl bg-gray-50 dark:bg-stone-800 p-4">
                    <div className="flex justify-between text-sm text-stone-600 dark:text-stone-300">
                      <span>Sub total</span>
                      <span>£{(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-stone-600 dark:text-stone-300">
                      <span>Shipping & tax</span>
                      <span>£5.00</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-200 dark:border-stone-700">
                      <span>Total</span>
                      <span>{total}</span>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5">
                  <button
                    type="button"
                    className="w-full rounded-2xl bg-gradient-to-r from-green-500 to-green-600 py-4 font-semibold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    Checkout Now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
