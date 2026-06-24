"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBlog, type BlogSession } from "@/lib/api/blogs";
import { ApiError } from "@/lib/api/client";

// ---- Small reusable pieces for the dynamic list fields ----

/** A single text-input row with a remove button, used for objectives/collaboration. */
function ListItemInput({
  value,
  placeholder,
  onChange,
  onRemove,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="button"
        onClick={onRemove}
        className="rounded-lg border border-gray-300 px-3 text-sm text-gray-500 hover:bg-gray-50 transition"
      >
        ✕
      </button>
    </div>
  );
}

const EMPTY_SESSION: BlogSession = { role: "", name: "", summary: "" };

export default function NewPostPage() {
  const router = useRouter();

  // Flat fields
  const [title, setTitle] = useState("");
  const [img, setImg] = useState("");
  const [tag, setTag] = useState("");

  // modal.* flat fields
  const [date, setDate] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [partners, setPartners] = useState("");
  const [intro, setIntro] = useState("");
  const [quote, setQuote] = useState("");
  const [quoteSource, setQuoteSource] = useState("");

  // modal.* array fields
  const [objectives, setObjectives] = useState<string[]>([""]);
  const [collaboration, setCollaboration] = useState<string[]>([""]);
  const [sessions, setSessions] = useState<BlogSession[]>([EMPTY_SESSION]);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---- Generic helpers for editing array state ----
  function updateListItem(
    list: string[],
    setList: (v: string[]) => void,
    index: number,
    value: string
  ) {
    setList(list.map((item, i) => (i === index ? value : item)));
  }

  function removeListItem(list: string[], setList: (v: string[]) => void, index: number) {
    setList(list.filter((_, i) => i !== index));
  }

  function updateSession(index: number, field: keyof BlogSession, value: string) {
    setSessions(sessions.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function removeSession(index: number) {
    setSessions(sessions.filter((_, i) => i !== index));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !img || !tag || !date || !organizer || !intro) {
      setError("Title, image, tag, date, organizer, and intro are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createBlog({
        title,
        img,
        tag,
        modal: {
          date,
          organizer,
          partners,
          intro,
          // Strip out any empty rows the user added but didn't fill in.
          objectives: objectives.map((o) => o.trim()).filter(Boolean),
          collaboration: collaboration.map((c) => c.trim()).filter(Boolean),
          sessions: sessions.filter((s) => s.role.trim() && s.name.trim()),
          quote,
          quoteSource,
        },
      });

      router.push("/dashboard/dashboard/blog");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create the post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">New Post</h1>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Basic info ── */}
        <section className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="AI in Healthcare Innovation Summit"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="text"
              value={img}
              onChange={(e) => setImg(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Conference"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </section>

        {/* ── Event details (modal) ── */}
        <section className="space-y-4 border-t pt-4">
          <h2 className="text-sm font-semibold text-gray-700">Event details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="March 14, 2026"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
              <input
                type="text"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="Biocap Foundation"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Partners</label>
            <input
              type="text"
              value={partners}
              onChange={(e) => setPartners(e.target.value)}
              placeholder="World Health Organization, Rwanda Ministry of Health"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Intro</label>
            <textarea
              rows={3}
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="A full-day gathering bringing together..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </section>

        {/* ── Objectives (array) ── */}
        <section className="space-y-2 border-t pt-4">
          <h2 className="text-sm font-semibold text-gray-700">Objectives</h2>
          {objectives.map((objective, index) => (
            <ListItemInput
              key={index}
              value={objective}
              placeholder="Share cutting-edge research on..."
              onChange={(value) => updateListItem(objectives, setObjectives, index, value)}
              onRemove={() => removeListItem(objectives, setObjectives, index)}
            />
          ))}
          <button
            type="button"
            onClick={() => setObjectives([...objectives, ""])}
            className="text-sm text-indigo-600 hover:underline"
          >
            + Add objective
          </button>
        </section>

        {/* ── Sessions (array of objects) ── */}
        <section className="space-y-3 border-t pt-4">
          <h2 className="text-sm font-semibold text-gray-700">Sessions</h2>
          {sessions.map((session, index) => (
            <div key={index} className="rounded-lg border border-gray-200 p-3 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={session.role}
                  placeholder="Role (e.g. Keynote Speaker)"
                  onChange={(e) => updateSession(index, "role", e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={session.name}
                  placeholder="Name"
                  onChange={(e) => updateSession(index, "name", e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <textarea
                rows={2}
                value={session.summary}
                placeholder="Summary"
                onChange={(e) => updateSession(index, "summary", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <button
                type="button"
                onClick={() => removeSession(index)}
                className="text-xs text-red-500 hover:underline"
              >
                Remove session
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setSessions([...sessions, EMPTY_SESSION])}
            className="text-sm text-indigo-600 hover:underline"
          >
            + Add session
          </button>
        </section>

        {/* ── Collaboration (array) ── */}
        <section className="space-y-2 border-t pt-4">
          <h2 className="text-sm font-semibold text-gray-700">Collaboration opportunities</h2>
          {collaboration.map((item, index) => (
            <ListItemInput
              key={index}
              value={item}
              placeholder="Research grants"
              onChange={(value) => updateListItem(collaboration, setCollaboration, index, value)}
              onRemove={() => removeListItem(collaboration, setCollaboration, index)}
            />
          ))}
          <button
            type="button"
            onClick={() => setCollaboration([...collaboration, ""])}
            className="text-sm text-indigo-600 hover:underline"
          >
            + Add item
          </button>
        </section>

        {/* ── Quote ── */}
        <section className="space-y-4 border-t pt-4">
          <h2 className="text-sm font-semibold text-gray-700">Closing quote</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quote</label>
            <textarea
              rows={2}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="This summit fundamentally changed how I think about..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quote Source</label>
            <input
              type="text"
              value={quoteSource}
              onChange={(e) => setQuoteSource(e.target.value)}
              placeholder="Dr. Jane Mukamana, Keynote Speaker"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </section>

        <div className="flex gap-3 border-t pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save Post"}
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