// src/context/CartContext.jsx
//
// ============================================================
// LESSON 9: Context
// ============================================================
//
// Three pieces to a Context:
//
// 1. createContext() — makes the "channel" itself. Just a
//    container, holds nothing yet.
//
// 2. A Provider — a component you wrap around part of your app
//    (often the whole App). Whatever value you give the Provider
//    becomes readable by EVERY component nested inside it, no
//    matter how deep, without passing props down manually.
//
// 3. useContext(CartContext) — how any nested component reads the
//    value. Called inside any component, no matter how deeply
//    nested inside the Provider.

import { createContext, useCallback, useContext, useEffect, useState } from "react";

// Step 1: create the context "channel"
const CartContext = createContext(null);

// Step 2: the Provider component. This holds the ACTUAL state
// (count, plus a function to change it) and hands it out to
// anything nested inside <CartProvider>.
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [cartAlert, setCartAlert] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartNotice, setCartNotice] = useState(null);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (!cartNotice) return undefined;
    const timeout = window.setTimeout(() => setCartNotice(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [cartNotice]);

  function parsePrice(price) {
    if (!price && price !== 0) return 0;
    const n = parseFloat(String(price).replace(/[^0-9.]/g, ""));
    return Number.isNaN(n) ? 0 : n;
  }

  function addToCart(item, amount = 1) {
    const availableStock = Number(item.quantity ?? 0);
    const quantityToAdd = Math.max(1, Math.floor(Number(amount) || 1));

    if (availableStock <= 0) {
      setCartAlert(`${item.name} is out of stock.`);
      return;
    }

    setCartNotice({ id: Date.now(), productName: item.name });

    setItems((current) => {
      const existing = current.find((entry) => entry.id === item.id);

      if (existing) {
        const nextQuantity = existing.quantity + quantityToAdd;
        if (nextQuantity > availableStock) {
          setCartAlert(`Only ${availableStock} unit${availableStock === 1 ? "" : "s"} available for ${item.name}.`);
        }

        if (nextQuantity <= availableStock) setCartAlert("");
        return current.map((entry) =>
          entry.id === item.id ? { ...entry, quantity: Math.min(nextQuantity, availableStock) } : entry
        );
      }

      if (quantityToAdd > availableStock) {
        setCartAlert(`Only ${availableStock} unit${availableStock === 1 ? "" : "s"} available for ${item.name}.`);
      } else {
        setCartAlert("");
      }
      return [
        ...current,
        {
          ...item,
          quantity: Math.min(quantityToAdd, availableStock),
          unitPrice: parsePrice(item.price),
          stockQuantity: availableStock,
        },
      ];
    });
  }

  function updateQuantity(id, quantity) {
    setItems((current) => {
      const existing = current.find((item) => item.id === id);
      if (!existing) {
        return current;
      }

      const availableStock = Number(existing.stockQuantity ?? existing.quantity ?? 0);

      if (quantity <= 0) {
        setCartAlert("");
        return current.filter((item) => item.id !== id);
      }

      const cappedQuantity = Math.min(quantity, availableStock);
      if (quantity > availableStock) {
        setCartAlert(`Only ${availableStock} unit${availableStock === 1 ? "" : "s"} available for ${existing.name}.`);
      } else {
        setCartAlert("");
      }

      return current.map((item) =>
        item.id === id ? { ...item, quantity: cappedQuantity } : item
      );
    });
  }

  function removeFromCart(id) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  const clearCart = useCallback(() => {
    setItems([]);
    setCartAlert("");
  }, []);

  function clearCartAlert() {
    setCartAlert("");
  }

  function openCart() {
    setCartNotice(null);
    setIsCartOpen(true);
  }

  function closeCart() {
    setIsCartOpen(false);
  }

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const formattedTotal = `₵${total.toFixed(2)}`;

  return (
    <CartContext.Provider value={{ items, count, addToCart, updateQuantity, removeFromCart, clearCart, clearCartAlert, cartAlert, total: formattedTotal, isCartOpen, openCart, closeCart, cartNotice, dismissCartNotice: () => setCartNotice(null) }}>
      {children}
    </CartContext.Provider>
  );
}

// Step 3: a small helper hook so components don't need to import
// both useContext AND CartContext everywhere — they just import
// this one function.
// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  return useContext(CartContext);
}
