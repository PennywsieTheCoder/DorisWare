// src/components/Footer.jsx
//
// PaymentBadge normalizes anything passed into it — an icon
// component or a plain image — into the same-sized, same-styled
// little box. This is the same instinct as the ProductCard image
// wrapper: put a fixed-size, consistently-styled CONTAINER around
// content whose natural size/format varies, rather than trying to
// make the content itself uniform.

import {
  SiFacebook,
  SiInstagram,
  SiX,
  SiTiktok,
  SiPinterest,
  SiVisa,
  SiMastercard,
} from "@icons-pack/react-simple-icons";

function PaymentBadge({ children }) {
  return (
    <div className="w-11 h-8 bg-white rounded flex items-center justify-center px-1.5 dark:bg-stone-100">
      {children}
    </div>
  );
}

export default function Footer({ storeName, contactEmail }) {
  return (
    <footer id="contact" className="bg-stone-900 text-stone-200 px-6 py-10 mt-16">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between gap-8">

        {/* Column 1: brand + contact */}
        <div>
          <p className="font-serif text-lg font-semibold text-white mb-2">
            {storeName}
          </p>
          <p className="text-sm text-stone-400 max-w-sm mb-2">
            Questions about an order, or want something not listed? Send a message.
          </p>
          <a
            href={`mailto:${contactEmail}`}
            className="text-sm text-amber-500 border-b border-amber-500"
          >
            {contactEmail}
          </a>
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
        <div className="text-sm text-stone-500 sm:text-right">
          <p className="font-serif text-lg font-semibold text-white mb-2">
            We Accept
          </p>
          <div className="flex items-center gap-2 sm:justify-end mb-3">
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
          <p>© {new Date().getFullYear()} {storeName}.</p>
        </div>

      </div>
    </footer>
  );
}
