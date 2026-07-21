// src/components/FeaturedProducts.jsx

import { ArrowRight } from "lucide-react";
import ProductCard from "./Productcard";
import { PRODUCTS } from "../data/products";

export default function FeaturedProducts({ limit = 4 }) {
  // Prefer products explicitly flagged as featured; otherwise fall back
  // to the first few products in the list.
  const flagged = PRODUCTS.filter((product) => product.featured);
  const featured = (flagged.length > 0 ? flagged : PRODUCTS).slice(0, limit);

  const scrollToShop = () => {
    const shop = document.getElementById("shop");
    if (shop) {
      shop.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      {/* Header row */}
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[3px] text-amber-600">
            Handpicked for you
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-stone-800 md:text-4xl">
            Featured Products
          </h2>
        </div>

        <button
          type="button"
          onClick={scrollToShop}
          className="hidden items-center gap-1 text-sm font-semibold text-amber-600 transition-colors hover:text-amber-700 sm:flex"
        >
          View all
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {featured.map((product) => (
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

      {/* Mobile "view all" */}
      <div className="mt-8 text-center sm:hidden">
        <button
          type="button"
          onClick={scrollToShop}
          className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 transition-colors hover:text-amber-700"
        >
          View all products
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}