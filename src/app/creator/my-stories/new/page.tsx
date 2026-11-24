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

interface LocalStoryDraft {
  title: string;
  tag: string;
  excerpt: string;
  blocks: DraftBlock[];
  coverImage: string;
  socialHandle: string;
  organizationLink: string;
  expiresAt: number;
  serverDraftId?: string;
}

const DRAFT_TTL_MS = 5 * 60 * 60 * 1000;
const DRAFT_DATABASE_NAME = "biocap-creator-drafts";
const DRAFT_STORE_NAME = "story-drafts";

const removeLegacyLocalDraft = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("Could not remove legacy local story draft:", error);
  }
};

const openDraftDatabase = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DRAFT_DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(DRAFT_STORE_NAME)) {
        request.result.createObjectStore(DRAFT_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open browser draft storage."));
  });

const readLocalStoryDraft = async (key: string) => {
  const database = await openDraftDatabase();
  return new Promise<LocalStoryDraft | null>((resolve, reject) => {
    const transaction = database.transaction(DRAFT_STORE_NAME, "readonly");
    const request = transaction.objectStore(DRAFT_STORE_NAME).get(key);
    request.onsuccess = () => resolve((request.result as LocalStoryDraft | undefined) || null);
    request.onerror = () => reject(request.error || new Error("Could not read the saved story draft."));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => database.close();
    transaction.onabort = () => {
      database.close();
      reject(transaction.error || new Error("Reading the saved story draft was interrupted."));
    };
  });
};

const writeLocalStoryDraft = async (key: string, draft: LocalStoryDraft) => {
  const database = await openDraftDatabase();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(DRAFT_STORE_NAME, "readwrite");
    transaction.objectStore(DRAFT_STORE_NAME).put(draft, key);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error("Could not save the story draft."));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error || new Error("Saving the story draft was interrupted."));
    };
  });
};

const removeLocalStoryDraft = async (key: string) => {
  const database = await openDraftDatabase();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(DRAFT_STORE_NAME, "readwrite");
    transaction.objectStore(DRAFT_STORE_NAME).delete(key);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error("Could not remove the expired story draft."));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error || new Error("Removing the expired story draft was interrupted."));
    };
  });
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const dataUrlToFile = (dataUrl: string, name: string) => {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);base64/)?.[1] || "image/jpeg";
  const binary = atob(data || "");
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new File([bytes], name, { type: mime });
};

const draftBlocksFingerprint = (blocks: DraftBlock[]) =>
  JSON.stringify(
    blocks.map(({ rawFile, ...block }) => ({
      ...block,
      rawFile: rawFile ? `${rawFile.name}:${rawFile.size}:${rawFile.lastModified}` : undefined,
    }))
  );

