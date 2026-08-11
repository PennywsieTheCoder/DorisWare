import { useNavigate } from "react-router-dom";
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
    <section className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
      <div className="mb-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[3px] text-amber-600">
          Curated Collections
        </p>
        <h2 className="mt-2 font-serif text-2xl font-semibold text-stone-850 dark:text-stone-100 md:text-3xl">
          Shop by Category
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-5 sm:gap-x-5">
        {loading ? (
          <div className="col-span-full py-10 text-center text-sm text-stone-500 dark:text-stone-400">Loading categories…</div>
        ) : categories.map((category) => {
          const count = getCount(category.name);
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleClick(category)}
              className="group flex min-w-0 flex-col items-center text-center"
            >
              <span className="relative block h-24 w-24 overflow-hidden rounded-full border-2 border-white bg-stone-100 shadow-md ring-1 ring-stone-200 transition duration-300 group-hover:-translate-y-1 group-hover:scale-105 group-hover:ring-amber-400 dark:bg-stone-800 dark:ring-stone-700 sm:h-28 sm:w-28">
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-stone-900 transition group-hover:text-amber-700 dark:text-stone-100 dark:group-hover:text-amber-400">{category.name}</h3>
              <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">{count} {count === 1 ? "item" : "items"}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
