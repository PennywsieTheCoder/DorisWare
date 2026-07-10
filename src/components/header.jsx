// src/components/Header.jsx
//
// Same Header as before, just living in its own file now.
// Note the export style: `export default function Header(...)`.
// Default export = whoever imports this can name it anything,
// though by convention you keep the name matching (import Header
// from "./components/Header").

import { useState } from "react";

export default function Header({ storeName }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-stone-100 border-b border-stone-300 px-6 py-4 relative">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <span className="font-serif text-xl font-semibold text-stone-800">
          {storeName}
        </span>
        <nav className="hidden sm:flex gap-6 text-sm font-medium text-stone-600">
          <a href="#shop" className="hover:text-stone-900">Shop</a>
          <a href="#about" className="hover:text-stone-900">About</a>
          <a href="#contact" className="hover:text-stone-900">Contact</a>
        </nav>
        <button
          className="sm:hidden text-stone-700 font-medium"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "Close ✕" : "Menu ☰"}
        </button>
      </div>
      {isOpen && (
        <nav className="sm:hidden flex flex-col mt-4 gap-3 text-sm font-medium text-stone-600">
          <a href="#shop" onClick={() => setIsOpen(false)}>Shop</a>
          <a href="#about" onClick={() => setIsOpen(false)}>About</a>
          <a href="#contact" onClick={() => setIsOpen(false)}>Contact</a>
        </nav>
      )}
    </header>
  );
}