import { useNavigate } from "react-router-dom";
import { PRODUCTS } from "../data/products";
import { ArrowUpRight } from "lucide-react";

const CATEGORIES = [
  {
    name: "Cookware",
    image: "./images/categories/cookware.png",
    filter: "Cookware",
    description: "Pre-seasoned cast iron & steel pans.",
  },
  {
    name: "Utensils",
    image: "./images/categories/utensils.png",
    filter: "Utensils",
    description: "Hand-carved premium wooden spoons.",
  },
  {
    name: "Bakeware",
    image: "./images/categories/bakeware.png",
    filter: "Bakeware",
    description: "Weighted heavy stoneware bowls.",
  },
  {
    name: "Cutlery",
    image: "./images/categories/cutlery.png",
    filter: "Cutlery",
    description: "Full tang carbon-forged knives.",
  },
  {
    name: "Appliances",
    image: "./images/categories/appliances.png",
    filter: "Appliances",
    description: "Fast smart kitchen electricals.",
  },
];

export default function Categories({ onCategoryChange }) {
  const navigate = useNavigate();

  const handleClick = (category) => {
    if (onCategoryChange) {
      onCategoryChange(category.filter);
      document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/shop?category=${encodeURIComponent(category.filter)}`);
    }
  };

  const getCount = (filterName) => {
    return PRODUCTS.filter((p) => p.category === filterName).length;
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
        {CATEGORIES.map((category) => {
          const count = getCount(category.filter);
          return (
            <button
              key={category.name}
              type="button"
              onClick={() => handleClick(category)}
              className="group relative flex h-72 flex-col justify-end overflow-hidden rounded-3xl border border-stone-200 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-lg dark:border-stone-800 dark:bg-stone-900"
            >
              {/* Category Background Image */}
              <div className="absolute inset-0 select-none overflow-hidden">
                <img
                  src={category.image}
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
