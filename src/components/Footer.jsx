// src/components/Footer.jsx
//
// Static content again, no state — same as About. contactEmail is a
// prop so it's easy to change without digging into this file later.

export default function Footer({ storeName, contactEmail }) {
  return (
    <footer id="contact" className="bg-stone-900 text-stone-200 px-6 py-10 mt-16">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between gap-6">
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

        <div className="text-sm text-stone-500 sm:text-right">
          <p>Payments handled securely by Stripe.</p>
          <p>© {new Date().getFullYear()} {storeName}.</p>
        </div>
      </div>
    </footer>
  );
}