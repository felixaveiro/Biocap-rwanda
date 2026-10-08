'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import ImageCropperModal from "@/components/ImageCropperModal";
import AuthorReviewModal from "@/components/AuthorReviewModal";
import StoryEditor from "@/components/StoryEditor";
import { base64ToFile } from "@/lib/utils/file";
import { useSession } from "@/hooks/useSession";
import { blogsApi } from "@/lib/api/blogs";
import { Role, BlogPost } from "@/types";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Crop,
  Image as ImageIcon,
  Loader2,
  Globe,
  AtSign,
  Eye,
  Cpu,
  Tractor,
  Leaf,
  HeartHandshake,
  Dna,
  FileText,
  ShoppingBag,
  Upload,
  Trash2,
} from "lucide-react";

const CATEGORIES = [
  { label: "TECHNOLOGY ADOPTION", value: "Technology Adoption", icon: Cpu },
  { label: "MODERN AGRICULTURE", value: "Modern Agriculture", icon: Tractor },
  { label: "FARMERS & ENVIRONMENT", value: "Farmers & Environment", icon: Leaf },
  { label: "SCIENCE FOR HUMANITY", value: "Science for Humanity", icon: HeartHandshake },
  { label: "BIOTECH INNOVATION", value: "Biotech Innovation", icon: Dna },
  { label: "AGRICULTURAL POLICY", value: "Agricultural Policy", icon: FileText },
  { label: "TRADE & FOOD", value: "Trade & Food", icon: ShoppingBag },
];

