'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api/auth";
import { authCookies } from "@/lib/auth/cookies";
import { can, Permission } from "@/lib/permissions";
import { User } from "@/types";

export function useSession(requiredPermission?: Permission) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      if (!authCookies.isLoggedIn()) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const currentUser = await getMe();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        // Token invalid or expired
        authCookies.clearAll();
        if (isMounted) {
          setUser(null);
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
  const allowed = !loading && isAuthenticated && (!requiredPermission || can(user.role, requiredPermission));

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace("/auth/login");
      } else if (requiredPermission && !can(user.role, requiredPermission)) {
        router.replace("/dashboard");
      }
    }
  }, [loading, isAuthenticated, user, requiredPermission, router]);

  return { user, loading, allowed };
}