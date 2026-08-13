import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function resolveImage(image) {
  if (!image) return null;
  return image.startsWith("http") ? image : `${import.meta.env.BASE_URL}${image.replace(/^\//, "")}`;
}

function toProduct(row, promotion = null, ratingSummary = null) {
  const images = (row.image_urls?.length ? row.image_urls : [row.image_url]).map(resolveImage).filter(Boolean);

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
    images,
    ratingAverage: ratingSummary?.average ?? 0,
    reviewCount: ratingSummary?.count ?? 0,
  };
}

export function useProducts({ limit, category = "All", search = "", minPrice = "", maxPrice = "" } = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let active = true;
    let expirationTimer;

    // A new filter or page request must enter a loading state immediately.
    // This prevents empty/stale catalog data from briefly rendering as a
    // "not found" or "no products" message before Supabase responds.
    setLoading(true);
    setError(null);

    function schedulePromotionExpiry(endsAt) {
      clearTimeout(expirationTimer);
      if (!endsAt) return;
      const delay = new Date(endsAt).getTime() - Date.now();
      if (delay > 0) expirationTimer = setTimeout(loadProducts, delay + 50);
    }

    async function loadProducts() {
      let productsQuery = supabase.from("products").select("id, name, category, description, price, stock_quantity, image_url, image_urls, featured").order("created_at");
      if (category !== "All") productsQuery = productsQuery.eq("category", category);
      if (search.trim()) productsQuery = productsQuery.ilike("name", `%${search.trim()}%`);
      if (minPrice !== "") productsQuery = productsQuery.gte("price", Number(minPrice));
      if (maxPrice !== "") productsQuery = productsQuery.lte("price", Number(maxPrice));
      if (limit) productsQuery = productsQuery.limit(limit + 1);

      const [productsResult, promoResult, reviewsResult] = await Promise.all([
        productsQuery,
        supabase.from("promo_banners").select("discount_percent, discount_scope, discount_categories, ends_at").eq("is_active", true).order("sort_order").limit(1).maybeSingle(),
        supabase.from("product_reviews").select("product_id, rating").eq("is_visible", true),
      ]);
      const { data, error: queryError } = productsResult;
      const promo = promoResult.data;
      const isActiveDiscount = promo && (!promo.ends_at || new Date(promo.ends_at).getTime() > Date.now());
      const promotion = isActiveDiscount ? promo : null;

      schedulePromotionExpiry(promo?.ends_at);

      if (!active) return;
      if (queryError || reviewsResult.error) {
        setError(queryError ?? reviewsResult.error);
        setProducts([]);
        setHasMore(false);
      } else {
        const ratings = (reviewsResult.data ?? []).reduce((summary, review) => {
          const current = summary[review.product_id] ?? { total: 0, count: 0 };
          summary[review.product_id] = { total: current.total + Number(review.rating), count: current.count + 1 };
          return summary;
        }, {});
        const catalog = data.map((product) => {
          const summary = ratings[product.id];
          return toProduct(product, promotion, summary ? { average: summary.total / summary.count, count: summary.count } : null);
        });
        setProducts(limit ? catalog.slice(0, limit) : catalog);
        setHasMore(Boolean(limit) && catalog.length > limit);
        setError(null);
      }
      setLoading(false);
    }

    loadProducts();
    const channel = supabase.channel(`catalog-updates-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "promo_banners" }, loadProducts)
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, loadProducts)
      .on("postgres_changes", { event: "*", schema: "public", table: "product_reviews" }, loadProducts)
      .subscribe();
    return () => { active = false; clearTimeout(expirationTimer); supabase.removeChannel(channel); };
  }, [limit, category, search, minPrice, maxPrice]);

  return { products, loading, error, hasMore };
}
