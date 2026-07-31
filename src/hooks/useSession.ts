'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api/auth";
import { authCookies } from "@/lib/auth/cookies";
import { can, Permission } from "@/lib/permissions";
import { User } from "@/types";
import { ApiError } from "@/lib/api/client";

// In-memory cache to prevent redundant /api/auth/me requests across route transitions
let cachedUser: User | null = null;

/**
 * Call this function on logout to reset the in-memory session cache.
 */
export function clearSessionCache() {
  cachedUser = null;
}

export function useSession(requiredPermission?: Permission) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(cachedUser);
  const [loading, setLoading] = useState<boolean>(!cachedUser);

  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      // 1. If no token exists, immediately mark logged out
      if (!authCookies.isLoggedIn()) {
        cachedUser = null;
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      // 2. If cached user exists, set UI state immediately (non-blocking)
      if (cachedUser && isMounted) {
        setUser(cachedUser);
        setLoading(false);
      }

      try {
        const currentUser = await getMe();
        cachedUser = currentUser;
        if (isMounted) {
          setUser(currentUser);
        }
      } catch (error: unknown) {
        console.error("Session verification failed:", error);

        // 3. ONLY clear cookies and cache if backend explicitly returned 401 Unauthorized
        if (error instanceof ApiError && error.status === 401) {
          authCookies.clearAll();
          cachedUser = null;
          if (isMounted) {
            setUser(null);
          }
        }
        // For network glitches, 5xx backend errors, or Render cold starts, keep user session intact
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const isAuthenticated = !!user;
  const allowed =
    !loading &&
    isAuthenticated &&
    (!requiredPermission || (user ? can(user.role, requiredPermission) : false));

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated && !authCookies.isLoggedIn()) {
        router.replace("/auth/login");
      } else if (
        isAuthenticated &&
        requiredPermission &&
        user &&
        !can(user.role, requiredPermission)
      ) {
        router.replace("/dashboard");
      }
    }
  }, [loading, isAuthenticated, user, requiredPermission, router]);

  return { user, loading, allowed };
}