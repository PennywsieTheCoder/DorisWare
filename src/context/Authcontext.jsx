import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { PRODUCTS } from "../data/products";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

const defaultSettings = {
  notifications: { orderUpdates: true, promotions: true, newProducts: true, restockAlerts: false },
  currency: "GHS",
};

function displayOrderStatus(status) {
  const labels = {
    pending_payment: "Awaiting payment",
    paid: "Processing",
    processing: "Processing",
    shipped: "In Transit",
    delivered: "Delivered",
    cancelled: "Cancelled",
    payment_failed: "Payment failed",
  };
  return labels[status] ?? status;
}

function toProfileOrder(order) {
  return {
    id: order.order_number,
    date: new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    total: `₵${Number(order.total).toFixed(2)}`,
    status: displayOrderStatus(order.status),
    trackingNumber: order.tracking_number,
    estimatedDelivery: order.estimated_delivery_at ? new Date(`${order.estimated_delivery_at}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : order.status === "delivered" ? "Delivered" : "To be confirmed",
    fulfilmentNote: order.fulfilment_note ?? "",
    paymentMethod: order.payment_method === "mobile_money" ? "Mobile Money" : "Debit or Credit Card",
    shippingAddress: order.shipping_address,
    items: (order.order_items ?? []).map((item) => ({
      id: item.product_id,
      name: item.product_name,
      price: `₵${Number(item.unit_price).toFixed(2)}`,
      unitPrice: Number(item.unit_price),
      quantity: item.quantity,
      image: item.product_image_url,
    })),
  };
}

function toAppUser(authUser, profile, addresses, favoriteIds, orders, previousUser) {
  const metadata = authUser.user_metadata ?? {};

  return {
    id: authUser.id,
    name: profile?.full_name ?? metadata.full_name ?? metadata.name ?? authUser.email?.split("@")[0] ?? "Customer",
    email: authUser.email ?? "",
    phone: profile?.phone ?? authUser.phone ?? "",
    avatar: profile?.avatar_url ?? "",
    role: profile?.role ?? "customer",
    favorites: PRODUCTS.filter((product) => favoriteIds.includes(product.id)),
    orders,
    addresses,
    points: previousUser?.points ?? 0,
    tier: previousUser?.tier ?? "Culinary Enthusiast",
    settings: previousUser?.settings ?? defaultSettings,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const fetchOrders = useCallback(async (userId) => {
    const result = await supabase
      .from("orders")
      .select("id, order_number, status, payment_method, total, tracking_number, estimated_delivery_at, fulfilment_note, shipping_address, created_at, order_items(product_id, product_name, product_image_url, unit_price, quantity)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (result.error) console.error("Could not load orders:", result.error.message);
    return (result.data ?? []).map(toProfileOrder);
  }, []);

  const loadUser = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    const [profileResult, addressesResult, favoritesResult, orders] = await Promise.all([
      supabase.from("profiles").select("id, full_name, phone, avatar_url, role").eq("id", authUser.id).maybeSingle(),
      supabase.from("addresses").select("id, label, recipient, phone, street, city, region, country, is_default").eq("user_id", authUser.id).order("created_at"),
      supabase.from("favorites").select("product_id").eq("user_id", authUser.id),
      fetchOrders(authUser.id),
    ]);

    if (profileResult.error) console.error("Could not load the user profile:", profileResult.error.message);
    if (addressesResult.error) console.error("Could not load addresses:", addressesResult.error.message);
    if (favoritesResult.error) console.error("Could not load favorites:", favoritesResult.error.message);

    let profile = profileResult.data;
    if (profile?.avatar_url && !profile.avatar_url.startsWith("http")) {
      const { data } = await supabase.storage.from("avatars").createSignedUrl(profile.avatar_url, 60 * 60);
      profile = { ...profile, avatar_url: data?.signedUrl ?? "" };
    }

    const addresses = (addressesResult.data ?? []).map(({ is_default, ...address }) => ({
      ...address,
      isDefault: is_default,
    }));
    const favoriteIds = (favoritesResult.data ?? []).map((favorite) => favorite.product_id);
    setUser((previousUser) => toAppUser(authUser, profile, addresses, favoriteIds, orders, previousUser));
    setAuthLoading(false);
  }, [fetchOrders]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => loadUser(session?.user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session?.user);
    });

    return () => subscription.unsubscribe();
  }, [loadUser]);

  async function signIn({ email, password }) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signUp({ name, email, password }) {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
      },
    });
  }

  async function signInWithGoogle() {
    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}` },
    });
  }

  async function updateProfile(details) {
    if (!user) return { error: new Error("Sign in before updating a profile.") };

    const profileUpdates = {
      full_name: details.name ?? user.name,
      phone: details.phone ?? user.phone,
      avatar_url: details.avatar ?? user.avatar,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("profiles").update(profileUpdates).eq("id", user.id);

    if (!error) {
      setUser((currentUser) => ({ ...currentUser, ...details, avatar: profileUpdates.avatar_url }));
    }
    return { error };
  }

  async function uploadAvatar(file) {
    if (!user) return { error: new Error("Sign in before uploading a photo.") };

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/avatar.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) return { error: uploadError };

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ avatar_url: path })
      .eq("id", user.id);
    if (profileError) return { error: profileError };

    const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60);
    setUser((currentUser) => ({ ...currentUser, avatar: data?.signedUrl ?? "" }));
    return { error: null };
  }

  function updateSettings(settings) {
    setUser((currentUser) => currentUser ? {
      ...currentUser,
      settings: { ...currentUser.settings, ...settings },
    } : currentUser);
  }

  function addOrder(newOrder) {
    setUser((currentUser) => currentUser ? { ...currentUser, orders: [newOrder, ...currentUser.orders] } : currentUser);
  }

  async function createOrder(order) {
    if (!user) return { error: new Error("Sign in before placing an order.") };

    const { data, error } = await supabase.rpc("create_checkout_order", {
      p_items: order.items.map((item) => ({ product_id: item.product_id, quantity: item.quantity })),
      p_payment_method: order.payment_method,
      p_contact_email: order.contact_email,
      p_contact_phone: order.contact_phone,
      p_shipping_address: order.shipping_address,
      p_shipping_fee: order.shipping_fee,
      p_delivery_notes: order.delivery_notes,
    });
    if (error) return { error };

    const createdOrder = data?.[0];
    if (!createdOrder) return { error: new Error("The order could not be created.") };

    const orders = await fetchOrders(user.id);
    setUser((currentUser) => ({ ...currentUser, orders }));
    return { data: createdOrder, error: null };
  }

  async function addAddress(newAddress) {
    if (!user) return { error: new Error("Sign in before saving an address.") };
    const isDefault = newAddress.isDefault ?? user.addresses.length === 0;

    if (isDefault) {
      const { error } = await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id).eq("is_default", true);
      if (error) return { error };
    }

    const { data, error } = await supabase.from("addresses").insert({
      user_id: user.id,
      label: newAddress.label || "Home",
      recipient: newAddress.recipient || user.name,
      phone: newAddress.phone || user.phone,
      street: newAddress.street || newAddress.address,
      city: newAddress.city || "Accra",
      region: newAddress.region || "Greater Accra",
      country: newAddress.country || "Ghana",
      is_default: isDefault,
    }).select("id, label, recipient, phone, street, city, region, country, is_default").single();

    if (!error) {
      const { is_default, ...address } = data;
      setUser((currentUser) => ({
        ...currentUser,
        addresses: [...currentUser.addresses.map((item) => ({ ...item, isDefault: isDefault ? false : item.isDefault })), { ...address, isDefault: is_default }],
      }));
    }
    return { error };
  }

  async function removeAddress(id) {
    if (!user) return { error: new Error("Sign in before removing an address.") };
    const { error } = await supabase.from("addresses").delete().eq("id", id).eq("user_id", user.id);
    if (!error) {
      setUser((currentUser) => ({ ...currentUser, addresses: currentUser.addresses.filter((address) => address.id !== id) }));
    }
    return { error };
  }

  async function setDefaultAddress(id) {
    if (!user) return { error: new Error("Sign in before updating an address.") };
    const { error: clearError } = await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id).eq("is_default", true);
    if (clearError) return { error: clearError };
    const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", id).eq("user_id", user.id);
    if (!error) {
      setUser((currentUser) => ({ ...currentUser, addresses: currentUser.addresses.map((address) => ({ ...address, isDefault: address.id === id })) }));
    }
    return { error };
  }

  async function toggleFavorite(product) {
    if (!user) return false;
    const exists = user.favorites.some((item) => item.id === product.id);
    const { error } = exists
      ? await supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", product.id)
      : await supabase.from("favorites").insert({ user_id: user.id, product_id: product.id });

    if (!error) {
      setUser((currentUser) => ({
        ...currentUser,
        favorites: exists
          ? currentUser.favorites.filter((item) => item.id !== product.id)
          : [...currentUser.favorites, product],
      }));
    }
    return !error;
  }

  function isFavorite(id) {
    return user?.favorites.some((item) => item.id === id) ?? false;
  }

  async function signOut() {
    return supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, authLoading, signIn, signUp, signInWithGoogle, updateProfile, uploadAvatar, updateSettings, addOrder, createOrder, addAddress, removeAddress, setDefaultAddress, toggleFavorite, isFavorite, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
