// src/pages/ShopPage.jsx

import { useState } from "react";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import ProductCard from "../components/Productcard";
import Filters from "../components/Filters";
import NewsletterSignup from "../components/Signup";
import { PRODUCTS } from "../data/products";

export default function ShopPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const categories = [
    "All",
    ...Array.from(
      new Set(PRODUCTS.map((product) => product.category))
    ).sort(),
  ];

  const filtered = PRODUCTS.filter((product) => {
    const searchMatches = product.name
      .toLowerCase()
      .includes(query.toLowerCase());

    const categoryMatches =
      category === "All" || product.category === category;

    const priceValue = Number(
      product.price.replace(/[^0-9.]/g, "")
    );

    const minValue =
      minPrice !== "" ? Number(minPrice) : 0;

    const maxValue =
      maxPrice !== "" ? Number(maxPrice) : Infinity;

    const priceMatches =
      priceValue >= minValue &&
      priceValue <= maxValue;

    return (
      searchMatches &&
      categoryMatches &&
      priceMatches
    );
  });

  return (
    <>
      <Hero />

      <Categories
        onCategoryChange={setCategory}
      />

      <section
        id="shop"
        className="max-w-6xl mx-auto px-6 py-16"
      >
        <Filters
          query={query}
          onChange={setQuery}
          category={category}
          categories={categories}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onCategoryChange={setCategory}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
        />

        <h2 className="mb-8 font-serif text-3xl font-semibold text-stone-800">
          Shop All Products
        </h2>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-stone-200">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="mb-3 font-serif text-2xl font-semibold text-stone-800">
            Stay in the Loop
          </h2>

          <p className="mb-6 text-stone-500">
            Be the first to hear about new arrivals,
            special offers, and exclusive kitchen tips.
          </p>

          <NewsletterSignup />
        </div>
      </section>
    </>
  );
}