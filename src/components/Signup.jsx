// src/components/NewsletterSignup.jsx
//
// This component now owns its OWN section wrapper, heading, and
// copy — not just the bare form. That means HomePage.jsx just
// renders <NewsletterSignup /> on its own, with nothing wrapped
// around it, and gets the whole finished section.

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    console.log("Would sign up:", email);
    setSubmitted(true);
  }

  return (
    <section className="border-t border-stone-200 dark:border-stone-800">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="mb-3 font-serif text-2xl font-semibold text-stone-800 dark:text-stone-100">
          Stay in the Loop
        </h2>

        <p className="mb-6 text-stone-500 dark:text-stone-300">
          Be the first to hear about new arrivals, special offers,
          and exclusive kitchen tips.
        </p>

        {submitted ? (
          <p className="text-sm text-green-700 dark:text-green-400 font-medium">
            Thanks — you're on the list.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 rounded px-3 py-2 text-sm flex-1 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500"
            />
            <button
              type="submit"
              className="bg-stone-800 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-amber-800 transition-colors dark:bg-amber-500 dark:text-stone-950 dark:hover:bg-amber-400"
            >
              Sign up
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
