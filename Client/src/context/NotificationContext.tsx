import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Notification } from "../types";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { NotificationService } from "../services/NotificationService";

interface NotificationContextType {
  notifications: Notification[];
  unreadNotifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isConnecting: boolean;
  refreshNotifications: (onlyUnread?: boolean) => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  reconnect: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const manualDisconnectRef = useRef(false);

  const clearReconnectTimer = () => {
    if (reconnectTimeoutRef.current !== null) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const disconnectSocket = (manual = false) => {
    manualDisconnectRef.current = manual;
    clearReconnectTimer();

    if (socketRef.current) {
      const socket = socketRef.current;
      socketRef.current = null;
      socket.close();
    }
  };

  const refreshNotifications = useCallback(async (onlyUnread = false) => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    try {
      const response = await NotificationService.getMyNotifications(onlyUnread);
      setNotifications(response);
    } catch {
      addToast("error", "Failed to load notifications");
    }
  }, [addToast, isAuthenticated]);

  const markAsRead = useCallback(async (notificationId: number) => {
    await NotificationService.markAsRead(notificationId);
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification,
      ),
    );
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter((notification) => !notification.isRead).map((notification) => notification.id);

    await Promise.all(unreadIds.map((id) => NotificationService.markAsRead(id)));

    setNotifications((previous) =>
      previous.map((notification) => ({ ...notification, isRead: true })),
    );
  }, [notifications]);

  const connectSocket = useCallback((manual = false) => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    disconnectSocket(manual);

    setIsConnecting(true);
    setIsConnected(false);
    manualDisconnectRef.current = false;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socketUrl = `${protocol}://${window.location.host}/api/notification/ws/${user.id}?access_token=${encodeURIComponent(token)}`;

    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      reconnectAttemptsRef.current = 0;
      setIsConnected(true);
      setIsConnecting(false);
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as { title?: string; message?: string };
        addToast("info", payload.title ? `${payload.title}: ${payload.message ?? ""}` : payload.message ?? "New notification");
      } catch {
        addToast("info", "You have a new notification");
      }

      refreshNotifications();
    };

    socket.onerror = () => {
      setIsConnected(false);
      setIsConnecting(false);
    };

    socket.onclose = () => {
      setIsConnected(false);
      setIsConnecting(false);

      if (manualDisconnectRef.current || !isAuthenticated || !user) return;

      const nextAttempt = reconnectAttemptsRef.current + 1;
      reconnectAttemptsRef.current = nextAttempt;
      const delay = Math.min(30000, 1000 * 2 ** (nextAttempt - 1));

      clearReconnectTimer();
      reconnectTimeoutRef.current = window.setTimeout(() => connectSocket(), delay);
    };
  }, [addToast, isAuthenticated, refreshNotifications, user]);

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connectSocket(true);
  }, [connectSocket]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      disconnectSocket(true);
      reconnectAttemptsRef.current = 0;
      setIsConnected(false);
      setIsConnecting(false);
      setNotifications([]);
      return;
    }

    refreshNotifications();
    connectSocket();

    return () => {
      disconnectSocket(true);
      setIsConnected(false);
      setIsConnecting(false);
    };
  }, [isAuthenticated, user, refreshNotifications, connectSocket]);

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.isRead),
    [notifications],
  );

  const value = useMemo<NotificationContextType>(() => ({
    notifications,
    unreadNotifications,
    unreadCount: unreadNotifications.length,
    isConnected,
    isConnecting,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    reconnect,
  }), [notifications, unreadNotifications, isConnected, isConnecting, refreshNotifications, markAsRead, markAllAsRead, reconnect]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }

  return context;
};
