'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useSession } from "@/hooks/useSession";
import { blogsApi } from "@/lib/api/blogs";
import { apiFormRequest } from "@/lib/api/client";
import { Role, BlogPost } from "@/types";
import { ArrowLeft, Save, Send, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function CreateNewStoryPage() {
  const router = useRouter();
  const { user, loading, allowed } = useSession("blog:create");

  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("General");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  const [organizationLink, setOrganizationLink] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (loading || !allowed || !user) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="Create Story" subtitle="Loading editor permissions..." />
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="h-96 animate-pulse rounded-2xl bg-slate-200/80" />
        </div>
      </div>
    );
  }

  const isSocialCreator = user.role === "social_media_content_creator";
  const isBroadcastCreator = user.role === "broadcast_content_creator";

  const handleSubmit = async (shouldSubmitForReview: boolean = false) => {
    if (!title.trim() || !tag.trim() || !excerpt.trim() || !coverImage) {
      setErrorMsg("Please provide a title, tag, excerpt, and cover image.");
      return;
    }

    // Fall back to profile attributes or sensible defaults if not manually entered
    const finalSocialHandle = socialHandle.trim() || user.socialHandle || "@creator";
    const finalOrgLink = organizationLink.trim() || user.organizationLink || "https://example.com";

    if (isSocialCreator && !finalSocialHandle) {
      setErrorMsg("A social media handle is required for your account type.");
      return;
    }

    if (isBroadcastCreator && !finalOrgLink) {
      setErrorMsg("An organization link is required for your account type.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("tag", tag.trim());
      formData.append("excerpt", excerpt.trim());
      formData.append("img", coverImage);

      if (finalSocialHandle) formData.append("socialHandle", finalSocialHandle);
      if (finalOrgLink) formData.append("organizationLink", finalOrgLink);

      // Matches Mongoose BlockSchema: type must be 'p', 'h2', 'quote', 'emphasis', or 'image'
      // Field name must be 'text'
      const blocks = [
        {
          type: "p",
          text: content.trim(),
        },
      ];
      formData.append("blocks", JSON.stringify(blocks));

      // 1. Create the blog draft
      const newBlog = await apiFormRequest<BlogPost>("/api/contributor/blogs", {
        method: "POST",
        formData,
        auth: true,
      });

      // 2. Submit for review if requested
      if (shouldSubmitForReview && newBlog?._id) {
        await blogsApi.submitBlog(newBlog._id, user.role as Role);
      }

      router.push("/creator/my-stories");
    } catch (err: unknown) {
      console.error("Failed to create story:", err);
      const msg = err instanceof Error ? err.message : "Failed to create story.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Header
        title="Create New Story"
        subtitle="Draft a new article and submit it for editorial review"
      />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/creator/my-stories"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to My Stories
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50"
            >
              <Save size={16} />
              Save Draft
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send size={16} />
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <AlertCircle size={18} className="text-rose-600" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Cover Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Story Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter headline..."
              className="w-full rounded-xl border border-slate-200/80 px-4 py-2 text-base font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          {isSocialCreator && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Social Media Handle *
              </label>
              <input
                type="text"
                value={socialHandle}
                onChange={(e) => setSocialHandle(e.target.value)}
                placeholder="@yourusername"
                className="w-full rounded-xl border border-slate-200/80 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
          )}

          {isBroadcastCreator && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Organization Link *
              </label>
              <input
                type="url"
                value={organizationLink}
                onChange={(e) => setOrganizationLink(e.target.value)}
                placeholder="https://yourorganization.org"
                className="w-full rounded-xl border border-slate-200/80 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Category / Tag *
            </label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="e.g. Technology, Science, Culture"
              className="w-full rounded-xl border border-slate-200/80 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Excerpt / Brief Summary *
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short description for preview cards..."
              className="w-full rounded-xl border border-slate-200/80 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Story Body
            </label>
            <textarea
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your story content here..."
              className="w-full rounded-xl border border-slate-200/80 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
        </div>
      </main>
    </div>
  );
}