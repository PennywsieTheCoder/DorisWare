import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
const storageKey = "dorisware-user";
const withBase = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

const DEMO_ORDERS = [
  {
    id: "DW-849201",
    date: "August 8, 2026",
    total: "₵62.00",
    status: "In Transit",
    trackingNumber: "GH-EXP-992384",
    estimatedDelivery: "Aug 12, 2026",
    paymentMethod: "Mobile Money (MTN MoMo)",
    shippingAddress: {
      label: "Home",
      recipient: "Doris Customer",
      street: "12 Airport West Ave",
      city: "Accra",
      region: "Greater Accra",
      country: "Ghana",
    },
    items: [
      { id: "skillet", name: "Cast Iron Skillet", price: "₵38.00", unitPrice: 38, quantity: 1, image: withBase("/images/castironskillet.jpg") },
      { id: "bowl", name: "Stoneware Mixing Bowl", price: "₵24.00", unitPrice: 24, quantity: 1, image: withBase("/images/castironskillet.jpg") },
    ],
  },
  {
    id: "DW-710394",
    date: "July 24, 2026",
    total: "₵52.00",
    status: "Delivered",
    trackingNumber: "GH-EXP-881203",
    estimatedDelivery: "Jul 26, 2026",
    paymentMethod: "Debit Card (Visa)",
    shippingAddress: {
      label: "Office",
      recipient: "Doris Customer",
      street: "Suite 402, Ring Road Central",
      city: "Accra",
      region: "Greater Accra",
      country: "Ghana",
    },
    items: [
      { id: "knife", name: "Chef's Knife, 8-inch", price: "₵52.00", unitPrice: 52, quantity: 1, image: withBase("/images/castironskillet.jpg") },
    ],
  },
];

const DEMO_ADDRESSES = [
  {
    id: "addr-1",
    label: "Home",
    recipient: "Doris Customer",
    phone: "+233 24 123 4567",
    street: "12 Airport West Ave",
    city: "Accra",
    region: "Greater Accra",
    country: "Ghana",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Office",
    recipient: "Doris Customer",
    phone: "+233 20 987 6543",
    street: "Suite 402, Ring Road Central",
    city: "Accra",
    region: "Greater Accra",
    country: "Ghana",
    isDefault: false,
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        orders: parsed.orders ?? DEMO_ORDERS,
        addresses: Array.isArray(parsed.addresses) && parsed.addresses.length > 0
          ? parsed.addresses.map((a, i) => typeof a === "string" ? { id: `addr-${i}`, label: i === 0 ? "Home" : "Other", recipient: parsed.name || "Customer", phone: parsed.phone || "", street: a, city: "Accra", region: "Greater Accra", country: "Ghana", isDefault: i === 0 } : a)
          : DEMO_ADDRESSES,
        points: parsed.points ?? 350,
        tier: parsed.tier ?? "Culinary Enthusiast",
      };
    } catch {
      return null;
    }
  });

  function saveUser(nextUser) {
    setUser(nextUser);
    localStorage.setItem(storageKey, JSON.stringify(nextUser));
  }

  function signIn({ email, name }) {
    saveUser({
      name: name || email.split("@")[0],
      email,
      phone: "+233 24 123 4567",
      addresses: DEMO_ADDRESSES,
      favorites: [],
      orders: DEMO_ORDERS,
      points: 350,
      tier: "Culinary Enthusiast",
      provider: "email",
      settings: {
        notifications: { orderUpdates: true, promotions: true, newProducts: true, restockAlerts: false },
        currency: "GHS",
      },
    });
  }

  function signInWithGoogle() {
    saveUser({
      name: "DorisWare Customer",
      email: "customer@gmail.com",
      phone: "+233 24 123 4567",
      addresses: DEMO_ADDRESSES,
      favorites: [],
      orders: DEMO_ORDERS,
      points: 350,
      tier: "Culinary Enthusiast",
      provider: "google",
      settings: {
        notifications: { orderUpdates: true, promotions: true, newProducts: true, restockAlerts: false },
        currency: "GHS",
      },
    });
  }

  function updateProfile(details) {
    if (!user) return;
    saveUser({ ...user, ...details });
  }

  function updateSettings(settings) {
    if (!user) return;
    saveUser({ ...user, settings: { ...(user.settings ?? {}), ...settings } });
  }

  function addOrder(newOrder) {
    if (!user) return;
    const orders = [newOrder, ...(user.orders ?? [])];
    const points = (user.points ?? 0) + Math.round(parseFloat(newOrder.total) || 50);
    saveUser({ ...user, orders, points });
  }

  function addAddress(newAddress) {
    if (!user) return;
    const currentAddresses = user.addresses ?? [];
    const isFirst = currentAddresses.length === 0;
    const addressObj = {
      id: `addr-${Date.now()}`,
      label: newAddress.label || "Address",
      recipient: newAddress.recipient || user.name,
      phone: newAddress.phone || user.phone || "",
      street: newAddress.street || newAddress.address || "",
      city: newAddress.city || "Accra",
      region: newAddress.region || "Greater Accra",
      country: newAddress.country || "Ghana",
      isDefault: newAddress.isDefault ?? isFirst,
    };
    let updated = [...currentAddresses];
    if (addressObj.isDefault) {
      updated = updated.map(a => ({ ...a, isDefault: false }));
    }
    updated.push(addressObj);
    saveUser({ ...user, addresses: updated });
  }

  function removeAddress(id) {
    if (!user) return;
    const updated = (user.addresses ?? []).filter(a => a.id !== id);
    if (updated.length > 0 && !updated.some(a => a.isDefault)) {
      updated[0].isDefault = true;
    }
    saveUser({ ...user, addresses: updated });
  }

  function setDefaultAddress(id) {
    if (!user) return;
    const updated = (user.addresses ?? []).map(a => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveUser({ ...user, addresses: updated });
  }

  function toggleFavorite(product) {
    if (!user) return false;
    const favorites = user.favorites ?? [];
    const exists = favorites.some((item) => item.id === product.id);
    saveUser({
      ...user,
      favorites: exists ? favorites.filter((item) => item.id !== product.id) : [...favorites, product],
    });
    return true;
  }

  function isFavorite(id) {
    return (user?.favorites ?? []).some((item) => item.id === id);
  }

  function signOut() {
    setUser(null);
    localStorage.removeItem(storageKey);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signInWithGoogle,
        updateProfile,
        updateSettings,
        addOrder,
        addAddress,
        removeAddress,
        setDefaultAddress,
        toggleFavorite,
        isFavorite,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
