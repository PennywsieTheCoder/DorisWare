import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, CookingPot, Headphones, Package, RotateCcw, Send, ShoppingBag, Truck, X } from "lucide-react";
import { useAuth } from "../context/Authcontext";
import { supabase } from "../lib/supabase";

const quickActions = [
  { label: "Shop products", description: "Find cookware and kitchen essentials", icon: ShoppingBag, path: "/shop" },
  { label: "Track my order", description: "View your delivery updates", icon: Package, isOrderAction: true },
  { label: "Delivery & returns", description: "Read our store policies", icon: Truck, path: "/delivery" },
  { label: "Contact DorisWare", description: "Get help from our support team", icon: Headphones, path: "/contact" },
];
const fallbackCategories = ["Cookware", "Utensils", "Bakeware", "Cutlery", "Appliances"];
const assistantPositionKey = "dorisware-assistant-position";
const defaultAssistantPosition = { right: 16, bottom: 20 };

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function replyFor(message, user) {
  const query = message.toLowerCase();
  if (/(track|order|delivery status)/.test(query)) return user
    ? { text: "You can see delivery updates and tracking details from your account.", action: { label: "Open my orders", path: "/profile", state: { tab: "orders" } } }
    : { text: "Please sign in first so we can show only your own orders and delivery updates.", action: { label: "Sign in to track an order", path: "/login", state: { from: "/profile" } } };
  if (/(return|refund|exchange)/.test(query)) return { text: "You can read our returns information, or contact us if you need help with a specific order.", action: { label: "View returns", path: "/returns" } };
  if (/(deliver|shipping|arrival)/.test(query)) return { text: "Our delivery information explains available options and timelines.", action: { label: "Delivery information", path: "/delivery" } };
  if (/(contact|whatsapp|phone|email|help)/.test(query)) return { text: "Our support team is ready to help. You can use WhatsApp, call, email, or send a message from our contact page.", action: { label: "Contact DorisWare", path: "/contact" } };
  if (/(product|cookware|pan|knife|shop|buy)/.test(query)) return { text: "Let’s find the right piece for your kitchen. Browse the collection or use the search at the top of the page.", action: { label: "Browse products", path: "/shop" } };
  return { text: "I can help you shop, find delivery and returns information, track an order, or contact the DorisWare team.", action: null };
}

