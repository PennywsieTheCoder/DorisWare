// src/pages/ShopPage.jsx

import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import ProductCard from "../components/Productcard";
import Filters from "../components/Filters";
import NewsletterSignup from "../components/Signup";
import { PRODUCTS } from "../data/products";

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "All";
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const updateFilterParam = (name, value) => {
    const nextParams = new URLSearchParams(searchParams);

    if (!value || (name === "category" && value === "All")) {
      nextParams.delete(name);
    } else {
      nextParams.set(name, value);
    }

    setSearchParams(nextParams);
  };

  const categories = [
    "All",
    ...Array.from(
      new Set(PRODUCTS.map((product) => product.category))
    ).sort(),
  ];

  const filtered = PRODUCTS.filter((product) => {
    const normalizedQuery = query.toLowerCase();
    const searchMatches =
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.category.toLowerCase().includes(normalizedQuery);

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
        onCategoryChange={(value) => updateFilterParam("category", value)}
      />

      <section
        id="shop"
        className="max-w-6xl mx-auto px-6 py-16"
      >
        <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-serif text-2xl font-semibold text-stone-800 dark:text-stone-100 sm:text-3xl">
            Shop All Products
          </h2>
          <Filters
            category={category}
            categories={categories}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onCategoryChange={(value) => updateFilterParam("category", value)}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
          />
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-3 lg:gap-7">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-stone-200 dark:border-stone-800">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="mb-3 font-serif text-2xl font-semibold text-stone-800 dark:text-stone-100">
            Stay in the Loop
          </h2>

          <p className="mb-6 text-stone-500 dark:text-stone-300">
            Be the first to hear about new arrivals,
            special offers, and exclusive kitchen tips.
          </p>

          <NewsletterSignup />
        </div>
      </section>
    </>
  );
}
