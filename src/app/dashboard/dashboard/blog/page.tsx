'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import BlogTable from "@/components/BlogTable";
import { listBlogs } from "@/lib/data";
import { can } from "@/lib/permissions";
import { useSession } from "@/hooks/useSession";
import { BlogPost } from "@/types";

export default function BlogListPage() {
  const { user, loading, allowed } = useSession();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const scoped = can(user.role, "blog:view:all")
        ? await listBlogs()
        : await listBlogs({ authorId: user.id });
      setBlogs(scoped);
      setDataLoading(false);
    })();
  }, [user]);

  if (loading || !allowed || !user || dataLoading) {
    return (
      <div>
        <Header title="Loading…" subtitle="Fetching your blogs" />
        <div className="p-8 text-sm text-slate-400">Loading…</div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title={can(user.role, "blog:view:all") ? "All blogs" : "My blogs"}
        subtitle="Create, review and manage blog content"
      />
      <div className="p-8">
        <div className="mb-4 flex justify-end">
          <Link
            href="/dashboard/blog/new"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            New post
          </Link>
        </div>
        <BlogTable blogs={blogs} user={user} />
      </div>
    </div>
  );
}