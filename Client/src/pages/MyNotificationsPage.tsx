import { useMemo, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { useNotification } from "../context/NotificationContext";

function MyNotificationsPage() {
  const { notifications, unreadNotifications, unreadCount, markAsRead, markAllAsRead, isConnected, isConnecting, reconnect } = useNotification();
  const [view, setView] = useState<"unread" | "all">("unread");

  const displayedNotifications = useMemo(
    () => (view === "unread" ? unreadNotifications : notifications),
    [view, unreadNotifications, notifications],
  );

  return (
    <main className="max-w-5xl mx-auto space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Notifications</h1>
          <p className="text-base-content/70">Unread dashboard and real-time push updates.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`badge ${isConnected ? "badge-success" : "badge-ghost"} gap-2 py-4 px-3`}>
            {isConnected ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            {isConnected ? "Push connected" : isConnecting ? "Connecting..." : "Push disconnected"}
          </div>
          {!isConnected && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={reconnect}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting..." : "Reconnect"}
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark all read
          </button>
        </div>
      </header>

      <div className="stats bg-base-100 shadow w-full">
        <div className="stat">
          <div className="stat-title">Unread</div>
          <div className="stat-value text-primary">{unreadCount}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Total</div>
          <div className="stat-value">{notifications.length}</div>
        </div>
      </div>

      <div role="tablist" className="tabs tabs-boxed w-fit">
        <button
          type="button"
          role="tab"
          className={`tab ${view === "unread" ? "tab-active" : ""}`}
          onClick={() => setView("unread")}
        >
          Unread ({unreadCount})
        </button>
        <button
          type="button"
          role="tab"
          className={`tab ${view === "all" ? "tab-active" : ""}`}
          onClick={() => setView("all")}
        >
          All ({notifications.length})
        </button>
      </div>

      {displayedNotifications.length === 0 ? (
        <div className="rounded-3xl border border-base-300 bg-base-100 p-10 text-center text-base-content/70">
          No notifications in this view.
        </div>
      ) : (
        <div className="grid gap-4">
          {displayedNotifications.map((notification) => (
            <article key={notification.id} className="card bg-base-100 shadow border border-base-300">
              <div className="card-body gap-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="card-title text-lg">{notification.title}</h2>
                    <p className="text-sm text-base-content/70">
                      {new Date(notification.createdAt).toLocaleString("es-DO")}
                    </p>
                  </div>
                  {!notification.isRead && <div className="badge badge-primary">Unread</div>}
                </div>

                <p>{notification.message}</p>

                <div className="card-actions justify-end">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => markAsRead(notification.id)}
                    disabled={notification.isRead}
                  >
                    {notification.isRead ? "Already read" : "Mark as read"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default MyNotificationsPage;
