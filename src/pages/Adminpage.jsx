import { useEffect, useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { BarChart3, Box, CheckCircle2, ClipboardList, Package, Pencil, Plus, RefreshCw, Settings2, ShoppingBag } from "lucide-react";
import { useAuth } from "../context/Authcontext";
import { supabase } from "../lib/supabase";

const orderStatuses = ["processing", "shipped", "delivered", "cancelled"];

const statusClass = {
  pending_payment: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  paid: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  processing: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  shipped: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  delivered: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300",
  cancelled: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
};

const formatStatus = (value) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatMoney = (value) => `₵${Number(value).toFixed(2)}`;
const toLocalDateTimeInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function AdminPage() {
  const { user, authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [editingDeliveryZone, setEditingDeliveryZone] = useState(null);
  const [promoBanner, setPromoBanner] = useState(null);
  const [aboutContent, setAboutContent] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [supportMessages, setSupportMessages] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [reportRange, setReportRange] = useState(30);
  const [activeSection, setActiveSection] = useState("overview");
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", category: "Cookware", description: "", price: "", stock: "0", featured: false });
  const [productImage, setProductImage] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [replacementImage, setReplacementImage] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [replacementCategoryImage, setReplacementCategoryImage] = useState(null);
  const [promoImage, setPromoImage] = useState(null);
  const [aboutImage, setAboutImage] = useState(null);

  const metrics = useMemo(() => ({
    revenue: orders.filter((order) => order.payment_status === "paid").reduce((sum, order) => sum + Number(order.total), 0),
    paidOrders: orders.filter((order) => order.payment_status === "paid").length,
    lowStock: products.filter((product) => product.stock_quantity > 0 && product.stock_quantity < 5).length,
    outOfStock: products.filter((product) => product.stock_quantity === 0).length,
  }), [orders, products]);

  const report = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - reportRange + 1); cutoff.setHours(0, 0, 0, 0);
    const paidOrders = orders.filter((order) => order.payment_status === "paid" && new Date(order.created_at) >= cutoff);
    const revenue = paidOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const daily = Array.from({ length: reportRange }, (_, index) => {
      const day = new Date(cutoff); day.setDate(cutoff.getDate() + index);
      const key = day.toISOString().slice(0, 10);
      return { key, label: day.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), value: paidOrders.filter((order) => order.created_at.slice(0, 10) === key).reduce((sum, order) => sum + Number(order.total), 0) };
    });
    const productsSold = {};
    paidOrders.forEach((order) => order.order_items?.forEach((item) => { productsSold[item.product_name] = (productsSold[item.product_name] ?? 0) + Number(item.quantity); }));
    return { paidOrders, revenue, average: paidOrders.length ? revenue / paidOrders.length : 0, customerArranged: paidOrders.filter((order) => order.delivery_method === "customer_arranged").length, daily, topProducts: Object.entries(productsSold).sort(([, a], [, b]) => b - a).slice(0, 4) };
  }, [orders, reportRange]);

  async function loadDashboard() {
    setLoading(true);
    setError("");
    const [productsResult, categoriesResult, zonesResult, bannerResult, ordersResult, reviewsResult, aboutResult, messagesResult, subscribersResult] = await Promise.all([
      supabase.from("products").select("id, name, category, description, price, stock_quantity, image_url, featured, is_active").order("created_at"),
      supabase.from("categories").select("id, name, description, image_url, sort_order, is_active").order("sort_order"),
      supabase.from("delivery_zones").select("id, name, regions, shipping_fee, estimated_delivery, is_active, sort_order").order("sort_order"),
      supabase.from("promo_banners").select("id, eyebrow, title, highlight, description, cta_label, cta_path, image_url, is_active, ends_at, discount_percent, discount_scope, discount_categories").order("sort_order").limit(1).maybeSingle(),
      supabase.from("orders").select("id, order_number, contact_email, contact_phone, shipping_address, total, status, payment_status, payment_method, delivery_method, tracking_number, estimated_delivery_at, fulfilment_note, created_at, order_items(product_name, quantity)").order("created_at", { ascending: false }).limit(250),
      supabase.from("product_reviews").select("id, product_id, user_id, rating, title, body, is_visible, created_at").order("created_at", { ascending: false }),
      supabase.from("about_content").select("id, eyebrow, title, description, image_url, is_active").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("support_messages").select("id, first_name, last_name, email, phone, subject, message, status, created_at").order("created_at", { ascending: false }).limit(100),
      supabase.from("newsletter_subscribers").select("id, email, status, created_at").order("created_at", { ascending: false }).limit(100),
    ]);

    if (productsResult.error || categoriesResult.error || zonesResult.error || bannerResult.error || ordersResult.error || reviewsResult.error || aboutResult.error || messagesResult.error || subscribersResult.error) {
      setError("The dashboard data could not load. Confirm this account has the admin role, then refresh.");
    } else {
      setProducts(productsResult.data);
      setCategories(categoriesResult.data);
      setDeliveryZones(zonesResult.data);
      setPromoBanner(bannerResult.data ? { ...bannerResult.data, ends_at: toLocalDateTimeInput(bannerResult.data.ends_at) } : null);
      setOrders(ordersResult.data);
      setReviews(reviewsResult.data);
      setAboutContent(aboutResult.data);
      setSupportMessages(messagesResult.data);
      setSubscribers(subscribersResult.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (user?.role === "admin") queueMicrotask(loadDashboard);
  }, [user?.role]);

  useEffect(() => {
    const headingsBySection = {
      products: ["Add a product", "Products & inventory", "Category cards"],
      orders: ["Tracking & delivery details", "Review moderation", "Recent orders"],
      delivery: ["Delivery zones"],
      promotions: ["Promo banner", "About page"],
      inbox: ["Customer inbox"],
    };
    const managedSections = Object.values(headingsBySection).flat().map((heading) => [...document.querySelectorAll("h2")].find((element) => element.textContent === heading)?.closest("section")).filter(Boolean);
    document.querySelectorAll("section.border-green-200, section.border-amber-200").forEach((section) => managedSections.push(section));
    managedSections.forEach((section) => { section.hidden = activeSection === "overview" || !headingsBySection[activeSection]?.some((heading) => section.querySelector("h2")?.textContent === heading) && !((activeSection === "products") && (section.classList.contains("border-green-200") || section.classList.contains("border-amber-200"))); });
  }, [activeSection, editingProduct, editingCategory, promoBanner, aboutContent, supportMessages]);

  async function updateProduct(productId, updates) {
    setSavingId(productId);
    const { error: updateError } = await supabase.from("products").update(updates).eq("id", productId);
    if (updateError) setError("Product update failed. Please try again.");
    else setProducts((current) => current.map((product) => product.id === productId ? { ...product, ...updates } : product));
    setSavingId("");
  }

  async function updateOrderStatus(orderId, status) {
    setSavingId(orderId);
    const { error: updateError } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (updateError) setError("Order status could not be updated. Please try again.");
    else setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status } : order));
    setSavingId("");
  }

  async function updateOrderDetails(orderId, updates) {
    setSavingId(orderId);
    const { error: updateError } = await supabase.from("orders").update(updates).eq("id", orderId);
    if (updateError) setError("Order fulfilment details could not be updated.");
    else setOrders((current) => current.map((order) => order.id === orderId ? { ...order, ...updates } : order));
    setSavingId("");
  }

  async function updateReviewVisibility(reviewId, isVisible) {
    setSavingId(reviewId);
    const { error: updateError } = await supabase.from("product_reviews").update({ is_visible: isVisible }).eq("id", reviewId);
    if (updateError) setError("Review moderation could not be saved.");
    else setReviews((current) => current.map((review) => review.id === reviewId ? { ...review, is_visible: isVisible } : review));
    setSavingId("");
  }

  async function updateSupportMessageStatus(messageId, status) {
    setSavingId(messageId);
    const { error: updateError } = await supabase.from("support_messages").update({ status }).eq("id", messageId);
    if (updateError) setError("Support message status could not be updated.");
    else setSupportMessages((current) => current.map((message) => message.id === messageId ? { ...message, status } : message));
    setSavingId("");
  }

  async function createProduct(event) {
    event.preventDefault();
    const id = newProduct.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!id || !newProduct.description || Number(newProduct.price) < 0 || Number(newProduct.stock) < 0) {
      setError("Enter a product name, description, valid price, and stock quantity."); return;
    }
    setSavingId("new-product"); setError("");
    let imageUrl = null;
    if (productImage) {
      const extension = productImage.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${id}/${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(path, productImage, { contentType: productImage.type });
      if (uploadError) { setError("Image upload failed. Please try again."); setSavingId(""); return; }
      imageUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
    }
    const { data, error: insertError } = await supabase.from("products").insert({ id, name: newProduct.name.trim(), category: newProduct.category, description: newProduct.description.trim(), price: Number(newProduct.price), stock_quantity: Number(newProduct.stock), featured: newProduct.featured, image_url: imageUrl }).select("id, name, category, description, price, stock_quantity, image_url, featured, is_active").single();
    if (insertError) setError(insertError.code === "23505" ? "A product with this name already exists." : "Product could not be created.");
    else { setProducts((current) => [...current, data]); setNewProduct({ name: "", category: "Cookware", description: "", price: "", stock: "0", featured: false }); setProductImage(null); setShowCreateProduct(false); }
    setSavingId("");
  }

  async function saveProductEdit(event) {
    event.preventDefault();
    if (!editingProduct) return;
    setSavingId(editingProduct.id); setError("");
    let imageUrl = editingProduct.image_url;
    if (replacementImage) {
      const extension = replacementImage.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${editingProduct.id}/${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(path, replacementImage, { contentType: replacementImage.type });
      if (uploadError) { setError("Replacement image upload failed."); setSavingId(""); return; }
      imageUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
    }
    const updates = { name: editingProduct.name.trim(), category: editingProduct.category, description: editingProduct.description.trim(), price: Number(editingProduct.price), stock_quantity: Number(editingProduct.stock_quantity), featured: editingProduct.featured, is_active: editingProduct.is_active, image_url: imageUrl };
    const { error: updateError } = await supabase.from("products").update(updates).eq("id", editingProduct.id);
    if (updateError) setError("Product details could not be updated.");
    else { setProducts((current) => current.map((product) => product.id === editingProduct.id ? { ...product, ...updates } : product)); setEditingProduct(null); setReplacementImage(null); }
    setSavingId("");
  }

  async function saveCategoryEdit(event) {
    event.preventDefault();
    if (!editingCategory) return;
    setSavingId(editingCategory.id); setError("");
    let imageUrl = editingCategory.image_url;
    if (replacementCategoryImage) {
      const extension = replacementCategoryImage.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${editingCategory.id}/${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("category-images").upload(path, replacementCategoryImage, { contentType: replacementCategoryImage.type });
      if (uploadError) { setError("Category image upload failed."); setSavingId(""); return; }
      imageUrl = supabase.storage.from("category-images").getPublicUrl(path).data.publicUrl;
    }
    const updates = { name: editingCategory.name.trim(), description: editingCategory.description.trim(), sort_order: Number(editingCategory.sort_order), is_active: editingCategory.is_active, image_url: imageUrl };
    const { error: updateError } = await supabase.from("categories").update(updates).eq("id", editingCategory.id);
    if (updateError) setError("Category details could not be updated.");
    else { setCategories((current) => current.map((category) => category.id === editingCategory.id ? { ...category, ...updates } : category).sort((a, b) => a.sort_order - b.sort_order)); setEditingCategory(null); setReplacementCategoryImage(null); }
    setSavingId("");
  }

  async function savePromoBanner(event) {
    event.preventDefault();
    if (!promoBanner) return;
    setSavingId("promo-banner");
    let imageUrl = promoBanner.image_url;
    if (promoImage) {
      const extension = promoImage.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `homepage/${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("promo-banners").upload(path, promoImage, { contentType: promoImage.type });
      if (uploadError) { setError("Promo image upload failed."); setSavingId(""); return; }
      imageUrl = supabase.storage.from("promo-banners").getPublicUrl(path).data.publicUrl;
    }
    const updates = { eyebrow: promoBanner.eyebrow, title: promoBanner.title, highlight: promoBanner.highlight, description: promoBanner.description, cta_label: promoBanner.cta_label, cta_path: promoBanner.cta_path, is_active: promoBanner.is_active, image_url: imageUrl, ends_at: promoBanner.ends_at ? new Date(promoBanner.ends_at).toISOString() : null, discount_percent: Number(promoBanner.discount_percent || 0), discount_scope: promoBanner.discount_scope || "all", discount_categories: promoBanner.discount_scope === "categories" ? promoBanner.discount_categories || [] : [] };
    const { error: updateError } = await supabase.from("promo_banners").update(updates).eq("id", promoBanner.id);
    if (updateError) setError("Promo banner could not be saved."); else { setPromoBanner({ ...promoBanner, ...updates, ends_at: toLocalDateTimeInput(updates.ends_at) }); setPromoImage(null); }
    setSavingId("");
  }

  async function saveAboutContent(event) {
    event.preventDefault();
    if (!aboutContent) return;
    setSavingId("about-content");
    setError("");
    let imageUrl = aboutContent.image_url;
    if (aboutImage) {
      const extension = aboutImage.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `about/${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("promo-banners").upload(path, aboutImage, { contentType: aboutImage.type });
      if (uploadError) { setError("About image upload failed. Please try again."); setSavingId(""); return; }
      imageUrl = supabase.storage.from("promo-banners").getPublicUrl(path).data.publicUrl;
    }
    const updates = { eyebrow: aboutContent.eyebrow.trim(), title: aboutContent.title.trim(), description: aboutContent.description.trim(), image_url: imageUrl, is_active: aboutContent.is_active };
    const { error: updateError } = await supabase.from("about_content").update(updates).eq("id", aboutContent.id);
    if (updateError) setError("About page content could not be saved.");
    else { setAboutContent({ ...aboutContent, ...updates }); setAboutImage(null); }
    setSavingId("");
  }

  async function saveDeliveryZone(event) {
    event.preventDefault();
    if (!editingDeliveryZone) return;
    const regions = editingDeliveryZone.regionsText.split(",").map((region) => region.trim()).filter(Boolean);
    if (!editingDeliveryZone.name.trim() || !regions.length || Number(editingDeliveryZone.shipping_fee) < 0 || !editingDeliveryZone.estimated_delivery.trim()) {
      setError("Enter a zone name, at least one region, a valid fee, and an estimate."); return;
    }
    setSavingId("delivery-zone"); setError("");
    const updates = { name: editingDeliveryZone.name.trim(), regions, shipping_fee: Number(editingDeliveryZone.shipping_fee), estimated_delivery: editingDeliveryZone.estimated_delivery.trim(), is_active: editingDeliveryZone.is_active, sort_order: Number(editingDeliveryZone.sort_order) };
    const result = editingDeliveryZone.id
      ? await supabase.from("delivery_zones").update(updates).eq("id", editingDeliveryZone.id).select("id, name, regions, shipping_fee, estimated_delivery, is_active, sort_order").single()
      : await supabase.from("delivery_zones").insert(updates).select("id, name, regions, shipping_fee, estimated_delivery, is_active, sort_order").single();
    if (result.error) setError("Delivery zone could not be saved.");
    else { setDeliveryZones((current) => editingDeliveryZone.id ? current.map((zone) => zone.id === editingDeliveryZone.id ? result.data : zone).sort((a, b) => a.sort_order - b.sort_order) : [...current, result.data].sort((a, b) => a.sort_order - b.sort_order)); setEditingDeliveryZone(null); }
    setSavingId("");
  }

  if (authLoading) return <div className="flex min-h-[60vh] items-center justify-center text-sm text-stone-500">Loading admin dashboard…</div>;
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-[#f6f6f3] px-4 py-6 dark:bg-stone-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="relative overflow-hidden rounded-[2rem] bg-stone-950 px-6 py-7 text-white shadow-xl shadow-stone-900/10 sm:px-8 sm:py-9"><div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" /><div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" /><div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-300">DorisWare operations</p><h1 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">The store, at a glance.</h1><p className="mt-2 max-w-xl text-sm leading-6 text-stone-300">Manage inventory, promotions, delivery, fulfilment, and sales performance from one focused workspace.</p></div><button type="button" onClick={loadDashboard} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-stone-900 shadow-lg transition hover:bg-emerald-50"><RefreshCw size={16} /> Refresh data</button></div><nav className="relative mt-7 flex gap-2 overflow-x-auto pb-1" aria-label="Admin sections">{[["overview", "Overview"], ["products", "Products"], ["orders", "Orders"], ["delivery", "Delivery"], ["promotions", "Promotions"], ["inbox", `Inbox${supportMessages.filter((message) => message.status === "new").length ? ` (${supportMessages.filter((message) => message.status === "new").length})` : ""}`]].map(([id, label]) => <button key={id} type="button" onClick={() => setActiveSection(id)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${activeSection === id ? "bg-white text-stone-950 shadow-sm" : "bg-white/12 text-white hover:bg-white/20"}`}>{label}</button>)}</nav></header>

        {error && <p role="alert" className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}

        {activeSection === "overview" && <>
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={ShoppingBag} label="Paid orders" value={metrics.paidOrders} tone="green" />
          <Metric icon={CheckCircle2} label="Paid revenue" value={formatMoney(metrics.revenue)} tone="emerald" />
          <Metric icon={Package} label="Low stock" value={metrics.lowStock} tone="amber" />
          <Metric icon={Box} label="Out of stock" value={metrics.outOfStock} tone="red" />
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl bg-stone-950 p-5 text-white shadow-xl shadow-stone-900/10 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 text-stone-950"><BarChart3 size={21} /></span><div><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-300">Performance report</p><h2 className="mt-1 text-xl font-semibold">Store intelligence</h2><p className="mt-1 text-sm text-stone-300">Paid orders only. Revenue and product demand update from the latest orders.</p></div></div><div className="flex rounded-xl bg-white/10 p-1">{[7, 30, 90].map((range) => <button key={range} type="button" onClick={() => setReportRange(range)} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${reportRange === range ? "bg-white text-stone-950 shadow-sm" : "text-stone-300 hover:text-white"}`}>{range} days</button>)}</div></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><ReportMetric label="Paid revenue" value={formatMoney(report.revenue)} /><ReportMetric label="Paid orders" value={report.paidOrders.length} /><ReportMetric label="Average order" value={formatMoney(report.average)} /><ReportMetric label="Own delivery" value={`${report.customerArranged} order${report.customerArranged === 1 ? "" : "s"}`} /></div>
          <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(250px,0.8fr)]"><div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold">Daily paid revenue</h3><p className="mt-1 text-xs text-stone-400">Last {reportRange} days</p></div><p className="text-xs font-medium text-emerald-300">{formatMoney(Math.max(...report.daily.map((day) => day.value), 0))} peak</p></div><div className="mt-5 flex h-40 items-end gap-1.5" aria-label={`Daily paid revenue for the last ${reportRange} days`}>{report.daily.map((day, index) => { const maximum = Math.max(...report.daily.map((item) => item.value), 1); const showLabel = reportRange <= 7 || index === 0 || index === report.daily.length - 1 || index % Math.ceil(reportRange / 5) === 0; return <div key={day.key} className="flex h-full min-w-0 flex-1 flex-col justify-end"><div title={`${day.label}: ${formatMoney(day.value)}`} className="min-h-0 rounded-t-sm bg-emerald-400/90 transition hover:bg-emerald-300" style={{ height: day.value ? `${Math.max((day.value / maximum) * 100, 4)}%` : "2px" }} /><span className="mt-2 truncate text-center text-[9px] text-stone-500">{showLabel ? day.label : ""}</span></div>; })}</div></div><div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><div><h3 className="font-semibold">Best sellers</h3><p className="mt-1 text-xs text-stone-400">Units sold in this period</p></div><div className="mt-4 space-y-3">{report.topProducts.length ? report.topProducts.map(([name, quantity], index) => <div key={name} className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-emerald-300">{index + 1}</span><p className="min-w-0 flex-1 truncate text-sm font-medium">{name}</p><span className="text-xs font-semibold text-stone-300">{quantity} sold</span></div>) : <p className="rounded-xl border border-dashed border-white/15 px-3 py-4 text-sm text-stone-400">No paid sales in this period yet.</p>}</div></div></div>
        </section>
        </>}

        {/* Product tools */}
        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-stone-900 dark:text-stone-100">Add a product</h2><p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Create a product and optionally upload its storefront image.</p></div><button type="button" onClick={() => setShowCreateProduct((open) => !open)} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"><Plus size={16} /> {showCreateProduct ? "Close form" : "New product"}</button></div>
          {showCreateProduct && <form onSubmit={createProduct} className="mt-6 grid gap-4 border-t border-stone-100 pt-6 dark:border-stone-800 sm:grid-cols-2"><AdminField label="Product name" value={newProduct.name} onChange={(value) => setNewProduct({ ...newProduct, name: value })} required /><AdminField label="Category" value={newProduct.category} onChange={(value) => setNewProduct({ ...newProduct, category: value })} required /><label className="text-sm font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Description<textarea required value={newProduct.description} onChange={(event) => setNewProduct({ ...newProduct, description: event.target.value })} className="mt-1.5 min-h-24 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-green-600 dark:border-stone-700 dark:bg-stone-800" /></label><AdminField label="Price (₵)" type="number" min="0" step="0.01" value={newProduct.price} onChange={(value) => setNewProduct({ ...newProduct, price: value })} required /><AdminField label="Stock quantity" type="number" min="0" value={newProduct.stock} onChange={(value) => setNewProduct({ ...newProduct, stock: value })} required /><label className="text-sm font-medium text-stone-700 dark:text-stone-300">Product image <input type="file" accept="image/*" onChange={(event) => setProductImage(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm" /></label><label className="flex items-center gap-2 self-end text-sm font-medium text-stone-700 dark:text-stone-300"><input type="checkbox" checked={newProduct.featured} onChange={(event) => setNewProduct({ ...newProduct, featured: event.target.checked })} className="h-4 w-4 accent-green-600" /> Feature on homepage</label><button type="submit" disabled={savingId === "new-product"} className="sm:col-span-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-700 disabled:opacity-60 dark:bg-stone-700">{savingId === "new-product" ? "Creating product…" : "Create product"}</button></form>}
        </section>

        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-violet-700 dark:text-violet-400">Customer updates</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">Tracking & delivery details</h2><p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Saved details appear in the customer’s order tracking view.</p></div><div className="mt-5 grid gap-4 lg:grid-cols-2">{orders.filter((order) => order.payment_status === "paid").map((order) => <div key={order.id} className="rounded-2xl border border-stone-200 p-4 dark:border-stone-700"><p className="font-semibold text-stone-900 dark:text-stone-100">{order.order_number}</p><p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{order.delivery_method === "customer_arranged" ? "Customer-arranged" : "DorisWare delivery"}</p>{order.delivery_method !== "customer_arranged" && <div className="mt-3 rounded-xl bg-stone-50 p-3 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-300"><p className="font-semibold text-stone-900 dark:text-stone-100">Deliver to: {order.shipping_address?.recipient}</p><p>{order.shipping_address?.street}, {order.shipping_address?.city}</p><p>{order.shipping_address?.region}, {order.shipping_address?.country}</p><p className="mt-1">Phone: {order.contact_phone}</p></div>}<div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs font-medium text-stone-700 dark:text-stone-300">Tracking / rider reference<input defaultValue={order.tracking_number ?? ""} onBlur={(event) => { if (event.target.value !== (order.tracking_number ?? "")) updateOrderDetails(order.id, { tracking_number: event.target.value || null }); }} className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-sm dark:border-stone-700 dark:bg-stone-800" placeholder="e.g. Rider: 024…" /></label><label className="text-xs font-medium text-stone-700 dark:text-stone-300">Estimated delivery<input type="date" defaultValue={order.estimated_delivery_at ?? ""} onChange={(event) => updateOrderDetails(order.id, { estimated_delivery_at: event.target.value || null })} className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-sm dark:border-stone-700 dark:bg-stone-800" /></label><label className="text-xs font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Customer note<textarea defaultValue={order.fulfilment_note ?? ""} onBlur={(event) => { if (event.target.value !== (order.fulfilment_note ?? "")) updateOrderDetails(order.id, { fulfilment_note: event.target.value || null }); }} className="mt-1 min-h-18 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-sm dark:border-stone-700 dark:bg-stone-800" placeholder="Rider contact or pickup instruction" /></label></div></div>)}</div></section>

        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-rose-600 dark:text-rose-400">Customer feedback</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">Review moderation</h2><p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Approve genuine reviews to publish them, or hide them from the storefront.</p></div><span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">{reviews.filter((review) => !review.is_visible).length} pending</span></div>{loading ? <LoadingRows /> : reviews.length ? <div className="mt-5 grid gap-3 lg:grid-cols-2">{reviews.map((review) => <article key={review.id} className="rounded-2xl border border-stone-200 p-4 dark:border-stone-700"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-stone-900 dark:text-stone-100">{products.find((product) => product.id === review.product_id)?.name ?? review.product_id}</p><p className="mt-1 text-xs text-amber-600">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${review.is_visible ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"}`}>{review.is_visible ? "Published" : "Pending"}</span></div>{review.title && <p className="mt-3 text-sm font-semibold text-stone-800 dark:text-stone-200">{review.title}</p>}{review.body && <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">{review.body}</p>}<div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-100 pt-3 dark:border-stone-800"><p className="text-xs text-stone-400">{new Date(review.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p><button type="button" disabled={savingId === review.id} onClick={() => updateReviewVisibility(review.id, !review.is_visible)} className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-60 ${review.is_visible ? "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>{savingId === review.id ? "Saving…" : review.is_visible ? "Hide review" : "Approve review"}</button></div></article>)}</div> : <p className="mt-5 rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">No customer reviews have been submitted yet.</p>}</section>

        <section className="mt-8 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-5 py-5 dark:border-stone-800 sm:px-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"><Settings2 size={19} /></span><div><h2 className="font-semibold text-stone-900 dark:text-stone-100">Products & inventory</h2><p className="text-xs text-stone-500 dark:text-stone-400">Update stock, visibility, and featured items.</p></div></div><Link to="/shop" className="text-sm font-semibold text-green-700 hover:text-green-800 dark:text-green-400">View shop →</Link></div>
          {loading ? <LoadingRows /> : <div className="overflow-x-auto"><table className="w-full min-w-[790px] text-left text-sm"><thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900/60 dark:text-stone-400"><tr><th className="px-6 py-3 font-semibold">Product</th><th className="px-4 py-3 font-semibold">Price</th><th className="px-4 py-3 font-semibold">Stock</th><th className="px-4 py-3 font-semibold">Featured</th><th className="px-4 py-3 font-semibold">Store visibility</th><th className="px-4 py-3 font-semibold">Edit</th></tr></thead><tbody className="divide-y divide-stone-100 dark:divide-stone-800">{products.map((product) => <tr key={product.id}><td className="px-6 py-4"><p className="font-semibold text-stone-900 dark:text-stone-100">{product.name}</p><p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{product.category}</p></td><td className="px-4 py-4 font-medium text-stone-700 dark:text-stone-300">{formatMoney(product.price)}</td><td className="px-4 py-4"><input aria-label={`${product.name} stock`} type="number" min="0" defaultValue={product.stock_quantity} onBlur={(event) => { const stock = Number(event.target.value); if (stock !== product.stock_quantity && stock >= 0) updateProduct(product.id, { stock_quantity: stock }); }} className="w-20 rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-800" /></td><td className="px-4 py-4"><Toggle checked={product.featured} disabled={savingId === product.id} label={`Feature ${product.name}`} onChange={(featured) => updateProduct(product.id, { featured })} /></td><td className="px-4 py-4"><Toggle checked={product.is_active} disabled={savingId === product.id} label={`Show ${product.name} in store`} onChange={(is_active) => updateProduct(product.id, { is_active })} /></td><td className="px-4 py-4"><button type="button" onClick={() => { setEditingProduct(product); setReplacementImage(null); }} className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"><Pencil size={14} /> Edit</button></td></tr>)}</tbody></table></div>}
        </section>

        {editingProduct && <section className="mt-8 rounded-3xl border border-green-200 bg-green-50/50 p-5 shadow-sm dark:border-green-900/50 dark:bg-green-950/15 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-green-700 dark:text-green-400">Editing product</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">{editingProduct.name}</h2></div><button type="button" onClick={() => setEditingProduct(null)} className="text-sm font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200">Cancel</button></div><form onSubmit={saveProductEdit} className="mt-5 grid gap-4 sm:grid-cols-2"><AdminField label="Product name" value={editingProduct.name} onChange={(value) => setEditingProduct({ ...editingProduct, name: value })} required /><AdminField label="Category" value={editingProduct.category} onChange={(value) => setEditingProduct({ ...editingProduct, category: value })} required /><label className="text-sm font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Description<textarea required value={editingProduct.description} onChange={(event) => setEditingProduct({ ...editingProduct, description: event.target.value })} className="mt-1.5 min-h-24 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-green-600 dark:border-stone-700 dark:bg-stone-800" /></label><AdminField label="Price (₵)" type="number" min="0" step="0.01" value={editingProduct.price} onChange={(value) => setEditingProduct({ ...editingProduct, price: value })} required /><AdminField label="Stock quantity" type="number" min="0" value={editingProduct.stock_quantity} onChange={(value) => setEditingProduct({ ...editingProduct, stock_quantity: value })} required /><label className="text-sm font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Replace image <input type="file" accept="image/*" onChange={(event) => setReplacementImage(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm" /></label><button type="submit" disabled={savingId === editingProduct.id} className="sm:col-span-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">{savingId === editingProduct.id ? "Saving changes…" : "Save product changes"}</button></form></section>}

        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"><Settings2 size={19} /></span><div><h2 className="font-semibold text-stone-900 dark:text-stone-100">Category cards</h2><p className="text-xs text-stone-500 dark:text-stone-400">Control home-page category content and display order.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <div key={category.id} className="flex items-center gap-3 rounded-2xl border border-stone-200 p-3 dark:border-stone-700"><img src={category.image_url} alt="" className="h-14 w-14 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="truncate font-semibold text-stone-900 dark:text-stone-100">{category.name}</p><p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">Position {category.sort_order} · {category.is_active ? "Visible" : "Hidden"}</p></div><button type="button" onClick={() => { setEditingCategory(category); setReplacementCategoryImage(null); }} className="rounded-lg border border-stone-200 p-2 text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800" aria-label={`Edit ${category.name}`}><Pencil size={15} /></button></div>)}</div></section>

        {editingCategory && <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/15 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-amber-700 dark:text-amber-400">Editing category</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">{editingCategory.name}</h2></div><button type="button" onClick={() => setEditingCategory(null)} className="text-sm font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200">Cancel</button></div><form onSubmit={saveCategoryEdit} className="mt-5 grid gap-4 sm:grid-cols-2"><AdminField label="Category name" value={editingCategory.name} onChange={(value) => setEditingCategory({ ...editingCategory, name: value })} required /><AdminField label="Display order" type="number" min="0" value={editingCategory.sort_order} onChange={(value) => setEditingCategory({ ...editingCategory, sort_order: value })} required /><label className="text-sm font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Description<textarea required value={editingCategory.description} onChange={(event) => setEditingCategory({ ...editingCategory, description: event.target.value })} className="mt-1.5 min-h-24 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800" /></label><label className="text-sm font-medium text-stone-700 dark:text-stone-300">Replace image <input type="file" accept="image/*" onChange={(event) => setReplacementCategoryImage(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm" /></label><label className="flex items-center gap-2 self-end text-sm font-medium text-stone-700 dark:text-stone-300"><input type="checkbox" checked={editingCategory.is_active} onChange={(event) => setEditingCategory({ ...editingCategory, is_active: event.target.checked })} className="h-4 w-4 accent-amber-500" /> Show category card</label><button type="submit" disabled={savingId === editingCategory.id} className="sm:col-span-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-400 disabled:opacity-60">{savingId === editingCategory.id ? "Saving changes…" : "Save category changes"}</button></form></section>}

        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-sky-700 dark:text-sky-400">Delivery setup</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">Delivery zones</h2><p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Only active zones are available at checkout.</p></div><button type="button" onClick={() => setEditingDeliveryZone({ name: "", regionsText: "", shipping_fee: "", estimated_delivery: "", is_active: true, sort_order: deliveryZones.length + 1 })} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"><Plus size={16} /> Add zone</button></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{deliveryZones.map((zone) => <div key={zone.id} className="rounded-2xl border border-stone-200 p-4 dark:border-stone-700"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-stone-900 dark:text-stone-100">{zone.name}</p><p className="mt-1 text-sm font-medium text-sky-700 dark:text-sky-400">{formatMoney(zone.shipping_fee)} · {zone.estimated_delivery}</p><p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{zone.regions.join(", ")}</p></div><button type="button" onClick={() => setEditingDeliveryZone({ ...zone, regionsText: zone.regions.join(", ") })} className="rounded-lg border border-stone-200 p-2 text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800" aria-label={`Edit ${zone.name}`}><Pencil size={15} /></button></div><p className={`mt-3 text-xs font-semibold ${zone.is_active ? "text-emerald-600" : "text-stone-500"}`}>{zone.is_active ? "Active at checkout" : "Hidden from checkout"}</p></div>)}</div>{editingDeliveryZone && <form onSubmit={saveDeliveryZone} className="mt-5 grid gap-4 rounded-2xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-900/50 dark:bg-sky-950/15 sm:grid-cols-2"><AdminField label="Zone name" value={editingDeliveryZone.name} onChange={(value) => setEditingDeliveryZone({ ...editingDeliveryZone, name: value })} required /><AdminField label="Delivery fee (₵)" type="number" min="0" step="0.01" value={editingDeliveryZone.shipping_fee} onChange={(value) => setEditingDeliveryZone({ ...editingDeliveryZone, shipping_fee: value })} required /><AdminField label="Regions (comma separated)" value={editingDeliveryZone.regionsText} onChange={(value) => setEditingDeliveryZone({ ...editingDeliveryZone, regionsText: value })} required /><AdminField label="Delivery estimate" value={editingDeliveryZone.estimated_delivery} onChange={(value) => setEditingDeliveryZone({ ...editingDeliveryZone, estimated_delivery: value })} required /><AdminField label="Display order" type="number" min="0" value={editingDeliveryZone.sort_order} onChange={(value) => setEditingDeliveryZone({ ...editingDeliveryZone, sort_order: value })} required /><label className="flex items-center gap-2 self-end text-sm font-medium text-stone-700 dark:text-stone-300"><input type="checkbox" checked={editingDeliveryZone.is_active} onChange={(event) => setEditingDeliveryZone({ ...editingDeliveryZone, is_active: event.target.checked })} className="h-4 w-4 accent-sky-600" /> Enable at checkout</label><div className="flex gap-3 sm:col-span-2"><button type="submit" disabled={savingId === "delivery-zone"} className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60">{savingId === "delivery-zone" ? "Saving…" : "Save delivery zone"}</button><button type="button" onClick={() => setEditingDeliveryZone(null)} className="rounded-xl border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800">Cancel</button></div></form>}</section>

        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-400">Customer care</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">Customer inbox</h2><p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Support requests and newsletter joins from the storefront.</p></div><div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{subscribers.filter((subscriber) => subscriber.status === "subscribed").length} subscribers</div></div><div className="mt-5 space-y-3">{supportMessages.length ? supportMessages.map((message) => <article key={message.id} className="rounded-2xl border border-stone-200 p-4 dark:border-stone-700"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-stone-900 dark:text-stone-100">{message.first_name} {message.last_name}</p><span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">{message.subject}</span></div><p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{message.email}{message.phone ? ` · ${message.phone}` : ""} · {new Date(message.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-stone-700 dark:text-stone-300">{message.message}</p></div><select aria-label={`Status for message from ${message.first_name}`} value={message.status} disabled={savingId === message.id} onChange={(event) => updateSupportMessageStatus(message.id, event.target.value)} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium dark:border-stone-700 dark:bg-stone-800"><option value="new">New</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></div></article>) : <p className="rounded-2xl border border-dashed border-stone-300 p-5 text-sm text-stone-500 dark:border-stone-700">No support messages yet.</p>}</div>{subscribers.length > 0 && <div className="mt-6 border-t border-stone-100 pt-5 dark:border-stone-800"><p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Latest newsletter subscribers</p><div className="mt-3 flex flex-wrap gap-2">{subscribers.slice(0, 12).map((subscriber) => <span key={subscriber.id} className="rounded-full border border-stone-200 px-3 py-1.5 text-xs text-stone-600 dark:border-stone-700 dark:text-stone-300">{subscriber.email}</span>)}</div></div>}</section>

        {aboutContent && <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-amber-700 dark:text-amber-400">Storefront content</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">About page</h2><p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Update the public story and its image without changing code.</p></div><form onSubmit={saveAboutContent} className="mt-5 grid gap-4 sm:grid-cols-2"><AdminField label="Eyebrow" value={aboutContent.eyebrow} onChange={(value) => setAboutContent({ ...aboutContent, eyebrow: value })} required /><AdminField label="Title" value={aboutContent.title} onChange={(value) => setAboutContent({ ...aboutContent, title: value })} required /><label className="text-sm font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Story<textarea required value={aboutContent.description} onChange={(event) => setAboutContent({ ...aboutContent, description: event.target.value })} className="mt-1.5 min-h-28 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800" /></label><label className="text-sm font-medium text-stone-700 dark:text-stone-300">Story image <input type="file" accept="image/*" onChange={(event) => setAboutImage(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm" /></label><label className="flex items-center gap-2 self-end text-sm font-medium text-stone-700 dark:text-stone-300"><input type="checkbox" checked={aboutContent.is_active} onChange={(event) => setAboutContent({ ...aboutContent, is_active: event.target.checked })} className="h-4 w-4 accent-amber-500" /> Show this About content</label>{aboutContent.image_url && <img src={aboutContent.image_url} alt="Current About page" className="h-32 w-full rounded-xl border border-stone-200 object-cover sm:col-span-2 dark:border-stone-700" />}<button type="submit" disabled={savingId === "about-content"} className="sm:col-span-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-400 disabled:opacity-60">{savingId === "about-content" ? "Saving About page…" : "Save About page"}</button></form></section>}

        {promoBanner && <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-green-700 dark:text-green-400">Homepage content</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">Promo banner</h2><p className="mt-1 text-xs text-stone-500 dark:text-stone-400">The discount changes displayed prices only while this banner is active.</p></div><form onSubmit={savePromoBanner} className="mt-5 grid gap-4 sm:grid-cols-2"><AdminField label="Eyebrow" value={promoBanner.eyebrow} onChange={(value) => setPromoBanner({ ...promoBanner, eyebrow: value })} required /><AdminField label="CTA label" value={promoBanner.cta_label} onChange={(value) => setPromoBanner({ ...promoBanner, cta_label: value })} required /><AdminField label="Title" value={promoBanner.title} onChange={(value) => setPromoBanner({ ...promoBanner, title: value })} required /><AdminField label="Highlight" value={promoBanner.highlight ?? ""} onChange={(value) => setPromoBanner({ ...promoBanner, highlight: value })} /><AdminField label="CTA path" value={promoBanner.cta_path} onChange={(value) => setPromoBanner({ ...promoBanner, cta_path: value })} required /><AdminField label="Discount (%)" type="number" min="0" max="100" step="0.01" value={promoBanner.discount_percent ?? 0} onChange={(value) => setPromoBanner({ ...promoBanner, discount_percent: value })} /><AdminField label="Offer ends at (optional)" type="datetime-local" value={promoBanner.ends_at ?? ""} onChange={(value) => setPromoBanner({ ...promoBanner, ends_at: value })} /><label className="text-sm font-medium text-stone-700 dark:text-stone-300">Discount applies to<select value={promoBanner.discount_scope || "all"} onChange={(event) => setPromoBanner({ ...promoBanner, discount_scope: event.target.value })} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-green-600 dark:border-stone-700 dark:bg-stone-800"><option value="all">All in-stock products</option><option value="categories">Selected categories</option></select></label><label className="flex items-center gap-2 self-end text-sm font-medium text-stone-700 dark:text-stone-300"><input type="checkbox" checked={promoBanner.is_active} onChange={(event) => setPromoBanner({ ...promoBanner, is_active: event.target.checked })} className="h-4 w-4 accent-green-600" /> Show banner</label>{promoBanner.discount_scope === "categories" && <fieldset className="sm:col-span-2"><legend className="text-sm font-medium text-stone-700 dark:text-stone-300">Discounted categories</legend><div className="mt-2 flex flex-wrap gap-3">{categories.map((category) => { const checked = promoBanner.discount_categories?.includes(category.name); return <label key={category.id} className="flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-700 dark:border-stone-700 dark:text-stone-300"><input type="checkbox" checked={checked} onChange={() => setPromoBanner({ ...promoBanner, discount_categories: checked ? promoBanner.discount_categories.filter((name) => name !== category.name) : [...(promoBanner.discount_categories || []), category.name] })} className="h-4 w-4 accent-green-600" /> {category.name}</label>; })}</div></fieldset>}<label className="text-sm font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Description<textarea required value={promoBanner.description} onChange={(event) => setPromoBanner({ ...promoBanner, description: event.target.value })} className="mt-1.5 min-h-24 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-green-600 dark:border-stone-700 dark:bg-stone-800" /></label><label className="text-sm font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Banner image <input type="file" accept="image/*" onChange={(event) => setPromoImage(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm" /></label><button type="submit" disabled={savingId === "promo-banner"} className="sm:col-span-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">{savingId === "promo-banner" ? "Saving banner…" : "Save promo banner"}</button></form></section>}

        <section className="mt-8 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-3 border-b border-stone-100 px-5 py-5 dark:border-stone-800 sm:px-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"><ClipboardList size={19} /></span><div><h2 className="font-semibold text-stone-900 dark:text-stone-100">Recent orders</h2><p className="text-xs text-stone-500 dark:text-stone-400">Update fulfilment only after payment is confirmed.</p></div></div>
          {loading ? <LoadingRows /> : <div className="overflow-x-auto"><table className="w-full min-w-[880px] text-left text-sm"><thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900/60 dark:text-stone-400"><tr><th className="px-6 py-3 font-semibold">Order</th><th className="px-4 py-3 font-semibold">Customer</th><th className="px-4 py-3 font-semibold">Items</th><th className="px-4 py-3 font-semibold">Delivery</th><th className="px-4 py-3 font-semibold">Payment</th><th className="px-4 py-3 font-semibold">Fulfilment</th></tr></thead><tbody className="divide-y divide-stone-100 dark:divide-stone-800">{orders.slice(0, 12).map((order) => <tr key={order.id}><td className="px-6 py-4"><p className="font-semibold text-stone-900 dark:text-stone-100">{order.order_number}</p><p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{formatMoney(order.total)}</p></td><td className="px-4 py-4 text-stone-600 dark:text-stone-300">{order.contact_email}</td><td className="px-4 py-4 text-stone-600 dark:text-stone-300">{order.order_items?.map((item) => `${item.product_name} × ${item.quantity}`).join(", ") || "—"}</td><td className="px-4 py-4 text-stone-600 dark:text-stone-300">{order.delivery_method === "customer_arranged" ? "Customer-arranged" : "DorisWare delivery"}</td><td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[order.payment_status] ?? "bg-stone-100 text-stone-600"}`}>{formatStatus(order.payment_status)}</span></td><td className="px-4 py-4"><select aria-label={`Fulfilment status for ${order.order_number}`} disabled={order.payment_status !== "paid" || savingId === order.id} value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value)} className="rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800">{orderStatuses.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}</select></td></tr>)}</tbody></table></div>}
        </section>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, tone }) {
  const tones = { green: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400", emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400", amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400", red: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400" };
  return <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}><Icon size={19} /></div><p className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-100">{value}</p><p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{label}</p></div>;
}

function ReportMetric({ label, value }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-xs font-medium uppercase tracking-[.12em] text-stone-400">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</p></div>;
}

function Toggle({ checked, disabled, label, onChange }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-green-600" : "bg-stone-300 dark:bg-stone-700"} disabled:opacity-50`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-5" : "left-0.5"}`} /></button>;
}

function AdminField({ label, type = "text", value, onChange, ...props }) {
  return <label className="text-sm font-medium text-stone-700 dark:text-stone-300">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-green-600 dark:border-stone-700 dark:bg-stone-800" {...props} /></label>;
}


function LoadingRows() {
  return <div className="space-y-3 p-6">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />)}</div>;
}
