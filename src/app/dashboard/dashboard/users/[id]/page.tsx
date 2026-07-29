'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import UserForm from "@/components/UserForm";
import { getUser } from "@/lib/data";
import { can } from "@/lib/permissions";
import { useSession } from "@/hooks/useSession";
import { User } from "@/types";

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading, allowed } = useSession("user:edit:info");
  const [target, setTarget] = useState<User | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    if (!user || !allowed || !params?.id) return;
    
    getUser(params.id)
      .then((u) => {
        if (u) {
          setTarget(u);
        } else {
          setNotFoundState(true);
        }
      })
      .catch((err) => {
        console.error("Failed to load user:", err);
        setNotFoundState(true);
      })
      .finally(() => {
        setDataLoading(false);
      });
  }, [user, allowed, params?.id]);

  if (loading || !allowed || !user || dataLoading) {
    return (
      <div>
        <Header title="Loading…" subtitle="Fetching user" />
        <div className="p-8 text-sm text-slate-400">Loading…</div>
      </div>
    );
  }

  if (notFoundState || !target) {
    return (
      <div>
        <Header title="User not found" subtitle="" />
        <div className="p-8 text-sm text-slate-400">
          This user doesn&apos;t exist.{" "}
          <button
            className="text-brand-600 underline"
            onClick={() => router.push("/dashboard/users")}
          >
            Back to users
          </button>
        </div>
      </div>
    );
  }

  // Safely construct display name from MongoDB / API fields
  const targetUserAny = target as any;
  const displayName =
    `${targetUserAny.firstName || ""} ${targetUserAny.lastName || ""}`.trim() ||
    targetUserAny.username ||
    targetUserAny.name ||
    "User";

  return (
    <div>
      <Header title={`Edit ${displayName}`} subtitle={target.email} />
      <div className="p-8">
        <UserForm
          mode="edit"
          canEditRole={can(user.role, "user:edit:role")}
          initial={
            {
              _id: targetUserAny._id || targetUserAny.id,
              id: targetUserAny._id || targetUserAny.id,
              firstName: targetUserAny.firstName || "",
              lastName: targetUserAny.lastName || "",
              name: displayName,
              username: targetUserAny.username || "",
              email: target.email,
              role: target.role,
              active: targetUserAny.active ?? targetUserAny.isActive ?? true,
              isActive: targetUserAny.isActive ?? targetUserAny.active ?? true,
            } as any
          }
        />
      </div>
    </div>
  );
}