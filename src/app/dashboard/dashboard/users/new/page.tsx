'use client';

import Header from "@/components/Header";
import UserForm from "@/components/UserForm";
import { useSession } from "@/hooks/useSession";

export default function NewUserPage() {
  const { loading, allowed } = useSession("user:create");

  if (loading || !allowed) {
    return (
      <div>
        <Header title="Loading…" subtitle="Checking access" />
        <div className="p-8 text-sm text-slate-400">Loading…</div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Add user" subtitle="Create an account and assign a role" />
      <div className="p-8">
        <UserForm mode="create" canEditRole={true} />
      </div>
    </div>
  );
}