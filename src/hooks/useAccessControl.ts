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

// Module-level in-memory cache to prevent duplicate fetches across component re-renders
let memoryCachedAccessState: AccessState | null = null;
let fetchPromise: Promise<any> | null = null;

/**
 * Reads verified access data stored in sessionStorage.
 * This data is ONLY stored after a successful /api/my-batch/access HTTP 200 response.
 */
function readVerifiedSession(userId?: string): AccessState | null {
  if (typeof window === "undefined") return null;
  try {
    const keysToCheck = userId
      ? [`mybatch_access_${userId}`, "mybatch_access"]
      : ["mybatch_access"];

    for (const key of keysToCheck) {
      const cached = sessionStorage.getItem(key);
      if (!cached) continue;
      const { value, expiry } = JSON.parse(cached);
      if (Date.now() < expiry && value && typeof value.hasAccess === "boolean") {
        if (!userId || !value.userId || value.userId === userId) {
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
    }
  } catch {}
  return null;
}

/**
 * Reads the lightweight auth UI hint from localStorage.
 * Used solely so the Navbar can immediately display the avatar on cold start
 * without flashing the "Log in" button while the session and access resolve.
 *
 * NOTE: This hint NEVER authorizes batch access and MUST NOT be used to set hasAccess.
 */
function readAuthHint(): AccessState | null {
  if (typeof window === "undefined") return null;
  try {
    const hint = localStorage.getItem("skillyug_auth_hint");
    if (hint) {
      const parsed = JSON.parse(hint);
      if (parsed && parsed.isLoggedIn) {
        return {
          isLoggedIn: true,
          hasAccess: false, // Never assume access from unverified auth hint
          hasSlot: false,
          loading: false, // Auth state is known, preventing "Log in" button flash
          userId: parsed.userId,
          userEmail: parsed.userEmail,
        };
      }
    }
  } catch {}
  return null;
}

/**
 * Initial state reader: prefers verified session cache; falls back to auth UI hint;
 * defaults to unauthenticated loading state.
 */
function getInitialAccessState(): AccessState {
  if (memoryCachedAccessState) return memoryCachedAccessState;
  const verified = readVerifiedSession();
  if (verified) {
    memoryCachedAccessState = verified;
    return verified;
  }
  const hint = readAuthHint();
  if (hint) {
    // Return hint for initial render without caching in memoryCachedAccessState
    // so that the background verification always runs.
    return hint;
  }
  return {
    isLoggedIn: false,
    hasAccess: false,
    hasSlot: false,
    loading: true,
    userId: undefined,
    userEmail: undefined,
  };
}

export function useAccessControl(): AccessState {
  const [state, setState] = useState<AccessState>(getInitialAccessState);

  useEffect(() => {
    let cancelled = false;

    // Check if we can hydrate from verified session cache immediately on mount
    if (!memoryCachedAccessState) {
      const verified = readVerifiedSession();
      if (verified && !cancelled) {
        memoryCachedAccessState = verified;
        setState(verified);
      }
    }

    const checkAccess = async (forceRefresh = false) => {
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
              Object.keys(sessionStorage).forEach((key) => {
                if (key.startsWith("mybatch_access")) {
                  sessionStorage.removeItem(key);
                }
              });
              localStorage.removeItem("skillyug_auth_hint");
            } catch {}
          }
          return;
        }

        // Authenticated user exists.
        // If not a forced refresh, check if we already have verified server access in sessionStorage
        if (!forceRefresh) {
          const verified = readVerifiedSession(session.user.id);
          // Only skip server check if access was explicitly verified as TRUE by the server
          if (verified && verified.hasAccess) {
            if (!cancelled) {
              memoryCachedAccessState = verified;
              setState(verified);
            }
            return;
          }
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
          const hasAccess = Boolean(data.hasAccess);
          const hasSlot = Boolean(data.hasSlot);

          const newState: AccessState = {
            isLoggedIn: true,
            hasAccess,
            hasSlot,
            loading: false,
            userId: session.user.id,
            userEmail: session.user.email,
          };
          memoryCachedAccessState = newState;
          setState(newState);

          try {
            const cachePayload = {
              hasAccess,
              hasSlot,
              activeBatch: data.activeBatch,
              userId: session.user.id,
              userEmail: session.user.email,
              isAdmin: Boolean(data.isAdmin),
            };
            const cacheString = JSON.stringify({
              value: cachePayload,
              expiry: Date.now() + 5 * 60 * 1000,
            });
            sessionStorage.setItem("mybatch_access", cacheString);
            sessionStorage.setItem(`mybatch_access_${session.user.id}`, cacheString);

            // Store clean auth hint in localStorage (UI display only, no access authorization)
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
        // Force fresh server verification on sign-in
        checkAccess(true);
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
          Object.keys(sessionStorage).forEach((key) => {
            if (key.startsWith("mybatch_access")) {
              sessionStorage.removeItem(key);
            }
          });
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
