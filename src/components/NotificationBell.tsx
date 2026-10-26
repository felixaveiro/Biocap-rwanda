"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type AppNotification,
  type NotificationList,
} from "@/lib/api/notifications";

const POLL_MS = 60000;

const STAFF_HOME: Record<string, string> = {
  admin: "/admin/stories",
  editor: "/editor/manage",
  communication_officer: "/officer/stories",
};

// The page a notification is about, for the role that receives it.
export function destinationFor(notification: AppNotification, role: string): string {
  const isWriter = !(role in STAFF_HOME);
  const home = STAFF_HOME[role] ?? "/creator/my-stories";

  switch (notification.type) {
    case "PROPOSAL_RECEIVED":
      return isWriter ? `/creator/proposals/${notification.article}` : home;
    case "PROPOSAL_DECIDED":
      return "/editor/manage";
    case "STORY_SUBMITTED":
      return role === "editor" ? "/editor/review" : home;
    default:
      return home;
  }
}

export default function NotificationBell() {
  const { user } = useSession();
  const router = useRouter();
  const [data, setData] = useState<NotificationList | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      setData(await getNotifications());
    } catch {
      // Keep the last list we had; the next poll tries again.
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    load();
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [user, load]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [open]);

  if (!user) return null;

  const unread = data?.unreadCount ?? 0;

  const openNotification = async (notification: AppNotification) => {
    setOpen(false);
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification._id);
      } catch {
        // Opening the page still matters more than the read flag.
      }
      load();
    }
    router.push(destinationFor(notification, user.role as string));
  };

  const markAll = async () => {
    try {
      await markAllNotificationsAsRead();
    } catch {
      // The list below is reloaded either way, so the count stays accurate.
    }
    load();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        onClick={() => {
          if (!open) load();
          setOpen((value) => !value);
        }}
        className="relative inline-flex h-9 w-9 items-center justify-center border border-[#D9D4C6] bg-white text-[#1E2620] transition-colors hover:bg-[#1E2620] hover:text-white cursor-pointer"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 min-w-[18px] bg-[#B65C4B] px-1 text-center text-[10px] font-semibold leading-[18px] text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 max-h-[420px] w-[340px] overflow-y-auto border border-[#D9D4C6] bg-white shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-[#EDEAE0] px-4 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1B3A5C]">Notifications</p>
            {unread > 0 && (
              <button type="button" onClick={markAll} className="text-[11px] font-semibold text-[#3F6B4F] hover:underline cursor-pointer">
                Mark all read
              </button>
            )}
          </div>

          {data && data.notifications.length === 0 ? (
            <p className="p-4 text-xs text-slate-500">Nothing new yet.</p>
          ) : (
            <ul className="divide-y divide-[#EDEAE0]">
              {(data?.notifications ?? []).map((notification) => (
                <li key={notification._id}>
                  <button
                    type="button"
                    onClick={() => openNotification(notification)}
                    className={`block w-full px-4 py-3 text-left transition-colors hover:bg-[#FAF9F5] cursor-pointer ${
                      notification.isRead ? "" : "bg-[#FBF6E9]"
                    }`}
                  >
                    <p className="text-xs text-[#1E2620]">{notification.message}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-[#8B9188]">
                      {new Date(notification.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
