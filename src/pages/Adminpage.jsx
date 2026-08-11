import { useEffect, useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Box, CheckCircle2, ClipboardList, Package, Pencil, Plus, RefreshCw, Settings2, ShoppingBag } from "lucide-react";
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
  const [promoBanner, setPromoBanner] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", category: "Cookware", description: "", price: "", stock: "0", featured: false });
  const [productImage, setProductImage] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [replacementImage, setReplacementImage] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [replacementCategoryImage, setReplacementCategoryImage] = useState(null);
  const [promoImage, setPromoImage] = useState(null);

  const metrics = useMemo(() => ({
    revenue: orders.filter((order) => order.payment_status === "paid").reduce((sum, order) => sum + Number(order.total), 0),
    paidOrders: orders.filter((order) => order.payment_status === "paid").length,
    lowStock: products.filter((product) => product.stock_quantity > 0 && product.stock_quantity < 5).length,
    outOfStock: products.filter((product) => product.stock_quantity === 0).length,
  }), [orders, products]);

  async function loadDashboard() {
    setLoading(true);
    setError("");
    const [productsResult, categoriesResult, bannerResult, ordersResult] = await Promise.all([
      supabase.from("products").select("id, name, category, description, price, stock_quantity, image_url, featured, is_active").order("created_at"),
      supabase.from("categories").select("id, name, description, image_url, sort_order, is_active").order("sort_order"),
      supabase.from("promo_banners").select("id, eyebrow, title, highlight, description, cta_label, cta_path, image_url, is_active, ends_at, discount_percent, discount_scope, discount_categories").order("sort_order").limit(1).maybeSingle(),
      supabase.from("orders").select("id, order_number, contact_email, total, status, payment_status, payment_method, created_at, order_items(product_name, quantity)").order("created_at", { ascending: false }).limit(12),
    ]);

    if (productsResult.error || categoriesResult.error || bannerResult.error || ordersResult.error) {
      setError("The dashboard data could not load. Confirm this account has the admin role, then refresh.");
    } else {
      setProducts(productsResult.data);
      setCategories(categoriesResult.data);
      setPromoBanner(bannerResult.data ? { ...bannerResult.data, ends_at: toLocalDateTimeInput(bannerResult.data.ends_at) } : null);
      setOrders(ordersResult.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (user?.role === "admin") queueMicrotask(loadDashboard);
  }, [user?.role]);

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

  if (authLoading) return <div className="flex min-h-[60vh] items-center justify-center text-sm text-stone-500">Loading admin dashboard…</div>;
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-8 dark:bg-stone-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-stone-200 pb-7 dark:border-stone-800 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-green-700 dark:text-green-400">DorisWare operations</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold text-stone-900 dark:text-stone-100 sm:text-4xl">Admin dashboard</h1>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Manage inventory and keep customers informed about their orders.</p>
          </div>
          <button type="button" onClick={loadDashboard} className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"><RefreshCw size={16} /> Refresh</button>
        </header>

        {error && <p role="alert" className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}

        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={ShoppingBag} label="Paid orders" value={metrics.paidOrders} tone="green" />
          <Metric icon={CheckCircle2} label="Paid revenue" value={formatMoney(metrics.revenue)} tone="emerald" />
          <Metric icon={Package} label="Low stock" value={metrics.lowStock} tone="amber" />
          <Metric icon={Box} label="Out of stock" value={metrics.outOfStock} tone="red" />
        </section>

        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-stone-900 dark:text-stone-100">Add a product</h2><p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Create a product and optionally upload its storefront image.</p></div><button type="button" onClick={() => setShowCreateProduct((open) => !open)} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"><Plus size={16} /> {showCreateProduct ? "Close form" : "New product"}</button></div>
          {showCreateProduct && <form onSubmit={createProduct} className="mt-6 grid gap-4 border-t border-stone-100 pt-6 dark:border-stone-800 sm:grid-cols-2"><AdminField label="Product name" value={newProduct.name} onChange={(value) => setNewProduct({ ...newProduct, name: value })} required /><AdminField label="Category" value={newProduct.category} onChange={(value) => setNewProduct({ ...newProduct, category: value })} required /><label className="text-sm font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Description<textarea required value={newProduct.description} onChange={(event) => setNewProduct({ ...newProduct, description: event.target.value })} className="mt-1.5 min-h-24 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-green-600 dark:border-stone-700 dark:bg-stone-800" /></label><AdminField label="Price (₵)" type="number" min="0" step="0.01" value={newProduct.price} onChange={(value) => setNewProduct({ ...newProduct, price: value })} required /><AdminField label="Stock quantity" type="number" min="0" value={newProduct.stock} onChange={(value) => setNewProduct({ ...newProduct, stock: value })} required /><label className="text-sm font-medium text-stone-700 dark:text-stone-300">Product image <input type="file" accept="image/*" onChange={(event) => setProductImage(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm" /></label><label className="flex items-center gap-2 self-end text-sm font-medium text-stone-700 dark:text-stone-300"><input type="checkbox" checked={newProduct.featured} onChange={(event) => setNewProduct({ ...newProduct, featured: event.target.checked })} className="h-4 w-4 accent-green-600" /> Feature on homepage</label><button type="submit" disabled={savingId === "new-product"} className="sm:col-span-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-700 disabled:opacity-60 dark:bg-stone-700">{savingId === "new-product" ? "Creating product…" : "Create product"}</button></form>}
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-5 py-5 dark:border-stone-800 sm:px-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"><Settings2 size={19} /></span><div><h2 className="font-semibold text-stone-900 dark:text-stone-100">Products & inventory</h2><p className="text-xs text-stone-500 dark:text-stone-400">Update stock, visibility, and featured items.</p></div></div><Link to="/shop" className="text-sm font-semibold text-green-700 hover:text-green-800 dark:text-green-400">View shop →</Link></div>
          {loading ? <LoadingRows /> : <div className="overflow-x-auto"><table className="w-full min-w-[790px] text-left text-sm"><thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900/60 dark:text-stone-400"><tr><th className="px-6 py-3 font-semibold">Product</th><th className="px-4 py-3 font-semibold">Price</th><th className="px-4 py-3 font-semibold">Stock</th><th className="px-4 py-3 font-semibold">Featured</th><th className="px-4 py-3 font-semibold">Store visibility</th><th className="px-4 py-3 font-semibold">Edit</th></tr></thead><tbody className="divide-y divide-stone-100 dark:divide-stone-800">{products.map((product) => <tr key={product.id}><td className="px-6 py-4"><p className="font-semibold text-stone-900 dark:text-stone-100">{product.name}</p><p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{product.category}</p></td><td className="px-4 py-4 font-medium text-stone-700 dark:text-stone-300">{formatMoney(product.price)}</td><td className="px-4 py-4"><input aria-label={`${product.name} stock`} type="number" min="0" defaultValue={product.stock_quantity} onBlur={(event) => { const stock = Number(event.target.value); if (stock !== product.stock_quantity && stock >= 0) updateProduct(product.id, { stock_quantity: stock }); }} className="w-20 rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-800" /></td><td className="px-4 py-4"><Toggle checked={product.featured} disabled={savingId === product.id} label={`Feature ${product.name}`} onChange={(featured) => updateProduct(product.id, { featured })} /></td><td className="px-4 py-4"><Toggle checked={product.is_active} disabled={savingId === product.id} label={`Show ${product.name} in store`} onChange={(is_active) => updateProduct(product.id, { is_active })} /></td><td className="px-4 py-4"><button type="button" onClick={() => { setEditingProduct(product); setReplacementImage(null); }} className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"><Pencil size={14} /> Edit</button></td></tr>)}</tbody></table></div>}
        </section>

        {editingProduct && <section className="mt-8 rounded-3xl border border-green-200 bg-green-50/50 p-5 shadow-sm dark:border-green-900/50 dark:bg-green-950/15 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-green-700 dark:text-green-400">Editing product</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">{editingProduct.name}</h2></div><button type="button" onClick={() => setEditingProduct(null)} className="text-sm font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200">Cancel</button></div><form onSubmit={saveProductEdit} className="mt-5 grid gap-4 sm:grid-cols-2"><AdminField label="Product name" value={editingProduct.name} onChange={(value) => setEditingProduct({ ...editingProduct, name: value })} required /><AdminField label="Category" value={editingProduct.category} onChange={(value) => setEditingProduct({ ...editingProduct, category: value })} required /><label className="text-sm font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Description<textarea required value={editingProduct.description} onChange={(event) => setEditingProduct({ ...editingProduct, description: event.target.value })} className="mt-1.5 min-h-24 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-green-600 dark:border-stone-700 dark:bg-stone-800" /></label><AdminField label="Price (₵)" type="number" min="0" step="0.01" value={editingProduct.price} onChange={(value) => setEditingProduct({ ...editingProduct, price: value })} required /><AdminField label="Stock quantity" type="number" min="0" value={editingProduct.stock_quantity} onChange={(value) => setEditingProduct({ ...editingProduct, stock_quantity: value })} required /><label className="text-sm font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Replace image <input type="file" accept="image/*" onChange={(event) => setReplacementImage(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm" /></label><button type="submit" disabled={savingId === editingProduct.id} className="sm:col-span-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">{savingId === editingProduct.id ? "Saving changes…" : "Save product changes"}</button></form></section>}

        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"><Settings2 size={19} /></span><div><h2 className="font-semibold text-stone-900 dark:text-stone-100">Category cards</h2><p className="text-xs text-stone-500 dark:text-stone-400">Control home-page category content and display order.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <div key={category.id} className="flex items-center gap-3 rounded-2xl border border-stone-200 p-3 dark:border-stone-700"><img src={category.image_url} alt="" className="h-14 w-14 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="truncate font-semibold text-stone-900 dark:text-stone-100">{category.name}</p><p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">Position {category.sort_order} · {category.is_active ? "Visible" : "Hidden"}</p></div><button type="button" onClick={() => { setEditingCategory(category); setReplacementCategoryImage(null); }} className="rounded-lg border border-stone-200 p-2 text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800" aria-label={`Edit ${category.name}`}><Pencil size={15} /></button></div>)}</div></section>

        {editingCategory && <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/15 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-amber-700 dark:text-amber-400">Editing category</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">{editingCategory.name}</h2></div><button type="button" onClick={() => setEditingCategory(null)} className="text-sm font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200">Cancel</button></div><form onSubmit={saveCategoryEdit} className="mt-5 grid gap-4 sm:grid-cols-2"><AdminField label="Category name" value={editingCategory.name} onChange={(value) => setEditingCategory({ ...editingCategory, name: value })} required /><AdminField label="Display order" type="number" min="0" value={editingCategory.sort_order} onChange={(value) => setEditingCategory({ ...editingCategory, sort_order: value })} required /><label className="text-sm font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Description<textarea required value={editingCategory.description} onChange={(event) => setEditingCategory({ ...editingCategory, description: event.target.value })} className="mt-1.5 min-h-24 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800" /></label><label className="text-sm font-medium text-stone-700 dark:text-stone-300">Replace image <input type="file" accept="image/*" onChange={(event) => setReplacementCategoryImage(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm" /></label><label className="flex items-center gap-2 self-end text-sm font-medium text-stone-700 dark:text-stone-300"><input type="checkbox" checked={editingCategory.is_active} onChange={(event) => setEditingCategory({ ...editingCategory, is_active: event.target.checked })} className="h-4 w-4 accent-amber-500" /> Show category card</label><button type="submit" disabled={savingId === editingCategory.id} className="sm:col-span-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-400 disabled:opacity-60">{savingId === editingCategory.id ? "Saving changes…" : "Save category changes"}</button></form></section>}

        {promoBanner && <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-green-700 dark:text-green-400">Homepage content</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">Promo banner</h2><p className="mt-1 text-xs text-stone-500 dark:text-stone-400">The discount changes displayed prices only while this banner is active.</p></div><form onSubmit={savePromoBanner} className="mt-5 grid gap-4 sm:grid-cols-2"><AdminField label="Eyebrow" value={promoBanner.eyebrow} onChange={(value) => setPromoBanner({ ...promoBanner, eyebrow: value })} required /><AdminField label="CTA label" value={promoBanner.cta_label} onChange={(value) => setPromoBanner({ ...promoBanner, cta_label: value })} required /><AdminField label="Title" value={promoBanner.title} onChange={(value) => setPromoBanner({ ...promoBanner, title: value })} required /><AdminField label="Highlight" value={promoBanner.highlight ?? ""} onChange={(value) => setPromoBanner({ ...promoBanner, highlight: value })} /><AdminField label="CTA path" value={promoBanner.cta_path} onChange={(value) => setPromoBanner({ ...promoBanner, cta_path: value })} required /><AdminField label="Discount (%)" type="number" min="0" max="100" step="0.01" value={promoBanner.discount_percent ?? 0} onChange={(value) => setPromoBanner({ ...promoBanner, discount_percent: value })} /><AdminField label="Offer ends at (optional)" type="datetime-local" value={promoBanner.ends_at ?? ""} onChange={(value) => setPromoBanner({ ...promoBanner, ends_at: value })} /><label className="text-sm font-medium text-stone-700 dark:text-stone-300">Discount applies to<select value={promoBanner.discount_scope || "all"} onChange={(event) => setPromoBanner({ ...promoBanner, discount_scope: event.target.value })} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-green-600 dark:border-stone-700 dark:bg-stone-800"><option value="all">All in-stock products</option><option value="categories">Selected categories</option></select></label><label className="flex items-center gap-2 self-end text-sm font-medium text-stone-700 dark:text-stone-300"><input type="checkbox" checked={promoBanner.is_active} onChange={(event) => setPromoBanner({ ...promoBanner, is_active: event.target.checked })} className="h-4 w-4 accent-green-600" /> Show banner</label>{promoBanner.discount_scope === "categories" && <fieldset className="sm:col-span-2"><legend className="text-sm font-medium text-stone-700 dark:text-stone-300">Discounted categories</legend><div className="mt-2 flex flex-wrap gap-3">{categories.map((category) => { const checked = promoBanner.discount_categories?.includes(category.name); return <label key={category.id} className="flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-700 dark:border-stone-700 dark:text-stone-300"><input type="checkbox" checked={checked} onChange={() => setPromoBanner({ ...promoBanner, discount_categories: checked ? promoBanner.discount_categories.filter((name) => name !== category.name) : [...(promoBanner.discount_categories || []), category.name] })} className="h-4 w-4 accent-green-600" /> {category.name}</label>; })}</div></fieldset>}<label className="text-sm font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Description<textarea required value={promoBanner.description} onChange={(event) => setPromoBanner({ ...promoBanner, description: event.target.value })} className="mt-1.5 min-h-24 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-green-600 dark:border-stone-700 dark:bg-stone-800" /></label><label className="text-sm font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Banner image <input type="file" accept="image/*" onChange={(event) => setPromoImage(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm" /></label><button type="submit" disabled={savingId === "promo-banner"} className="sm:col-span-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">{savingId === "promo-banner" ? "Saving banner…" : "Save promo banner"}</button></form></section>}

        <section className="mt-8 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-3 border-b border-stone-100 px-5 py-5 dark:border-stone-800 sm:px-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"><ClipboardList size={19} /></span><div><h2 className="font-semibold text-stone-900 dark:text-stone-100">Recent orders</h2><p className="text-xs text-stone-500 dark:text-stone-400">Update fulfilment only after payment is confirmed.</p></div></div>
          {loading ? <LoadingRows /> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900/60 dark:text-stone-400"><tr><th className="px-6 py-3 font-semibold">Order</th><th className="px-4 py-3 font-semibold">Customer</th><th className="px-4 py-3 font-semibold">Items</th><th className="px-4 py-3 font-semibold">Payment</th><th className="px-4 py-3 font-semibold">Fulfilment</th></tr></thead><tbody className="divide-y divide-stone-100 dark:divide-stone-800">{orders.map((order) => <tr key={order.id}><td className="px-6 py-4"><p className="font-semibold text-stone-900 dark:text-stone-100">{order.order_number}</p><p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{formatMoney(order.total)}</p></td><td className="px-4 py-4 text-stone-600 dark:text-stone-300">{order.contact_email}</td><td className="px-4 py-4 text-stone-600 dark:text-stone-300">{order.order_items?.map((item) => `${item.product_name} × ${item.quantity}`).join(", ") || "—"}</td><td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[order.payment_status] ?? "bg-stone-100 text-stone-600"}`}>{formatStatus(order.payment_status)}</span></td><td className="px-4 py-4"><select aria-label={`Fulfilment status for ${order.order_number}`} disabled={order.payment_status !== "paid" || savingId === order.id} value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value)} className="rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800">{orderStatuses.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}</select></td></tr>)}</tbody></table></div>}
        </section>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, tone }) {
  const tones = { green: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400", emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400", amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400", red: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400" };
  return <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}><Icon size={19} /></div><p className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-100">{value}</p><p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{label}</p></div>;
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
