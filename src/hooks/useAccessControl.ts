"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export type AccessState = {
  isLoggedIn: boolean;
  hasAccess: boolean;

  hasSlot: boolean;
  loading: boolean;
  userId?: string;
  userEmail?: string;
};

// Module-level promise cache to deduplicate simultaneous calls
let fetchPromise: Promise<{ hasAccess: boolean; hasSlot: boolean }> | null = null;

export function useAccessControl(): AccessState {
  const [state, setState] = useState<AccessState>({
    isLoggedIn: false,
    hasAccess: false,

    hasSlot: false,
    loading: true,
    userId: undefined,
    userEmail: undefined,
  });

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        if (!cancelled) {
          setState({ isLoggedIn: false, hasAccess: false, hasSlot: false, loading: false, userId: undefined, userEmail: undefined });
          try { sessionStorage.removeItem("mybatch_access") } catch {}
        }
        return;
      }

      // Check cache first
      try {
        const cached = sessionStorage.getItem("mybatch_access");
        if (cached) {
          const { value, expiry } = JSON.parse(cached);
          if (Date.now() < expiry) {
            if (!cancelled) {
              setState({
                isLoggedIn: true,
                hasAccess: Boolean(value.hasAccess),

                hasSlot: Boolean(value.hasSlot),
                loading: false,
                userId: session.user.id,
                userEmail: session.user.email,
              });
            }
            return;
          }
        }
      } catch {}

      // Fetch from API
      try {
        if (!fetchPromise) {
          fetchPromise = fetch("/api/my-batch/access", {
            credentials: "include",
            headers: { "Cache-Control": "no-cache, no-store" },
          }).then(res => {
            if (!res.ok) throw new Error("Failed to fetch access");
            return res.json();
          }).finally(() => {
            fetchPromise = null;
          });
        }

        const data = await fetchPromise;
        if (!cancelled) {
          setState({
            isLoggedIn: true,
            hasAccess: Boolean(data.hasAccess),

            hasSlot: Boolean(data.hasSlot),
            loading: false,
            userId: session.user.id,
            userEmail: session.user.email,
          });
          try {
            sessionStorage.setItem("mybatch_access", JSON.stringify({
              value: { hasAccess: Boolean(data.hasAccess), hasSlot: Boolean(data.hasSlot) },
              expiry: Date.now() + 5 * 60 * 1000
            }));
          } catch {}
        }
      } catch {
        if (!cancelled) {
          setState(s => ({ ...s, isLoggedIn: true, loading: false, userId: session.user.id, userEmail: session.user.email }));
        }
      }
    };

    checkAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        checkAccess();
      } else if (event === "SIGNED_OUT") {
        if (!cancelled) {
          setState({ isLoggedIn: false, hasAccess: false, hasSlot: false, loading: false, userId: undefined, userEmail: undefined });
          try { sessionStorage.removeItem("mybatch_access") } catch {}
        }
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
