'use client';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { officerApi } from "@/lib/api/blogs";
import { useSession } from "@/hooks/useSession";
import { Notification } from "@/types";
import { Bell, Check, RefreshCw, AlertCircle, Clock, Shield, ArrowRight } from "lucide-react";

export default function OfficerActivityNotificationsPage() {
  const { user: currentOfficerUser, loading: sessionLoading, allowed } = useSession("blog:view");

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!currentOfficerUser) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await officerApi.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error("Failed to load notifications:", err);
      const msg = err instanceof Error ? err.message : "Failed to load notifications feed.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  }, [currentOfficerUser]);

  useEffect(() => {
    if (currentOfficerUser && allowed) {
      fetchNotifications();
    }
  }, [currentOfficerUser, allowed, fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await officerApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const router = useRouter();

  const handleViewArticle = (articleRef?: string | { _id: string }) => {
    if (!articleRef) return;
    const articleId = typeof articleRef === "string" ? articleRef : articleRef._id;
    router.push(`/creator/my-stories?open=${articleId}`);
  };

  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };

  if (sessionLoading || !allowed || !currentOfficerUser) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] pb-16 font-sans">
        <Header title="Notifications & Activity" subtitle="Verifying credentials…" />
        <div className="mx-auto max-w-5xl px-8 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-12 w-full bg-[#EFECE6]" />
            <div className="h-64 w-full bg-[#EFECE6]" />
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead && !n.read).length;

  return (
    <div className="min-h-screen bg-[#FAF9F5] pb-20 font-sans text-[#1E2620]">
      <Header
        title="Activity & Notifications Hub"
        subtitle="Track platform dispatches, editorial updates, and author discussion prompts"
      />

      <main className="mx-auto max-w-5xl px-8 py-8">
        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-6 flex items-center justify-between border-l-2 border-[#8B4136] bg-[#8B4136]/5 p-4 text-[#8B4136]">
            <div className="flex items-center gap-3">
              <AlertCircle size={16} />
              <p className="text-xs font-medium">{errorMsg}</p>
            </div>
            <button
              onClick={fetchNotifications}
              className="inline-flex items-center gap-1.5 border border-[#8B4136]/30 bg-[#FAF9F5] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8B4136] hover:bg-[#8B4136] hover:text-[#FAF9F5]"
              style={monoFont}
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {/* Notifications Main Card */}
        <div className="border border-[#E2DDCF] bg-[#FAF9F5] p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E2DDCF] pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center border border-[#1E2620] bg-[#1E2620] text-[#FAF9F5]">
                <Bell size={16} className="text-[#A9812F]" />
              </div>
              <div>
                <h3 className="font-serif italic text-lg text-[#1E2620]" style={displayFont}>
                  Communication Dispatch Feed
                </h3>
                <p className="text-[11px] text-[#7A8079]">
                  Review officer alerts, change request responses, and editorial logs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9812F]"
                style={monoFont}
              >
                {unreadCount} Unread
              </span>
              <button
                type="button"
                onClick={fetchNotifications}
                className="inline-flex items-center gap-1.5 border border-[#D9D4C6] bg-[#FAF9F5] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1E2620] hover:border-[#1E2620] transition-colors"
                style={monoFont}
              >
                <RefreshCw size={12} /> Sync
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="h-64 animate-pulse border border-[#E2DDCF] bg-[#EFECE6]" />
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-[#D9D4C6] text-[#7A8079]">
              <Shield size={32} className="mx-auto mb-2 text-[#A9812F]/60" />
              <p className="text-sm italic" style={displayFont}>
                All caught up. No active dispatches found in your feed.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((item) => {
                const isRead = item.isRead || item.read;

                return (
                  <div
                    key={item._id}
                    className={`p-4 border transition-colors ${
                      isRead
                        ? "border-[#E2DDCF] bg-[#FAF9F5] text-[#5A6259]"
                        : "border-l-2 border-l-[#A9812F] border-t border-b border-r border-[#E2DDCF] bg-[#EFECE6]/40 text-[#1E2620]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="border border-[#A9812F]/40 bg-[#A9812F]/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#A9812F]"
                          style={monoFont}
                        >
                          {item.type?.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-[#7A8079] flex items-center gap-1" style={monoFont}>
                          <Clock size={10} />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {!isRead && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(item._id)}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#3F6B4F] hover:underline"
                          style={monoFont}
                        >
                          <Check size={11} /> Mark Read
                        </button>
                      )}
                    </div>

                    <p className="text-xs leading-relaxed text-[#1E2620] mb-3">{item.message}</p>

                    {item.article && (
                      <div className="pt-2 border-t border-[#E2DDCF] flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleViewArticle(item.article)}
                          className="inline-flex items-center gap-1.5 border border-[#D9D4C6] bg-[#FAF9F5] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1E2620] hover:border-[#1E2620] hover:text-[#3F6B4F] transition-colors"
                          style={monoFont}
                        >
                          Inspect Article <ArrowRight size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}