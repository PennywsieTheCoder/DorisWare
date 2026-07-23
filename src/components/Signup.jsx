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
          <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full flex-1 rounded border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500"
            />
            <button
              type="submit"
              className="w-full rounded bg-stone-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-800 dark:bg-amber-500 dark:text-stone-950 dark:hover:bg-amber-400 sm:w-auto"
            >
              Sign up
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
