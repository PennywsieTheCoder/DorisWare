// src/components/ProductCard.jsx

export default function ProductCard({ name, price, description, stripeLink }) {
  return (
    <div className="border border-stone-300 rounded-md p-5 bg-white shadow-sm">
      <h3 className="font-serif text-lg font-semibold text-stone-800">
        {name}
      </h3>
      <p className="text-sm text-stone-500 my-2">{description}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="font-mono text-sm text-amber-800 border border-dashed border-amber-700 px-2 py-1 rounded">
          {price}
        </span>
        <a
          href={stripeLink}
          target="_blank"
          rel="noopener"
          className="text-sm font-semibold px-3 py-2 rounded bg-stone-800 text-white hover:bg-amber-800 transition-colors"
        >
          Buy now
        </a>
      </div>
    </div>
  );
}