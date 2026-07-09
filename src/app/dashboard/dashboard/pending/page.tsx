'use client';

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BlogTable from "@/components/BlogTable";
import { listBlogs } from "@/lib/data";
import { useSession } from "@/hooks/useSession";
import { BlogPost } from "@/types";

export default function PendingApprovalsPage() {
  const { user, loading, allowed } = useSession("blog:approve");
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user || !allowed) return;
    listBlogs({ status: "PENDING" }).then((b) => {
      setBlogs(b);
      setDataLoading(false);
    });
  }, [user, allowed]);

  if (loading || !allowed || !user || dataLoading) {
    return (
      <div>
        <Header title="Loading…" subtitle="Fetching pending approvals" />
        <div className="p-8 text-sm text-slate-400">Loading…</div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Pending approvals"
        subtitle="Posts submitted by contributors, waiting for your review"
      />
      <div className="p-8">
        <BlogTable blogs={blogs} user={user} />
      </div>
    </div>
  );
}