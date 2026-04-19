import { Link } from "react-router";
import { Bell } from "lucide-react";
import LoginButton from "./auth/LoginButton";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

function NavBar() {
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useNotification();

  return (
    <nav className="navbar bg-base-300 shadow-sm p-4">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl">BookingApp</Link>
      </div>
      <div className="navbar-end gap-2">
        {isAuthenticated && (
          <Link to="/my-notifications" className="btn btn-ghost btn-circle">
            <div className="indicator">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && <span className="indicator-item badge badge-primary badge-sm">{unreadCount}</span>}
            </div>
          </Link>
        )}
        <LoginButton />
      </div>
    </nav>
  );
}

export default NavBar;