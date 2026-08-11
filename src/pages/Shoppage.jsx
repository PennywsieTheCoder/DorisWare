// src/pages/ShopPage.jsx

import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Categories from "../components/Categories";
import ProductCard from "../components/Productcard";
import Filters from "../components/Filters";
import { useProducts } from "../hooks/useProducts";

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "All";
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const { products, loading, error, hasMore } = useProducts({ limit: visibleCount, category, search: query, minPrice, maxPrice });

  const updateFilterParam = (name, value) => {
    setVisibleCount(12);
    const nextParams = new URLSearchParams(searchParams);

    if (!value || (name === "category" && value === "All")) {
      nextParams.delete(name);
    } else {
      nextParams.set(name, value);
    }

    setSearchParams(nextParams);
  };

  const categories = ["All", "Cookware", "Utensils", "Bakeware", "Cutlery", "Appliances"];

  const filtered = products.filter((product) => {
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
            onMinPriceChange={(value) => { setVisibleCount(12); setMinPrice(value); }}
            onMaxPriceChange={(value) => { setVisibleCount(12); setMaxPrice(value); }}
          />
        </div>

        {loading ? (
          <div className="rounded-3xl border border-dashed border-stone-300 px-6 py-16 text-center text-stone-500 dark:border-stone-700 dark:text-stone-400">Loading products…</div>
        ) : error ? (
          <div className="rounded-3xl border border-dashed border-red-300 px-6 py-16 text-center text-red-600 dark:border-red-900 dark:text-red-400">Products could not load. Please refresh and try again.</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 px-6 py-16 text-center dark:border-stone-700">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">No products found</h3>
            <p className="mt-2 text-stone-500 dark:text-stone-400">Try a different search, category, or price range.</p>
            <button type="button" onClick={() => { setMinPrice(""); setMaxPrice(""); setSearchParams({}); }} className="mt-5 rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white dark:bg-amber-500 dark:text-stone-950">Clear filters</button>
          </div>
        ) : <><div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-3 lg:gap-7">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
            />
          ))}
        </div>{hasMore && <div className="mt-10 text-center"><button type="button" onClick={() => setVisibleCount((count) => count + 12)} className="rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-green-600 hover:text-green-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200">Load 12 more products</button></div>}</>}
      </section>

      {/* <section className="border-t border-stone-200 dark:border-stone-800">
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
      </section> */}
    </>
  );
}
