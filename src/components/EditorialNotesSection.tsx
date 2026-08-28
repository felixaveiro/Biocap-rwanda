'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, ShieldCheck, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Comment } from '@/types';
import { officerApi, blogsApi } from '@/lib/api/blogs';

interface EditorialNotesSectionProps {
  storyId: string;
  userRole?: string;
  isPublished?: boolean;
}

export default function EditorialNotesSection({
  storyId,
  userRole,
  isPublished = false,
}: EditorialNotesSectionProps) {
  const [notes, setComments] = useState<Comment[]>([]);
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAccessOfficerApi = ['admin', 'communication_officer', 'editor'].includes(userRole || '');

  const loadNotes = useCallback(async () => {
    if (!storyId) return;

    setLoading(true);
    setError(null);

    try {
      if (canAccessOfficerApi) {
        // Fetch via officer/editor review API
        const data = await officerApi.getArticleComments(storyId);
        setComments(Array.isArray(data) ? data : []);
      } else {
        // Safe fallback for authors/contributors viewing internal review notes
        const data = await blogsApi.getArticleComments(storyId);
        setComments(Array.isArray(data) ? data : []);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('403')) {
        setComments([]);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load editorial notes');
      }
    } finally {
      setLoading(false);
    }
  }, [storyId, canAccessOfficerApi]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handlePostNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      if (canAccessOfficerApi) {
        await officerApi.addArticleComment(storyId, noteText.trim());
      } else {
        await blogsApi.addComment(storyId, { content: noteText.trim() });
      }
      setNoteText('');
      await loadNotes();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to post internal note');
    } finally {
      setSubmitting(false);
    }
  };

  if (isPublished) return null; // Hide internal revision notes on live public published articles

  return (
    <div className="space-y-4 rounded-xl border border-[#EDEAE0] bg-[#FAF9F5] p-5">
      <div className="flex items-center justify-between border-b border-[#EDEAE0] pb-3">
        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B3A5C]">
          <MessageSquare size={15} className="text-[#3F6B4F]" />
          Editorial Review Notes ({notes.length})
        </h4>
        {canAccessOfficerApi && (
          <span className="inline-flex items-center gap-1 border border-[#3F6B4F]/30 bg-[#3F6B4F]/10 px-2 py-0.5 text-[10px] font-semibold text-[#3F6B4F]">
            <ShieldCheck size={12} /> Reviewer Desk
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 border-l-2 border-rose-500 bg-rose-50 p-2.5 text-xs text-rose-700">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Note submission form */}
      <form onSubmit={handlePostNote} className="space-y-2">
        <textarea
          rows={2}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Leave feedback or revision requests for the author..."
          className="w-full rounded-lg border border-[#D9D4C6] bg-white p-3 text-xs text-[#1E2620] outline-none focus:border-[#3F6B4F]"
        />
        <button
          type="submit"
          disabled={submitting || !noteText.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#1E2620] bg-[#1E2620] px-4 py-2 text-xs font-semibold uppercase text-white transition hover:bg-[#3F6B4F] disabled:opacity-50 cursor-pointer"
        >
          {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          Post Review Note
        </button>
      </form>

      {/* Notes list */}
      <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
        {loading ? (
          <div className="py-4 text-center text-xs text-slate-400">Loading notes...</div>
        ) : notes.length === 0 ? (
          <p className="py-3 text-center text-xs italic text-[#8B9188]">
            No review notes posted yet.
          </p>
        ) : (
          notes.map((note) => (
            <div key={note._id} className="rounded-lg border border-[#EDEAE0] bg-white p-3 text-xs">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-semibold text-[#1E2620]">
                  {note.name || (note.user ? `${note.user.firstName} ${note.user.lastName}` : 'Reviewer')}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-[#8B9188]">
                  <Clock size={10} />
                  {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Recently'}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}