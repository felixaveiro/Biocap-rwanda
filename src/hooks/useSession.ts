'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserSync } from "@/lib/data";
import { can, Permission } from "@/lib/permissions";
import { User } from "@/types";

export function useSession(requiredPermission?: Permission) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getCurrentUserSync());
    setLoading(false);
  }, []);

  const allowed = !loading && !!user && (!requiredPermission || can(user.role, requiredPermission));

  useEffect(() => {
    if (!loading && user && requiredPermission && !can(user.role, requiredPermission)) {
      router.replace("/dashboard");
    }
  }, [loading, user, requiredPermission, router]);

  return { user, loading, allowed };
}