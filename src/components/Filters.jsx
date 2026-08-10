import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

export default function Filters({
  category,
  categories,
  minPrice,
  maxPrice,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters = category !== "All" || minPrice !== "" || maxPrice !== "";

  function clearFilters() {
    onCategoryChange("All");
    onMinPriceChange("");
    onMaxPriceChange("");
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm transition hover:border-amber-400 hover:text-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
        aria-label="Filter products"
        aria-expanded={isOpen}
      >
        <SlidersHorizontal size={19} />
        {hasActiveFilters && (
          <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-stone-900" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-14 z-20 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-stone-200 bg-white p-4 shadow-xl dark:border-stone-700 dark:bg-stone-900 sm:p-5">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">Filter products</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-stone-400 transition hover:text-stone-700 dark:hover:text-stone-100"
              aria-label="Close filters"
            >
              <X size={18} />
            </button>
          </div>

          <label className="mb-4 block text-sm font-medium text-stone-700 dark:text-stone-200">
            Category
            <select
              value={category}
              onChange={(event) => onCategoryChange(event.target.value)}
              className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            >
              <option value="All">All categories</option>
              {categories.filter((option) => option !== "All").map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
              Min price
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(event) => onMinPriceChange(event.target.value)}
                placeholder="₵0"
                className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500"
              />
            </label>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
              Max price
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(event) => onMaxPriceChange(event.target.value)}
                placeholder="Any"
                className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500"
              />
            </label>
          </div>

          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className="mt-5 text-sm font-medium text-amber-600 hover:text-amber-700">
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
