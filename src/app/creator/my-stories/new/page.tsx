'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import ImageCropperModal from "@/components/ImageCropperModal";
import { base64ToFile } from "@/lib/utils/file";
import { useSession } from "@/hooks/useSession";
import { blogsApi } from "@/lib/api/blogs";
import { Role } from "@/types";
import { ArrowLeft, Save, Send, AlertCircle, Crop, Image as ImageIcon, Loader2 } from "lucide-react";

export default function CreateNewStoryPage() {
  const router = useRouter();
  const { user, loading, allowed } = useSession("blog:create");

  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("General");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  const [organizationLink, setOrganizationLink] = useState("");

  // ─── Cropping & File Upload States ──────────────────────────────────────────
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

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

  // Triggered when user picks an image file
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setRawImageSrc(reader.result as string);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Triggered when crop is saved in ImageCropperModal
  const handleCropSave = (croppedBase64: string) => {
    setCroppedPreview(croppedBase64);
    const file = base64ToFile(croppedBase64, `cover-${Date.now()}.jpg`);
    setCoverImageFile(file);
    setIsCropperOpen(false);
  };

  const handleSubmit = async (shouldSubmitForReview: boolean = false) => {
    if (!title.trim() || !tag.trim() || !excerpt.trim() || !coverImageFile) {
      setErrorMsg("Please provide a title, tag, excerpt, and cover image.");
      return;
    }

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
      const creatorRole = user.role as Role;

      // 1. Create the blog draft using central blogsApi
      const newBlog = await blogsApi.createBlog(
        {
          title: title.trim(),
          tag: tag.trim(),
          excerpt: excerpt.trim(),
          blocks: [{ type: "p", text: content.trim() }],
          socialHandle: finalSocialHandle,
          organizationLink: finalOrgLink,
          img: coverImageFile,
        },
        creatorRole
      );

      // 2. Submit for review if requested
      if (shouldSubmitForReview && newBlog?._id) {
        await blogsApi.submitBlog(newBlog._id, creatorRole);
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

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/creator/my-stories"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft size={16} />
            Back to My Stories
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50 transition"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Draft
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          {/* Cover Image Upload Area with Cropper */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Cover Image *
            </label>

            {croppedPreview ? (
              <div className="relative group overflow-hidden rounded-2xl bg-slate-100 max-h-72">
                <img src={croppedPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setIsCropperOpen(true)}
                  className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-xl bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md hover:bg-slate-900 transition"
                >
                  <Crop size={14} className="text-[#E52B67]" /> Recrop Image
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition cursor-pointer">
                <ImageIcon size={32} className="text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-700">Upload Cover Image</span>
                <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG or WEBP (16:9 recommended)</span>
                <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
              </label>
            )}
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

      {/* Image Cropper Modal */}
      {rawImageSrc && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          imageSrc={rawImageSrc}
          aspectRatio={16 / 9}
          onClose={() => setIsCropperOpen(false)}
          onSave={handleCropSave}
        />
      )}
    </div>
  );
}