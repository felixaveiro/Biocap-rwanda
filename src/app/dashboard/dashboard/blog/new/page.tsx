'use client';

import Header from "@/components/Header";
import BlogForm from "@/components/BlogForm";
import { useSession } from "@/hooks/useSession";

export default function NewBlogPage() {
  const { user, loading, allowed } = useSession("blog:create");

  if (loading || !allowed || !user) {
    return (
      <div>
        <Header title="Loading…" subtitle="Checking access" />
        <div className="p-8 text-sm text-slate-400">Loading…</div>
      </div>
    );
  }

  return (
    <div>
      <Header title="New post" subtitle="Draft a new blog post" />
      <div className="p-8">
        <BlogForm mode="create" role={user.role} />
      </div>
    </div>
  );
}