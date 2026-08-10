import { useState } from "react";
import { CheckCircle2, Mail, Sparkles } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => {
      setSubscribed(false);
    }, 5000);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 px-6 py-12 text-white shadow-xl sm:px-12 sm:py-16 md:px-16">
        {/* Glow circles */}
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />

        <div className="relative z-1 mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-800/40 border border-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-300">
            <Sparkles size={13} />
            Join the Culinary Club
          </span>

          <h2 className="mt-4 font-serif text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            Get Kitchen Tips & Offers
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-emerald-100/80 sm:text-base">
            Subscribe to receive premium weekly recipes, cookware care tips, and
            an exclusive **10% discount** code on your first order.
          </p>

          <div className="mt-8 flex justify-center">
            {subscribed ? (
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-emerald-900 font-semibold shadow-lg">
                <CheckCircle2 size={20} className="text-emerald-600" />
                <span>Subscription successful! Check your inbox for the 10% code.</span>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:gap-2"
              >
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-200/60" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 py-3.5 pl-12 pr-4 text-white outline-none placeholder:text-emerald-200/40 focus:border-white/30 focus:bg-white/15"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-2xl bg-amber-500 px-6 py-3.5 font-semibold text-stone-950 transition hover:bg-amber-400 active:scale-95"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
