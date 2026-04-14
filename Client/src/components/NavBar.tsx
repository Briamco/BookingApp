import { Link } from "react-router";
import LoginButton from "./auth/LoginButton";

function NavBar() {
  return (
    <nav className="navbar bg-base-100 shadow-sm px-4">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl">BookingApp</Link>
      </div>
      <div className="navbar-end">
        <LoginButton />
      </div>
    </nav>
  );
}

export default NavBar;