import { Home, Search, User, Bell, List } from "lucide-react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

function BottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useNotification();

  // Don't show bottom nav on property detail pages as they have their own sticky footer
  if (location.pathname.startsWith("/property/")) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-base-300 bg-base-100 px-2 py-3 md:hidden">
      <Link
        to="/"
        className={`flex flex-col items-center gap-1 transition-colors ${isActive("/") ? "text-primary font-semibold" : "text-base-content/60"
          }`}
      >
        <Search className="h-6 w-6" />
        <span className="text-[10px]">Explore</span>
      </Link>

      {isAuthenticated ? (
        <>
          <Link
            to="/my-reservations"
            className={`flex flex-col items-center gap-1 transition-colors ${isActive("/my-reservations") ? "text-primary font-semibold" : "text-base-content/60"
              }`}
          >
            <List className="h-6 w-6" />
            <span className="text-[10px]">Trips</span>
          </Link>
          <Link
            to="/my-notifications"
            className={`flex flex-col items-center gap-1 transition-colors relative ${isActive("/my-notifications") ? "text-primary font-semibold" : "text-base-content/60"
              }`}
          >
            <div className="relative">
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] text-error-content">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px]">Inbox</span>
          </Link>
          <Link
            to="/my-properties"
            className={`flex flex-col items-center gap-1 transition-colors ${isActive("/my-properties") ? "text-primary font-semibold" : "text-base-content/60"
              }`}
          >
            <Home className="h-6 w-6" />
            <span className="text-[10px]">My Stays</span>
          </Link>
        </>
      ) : (
        <Link
          to="/auth/login"
          className={`flex flex-col items-center gap-1 transition-colors ${isActive("/auth/login") ? "text-primary font-semibold" : "text-base-content/60"
            }`}
        >
          <User className="h-6 w-6" />
          <span className="text-[10px]">Log in</span>
        </Link>
      )}
    </nav>
  );
}

export default BottomNav;
