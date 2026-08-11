import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";

export default function Categories({ onCategoryChange }) {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { categories, loading } = useCategories();

  const handleClick = (category) => {
    if (onCategoryChange) {
      onCategoryChange(category.name);
      document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/shop?category=${encodeURIComponent(category.name)}`);
    }
  };

  const getCount = (filterName) => {
    return products.filter((product) => product.category === filterName).length;
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[3px] text-amber-600">
          Curated Collections
        </p>
        <h2 className="mt-2 font-serif text-3xl font-semibold text-stone-850 dark:text-stone-100 md:text-4xl">
          Shop by Category
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-stone-500 dark:text-stone-400">
          Premium essentials designed to endure a lifetime of kitchen experiments.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {loading ? (
          <div className="col-span-full py-10 text-center text-sm text-stone-500 dark:text-stone-400">Loading categories…</div>
        ) : categories.map((category) => {
          const count = getCount(category.name);
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleClick(category)}
              className="group relative flex h-72 flex-col justify-end overflow-hidden rounded-3xl border border-stone-200 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-lg dark:border-stone-800 dark:bg-stone-900"
            >
              {/* Category Background Image */}
              <div className="absolute inset-0 select-none overflow-hidden">
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Visual shade overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
              </div>

              {/* Category Text & Action details */}
              <div className="relative z-1 text-white">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                    {count} {count === 1 ? "Item" : "Items"}
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-md text-amber-300">
                    <ArrowUpRight size={14} />
                  </span>
                </div>
                <h3 className="mt-3 font-serif text-xl font-bold">{category.name}</h3>
                <p className="mt-1 text-[11px] text-stone-300 leading-snug">
                  {category.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
