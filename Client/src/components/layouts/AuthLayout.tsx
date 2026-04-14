import { Outlet } from "react-router";

function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-300">
      <Outlet />
    </div>
  );
}

export default AuthLayout;