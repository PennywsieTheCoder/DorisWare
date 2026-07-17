// src/pages/HomePage.jsx

import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import Filters from "../components/Filters";
import About from "../components/About";
import NewsletterSignup from "../components/Signup";
import { PRODUCTS } from "../data/products";

function FeaturedProduct() {
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFeatured(PRODUCTS[0]);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-stone-400 font-mono">
        Loading featured product...
      </div>
    );
  }

  return (
    <div className="mb-8">
      <p className="font-mono text-xs uppercase tracking-wide text-emerald-700 mb-2">
        Featured this week
      </p>
      <div className="max-w-xs">
        <ProductCard
          id={featured.id}
          name={featured.name}
          price={featured.price}
          description={featured.description}
          stripeLink={featured.stripeLink}
          quantity={featured.quantity}
          images={featured.images}
        />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const categories = Array.from(new Set(PRODUCTS.map((product) => product.category))).sort();

  const filtered = PRODUCTS.filter((product) => {
    const searchMatches = product.name.toLowerCase().includes(query.toLowerCase());
    const categoryMatches = category === "All" || product.category === category;
    const priceValue = Number(product.price.replace(/[^0-9.]/g, ""));
    const minValue = minPrice !== "" ? Number(minPrice) : 0;
    const maxValue = maxPrice !== "" ? Number(maxPrice) : Infinity;
    const priceMatches = priceValue >= minValue && priceValue <= maxValue;

    return searchMatches && categoryMatches && priceMatches;
  });

  return (
    <>
      <div id="shop" className="max-w-5xl mx-auto px-6 py-10">
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

        <h2 className="font-serif text-2xl font-semibold text-stone-800 mb-6">
          Our Collection
        </h2>

        <FeaturedProduct />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              description={product.description}
              stripeLink={product.stripeLink}
              quantity={product.quantity}
              images={product.images}
            />
          ))}
        </div>
      </div>

      <About storyText="Replace this with your mum's real story — how she started, what she looks for in a good kitchen tool, why she picked these particular items. A short, honest paragraph works better than a long one." />

      <div className="max-w-5xl mx-auto px-6 pb-16 border-t border-stone-200 pt-10">
        <h2 className="font-serif text-xl font-semibold text-stone-800 mb-3">
          Stay in the loop
        </h2>
        <p className="text-sm text-stone-500 mb-4">
          New stock, restocks, and the odd offcut of good advice.
        </p>
        <NewsletterSignup />
      </div>
    </>
  );
}