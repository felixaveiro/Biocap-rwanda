'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import ReviewStoryModal from "@/components/ReviewStoryModal";
import { officerApi } from "@/lib/api/blogs";
import { useSession } from "@/hooks/useSession";
import { BlogPost, Notification, Role } from "@/types";
import {
  Globe,
  MessageSquare,
  Bell,
  CheckCircle2,
  FileText,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Check,
} from "lucide-react";

export default function CommunicationOfficerOverviewPage() {
  const {
    user: currentOfficerUser,
    loading: sessionLoading,
    allowed: isPermissionAllowed,
  } = useSession("blog:view");

  const [publishedStories, setPublishedStories] = useState<BlogPost[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDataFetching, setIsDataFetching] = useState(true);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Selected story for discussion / review modal
  const [selectedStoryForModal, setSelectedStoryForModal] = useState<BlogPost | null>(null);

  // Fetch Dashboard Data (Published Stories + Notification Feed)
  const fetchDashboardData = useCallback(async () => {
    if (!currentOfficerUser) return;
    setIsDataFetching(true);
    setFetchErrorMessage(null);

    try {
      const [publishedRes, notifRes] = await Promise.all([
        officerApi.getPublishedBlogs(),
        officerApi.getNotifications(),
      ]);

      let extractedBlogs: BlogPost[] = [];
      if (Array.isArray(publishedRes)) extractedBlogs = publishedRes;
      else if (Array.isArray((publishedRes as any)?.data)) extractedBlogs = (publishedRes as any).data;

      setPublishedStories(extractedBlogs);
      setNotifications(Array.isArray(notifRes) ? notifRes : []);
    } catch (error: unknown) {
      console.error("Failed to fetch officer dashboard data:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load officer metrics.";
      setFetchErrorMessage(errorMessage);
    } finally {
      setIsDataFetching(false);
    }
  }, [currentOfficerUser]);

  useEffect(() => {
    if (currentOfficerUser && isPermissionAllowed) {
      fetchDashboardData();
    }
  }, [currentOfficerUser, isPermissionAllowed, fetchDashboardData]);

  const router = useRouter();

  const handleNotificationViewArticle = (articleRef?: string | { _id: string }) => {
    if (!articleRef) return;
    const articleId = typeof articleRef === "string" ? articleRef : articleRef._id;
    router.push(`/creator/my-stories?open=${articleId}`);
  };

  const handleAcceptEditorChanges = async (articleRef: string | { _id: string }) => {
    const articleId = typeof articleRef === "string" ? articleRef : articleRef._id;
    setProcessingId(articleId);
    try {
      await officerApi.acceptEditorChanges(articleId, {
        approvalNote: "Accepted by Communication Officer from Dashboard",
      });
      await fetchDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to accept editor changes";
      alert(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await officerApi.markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const livePublishedCount = publishedStories.length;
    const totalCommentsCount = publishedStories.reduce(
      (acc, story) => acc + (story.comments?.length || 0),
      0
    );
    const pendingNotificationsCount = notifications.filter((n) => !n.isRead && !n.read).length;
    const pendingEditorPromptsCount = notifications.filter(
      (n) => n.type === "EDITOR_EDIT_PROMPT" && (!n.isRead && !n.read)
    ).length;

    return {
      livePublishedCount,
      totalCommentsCount,
      pendingNotificationsCount,
      pendingEditorPromptsCount,
    };
  }, [publishedStories, notifications]);

  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };

  if (sessionLoading || !isPermissionAllowed || !currentOfficerUser) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] pb-16 font-sans">
        <Header title="Communication Officer Desk" subtitle="Verifying credentials…" />
        <div className="mx-auto max-w-7xl px-8 py-10">
          <div className="animate-pulse space-y-6">
            <div className="grid gap-5 sm:grid-cols-4">
              <div className="h-24 bg-[#EFECE6]" />
              <div className="h-24 bg-[#EFECE6]" />
              <div className="h-24 bg-[#EFECE6]" />
              <div className="h-24 bg-[#EFECE6]" />
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="h-80 bg-[#EFECE6]" />
              <div className="lg:col-span-2 h-80 bg-[#EFECE6]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] pb-20 font-sans text-[#1E2620]">
      <Header
        title="Communication Officer Desk"
        subtitle={`Welcome back, ${currentOfficerUser.firstName || "Officer"}. Monitor published articles, respond to team comments, and review editor modifications.`}
      />

      <main className="mx-auto max-w-7xl px-8 py-8">
        {/* Connection Error Banner */}
        {fetchErrorMessage && (
          <div className="mb-6 flex items-center justify-between border-l-2 border-[#8B4136] bg-[#8B4136]/5 p-4 text-[#8B4136]">
            <div className="flex items-center gap-3">
              <AlertCircle size={16} />
              <p className="text-xs font-medium">{fetchErrorMessage}</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center gap-1.5 border border-[#8B4136]/30 bg-[#FAF9F5] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8B4136] hover:bg-[#8B4136] hover:text-[#FAF9F5]"
              style={monoFont}
            >
              <RefreshCw size={12} />
              Retry Sync
            </button>
          </div>
        )}

        {/* Dashboard Metrics Cards */}
        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-[#FAF9F5] border-t-2 border-[#1E2620] border-b border-x border-[#E2DDCF] p-5">
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9812F]"
                style={monoFont}
              >
                Live Feed
              </span>
              <Globe size={16} className="text-[#1E2620]" />
            </div>
            <p className="mt-3 text-3xl font-serif italic text-[#1E2620]" style={displayFont}>
              {isDataFetching ? "…" : metrics.livePublishedCount}
            </p>
          </div>

          <div className="bg-[#FAF9F5] border-t-2 border-[#3F6B4F] border-b border-x border-[#E2DDCF] p-5">
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9812F]"
                style={monoFont}
              >
                Public Notes
              </span>
              <MessageSquare size={16} className="text-[#3F6B4F]" />
            </div>
            <p className="mt-3 text-3xl font-serif italic text-[#1E2620]" style={displayFont}>
              {isDataFetching ? "…" : metrics.totalCommentsCount}
            </p>
          </div>

          <div className="bg-[#FAF9F5] border-t-2 border-[#A9812F] border-b border-x border-[#E2DDCF] p-5">
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9812F]"
                style={monoFont}
              >
                Unread Alerts
              </span>
              <Bell size={16} className="text-[#A9812F]" />
            </div>
            <p className="mt-3 text-3xl font-serif italic text-[#1E2620]" style={displayFont}>
              {isDataFetching ? "…" : metrics.pendingNotificationsCount}
            </p>
          </div>

          <div className="bg-[#FAF9F5] border-t-2 border-[#3F6B4F] border-b border-x border-[#E2DDCF] p-5">
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9812F]"
                style={monoFont}
              >
                Editor Prompts
              </span>
              <CheckCircle2 size={16} className="text-[#3F6B4F]" />
            </div>
            <p className="mt-3 text-3xl font-serif italic text-[#1E2620]" style={displayFont}>
              {isDataFetching ? "…" : metrics.pendingEditorPromptsCount}
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Notifications & Action Alerts Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="border border-[#E2DDCF] bg-[#FAF9F5] p-6">
              <div className="flex items-center justify-between border-b border-[#E2DDCF] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-[#A9812F]" />
                  <h3 className="font-serif italic text-lg text-[#1E2620]" style={displayFont}>
                    Recent Alerts
                  </h3>
                </div>
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider text-[#A9812F]"
                  style={monoFont}
                >
                  {notifications.filter((n) => !n.isRead && !n.read).length} Unread
                </span>
              </div>

              {notifications.length === 0 ? (
                <p className="text-xs text-[#7A8079] py-6 text-center italic" style={displayFont}>
                  No active alerts.
                </p>
              ) : (
                <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                  {notifications.map((notif) => {
                    const isRead = notif.isRead || notif.read;
                    const targetArticleId = typeof notif.article === "string" ? notif.article : notif.article?._id;

                    return (
                      <div
                        key={notif._id}
                        className={`p-4 border text-xs transition-colors ${
                          isRead
                            ? "border-[#E2DDCF] bg-[#FAF9F5] text-[#5A6259]"
                            : "border-l-2 border-l-[#A9812F] border-t border-b border-r border-[#E2DDCF] bg-[#EFECE6]/40 text-[#1E2620]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span
                            className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#A9812F]"
                            style={monoFont}
                          >
                            {notif.type === "EDITOR_EDIT_PROMPT"
                              ? "Editor Update"
                              : notif.type === "ARTICLE_COMMENT"
                              ? "New Remark"
                              : "System Notice"}
                          </span>
                          {!isRead && (
                            <button
                              onClick={() => handleMarkNotificationRead(notif._id)}
                              className="text-[9px] font-semibold uppercase tracking-wider text-[#7A8079] hover:text-[#1E2620] underline"
                              style={monoFont}
                            >
                              Mark Read
                            </button>
                          )}
                        </div>
                        <p className="text-xs leading-relaxed text-[#1E2620] mb-3">{notif.message}</p>

                        {(notif.type === "CHANGE_REQUEST" || notif.type === "CHANGE_REQUEST_IMPLEMENTED") && notif.article && (
                          <button
                            onClick={() => handleNotificationViewArticle(notif.article)}
                            className="w-full border border-[#D9D4C6] bg-[#FAF9F5] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1E2620] hover:border-[#1E2620] transition-colors"
                            style={monoFont}
                          >
                            Inspect Article
                          </button>
                        )}

                        {notif.type === "EDITOR_EDIT_PROMPT" && notif.article && (
                          <button
                            disabled={processingId === targetArticleId}
                            onClick={() => handleAcceptEditorChanges(notif.article!)}
                            className="w-full flex items-center justify-center gap-1.5 bg-[#1E2620] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#FAF9F5] hover:bg-[#3F6B4F] disabled:opacity-50 transition-colors"
                            style={monoFont}
                          >
                            <Check size={12} />
                            {processingId === targetArticleId ? "Processing…" : "Accept Editor Modifications"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Published Articles Feed & Comment Hub */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-[#E2DDCF] bg-[#FAF9F5] p-6">
              <div className="flex items-center justify-between border-b border-[#E2DDCF] pb-4 mb-5">
                <div>
                  <h3 className="font-serif italic text-lg text-[#1E2620]" style={displayFont}>
                    Published Catalog Feed
                  </h3>
                  <p className="text-xs text-[#7A8079] mt-0.5">
                    Browse active public stories, join discussions, and inspect officer notes.
                  </p>
                </div>
                <Link
                  href="/officer/stories"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#3F6B4F] hover:text-[#1E2620] transition-colors"
                  style={monoFont}
                >
                  Full Index <ArrowRight size={12} />
                </Link>
              </div>

              {publishedStories.length === 0 ? (
                <div className="border border-dashed border-[#D9D4C6] p-10 text-center text-[#7A8079]">
                  <FileText size={28} className="mx-auto mb-2 opacity-40 text-[#A9812F]" />
                  <p className="text-xs italic" style={displayFont}>No live published articles recorded.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {publishedStories.slice(0, 5).map((story) => (
                    <div
                      key={story._id}
                      className="border border-[#E2DDCF] bg-[#FAF9F5] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-[#EFECE6]/40"
                    >
                      <div className="space-y-1 max-w-lg">
                        <span
                          className="inline-block border border-[#A9812F]/40 bg-[#A9812F]/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#A9812F]"
                          style={monoFont}
                        >
                          {story.tag || "General"}
                        </span>
                        <h4 className="text-xs font-semibold text-[#1E2620] leading-snug">{story.title}</h4>
                        <p className="text-[11px] text-[#7A8079] line-clamp-1">{story.excerpt}</p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E2DDCF]">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#7A8079]" style={monoFont}>
                          <MessageSquare size={13} className="text-[#3F6B4F]" />
                          <span>{story.comments?.length || 0}</span>
                        </div>
                        <button
                          onClick={() => setSelectedStoryForModal(story)}
                          className="border border-[#D9D4C6] bg-[#FAF9F5] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1E2620] hover:border-[#1E2620] hover:text-[#3F6B4F] transition-colors"
                          style={monoFont}
                        >
                          Open Desk
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Render Discussion Modal */}
      {selectedStoryForModal && (
        <ReviewStoryModal
          story={selectedStoryForModal}
          currentUserRole={currentOfficerUser.role as Role}
          onClose={() => setSelectedStoryForModal(null)}
          onReviewCompleted={() => {
            setSelectedStoryForModal(null);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
}