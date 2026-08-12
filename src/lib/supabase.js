import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
let persistForThirtyDays = true;

const sessionStorageAdapter = {
  getItem(key) {
    const tabSession = window.sessionStorage.getItem(key);
    if (tabSession) {
      persistForThirtyDays = false;
      return tabSession;
    }

    const expiresAt = window.localStorage.getItem(`${key}:expires-at`);
    if (expiresAt && Number(expiresAt) <= Date.now()) {
      window.localStorage.removeItem(key);
      window.localStorage.removeItem(`${key}:expires-at`);
      return null;
    }
    const rememberedSession = window.localStorage.getItem(key);
    if (rememberedSession) {
      persistForThirtyDays = true;
      if (!expiresAt) window.localStorage.setItem(`${key}:expires-at`, String(Date.now() + 30 * 24 * 60 * 60 * 1000));
    }
    return rememberedSession;
  },
  setItem(key, value) {
    if (persistForThirtyDays) {
      window.sessionStorage.removeItem(key);
      window.localStorage.setItem(key, value);
      window.localStorage.setItem(`${key}:expires-at`, String(Date.now() + 30 * 24 * 60 * 60 * 1000));
      return;
    }
    window.localStorage.removeItem(key);
    window.localStorage.removeItem(`${key}:expires-at`);
    window.sessionStorage.setItem(key, value);
  },
  removeItem(key) {
    window.localStorage.removeItem(key);
    window.localStorage.removeItem(`${key}:expires-at`);
    window.sessionStorage.removeItem(key);
  },
};

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing Supabase configuration. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local.",
  );
}

export function setSessionPersistence(remember) {
  persistForThirtyDays = remember;
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: sessionStorageAdapter,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
