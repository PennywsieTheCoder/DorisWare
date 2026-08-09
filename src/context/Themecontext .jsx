// src/context/ThemeContext.jsx
//
// ============================================================
// Dark mode: same Context pattern as CartContext, plus one new
// idea — toggling a class on <html> itself.
// ============================================================
//
// Why <html> and not some wrapper <div>? Because <html> is the
// single ancestor EVERY element on the page sits inside. Tailwind's
// dark: variant (once configured, see index.css instructions below)
// works by checking "does this element have a `.dark` ancestor
// somewhere above it?" Put `.dark` on <html>, and literally every
// dark: class anywhere in your app becomes active at once — no
// need to pass a "isDark" prop down through every component.
//
// This effect ALSO reads/writes localStorage. Since this is a real
// deployed website (not a claude.ai sandboxed artifact), normal
// browser storage works completely fine here — this is exactly
// what localStorage is meant for: remembering a user's preference
// between visits.

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Initialize from whatever was saved last time, defaulting to
  // "light" if nothing's been saved yet (first-ever visit).
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  // Runs every time `theme` changes: updates the <html> class AND
  // saves the choice for next time. document.documentElement is
  // JS's way of referring to the actual <html> tag.
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  return useContext(ThemeContext);
}
