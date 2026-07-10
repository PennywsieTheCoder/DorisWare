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

export const PRODUCTS = [
  {
    id: "skillet",
    name: "Cast Iron Skillet",
    price: "£38",
    description: "10-inch, pre-seasoned, built to outlive its owner.",
    stripeLink: "https://buy.stripe.com/REPLACE_ME_1",
  },
  {
    id: "spoons",
    name: "Olive Wood Spoon Set",
    price: "£19",
    description: "Three hand-carved spoons for pans that scratch easily.",
    stripeLink: "https://buy.stripe.com/REPLACE_ME_2",
  },
  {
    id: "bowl",
    name: "Stoneware Mixing Bowl",
    price: "£24",
    description: "Wide-rimmed, weighted base, doesn't skid on the counter.",
    stripeLink: "https://buy.stripe.com/REPLACE_ME_3",
  },
  {
    id: "knife",
    name: "Chef's Knife, 8-inch",
    price: "£52",
    description: "Full tang, forged carbon steel, holds an edge for weeks.",
    stripeLink: "https://buy.stripe.com/REPLACE_ME_4",
  },
  {
    id: "Cooker",
    name: "Electric Pressure Cooker",
    price: "£100",
    description: "Electric Pressure Cookers.",
    stripeLink: "https://buy.stripe.com/REPLACE_ME_4",
  },
];