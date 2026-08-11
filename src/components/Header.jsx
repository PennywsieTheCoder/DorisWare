// src/components/Header.jsx

import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Leaf, Menu, Search, ShoppingCart, User, X, Sun, Moon } from "lucide-react";
import { useCart } from "../context/Cartcontext";
import { useTheme } from "../context/Themecontext ";
import { useAuth } from "../context/Authcontext";
import Cart from "./Cart";


export default function Header({ storeName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { count, openCart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

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
            <NavLink to="/about" className={({ isActive }) => isActive ? "border-b-2 border-green-500 pb-1 text-green-600" : "text-gray-600 dark:text-stone-300 hover:text-green-600"}>About</NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? "border-b-2 border-green-500 pb-1 text-green-600" : "text-gray-600 dark:text-stone-300 hover:text-green-600"}>Contact</NavLink>
            {user?.role === "admin" && <NavLink to="/admin" className={({ isActive }) => isActive ? "border-b-2 border-green-500 pb-1 text-green-600" : "text-gray-600 dark:text-stone-300 hover:text-green-600"}>Admin</NavLink>}
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
            <button type="button" onClick={openCart} className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-visible" aria-label="View cart">
              <ShoppingCart className="text-gray-700 dark:text-stone-300" />
              {count > 0 && <span className="absolute -right-1 -top-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1 text-[10px] font-bold leading-none text-white">{count}</span>}
            </button>

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

            <Link to={user ? "/profile" : "/login"} aria-label={user ? "View profile" : "Sign in"} className="flex items-center gap-2 text-gray-700 dark:text-stone-300">
              {user?.avatar ? <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" /> : <User className="shrink-0" />}
              {user && <span className="max-w-24 truncate text-sm">{user.name}</span>}
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-3 lg:hidden">
            <button type="button" onClick={openCart} className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-visible" aria-label="View cart">
              <ShoppingCart className="text-gray-700 dark:text-stone-300" />
              {count > 0 && <span className="absolute -right-1 -top-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1 text-[10px] font-bold leading-none text-white">{count}</span>}
            </button>
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
              <NavLink to="/about" onClick={() => setIsOpen(false)}>About</NavLink>
              <NavLink to="/contact" onClick={() => setIsOpen(false)}>Contact</NavLink>
              {user?.role === "admin" && <NavLink to="/admin" onClick={() => setIsOpen(false)}>Admin</NavLink>}
              <Link to={user ? "/profile" : "/login"} onClick={() => setIsOpen(false)}>{user ? "My profile" : "Sign in"}</Link>

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

      <Cart />
    </>
  );
}
