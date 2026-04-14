import { Link } from "react-router";
import { useUser } from "../../hooks/useUser";
import UserDropDown from "./UserDropDown";

function LoginButton() {
  const { user } = useUser();

  return (
    <>
      {user ? (
        <UserDropDown user={user} />
      ) : (
        <Link to="/auth/login" className="btn btn-primary">Login</Link>
      )}
    </>
  );
}

export default LoginButton;