export default function CreateNewStoryPage() {
  const router = useRouter();
  const { user, loading, allowed } = useSession("blog:create");

  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content] = useState("");
  const [blocks, setBlocks] = useState<DraftBlock[]>([]);
  const [inlineImages, setInlineImages] = useState<File[]>([]);
  
  const [socialHandle, setSocialHandle] = useState("");
  const [organizationLink, setOrganizationLink] = useState("");
  const [isProfileSynced, setIsProfileSynced] = useState(false);

  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [restoredSections, setRestoredSections] = useState<DraftSection[] | undefined>();
  const [editorVersion, setEditorVersion] = useState(0);
  const [draftSaveStatus, setDraftSaveStatus] = useState("Recovery copy ready");
  const [draftExpiresAt, setDraftExpiresAt] = useState<number | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftRestoreComplete, setDraftRestoreComplete] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const skipNextAutoSaveRef = useRef(true);
  const blocksRef = useRef<DraftBlock[]>([]);
  const serverSaveQueueRef = useRef<Promise<void>>(Promise.resolve());

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

  const draftStorageKey = user?._id ? `biocap-story-draft:${user._id}` : null;

  useEffect(() => {
    if (!draftStorageKey) return;
    let isCurrent = true;
    const restoreDraft = async () => {
      try {
        const requestedDraftId = new URLSearchParams(window.location.search).get("edit");
        let saved = await readLocalStoryDraft(draftStorageKey);
        if (
          requestedDraftId &&
          (saved?.serverDraftId !== requestedDraftId || saved.expiresAt <= Date.now())
        ) {
          const serverDraft = await blogsApi.getBlogById(requestedDraftId, user?.role as Role);
          if (!isCurrent) return;
          setEditingDraftId(requestedDraftId);
          setTitle(serverDraft.title || "");
          setTag(serverDraft.tag || "");
          setExcerpt(serverDraft.excerpt || "");
          setSocialHandle(serverDraft.socialHandle || "");
          setOrganizationLink(serverDraft.organizationLink || "");
          const serverBlocks = (serverDraft.blocks || []) as DraftBlock[];
          setBlocks(serverBlocks);
          setInlineImages([]);
          setRestoredSections(
            serverBlocks.map((block) => ({
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
            }))
          );
          setEditorVersion((version) => version + 1);
          setCroppedPreview(serverDraft.img || null);
          setRawImageSrc(serverDraft.img || null);
          setDraftSaveStatus("Draft loaded from My Stories");
          setDraftRestoreComplete(true);
          return;
        }
        if (!saved) {
          let legacyDraft: string | null = null;
          try {
            legacyDraft = localStorage.getItem(draftStorageKey);
          } catch (error) {
            console.warn("Could not read legacy local story draft:", error);
          }
          if (legacyDraft) {
            const parsed = JSON.parse(legacyDraft) as Omit<LocalStoryDraft, "expiresAt"> & { expiresAt?: number };
            saved = {
              ...parsed,
              expiresAt: typeof parsed.expiresAt === "number" ? parsed.expiresAt : Date.now() + DRAFT_TTL_MS,
            };
            await writeLocalStoryDraft(draftStorageKey, saved);
            removeLegacyLocalDraft(draftStorageKey);
          }
        }
        if (!isCurrent) return;
        if (saved && saved.expiresAt <= Date.now()) {
          await removeLocalStoryDraft(draftStorageKey);
          removeLegacyLocalDraft(draftStorageKey);
          setDraftSaveStatus("Temporary draft expired after 5 hours");
          return;
        }
        if (saved) {
          const restoredServerDraftId = saved.serverDraftId || null;
          setEditingDraftId(restoredServerDraftId);
          setTitle(saved.title || "");
          setTag(saved.tag || "");
          setExcerpt(saved.excerpt || "");
          setSocialHandle(saved.socialHandle || "");
          setOrganizationLink(saved.organizationLink || "");

          const restoredBlocks: DraftBlock[] = (saved.blocks || []).map((block) => {
            if (block.type === "image" && block.src?.startsWith("data:image")) {
              return { ...block, rawFile: dataUrlToFile(block.src, block.fileKey || "inline-image.jpg") };
            }
            return block;
          });
          setBlocks(restoredBlocks);
          setInlineImages(
            restoredBlocks
              .flatMap((block) =>
                block.type === "image" && block.rawFile instanceof File ? [block.rawFile] : []
              )
          );
          setRestoredSections(
            restoredBlocks.map((block) => ({
              id: crypto.randomUUID(),
              kind: block.type === "h2" ? "heading" : block.type === "quote" ? "quote" : block.type === "image" ? "image" : "paragraph",
              text: block.text || "",
              attribution: block.type === "quote" ? block.caption || "" : "",
              caption: block.type === "image" ? block.caption || "" : "",
              fitMode: block.fitMode || "cover",
              imagePreview: block.type === "image" ? block.src || null : null,
              imageFile: block.type === "image" ? block.rawFile || null : null,
              imageFileKey: block.fileKey || null,
            }))
          );
          setEditorVersion((version) => version + 1);

          if (saved.coverImage?.startsWith("data:image")) {
            const restoredCover = dataUrlToFile(saved.coverImage, "story-cover.jpg");
            setCoverImageFile(restoredCover);
            setCroppedPreview(saved.coverImage);
            setRawImageSrc(saved.coverImage);
          }
          setDraftExpiresAt(saved.expiresAt);
          setDraftSaveStatus(
            restoredServerDraftId ? "Recovered draft; local changes will sync" : "Recovered temporary draft"
          );
        }
      } catch (error) {
        console.error("Could not restore local story draft:", error);
        setDraftSaveStatus("Browser draft storage unavailable");
      } finally {
        if (isCurrent) setDraftRestoreComplete(true);
      }
    };
    void restoreDraft();
    return () => {
      isCurrent = false;
    };
  }, [draftStorageKey, user?.role]);

  useEffect(() => {
    if (!draftStorageKey || !draftExpiresAt) return;
    const timeout = window.setTimeout(() => {
      void removeLocalStoryDraft(draftStorageKey)
        .then(() => {
          removeLegacyLocalDraft(draftStorageKey);
          setDraftExpiresAt(null);
          setDraftSaveStatus("Temporary draft expired after 5 hours");
        })
        .catch((error) => {
          console.error("Could not remove expired story draft:", error);
          setDraftSaveStatus("Draft expired; cleanup will retry when you reopen the editor");
        });
    }, Math.max(0, draftExpiresAt - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [draftExpiresAt, draftStorageKey]);

  const saveDraftToBrowser = useCallback(async (saveNewDraftToServer = false) => {
    if (!draftRestoreComplete || !draftStorageKey) return false;
    const hasStoryContent = Boolean(
      title.trim() ||
      tag.trim() ||
      excerpt.trim() ||
      blocks.length ||
      coverImageFile ||
      croppedPreview ||
      rawImageSrc
    );
    if (!hasStoryContent) {
      setDraftSaveStatus("Add story details before saving a draft");
      return false;
    }

    try {
      const savedBlocks = await Promise.all(
        blocks.map(async (block) => {
          if (block.type === "image" && block.rawFile instanceof File) {
            return { ...block, src: await fileToDataUrl(block.rawFile), rawFile: undefined };
          }
          return block;
        })
      );
      const coverImage = coverImageFile
        ? await fileToDataUrl(coverImageFile)
        : croppedPreview || rawImageSrc || "";
      const expiresAt = Date.now() + DRAFT_TTL_MS;
      const localDraft: LocalStoryDraft = {
        title,
        tag,
        excerpt,
        blocks: savedBlocks,
        coverImage,
        socialHandle,
        organizationLink,
        expiresAt,
        serverDraftId: editingDraftId || undefined,
      };
      await writeLocalStoryDraft(draftStorageKey, localDraft);
      removeLegacyLocalDraft(draftStorageKey);
      setDraftExpiresAt(expiresAt);

      const currentCover = coverImageFile || croppedPreview || rawImageSrc;
      if (editingDraftId) {
        const blocksBeingSaved = blocks;
        const updatePromise = serverSaveQueueRef.current.then(() =>
          blogsApi.updateBlog(
            editingDraftId,
            {
              title,
              tag,
              excerpt,
              blocks: blocksBeingSaved,
              socialHandle,
              organizationLink,
              img: currentCover || null,
            },
            user?.role as Role
          )
        );
        serverSaveQueueRef.current = updatePromise.then(
          () => undefined,
          () => undefined
        );
        const updatedDraft = await updatePromise;
        if (
          updatedDraft.blocks &&
          draftBlocksFingerprint(blocksRef.current) === draftBlocksFingerprint(blocksBeingSaved)
        ) {
          const persistedBlocks = updatedDraft.blocks as DraftBlock[];
          blocksRef.current = persistedBlocks;
          setBlocks(persistedBlocks);
          setInlineImages([]);
        }
        setDraftSaveStatus("Draft saved to My Stories and this browser");
      } else if (saveNewDraftToServer) {
        if (!currentCover) {
          setDraftSaveStatus("Saved on this device. Add a cover image to list this draft in My Stories.");
          return true;
        }
        const newDraft = await blogsApi.createBlog(
          {
            title,
            tag,
            excerpt,
            blocks,
            socialHandle,
            organizationLink,
            img: currentCover,
            images: inlineImages,
          },
          user?.role as Role
        );
        if (!newDraft?._id) {
          throw new Error("The draft was saved locally, but the server did not return a draft ID.");
        }
        setEditingDraftId(newDraft._id);
        const latestLocalDraft = (await readLocalStoryDraft(draftStorageKey)) || localDraft;
        if (
          latestLocalDraft.title !== localDraft.title ||
          latestLocalDraft.tag !== localDraft.tag ||
          latestLocalDraft.excerpt !== localDraft.excerpt ||
          draftBlocksFingerprint(latestLocalDraft.blocks) !== draftBlocksFingerprint(localDraft.blocks) ||
          latestLocalDraft.coverImage !== localDraft.coverImage ||
          latestLocalDraft.socialHandle !== localDraft.socialHandle ||
          latestLocalDraft.organizationLink !== localDraft.organizationLink
        ) {
          await blogsApi.updateBlog(
            newDraft._id,
            {
              title: latestLocalDraft.title,
              tag: latestLocalDraft.tag,
              excerpt: latestLocalDraft.excerpt,
              blocks: latestLocalDraft.blocks,
              socialHandle: latestLocalDraft.socialHandle,
              organizationLink: latestLocalDraft.organizationLink,
              img: latestLocalDraft.coverImage || null,
            },
            user?.role as Role
          );
        }
        const savedRemoteDraft = { ...latestLocalDraft, serverDraftId: newDraft._id };
        await writeLocalStoryDraft(draftStorageKey, savedRemoteDraft);
        setDraftSaveStatus("Draft saved to My Stories and this browser");
      } else {
        setDraftSaveStatus("Saved in this browser; expires 5 hours after last activity");
      }
      return true;
    } catch (error) {
      console.error("Could not save story draft:", error);
      const details = error instanceof Error ? error.message : "Unexpected save error.";
      setDraftSaveStatus(
        editingDraftId || saveNewDraftToServer
          ? `Saved on this device, but could not sync to My Stories: ${details}`
          : `Browser draft storage unavailable: ${details}`
      );
      return false;
    }
  }, [
    blocks,
    coverImageFile,
    croppedPreview,
    draftRestoreComplete,
    draftStorageKey,
    editingDraftId,
    excerpt,
    inlineImages,
    organizationLink,
    rawImageSrc,
    socialHandle,
    tag,
    title,
    user?.role,
  ]);

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const saved = await saveDraftToBrowser(true);
      if (saved && (editingDraftId || coverImageFile || croppedPreview || rawImageSrc)) {
        router.push("/creator/my-stories");
      }
    } finally {
      setIsSavingDraft(false);
    }
  };

  useEffect(() => {
    if (!draftRestoreComplete || !draftStorageKey) return;
    if (skipNextAutoSaveRef.current) {
      skipNextAutoSaveRef.current = false;
      return;
    }
    const timeout = window.setTimeout(() => {
      void saveDraftToBrowser();
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [
    draftRestoreComplete,
    draftStorageKey,
    saveDraftToBrowser,
  ]);

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

  const handleStoryEditorChange = useCallback((b: BlogBlock[], files: File[]) => {
    const updatedBlocks = (b || []) as DraftBlock[];
    blocksRef.current = updatedBlocks;
    setBlocks(updatedBlocks);
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
      const rawBlocks: BlogBlock[] = (blocks && blocks.length > 0)
        ? blocks
        : (content.trim() ? [{ type: "p", text: content.trim() }] : []);
      const blogPayload = {
          title: title.trim(),
          tag: tag.trim(),
          excerpt: excerpt.trim(),
          blocks: rawBlocks,
          socialHandle: finalSocialHandle,
          organizationLink: finalOrgLink,
      };
      const newBlog = editingDraftId
        ? await blogsApi.updateBlog(
            editingDraftId,
            {
              ...blogPayload,
              img: finalCoverImg!,
              images: inlineImages,
            },
            creatorRole
          )
        : await blogsApi.createBlog(
            { ...blogPayload, img: finalCoverImg!, images: inlineImages },
            creatorRole
          );

      if (shouldSubmitForReview && newBlog?._id) {
        await blogsApi.submitBlog(newBlog._id, creatorRole);
      }

      if (draftStorageKey) {
        try {
          await removeLocalStoryDraft(draftStorageKey);
          removeLegacyLocalDraft(draftStorageKey);
        } catch (error) {
          console.error("Story was submitted, but its local draft could not be removed:", error);
        }
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
              disabled={isSubmitting || isSavingDraft || !draftRestoreComplete}
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