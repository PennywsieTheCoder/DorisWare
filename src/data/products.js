// src/data/products.js
//
// ============================================================
// LESSON 6a: Splitting into files
// ============================================================
//
// Data doesn't belong mixed into component files — pulling it out
// makes both easier to read, and means a future step (like fetching
// this from a real database instead of hardcoding it) only touches
// this one file, not every component that uses it.
//
// `export const PRODUCTS = ...` is a NAMED export (no "default").
// That means whoever imports it must use the exact name in curly
// braces: import { PRODUCTS } from "./data/products"

const withBase = (path) => `${import.meta.env.BASE_URL}${path}`;

export const PRODUCTS = [
  {
    id: "skillet",
    name: "Cast Iron Skillet",
    category: "Cookware",
    price: "£38",
    description: "10-inch, pre-seasoned, built to outlive its owner.",
    quantity: 12,
    images: [withBase("/images/castironskillet.jpg"), withBase("/images/test.webp")],
    stripeLink: "https://buy.stripe.com/REPLACE_ME_1",
  },
  {
    id: "spoons",
    name: "Olive Wood Spoon Set",
    category: "Utensils",
    price: "£19",
    description: "Three hand-carved spoons for pans that scratch easily.",
    quantity: 4,
    images: [withBase("/images/castironskillet.jpg"), withBase("/images/test.webp")],
    stripeLink: "https://buy.stripe.com/REPLACE_ME_2",
  },
  {
    id: "bowl",
    name: "Stoneware Mixing Bowl",
    category: "Bakeware",
    price: "£24",
    description: "Wide-rimmed, weighted base, doesn't skid on the counter.",
    quantity: 2,
    images: [withBase("/images/castironskillet.jpg"), withBase("/images/test.webp")],
    stripeLink: "https://buy.stripe.com/REPLACE_ME_3",
  },
  {
    id: "knife",
    name: "Chef's Knife, 8-inch",
    category: "Cutlery",
    price: "£52",
    description: "Full tang, forged carbon steel, holds an edge for weeks.",
    quantity: 6,
    images: [withBase("/images/castironskillet.jpg"), withBase("/images/test.webp")],
    stripeLink: "https://buy.stripe.com/REPLACE_ME_4",
  },
  {
    id: "Cooker",
    name: "Electric Pressure Cooker",
    category: "Appliances",
    price: "£100",
    description: "Electric Pressure Cookers.",
    quantity: 0,
    images: [withBase("/images/castironskillet.jpg"), withBase("/images/test.webp")],
    stripeLink: "https://buy.stripe.com/REPLACE_ME_4",
  },
];