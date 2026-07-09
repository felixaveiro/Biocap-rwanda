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
    if (!user || !allowed) return;
    getUser(params.id).then((u) => {
      u ? setTarget(u) : setNotFoundState(true);
      setDataLoading(false);
    });
  }, [user, allowed, params.id]);

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
          <button className="text-brand-600 underline" onClick={() => router.push("/dashboard/users")}>
            Back to users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title={`Edit ${target.name}`} subtitle={target.email} />
      <div className="p-8">
        <UserForm
          mode="edit"
          canEditRole={can(user.role, "user:edit:role")}
          initial={{
            id: target.id,
            name: target.name,
            email: target.email,
            role: target.role,
            active: target.active,
          }}
        />
      </div>
    </div>
  );
}