import { Link, Navigate, useLocation } from "react-router-dom";
import { useRef, useState } from "react";
import {
  Camera,
  Heart,
  LogOut,
  MapPin,
  Package,
  Pencil,
  UserRound,
  Award,
  Sparkles,
  CheckCircle2,
  Truck,
  FileText,
  ShoppingBag,
  Plus,
  Trash2,
  ShieldCheck,
  Sun,
  Moon,
  Bell,
  X,
  Printer,
  RefreshCw,
  Check,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/Authcontext";
import { useCart } from "../context/Cartcontext";
import { useTheme } from "../context/Themecontext ";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-stone-900 outline-none transition focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:focus:border-green-500 dark:focus:ring-green-950/50";

const initials = (name) =>
  (name || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const imageUrl = (path) => {
  const fallback = `${import.meta.env.BASE_URL}images/castironskillet.jpg`;
  if (!path) return fallback;
  if (path.startsWith(import.meta.env.BASE_URL) || !path.startsWith("/")) return path;
  return `${import.meta.env.BASE_URL}${path.slice(1)}`;
};

export default function ProfilePage() {
  const {
    user,
    authLoading,
    updateProfile,
    uploadAvatar,
    updateSettings,
    signOut,
    toggleFavorite,
    removeAddress,
    setDefaultAddress,
    addAddress,
  } = useAuth();
  const { addToCart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const fileInput = useRef(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [saved, setSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const [form, setForm] = useState(() => ({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    birthday: user?.birthday ?? "1994-05-15",
    cookingStyle: user?.cookingStyle ?? "Cast Iron & Heavy Dutch Ovens",
  }));

  const [addressForm, setAddressForm] = useState({
    label: "Home",
    recipient: user?.name ?? "",
    phone: user?.phone ?? "",
    street: "",
    city: "Accra",
    region: "Greater Accra",
    country: "Ghana",
    isDefault: false,
  });

  if (authLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-stone-500">Loading profile…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  }

  function submitProfile(event) {
    event.preventDefault();
    updateProfile(form);
    setSaved(true);
    showToast("Profile details updated successfully!");
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleAvatarUpload(event) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const { error } = await uploadAvatar(file);
    showToast(error ? "Profile photo could not be uploaded." : "Profile photo updated!");
  }

  function handleReorder(order) {
    if (!order?.items?.length) return;
    order.items.forEach((item) => {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price || `₵${item.unitPrice}`,
        quantity: 1,
        images: [imageUrl(item.image)],
      });
    });
    showToast(`Added items from ${order.id} to cart!`);
  }

  function handleSaveNewAddress(e) {
    e.preventDefault();
    if (!addressForm.street || !addressForm.recipient) return;
    addAddress(addressForm);
    setShowAddAddressModal(false);
    showToast("New delivery address added!");
    setAddressForm({
      label: "Home",
      recipient: user?.name ?? "",
      phone: user?.phone ?? "",
      street: "",
      city: "Accra",
      region: "Greater Accra",
      country: "Ghana",
      isDefault: false,
    });
  }

  const favorites = user.favorites ?? [];
  const orders = user.orders ?? [];
  const addresses = user.addresses ?? [];
  const points = user.points ?? 350;
  const tier = user.tier ?? "Culinary Enthusiast";

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === "in-transit") return o.status === "In Transit" || o.status === "Processing";
    if (orderStatusFilter === "delivered") return o.status === "Delivered";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f6f6f3] pb-20 dark:bg-stone-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-stone-900 px-5 py-3.5 text-sm font-medium text-white shadow-2xl transition dark:bg-emerald-600">
          <CheckCircle2 size={18} className="text-emerald-400 dark:text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="mx-4 mt-5 overflow-hidden rounded-[2rem] bg-stone-950 px-5 py-8 text-white shadow-xl shadow-stone-900/10 sm:mx-6 sm:px-8 sm:py-10 lg:mx-8">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              {/* Profile Avatar */}
              <div className="relative group">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white/15 bg-white/10 text-3xl font-bold shadow-2xl backdrop-blur-md transition group-hover:border-emerald-400/50">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={`${user.name}'s avatar`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{initials(user.name)}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-stone-950 shadow-xl transition hover:scale-105 hover:bg-emerald-300"
                  title="Update profile picture"
                  aria-label="Update profile picture"
                >
                  <Camera size={18} />
                </button>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                      onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              {/* User Bio Details */}
              <div className="text-center sm:text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 border border-emerald-400/30">
                  <Sparkles size={13} />
                  <span>{tier}</span>
                </div>
                <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {user.name || "DorisWare Member"}
                </h1>
                <p className="mt-1 text-sm text-emerald-100/80">{user.email}</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    <ShieldCheck size={14} className="text-emerald-400" /> Verified Member
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    <Award size={14} className="text-amber-400" /> {points} Rewards Points
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <button
              onClick={signOut}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-stone-100 backdrop-blur-md transition hover:bg-white/20 active:scale-95"
            >
              <LogOut size={17} />
              Sign Out
            </button>
          </div>

          {/* Quick Counter Grid */}
          <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={<Package className="text-emerald-400" />}
              label="Orders Placed"
              value={orders.length}
              onClick={() => setActiveTab("orders")}
            />
            <StatCard
              icon={<Heart className="text-rose-400" />}
              label="Favorites"
              value={favorites.length}
              onClick={() => setActiveTab("favorites")}
            />
            <StatCard
              icon={<MapPin className="text-amber-400" />}
              label="Saved Addresses"
              value={addresses.length}
              onClick={() => setActiveTab("addresses")}
            />
            <StatCard
              icon={<Award className="text-cyan-400" />}
              label="Rewards Balance"
              value={`${points} pts`}
              onClick={() => setActiveTab("overview")}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 pt-7 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-2xl border border-stone-200 bg-white p-2 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <TabButton
            id="overview"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            icon={<UserRound size={18} />}
            label="Overview"
          />
          <TabButton
            id="orders"
            active={activeTab === "orders"}
            onClick={() => setActiveTab("orders")}
            icon={<Package size={18} />}
            label="Orders"
            badge={orders.length}
          />
          <TabButton
            id="favorites"
            active={activeTab === "favorites"}
            onClick={() => setActiveTab("favorites")}
            icon={<Heart size={18} />}
            label="Favorites"
            badge={favorites.length}
          />
          <TabButton
            id="addresses"
            active={activeTab === "addresses"}
            onClick={() => setActiveTab("addresses")}
            icon={<MapPin size={18} />}
            label="Addresses"
            badge={addresses.length}
          />
          <TabButton
            id="settings"
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
            icon={<Bell size={18} />}
            label="Settings & Theme"
          />
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
            {/* Edit Personal Form */}
            <form
              onSubmit={submitProfile}
              className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-8"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-5 dark:border-stone-800">
                <div className="flex items-center gap-3">
                  <span className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <UserRound size={22} />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                      Personal Details
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Update your identity and contact info.
                    </p>
                  </div>
                </div>
                <Pencil size={18} className="text-stone-400" />
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Full Name
                  <input
                    className={inputClass}
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Phone Number
                  <input
                    className={inputClass}
                    type="tel"
                    placeholder="+233..."
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </label>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Email Address
                  <input
                    className={inputClass}
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Birthday
                  <input
                    className={inputClass}
                    type="date"
                    value={form.birthday}
                    onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                  />
                </label>
              </div>

              <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                Primary Culinary Specialty / Preferred Cookware
                <select
                  className={inputClass}
                  value={form.cookingStyle}
                  onChange={(e) => setForm({ ...form, cookingStyle: e.target.value })}
                >
                  <option>Cast Iron & Heavy Dutch Ovens</option>
                  <option>Baking & Pastry Arts</option>
                  <option>Quick Stir Fry & Asian Utensils</option>
                  <option>Gourmet Fine Dining & Plating</option>
                  <option>All-round Home Cooking</option>
                </select>
              </label>

              {saved && (
                <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <CheckCircle2 size={18} /> Profile details saved successfully.
                </div>
              )}

              <button
                type="submit"
                className="mt-6 w-full rounded-2xl bg-emerald-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-800 active:scale-98 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                Save Changes
              </button>
            </form>

            {/* Side Highlights Column */}
            <div className="space-y-6">
              {/* Membership Pass Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 p-6 text-white shadow-xl dark:border dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-lg font-bold tracking-wider text-emerald-400">
                    DORISWARE CLUB
                  </span>
                  <Award className="text-amber-400" size={24} />
                </div>
                <div className="mt-6">
                  <p className="text-xs uppercase tracking-wider text-stone-400">
                    Current Tier Status
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-white">{tier}</h3>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-stone-300 mb-1.5">
                      <span>{points} / 500 PTS</span>
                      <span className="font-semibold text-emerald-400">Master Chef Tier next</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-stone-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                        style={{ width: `${Math.min(100, (points / 500) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
                  <span>Free Shipping on Orders ₵50+</span>
                  <span className="text-emerald-400 font-medium">Active Perk ✓</span>
                </div>
              </div>

              {/* Quick Links / Recent Activity */}
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <h3 className="font-bold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-emerald-600" /> Account Activity
                </h3>
                <div className="space-y-3 text-xs text-stone-600 dark:text-stone-300">
                  <div className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800">
                    <span>Member Account Created</span>
                    <span className="text-stone-400">Active</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800">
                    <span>Default Address Set</span>
                    <span className="text-emerald-600 font-medium">Accra, Ghana</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span>Favorites Saved</span>
                    <span className="text-rose-500 font-medium">{favorites.length} Items</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Orders */}
        {activeTab === "orders" && (
          <div className="mt-8 space-y-6">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center gap-2">
                <FilterChip
                  label="All Orders"
                  count={orders.length}
                  active={orderStatusFilter === "all"}
                  onClick={() => setOrderStatusFilter("all")}
                />
                <FilterChip
                  label="In Progress"
                  count={orders.filter((o) => o.status === "In Transit" || o.status === "Processing").length}
                  active={orderStatusFilter === "in-transit"}
                  onClick={() => setOrderStatusFilter("in-transit")}
                />
                <FilterChip
                  label="Delivered"
                  count={orders.filter((o) => o.status === "Delivered").length}
                  active={orderStatusFilter === "delivered"}
                  onClick={() => setOrderStatusFilter("delivered")}
                />
              </div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
              >
                + Shop More Cookware <ArrowRight size={14} />
              </Link>
            </div>

            {/* Orders List */}
            {filteredOrders.length > 0 ? (
              <div className="space-y-5">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
                  >
                    {/* Header bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 bg-stone-50/60 px-6 py-4 dark:border-stone-800 dark:bg-stone-900/60">
                      <div className="flex flex-wrap items-center gap-4">
                        <div>
                          <span className="text-xs uppercase text-stone-500 dark:text-stone-400">
                            Order Reference
                          </span>
                          <p className="font-mono text-sm font-bold text-stone-900 dark:text-stone-100">
                            {order.id}
                          </p>
                        </div>
                        <div className="hidden sm:block h-8 w-px bg-stone-200 dark:bg-stone-800" />
                        <div>
                          <span className="text-xs uppercase text-stone-500 dark:text-stone-400">
                            Placed On
                          </span>
                          <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                            {order.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <StatusBadge status={order.status} />
                        <span className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                          {order.total}
                        </span>
                      </div>
                    </div>

                    {/* Order items list */}
                    <div className="p-6">
                      <div className="divide-y divide-stone-100 dark:divide-stone-800">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-800">
                              <img
                                src={imageUrl(item.image)}
                                alt={item.name}
                                className="h-full w-full object-contain p-2"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <Link
                                to={`/product/${item.id}`}
                                className="font-semibold text-stone-900 hover:text-emerald-700 dark:text-stone-100 dark:hover:text-emerald-400 text-sm truncate block"
                              >
                                {item.name}
                              </Link>
                              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                                Qty: {item.quantity} · {item.price || `₵${item.unitPrice}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer actions */}
                      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setSelectedOrderForTracking(order)}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/80"
                          >
                            <Truck size={15} /> Track Shipment
                          </button>
                          <button
                            onClick={() => setSelectedOrderForInvoice(order)}
                            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-800 dark:text-stone-300"
                          >
                            <FileText size={15} /> View Receipt
                          </button>
                        </div>
                        <button
                          onClick={() => handleReorder(order)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
                        >
                          <RefreshCw size={14} /> Reorder All Items
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-stone-300 p-12 text-center dark:border-stone-800">
                <Package className="mx-auto h-12 w-12 text-stone-400" />
                <h3 className="mt-4 text-base font-bold text-stone-900 dark:text-stone-100">
                  No orders found
                </h3>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                  Purchases made will show up here with live package tracking.
                </p>
                <Link
                  to="/shop"
                  className="mt-5 inline-block rounded-2xl bg-emerald-700 px-6 py-3 text-xs font-semibold text-white shadow-md hover:bg-emerald-800"
                >
                  Explore Premium Cookware
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Favorites */}
        {activeTab === "favorites" && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  Saved Cookware ({favorites.length})
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Quick access to items you love for future kitchens.
                </p>
              </div>
              {favorites.length > 0 && (
                <Link
                  to="/shop"
                  className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                >
                  Find more cookware →
                </Link>
              )}
            </div>

            {favorites.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {favorites.map((item) => (
                  <div
                    key={item.id}
                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
                  >
                    <button
                      onClick={() => {
                        toggleFavorite(item);
                        showToast(`Removed ${item.name} from favorites`);
                      }}
                      className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-rose-500 shadow-md backdrop-blur-md transition hover:bg-rose-50 dark:bg-stone-900/80"
                      title="Remove from favorites"
                    >
                      <Heart size={18} fill="currentColor" />
                    </button>

                    <div className="h-44 w-full overflow-hidden rounded-2xl bg-stone-50 dark:bg-stone-800">
                      <img
                        src={imageUrl(item.images?.[0])}
                        alt={item.name}
                        className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="mt-4 flex flex-1 flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {item.category || "Cookware"}
                        </span>
                        <Link
                          to={`/product/${item.id}`}
                          className="mt-1 block font-bold text-stone-900 hover:text-emerald-700 dark:text-stone-100 dark:hover:text-emerald-400"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1 line-clamp-2 text-xs text-stone-500 dark:text-stone-400">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
                        <span className="text-lg font-bold text-stone-900 dark:text-stone-100">
                          {item.price}
                        </span>
                        <button
                          onClick={() => {
                            addToCart(item);
                            showToast(`Added ${item.name} to cart!`);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 active:scale-95 dark:bg-emerald-600"
                        >
                          <ShoppingBag size={15} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-stone-300 p-12 text-center dark:border-stone-800">
                <Heart className="mx-auto h-12 w-12 text-stone-300 dark:text-stone-700" />
                <h3 className="mt-4 text-base font-bold text-stone-900 dark:text-stone-100">
                  Your wishlist is empty
                </h3>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                  Tap the heart on any cookware piece to save it for later.
                </p>
                <Link
                  to="/shop"
                  className="mt-5 inline-block rounded-2xl bg-emerald-700 px-6 py-3 text-xs font-semibold text-white shadow-md hover:bg-emerald-800"
                >
                  Explore Shop Catalog
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Addresses */}
        {activeTab === "addresses" && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  Delivery Address Book
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Manage saved delivery destinations for quick checkout.
                </p>
              </div>
              <button
                onClick={() => setShowAddAddressModal(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-800 active:scale-95 dark:bg-emerald-600"
              >
                <Plus size={16} /> Add New Address
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`relative flex flex-col justify-between rounded-3xl border p-6 transition shadow-sm ${
                    address.isDefault
                      ? "border-emerald-500 bg-emerald-50/30 dark:border-emerald-600 dark:bg-emerald-950/20"
                      : "border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-1 text-xs font-bold text-stone-800 dark:bg-stone-800 dark:text-stone-200">
                        <MapPin size={14} className="text-emerald-600" />
                        {address.label || "Address"}
                      </span>
                      {address.isDefault && (
                        <span className="rounded-full bg-emerald-600 px-3 py-0.5 text-[10px] font-bold text-white">
                          DEFAULT
                        </span>
                      )}
                    </div>

                    <h4 className="mt-4 font-bold text-stone-900 dark:text-stone-100">
                      {address.recipient}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                      {address.street}
                    </p>
                    <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                      {address.city}, {address.region}, {address.country}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
                      Phone: {address.phone}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4 dark:border-stone-800">
                    {!address.isDefault ? (
                      <button
                        onClick={() => {
                          setDefaultAddress(address.id);
                          showToast("Default address updated!");
                        }}
                        className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-xs text-stone-400">Primary delivery address</span>
                    )}

                    <button
                      onClick={() => {
                        removeAddress(address.id);
                        showToast("Address deleted");
                      }}
                      className="p-1.5 text-stone-400 hover:text-rose-500 transition"
                      title="Delete address"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Settings */}
        {activeTab === "settings" && (
          <div className="mt-8 max-w-3xl space-y-8">
            {/* Theme Preference */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                {theme === "dark" ? <Moon className="text-amber-400" size={20} /> : <Sun className="text-amber-500" size={20} />}
                Appearance & Visual Theme
              </h3>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                Choose your preferred interface color mode.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <button
                  onClick={() => theme !== "light" && toggleTheme()}
                  className={`flex items-center justify-center gap-3 rounded-2xl border p-4 font-semibold text-sm transition ${
                    theme === "light"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                      : "border-stone-200 text-stone-700 hover:bg-stone-50 dark:border-stone-800 dark:text-stone-300"
                  }`}
                >
                  <Sun size={18} /> Light Mode
                </button>
                <button
                  onClick={() => theme !== "dark" && toggleTheme()}
                  className={`flex items-center justify-center gap-3 rounded-2xl border p-4 font-semibold text-sm transition ${
                    theme === "dark"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                      : "border-stone-200 text-stone-700 hover:bg-stone-50 dark:border-stone-800 dark:text-stone-300"
                  }`}
                >
                  <Moon size={18} /> Dark Mode
                </button>
              </div>
            </div>

            {/* Notification Toggles */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Bell className="text-emerald-600" size={20} /> Notification Settings
              </h3>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                Control email and SMS communication alerts.
              </p>

              <div className="mt-5 space-y-4">
                <NotificationToggle
                  title="Order Status & Delivery Alerts"
                  desc="Receive live tracking updates via email and SMS."
                  checked={user.settings?.notifications?.orderUpdates ?? true}
                  onChange={(val) =>
                    updateSettings({
                      notifications: { ...(user.settings?.notifications ?? {}), orderUpdates: val },
                    })
                  }
                />
                <NotificationToggle
                  title="Exclusive Promotions & VIP Discounts"
                  desc="Early access to seasonal cookware sales."
                  checked={user.settings?.notifications?.promotions ?? true}
                  onChange={(val) =>
                    updateSettings({
                      notifications: { ...(user.settings?.notifications ?? {}), promotions: val },
                    })
                  }
                />
                <NotificationToggle
                  title="New Product Drops & Seasonal Catalogs"
                  desc="Be notified when new cast iron and ceramic items release."
                  checked={user.settings?.notifications?.newProducts ?? true}
                  onChange={(val) =>
                    updateSettings({
                      notifications: { ...(user.settings?.notifications ?? {}), newProducts: val },
                    })
                  }
                />
              </div>
            </div>

            {/* Security Summary */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" size={20} /> Account Security
              </h3>
              <div className="mt-4 flex items-center justify-between text-xs py-2 border-b border-stone-100 dark:border-stone-800">
                <span className="text-stone-600 dark:text-stone-400">Authentication Method</span>
                <span className="font-bold text-stone-900 dark:text-stone-100 capitalize">
                  {user.provider || "Email & Password"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-2">
                <span className="text-stone-600 dark:text-stone-400">Account Password</span>
                <button
                  onClick={() => showToast("Password reset link sent to your email!")}
                  className="font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                >
                  Send Reset Link
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Order Package Tracking */}
      {selectedOrderForTracking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-stone-900 sm:p-8">
            <button
              onClick={() => setSelectedOrderForTracking(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <Truck size={24} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Tracking Order {selectedOrderForTracking.id}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Tracking #: {selectedOrderForTracking.trackingNumber || "Not assigned yet"}
                </p>
              </div>
            </div>

            {selectedOrderForTracking.fulfilmentNote && <p className="mt-5 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-600 dark:bg-stone-800 dark:text-stone-300">{selectedOrderForTracking.fulfilmentNote}</p>}

            {/* Tracking Progress Bar */}
            <div className="mt-8 space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-500">
              <TrackingStep
                title="Order Placed & Confirmed"
                time={selectedOrderForTracking.date}
                done={true}
              />
              <TrackingStep
                title="Packed at DorisWare Hub (Accra)"
                time="Order Picked & Inspected"
                done={true}
              />
              <TrackingStep
                title="In Transit with Express Courier"
                time={selectedOrderForTracking.status === "Delivered" ? "Completed" : "On the road to destination"}
                done={true}
                current={selectedOrderForTracking.status !== "Delivered"}
              />
              <TrackingStep
                title="Out for Final Delivery"
                time={selectedOrderForTracking.estimatedDelivery || "Arriving Soon"}
                done={selectedOrderForTracking.status === "Delivered"}
              />
            </div>

            <button
              onClick={() => setSelectedOrderForTracking(null)}
              className="mt-8 w-full rounded-2xl bg-stone-900 py-3 text-sm font-semibold text-white dark:bg-emerald-600"
            >
              Close Tracking Window
            </button>
          </div>
        </div>
      )}

      {/* Modal: Printable Invoice / Receipt */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] overflow-y-auto w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-stone-900 sm:p-8">
            <button
              onClick={() => setSelectedOrderForInvoice(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <X size={20} />
            </button>

            {/* Invoice Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-6 dark:border-stone-800">
              <div>
                <h2 className="font-serif text-2xl font-bold text-emerald-800 dark:text-emerald-400">
                  DorisWare
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Official Purchase Receipt
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-stone-900 dark:text-stone-100">
                  INVOICE #{selectedOrderForInvoice.id}
                </span>
                <p className="text-[11px] text-stone-400">{selectedOrderForInvoice.date}</p>
              </div>
            </div>

            {/* Billing details */}
            <div className="mt-6 grid grid-cols-2 gap-4 text-xs text-stone-600 dark:text-stone-300">
              <div>
                <span className="font-bold text-stone-900 dark:text-stone-100 block mb-1">Billed To:</span>
                <p className="font-semibold">{user.name}</p>
                <p>{user.email}</p>
                <p>{user.phone}</p>
              </div>
              <div>
                <span className="font-bold text-stone-900 dark:text-stone-100 block mb-1">Payment Method:</span>
                <p>{selectedOrderForInvoice.paymentMethod || "Mobile Money"}</p>
                <p className="text-emerald-600 font-semibold mt-1">Status: Paid ✓</p>
              </div>
            </div>

            {/* Line items table */}
            <div className="mt-6">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 dark:border-stone-800">
                    <th className="pb-2 font-semibold">Item</th>
                    <th className="pb-2 font-semibold text-center">Qty</th>
                    <th className="pb-2 font-semibold text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {selectedOrderForInvoice.items?.map((it, i) => (
                    <tr key={i}>
                      <td className="py-3 font-semibold text-stone-800 dark:text-stone-200">
                        {it.name}
                      </td>
                      <td className="py-3 text-center text-stone-600 dark:text-stone-400">
                        {it.quantity}
                      </td>
                      <td className="py-3 text-right font-bold text-stone-900 dark:text-stone-100">
                        {it.price || `₵${it.unitPrice}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-6 space-y-2 border-t border-stone-200 pt-4 text-xs dark:border-stone-800">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span>
                  <span>{selectedOrderForInvoice.total}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Delivery Fee</span>
                  <span>₵0.00 (Standard)</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold text-stone-900 dark:text-stone-100">
                  <span>Total Amount Paid</span>
                  <span className="text-emerald-700 dark:text-emerald-400">
                    {selectedOrderForInvoice.total}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 py-3 text-xs font-semibold text-white hover:bg-emerald-800"
              >
                <Printer size={16} /> Print Receipt
              </button>
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="rounded-2xl border border-stone-200 bg-stone-100 px-5 py-3 text-xs font-semibold text-stone-700 hover:bg-stone-200 dark:border-stone-800 dark:bg-stone-800 dark:text-stone-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Address */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSaveNewAddress}
            className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-stone-900 sm:p-8"
          >
            <button
              type="button"
              onClick={() => setShowAddAddressModal(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Add New Delivery Address
            </h3>

            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="block text-xs font-semibold uppercase text-stone-600 dark:text-stone-400">
                  Label (e.g. Home, Work)
                  <input
                    className={inputClass}
                    required
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                  />
                </label>
                <label className="block text-xs font-semibold uppercase text-stone-600 dark:text-stone-400">
                  Recipient Name
                  <input
                    className={inputClass}
                    required
                    value={addressForm.recipient}
                    onChange={(e) => setAddressForm({ ...addressForm, recipient: e.target.value })}
                  />
                </label>
              </div>

              <label className="block text-xs font-semibold uppercase text-stone-600 dark:text-stone-400">
                Street Address & House No.
                <input
                  className={inputClass}
                  required
                  placeholder="e.g. 12 Airport West Ave"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block text-xs font-semibold uppercase text-stone-600 dark:text-stone-400">
                  City
                  <input
                    className={inputClass}
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  />
                </label>
                <label className="block text-xs font-semibold uppercase text-stone-600 dark:text-stone-400">
                  Region
                  <select
                    className={inputClass}
                    value={addressForm.region}
                    onChange={(e) => setAddressForm({ ...addressForm, region: e.target.value })}
                  >
                    <option>Greater Accra</option>
                    <option>Ashanti</option>
                    <option>Central</option>
                    <option>Eastern</option>
                    <option>Western</option>
                    <option>Other</option>
                  </select>
                </label>
              </div>

              <label className="block text-xs font-semibold uppercase text-stone-600 dark:text-stone-400">
                Phone Number
                <input
                  className={inputClass}
                  type="tel"
                  required
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-8 w-full rounded-2xl bg-emerald-700 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-800 dark:bg-emerald-600"
            >
              Save Delivery Address
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// Subcomponents
function StatCard({ icon, label, value, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-left backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/[0.13] active:scale-95"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
        {icon}
      </div>
      <span className="mt-3 text-xs font-medium text-emerald-100/70">{label}</span>
      <span className="mt-1 font-serif text-2xl font-bold text-white">{value}</span>
    </button>
  );
}

function TabButton({ active, onClick, icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-stone-900 text-white shadow-md dark:bg-emerald-600"
          : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
            active ? "bg-emerald-900 text-emerald-100" : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function FilterChip({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-emerald-700 text-white dark:bg-emerald-600"
          : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
      }`}
    >
      {label} ({count})
    </button>
  );
}

function StatusBadge({ status }) {
  if (status === "Delivered") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
        <CheckCircle2 size={13} /> Delivered
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
      <Truck size={13} /> {status || "In Transit"}
    </span>
  );
}

function TrackingStep({ title, time, done, current }) {
  return (
    <div className="relative flex items-start gap-4 pl-8">
      <div
        className={`absolute left-0 top-0.5 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white text-xs font-bold transition ${
          done
            ? "border-emerald-600 text-emerald-600 dark:bg-stone-900"
            : "border-stone-300 text-stone-300 dark:border-stone-700"
        } ${current ? "ring-4 ring-emerald-100 dark:ring-emerald-950" : ""}`}
      >
        {done ? <Check size={16} /> : "•"}
      </div>
      <div>
        <h4 className={`text-sm font-bold ${done ? "text-stone-900 dark:text-stone-100" : "text-stone-400"}`}>
          {title}
        </h4>
        <p className="text-xs text-stone-500 dark:text-stone-400">{time}</p>
      </div>
    </div>
  );
}

function NotificationToggle({ title, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800 last:border-0">
      <div>
        <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">{title}</h4>
        <p className="text-[11px] text-stone-500 dark:text-stone-400">{desc}</p>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <div className="peer h-6 w-11 rounded-full bg-stone-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full dark:bg-stone-800" />
      </label>
    </div>
  );
}
