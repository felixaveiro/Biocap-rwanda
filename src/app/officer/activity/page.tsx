'use client';

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import { officerApi } from "@/lib/api/blogs";
import { useSession } from "@/hooks/useSession";
import { Notification } from "@/types";
import { Bell, Check, RefreshCw, AlertCircle, Clock, Shield } from "lucide-react";

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
    } catch (err: any) {
      console.error("Failed to load notifications:", err);
      setErrorMsg(err.message || "Failed to load notifications feed.");
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
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  if (sessionLoading || !allowed || !currentOfficerUser) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="Notifications & Activity" subtitle="Verifying credentials…" />
        <div className="p-8 text-sm text-slate-400">Loading activity…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Header
        title="Activity & Notifications Hub"
        subtitle="Track system events, editorial revision prompts, and comment alerts"
      />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-rose-600" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={fetchNotifications}
              className="inline-flex items-center gap-1 rounded-lg bg-white border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {/* Notifications List Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Communication Alerts</h3>
                <p className="text-xs text-slate-400">Review pending actions and editor requests</p>
              </div>
            </div>

            <button
              onClick={fetchNotifications}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Shield size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">All caught up! No active alerts found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((item) => (
                <div
                  key={item._id}
                  className={`flex items-start justify-between rounded-2xl border p-4 transition ${
                    item.isRead
                      ? "border-slate-100 bg-slate-50/50"
                      : "border-indigo-100 bg-indigo-50/40"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                        {item.type}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-800">{item.message}</p>
                  </div>

                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(item._id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                    >
                      <Check size={12} /> Mark Read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}