"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBlogs, type Blog } from "@/lib/api/blogs";
import { ApiError } from "@/lib/api/client";

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadBlogs() {
      try {
        const data = await getBlogs();
        if (isMounted) setBlogs(data);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof ApiError ? err.message : "Failed to load blog posts.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadBlogs();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blog Posts</h1>
          <p className="text-sm text-gray-500">{blogs.length} total</p>
        </div>
        <Link
          href="/dashboard/dashboard/blog/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          + New Post
        </Link>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading posts...</p>}

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      {!isLoading && !error && blogs.length === 0 && (
        <p className="text-sm text-gray-500">No posts yet. Create your first one.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {blogs.map((blog) => (
          <div key={blog._id} className="rounded-2xl bg-white shadow-sm overflow-hidden">
            {blog.img && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={blog.img} alt={blog.title} className="h-36 w-full object-cover" />
            )}
            <div className="p-4">
              <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600 mb-2">
                {blog.tag}
              </span>
              <h2 className="font-semibold text-gray-800 line-clamp-2">{blog.title}</h2>
              <p className="mt-1 text-xs text-gray-400">
                {new Date(blog.createdAt).toLocaleDateString()} · {blog.author.username}
              </p>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/dashboard/dashboard/blog/${blog._id}`}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition"
                >
                  View
                </Link>
                {/*
                  Edit/Delete are intentionally left out of the action row for now —
                  the backend doesn't have PUT/DELETE /api/blogs/:id confirmed yet.
                  Once that's in, add buttons here calling updateBlog()/deleteBlog()
                  from lib/api/blogs.ts (already stubbed there).
                */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}