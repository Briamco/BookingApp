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
    <main className="premium-page-shell mx-auto max-w-5xl space-y-6 pb-8">

      <header className="rounded-3xl border border-base-300/80 bg-linear-to-br from-base-100 via-base-100 to-base-200/90 p-6 shadow-sm lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">Notifications</h1>
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
              className="btn btn-primary btn-sm shadow-sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all read
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-base-300/80 bg-base-100/90 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-base-content/60">Unread</p>
          <p className="mt-2 text-4xl font-bold text-primary">{unreadCount}</p>
        </div>
        <div className="rounded-2xl border border-base-300/80 bg-base-100/90 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-base-content/60">Total</p>
          <p className="mt-2 text-4xl font-bold">{notifications.length}</p>
        </div>
      </div>

      <div role="tablist" className="tabs tabs-boxed w-fit border border-base-300 bg-base-100/80 p-1 shadow-sm">
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
        <div className="rounded-3xl border border-base-300 bg-base-100/90 p-10 text-center text-base-content/70 shadow-sm">
          No notifications in this view.
        </div>
      ) : (
        <div className="grid gap-4">
          {displayedNotifications.map((notification) => (
            <article key={notification.id} className={`card border border-base-300/80 bg-base-100/90 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${notification.isRead ? "" : "border-l-4 border-l-primary"}`}>
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
