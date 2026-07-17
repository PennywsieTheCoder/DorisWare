// src/components/About.jsx
//
// No useState, no useEffect — this component just displays content.
// That's a fine, normal shape for a component to have. Not every
// component needs a hook; most of a real app is components like
// this one.
//
// storyText is a prop so the actual words live in App.jsx (or
// eventually a CMS/data file) rather than being buried inside this
// component — same instinct as pulling PRODUCTS into its own file.

export default function About({ storyText }) {
  return (
    <section id="about" className="max-w-5xl mx-auto px-6 py-16 grid sm:grid-cols-2 gap-10 items-center">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-stone-800 mb-4">
          Why this shop exists
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed">
          {storyText}
        </p>
      </div>

      <div className="bg-stone-50 border border-stone-300 rounded p-6">
        <p className="font-serif italic text-lg text-stone-800">
          "What is Lorem Ipsum?
Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        </p>
      </div>
    </section>
  );
}