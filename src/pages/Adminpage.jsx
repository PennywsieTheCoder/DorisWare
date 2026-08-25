import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { 
  AlertOctagon,
  BarChart3, 
  Box, 
  CheckCircle2, 
  ClipboardList, 
  Crown,
  ExternalLink,
  Flame,
  Inbox,
  LayoutGrid,
  Mail,
  MapPin,
  Package, 
  Pencil, 
  Plus, 
  RefreshCw, 
  Settings2, 
  ShieldCheck, 
  ShoppingBag, 
  Sparkles, 
  TrendingUp, 
  Truck 
} from "lucide-react";
import { useAuth } from "../context/Authcontext";
import { supabase } from "../lib/supabase";
import HeroImageManager from "../components/HeroImageManager";
import StoreLogoManager from "../components/StoreLogoManager";
import BulkProductImport from "../components/BulkProductImport";

const orderStatuses = ["processing", "shipped", "delivered", "cancelled"];
const ProductCategoryContext = createContext([]);

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
  const [contactSettings, setContactSettings] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [allCustomerMessages, setSupportMessages] = useState([]);
  const [inboxFilter, setInboxFilter] = useState("all");
  const [subscribers, setSubscribers] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [clubSettings, setClubSettings] = useState(null);
  const [clubTiers, setClubTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [savingId, setSavingId] = useState("");
  const [reportRange, setReportRange] = useState(30);
  const [selectedReportDay, setSelectedReportDay] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", category: "Cookware", description: "", price: "", stock: "0", featured: false });
  const [productImage, setProductImage] = useState(null);
  const [productGalleryImages, setProductGalleryImages] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [replacementImage, setReplacementImage] = useState(null);
  const [replacementGalleryImages, setReplacementGalleryImages] = useState([]);
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
    return { paidOrders, revenue, average: paidOrders.length ? revenue / paidOrders.length : 0, customerArranged: paidOrders.filter((order) => order.delivery_method === "customer_arranged").length, daily, topProducts: Object.entries(productsSold).sort(([, a], [, b]) => b - a).slice(0, 5) };
  }, [orders, reportRange]);

  const topSellingDetails = useMemo(() => {
    return report.topProducts.map(([name, quantity], index) => {
      const product = products.find((p) => p.name?.toLowerCase() === name?.toLowerCase()) || {};
      return {
        name,
        quantity,
        rank: index + 1,
        image_url: product.image_url || product.image_urls?.[0] || null,
        price: product.price || 0,
        category: product.category || "Cookware",
      };
    });
  }, [report.topProducts, products]);

  const supportMessages = allCustomerMessages.filter((message) => inboxFilter === "all" || (message.message_type ?? "support") === inboxFilter);
  const availableProductCategories = categories.filter((category) => category.is_active).map((category) => category.name);

  function showSaveSuccess(message) {
    setSuccessMessage(message);
    window.setTimeout(() => setSuccessMessage(""), 2800);
  }

  async function loadDashboard() {
    setLoading(true);
    setError("");
    const [productsResult, categoriesResult, zonesResult, bannerResult, ordersResult, reviewsResult, aboutResult, messagesResult, subscribersResult, contactSettingsResult, socialLinksResult, clubSettingsResult, clubTiersResult] = await Promise.all([
      supabase.from("products").select("id, name, category, description, price, stock_quantity, image_url, image_urls, featured, is_active").order("created_at"),
      supabase.from("categories").select("id, name, description, image_url, sort_order, is_active").order("sort_order"),
      supabase.from("delivery_zones").select("id, name, regions, shipping_fee, estimated_delivery, is_active, sort_order").order("sort_order"),
      supabase.from("promo_banners").select("id, eyebrow, title, highlight, description, cta_label, cta_path, image_url, is_active, ends_at, discount_percent, discount_scope, discount_categories").order("sort_order").limit(1).maybeSingle(),
      supabase.from("orders").select("id, order_number, contact_email, contact_phone, shipping_address, total, status, payment_status, payment_method, delivery_method, tracking_number, estimated_delivery_at, fulfilment_note, created_at, order_items(product_name, quantity)").order("created_at", { ascending: false }).limit(250),
      supabase.from("product_reviews").select("id, product_id, user_id, rating, title, body, is_visible, created_at").order("created_at", { ascending: false }),
      supabase.from("about_content").select("id, eyebrow, title, description, image_url, is_active").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("support_messages").select("id, first_name, last_name, email, phone, subject, message, message_type, status, created_at").order("created_at", { ascending: false }).limit(100),
      supabase.from("newsletter_subscribers").select("id, email, status, created_at").order("created_at", { ascending: false }).limit(100),
      supabase.from("store_contact_settings").select("id, email, phone, whatsapp_number, location_label, directions_url, support_hours, logo_url").eq("id", true).maybeSingle(),
      supabase.from("store_social_links").select("platform, url, is_active, sort_order").order("sort_order"),
      supabase.from("club_settings").select("id, is_active, points_per_ghs, include_delivery_in_points").eq("id", true).maybeSingle(),
      supabase.from("club_tiers").select("id, name, required_points, benefit, is_active, sort_order").order("sort_order"),
    ]);

    if (productsResult.error || categoriesResult.error || zonesResult.error || bannerResult.error || ordersResult.error || reviewsResult.error || aboutResult.error || messagesResult.error || subscribersResult.error || contactSettingsResult.error || socialLinksResult.error || clubSettingsResult.error || clubTiersResult.error) {
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
      setContactSettings(contactSettingsResult.data);
      setSocialLinks(socialLinksResult.data);
      setClubSettings(clubSettingsResult.data);
      setClubTiers(clubTiersResult.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (user?.role === "admin") queueMicrotask(loadDashboard);
  }, [user?.role]);

  useEffect(() => {
    const headingsBySection = {
      products: ["Add a product", "Bulk product import", "Products & inventory", "Category cards"],
      orders: ["Tracking & delivery details", "Review moderation", "Recent orders"],
      delivery: ["Delivery zones"],
      promotions: ["Promo banner", "About page"],
      inbox: ["Customer inbox"],
      contact: ["Contact & location"],
      club: ["DorisWare Club"],
    };
    const managedSections = Object.values(headingsBySection).flat().map((heading) => [...document.querySelectorAll("h2")].find((element) => element.textContent === heading)?.closest("section")).filter(Boolean);
    document.querySelectorAll("section.border-green-200, section.border-amber-200").forEach((section) => managedSections.push(section));
    managedSections.forEach((section) => { section.hidden = activeSection === "overview" || !headingsBySection[activeSection]?.some((heading) => section.querySelector("h2")?.textContent === heading) && !((activeSection === "products") && (section.classList.contains("border-green-200") || section.classList.contains("border-amber-200"))); });
  }, [activeSection, editingProduct, editingCategory, promoBanner, aboutContent, supportMessages, clubSettings, clubTiers]);

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

  async function uploadProductImages(productId, files) {
    const urls = [];
    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${productId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
      if (uploadError) return { error: uploadError };
      urls.push(supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
    }
    return { data: urls };
  }

  async function createProduct(event) {
    event.preventDefault();
    const id = newProduct.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!id || !newProduct.description || Number(newProduct.price) < 0 || Number(newProduct.stock) < 0) {
      setError("Enter a product name, description, valid price, and stock quantity."); return;
    }
    setSavingId("new-product"); setError("");
    const upload = await uploadProductImages(id, [productImage, ...productGalleryImages].filter(Boolean));
    if (upload.error) { setError("Product image upload failed. Please try again."); setSavingId(""); return; }
    const imageUrls = upload.data;
    const { data, error: insertError } = await supabase.from("products").insert({ id, name: newProduct.name.trim(), category: newProduct.category, description: newProduct.description.trim(), price: Number(newProduct.price), stock_quantity: Number(newProduct.stock), featured: newProduct.featured, image_url: imageUrls[0] ?? null, image_urls: imageUrls }).select("id, name, category, description, price, stock_quantity, image_url, image_urls, featured, is_active").single();
    if (insertError) setError(insertError.code === "23505" ? "A product with this name already exists." : "Product could not be created.");
    else { setProducts((current) => [...current, data]); setNewProduct({ name: "", category: "Cookware", description: "", price: "", stock: "0", featured: false }); setProductImage(null); setProductGalleryImages([]); setShowCreateProduct(false); }
    setSavingId("");
  }

  async function saveProductEdit(event) {
    event.preventDefault();
    if (!editingProduct) return;
    setSavingId(editingProduct.id); setError("");
    let imageUrls = editingProduct.image_urls?.length ? editingProduct.image_urls : [editingProduct.image_url].filter(Boolean);
    const replacementFiles = [replacementImage, ...replacementGalleryImages].filter(Boolean);
    if (replacementFiles.length) {
      const upload = await uploadProductImages(editingProduct.id, replacementFiles);
      if (upload.error) { setError("Replacement image upload failed."); setSavingId(""); return; }
      imageUrls = upload.data;
    }
    const updates = { name: editingProduct.name.trim(), category: editingProduct.category, description: editingProduct.description.trim(), price: Number(editingProduct.price), stock_quantity: Number(editingProduct.stock_quantity), featured: editingProduct.featured, is_active: editingProduct.is_active, image_url: imageUrls[0] ?? null, image_urls: imageUrls };
    const { error: updateError } = await supabase.from("products").update(updates).eq("id", editingProduct.id);
    if (updateError) setError("Product details could not be updated.");
    else { setProducts((current) => current.map((product) => product.id === editingProduct.id ? { ...product, ...updates } : product)); setEditingProduct(null); setReplacementImage(null); setReplacementGalleryImages([]); }
    setSavingId("");
  }

  async function saveCategoryEdit(event) {
    event.preventDefault();
    if (!editingCategory) return;
    const categoryId = editingCategory.id || editingCategory.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!categoryId || !editingCategory.description.trim() || (!editingCategory.id && !replacementCategoryImage)) { setError("Enter a name and description, then choose an image for the new category."); return; }
    setSavingId(categoryId); setError("");
    let imageUrl = editingCategory.image_url;
    if (replacementCategoryImage) {
      const extension = replacementCategoryImage.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${categoryId}/${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("category-images").upload(path, replacementCategoryImage, { contentType: replacementCategoryImage.type });
      if (uploadError) { setError("Category image upload failed."); setSavingId(""); return; }
      imageUrl = supabase.storage.from("category-images").getPublicUrl(path).data.publicUrl;
    }
    const updates = { name: editingCategory.name.trim(), description: editingCategory.description.trim(), sort_order: Number(editingCategory.sort_order), is_active: editingCategory.is_active, image_url: imageUrl };
    const result = editingCategory.id ? await supabase.from("categories").update(updates).eq("id", editingCategory.id).select().single() : await supabase.from("categories").insert({ id: categoryId, ...updates }).select().single();
    if (result.error) setError(editingCategory.id ? "Category details could not be updated." : "Category could not be created. Its name may already be in use.");
    else { setCategories((current) => (editingCategory.id ? current.map((category) => category.id === editingCategory.id ? result.data : category) : [...current, result.data]).sort((a, b) => a.sort_order - b.sort_order)); setEditingCategory(null); setReplacementCategoryImage(null); }
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

  async function saveContactSettings(event) {
    event.preventDefault();
    if (!contactSettings) return;
    setSavingId("contact-settings"); setError("");
    const updates = { email: contactSettings.email.trim(), phone: contactSettings.phone.trim(), whatsapp_number: contactSettings.whatsapp_number.replace(/\D/g, ""), location_label: contactSettings.location_label.trim(), directions_url: contactSettings.directions_url.trim(), support_hours: contactSettings.support_hours.trim() };
    const { data, error: updateError } = await supabase.from("store_contact_settings").update(updates).eq("id", true).select("id, email, phone, whatsapp_number, location_label, directions_url, support_hours").single();
    if (updateError) setError("Contact settings could not be saved. Check that the directions URL is valid."); else setContactSettings(data);
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

  async function saveClubSettings(event) {
    event.preventDefault();
    if (!clubSettings) return;
    setSavingId("club-settings"); setError("");
    const updates = {
      is_active: clubSettings.is_active,
      points_per_ghs: Number(clubSettings.points_per_ghs),
      include_delivery_in_points: clubSettings.include_delivery_in_points,
    };
    const { data, error: updateError } = await supabase.from("club_settings").update(updates).eq("id", true).select("id, is_active, points_per_ghs, include_delivery_in_points").single();
    if (updateError) setError("DorisWare Club settings could not be saved."); else { setClubSettings(data); showSaveSuccess("Club settings saved."); }
    setSavingId("");
  }

  async function saveClubTier(event, tier) {
    event.preventDefault();
    setSavingId(`club-tier-${tier.id}`); setError("");
    const updates = { name: tier.name.trim(), required_points: Number(tier.required_points), benefit: tier.benefit.trim(), is_active: tier.is_active, sort_order: Number(tier.sort_order) };
    const { data, error: updateError } = await supabase.from("club_tiers").update(updates).eq("id", tier.id).select("id, name, required_points, benefit, is_active, sort_order").single();
    if (updateError) setError("Club tier could not be saved. Each tier needs a unique points threshold."); else { setClubTiers((current) => current.map((item) => item.id === tier.id ? data : item).sort((a, b) => a.sort_order - b.sort_order)); showSaveSuccess(`${data.name} tier saved.`); }
    setSavingId("");
  }

  if (authLoading) return <div className="flex min-h-[60vh] items-center justify-center text-sm text-stone-500">Loading admin dashboard…</div>;
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;

  const adminDisplayName = user?.name || user?.full_name || (user?.email ? user.email.split("@")[0] : "Admin");

  return (
    <ProductCategoryContext.Provider value={availableProductCategories}>
    {/* Accessibility: Skip to main content link */}
    <a 
      href="#admin-main" 
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-stone-950 focus:font-bold focus:rounded-xl focus:shadow-2xl focus:outline-none"
    >
      Skip to main content
    </a>

    <div className="flex min-h-screen bg-[#f6f6f3] dark:bg-[#0a0a0c]">
      
      {/* ================= LEFT VERTICAL SIDEBAR (DESKTOP) ================= */}
      <aside className="hidden md:flex w-64 lg:w-72 shrink-0 min-h-screen bg-stone-950 border-r border-stone-800/80 p-5 flex-col justify-between sticky top-0 h-screen overflow-y-auto">
        <div>
          {/* Brand & Store Operations Header */}
          <div className="flex items-center gap-3 px-2 py-3 border-b border-stone-800/80 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-stone-950 font-bold shadow-lg shadow-emerald-500/20">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold tracking-tight text-white">DorisWare</h2>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Admin Operations
              </div>
            </div>
          </div>

          {/* Section Navigation Header */}
          <div className="mt-6 px-3">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500">Navigation</p>
          </div>

          {/* THE EXACT 8 NAVIGATIONS IN VERTICAL STYLE */}
          <nav className="mt-2 space-y-1.5" aria-label="Admin Navigation">
            {[
              ["overview", "Overview", LayoutGrid, null],
              ["products", "Products", Box, products.length],
              ["orders", "Orders", ShoppingBag, orders.filter((o) => o.status === "processing" || o.payment_status === "paid").length],
              ["delivery", "Delivery", Truck, null],
              ["promotions", "Promotions", Sparkles, null],
              ["club", "DorisWare Club", Crown, null],
              ["contact", "Contact & location", MapPin, null],
              ["inbox", "Inbox", Inbox, supportMessages.filter((message) => message.status === "new").length],
            ].map(([id, label, Icon, count]) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveSection(id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                    isActive
                      ? "bg-emerald-500 text-stone-950 font-bold shadow-lg shadow-emerald-500/20"
                      : "text-stone-400 hover:text-white hover:bg-stone-900 border border-transparent hover:border-stone-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? "text-stone-950" : "text-stone-400"} />
                    <span>{label}</span>
                  </div>
                  {count !== null && count > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                      isActive
                        ? "bg-stone-950/20 text-stone-950"
                        : id === "inbox"
                          ? "bg-red-500 text-white"
                          : id === "orders"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-stone-800 text-stone-300"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar User Profile & Storefront Link */}
        <div className="pt-4 border-t border-stone-800/80">
          <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-800 text-white font-bold text-xs">
                {(adminDisplayName?.[0] || "A").toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{adminDisplayName}</p>
                <p className="text-[10px] text-stone-400 truncate">Store Manager</p>
              </div>
            </div>
            <Link 
              to="/shop" 
              className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 py-2 text-xs font-bold transition"
            >
              <ExternalLink size={13} />
              View Storefront
            </Link>
          </div>
        </div>
      </aside>

      {/* ================= RIGHT MAIN CONTENT AREA ================= */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200/80 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-stone-800/80 dark:bg-stone-950/80 sm:px-8">
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-3xl">
              Welcome back, <span className="italic font-normal text-emerald-600 dark:text-emerald-300">{adminDisplayName}!</span>
            </h1>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
              DorisWare Store Operations Hub
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={loadDashboard} 
              className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 active:scale-95 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              <RefreshCw size={14} className="text-emerald-500 transition-transform duration-500 group-hover:rotate-180" /> 
              Refresh data
            </button>
            <Link 
              to="/shop" 
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-xs font-bold text-stone-950 shadow-md shadow-emerald-500/20 transition active:scale-95"
            >
              <ShoppingBag size={14} />
              <span className="hidden sm:inline">View Storefront</span>
            </Link>
          </div>
        </header>

        {/* Mobile Horizontal Navigation Bar (Visible only on < md screens) */}
        <div className="md:hidden border-b border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-950">
          <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1" aria-label="Mobile Admin Sections">
            {[
              ["overview", "Overview", LayoutGrid, null],
              ["products", "Products", Box, products.length],
              ["orders", "Orders", ShoppingBag, orders.filter((o) => o.status === "processing" || o.payment_status === "paid").length],
              ["delivery", "Delivery", Truck, null],
              ["promotions", "Promotions", Sparkles, null],
              ["club", "DorisWare Club", Crown, null],
              ["contact", "Contact & location", MapPin, null],
              ["inbox", "Inbox", Inbox, supportMessages.filter((message) => message.status === "new").length],
            ].map(([id, label, Icon, count]) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveSection(id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-emerald-500 text-stone-950 font-bold shadow-sm"
                      : "bg-stone-100 text-stone-600 dark:bg-stone-900 dark:text-stone-400"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                  {count !== null && count > 0 && (
                    <span className="text-[10px] font-bold font-mono">({count})</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <main id="admin-main" className="w-full flex-1 p-5 sm:p-8 space-y-8">

        {error && <p role="alert" className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
        {successMessage && <div role="status" className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-xl motion-safe:animate-pulse"><CheckCircle2 size={18} /> {successMessage}</div>}

        {activeSection === "contact" && <div className="mt-4 rounded-2xl border border-dashed border-sky-300 bg-sky-50/60 px-5 py-4 text-sm text-sky-950 dark:border-sky-800 dark:bg-sky-950/20 dark:text-sky-100"><p className="font-semibold">Adding the Google Maps link</p><ol className="mt-2 list-decimal space-y-1 pl-5 text-sky-900/80 dark:text-sky-100/80"><li>Open Google Maps and find your store.</li><li>Choose <strong>Share</strong> and copy its link.</li><li>Paste it into the directions field, save, then use <strong>Test directions</strong>.</li></ol></div>}

        {contactSettings && <section className="mt-6 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-sky-700 dark:text-sky-400">Storefront details</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">Contact & location</h2><p className="mt-1 text-xs text-stone-500 dark:text-stone-400">These values appear on the public Contact page. Paste a Google Maps directions link so customers can navigate there instantly.</p></div><form onSubmit={saveContactSettings} className="mt-5 grid gap-4 sm:grid-cols-2"><AdminField label="Public email" type="email" value={contactSettings.email} onChange={(value) => setContactSettings({ ...contactSettings, email: value })} required /><AdminField label="Phone number" type="tel" value={contactSettings.phone} onChange={(value) => setContactSettings({ ...contactSettings, phone: value })} required /><AdminField label="WhatsApp number (country code, digits only)" value={contactSettings.whatsapp_number} onChange={(value) => setContactSettings({ ...contactSettings, whatsapp_number: value })} required /><AdminField label="Location label" value={contactSettings.location_label} onChange={(value) => setContactSettings({ ...contactSettings, location_label: value })} required /><AdminField label="Google Maps directions URL" type="url" value={contactSettings.directions_url} onChange={(value) => setContactSettings({ ...contactSettings, directions_url: value })} className="sm:col-span-2" required /><label className="text-sm font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Support hours<textarea required value={contactSettings.support_hours} onChange={(event) => setContactSettings({ ...contactSettings, support_hours: event.target.value })} rows="4" className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-sky-600 dark:border-stone-700 dark:bg-stone-800" /></label><button type="submit" disabled={savingId === "contact-settings"} className="sm:col-span-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60">{savingId === "contact-settings" ? "Saving contact details…" : "Save contact details"}</button></form></section>}


        {clubSettings && <section className="mt-6 rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-950/60 dark:bg-stone-900 sm:p-6"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-400">Customer loyalty</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">DorisWare Club</h2><p className="mt-1 text-xs text-stone-500 dark:text-stone-400">These rules are applied securely when Paystack confirms a payment. Changes affect future paid orders only.</p></div><form onSubmit={saveClubSettings} className="mt-5 grid gap-4 rounded-2xl bg-emerald-50/70 p-4 dark:bg-emerald-950/15 sm:grid-cols-2"><AdminField label="Points per ₵1 spent" type="number" min="0" max="100" step="0.01" value={clubSettings.points_per_ghs} onChange={(value) => setClubSettings({ ...clubSettings, points_per_ghs: value })} required /><label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-stone-700 dark:text-stone-300"><input type="checkbox" checked={clubSettings.include_delivery_in_points} onChange={(event) => setClubSettings({ ...clubSettings, include_delivery_in_points: event.target.checked })} className="h-4 w-4 accent-emerald-600" /> Include delivery fees when awarding points</label><label className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300 sm:col-span-2"><input type="checkbox" checked={clubSettings.is_active} onChange={(event) => setClubSettings({ ...clubSettings, is_active: event.target.checked })} className="h-4 w-4 accent-emerald-600" /> DorisWare Club is active</label><button type="submit" disabled={savingId === "club-settings"} className="sm:col-span-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">{savingId === "club-settings" ? "Saving Club settings…" : "Save Club settings"}</button></form><div className="mt-6"><h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Membership tiers</h3><div className="mt-3 grid gap-4 lg:grid-cols-3">{clubTiers.map((tier) => <form key={tier.id} onSubmit={(event) => saveClubTier(event, tier)} className="rounded-2xl border border-stone-200 p-4 dark:border-stone-700"><AdminField label="Tier name" value={tier.name} onChange={(value) => setClubTiers((current) => current.map((item) => item.id === tier.id ? { ...item, name: value } : item))} required /><AdminField label="Points required" type="number" min="0" step="1" value={tier.required_points} onChange={(value) => setClubTiers((current) => current.map((item) => item.id === tier.id ? { ...item, required_points: value } : item))} required /><label className="mt-3 block text-sm font-medium text-stone-700 dark:text-stone-300">Member message<textarea value={tier.benefit} onChange={(event) => setClubTiers((current) => current.map((item) => item.id === tier.id ? { ...item, benefit: event.target.value } : item))} rows="3" className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-800" /></label><label className="mt-3 flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300"><input type="checkbox" checked={tier.is_active} onChange={(event) => setClubTiers((current) => current.map((item) => item.id === tier.id ? { ...item, is_active: event.target.checked } : item))} className="h-4 w-4 accent-emerald-600" /> Available tier</label><button type="submit" disabled={savingId === `club-tier-${tier.id}`} className="mt-4 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">{savingId === `club-tier-${tier.id}` ? "Saving…" : "Save tier"}</button></form>)}</div></div></section>}

        {/* Inbox section is now self-contained below */}

        {activeSection === "promotions" && <HeroImageManager />}
        {activeSection === "contact" && <StoreLogoManager />}
        {activeSection === "products" && <CategoryManager categories={categories} onCategoriesChange={setCategories} />}
        {activeSection === "products" && <BulkProductImport categories={availableProductCategories} existingProducts={products} onImported={(createdProducts) => setProducts((current) => [...current, ...createdProducts])} />}

        {activeSection === "contact" && <SocialLinksManager links={socialLinks} onLinksChange={setSocialLinks} setPageError={setError} />}
        {activeSection === "overview" && (
          <div className="space-y-8">
            {/* 4 Stat KPI Cards (Inspo 2 Highlight Layout) */}
            <section aria-label="Key performance indicators" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Hero Highlight Card: Paid Revenue */}
              <div className="rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white shadow-xl shadow-emerald-950/40 border border-emerald-500/30 group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Total Paid Revenue</span>
                  <span className="text-xs font-bold bg-emerald-950/50 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <TrendingUp size={13} /> Active
                  </span>
                </div>
                <p className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">{formatMoney(metrics.revenue)}</p>
                <p className="mt-1.5 text-xs text-emerald-100/90 font-medium">Verified gross earnings</p>
              </div>

              {/* Card 2: Paid Orders */}
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 dark:border-stone-800 dark:bg-stone-900/90 hover:border-emerald-500/40 group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Paid Orders</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition">
                    <ShoppingBag size={18} />
                  </div>
                </div>
                <p className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">{metrics.paidOrders}</p>
                <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium">Completed transactions</p>
              </div>

              {/* Card 3: Low Stock Alert */}
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 dark:border-stone-800 dark:bg-stone-900/90 hover:border-amber-500/40 group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Low Stock Alert</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition">
                    <Package size={18} />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{metrics.lowStock}</span>
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40">&lt; 5 left</span>
                </div>
                <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium">Restocking required</p>
              </div>

              {/* Card 4: Out of Stock */}
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 dark:border-stone-800 dark:bg-stone-900/90 hover:border-red-500/40 group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Out of Stock</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 group-hover:scale-105 transition">
                    <AlertOctagon size={18} />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">{metrics.outOfStock}</span>
                  {metrics.outOfStock > 0 && (
                    <span className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800/40">Unavailable</span>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium">Hidden from catalog</p>
              </div>
            </section>

            {/* Top Selling Products Showcase (Inspo 3 Layout) */}
            <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-sm dark:border-stone-800 dark:bg-stone-900/90">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-5 dark:border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <Flame size={19} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.14em] text-emerald-600 dark:text-emerald-400">Product Performance</p>
                    <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Top Selling Products</h2>
                  </div>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">Ranked by verified units sold in this period</p>
              </div>

              {topSellingDetails.length > 0 ? (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {topSellingDetails.map((item) => (
                    <div 
                      key={item.name} 
                      className="group relative flex flex-col items-center text-center rounded-3xl border border-stone-200 bg-stone-50/60 p-4 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-md dark:border-stone-800 dark:bg-stone-950/60"
                    >
                      {/* Rank Badge */}
                      <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm ${
                        item.rank === 1 
                          ? "bg-amber-500 text-stone-950" 
                          : item.rank === 2 
                            ? "bg-stone-600 text-white" 
                            : item.rank === 3 
                              ? "bg-amber-800 text-white" 
                              : "bg-stone-800 text-stone-400"
                      }`}>
                        #{item.rank}
                      </span>

                      {/* Thumbnail or Fallback Icon */}
                      <div className="mt-2 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-stone-200/80 bg-white transition-transform duration-300 group-hover:scale-[1.02] dark:border-stone-800 dark:bg-stone-900">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <Box size={28} className="text-stone-400" />
                        )}
                      </div>

                      <h3 className="mt-3 w-full truncate text-xs font-semibold text-stone-900 dark:text-stone-100" title={item.name}>
                        {item.name}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">{item.category}</p>

                      <div className="mt-3 flex w-full items-center justify-between border-t border-stone-200/60 pt-2 text-xs dark:border-stone-800/80">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.price ? formatMoney(item.price) : "—"}</span>
                        <span className="font-semibold text-stone-700 dark:text-stone-300">{item.quantity} sold</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
                  No product sales recorded for this period yet.
                </p>
              )}
            </section>

            {/* Sales Intelligence & Fulfilment Row (Inspo 2 & Inspo 3) */}
            <InteractiveReport 
              report={report} 
              reportRange={reportRange}
              setReportRange={setReportRange}
              formatMoney={formatMoney} 
              selectedDay={selectedReportDay} 
              onSelectDay={setSelectedReportDay} 
            />
          </div>
        )}

        {/* Product tools */}
        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-stone-900 dark:text-stone-100">Add a product</h2><p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Create a product and optionally upload its storefront image.</p></div><button type="button" onClick={() => setShowCreateProduct((open) => !open)} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"><Plus size={16} /> {showCreateProduct ? "Close form" : "New product"}</button></div>
          {showCreateProduct && <form onSubmit={createProduct} className="mt-6 grid gap-4 border-t border-stone-100 pt-6 dark:border-stone-800 sm:grid-cols-2"><AdminField label="Product name" value={newProduct.name} onChange={(value) => setNewProduct({ ...newProduct, name: value })} required /><AdminField label="Category" value={newProduct.category} onChange={(value) => setNewProduct({ ...newProduct, category: value })} required /><label className="text-sm font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Description<textarea required value={newProduct.description} onChange={(event) => setNewProduct({ ...newProduct, description: event.target.value })} className="mt-1.5 min-h-24 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-green-600 dark:border-stone-700 dark:bg-stone-800" /></label><AdminField label="Price (₵)" type="number" min="0" step="0.01" value={newProduct.price} onChange={(value) => setNewProduct({ ...newProduct, price: value })} required /><AdminField label="Stock quantity" type="number" min="0" value={newProduct.stock} onChange={(value) => setNewProduct({ ...newProduct, stock: value })} required /><label className="text-sm font-medium text-stone-700 dark:text-stone-300">Primary image <input type="file" accept="image/*" onChange={(event) => setProductImage(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm" /></label><label className="text-sm font-medium text-stone-700 dark:text-stone-300">Additional carousel images <input type="file" accept="image/*" multiple onChange={(event) => setProductGalleryImages(Array.from(event.target.files ?? []))} className="mt-1.5 block w-full text-sm" /><span className="mt-1 block text-xs font-normal text-stone-500">Optional. The primary image is the first slide.</span></label><label className="flex items-center gap-2 self-end text-sm font-medium text-stone-700 dark:text-stone-300"><input type="checkbox" checked={newProduct.featured} onChange={(event) => setNewProduct({ ...newProduct, featured: event.target.checked })} className="h-4 w-4 accent-green-600" /> Feature on homepage</label><button type="submit" disabled={savingId === "new-product"} className="sm:col-span-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-700 disabled:opacity-60 dark:bg-stone-700">{savingId === "new-product" ? "Creating product…" : "Create product"}</button></form>}
        </section>

        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-violet-700 dark:text-violet-400">Customer updates</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">Tracking & delivery details</h2><p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Saved details appear in the customer’s order tracking view.</p></div><div className="mt-5 grid gap-4 lg:grid-cols-2">{orders.filter((order) => order.payment_status === "paid").map((order) => <div key={order.id} className="rounded-2xl border border-stone-200 p-4 dark:border-stone-700"><p className="font-semibold text-stone-900 dark:text-stone-100">{order.order_number}</p><p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{order.delivery_method === "customer_arranged" ? "Customer-arranged" : "DorisWare delivery"}</p>{order.delivery_method !== "customer_arranged" && <div className="mt-3 rounded-xl bg-stone-50 p-3 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-300"><p className="font-semibold text-stone-900 dark:text-stone-100">Deliver to: {order.shipping_address?.recipient}</p><p>{order.shipping_address?.street}, {order.shipping_address?.city}</p><p>{order.shipping_address?.region}, {order.shipping_address?.country}</p><p className="mt-1">Phone: {order.contact_phone}</p></div>}<div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs font-medium text-stone-700 dark:text-stone-300">Tracking / rider reference<input defaultValue={order.tracking_number ?? ""} onBlur={(event) => { if (event.target.value !== (order.tracking_number ?? "")) updateOrderDetails(order.id, { tracking_number: event.target.value || null }); }} className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-sm dark:border-stone-700 dark:bg-stone-800" placeholder="e.g. Rider: 024…" /></label><label className="text-xs font-medium text-stone-700 dark:text-stone-300">Estimated delivery<input type="date" defaultValue={order.estimated_delivery_at ?? ""} onChange={(event) => updateOrderDetails(order.id, { estimated_delivery_at: event.target.value || null })} className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-sm dark:border-stone-700 dark:bg-stone-800" /></label><label className="text-xs font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Customer note<textarea defaultValue={order.fulfilment_note ?? ""} onBlur={(event) => { if (event.target.value !== (order.fulfilment_note ?? "")) updateOrderDetails(order.id, { fulfilment_note: event.target.value || null }); }} className="mt-1 min-h-18 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-sm dark:border-stone-700 dark:bg-stone-800" placeholder="Rider contact or pickup instruction" /></label></div></div>)}</div></section>

        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-rose-600 dark:text-rose-400">Customer feedback</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">Review moderation</h2><p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Approve genuine reviews to publish them, or hide them from the storefront.</p></div><span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">{reviews.filter((review) => !review.is_visible).length} pending</span></div>{loading ? <LoadingRows /> : reviews.length ? <div className="mt-5 grid gap-3 lg:grid-cols-2">{reviews.map((review) => <article key={review.id} className="rounded-2xl border border-stone-200 p-4 dark:border-stone-700"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-stone-900 dark:text-stone-100">{products.find((product) => product.id === review.product_id)?.name ?? review.product_id}</p><p className="mt-1 text-xs text-amber-600">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${review.is_visible ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"}`}>{review.is_visible ? "Published" : "Pending"}</span></div>{review.title && <p className="mt-3 text-sm font-semibold text-stone-800 dark:text-stone-200">{review.title}</p>}{review.body && <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">{review.body}</p>}<div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-100 pt-3 dark:border-stone-800"><p className="text-xs text-stone-400">{new Date(review.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p><button type="button" disabled={savingId === review.id} onClick={() => updateReviewVisibility(review.id, !review.is_visible)} className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-60 ${review.is_visible ? "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>{savingId === review.id ? "Saving…" : review.is_visible ? "Hide review" : "Approve review"}</button></div></article>)}</div> : <p className="mt-5 rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">No customer reviews have been submitted yet.</p>}</section>

        <section className="mt-8 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-5 py-5 dark:border-stone-800 sm:px-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"><Settings2 size={19} /></span><div><h2 className="font-semibold text-stone-900 dark:text-stone-100">Products & inventory</h2><p className="text-xs text-stone-500 dark:text-stone-400">Update stock, visibility, and featured items.</p></div></div><Link to="/shop" className="text-sm font-semibold text-green-700 hover:text-green-800 dark:text-green-400">View shop →</Link></div>
          {loading ? <LoadingRows /> : <div className="overflow-x-auto"><table className="w-full min-w-[790px] text-left text-sm"><thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900/60 dark:text-stone-400"><tr><th className="px-6 py-3 font-semibold">Product</th><th className="px-4 py-3 font-semibold">Price</th><th className="px-4 py-3 font-semibold">Stock</th><th className="px-4 py-3 font-semibold">Featured</th><th className="px-4 py-3 font-semibold">Store visibility</th><th className="px-4 py-3 font-semibold">Edit</th></tr></thead><tbody className="divide-y divide-stone-100 dark:divide-stone-800">{products.map((product) => <tr key={product.id}><td className="px-6 py-4"><p className="font-semibold text-stone-900 dark:text-stone-100">{product.name}</p><p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{product.category}</p></td><td className="px-4 py-4 font-medium text-stone-700 dark:text-stone-300">{formatMoney(product.price)}</td><td className="px-4 py-4"><input aria-label={`${product.name} stock`} type="number" min="0" defaultValue={product.stock_quantity} onBlur={(event) => { const stock = Number(event.target.value); if (stock !== product.stock_quantity && stock >= 0) updateProduct(product.id, { stock_quantity: stock }); }} className="w-20 rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-800" /></td><td className="px-4 py-4"><Toggle checked={product.featured} disabled={savingId === product.id} label={`Feature ${product.name}`} onChange={(featured) => updateProduct(product.id, { featured })} /></td><td className="px-4 py-4"><Toggle checked={product.is_active} disabled={savingId === product.id} label={`Show ${product.name} in store`} onChange={(is_active) => updateProduct(product.id, { is_active })} /></td><td className="px-4 py-4"><button type="button" onClick={() => { setEditingProduct(product); setReplacementImage(null); }} className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"><Pencil size={14} /> Edit</button></td></tr>)}</tbody></table></div>}
        </section>

        {editingProduct && <section className="mt-8 rounded-3xl border border-green-200 bg-green-50/50 p-5 shadow-sm dark:border-green-900/50 dark:bg-green-950/15 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-green-700 dark:text-green-400">Editing product</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">{editingProduct.name}</h2></div><button type="button" onClick={() => setEditingProduct(null)} className="text-sm font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200">Cancel</button></div><form onSubmit={saveProductEdit} className="mt-5 grid gap-4 sm:grid-cols-2"><AdminField label="Product name" value={editingProduct.name} onChange={(value) => setEditingProduct({ ...editingProduct, name: value })} required /><AdminField label="Category" value={editingProduct.category} onChange={(value) => setEditingProduct({ ...editingProduct, category: value })} required /><label className="text-sm font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Description<textarea required value={editingProduct.description} onChange={(event) => setEditingProduct({ ...editingProduct, description: event.target.value })} className="mt-1.5 min-h-24 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-green-600 dark:border-stone-700 dark:bg-stone-800" /></label><AdminField label="Price (₵)" type="number" min="0" step="0.01" value={editingProduct.price} onChange={(value) => setEditingProduct({ ...editingProduct, price: value })} required /><AdminField label="Stock quantity" type="number" min="0" value={editingProduct.stock_quantity} onChange={(value) => setEditingProduct({ ...editingProduct, stock_quantity: value })} required /><label className="text-sm font-medium text-stone-700 dark:text-stone-300">Replace primary image <input type="file" accept="image/*" onChange={(event) => setReplacementImage(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm" /></label><label className="text-sm font-medium text-stone-700 dark:text-stone-300">Replace carousel gallery <input type="file" accept="image/*" multiple onChange={(event) => setReplacementGalleryImages(Array.from(event.target.files ?? []))} className="mt-1.5 block w-full text-sm" /><span className="mt-1 block text-xs font-normal text-stone-500">Selecting any image here replaces the saved gallery.</span></label><button type="submit" disabled={savingId === editingProduct.id} className="sm:col-span-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">{savingId === editingProduct.id ? "Saving changes…" : "Save product changes"}</button></form></section>}

        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"><Settings2 size={19} /></span><div><h2 className="font-semibold text-stone-900 dark:text-stone-100">Category cards</h2><p className="text-xs text-stone-500 dark:text-stone-400">Control home-page category content and display order.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <div key={category.id} className="flex items-center gap-3 rounded-2xl border border-stone-200 p-3 dark:border-stone-700"><img src={category.image_url} alt="" className="h-14 w-14 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="truncate font-semibold text-stone-900 dark:text-stone-100">{category.name}</p><p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">Position {category.sort_order} · {category.is_active ? "Visible" : "Hidden"}</p></div><button type="button" onClick={() => { setEditingCategory(category); setReplacementCategoryImage(null); }} className="rounded-lg border border-stone-200 p-2 text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800" aria-label={`Edit ${category.name}`}><Pencil size={15} /></button></div>)}</div></section>

        {editingCategory && <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/15 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-amber-700 dark:text-amber-400">Editing category</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">{editingCategory.name}</h2></div><button type="button" onClick={() => setEditingCategory(null)} className="text-sm font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200">Cancel</button></div><form onSubmit={saveCategoryEdit} className="mt-5 grid gap-4 sm:grid-cols-2"><AdminField label="Category name" value={editingCategory.name} onChange={(value) => setEditingCategory({ ...editingCategory, name: value })} required /><AdminField label="Display order" type="number" min="0" value={editingCategory.sort_order} onChange={(value) => setEditingCategory({ ...editingCategory, sort_order: value })} required /><label className="text-sm font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Description<textarea required value={editingCategory.description} onChange={(event) => setEditingCategory({ ...editingCategory, description: event.target.value })} className="mt-1.5 min-h-24 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800" /></label><label className="text-sm font-medium text-stone-700 dark:text-stone-300">Replace image <input type="file" accept="image/*" onChange={(event) => setReplacementCategoryImage(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm" /></label><label className="flex items-center gap-2 self-end text-sm font-medium text-stone-700 dark:text-stone-300"><input type="checkbox" checked={editingCategory.is_active} onChange={(event) => setEditingCategory({ ...editingCategory, is_active: event.target.checked })} className="h-4 w-4 accent-amber-500" /> Show category card</label><button type="submit" disabled={savingId === editingCategory.id} className="sm:col-span-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-400 disabled:opacity-60">{savingId === editingCategory.id ? "Saving changes…" : "Save category changes"}</button></form></section>}

        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-sky-700 dark:text-sky-400">Delivery setup</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">Delivery zones</h2><p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Only active zones are available at checkout.</p></div><button type="button" onClick={() => setEditingDeliveryZone({ name: "", regionsText: "", shipping_fee: "", estimated_delivery: "", is_active: true, sort_order: deliveryZones.length + 1 })} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"><Plus size={16} /> Add zone</button></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{deliveryZones.map((zone) => <div key={zone.id} className="rounded-2xl border border-stone-200 p-4 dark:border-stone-700"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-stone-900 dark:text-stone-100">{zone.name}</p><p className="mt-1 text-sm font-medium text-sky-700 dark:text-sky-400">{formatMoney(zone.shipping_fee)} · {zone.estimated_delivery}</p><p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{zone.regions.join(", ")}</p></div><button type="button" onClick={() => setEditingDeliveryZone({ ...zone, regionsText: zone.regions.join(", ") })} className="rounded-lg border border-stone-200 p-2 text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800" aria-label={`Edit ${zone.name}`}><Pencil size={15} /></button></div><p className={`mt-3 text-xs font-semibold ${zone.is_active ? "text-emerald-600" : "text-stone-500"}`}>{zone.is_active ? "Active at checkout" : "Hidden from checkout"}</p></div>)}</div>{editingDeliveryZone && <form onSubmit={saveDeliveryZone} className="mt-5 grid gap-4 rounded-2xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-900/50 dark:bg-sky-950/15 sm:grid-cols-2"><AdminField label="Zone name" value={editingDeliveryZone.name} onChange={(value) => setEditingDeliveryZone({ ...editingDeliveryZone, name: value })} required /><AdminField label="Delivery fee (₵)" type="number" min="0" step="0.01" value={editingDeliveryZone.shipping_fee} onChange={(value) => setEditingDeliveryZone({ ...editingDeliveryZone, shipping_fee: value })} required /><AdminField label="Regions (comma separated)" value={editingDeliveryZone.regionsText} onChange={(value) => setEditingDeliveryZone({ ...editingDeliveryZone, regionsText: value })} required /><AdminField label="Delivery estimate" value={editingDeliveryZone.estimated_delivery} onChange={(value) => setEditingDeliveryZone({ ...editingDeliveryZone, estimated_delivery: value })} required /><AdminField label="Display order" type="number" min="0" value={editingDeliveryZone.sort_order} onChange={(value) => setEditingDeliveryZone({ ...editingDeliveryZone, sort_order: value })} required /><label className="flex items-center gap-2 self-end text-sm font-medium text-stone-700 dark:text-stone-300"><input type="checkbox" checked={editingDeliveryZone.is_active} onChange={(event) => setEditingDeliveryZone({ ...editingDeliveryZone, is_active: event.target.checked })} className="h-4 w-4 accent-sky-600" /> Enable at checkout</label><div className="flex gap-3 sm:col-span-2"><button type="submit" disabled={savingId === "delivery-zone"} className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60">{savingId === "delivery-zone" ? "Saving…" : "Save delivery zone"}</button><button type="button" onClick={() => setEditingDeliveryZone(null)} className="rounded-xl border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800">Cancel</button></div></form>}</section>

        <section className="mt-8 rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900 overflow-hidden">
          {/* Inbox Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <Inbox size={19} />
              </div>
              <div>
                <h2 className="font-bold text-stone-900 dark:text-stone-100">Customer inbox</h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">Support requests from the storefront</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Summary badges */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {allCustomerMessages.filter(m => m.status === "new").length} New
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {allCustomerMessages.filter(m => m.status === "in_progress").length} In progress
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400">
                {allCustomerMessages.length} Total
              </span>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 border-b border-stone-100 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-950/40 px-6 py-2.5">
            {[["all", "All messages", allCustomerMessages.length], ["support", "Support", allCustomerMessages.filter(m => (m.message_type ?? "support") === "support").length], ["suggestion", "Suggestions", allCustomerMessages.filter(m => (m.message_type ?? "support") === "suggestion").length]].map(([filter, label, count]) => (
              <button
                key={filter}
                type="button"
                onClick={() => setInboxFilter(filter)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  inboxFilter === filter
                    ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm border border-stone-200 dark:border-stone-700"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                }`}
              >
                {label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${inboxFilter === filter ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" : "bg-stone-200 text-stone-500 dark:bg-stone-700 dark:text-stone-400"}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Message list */}
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {supportMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400">
                  <Inbox size={24} />
                </div>
                <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">No messages yet</p>
                <p className="text-xs text-stone-400 dark:text-stone-500">Support requests will appear here once customers reach out.</p>
              </div>
            ) : supportMessages.map((message) => {
              const statusConfig = {
                new: { label: "New", cls: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400" },
                in_progress: { label: "In progress", cls: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" },
                resolved: { label: "Resolved", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" },
                closed: { label: "Closed", cls: "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400" },
              };
              const cfg = statusConfig[message.status] ?? statusConfig.closed;
              const initials = `${message.first_name?.[0] ?? ""}${message.last_name?.[0] ?? ""}`.toUpperCase() || "?";
              const avatarColors = ["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-sky-500"];
              const avatarColor = avatarColors[(message.first_name?.charCodeAt(0) ?? 0) % avatarColors.length];

              return (
                <article key={message.id} className="group grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 px-6 py-5 hover:bg-stone-50/80 dark:hover:bg-stone-950/50 transition-colors">
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Avatar */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${avatarColor} text-white text-xs font-bold shadow-sm`}>
                      {initials}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                          {message.first_name} {message.last_name}
                        </p>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                        {message.message_type && message.message_type !== "support" && (
                          <span className="rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                            {message.message_type}
                          </span>
                        )}
                        {message.subject && (
                          <span className="rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-2 py-0.5 text-[10px] font-semibold">
                            {message.subject}
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
                        {message.email}{message.phone ? ` · ${message.phone}` : ""} ·{" "}
                        {new Date(message.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>

                      <p className="mt-2.5 text-sm leading-6 text-stone-600 dark:text-stone-300 line-clamp-3 whitespace-pre-wrap">
                        {message.message}
                      </p>
                    </div>
                  </div>

                  {/* Status selector */}
                  <div className="flex items-start lg:items-center pl-14 lg:pl-0">
                    <select
                      aria-label={`Status for message from ${message.first_name}`}
                      value={message.status}
                      disabled={savingId === message.id}
                      onChange={(event) => updateSupportMessageStatus(message.id, event.target.value)}
                      className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 shadow-sm transition hover:border-stone-300 dark:hover:border-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                    >
                      <option value="new">🔴 New</option>
                      <option value="in_progress">🟡 In progress</option>
                      <option value="resolved">🟢 Resolved</option>
                      <option value="closed">⚫ Closed</option>
                    </select>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Newsletter subscribers strip */}
          {subscribers.length > 0 && (
            <div className="border-t border-stone-100 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-950/40 px-6 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    <Mail size={13} />
                  </div>
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Newsletter · <span className="text-emerald-600 dark:text-emerald-400">{subscribers.filter(s => s.status === "subscribed").length} subscribed</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {subscribers.slice(0, 12).map((subscriber) => (
                    <span key={subscriber.id} className="rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-2.5 py-1 text-[11px] text-stone-500 dark:text-stone-400">
                      {subscriber.email}
                    </span>
                  ))}
                  {subscribers.length > 12 && (
                    <span className="rounded-full bg-stone-200 dark:bg-stone-700 px-2.5 py-1 text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                      +{subscribers.length - 12} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {aboutContent && <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-amber-700 dark:text-amber-400">Storefront content</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">About page</h2><p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Update the public story and its image without changing code.</p></div><form onSubmit={saveAboutContent} className="mt-5 grid gap-4 sm:grid-cols-2"><AdminField label="Eyebrow" value={aboutContent.eyebrow} onChange={(value) => setAboutContent({ ...aboutContent, eyebrow: value })} required /><AdminField label="Title" value={aboutContent.title} onChange={(value) => setAboutContent({ ...aboutContent, title: value })} required /><label className="text-sm font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Story<textarea required value={aboutContent.description} onChange={(event) => setAboutContent({ ...aboutContent, description: event.target.value })} className="mt-1.5 min-h-28 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800" /></label><label className="text-sm font-medium text-stone-700 dark:text-stone-300">Story image <input type="file" accept="image/*" onChange={(event) => setAboutImage(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm" /></label><label className="flex items-center gap-2 self-end text-sm font-medium text-stone-700 dark:text-stone-300"><input type="checkbox" checked={aboutContent.is_active} onChange={(event) => setAboutContent({ ...aboutContent, is_active: event.target.checked })} className="h-4 w-4 accent-amber-500" /> Show this About content</label>{aboutContent.image_url && <img src={aboutContent.image_url} alt="Current About page" className="h-32 w-full rounded-xl border border-stone-200 object-cover sm:col-span-2 dark:border-stone-700" />}<button type="submit" disabled={savingId === "about-content"} className="sm:col-span-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-400 disabled:opacity-60">{savingId === "about-content" ? "Saving About page…" : "Save About page"}</button></form></section>}

        {promoBanner && <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-green-700 dark:text-green-400">Homepage content</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">Promo banner</h2><p className="mt-1 text-xs text-stone-500 dark:text-stone-400">The discount changes displayed prices only while this banner is active.</p></div><form onSubmit={savePromoBanner} className="mt-5 grid gap-4 sm:grid-cols-2"><AdminField label="Eyebrow" value={promoBanner.eyebrow} onChange={(value) => setPromoBanner({ ...promoBanner, eyebrow: value })} required /><AdminField label="CTA label" value={promoBanner.cta_label} onChange={(value) => setPromoBanner({ ...promoBanner, cta_label: value })} required /><AdminField label="Title" value={promoBanner.title} onChange={(value) => setPromoBanner({ ...promoBanner, title: value })} required /><AdminField label="Highlight" value={promoBanner.highlight ?? ""} onChange={(value) => setPromoBanner({ ...promoBanner, highlight: value })} /><AdminField label="CTA path" value={promoBanner.cta_path} onChange={(value) => setPromoBanner({ ...promoBanner, cta_path: value })} required /><AdminField label="Discount (%)" type="number" min="0" max="100" step="0.01" value={promoBanner.discount_percent ?? 0} onChange={(value) => setPromoBanner({ ...promoBanner, discount_percent: value })} /><AdminField label="Offer ends at (optional)" type="datetime-local" value={promoBanner.ends_at ?? ""} onChange={(value) => setPromoBanner({ ...promoBanner, ends_at: value })} /><label className="text-sm font-medium text-stone-700 dark:text-stone-300">Discount applies to<select value={promoBanner.discount_scope || "all"} onChange={(event) => setPromoBanner({ ...promoBanner, discount_scope: event.target.value })} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-green-600 dark:border-stone-700 dark:bg-stone-800"><option value="all">All in-stock products</option><option value="categories">Selected categories</option></select></label><label className="flex items-center gap-2 self-end text-sm font-medium text-stone-700 dark:text-stone-300"><input type="checkbox" checked={promoBanner.is_active} onChange={(event) => setPromoBanner({ ...promoBanner, is_active: event.target.checked })} className="h-4 w-4 accent-green-600" /> Show banner</label>{promoBanner.discount_scope === "categories" && <fieldset className="sm:col-span-2"><legend className="text-sm font-medium text-stone-700 dark:text-stone-300">Discounted categories</legend><div className="mt-2 flex flex-wrap gap-3">{categories.map((category) => { const checked = promoBanner.discount_categories?.includes(category.name); return <label key={category.id} className="flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-700 dark:border-stone-700 dark:text-stone-300"><input type="checkbox" checked={checked} onChange={() => setPromoBanner({ ...promoBanner, discount_categories: checked ? promoBanner.discount_categories.filter((name) => name !== category.name) : [...(promoBanner.discount_categories || []), category.name] })} className="h-4 w-4 accent-green-600" /> {category.name}</label>; })}</div></fieldset>}<label className="text-sm font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Description<textarea required value={promoBanner.description} onChange={(event) => setPromoBanner({ ...promoBanner, description: event.target.value })} className="mt-1.5 min-h-24 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-green-600 dark:border-stone-700 dark:bg-stone-800" /></label><label className="text-sm font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Banner image <input type="file" accept="image/*" onChange={(event) => setPromoImage(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm" /></label><button type="submit" disabled={savingId === "promo-banner"} className="sm:col-span-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">{savingId === "promo-banner" ? "Saving banner…" : "Save promo banner"}</button></form></section>}

        <section className="mt-8 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-3 border-b border-stone-100 px-5 py-5 dark:border-stone-800 sm:px-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"><ClipboardList size={19} /></span><div><h2 className="font-semibold text-stone-900 dark:text-stone-100">Recent orders</h2><p className="text-xs text-stone-500 dark:text-stone-400">Update fulfilment only after payment is confirmed.</p></div></div>
          {loading ? <LoadingRows /> : <div className="overflow-x-auto"><table className="w-full min-w-[880px] text-left text-sm"><thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900/60 dark:text-stone-400"><tr><th className="px-6 py-3 font-semibold">Order</th><th className="px-4 py-3 font-semibold">Customer</th><th className="px-4 py-3 font-semibold">Items</th><th className="px-4 py-3 font-semibold">Delivery</th><th className="px-4 py-3 font-semibold">Payment</th><th className="px-4 py-3 font-semibold">Fulfilment</th></tr></thead><tbody className="divide-y divide-stone-100 dark:divide-stone-800">{orders.slice(0, 12).map((order) => <tr key={order.id}><td className="px-6 py-4"><p className="font-semibold text-stone-900 dark:text-stone-100">{order.order_number}</p><p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{formatMoney(order.total)}</p></td><td className="px-4 py-4 text-stone-600 dark:text-stone-300">{order.contact_email}</td><td className="px-4 py-4 text-stone-600 dark:text-stone-300">{order.order_items?.map((item) => `${item.product_name} × ${item.quantity}`).join(", ") || "—"}</td><td className="px-4 py-4 text-stone-600 dark:text-stone-300">{order.delivery_method === "customer_arranged" ? "Customer-arranged" : "DorisWare delivery"}</td><td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[order.payment_status] ?? "bg-stone-100 text-stone-600"}`}>{formatStatus(order.payment_status)}</span></td><td className="px-4 py-4"><select aria-label={`Fulfilment status for ${order.order_number}`} disabled={order.payment_status !== "paid" || savingId === order.id} value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value)} className="rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800">{orderStatuses.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}</select></td></tr>)}</tbody></table></div>}
        </section>
        </main>
      </div>
    </div>
    </ProductCategoryContext.Provider>
  );
}

function InteractiveReport({ report, reportRange, setReportRange, formatMoney, selectedDay, onSelectDay }) {
  const activeDay = report.daily.find((day) => day.key === selectedDay) ?? report.daily[report.daily.length - 1];
  const maximum = Math.max(...report.daily.map((day) => day.value), 1);
  const deliveryBreakdown = { dorisware: 0, arranged: 0 };
  report.paidOrders.forEach((order) => { deliveryBreakdown[order.delivery_method === "customer_arranged" ? "arranged" : "dorisware"] += 1; });

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-sm dark:border-stone-800 dark:bg-stone-900/90">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5 dark:border-stone-800">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-emerald-600 dark:text-emerald-400">Sales Intelligence</p>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Daily Revenue Activity</h2>
        </div>
        <div className="flex items-center gap-1.5 rounded-2xl bg-stone-100 p-1.5 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
          {[7, 30, 90].map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setReportRange(range)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                reportRange === range
                  ? "bg-white text-stone-950 shadow-sm dark:bg-stone-800 dark:text-white"
                  : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
              }`}
            >
              {range} Days
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(260px,1fr)]">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 dark:text-stone-400">Click any day bar to inspect</span>
            {activeDay && (
              <div className="rounded-xl bg-emerald-50 px-3 py-1.5 text-right dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{activeDay.label}: </span>
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100">{formatMoney(activeDay.value)}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex h-52 items-end gap-1.5 border-b border-stone-200 pb-2 dark:border-stone-800" aria-label="Interactive paid revenue chart">
            {report.daily.map((day, index) => {
              const selected = activeDay?.key === day.key;
              const showLabel = reportRange <= 7 || index === 0 || index === report.daily.length - 1 || index % Math.ceil(reportRange / 6) === 0;
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => onSelectDay(day.key)}
                  aria-pressed={selected}
                  aria-label={`${day.label}: ${formatMoney(day.value)}`}
                  className="group flex h-full min-w-0 flex-1 flex-col justify-end focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <span
                    className={`min-h-1 rounded-t-lg transition-all ${
                      selected
                        ? "bg-emerald-500 shadow-md shadow-emerald-500/30"
                        : "bg-emerald-200 group-hover:bg-emerald-400 dark:bg-stone-800 dark:group-hover:bg-emerald-500/80"
                    }`}
                    style={{ height: day.value ? `${Math.max((day.value / maximum) * 100, 4)}%` : "3px" }}
                  />
                  <span className="mt-2 truncate text-center text-[10px] text-stone-400">
                    {showLabel ? day.label : ""}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>Period peak: <strong className="text-stone-900 dark:text-stone-100">{formatMoney(maximum)}</strong></span>
            <span>Average order: <strong className="text-stone-900 dark:text-stone-100">{formatMoney(report.average)}</strong></span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-stone-50/50 p-5 dark:border-stone-800 dark:bg-stone-950/60">
          <div>
            <div className="flex items-center justify-between border-b border-stone-200/60 pb-3 dark:border-stone-800/80">
              <h3 className="font-bold text-stone-900 dark:text-stone-100">Fulfilment & Delivery Mix</h3>
              <Truck size={16} className="text-emerald-500" />
            </div>

            <div className="mt-5 space-y-4">
              <ReportBreakdown 
                label="DorisWare delivery" 
                value={deliveryBreakdown.dorisware} 
                total={report.paidOrders.length} 
                tone="bg-emerald-500" 
              />
              <ReportBreakdown 
                label="Customer courier / pickup" 
                value={deliveryBreakdown.arranged} 
                total={report.paidOrders.length} 
                tone="bg-amber-500" 
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-200/60 dark:border-stone-800/80 flex items-center justify-between text-xs">
            <span className="text-stone-500 dark:text-stone-400">Total Fulfilled Orders:</span>
            <span className="font-bold text-stone-900 dark:text-stone-100">{report.paidOrders.length} orders</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReportBreakdown({ label, value, total, tone }) {
  const percent = total ? Math.round((value / total) * 100) : 0;
  return <div><div className="flex justify-between gap-3 text-xs"><span className="text-stone-600 dark:text-stone-300">{label}</span><span className="font-semibold text-stone-900 dark:text-stone-100">{value} · {percent}%</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800"><div className={`h-full rounded-full ${tone}`} style={{ width: `${percent}%` }} /></div></div>;
}

function Metric({ icon: Icon, label, value, tone }) {
  const tones = { 
    green: {
      badge: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400",
      border: "hover:border-emerald-500/40"
    }, 
    emerald: {
      badge: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400",
      border: "hover:border-emerald-500/40"
    }, 
    amber: {
      badge: "bg-amber-500/10 border border-amber-500/20 text-amber-400",
      border: "hover:border-amber-500/40"
    }, 
    red: {
      badge: "bg-red-500/10 border border-red-500/20 text-red-400",
      border: "hover:border-red-500/40"
    } 
  };
  const currentTone = tones[tone] ?? tones.emerald;
  return (
    <div className={`group rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 dark:border-stone-800 dark:bg-stone-900/90 ${currentTone.border}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">{label}</span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl transition duration-300 group-hover:scale-105 ${currentTone.badge}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">{value}</p>
    </div>
  );
}

function ReportMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4.5 backdrop-blur-sm transition duration-300 hover:border-white/20">
      <p className="text-xs font-semibold uppercase tracking-[.12em] text-stone-400">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-white">{value}</p>
    </div>
  );
}

function Toggle({ checked, disabled, label, onChange }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-green-600" : "bg-stone-300 dark:bg-stone-700"} disabled:opacity-50`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-5" : "left-0.5"}`} /></button>;
}

function AdminField({ label, type = "text", value, onChange, className = "", ...props }) {
  const availableProductCategories = useContext(ProductCategoryContext);
  const inputClass = `mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-green-600 dark:border-stone-700 dark:bg-stone-800 ${type === "url" ? "font-mono text-xs" : ""}`;
  if (label === "Category") {
    const options = availableProductCategories.includes(value) ? availableProductCategories : [value, ...availableProductCategories];
    return <label className={`block text-sm font-medium text-stone-700 dark:text-stone-300 ${className}`}>{label}<select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} required {...props}>{options.map((category) => <option key={category} value={category}>{category}</option>)}</select><span className="mt-1 block text-xs font-normal text-stone-500 dark:text-stone-400">Manage categories separately in Category cards.</span></label>;
  }
  return <label className={`block text-sm font-medium text-stone-700 dark:text-stone-300 ${className}`}>{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} {...props} /></label>;
}

function CategoryManager({ categories, onCategoriesChange }) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", sort_order: "", is_active: true });

  useEffect(() => {
    const oldSection = [...document.querySelectorAll("h2")].find((heading) => heading.textContent === "Category cards" && !heading.closest("[data-category-manager]"))?.closest("section");
    if (oldSection) oldSection.hidden = true;
  }, [categories]);

  function closeForm() {
    setCreating(false); setEditing(null); setImage(null); setError(""); setForm({ name: "", description: "", sort_order: "", is_active: true });
  }

  function openEdit(category) {
    setCreating(false); setEditing(category); setImage(null); setError("");
    setForm({ name: category.name, description: category.description, sort_order: String(category.sort_order), is_active: category.is_active });
  }

  async function saveCategory(event) {
    event.preventDefault();
    const id = editing?.id ?? form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!id || !form.description.trim() || (!editing && !image)) { setError("Enter a name and description, then choose a category image."); return; }
    setSaving(true); setError("");
    let imageUrl = editing?.image_url ?? "";
    if (image) {
      const extension = image.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const upload = await supabase.storage.from("category-images").upload(path, image, { contentType: image.type });
      if (upload.error) { setError("Category image upload failed."); setSaving(false); return; }
      imageUrl = supabase.storage.from("category-images").getPublicUrl(path).data.publicUrl;
    }
    const updates = { name: form.name.trim(), description: form.description.trim(), image_url: imageUrl, sort_order: Number(form.sort_order || categories.length + 1), is_active: form.is_active };
    const result = editing ? await supabase.from("categories").update(updates).eq("id", id).select().single() : await supabase.from("categories").insert({ id, ...updates }).select().single();
    if (result.error) setError(editing ? "Category could not be updated." : "Category could not be created. Its name may already be in use.");
    else { onCategoriesChange((current) => (editing ? current.map((category) => category.id === id ? result.data : category) : [...current, result.data]).sort((a, b) => a.sort_order - b.sort_order)); closeForm(); }
    setSaving(false);
  }

  return <section data-category-manager className="mt-6 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-amber-700 dark:text-amber-400">Store taxonomy</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">Category cards</h2><p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Create and manage categories used across the store.</p></div><button type="button" onClick={() => { if (creating) closeForm(); else { setEditing(null); setCreating(true); setError(""); } }} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"><Plus size={16} /> {creating ? "Close form" : "Add category"}</button></div>{(creating || editing) && <form onSubmit={saveCategory} className="mt-5 grid gap-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/15 sm:grid-cols-2"><div className="sm:col-span-2 flex items-center justify-between"><p className="font-semibold text-stone-900 dark:text-stone-100">{editing ? `Edit ${editing.name}` : "Create category"}</p><button type="button" onClick={closeForm} className="text-sm font-semibold text-stone-500">Cancel</button></div><AdminField label="Category name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required /><AdminField label="Display order" type="number" min="0" value={form.sort_order} onChange={(value) => setForm({ ...form, sort_order: value })} placeholder={String(categories.length + 1)} /><label className="text-sm font-medium text-stone-700 dark:text-stone-300 sm:col-span-2">Description<textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1.5 min-h-24 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800" /></label><label className="text-sm font-medium text-stone-700 dark:text-stone-300">{editing ? "Replace image (optional)" : "Category image"}<input required={!editing} type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm" /></label><label className="flex items-center gap-2 self-end text-sm font-medium text-stone-700 dark:text-stone-300"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} className="h-4 w-4 accent-amber-500" /> Show category immediately</label>{error && <p role="alert" className="sm:col-span-2 text-sm text-red-600 dark:text-red-400">{error}</p>}<button type="submit" disabled={saving} className="sm:col-span-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-400 disabled:opacity-60">{saving ? (editing ? "Saving changes…" : "Creating category…") : (editing ? "Save category changes" : "Create category")}</button></form>}<div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <div key={category.id} className="flex items-center gap-3 rounded-2xl border border-stone-200 p-3 dark:border-stone-700"><img src={category.image_url} alt="" className="h-14 w-14 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="truncate font-semibold text-stone-900 dark:text-stone-100">{category.name}</p><p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">Position {category.sort_order} · {category.is_active ? "Visible" : "Hidden"}</p></div><button type="button" onClick={() => openEdit(category)} className="rounded-xl border border-stone-200 p-2 text-stone-600 transition hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800" aria-label={`Edit ${category.name}`}><Pencil size={15} /></button></div>)}</div></section>;
}

function SocialLinksManager({ links, onLinksChange, setPageError }) {
  const [savingPlatform, setSavingPlatform] = useState("");

  async function saveLink(event, link) {
    event.preventDefault();
    setSavingPlatform(link.platform);
    const { error } = await supabase.from("store_social_links").update({ url: link.url.trim(), is_active: link.is_active }).eq("platform", link.platform);
    if (error) setPageError("Social link could not be saved.");
    setSavingPlatform("");
  }

  return <section className="mt-6 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-sky-700">Storefront channels</p><h2 className="mt-1 text-xl font-semibold">Social media</h2><p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Only active links appear in the footer.</p></div><div className="mt-5 space-y-3">{links.map((link) => <form key={link.platform} onSubmit={(event) => saveLink(event, link)} className="flex flex-wrap items-center gap-3 rounded-2xl border border-stone-200 p-3 dark:border-stone-700"><p className="w-24 font-semibold capitalize">{link.platform}</p><input type="url" value={link.url} onChange={(event) => onLinksChange((current) => current.map((item) => item.platform === link.platform ? { ...item, url: event.target.value } : item))} className="min-w-48 flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-800" required /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={link.is_active} onChange={(event) => onLinksChange((current) => current.map((item) => item.platform === link.platform ? { ...item, is_active: event.target.checked } : item))} /> Active</label><button type="submit" disabled={savingPlatform === link.platform} className="min-w-20 rounded-xl bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-wait disabled:opacity-60">{savingPlatform === link.platform ? "Saving…" : "Save"}</button></form>)}</div></section>;
}


function LoadingRows() {
  return <div className="space-y-3 p-6">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />)}</div>;
}
