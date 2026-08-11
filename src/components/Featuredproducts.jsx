import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "./Productcard";
import { useProducts } from "../hooks/useProducts";

export default function FeaturedProducts({ limit = 6 }) {
  const [selectedTab, setSelectedTab] = useState("All");
  const { products, loading } = useProducts();

  const filterCategories = ["All", "Cookware", "Utensils", "Bakeware", "Cutlery", "Appliances"];

  // Filter based on active tab
  const filteredProducts = products.filter((product) => {
    if (!product.featured) return false;
    if (selectedTab === "All") return true;
    return product.category === selectedTab;
  });

  const featured = filteredProducts.slice(0, limit);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      {/* Header row */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            <Sparkles size={13} />
            <span>Handpicked for you</span>
          </div>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-stone-850 dark:text-stone-100 md:text-4xl">
            Featured Products
          </h2>
        </div>

        <Link
          to="/shop"
          className="hidden items-center gap-1.5 text-sm font-bold text-amber-600 transition-colors hover:text-amber-700 sm:flex"
        >
          View all collection
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Tab Selectors */}
      <div className="no-scrollbar mb-8 flex overflow-x-auto gap-2 border-b border-stone-200 pb-3 dark:border-stone-800">
        {filterCategories.map((cat) => {
          const isActive = selectedTab === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedTab(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition shrink-0 ${
                isActive
                  ? "bg-amber-500 text-stone-950 shadow-md font-bold"
                  : "bg-white text-stone-600 hover:bg-stone-50 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="rounded-3xl border border-dashed border-stone-300 p-12 text-center text-sm text-stone-500 dark:border-stone-800 dark:text-stone-400">Loading products…</div>
      ) : featured.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              originalPrice={product.originalPrice}
              discountPercent={product.discountPercent}
              ratingAverage={product.ratingAverage}
              reviewCount={product.reviewCount}
              description={product.description}
              stripeLink={product.stripeLink}
              quantity={product.quantity}
              images={product.images}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-stone-300 p-12 text-center dark:border-stone-800">
          <p className="text-stone-500 dark:text-stone-400 text-sm">
            No products match this category selection right now.
          </p>
          <Link
            to="/shop"
            className="mt-4 inline-block rounded-2xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-stone-900"
          >
            Explore Full Shop
          </Link>
        </div>
      )}

      {/* Mobile "view all" */}
      <div className="mt-8 text-center sm:hidden">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 transition-colors hover:text-amber-700"
        >
          View all products
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
