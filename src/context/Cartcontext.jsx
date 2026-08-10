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

import { createContext, useContext, useState } from "react";

// Step 1: create the context "channel"
const CartContext = createContext(null);

// Step 2: the Provider component. This holds the ACTUAL state
// (count, plus a function to change it) and hands it out to
// anything nested inside <CartProvider>.
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [cartAlert, setCartAlert] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  function parsePrice(price) {
    if (!price && price !== 0) return 0;
    const n = parseFloat(String(price).replace(/[^0-9.]/g, ""));
    return Number.isNaN(n) ? 0 : n;
  }

  function addToCart(item) {
    const availableStock = Number(item.quantity ?? 0);

    if (availableStock <= 0) {
      setCartAlert(`${item.name} is out of stock.`);
      return;
    }

    setItems((current) => {
      const existing = current.find((entry) => entry.id === item.id);

      if (existing) {
        const nextQuantity = existing.quantity + 1;
        if (nextQuantity > availableStock) {
          setCartAlert(`Only ${availableStock} unit${availableStock === 1 ? "" : "s"} available for ${item.name}.`);
          return current;
        }

        setCartAlert("");
        return current.map((entry) =>
          entry.id === item.id ? { ...entry, quantity: nextQuantity } : entry
        );
      }

      setCartAlert("");
      return [
        ...current,
        {
          ...item,
          quantity: 1,
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

  function clearCart() {
    setItems([]);
    setCartAlert("");
  }

  function clearCartAlert() {
    setCartAlert("");
  }

  function openCart() {
    setIsCartOpen(true);
  }

  function closeCart() {
    setIsCartOpen(false);
  }

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const formattedTotal = `₵${total.toFixed(2)}`;

  return (
    <CartContext.Provider value={{ items, count, addToCart, updateQuantity, removeFromCart, clearCart, clearCartAlert, cartAlert, total: formattedTotal, isCartOpen, openCart, closeCart }}>
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
