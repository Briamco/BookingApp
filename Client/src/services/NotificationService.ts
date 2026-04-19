import type { Notification } from "../types";
import { api } from "./apiService";

export const NotificationService = {
  getMyNotifications: async (onlyUnread = false) => {
    return api.get<Notification[]>(`/notification/user/me?onlyUnread=${onlyUnread}`, { auth: "required" });
  },

  markAsRead: async (notificationId: number) => {
    return api.put<void>(`/notification/${notificationId}/read`, {}, { auth: "required" });
  },
};
