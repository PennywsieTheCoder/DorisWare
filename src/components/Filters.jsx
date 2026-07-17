export default function Filters({
  query,
  onChange,
  category,
  categories,
  minPrice,
  maxPrice,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
}) {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
        <div className="sm:col-span-5">
          <label className="block text-sm font-medium text-stone-700 mb-2" htmlFor="search">
            Search
          </label>
          <input
            id="search"
            type="text"
            value={query}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search items..."
            className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-700"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="block text-sm font-medium text-stone-700 mb-2" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
          >
            <option value="All">All categories</option>
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-stone-700 mb-2" htmlFor="minPrice">
            Min price
          </label>
          <input
            id="minPrice"
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            placeholder="0"
            className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-stone-700 mb-2" htmlFor="maxPrice">
            Max price
          </label>
          <input
            id="maxPrice"
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            placeholder="Any"
            className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
          />
        </div>
      </div>
    </div>
  );
}
