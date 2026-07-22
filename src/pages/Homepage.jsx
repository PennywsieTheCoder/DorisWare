// src/pages/HomePage.jsx

import { useState } from "react";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import FeaturedProducts from "../components/Featuredproducts";
import ProductCard from "../components/Productcard";
import Filters from "../components/Filters";
import PromoBanner from "../components/Promobanner";
import About from "../components/About";
import NewsletterSignup from "../components/Signup";
import { PRODUCTS } from "../data/products";
import WhyChooseUs from "../components/Whychooseus";
import Testimonials from "../components/Testimonials";


export default function HomePage() {
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

    const minValue = minPrice !== "" ? Number(minPrice) : 0;
    const maxValue = maxPrice !== "" ? Number(maxPrice) : Infinity;

    const priceMatches =
      priceValue >= minValue && priceValue <= maxValue;

    return searchMatches && categoryMatches && priceMatches;
  });

  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Featured Categories */}
      <Categories onCategoryChange={setCategory} />

      {/* Featured Products */}
      <FeaturedProducts limit={4} />

      {/* Shop Section */}
      {/* <section id="shop" className="max-w-5xl mx-auto px-6 py-16">
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

        <h2 className="mb-6 font-serif text-3xl font-semibold text-stone-800">
          Our Collection
        </h2>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
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
        ) : (
          <div className="rounded-lg border border-stone-200 bg-stone-50 py-12 text-center">
            <p className="text-stone-500">
              No products match your search.
            </p>
          </div>
        )}
      </section> */}

      {/* Promo / Sale Banner */}
      <PromoBanner />
      <WhyChooseUs />
      <Testimonials />

      {/* About Section */}
      <section id="about">
        <About
          storyText="At DorisWare, we believe every home deserves quality kitchenware that lasts. From durable cookware to practical utensils and household essentials, each item is carefully selected to make everyday cooking easier, more enjoyable, and affordable."
        />
      </section>

      {/* Newsletter */}
      <NewsletterSignup />
      {/* <section className="border-t border-stone-200">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="mb-3 font-serif text-2xl font-semibold text-stone-800">
            Stay in the Loop
          </h2>

          <p className="mb-6 text-stone-500">
            Be the first to hear about new arrivals, special offers,
            and exclusive kitchen tips.
          </p>

          <NewsletterSignup />
        </div>
      </section> */}
    </>
  );
}