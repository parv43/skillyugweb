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

let memoryCachedAccessState: AccessState | null = null;
let fetchPromise: Promise<any> | null = null;

function readStoredAuth(): AccessState | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = sessionStorage.getItem("mybatch_access");
    if (cached) {
      const { value, expiry } = JSON.parse(cached);
      if (Date.now() < expiry && value) {
        return {
          isLoggedIn: true,
          hasAccess: Boolean(value.hasAccess),
          hasSlot: Boolean(value.hasSlot),
          loading: false,
          userId: value.userId,
          userEmail: value.userEmail,
        };
      }
    }
  } catch {}

  try {
    const hint = localStorage.getItem("skillyug_auth_hint");
    if (hint) {
      const parsed = JSON.parse(hint);
      if (parsed && parsed.isLoggedIn) {
        return {
          isLoggedIn: true,
          hasAccess: Boolean(parsed.hasAccess),
          hasSlot: Boolean(parsed.hasSlot),
          loading: false,
          userId: parsed.userId,
          userEmail: parsed.userEmail,
        };
      }
    }
  } catch {}

  return null;
}

export function useAccessControl(): AccessState {
  const [state, setState] = useState<AccessState>(() => {
    if (memoryCachedAccessState) return memoryCachedAccessState;
    const stored = readStoredAuth();
    if (stored) {
      memoryCachedAccessState = stored;
      return stored;
    }
    return {
      isLoggedIn: false,
      hasAccess: false,
      hasSlot: false,
      loading: true,
      userId: undefined,
      userEmail: undefined,
    };
  });

  useEffect(() => {
    let cancelled = false;

    // Check if we can hydrate from local cache immediately on mount
    if (!memoryCachedAccessState) {
      const stored = readStoredAuth();
      if (stored && !cancelled) {
        memoryCachedAccessState = stored;
        setState(stored);
      }
    }

    const checkAccess = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (!cancelled) {
            const loggedOutState: AccessState = {
              isLoggedIn: false,
              hasAccess: false,
              hasSlot: false,
              loading: false,
              userId: undefined,
              userEmail: undefined,
            };
            memoryCachedAccessState = loggedOutState;
            setState(loggedOutState);
            try {
              sessionStorage.removeItem("mybatch_access");
              localStorage.removeItem("skillyug_auth_hint");
            } catch {}
          }
          return;
        }

        // Check if stored cache is already valid for this user
        const cached = readStoredAuth();
        if (cached && cached.userId === session.user.id) {
          if (!cancelled) {
            memoryCachedAccessState = cached;
            setState(cached);
          }
          return;
        }

        // Fetch fresh access data from server API
        if (!fetchPromise) {
          const token = session.access_token;
          fetchPromise = fetch("/api/my-batch/access", {
            credentials: "same-origin",
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
              "Cache-Control": "no-cache",
            },
          })
            .then((res) => {
              if (!res.ok) throw new Error("Failed to fetch access");
              return res.json();
            })
            .finally(() => {
              fetchPromise = null;
            });
        }

        const data = await fetchPromise;
        if (!cancelled) {
          const newState: AccessState = {
            isLoggedIn: true,
            hasAccess: Boolean(data.hasAccess),
            hasSlot: Boolean(data.hasSlot),
            loading: false,
            userId: session.user.id,
            userEmail: session.user.email,
          };
          memoryCachedAccessState = newState;
          setState(newState);

          try {
            const cachePayload = {
              hasAccess: Boolean(data.hasAccess),
              hasSlot: Boolean(data.hasSlot),
              activeBatch: data.activeBatch,
              userId: session.user.id,
              userEmail: session.user.email,
              isAdmin: Boolean(data.isAdmin),
            };
            sessionStorage.setItem(
              "mybatch_access",
              JSON.stringify({
                value: cachePayload,
                expiry: Date.now() + 5 * 60 * 1000,
              })
            );
            localStorage.setItem(
              "skillyug_auth_hint",
              JSON.stringify({
                isLoggedIn: true,
                hasAccess: Boolean(data.hasAccess),
                hasSlot: Boolean(data.hasSlot),
                userId: session.user.id,
                userEmail: session.user.email,
              })
            );
          } catch {}
        }
      } catch {
        if (!cancelled) {
          setState((s) => ({ ...s, loading: false }));
        }
      }
    };

    checkAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        if (session) {
          try {
            localStorage.setItem(
              "skillyug_auth_hint",
              JSON.stringify({
                isLoggedIn: true,
                userId: session.user.id,
                userEmail: session.user.email,
              })
            );
          } catch {}
        }
        checkAccess();
      } else if (event === "SIGNED_OUT") {
        memoryCachedAccessState = {
          isLoggedIn: false,
          hasAccess: false,
          hasSlot: false,
          loading: false,
          userId: undefined,
          userEmail: undefined,
        };
        try {
          sessionStorage.removeItem("mybatch_access");
          localStorage.removeItem("skillyug_auth_hint");
        } catch {}
        if (!cancelled) {
          setState(memoryCachedAccessState);
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
