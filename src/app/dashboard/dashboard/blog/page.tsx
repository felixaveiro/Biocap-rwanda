import Link from "next/link";

// Replace with real data fetching later
const MOCK_POSTS = [
  { id: "1", title: "First post",  date: "2025-01-01" },
  { id: "2", title: "Second post", date: "2025-02-15" },
];

export default function BlogPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Blog Posts</h1>
        <Link
          href="/dashboard/dashboard/blog/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          + New Post
        </Link>
      </div>

      <div className="space-y-3">
        {MOCK_POSTS.map((post) => (
          <div key={post.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
            <div>
              <p className="font-medium text-gray-800">{post.title}</p>
              <p className="text-xs text-gray-400">{post.date}</p>
            </div>
            <Link
              href={`/dashboard/dashboard/blog/${post.id}`}
              className="text-sm text-indigo-600 hover:underline"
            >
              View →
            </Link>
          </div>
        ))}
        {MOCK_POSTS.length === 0 && (
          <p className="text-gray-400 text-sm">No posts yet. Create your first one!</p>
        )}
      </div>
    </div>
  );
}