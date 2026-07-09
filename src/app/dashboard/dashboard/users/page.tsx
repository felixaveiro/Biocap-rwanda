'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import UserTable from "@/components/UserTable";
import { listUsers } from "@/lib/data";
import { can } from "@/lib/permissions";
import { useSession } from "@/hooks/useSession";
import { User } from "@/types";

export default function UsersPage() {
  const { user, loading, allowed } = useSession("user:view");
  const [users, setUsers] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user || !allowed) return;
    listUsers().then((u) => {
      setUsers(u);
      setDataLoading(false);
    });
  }, [user, allowed]);

  if (loading || !allowed || !user || dataLoading) {
    return (
      <div>
        <Header title="Loading…" subtitle="Fetching users" />
        <div className="p-8 text-sm text-slate-400">Loading…</div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="User management"
        subtitle={
          can(user.role, "user:edit:role")
            ? "Create users, assign roles and manage access"
            : "View and edit user information"
        }
      />
      <div className="p-8">
        {can(user.role, "user:create") && (
          <div className="mb-4 flex justify-end">
            <Link
              href="/dashboard/users/new"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Add user
            </Link>
          </div>
        )}
        <UserTable users={users} currentUser={user} />
      </div>
    </div>
  );
}