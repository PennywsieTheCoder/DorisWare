// src/pages/ContactPage.jsx
import { Mail, Phone, MessageCircle, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="bg-white dark:bg-stone-950 min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-50 to-white dark:from-stone-900 dark:via-stone-950 dark:to-stone-950" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 dark:bg-stone-800/70 backdrop-blur px-4 py-2 border border-white/50 dark:border-stone-700">
            <MessageCircle size={18} className="text-amber-600" />
            <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
              We usually reply within 24 hours
            </span>
          </div>
          <h1 className="mt-6 font-serif text-5xl md:text-6xl font-bold text-stone-900 dark:text-white leading-tight">
            Let’s Talk About <br /> Your Kitchen Needs
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
            Questions about an order, product recommendations, bulk purchases, or something you can’t find in the shop? A real person reads every message and is happy to help.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <div className="grid md:grid-cols-3 gap-6">
          <ContactCard
            icon={<Mail className="text-amber-600" />}
            title="Email Us"
            value="info@dorisware.com"
            href="mailto:info@dorisware.com"
          />
          <ContactCard
            icon={<Phone className="text-amber-600" />}
            title="Call Us"
            value="+233 20 000 0000"
            href="tel:+233200000000"
          />
          <ContactCard
            icon={<MessageCircle className="text-amber-600" />}
            title="WhatsApp"
            value="Chat with DorisWare"
            href="https://wa.me/233200000000"
          />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3">
            <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl p-8 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Send className="text-amber-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Send us a message</h2>
                  <p className="text-stone-600 dark:text-stone-400">We’d love to hear from you.</p>
                </div>
              </div>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="First name" placeholder="Isaac" />
                  <Field label="Last name" placeholder="Owusu" />
                </div>
                <Field label="Email address" type="email" placeholder="you@example.com" />
                <Field label="Phone number" type="tel" placeholder="+233 20 000 0000" />
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Subject</label>
                  <select className="w-full rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-3 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option>Order question</option>
                    <option>Product recommendation</option>
                    <option>Bulk / wholesale inquiry</option>
                    <option>Delivery issue</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Message</label>
                  <textarea
                    rows={6}
                    placeholder="Tell us how we can help..."
                    className="w-full rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-3 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-4 font-semibold text-white hover:bg-amber-600 transition-all duration-300 shadow-lg shadow-amber-500/25"
                >
                  <Send size={18} /> Send Message
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-stone-900 to-stone-800 text-white p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-4">Why contact DorisWare?</h3>
              <ul className="space-y-4 text-stone-300">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" /> Get help choosing the right cookware
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" /> Track or update your order
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" /> Request items not currently listed
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" /> Ask about bulk or wholesale purchases
                </li>
              </ul>
            </div>

            <div className="rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="text-amber-600" />
                <h3 className="text-xl font-semibold text-stone-900 dark:text-white">Location</h3>
              </div>
              <p className="text-stone-600 dark:text-stone-400 leading-7">
                Accra, Greater Accra <br /> Ghana
              </p>
              <div className="mt-6 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700">
                <div className="h-48 bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400">
                  Map placeholder
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-8">
              <h3 className="text-xl font-semibold text-stone-900 dark:text-white mb-3">Customer support hours</h3>
              <div className="space-y-2 text-stone-700 dark:text-stone-300">
                <div className="flex justify-between">
                  <span>Mon – Fri</span>
                  <span>8:00 AM – 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>9:00 AM – 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactCard({ icon, title, value, href }) {
  return (
    <a href={href} className="group rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur border border-white/50 dark:border-stone-800 p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300" > <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"> {icon} </div> <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-white"> {title} </h3> <p className="mt-2 text-stone-600 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors"> {value} </p> </a> ); } function Field({ label, type = "text", placeholder }) { return ( <div> <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2"> {label} </label> <input type={type} placeholder={placeholder} className="w-full rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-3 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500" /> </div> ); }