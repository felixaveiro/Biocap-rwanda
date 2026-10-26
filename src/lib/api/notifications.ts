import { apiRequest } from "./client";

export interface AppNotification {
  _id: string;
  type: string;
  message: string;
  article: string;
  isRead: boolean;
  createdAt: string;
  sender?: { firstName?: string; lastName?: string; username?: string } | null;
}

export interface NotificationList {
  notifications: AppNotification[];
  unreadCount: number;
}

/** The signed-in user's latest notifications, for any role. */
export async function getNotifications(): Promise<NotificationList> {
  return apiRequest<NotificationList>("/api/notifications", { auth: true });
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await apiRequest<{ message: string }>(`/api/notifications/${id}/read`, { method: "PATCH", auth: true });
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await apiRequest<{ message: string }>("/api/notifications/read-all", { method: "PATCH", auth: true });
}
