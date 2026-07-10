// src/App.jsx
//
// ============================================================
// LESSON 6b: App.jsx as pure composition
// ============================================================
//
// Notice what's LEFT here: almost nothing. App's whole job now is
// importing the pieces and arranging them. This is a healthy shape
// for a root component — it "orchestrates" rather than "does".
//
// Import paths starting with "./" mean "relative to this file".
// "./components/Header" -> look in the components folder, sitting
// next to this file, for a file named Header (.jsx is assumed).

import Header from "./components/Header";
import ProductCard from "./components/ProductCard";
import { PRODUCTS } from "./data/products";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header storeName="The Kitchen Table" />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="font-serif text-2xl font-semibold text-stone-800 mb-6">
          The Collection
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={product.price}
              description={product.description}
              stripeLink={product.stripeLink}
            />
          ))}
        </div>
      </div>
    </div>
  );
}