export default function CreateNewStoryPage() {
  const router = useRouter();
  const { user, loading, allowed } = useSession("blog:create");

  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content] = useState("");
  const [blocks, setBlocks] = useState<any[]>([]);
  const [inlineImages, setInlineImages] = useState<File[]>([]);
  
  const [socialHandle, setSocialHandle] = useState("");
  const [organizationLink, setOrganizationLink] = useState("");
  const [isProfileSynced, setIsProfileSynced] = useState(false);

  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<{
    cover?: boolean;
    title?: boolean;
    tag?: boolean;
    excerpt?: boolean;
    content?: boolean;
  }>({});

  const coverRef = useRef<HTMLDivElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && !isProfileSynced) {
      if (user.socialHandle) setSocialHandle(user.socialHandle);
      if (user.organizationLink) setOrganizationLink(user.organizationLink);
      setIsProfileSynced(true);
    }
  }, [user, isProfileSynced]);

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

  const scrollToElement = (ref: React.RefObject<HTMLElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
      if (ref.current instanceof HTMLInputElement || ref.current instanceof HTMLTextAreaElement) {
        ref.current.focus();
      }
    }
  };

  if (loading || !allowed || !user) {
    return (
      <div className="min-h-screen bg-[#F3F2ED] pb-16 font-sans">
        <Header title="Create Story" subtitle="Loading editor permissions..." />
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="h-96 animate-pulse border border-[#E2DDCF] bg-[#E7E3D6] rounded-[2px]" />
        </div>
      </div>
    );
  }

  const isSocialCreator = user.role === "social_media_content_creator";
  const isMediaCorrespondent = user.role === "media_correspondent";

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) {
      setCoverImageFile(file);
      setErrors((prev) => ({ ...prev, cover: false }));
      
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setRawImageSrc(result);
        setCroppedPreview(result);
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
    let finalCoverImg: File | string | null = null;
    if (coverImageFile instanceof File && coverImageFile.size > 0) {
      finalCoverImg = coverImageFile;
    } else if (typeof croppedPreview === "string" && croppedPreview.length > 0) {
      finalCoverImg = croppedPreview;
    } else if (typeof rawImageSrc === "string" && rawImageSrc.length > 0) {
      finalCoverImg = rawImageSrc;
    }

    const newErrors: typeof errors = {};

    if (!finalCoverImg) newErrors.cover = true;
    if (!title.trim()) newErrors.title = true;
    if (!tag.trim()) newErrors.tag = true;
    if (!excerpt.trim()) newErrors.excerpt = true;
    if ((!blocks || blocks.length === 0) && !content.trim()) newErrors.content = true;

    setErrors(newErrors);

    if (newErrors.cover) return scrollToElement(coverRef);
    if (newErrors.title) return scrollToElement(titleRef);
    if (newErrors.tag) return scrollToElement(categoryRef);
    if (newErrors.excerpt || newErrors.content) return scrollToElement(editorRef);

    setIsReviewModalOpen(true);
  };

  const handleSubmit = async (shouldSubmitForReview: boolean = false) => {
    let finalCoverImg: File | string | null = null;

    if (coverImageFile instanceof File && coverImageFile.size > 0) {
      finalCoverImg = coverImageFile;
    } else if (typeof croppedPreview === "string" && croppedPreview.length > 0) {
      finalCoverImg = croppedPreview;
    } else if (typeof rawImageSrc === "string" && rawImageSrc.length > 0) {
      finalCoverImg = rawImageSrc;
    }

    const newErrors: typeof errors = {};

    if (!finalCoverImg) newErrors.cover = true;
    if (!title.trim()) newErrors.title = true;
    if (!tag.trim()) newErrors.tag = true;
    if (!excerpt.trim()) newErrors.excerpt = true;
    if ((!blocks || blocks.length === 0) && !content.trim()) newErrors.content = true;

    setErrors(newErrors);

    if (newErrors.cover) {
      scrollToElement(coverRef);
      throw new Error("Cover image required.");
    }
    if (newErrors.title) {
      scrollToElement(titleRef);
      throw new Error("Title required.");
    }
    if (newErrors.tag) {
      scrollToElement(categoryRef);
      throw new Error("Category required.");
    }
    if (newErrors.excerpt || newErrors.content) {
      scrollToElement(editorRef);
      throw new Error("Excerpt and manuscript content required.");
    }

    const finalSocialHandle = socialHandle.trim() || user.socialHandle || "";
    const finalOrgLink = organizationLink.trim() || user.organizationLink || "";

    if (isSocialCreator && !finalSocialHandle) throw new Error("Social handle required.");
    if (isMediaCorrespondent && !finalOrgLink) throw new Error("Organization link required.");

    setIsSubmitting(true);

    try {
      const creatorRole = (user.role as Role) || "contributor";
      const rawBlocks = (blocks && blocks.length > 0) ? blocks : (content.trim() ? [{ type: "p", text: content.trim() }] : []);

      const newBlog = await blogsApi.createBlog(
        {
          title: title.trim(),
          tag: tag.trim(),
          excerpt: excerpt.trim(),
          blocks: rawBlocks,
          socialHandle: finalSocialHandle,
          organizationLink: finalOrgLink,
          img: finalCoverImg!,
          images: inlineImages,
        },
        creatorRole
      );

      if (shouldSubmitForReview && newBlog?._id) {
        await blogsApi.submitBlog(newBlog._id, creatorRole);
      }

      router.refresh();
      router.push("/creator/my-stories");
    } catch (err: unknown) {
      console.error("Failed to create story:", err);
      setIsReviewModalOpen(false);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewStoryObject = {
    _id: "temp-preview-id",
    title: title || "Untitled Story",
    tag: tag || "General",
    excerpt: excerpt || "",
    status: "draft",
    img: croppedPreview || rawImageSrc || "",
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
    <div className="min-h-screen bg-[#F3F2ED] pb-16 font-sans text-[#1E2620]">
      <Header
        title="Create New Story"
        subtitle="Craft an insightful article and publish or submit for review"
      />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/creator/my-stories"
            className="inline-flex items-center gap-2 border border-[#D9D4C6] bg-white px-3.5 py-2 text-xs font-semibold text-[#5A6259] transition-colors hover:border-[#1E2620] hover:text-[#1E2620] rounded-[2px]"
          >
            <ArrowLeft size={16} />
            Back to Stories
          </Link>
        </div>

        <div className="space-y-8 border border-[#E2DDCF] bg-white p-6 sm:p-8 rounded-[2px]">
          <div className="flex items-center justify-between border-b border-[#EDEAE0] pb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6B7268]">
              Story Build-up
            </p>
            <h2 className="font-display text-xl italic text-[#1E2620]">
              Begin a new story
            </h2>
          </div>

          <div ref={coverRef}>
            <div className="flex items-center justify-between mb-2.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3B4237]">
                Cover Image <span className="text-[#B65C4B]">*</span>
              </label>
              <div className="flex items-center gap-2">
                {errors.cover && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#B65C4B]">
                    <AlertCircle size={10} /> Cover image is required
                  </span>
                )}
                <span className="font-mono text-[11px] font-medium text-[#8B9188]">16:9 landscape</span>
              </div>
            </div>

            <input
              ref={coverFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />

            {croppedPreview ? (
              <div className="group relative max-h-80 overflow-hidden border border-[#D9D4C6] bg-[#1E2620] rounded-[2px]">
                <img src={croppedPreview} alt="Cover Preview" className="h-full w-full object-cover" />
                <div className="absolute right-3 top-3 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCropperOpen(true)}
                    className="inline-flex items-center gap-1.5 border border-white/20 bg-[#1E2620]/85 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-md transition hover:bg-[#1E2620] rounded-[2px]"
                  >
                    <Crop size={14} className="text-[#8FBF9F]" /> Adjust &amp; crop
                  </button>
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 border border-white/20 bg-[#1E2620]/85 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-md transition hover:bg-[#1E2620] rounded-[2px]"
                  >
                    <Upload size={14} /> Change image
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRawImageSrc(null);
                      setCroppedPreview(null);
                      setCoverImageFile(null);
                      setIsCropperOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 border border-[#B65C4B] bg-[#8A3A2C]/90 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#8A3A2C] rounded-[2px]"
                  >
                    <Trash2 size={14} /> Remove image
                  </button>
                </div>
              </div>
            ) : (
              <div className={`group relative flex h-52 flex-col items-center justify-center border-2 border-dashed transition duration-200 rounded-[2px] ${
                errors.cover
                  ? "border-[#B65C4B] bg-[#FBEEEC]/40"
                  : "border-[#D9D4C6] bg-[#FAF9F5] hover:border-[#3B664B] hover:bg-[#F1F5F1]"
              }`}>
                <div className="border border-[#D9D4C6] bg-white p-3.5 transition duration-200 group-hover:border-[#3B664B] rounded-[2px]">
                  <ImageIcon size={24} strokeWidth={1.5} className="text-[#8B9188] transition group-hover:text-[#3B664B]" />
                </div>
                <div className="mt-3 text-center">
                  <span className="text-xs font-semibold text-[#3A4239] transition group-hover:text-[#3B664B]">Upload cover image</span>
                  <p className="mt-0.5 text-[11px] text-[#8B9188]">Drag and drop or click to browse (JPG, PNG, WEBP)</p>
                </div>
                <span className="sr-only">Select a cover image</span>
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  className="absolute inset-0 cursor-pointer"
                  aria-label="Upload cover image"
                />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3B4237]">
                Story Title <span className="text-[#B65C4B]">*</span>
              </label>
              {errors.title && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-[#B65C4B]">
                  <AlertCircle size={10} /> Title is required
                </span>
              )}
            </div>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim()) setErrors((prev) => ({ ...prev, title: false }));
              }}
              placeholder="Enter a captivating headline..."
              className={`font-display w-full border px-4 py-3 text-lg italic text-[#1E2620] placeholder:text-[#B4B0A2] focus:outline-none focus:ring-2 transition-all rounded-[2px] ${
                errors.title
                  ? "border-[#B65C4B] bg-[#FBEEEC]/40 focus:border-[#B65C4B] focus:ring-[#B65C4B]/20"
                  : "border-[#D9D4C6] bg-white focus:border-[#3B664B] focus:ring-[#3B664B]/15"
              }`}
            />
          </div>

          <div ref={categoryRef} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3B4237]">
                Category / Tag <span className="text-[#B65C4B]">*</span>
              </label>
              {errors.tag && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-[#B65C4B]">
                  <AlertCircle size={10} /> Selection required
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1.5 pb-4">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = tag === cat.value;

                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      setTag(cat.value);
                      setErrors((prev) => ({ ...prev, tag: false }));
                    }}
                    className={`inline-flex items-center gap-2 border px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-[2px] ${
                      isSelected
                        ? "border-[#3B664B] bg-[#3B664B] text-white shadow-xs"
                        : errors.tag
                        ? "border-[#B65C4B] bg-[#FBEEEC]/40 text-[#B65C4B] hover:border-[#B65C4B]"
                        : "border-[#9EAF91]/70 bg-white text-[#3B664B] hover:border-[#3B664B] hover:bg-[#FAF9F5]"
                    }`}
                  >
                    <Icon
                      size={14}
                      className={isSelected ? "text-white" : errors.tag ? "text-[#B65C4B]" : "text-[#3B664B]"}
                      strokeWidth={2}
                    />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="border-b border-[#EDEAE0] pt-1" />
          </div>

          <div ref={editorRef} className="border-t border-[#EDEAE0] pt-6">
            <StoryEditor
              excerpt={excerpt}
              setExcerpt={(v) => {
                setExcerpt(v);
                if (v.trim()) setErrors((prev) => ({ ...prev, excerpt: false }));
              }}
              excerptError={errors.excerpt}
              controlsPosition="bottom"
              onChange={handleStoryEditorChange}
            />
          </div>

          <div className="border-t border-[#EDEAE0] pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6B7268]">
                Author Credentials &amp; Links
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[240px]">
                <label className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase text-[#5A6259]">
                  <span>Social Handle {isSocialCreator && <span className="text-[#B65C4B]">*</span>}</span>
                  {detectedSocialPlatform && (
                    <span className="font-mono text-[#3B664B] font-semibold tracking-wider">
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
                    className="w-full border border-[#D9D4C6] bg-white py-1.5 pl-8 pr-3 text-xs font-medium text-[#1E2620] focus:border-[#3B664B] focus:outline-none rounded-[2px]"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-[240px]">
                <label className="mb-1 block text-[10px] font-bold uppercase text-[#5A6259]">
                  Organization Link {isMediaCorrespondent && <span className="text-[#B65C4B]">*</span>}
                </label>
                <div className="relative">
                  <Globe size={14} className="absolute left-3 top-2.5 text-[#8B9188]" />
                  <input
                    type="url"
                    value={organizationLink}
                    onChange={(e) => setOrganizationLink(e.target.value)}
                    placeholder="https://organization.org"
                    className="w-full border border-[#D9D4C6] bg-white py-1.5 pl-8 pr-3 text-xs font-medium text-[#1E2620] focus:border-[#3B664B] focus:outline-none rounded-[2px]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#EDEAE0] pt-6">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="inline-flex items-center gap-2 border border-[#D9D4C6] bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#3A4239] transition-colors hover:border-[#1E2620] disabled:opacity-50 cursor-pointer rounded-[2px]"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleOpenReviewModal}
              className="inline-flex items-center gap-2 border border-[#1E2620] bg-[#1E2620] px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#F3F2ED] transition-colors hover:bg-[#3B664B] hover:border-[#3B664B] cursor-pointer rounded-[2px]"
            >
              <Eye size={14} /> Review Story
            </button>
          </div>
        </div>
      </main>

      {rawImageSrc && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          imageSrc={rawImageSrc}
          aspectRatio={16 / 9}
          onClose={() => setIsCropperOpen(false)}
          onSave={handleCropSave}
        />
      )}

      {isReviewModalOpen && (
        <AuthorReviewModal
          story={previewStoryObject}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmitForReview={() => handleSubmit(true)}
        />
      )}
    </div>
  );
}