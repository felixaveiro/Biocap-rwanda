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
import { useDraftAutosave } from "@/hooks/useDraftAutosave";
import { blogsApi, uploadDirectToCloudinary } from "@/lib/api/blogs";
import { ApiError } from "@/lib/api/client";
import { readLegacyStoryDraft, clearLegacyStoryDraft } from "@/lib/legacyStoryDraft";
import { Role, BlogBlock, BlogPost } from "@/types";
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

interface DraftBlock extends BlogBlock {
  rawFile?: File;
}

interface DraftSection {
  id: string;
  kind: "paragraph" | "heading" | "quote" | "image";
  text: string;
  attribution?: string;
  caption?: string;
  fitMode?: "cover" | "contain";
  imagePreview?: string | null;
  imageFile?: File | null;
  imageFileKey?: string | null;
}

interface UploadedImage {
  url: string;
  publicId: string;
}

const DRAFT_PAGE_PATH = "/creator/my-stories/new";

const blockToSection = (block: DraftBlock): DraftSection => ({
  id: crypto.randomUUID(),
  kind:
    block.type === "h2"
      ? "heading"
      : block.type === "quote"
      ? "quote"
      : block.type === "image"
      ? "image"
      : "paragraph",
  text: block.text || "",
  attribution: block.type === "quote" ? block.caption || "" : "",
  caption: block.type === "image" ? block.caption || "" : "",
  fitMode: block.fitMode || "cover",
  imagePreview: block.type === "image" ? block.src || null : null,
  imageFile: null,
  imageFileKey: block.fileKey || null,
});

const isHostedUrl = (value: string | null | undefined): value is string =>
  typeof value === "string" && /^https?:\/\//.test(value);

/**
 * Moves a story draft kept in this browser by older versions of the editor to the server.
 * Returns the server draft's id, or null when there was nothing to move.
 */
const importLegacyDraft = async (userId: string, role: Role): Promise<string | null> => {
  const legacy = await readLegacyStoryDraft(userId);
  if (!legacy) return null;

  const hasContent = Boolean(
    legacy.title?.trim() || legacy.tag?.trim() || legacy.excerpt?.trim() || legacy.blocks?.length || legacy.coverImage
  );
  if (!hasContent) {
    await clearLegacyStoryDraft(userId);
    return null;
  }

  const payload = {
    title: legacy.title || "",
    tag: legacy.tag || "",
    excerpt: legacy.excerpt || "",
    blocks: legacy.blocks || [],
    socialHandle: legacy.socialHandle || "",
    organizationLink: legacy.organizationLink || "",
  };

  let draftId: string | null = legacy.serverDraftId || null;
  if (draftId) {
    try {
      await blogsApi.updateBlog(draftId, { ...payload, img: legacy.coverImage || null }, role);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        draftId = null; // The server copy was deleted: recreate it below.
      } else if (error instanceof ApiError && error.status === 403) {
        await clearLegacyStoryDraft(userId); // Already submitted: the browser copy is out of date.
        return null;
      } else {
        throw error;
      }
    }
  }
  if (!draftId) {
    const created = await blogsApi.createBlog({ ...payload, img: legacy.coverImage || undefined }, role);
    if (!created?._id) throw new Error("The server did not return the new draft's ID.");
    draftId = created._id;
  }

  await clearLegacyStoryDraft(userId);
  return draftId;
};

