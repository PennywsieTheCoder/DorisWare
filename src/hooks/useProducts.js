import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function toProduct(row, promotion = null) {
  const image = row.image_url?.startsWith("http")
    ? row.image_url
    : row.image_url
      ? `${import.meta.env.BASE_URL}${row.image_url.replace(/^\//, "")}`
      : null;

  const basePrice = Number(row.price);
  const discountPercent = Number(promotion?.discount_percent || 0);
  const categoryMatches = promotion?.discount_scope !== "categories" || promotion.discount_categories?.includes(row.category);
  const qualifiesForDiscount = discountPercent > 0 && Number(row.stock_quantity) > 0 && categoryMatches;
  const effectivePrice = qualifiesForDiscount ? basePrice * (1 - discountPercent / 100) : basePrice;

  return {
    ...row,
    price: `₵${effectivePrice.toFixed(2)}`,
    originalPrice: qualifiesForDiscount ? basePrice : null,
    discountPercent: qualifiesForDiscount ? discountPercent : 0,
    quantity: row.stock_quantity,
    images: image ? [image] : [],
  };
}

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    let expirationTimer;

    function schedulePromotionExpiry(endsAt) {
      clearTimeout(expirationTimer);
      if (!endsAt) return;
      const delay = new Date(endsAt).getTime() - Date.now();
      if (delay > 0) expirationTimer = setTimeout(loadProducts, delay + 50);
    }

    async function loadProducts() {
      const [productsResult, promoResult] = await Promise.all([
        supabase.from("products").select("id, name, category, description, price, stock_quantity, image_url, featured").order("created_at"),
        supabase.from("promo_banners").select("discount_percent, discount_scope, discount_categories, ends_at").eq("is_active", true).order("sort_order").limit(1).maybeSingle(),
      ]);
      const { data, error: queryError } = productsResult;
      const promo = promoResult.data;
      const isActiveDiscount = promo && (!promo.ends_at || new Date(promo.ends_at).getTime() > Date.now());
      const promotion = isActiveDiscount ? promo : null;

      schedulePromotionExpiry(promo?.ends_at);

      if (!active) return;
      if (queryError) {
        setError(queryError);
        setProducts([]);
      } else {
        setProducts(data.map((product) => toProduct(product, promotion)));
        setError(null);
      }
      setLoading(false);
    }

    loadProducts();
    const channel = supabase.channel(`catalog-promo-prices-${crypto.randomUUID()}`).on("postgres_changes", { event: "*", schema: "public", table: "promo_banners" }, loadProducts).subscribe();
    return () => { active = false; clearTimeout(expirationTimer); supabase.removeChannel(channel); };
  }, []);

  return { products, loading, error };
}
