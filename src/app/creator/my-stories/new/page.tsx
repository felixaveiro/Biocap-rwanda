'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import Header from "@/components/Header";
import ImageCropperModal from "@/components/ImageCropperModal";
import ReviewStoryModal from "@/components/ReviewStoryModal";
import StoryEditor from "@/components/StoryEditor";
import { base64ToFile } from "@/lib/utils/file";
import { useSession } from "@/hooks/useSession";
import { blogsApi } from "@/lib/api/blogs";
import { Role, BlogPost } from "@/types";
import {
  ArrowLeft,
  Save,
  Send,
  AlertCircle,
  Crop,
  Image as ImageIcon,
  Loader2,
  Globe,
  AtSign,
  Tag,
  Eye,
} from "lucide-react";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-mono",
});

export default function CreateNewStoryPage() {
  const router = useRouter();
  const { user, loading, allowed } = useSession("blog:create");

  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("General");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [blocks, setBlocks] = useState<any[]>([]);
  const [inlineImages, setInlineImages] = useState<File[]>([]);
  
  // Profile handles & org links
  const [socialHandle, setSocialHandle] = useState("");
  const [organizationLink, setOrganizationLink] = useState("");
  const [isProfileSynced, setIsProfileSynced] = useState(false);

  // Cropping & File Upload States
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  // Review Modal Toggle State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state with profile automatically
  useEffect(() => {
    if (user && !isProfileSynced) {
      if (user.socialHandle) setSocialHandle(user.socialHandle);
      if (user.organizationLink) setOrganizationLink(user.organizationLink);
      setIsProfileSynced(true);
    }
  }, [user, isProfileSynced]);

  // Social Platform Detector
  const detectedSocialPlatform = useMemo(() => {
    const val = socialHandle.toLowerCase().trim();
    if (!val) return null;
    if (val.includes("twitter.com") || val.includes("x.com")) return { name: "X (Twitter)", icon: AtSign };
    if (val.includes("linkedin.com")) return { name: "LinkedIn", icon: AtSign };
    if (val.includes("facebook.com")) return { name: "Facebook", icon: AtSign };
    if (val.includes("instagram.com")) return { name: "Instagram", icon: AtSign };
    if (val.includes("youtube.com") || val.includes("youtu.be")) return { name: "YouTube", icon: AtSign };
    return { name: "Handle", icon: AtSign };
  }, [socialHandle]);

  const handleStoryEditorChange = useCallback((b: any[], files: File[]) => {
    setBlocks(b || []);
    setInlineImages(files || []);
  }, []);

  const fontVars = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
  const bodyFont: React.CSSProperties = { fontFamily: "var(--font-body)" };
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  if (loading || !allowed || !user) {
    return (
      <div className={`${fontVars} min-h-screen bg-[#F3F2ED] pb-16`} style={bodyFont}>
        <Header title="Create Story" subtitle="Loading editor permissions..." />
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="h-96 animate-pulse border border-[#E2DDCF] bg-[#E7E3D6]" />
        </div>
      </div>
    );
  }

  const isSocialCreator = user.role === "social_media_content_creator";
  const isMediaCorrespondent = user.role === "media_correspondent";

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

  const handleCropSave = (croppedBase64: string) => {
    setCroppedPreview(croppedBase64);
    const file = base64ToFile(croppedBase64, `cover-${Date.now()}.jpg`);
    setCoverImageFile(file);
    setIsCropperOpen(false);
  };

  const handleOpenReviewModal = () => {
    if (!title.trim()) {
      setErrorMsg("Please add a title before opening review mode.");
      return;
    }
    setErrorMsg(null);
    setIsReviewModalOpen(true);
  };

  const handleSubmit = async (shouldSubmitForReview: boolean = false) => {
    if (!title.trim() || !tag.trim() || !coverImageFile) {
      setErrorMsg("Please provide a title, tag, and cover image.");
      return;
    }

    if (!excerpt.trim() && (!blocks || blocks.length === 0)) {
      setErrorMsg("Please provide either an excerpt or at least one story section.");
      return;
    }

    const finalSocialHandle = socialHandle.trim() || user.socialHandle || "";
    const finalOrgLink = organizationLink.trim() || user.organizationLink || "";

    if (isSocialCreator && !finalSocialHandle) {
      setErrorMsg("A social media handle is required for your account type.");
      return;
    }

    if (isMediaCorrespondent && !finalOrgLink) {
      setErrorMsg("An organization link is required for Media Correspondent accounts.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const creatorRole = (user.role as Role) || "contributor";
      const payloadBlocks = (blocks && blocks.length > 0) ? blocks : (content.trim() ? [{ type: "p", text: content.trim() }] : []);

      const newBlog = await blogsApi.createBlog(
        {
          title: title.trim(),
          tag: tag.trim(),
          excerpt: excerpt.trim(),
          blocks: payloadBlocks,
          socialHandle: finalSocialHandle,
          organizationLink: finalOrgLink,
          img: coverImageFile,
          images: inlineImages,
        },
        creatorRole
      );

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

  // Construct temporary BlogPost object for ReviewStoryModal preview
  const previewStoryObject = {
    _id: "temp-preview-id",
    title: title || "Untitled Story",
    tag: tag || "General",
    excerpt: excerpt || "",
    status: "draft",
    img: croppedPreview || "",
    blocks: blocks.length > 0 ? blocks : [{ type: "p", text: content }],
    socialHandle: socialHandle || user.socialHandle || "",
    organizationLink: organizationLink || user.organizationLink || "",
    author: {
      _id: user._id || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      username: user.username || "",
      role: (user.role as Role) || "contributor",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as BlogPost;

  const SocialIcon = detectedSocialPlatform ? detectedSocialPlatform.icon : AtSign;

  return (
    <div className={`${fontVars} min-h-screen bg-[#F3F2ED] pb-16 text-[#1E2620]`} style={bodyFont}>
      <Header
        title="Create New Story"
        subtitle="Craft an insightful article and publish or submit for review"
      />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">

        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/creator/my-stories"
            className="inline-flex items-center gap-2 border border-[#D9D4C6] bg-white px-3.5 py-2 text-xs font-semibold text-[#5A6259] transition-colors hover:border-[#1E2620] hover:text-[#1E2620]"
          >
            <ArrowLeft size={16} />
            Back to Stories
          </Link>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="flex items-center gap-3 border-l-2 border-[#B65C4B] bg-[#FBEEEC] px-4 py-3.5">
            <AlertCircle size={18} className="shrink-0 text-[#B65C4B]" />
            <p className="text-xs font-medium text-[#7A362A]">{errorMsg}</p>
          </div>
        )}

        {/* Form Container */}
        <div className="space-y-8 border border-[#E2DDCF] bg-white p-6 sm:p-8">

          <div className="flex items-center justify-between border-b border-[#EDEAE0] pb-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#6B7268]" style={monoFont}>
              Manuscript
            </p>
            <h2 className="text-xl italic text-[#1E2620]" style={displayFont}>
              Begin a new story
            </h2>
          </div>

          {/* Cover Image Upload */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A6259]">
                Cover Image <span className="text-[#B65C4B]">*</span>
              </label>
              <span className="text-[11px] font-medium text-[#8B9188]" style={monoFont}>16:9 landscape</span>
            </div>

            {croppedPreview ? (
              <div className="group relative max-h-80 overflow-hidden border border-[#D9D4C6] bg-[#1E2620]">
                <img src={croppedPreview} alt="Cover Preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setIsCropperOpen(true)}
                  className="absolute top-3 right-3 inline-flex items-center gap-1.5 border border-white/20 bg-[#1E2620]/85 px-3.5 py-2 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-md transition hover:bg-[#1E2620]"
                >
                  <Crop size={14} className="text-[#8FBF9F]" /> Adjust &amp; crop
                </button>
              </div>
            ) : (
              <label className="group relative flex h-52 cursor-pointer flex-col items-center justify-center border-2 border-dashed border-[#D9D4C6] bg-[#FAF9F5] transition duration-200 hover:border-[#3F6B4F] hover:bg-[#F1F5F1]">
                <div className="border border-[#D9D4C6] bg-white p-3.5 transition duration-200 group-hover:border-[#3F6B4F]">
                  <ImageIcon size={24} strokeWidth={1.5} className="text-[#8B9188] transition group-hover:text-[#3F6B4F]" />
                </div>
                <div className="mt-3 text-center">
                  <span className="text-xs font-semibold text-[#3A4239] transition group-hover:text-[#3F6B4F]">Upload cover image</span>
                  <p className="mt-0.5 text-[11px] text-[#8B9188]">Drag and drop or click to browse (JPG, PNG, WEBP)</p>
                </div>
                <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#5A6259]">
              Story Title <span className="text-[#B65C4B]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a captivating headline..."
              style={displayFont}
              className="w-full border border-[#D9D4C6] bg-white px-4 py-3 text-lg italic text-[#1E2620] placeholder:text-[#B4B0A2] focus:border-[#3F6B4F] focus:outline-none focus:ring-2 focus:ring-[#3F6B4F]/15"
            />
          </div>

          {/* Category Tag */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#5A6259]">
              Category / Tag <span className="text-[#B65C4B]">*</span>
            </label>
            <div className="relative">
              <Tag size={16} className="absolute left-3.5 top-3 text-[#8B9188]" />
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g. Technology, Innovation, BioCap"
                className="w-full border border-[#D9D4C6] bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none focus:ring-2 focus:ring-[#3F6B4F]/15"
              />
            </div>
          </div>

          {/* Story Editor */}
          <div className="border-t border-[#EDEAE0] pt-6">
            <StoryEditor
              excerpt={excerpt}
              setExcerpt={setExcerpt}
              controlsPosition="bottom"
              onChange={handleStoryEditorChange}
            />
          </div>

          {/* Author Credentials & Links */}
          <div className="border-t border-[#EDEAE0] pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#6B7268]" style={monoFont}>
                Author Credentials &amp; Links
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[240px]">
                <label className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase text-[#5A6259]">
                  <span>Social Handle {isSocialCreator && <span className="text-[#B65C4B]">*</span>}</span>
                  {detectedSocialPlatform && (
                    <span className="text-[#3F6B4F] font-semibold tracking-wider" style={monoFont}>
                      {detectedSocialPlatform.name}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <SocialIcon size={14} className="absolute left-3 top-2.5 text-[#8B9188]" />
                  <input
                    type="text"
                    value={socialHandle}
                    onChange={(e) => setSocialHandle(e.target.value)}
                    placeholder="@username or social profile link"
                    className="w-full border border-[#D9D4C6] bg-white py-1.5 pl-8 pr-3 text-xs font-medium text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-[240px]">
                <label className="mb-1 block text-[10px] font-semibold uppercase text-[#5A6259]">
                  Organization Link {isMediaCorrespondent && <span className="text-[#B65C4B]">*</span>}
                </label>
                <div className="relative">
                  <Globe size={14} className="absolute left-3 top-2.5 text-[#8B9188]" />
                  <input
                    type="url"
                    value={organizationLink}
                    onChange={(e) => setOrganizationLink(e.target.value)}
                    placeholder="https://organization.org"
                    className="w-full border border-[#D9D4C6] bg-white py-1.5 pl-8 pr-3 text-xs font-medium text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-[#EDEAE0] pt-6">
            <button
              type="button"
              onClick={handleOpenReviewModal}
              className="inline-flex items-center gap-2 border border-[#D9D4C6] bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#3A4239] transition-colors hover:border-[#1E2620] cursor-pointer"
            >
              <Eye size={14} /> Review Story
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="inline-flex items-center gap-2 border border-[#D9D4C6] bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#3A4239] transition-colors hover:border-[#1E2620] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Draft
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="inline-flex items-center gap-2 border border-[#1E2620] bg-[#1E2620] px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#F3F2ED] transition-colors hover:bg-[#3F6B4F] hover:border-[#3F6B4F] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </button>
          </div>

        </div>
      </main>

      {/* Cropper Modal */}
      {rawImageSrc && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          imageSrc={rawImageSrc}
          aspectRatio={16 / 9}
          onClose={() => setIsCropperOpen(false)}
          onSave={handleCropSave}
        />
      )}

      {/* Full Editorial Review Modal */}
      {isReviewModalOpen && (
        <ReviewStoryModal
          story={previewStoryObject}
          currentUserRole={(user.role as Role) || "contributor"}
          onClose={() => setIsReviewModalOpen(false)}
          onReviewCompleted={() => {
            setIsReviewModalOpen(false);
            handleSubmit(true);
          }}
        />
      )}
    </div>
  );
}