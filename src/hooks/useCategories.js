import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, description, image_url")
        .order("sort_order");

      if (!active) return;
      setCategories(error ? [] : data);
      setLoading(false);
    }

    loadCategories();
    return () => { active = false; };
  }, []);

  return { categories, loading };
}
