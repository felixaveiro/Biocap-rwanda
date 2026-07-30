'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import UserTable from "@/components/UserTable";
import { usersApi } from "@/lib/api/users";
import { can } from "@/lib/permissions";
import { useSession } from "@/hooks/useSession";
import { User, Role } from "@/types";

export default function UsersPage() {
  const { user, loading, allowed } = useSession("user:view");
  const [users, setUsers] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !allowed) {
      setDataLoading(false);
      return;
    }

    async function fetchRealUsers() {
      // Guard check so TypeScript knows `user` is non-null inside async scope
      if (!user) return;

      setDataLoading(true);
      setErrorMsg(null);
      try {
        // Call the real API wrapper
        const res: any = await usersApi.listUsers(user.role as Role);

        // Normalize response whether backend returns [], { data: [] }, { users: [] }, or { docs: [] }
        let userList: User[] = [];
        if (Array.isArray(res)) {
          userList = res;
        } else if (Array.isArray(res?.data)) {
          userList = res.data;
        } else if (Array.isArray(res?.users)) {
          userList = res.users;
        } else if (Array.isArray(res?.docs)) {
          userList = res.docs;
        }

        setUsers(userList);
      } catch (err: any) {
        console.error("Failed to load real users from backend:", err);
        setErrorMsg(err.message || "Could not fetch users from server.");
        setUsers([]);
      } finally {
        setDataLoading(false);
      }
    }

    fetchRealUsers();
  }, [user, allowed]);

  if (loading || dataLoading) {
    return (
      <div>
        <Header title="Loading…" subtitle="Fetching users" />
        <div className="p-8 text-sm text-slate-400">Loading…</div>
      </div>
    );
  }

  if (!allowed || !user) {
    return (
      <div>
        <Header title="Access Denied" subtitle="Insufficient privileges" />
        <div className="p-8 text-sm text-slate-400">
          You do not have permission to view the users list.
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="User management"
        subtitle={
          can(user.role as Role, "user:edit:role")
            ? "Create users, assign roles and manage access"
            : "View and edit user information"
        }
      />
      <div className="p-8">
        {errorMsg && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <strong>Backend Connection Error:</strong> {errorMsg}
          </div>
        )}

        {can(user.role as Role, "user:create") && (
          <div className="mb-4 flex justify-end">
            <Link
              href="/admin/team/new"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
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