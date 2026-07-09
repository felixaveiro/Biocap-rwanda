'use client';

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import { listBlogs, listUsers } from "@/lib/data";
import { can, visibleNav } from "@/lib/permissions";
import { useSession } from "@/hooks/useSession";
import { ROLE_LABELS, BlogPost } from "@/types";

export default function OverviewPage() {
  const { user, loading, allowed } = useSession();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const nav = visibleNav(user.role);
      const scoped = can(user.role, "blog:view:all")
        ? await listBlogs()
        : await listBlogs({ authorId: user.id });
      setBlogs(scoped);
      setUserCount(nav.users ? (await listUsers()).length : null);
      setDataLoading(false);
    })();
  }, [user]);

  if (loading || !allowed || !user || dataLoading) {
    return (
      <div>
        <Header title="Loading…" subtitle="Fetching your dashboard" />
        <div className="p-8 text-sm text-slate-400">Loading…</div>
      </div>
    );
  }

  const published = blogs.filter((b) => b.status === "APPROVED").length;
  const pending = blogs.filter((b) => b.status === "PENDING").length;
  const rejected = blogs.filter((b) => b.status === "REJECTED").length;
  const drafts = blogs.filter((b) => b.status === "DRAFT").length;

  return (
    <div>
      <Header
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        subtitle={`Signed in as ${ROLE_LABELS[user.role]}`}
      />
      <div className="p-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Published" value={published} />
          <StatCard label="Pending review" value={pending} />
          <StatCard label="Rejected" value={rejected} />
          <StatCard label="Drafts" value={drafts} />
          {userCount !== null && <StatCard label="Team members" value={userCount} />}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">What you can do</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600">
            {user.role === "ADMIN" && (
              <>
                <li>Create, edit, publish and delete any blog post</li>
                <li>Approve or reject posts submitted for review</li>
                <li>Create users, assign roles, and manage permissions</li>
              </>
            )}
            {user.role === "COMMUNICATION_OFFICER" && (
              <>
                <li>Create, edit and publish/deploy blog posts</li>
                <li>Approve or reject posts submitted for review</li>
                <li>View and edit user information (roles are managed by Admins)</li>
                <li>Published posts can only be removed by an Admin</li>
              </>
            )}
            {user.role === "SOCIAL_MEDIA_INFLUENCER" && (
              <>
                <li>Create new blog posts - they start as drafts pending review</li>
                <li>Track approval status for everything you submit</li>
                <li>If a post is rejected you&apos;ll see why, and can fix and resubmit it</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}