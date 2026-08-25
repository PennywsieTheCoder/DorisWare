// src/components/Header.jsx

import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Search, ShoppingCart, User, X, Sun, Moon } from "lucide-react";
import { useCart } from "../context/Cartcontext";
import { useTheme } from "../context/Themecontext ";
import { useAuth } from "../context/Authcontext";
import Cart from "./Cart";
import { useStoreLogo } from "../hooks/useStoreLogo";


export default function Header({ storeName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const navigate = useNavigate();
  const { count, openCart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const logoUrl = useStoreLogo();

  useEffect(() => {
    const updateHeader = () => setHasScrolled(window.scrollY > 8);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    setIsSearchOpen(false);
    setIsOpen(false);
    navigate(query ? `/shop?search=${encodeURIComponent(query)}` : "/shop");
  };

  return (
    <>
      <header className={`sticky top-0 z-50 border-b border-stone-200/80 bg-white/95 backdrop-blur transition-shadow dark:border-stone-800 dark:bg-stone-900/95 ${hasScrolled ? "shadow-md shadow-stone-900/5 dark:shadow-black/20" : "shadow-none"}`}>
        <div className="grid min-h-14 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 px-3 py-2 sm:px-6 lg:h-16 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-3 lg:py-0">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <img src={logoUrl} alt="DorisWare" className="h-9 w-9 shrink-0 rounded-full object-contain sm:h-10 sm:w-10" />
            <span className="hidden truncate font-serif text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 sm:inline">{storeName}</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
            <NavLink to="/" end className={({ isActive }) => isActive ? "border-b-2 border-green-500 pb-1 text-green-600" : "text-gray-600 dark:text-stone-300 hover:text-green-600"}>Home</NavLink>
            <NavLink to="/shop" className={({ isActive }) => isActive ? "border-b-2 border-green-500 pb-1 text-green-600" : "text-gray-600 dark:text-stone-300 hover:text-green-600"}>Shop</NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? "border-b-2 border-green-500 pb-1 text-green-600" : "text-gray-600 dark:text-stone-300 hover:text-green-600"}>About</NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? "border-b-2 border-green-500 pb-1 text-green-600" : "text-gray-600 dark:text-stone-300 hover:text-green-600"}>Contact</NavLink>
            {user?.role === "admin" && <NavLink to="/admin" className={({ isActive }) => isActive ? "border-b-2 border-green-500 pb-1 text-green-600" : "text-gray-600 dark:text-stone-300 hover:text-green-600"}>Admin</NavLink>}
          </nav>

          <form onSubmit={handleSearch} className="order-last col-span-2 flex w-full min-w-0 items-center rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 dark:border-stone-700 dark:bg-stone-800 lg:hidden">
            <Search size={16} className="shrink-0 text-stone-400" />
            <input aria-label="Search products by name" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search products" className="ml-1.5 min-w-0 flex-1 bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400 dark:text-stone-100" />
          </form>

          <div className="hidden items-center justify-end gap-1.5 lg:flex">
            {isSearchOpen ? <form onSubmit={handleSearch} className="flex items-center rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 dark:border-stone-700 dark:bg-stone-800"><Search size={16} className="text-stone-400" /><input autoFocus aria-label="Search products by name" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search products" className="ml-2 w-40 bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400 dark:text-stone-100 xl:w-52" /><button type="button" onClick={() => setIsSearchOpen(false)} className="ml-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200" aria-label="Close search"><X size={15} /></button></form> : <button type="button" onClick={() => setIsSearchOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-full text-stone-600 transition hover:bg-stone-100 hover:text-green-700 dark:text-stone-300 dark:hover:bg-stone-800" aria-label="Search products"><Search size={19} /></button>}
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
              className="flex h-9 w-9 items-center justify-center rounded-full text-stone-600 transition hover:bg-stone-100 hover:text-green-700 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Link to={user ? "/profile" : "/login"} aria-label={user ? "View profile" : "Sign in"} className="flex h-9 w-9 items-center justify-center rounded-full text-stone-600 transition hover:bg-stone-100 hover:text-green-700 dark:text-stone-300 dark:hover:bg-stone-800">
              {user?.avatar ? <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" /> : <User className="shrink-0" size={19} />}
            </Link>
          </div>

          <div className="col-start-2 row-start-1 flex shrink-0 items-center justify-self-end gap-0.5 lg:hidden">
            <Link to={user ? "/profile" : "/login"} aria-label={user ? "View profile" : "Sign in"} className="flex h-9 w-9 items-center justify-center rounded-full text-stone-600 transition hover:bg-stone-100 hover:text-green-700 dark:text-stone-300 dark:hover:bg-stone-800">
              {user?.avatar ? <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" /> : <User className="shrink-0" size={19} />}
            </Link>
            <button type="button" onClick={openCart} className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-visible" aria-label="View cart">
              <ShoppingCart className="text-gray-700 dark:text-stone-300" />
              {count > 0 && <span className="absolute -right-1 -top-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1 text-[10px] font-bold leading-none text-white">{count}</span>}
            </button>
            <button type="button" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu" aria-expanded={isOpen} className="flex h-9 w-9 items-center justify-center rounded-full text-stone-600 transition hover:bg-stone-100 hover:text-green-700 dark:text-stone-300 dark:hover:bg-stone-800">
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