export default function CreateNewStoryPage() {
  const router = useRouter();
  const { user, loading, allowed } = useSession("blog:create");

  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content] = useState("");
  const [blocks, setBlocks] = useState<DraftBlock[]>([]);
  
  const [socialHandle, setSocialHandle] = useState("");
  const [organizationLink, setOrganizationLink] = useState("");
  const [isProfileSynced, setIsProfileSynced] = useState(false);

  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [restoredSections, setRestoredSections] = useState<DraftSection[] | undefined>();
  const [editorVersion, setEditorVersion] = useState(0);

  // The draft lives on the server as a Blog in 'draft' status. It is created by the first autosave.
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftEditable, setDraftEditable] = useState(true);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const draftIdRef = useRef<string | null>(null);
  const legacyImportRef = useRef<Promise<string | null> | null>(null);

  // Each image is uploaded once. Later saves reuse its URL, even though the editor still holds the File.
  const uploadsRef = useRef(new WeakMap<File, Promise<UploadedImage>>());
  const fileIdsRef = useRef(new WeakMap<File, number>());
  const nextFileIdRef = useRef(0);

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

  const rememberDraftId = useCallback((id: string) => {
    draftIdRef.current = id;
    setDraftId(id);
    // Keeps the draft open on reload. replaceState does not remount the page.
    window.history.replaceState(null, "", `${DRAFT_PAGE_PATH}?edit=${encodeURIComponent(id)}`);
  }, []);

  // Load the draft named in ?edit=, or one left in this browser by the old editor.
  useEffect(() => {
    if (!user?._id) return;
    const userId = user._id;
    const role = user.role as Role;
    let isCurrent = true;

    const load = async () => {
      try {
        let id = new URLSearchParams(window.location.search).get("edit");
        if (!id) {
          // Kept in a ref so React's development double-run of effects cannot import it twice.
          legacyImportRef.current ??= importLegacyDraft(userId, role);
          id = await legacyImportRef.current;
        }
        if (!id || !isCurrent) return;

        const story = await blogsApi.getBlogById(id, role);
        if (!isCurrent) return;

        draftIdRef.current = story._id;
        setDraftId(story._id);
        setTitle(story.title || "");
        setTag(story.tag || "");
        setExcerpt(story.excerpt || "");
        setSocialHandle(story.socialHandle || "");
        setOrganizationLink(story.organizationLink || "");
        const storyBlocks = (story.blocks || []) as DraftBlock[];
        setBlocks(storyBlocks);
        setRestoredSections(storyBlocks.map(blockToSection));
        setEditorVersion((version) => version + 1);
        setCoverImageFile(null);
        setCroppedPreview(story.img || null);
        setRawImageSrc(story.img || null);

        if (story.status !== "draft") {
          setDraftEditable(false);
          setDraftNotice("This story has left draft status, so it can no longer be edited here.");
        } else if (!new URLSearchParams(window.location.search).get("edit")) {
          rememberDraftId(story._id);
          setDraftNotice("Your unsaved browser draft was moved to My Stories");
        }
      } catch (error) {
        if (!isCurrent) return;
        console.error("Could not load story draft:", error);
        // Without the draft, autosave would create a duplicate, so it stays off.
        setDraftEditable(false);
        setDraftNotice(
          `Could not load this draft: ${error instanceof Error ? error.message : "unexpected error"}. Reload to try again.`
        );
      } finally {
        if (isCurrent) setDraftLoaded(true);
      }
    };
    void load();
    return () => {
      isCurrent = false;
    };
  }, [user?._id, user?.role, rememberDraftId]);

  const fileToken = useCallback((file: File) => {
    let id = fileIdsRef.current.get(file);
    if (id === undefined) {
      id = ++nextFileIdRef.current;
      fileIdsRef.current.set(file, id);
    }
    return `file:${id}`;
  }, []);

  const uploadOnce = useCallback((file: File) => {
    const cache = uploadsRef.current;
    let upload = cache.get(file);
    if (!upload) {
      upload = uploadDirectToCloudinary(file);
      cache.set(file, upload);
      upload.catch(() => cache.delete(file)); // A failed upload is retried on the next save.
    }
    return upload;
  }, []);

  // Identifies the content, so autosave knows when there is something new to save.
  const draftFingerprint = useMemo(
    () =>
      JSON.stringify({
        title,
        tag,
        excerpt,
        socialHandle,
        organizationLink,
        cover: coverImageFile ? fileToken(coverImageFile) : croppedPreview || null,
        blocks: blocks.map(({ rawFile, ...block }) => (rawFile ? { ...block, rawFile: fileToken(rawFile) } : block)),
      }),
    [title, tag, excerpt, socialHandle, organizationLink, coverImageFile, croppedPreview, blocks, fileToken]
  );

  const latestContentRef = useRef({ title, tag, excerpt, blocks, socialHandle, organizationLink, coverImageFile, croppedPreview });
  latestContentRef.current = { title, tag, excerpt, blocks, socialHandle, organizationLink, coverImageFile, croppedPreview };

  // Saves the current content to the server draft, creating the draft on the first save.
  const persistDraft = useCallback(async () => {
    const current = latestContentRef.current;
    const role = user?.role as Role;
    const hasContent = Boolean(
      current.title.trim() ||
      current.tag.trim() ||
      current.excerpt.trim() ||
      current.blocks.length ||
      current.coverImageFile ||
      current.croppedPreview
    );
    if (!draftIdRef.current && !hasContent) return;

    const [cover, savedBlocks] = await Promise.all([
      current.coverImageFile ? uploadOnce(current.coverImageFile) : Promise.resolve(null),
      Promise.all(
        current.blocks.map(async ({ rawFile, ...block }) => {
          if (!rawFile) return block as BlogBlock;
          const uploaded = await uploadOnce(rawFile);
          return { ...block, src: uploaded.url, source: uploaded.publicId } as BlogBlock;
        })
      ),
    ]);
    const coverUrl = cover ? cover.url : isHostedUrl(current.croppedPreview) ? current.croppedPreview : null;

    const payload = {
      title: current.title,
      tag: current.tag,
      excerpt: current.excerpt,
      blocks: savedBlocks,
      socialHandle: current.socialHandle,
      organizationLink: current.organizationLink,
      ...(cover && { imgPublicId: cover.publicId }),
    };

    if (draftIdRef.current) {
      await blogsApi.updateBlog(draftIdRef.current, { ...payload, img: coverUrl }, role);
      return;
    }
    const created = await blogsApi.createBlog({ ...payload, img: coverUrl || undefined }, role);
    if (!created?._id) throw new Error("The server did not return the new draft's ID.");
    rememberDraftId(created._id);
  }, [rememberDraftId, uploadOnce, user?.role]);

  const autosave = useDraftAutosave({
    // Off while cropping, so the uncropped original is not uploaded.
    enabled: draftLoaded && draftEditable && !submitted && !isCropperOpen,
    fingerprint: draftFingerprint,
    save: persistDraft,
  });

  // A one-off notice gives way to the save status after a few seconds. Notices about a draft
  // that cannot be edited stay.
  useEffect(() => {
    if (!draftNotice || !draftEditable) return;
    const timeout = window.setTimeout(() => setDraftNotice(null), 8000);
    return () => window.clearTimeout(timeout);
  }, [draftNotice, draftEditable]);

  const draftSaveStatus = (() => {
    if (draftNotice) return draftNotice;
    if (!draftLoaded) return "Loading draft...";
    switch (autosave.state) {
      case "pending":
        return "Unsaved changes";
      case "saving":
        return "Saving draft...";
      case "saved":
        return `Draft saved to My Stories at ${autosave.lastSavedAt?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      case "error":
        return `Could not save the draft: ${autosave.error}. Retrying shortly...`;
      default:
        return draftId ? "Draft saved to My Stories" : "Your draft saves automatically as you write";
    }
  })();

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const result = await autosave.flush();
      if (!result.ok) return; // The status line shows the error, and autosave retries.
      if (!draftIdRef.current) {
        setDraftNotice("Add story details before saving a draft");
        return;
      }
      router.push("/creator/my-stories");
    } finally {
      setIsSavingDraft(false);
    }
  };

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

  const handleStoryEditorChange = useCallback((b: BlogBlock[]) => {
    setBlocks((b || []) as DraftBlock[]);
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

      // The story is the autosaved draft: save the latest changes, then submit that draft.
      const saved = await autosave.flush();
      if (!saved.ok) throw new Error(`Could not save the story before submitting: ${saved.error}`);
      const storyId = draftIdRef.current;
      if (!storyId) throw new Error("Could not save the story before submitting. Please try again.");

      // Empty author links fall back to the profile, as the byline does.
      if (finalSocialHandle !== socialHandle || finalOrgLink !== organizationLink) {
        await blogsApi.updateBlog(
          storyId,
          { socialHandle: finalSocialHandle, organizationLink: finalOrgLink },
          creatorRole
        );
      }

      if (shouldSubmitForReview) {
        await blogsApi.submitBlog(storyId, creatorRole);
        setSubmitted(true);
      }

      router.refresh();
      router.push("/creator/my-stories");
    } catch (err: unknown) {
      console.error("Failed to submit story:", err);
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
              key={editorVersion}
              excerpt={excerpt}
              setExcerpt={(v) => {
                setExcerpt(v);
                if (v.trim()) setErrors((prev) => ({ ...prev, excerpt: false }));
              }}
              excerptError={errors.excerpt}
              initialSections={restoredSections}
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
            <span className="mr-auto text-[10px] text-[#6B7268]" aria-live="polite">
              {draftSaveStatus}
            </span>
            <button
              type="button"
              disabled={isSubmitting || isSavingDraft || !draftLoaded || !draftEditable}
              onClick={() => void handleSaveDraft()}
              className="inline-flex items-center gap-2 border border-[#D9D4C6] bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#3A4239] transition-colors hover:border-[#1E2620] disabled:opacity-50 cursor-pointer rounded-[2px]"
            >
              {isSavingDraft ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isSavingDraft ? "Saving..." : "Save Draft"}
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