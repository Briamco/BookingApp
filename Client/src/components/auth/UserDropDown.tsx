import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import type { User } from "../../types";

interface UserDropDownProps {
  user: User;
}

function UserDropDown({ user }: UserDropDownProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    window.location.reload();
  }

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost">
        <h3 className="text-lg">Hello, {user.firstName}!</h3>
      </label>
      <ul
        tabIndex={0}
        className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
      >
        <li>
          <a className="justify-between">
            Profile
            <span className="badge badge-info">New</span>
          </a>
        </li>
        <li>
          <Link to="/my-properties">My Properties</Link>
        </li>
        <li>
          <Link to="/my-reservations">My Reservations</Link>
        </li>
        <li>
          <Link to="/my-notifications">My Notifications</Link>
        </li>
        <li>
          <button
            className="text-error"
            onClick={handleLogout}
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
}

export default UserDropDown;