export default function StoreAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [categories, setCategories] = useState(fallbackCategories);
  const [footerOffset, setFooterOffset] = useState(20);
  const [position, setPosition] = useState(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const launcherRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!isOpen) return undefined;
    inputRef.current?.focus();
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnOutsidePress = (event) => {
      if (window.matchMedia("(max-width: 639px)").matches) return;
      if (!panelRef.current?.contains(event.target) && !launcherRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [isOpen]);

  useEffect(() => {
    const keepClearOfFooter = () => {
      const footer = document.getElementById("contact");
      if (!footer) return;
      const footerTop = footer.getBoundingClientRect().top;
      setFooterOffset(Math.max(20, window.innerHeight - footerTop + 16));
    };
    keepClearOfFooter();
    window.addEventListener("scroll", keepClearOfFooter, { passive: true });
    window.addEventListener("resize", keepClearOfFooter);
    return () => {
      window.removeEventListener("scroll", keepClearOfFooter);
      window.removeEventListener("resize", keepClearOfFooter);
    };
  }, []);

  useEffect(() => {
    try {
      const savedPosition = JSON.parse(window.localStorage.getItem(assistantPositionKey));
      if (Number.isFinite(savedPosition?.right) && Number.isFinite(savedPosition?.bottom)) setPosition(savedPosition);
    } catch {
      window.localStorage.removeItem(assistantPositionKey);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    let active = true;
    const loadCategories = async () => {
      const { data, error } = await supabase.from("categories").select("name").eq("is_active", true).order("sort_order");
      if (active && !error && data?.length) setCategories(data.map((category) => category.name));
    };
    loadCategories();
    return () => { active = false; };
  }, [isOpen]);

  function goTo(path, state) {
    setIsOpen(false);
    navigate(path, state ? { state } : undefined);
  }

  function openOrders() {
    if (user) goTo("/profile", { tab: "orders" });
    else goTo("/login", { from: "/profile" });
  }

  function shopCategory(category) {
    goTo(`/shop?category=${encodeURIComponent(category)}`);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const text = query.trim();
    if (!text) return;
    const reply = replyFor(text, user);
    setMessages((current) => [...current, { role: "customer", text }, { role: "assistant", ...reply }]);
    setQuery("");
  }

  function resetPosition() {
    setPosition(null);
    window.localStorage.removeItem(assistantPositionKey);
  }

  function beginDrag(event) {
    if (event.button !== 0) return;
    const currentPosition = position ?? defaultAssistantPosition;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, ...currentPosition, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const nextRight = clamp(drag.right - (event.clientX - drag.startX), 12, Math.max(12, window.innerWidth - 56));
    const nextBottom = clamp(drag.bottom - (event.clientY - drag.startY), 12, Math.max(12, window.innerHeight - 56));
    if (Math.abs(event.clientX - drag.startX) > 4 || Math.abs(event.clientY - drag.startY) > 4) drag.moved = true;
    setPosition({ right: nextRight, bottom: nextBottom });
  }

  function endDrag(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (drag.moved) {
      suppressClickRef.current = true;
      const savedPosition = { right: clamp(drag.right - (event.clientX - drag.startX), 12, Math.max(12, window.innerWidth - 56)), bottom: clamp(drag.bottom - (event.clientY - drag.startY), 12, Math.max(12, window.innerHeight - 56)) };
      window.localStorage.setItem(assistantPositionKey, JSON.stringify(savedPosition));
    }
    dragRef.current = null;
  }

  function toggleAssistant() {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setIsOpen((open) => !open);
  }

  const activePosition = position ?? defaultAssistantPosition;
  const isNearLeftEdge = position && activePosition.right > window.innerWidth / 2;
  const assistantBottom = Math.max(activePosition.bottom, footerOffset);

  return (
    <div className="fixed z-[70] transition-[right,bottom] duration-300" style={{ right: activePosition.right, bottom: assistantBottom }}>
      {isOpen && (
        <section ref={panelRef} id="store-assistant" role="dialog" aria-modal="true" aria-label="DorisWare Kitchen Assistant" style={{ height: `min(620px, calc(100vh - ${assistantBottom + 84}px))` }} className={`absolute bottom-16 flex max-h-[55svh] w-[calc(100vw-3rem)] max-w-[22rem] flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl shadow-stone-950/20 sm:max-h-[620px] sm:max-w-[390px] dark:border-stone-700 dark:bg-stone-900 ${isNearLeftEdge ? "left-0" : "right-0"}`}>
          <header className="flex items-center justify-between bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-amber-300"><CookingPot size={20} strokeWidth={1.8} /><span className="absolute -top-1 h-2 w-px rounded-full bg-amber-200/80" /><span className="absolute -top-0.5 left-4 h-1.5 w-px rounded-full bg-amber-200/60" /></div>
              <div><h2 className="font-serif text-lg font-semibold">Kitchen Assistant</h2><p className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> What are we cooking up?</p></div>
            </div>
            <div className="flex items-center gap-1"><button type="button" onClick={resetPosition} aria-label="Reset assistant position" title="Reset position" className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-300 transition hover:bg-white/10 hover:text-white"><RotateCcw size={16} /></button><button type="button" onClick={() => setIsOpen(false)} aria-label="Close assistant" className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-300 transition hover:bg-white/10 hover:text-white"><X size={19} /></button></div>
          </header>

          <div className="flex-1 overflow-y-auto bg-stone-50/70 p-4 dark:bg-stone-950/40">
            <div className="rounded-2xl rounded-tl-sm bg-white p-4 text-sm leading-6 text-stone-600 shadow-sm dark:bg-stone-800 dark:text-stone-300">
              <p className="font-semibold text-stone-900 dark:text-white">Hello from DorisWare 👋</p>
              <p className="mt-1">I can help you find kitchen essentials, check delivery information, track an order, or reach the team.</p>
            </div>

            <div className="mt-4 grid gap-2">
              {quickActions.map(({ label, description, icon: Icon, path, state, isOrderAction }) => <button key={label} type="button" onClick={() => isOrderAction ? openOrders() : goTo(path, state)} className="group flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 text-left transition hover:border-amber-300 hover:bg-amber-50/60 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-amber-700/70 dark:hover:bg-stone-800"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"><Icon size={17} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-stone-900 dark:text-stone-100">{label}</span><span className="mt-0.5 block truncate text-xs text-stone-500 dark:text-stone-400">{description}</span></span><ChevronRight size={17} className="text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-amber-600 dark:text-stone-600" /></button>)}
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-stone-400 dark:text-stone-500">Shop by category</p>
              <div className="mt-2 flex flex-wrap gap-2">{categories.map((category) => <button key={category} type="button" onClick={() => shopCategory(category)} className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-amber-700 dark:hover:bg-stone-800 dark:hover:text-amber-300">{category}</button>)}</div>
            </div>

            {messages.length > 0 && <div className="mt-4 space-y-3">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={message.role === "customer" ? "ml-8 rounded-2xl rounded-br-sm bg-emerald-700 px-4 py-3 text-sm leading-6 text-white" : "mr-4 rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm leading-6 text-stone-600 shadow-sm dark:bg-stone-800 dark:text-stone-300"}><p>{message.text}</p>{message.action && <button type="button" onClick={() => goTo(message.action.path, message.action.state)} className="mt-2 inline-flex items-center gap-1 font-semibold text-emerald-700 transition hover:text-emerald-800 dark:text-emerald-400"><span>{message.action.label}</span><ChevronRight size={15} /></button>}</div>)}</div>}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900">
            <label className="sr-only" htmlFor="assistant-message">Ask the Kitchen Assistant</label>
            <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 p-1.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 dark:border-stone-700 dark:bg-stone-800 dark:focus-within:ring-emerald-950">
              <input ref={inputRef} id="assistant-message" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ask about products or orders…" className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-sm text-stone-900 outline-none placeholder:text-stone-400 dark:text-stone-100" />
              <button type="submit" disabled={!query.trim()} aria-label="Send message" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"><Send size={16} /></button>
            </div>
          </form>
        </section>
      )}

      <button ref={launcherRef} type="button" onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onClick={toggleAssistant} aria-expanded={isOpen} aria-controls="store-assistant" aria-label={isOpen ? "Close Kitchen Assistant" : "Ask the Kitchen Assistant"} className="group relative flex h-14 touch-none select-none items-center gap-2.5 rounded-full bg-stone-900 px-3.5 text-sm font-semibold text-white shadow-xl shadow-stone-950/25 transition hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0 dark:bg-amber-500 dark:text-stone-950 dark:hover:bg-amber-400">
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-amber-200/25 bg-stone-800 text-amber-300 shadow-inner dark:border-stone-900/10 dark:bg-amber-100 dark:text-stone-900"><CookingPot size={21} strokeWidth={1.8} /><span className="absolute -top-1 h-2.5 w-px rounded-full bg-amber-200 transition group-hover:-translate-y-0.5 dark:bg-stone-700" /><span className="absolute -top-0.5 left-[1.05rem] h-1.5 w-px rounded-full bg-amber-200/70 transition group-hover:-translate-y-0.5 dark:bg-stone-700/70" /></span>
        <span className="hidden sm:inline">Ask the pot</span>
        <span className="absolute right-2 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-stone-900 bg-emerald-400 dark:border-amber-500" />
      </button>
    </div>
  );
}
