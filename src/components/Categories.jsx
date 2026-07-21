// src/components/Categories.jsx

const CATEGORIES = [
  {
    name: "Cookware",
    image: "./images/categories/cookware.png",
    filter: "Cookware",
  },
  {
    name: "Utensils",
    image: "./images/categories/utensils.png",
    filter: "Utensils",
  },
  {
    name: "Bakeware",
    image: "./images/categories/bakeware.png",
    filter: "Bakeware",
  },
  {
    name: "Cutlery",
    image: "./images/categories/cutlery.png",
    filter: "Cutlery",
  },
  {
    name: "Appliances",
    image: "./images/categories/appliances.png",
    filter: "Appliances",
  },
];

export default function Categories({ onCategoryChange }) {
  const handleClick = (category) => {
    if (onCategoryChange) {
      onCategoryChange(category.filter);
    }

    const shop = document.getElementById("shop");

    if (shop) {
      shop.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 text-center">
        <p className="font-mono text-xs uppercase tracking-[3px] text-amber-600">
          Shop by category
        </p>

        <h2 className="mt-2 font-serif text-3xl font-semibold text-stone-800 md:text-4xl">
          Featured Categories
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
        {CATEGORIES.map((category) => (
          <button
            key={category.name}
            type="button"
            onClick={() => handleClick(category)}
            className="group flex flex-col items-center focus:outline-none"
          >
            <div className="relative h-28 w-28 overflow-hidden rounded-full ring-2 ring-stone-100 transition-all duration-300 group-hover:ring-amber-400 group-hover:shadow-lg md:h-32 md:w-32">

              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />

            </div>

            <h3 className="mt-4 text-center text-sm font-semibold text-stone-700 transition-colors group-hover:text-amber-600 md:text-base">
              {category.name}
            </h3>
          </button>
        ))}
      </div>
    </section>
  );
}