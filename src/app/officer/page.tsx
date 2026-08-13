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
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Selected story for discussion / review modal
  const [selectedStoryForModal, setSelectedStoryForModal] = useState<BlogPost | null>(null);

  // Fetch Dashboard Data (Published Stories + Notification Feed)
  const fetchDashboardData = useCallback(async () => {
    if (!currentOfficerUser) return;
    setIsDataLoading(true);
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
      setIsDataLoading(false);
    }
  }, [currentOfficerUser]);

  useEffect(() => {
    if (currentOfficerUser && isPermissionAllowed) {
      fetchDashboardData();
    }
  }, [currentOfficerUser, isPermissionAllowed, fetchDashboardData]);

  const router = useRouter();

  const handleNotificationViewArticle = (articleId?: string) => {
    if (!articleId) return;
    router.push(`/creator/my-stories?open=${articleId}`);
  };

  // Handler to Accept Editor Modifications (Fixed Payload Argument)
  const handleAcceptEditorChanges = async (articleId: string) => {
    setProcessingId(articleId);
    try {
      await officerApi.acceptEditorChanges(articleId, {
        approvalNote: "Accepted by Communication Officer from Dashboard",
      });
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message || "Failed to accept editor changes");
    } finally {
      setProcessingId(null);
    }
  };

  // Handler to Mark Notification as Read
  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await officerApi.markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
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
    const pendingNotificationsCount = notifications.filter((n) => !n.isRead).length;
    const pendingEditorPromptsCount = notifications.filter(
      (n) => n.type === "EDITOR_EDIT_PROMPT" && !n.isRead
    ).length;

    return {
      livePublishedCount,
      totalCommentsCount,
      pendingNotificationsCount,
      pendingEditorPromptsCount,
    };
  }, [publishedStories, notifications]);

  if (sessionLoading || !isPermissionAllowed || !currentOfficerUser) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="Communication Officer Desk" subtitle="Verifying credentials…" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="h-28 rounded-2xl bg-slate-200/80" />
              <div className="h-28 rounded-2xl bg-slate-200/80" />
              <div className="h-28 rounded-2xl bg-slate-200/80" />
              <div className="h-28 rounded-2xl bg-slate-200/80" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Header
        title="Communication Officer Desk"
        subtitle={`Welcome back, ${currentOfficerUser.firstName || "Officer"}. Monitor published articles, respond to team comments, and review editor modifications.`}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Error State Banner */}
        {fetchErrorMessage && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-rose-600" />
              <p className="text-sm font-medium">{fetchErrorMessage}</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-xs transition hover:bg-rose-100"
            >
              <RefreshCw size={13} />
              Retry Sync
            </button>
          </div>
        )}

        {/* Dashboard Metrics Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Globe size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Live Published
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {isDataLoading ? "…" : metrics.livePublishedCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <MessageSquare size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Published Comments
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {isDataLoading ? "…" : metrics.totalCommentsCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Bell size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Unread Alerts
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {isDataLoading ? "…" : metrics.pendingNotificationsCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Editor Edits Prompts
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {isDataLoading ? "…" : metrics.pendingEditorPromptsCount}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Notifications & Action Alerts Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Bell size={18} className="text-indigo-600" />
                  Recent Alerts
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  {notifications.filter((n) => !n.isRead).length} Unread
                </span>
              </div>

              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No alerts right now.</p>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`rounded-xl border p-3.5 transition ${
                        notif.isRead
                          ? "border-slate-100 bg-slate-50/50 text-slate-600"
                          : "border-indigo-100 bg-indigo-50/30 text-slate-900 font-medium"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-indigo-700">
                          {notif.type === "EDITOR_EDIT_PROMPT"
                            ? "Editor Update Prompt"
                            : notif.type === "ARTICLE_COMMENT"
                            ? "New Comment"
                            : "System Alert"}
                        </span>
                        {!notif.isRead && (
                          <button
                            onClick={() => handleMarkNotificationRead(notif._id)}
                            className="text-[10px] font-bold text-slate-400 hover:text-indigo-600"
                            title="Mark as read"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 mb-2">{notif.message}</p>
                      {(notif.type === "CHANGE_REQUEST" || notif.type === "CHANGE_REQUEST_IMPLEMENTED") && notif.article && (
                        <button
                          onClick={() => handleNotificationViewArticle(notif.article._id)}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 shadow-xs transition hover:bg-indigo-50"
                        >
                          View Article
                        </button>
                      )}
                      {notif.type === "EDITOR_EDIT_PROMPT" && notif.article && (
                        <button
                          disabled={processingId === notif.article._id}
                          onClick={() => handleAcceptEditorChanges(notif.article._id)}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-50"
                        >
                          <Check size={13} />
                          {processingId === notif.article._id ? "Accepting…" : "Accept Editor Changes"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Published Articles Feed & Comment Hub */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Published Articles Feed</h3>
                  <p className="text-xs text-slate-500">
                    Browse live stories, engage in discussion, and monitor officer comments.
                  </p>
                </div>
                <Link
                  href="/officer/stories"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View All <ArrowRight size={13} />
                </Link>
              </div>

              {publishedStories.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
                  <FileText size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No published articles available yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {publishedStories.slice(0, 5).map((story) => (
                    <div
                      key={story._id}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-100/50"
                    >
                      <div className="space-y-1">
                        <span className="inline-block rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                          {story.tag || "General"}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900">{story.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{story.excerpt}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <MessageSquare size={14} />
                          <span>{story.comments?.length || 0}</span>
                        </div>
                        <button
                          onClick={() => setSelectedStoryForModal(story)}
                          className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
                        >
                          Join Discussion
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