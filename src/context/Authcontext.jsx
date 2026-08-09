import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
const storageKey = "dorisware-user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey)); } catch { return null; }
  });

  function saveUser(nextUser) {
    setUser(nextUser);
    localStorage.setItem(storageKey, JSON.stringify(nextUser));
  }

  function signIn({ email, name }) {
    saveUser({ name: name || email.split("@")[0], email, phone: "", addresses: [], favorites: [], provider: "email" });
  }

  function signInWithGoogle() {
    saveUser({ name: "DorisWare Customer", email: "customer@gmail.com", phone: "", addresses: [], favorites: [], provider: "google" });
  }

  function updateProfile(details) { saveUser({ ...user, ...details }); }
  function toggleFavorite(product) {
    if (!user) return false;
    const favorites = user.favorites ?? [];
    const exists = favorites.some((item) => item.id === product.id);
    saveUser({ ...user, favorites: exists ? favorites.filter((item) => item.id !== product.id) : [...favorites, product] });
    return true;
  }
  function isFavorite(id) { return (user?.favorites ?? []).some((item) => item.id === id); }
  function signOut() { setUser(null); localStorage.removeItem(storageKey); }

  return <AuthContext.Provider value={{ user, signIn, signInWithGoogle, updateProfile, toggleFavorite, isFavorite, signOut }}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() { return useContext(AuthContext); }
