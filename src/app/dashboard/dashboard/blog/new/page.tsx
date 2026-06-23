"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPostPage() {
  const router  = useRouter();
  const [title, setTitle]   = useState("");
  const [body,  setBody]    = useState("");
  const [saved, setSaved]   = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // ── Replace with your real save logic ──
    console.log("Saving post:", { title, body });
    setSaved(true);
    setTimeout(() => router.push("/dashboard/dashboard/blog"), 1000);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">New Post</h1>

      {saved && (
        <p className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-600">
          Saved! Redirecting…
        </p>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My awesome post"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your post here…"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            Save Post
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 px-6 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}