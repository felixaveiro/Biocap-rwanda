'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import BlogTable from "@/components/BlogTable";
import { blogsApi } from "@/lib/api/blogs";
import { can } from "@/lib/permissions";
import { useSession } from "@/hooks/useSession";
import { BlogPost, Role } from "@/types";

export default function BlogListPage() {
  const { user, loading, allowed } = useSession();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const userRole = user.role as Role;
        const canViewAll = can(userRole, "blog:view:all");

        // Fetch scoped or all blogs depending on permissions
        const response = await blogsApi.getBlogs(userRole, {
          author: canViewAll ? undefined : user._id,
        });

        const blogList: BlogPost[] = Array.isArray(response)
          ? response
          : (response as { docs?: BlogPost[] })?.docs || [];

        setBlogs(blogList);
      } catch (err) {
        console.error("Failed to fetch blog list:", err);
      } finally {
        setDataLoading(false);
      }
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

  const userRole = user.role as Role;
  const canViewAll = can(userRole, "blog:view:all");

  return (
    <div>
      <Header
        title={canViewAll ? "Editorial workspace" : "My stories"}
        subtitle="Track drafts, submissions, approvals, and published content with creator attribution"
      />
      <div className="p-8">
        <div className="mb-4 flex justify-end">
          <Link
            href="/dashboard/blog/new"
            className="rounded-full bg-[#133248] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0e273a]"
          >
            + New post
          </Link>
        </div>
        <BlogTable blogs={blogs} user={user} />
      </div>
    </div>
  );
}