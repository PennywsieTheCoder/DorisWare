import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { setSessionPersistence, supabase } from "../lib/supabase";

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
    rawStatus: order.status,
    trackingNumber: order.tracking_number,
    estimatedDelivery: order.estimated_delivery_at ? new Date(`${order.estimated_delivery_at}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : order.status === "delivered" ? "Delivered" : "To be confirmed",
    fulfilmentNote: order.fulfilment_note ?? "",
    deliveryMethod: order.delivery_method ?? "dorisware_delivery",
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
    avatarPath: profile?.avatar_url ?? "",
    role: profile?.role ?? "customer",
    // Product details are resolved from the live catalog in ProfilePage. Keeping
    // each saved ID here means every Admin-created product remains a favorite
    // after a refresh instead of being limited to the retired static catalog.
    favorites: favoriteIds.map((id) => previousUser?.favorites?.find((product) => product.id === id) ?? { id }),
    orders,
    addresses,
    points: profile?.reward_points ?? 0,
    settings: previousUser?.settings ?? defaultSettings,
    birthday: profile?.date_of_birth ?? "",
    cookingStyle: profile?.cooking_style ?? "Cast Iron & Heavy Dutch Ovens",
    memberSince: profile?.created_at ?? authUser.created_at ?? "",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [avatarPath, setAvatarPath] = useState("");

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
      setAvatarPath("");
      setAuthLoading(false);
      return;
    }
    const authMetadata = authUser.user_metadata ?? {};

    const [profileResult, addressesResult, favoritesResult, orders] = await Promise.all([
      supabase.from("profiles").select("id, full_name, phone, avatar_url, date_of_birth, cooking_style, reward_points, created_at, role").eq("id", authUser.id).maybeSingle(),
      supabase.from("addresses").select("id, label, recipient, phone, street, city, region, country, is_default").eq("user_id", authUser.id).order("created_at"),
      supabase.from("favorites").select("product_id").eq("user_id", authUser.id),
      fetchOrders(authUser.id),
    ]);

    if (profileResult.error) console.error("Could not load the user profile:", profileResult.error.message);
    if (addressesResult.error) console.error("Could not load addresses:", addressesResult.error.message);
    if (favoritesResult.error) console.error("Could not load favorites:", favoritesResult.error.message);

    const signedAvatarMarker = "/storage/v1/object/sign/avatars/";
    const googleName = authMetadata.full_name ?? authMetadata.name ?? "";
    const googleAvatar = authMetadata.avatar_url ?? authMetadata.picture ?? "";
    const missingProfileDetails = profileResult.data && {
      ...(profileResult.data.full_name ? {} : googleName ? { full_name: googleName } : {}),
      ...(profileResult.data.avatar_url ? {} : googleAvatar ? { avatar_url: googleAvatar } : {}),
    };
    if (missingProfileDetails && Object.keys(missingProfileDetails).length > 0) {
      const { data, error } = await supabase
        .from("profiles")
        .update(missingProfileDetails)
        .eq("id", authUser.id)
        .select("id, full_name, phone, avatar_url, date_of_birth, cooking_style, reward_points, created_at, role")
        .single();
      if (!error && data) profileResult.data = data;
    }
    const savedAvatarUrl = profileResult.data?.avatar_url ?? "";
    const storedAvatarPath = savedAvatarUrl.includes(signedAvatarMarker)
      ? decodeURIComponent(savedAvatarUrl.split(signedAvatarMarker)[1].split("?")[0])
      : savedAvatarUrl;
    let profile = profileResult.data ? { ...profileResult.data, avatar_url: storedAvatarPath } : null;
    if (storedAvatarPath !== savedAvatarUrl) {
      supabase.from("profiles").update({ avatar_url: storedAvatarPath }).eq("id", authUser.id).then(() => {});
    }
    if (profile?.avatar_url && !profile.avatar_url.startsWith("http")) {
      const { data } = await supabase.storage.from("avatars").createSignedUrl(profile.avatar_url, 60 * 60);
      profile = { ...profile, avatar_url: data?.signedUrl ?? "" };
    }
    setAvatarPath(storedAvatarPath);

    const addresses = (addressesResult.data ?? []).map(({ is_default, ...address }) => ({
      ...address,
      isDefault: is_default,
    }));
    const favoriteIds = (favoritesResult.data ?? []).map((favorite) => favorite.product_id);
    setUser((previousUser) => ({
      ...toAppUser(authUser, profile, addresses, favoriteIds, orders, previousUser),
      avatarPath: storedAvatarPath,
    }));
    setAuthLoading(false);
  }, [fetchOrders]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => loadUser(session?.user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session?.user);
    });

    return () => subscription.unsubscribe();
  }, [loadUser]);

  useEffect(() => {
    if (!avatarPath || avatarPath.startsWith("http")) return undefined;

    const refreshAvatarUrl = async () => {
      const { data } = await supabase.storage.from("avatars").createSignedUrl(avatarPath, 60 * 60);
      if (data?.signedUrl) {
        setUser((currentUser) => currentUser ? { ...currentUser, avatar: data.signedUrl, avatarPath } : currentUser);
      }
    };

    const timer = window.setInterval(refreshAvatarUrl, 45 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [avatarPath]);

  async function signIn({ email, password, remember = true, captchaToken }) {
    setSessionPersistence(remember);
    const result = await supabase.auth.signInWithPassword({ email, password, options: { captchaToken } });
    if (!result.error && result.data.user) await loadUser(result.data.user);
    return result;
  }

  async function signUp({ name, email, password, captchaToken }) {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
        captchaToken,
      },
    });
  }

  async function signInWithGoogle(captchaToken) {
    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`, captchaToken },
    });
  }

  async function updateProfile(details) {
    if (!user) return { error: new Error("Sign in before updating a profile.") };

    const profileUpdates = {
      full_name: details.name ?? user.name,
      phone: details.phone ?? user.phone,
      date_of_birth: details.birthday || null,
      cooking_style: details.cookingStyle ?? user.cookingStyle ?? null,
    };
    if (details.avatar !== undefined) profileUpdates.avatar_url = details.avatar;
    const { error } = await supabase.from("profiles").update(profileUpdates).eq("id", user.id);

    if (!error) {
      setUser((currentUser) => currentUser ? {
        ...currentUser,
        ...details,
        ...(details.avatar !== undefined ? { avatar: details.avatar, avatarPath: details.avatar } : {}),
      } : currentUser);
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
    setAvatarPath(path);
    setUser((currentUser) => currentUser ? { ...currentUser, avatar: data?.signedUrl ?? "", avatarPath: path } : currentUser);
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
