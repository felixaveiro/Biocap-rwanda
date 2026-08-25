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
      // 1. If no token exists in cookies, immediately mark logged out without making network calls
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
        // 3. Clear session and cache if backend explicitly returned 401 Unauthorized or invalid token
        if (error instanceof ApiError && error.status === 401) {
          console.warn("[Session] Token expired or unauthorized (401).");
          authCookies.clearAll();
          cachedUser = null;
          if (isMounted) {
            setUser(null);
          }
        } else {
          console.warn("[Session] Temporary session verification error:", error);
        }
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
    (!requiredPermission || (isAuthenticated && user && can(user.role, requiredPermission)));

  // Redirect ONLY IF requiredPermission was explicitly required
  useEffect(() => {
    if (!loading && requiredPermission) {
      if (!isAuthenticated && !authCookies.isLoggedIn()) {
        router.replace("/auth/login");
      } else if (
        isAuthenticated &&
        user &&
        !can(user.role, requiredPermission)
      ) {
        router.replace("/dashboard");
      }
    }
  }, [loading, isAuthenticated, user, requiredPermission, router]);

  return { user, loading, allowed };
}