import Link from "next/link";

// Replace with real data fetching (e.g. fetch from DB by id)
async function getPost(id: string) {
  const MOCK: Record<string, { title: string; date: string; body: string }> = {
    "1": { title: "First post",  date: "2025-01-01", body: "Content of the first post." },
    "2": { title: "Second post", date: "2025-02-15", body: "Content of the second post." },
  };
  return MOCK[id] ?? null;
}

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);

  if (!post) {
    return (
      <div>
        <p className="text-red-500">Post not found.</p>
        <Link href="/dashboard/dashboard/blog" className="text-indigo-600 hover:underline text-sm">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/dashboard/blog" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        ← Back to Blog
      </Link>

      <h1 className="text-3xl font-bold text-gray-800 mb-1">{post.title}</h1>
      <p className="text-xs text-gray-400 mb-6">{post.date}</p>

      <div className="prose prose-sm text-gray-700 bg-white rounded-2xl p-6 shadow-sm">
        <p>{post.body}</p>
      </div>
    </div>
  );
}