// src/components/Footer.jsx

import { Link } from "react-router-dom";
import {
  SiFacebook,
  SiInstagram,
  SiX,
  SiTiktok,
  SiPinterest,
  SiVisa,
  SiMastercard,
} from "@icons-pack/react-simple-icons";
import { useState } from "react";

function PaymentBadge({ children }) {
  return (
    <div className="w-11 h-8 bg-white rounded flex items-center justify-center px-1.5 dark:bg-stone-100">
      {children}
    </div>
  );
}

function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <div>
      <p className="mb-2 font-serif text-lg font-semibold text-white">
        Stay in the Loop
      </p>
      <p className="mb-3 text-sm leading-relaxed text-stone-400">
        Get new arrivals and special offers in your inbox.
      </p>
      {submitted ? (
        <p className="text-sm font-medium text-green-400">Thanks — you&apos;re on the list.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            aria-label="Email address"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-stone-950 transition-colors hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            Sign up
          </button>
        </form>
      )}
    </div>
  );
}

export default function Footer({ storeName }) {
  return (
    <footer id="contact" className="bg-stone-900 px-4 py-10 text-stone-200 sm:px-6">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-[1.1fr_0.9fr_0.9fr_1.1fr] xl:gap-8">

        {/* Column 1: About DorisWare — new */}
        <div>
          <p className="font-serif text-lg font-semibold text-white mb-2">
            About {storeName}
          </p>
          <p className="text-sm text-stone-400 max-w-xs mb-3">
            Kitchenware chosen and used at home first, sold second.
          </p>
          <nav className="flex flex-col gap-1.5 text-sm">
            <Link
              to="/about"
              className="text-stone-400 hover:text-amber-500 transition-colors"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="text-stone-400 hover:text-amber-500 transition-colors"
            >
              Contact Us
            </Link>
            <Link to="/delivery" className="text-stone-400 hover:text-amber-500 transition-colors">Delivery information</Link>
            <Link to="/returns" className="text-stone-400 hover:text-amber-500 transition-colors">Returns & refunds</Link>
          </nav>
        </div>

        {/* Column 2: socials */}
        <div>
          <p className="font-serif text-lg font-semibold text-white mb-2">
            Stay Connected
          </p>
          <div className="flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook" className="text-stone-400 hover:text-white transition-colors">
              <SiFacebook size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram" className="text-stone-400 hover:text-white transition-colors">
              <SiInstagram size={20} />
            </a>
            <a href="https://x.com" target="_blank" rel="noopener" aria-label="X" className="text-stone-400 hover:text-white transition-colors">
              <SiX size={20} />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener" aria-label="Tiktok" className="text-stone-400 hover:text-white transition-colors">
              <SiTiktok size={20} />
            </a>
            <a href="https://pinterest.com" target="_blank" rel="noopener" aria-label="Pinterest" className="text-stone-400 hover:text-white transition-colors">
              <SiPinterest size={20} />
            </a>
          </div>
        </div>

        {/* Column 3: payments + legal */}
        <div className="text-sm text-stone-500 lg:text-right">
          <p className="font-serif text-lg font-semibold text-white mb-2">
            We Accept
          </p>
          <div className="mb-3 flex items-center gap-2 lg:justify-end">
            <PaymentBadge>
              <SiVisa size={22} className="text-blue-500" />
            </PaymentBadge>
            <PaymentBadge>
              <SiMastercard size={22} className="text-stone-900" />
            </PaymentBadge>
            <PaymentBadge>
              <img
                src={`${import.meta.env.BASE_URL}/mobile-money.png`}
                alt="Mobile Money"
                className="max-h-5 max-w-full object-contain"
              />
            </PaymentBadge>
          </div>
          <p>Payments handled securely by Stripe.</p>
          <div className="mt-2 flex gap-3 lg:justify-end">
            <Link to="/privacy" className="hover:text-amber-500">Privacy</Link>
            <Link to="/terms" className="hover:text-amber-500">Terms</Link>
          </div>
          <p>© {new Date().getFullYear()} {storeName}.</p>
        </div>

        {/* Column 4: newsletter */}
        <FooterNewsletter />
      </div>
    </footer>
  );
}
