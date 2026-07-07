"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ImagePlus,
  Plus,
  X,
  FileText,
  Loader2,
  ArrowLeft,
  Quote as QuoteIcon,
  Users,
  Target,
  Handshake,
} from "lucide-react";
import { createBlog, type BlogModal, type BlogSession } from "@/lib/api/blogs";
import { ApiError } from "@/lib/api/client";

const EMPTY_SESSION: BlogSession = { name: "", role: "", summary: "" };

export default function NewBlogPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Core fields
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  const [organizationLink, setOrganizationLink] = useState("");

  // Modal fields
  const [date, setDate] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [partners, setPartners] = useState("");
  const [intro, setIntro] = useState("");
  const [objectives, setObjectives] = useState<string[]>([""]);
  const [sessions, setSessions] = useState<BlogSession[]>([{ ...EMPTY_SESSION }]);
  const [collaboration, setCollaboration] = useState<string[]>([""]);
  const [quote, setQuote] = useState("");
  const [quoteSource, setQuoteSource] = useState("");

  // Files
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleImgChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  }

  function updateListItem(
    list: string[],
    setList: (v: string[]) => void,
    index: number,
    value: string
  ) {
    const next = [...list];
    next[index] = value;
    setList(next);
  }

  function addListItem(list: string[], setList: (v: string[]) => void) {
    setList([...list, ""]);
  }

  function removeListItem(list: string[], setList: (v: string[]) => void, index: number) {
    setList(list.filter((_, i) => i !== index));
  }

  function updateSession(index: number, field: keyof BlogSession, value: string) {
    const next = [...sessions];
    next[index] = { ...next[index], [field]: value };
    setSessions(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!imgFile) {
      setError("A cover image is required.");
      return;
    }
    if (!intro.trim()) {
      setError("The intro field is required.");
      return;
    }

   const modal: BlogModal = {
  date,
  organizer,
  partners,
  intro,
  objectives: objectives.filter((o) => o.trim() !== ""),
  sessions: sessions.filter((s) => s.name.trim() !== "" || s.role.trim() !== ""),
  collaboration: collaboration.filter((c) => c.trim() !== ""),
  quote,
  quoteSource,
};
  setIsSubmitting(true);
    try {
      await createBlog({
        title,
        img: imgFile.name, // TODO: replace with a real hosted URL once image upload is wired up
        tag,
        modal,
      });
      router.push("/dashboard/dashboard/blog");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create the post.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#1B3A5C] transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1
            className="text-lg font-semibold text-[#1B3A5C]"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            New Blog Post
          </h1>
          <button
            form="new-post-form"
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-full bg-[#E8185A] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#c81450] disabled:opacity-60 transition"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Publishing draft…" : "Save draft"}
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[380px_1fr]">
        {/* ---------------- LEFT: live preview ---------------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Card preview
          </p>
          <div className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-gray-100">
            <div className="relative h-44 w-full bg-gradient-to-br from-[#1B3A5C] to-[#274d78]">
              {imgPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imgPreview} alt="Cover preview" className="h-full w-full object-cover" />
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/70 hover:text-white transition"
                >
                  <ImagePlus className="h-7 w-7" />
                  <span className="text-xs font-medium">Add cover image</span>
                </button>
              )}
              {imgPreview && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-black/70 transition"
                >
                  Replace
                </button>
              )}
            </div>
            <div className="p-5">
              {tag && (
                <span className="inline-block rounded-full bg-[#E8185A]/10 px-2.5 py-0.5 text-xs font-semibold text-[#E8185A] mb-2">
                  {tag}
                </span>
              )}
              <h2
                className="text-lg font-semibold text-[#1B3A5C] leading-snug"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                {title || "Your post title will appear here"}
              </h2>
              <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                {excerpt || "A short excerpt preview shows readers what this post covers."}
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImgChange}
            className="hidden"
          />

          {/* Attribution */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Attribution
            </p>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Social handle
            </label>
            <input
              value={socialHandle}
              onChange={(e) => setSocialHandle(e.target.value)}
              placeholder="@handle"
              className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1B3A5C] focus:ring-1 focus:ring-[#1B3A5C]"
            />
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Organization link
            </label>
            <input
              value={organizationLink}
              onChange={(e) => setOrganizationLink(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1B3A5C] focus:ring-1 focus:ring-[#1B3A5C]"
            />
          </div>
        </aside>

        {/* ---------------- RIGHT: form ---------------- */}
        <form id="new-post-form" onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">
              {error}
            </div>
          )}

          {/* Basics */}
          <Section title="Post basics" subtitle="What shows up on the card and feed.">
            <Field label="Title" required>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="DNA Week 2026"
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tag" required>
                <input
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  required
                  placeholder="Sustainability"
                  className={inputClass}
                />
              </Field>
              <Field label="Document (optional)">
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="flex w-full items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-[#1B3A5C] hover:text-[#1B3A5C] transition"
                >
                  <FileText className="h-4 w-4" />
                  {documentFile ? documentFile.name : "Attach PDF"}
                </button>
                <input
                  ref={docInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </Field>
            </div>
            <Field label="Excerpt" required>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                required
                rows={3}
                placeholder="A short summary shown on the feed and card."
                className={inputClass}
              />
            </Field>
          </Section>

          {/* Modal — event details */}
          <Section title="Event details" subtitle="Shown when a reader opens the full story.">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Date">
                <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="6 May 2026" className={inputClass} />
              </Field>
              <Field label="Organizer">
                <input value={organizer} onChange={(e) => setOrganizer(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Partners">
                <input value={partners} onChange={(e) => setPartners(e.target.value)} className={inputClass} />
              </Field>
            </div>
            <Field label="Intro" required>
              <textarea
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                required
                rows={4}
                placeholder="The opening paragraph readers see first."
                className={inputClass}
              />
            </Field>
          </Section>

          {/* Objectives */}
          <Section
            title="Objectives"
            subtitle="What this event or post set out to achieve."
            icon={<Target className="h-4 w-4" />}
          >
            <ListEditor
              items={objectives}
              placeholder="Raise public awareness of…"
              onChange={(i, v) => updateListItem(objectives, setObjectives, i, v)}
              onAdd={() => addListItem(objectives, setObjectives)}
              onRemove={(i) => removeListItem(objectives, setObjectives, i)}
            />
          </Section>

          {/* Sessions */}
          <Section
            title="Sessions & speakers"
            subtitle="Each speaker's name, role, and a one-line summary."
            icon={<Users className="h-4 w-4" />}
          >
            <div className="space-y-3">
              {sessions.map((session, i) => (
                <div key={i} className="relative rounded-xl border border-gray-200 p-4">
                  {sessions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSessions(sessions.filter((_, idx) => idx !== i))}
                      className="absolute right-3 top-3 text-gray-300 hover:text-red-500 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={session.name}
                      onChange={(e) => updateSession(i, "name", e.target.value)}
                      placeholder="Speaker name"
                      className={inputClass}
                    />
                    <input
                      value={session.role}
                      onChange={(e) => updateSession(i, "role", e.target.value)}
                      placeholder="Role / session title"
                      className={inputClass}
                    />
                  </div>
                  <textarea
                    value={session.summary}
                    onChange={(e) => updateSession(i, "summary", e.target.value)}
                    placeholder="Summary of what they covered"
                    rows={2}
                    className={`${inputClass} mt-3`}
                  />
                </div>
              ))}
              <AddButton onClick={() => setSessions([...sessions, { ...EMPTY_SESSION }])} label="Add speaker" />
            </div>
          </Section>

          {/* Collaboration */}
          <Section
            title="Collaboration"
            subtitle="Ways partners are involved."
            icon={<Handshake className="h-4 w-4" />}
          >
            <ListEditor
              items={collaboration}
              placeholder="Student internships"
              onChange={(i, v) => updateListItem(collaboration, setCollaboration, i, v)}
              onAdd={() => addListItem(collaboration, setCollaboration)}
              onRemove={(i) => removeListItem(collaboration, setCollaboration, i)}
            />
          </Section>

          {/* Quote */}
          <Section title="Closing quote" subtitle="Optional — pulled out as a highlight." icon={<QuoteIcon className="h-4 w-4" />}>
            <Field label="Quote">
              <textarea value={quote} onChange={(e) => setQuote(e.target.value)} rows={2} className={inputClass} />
            </Field>
            <Field label="Quote source">
              <input value={quoteSource} onChange={(e) => setQuoteSource(e.target.value)} className={inputClass} />
            </Field>
          </Section>
        </form>
      </div>
    </div>
  );
}

// ---------------- shared bits ----------------

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1B3A5C] focus:ring-1 focus:ring-[#1B3A5C] transition";

function Section({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-5 flex items-center gap-2">
        {icon && <span className="text-[#E8185A]">{icon}</span>}
        <div>
          <h3 className="text-sm font-semibold text-[#1B3A5C]">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500">
        {label}
        {required && <span className="text-[#E8185A]"> *</span>}
      </label>
      {children}
    </div>
  );
}

function ListEditor({
  items,
  placeholder,
  onChange,
  onAdd,
  onRemove,
}: {
  items: string[];
  placeholder: string;
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={item}
            onChange={(e) => onChange(i, e.target.value)}
            placeholder={placeholder}
            className={inputClass}
          />
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="shrink-0 text-gray-300 hover:text-red-500 transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
      <AddButton onClick={onAdd} label="Add item" />
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs font-semibold text-[#1B3A5C] hover:text-[#E8185A] transition"
    >
      <Plus className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}