// src/components/NewsletterSignup.jsx

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

  if (submitted) {
    return (
      <p className="text-sm text-green-700 font-medium">
        Thanks — you're on the list.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm">
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border border-stone-300 rounded px-3 py-2 text-sm flex-1"
      />
      <button
        type="submit"
        className="bg-stone-800 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-amber-800 transition-colors"
      >
        Sign up
      </button>
    </form>
  );
}