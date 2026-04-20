import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useRoleAccess } from "../../hooks/useRoleAccess";

type RequiredAccess = "authenticated" | "host";

interface ProtectedRouteProps {
  requiredAccess?: RequiredAccess;
}

function ProtectedRoute({ requiredAccess = "authenticated" }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasHostAccess, isPropertiesLoading } = useRoleAccess();
  const location = useLocation();
  const { addToast } = useToast();
  const hasShownToastRef = useRef(false);

  const hasRequiredAccess = requiredAccess === "host" ? hasHostAccess : isAuthenticated;
  const redirectPath = requiredAccess === "host" ? "/" : "/auth/login";
  const toastMessage = requiredAccess === "host"
    ? "Host access is required to open this page"
    : "Need to be logged in to access this page";

  useEffect(() => {
    if (isLoading || isPropertiesLoading || hasRequiredAccess) {
      hasShownToastRef.current = false;
      return;
    }

    if (!hasShownToastRef.current) {
      addToast("warning", toastMessage);
      hasShownToastRef.current = true;
    }
  }, [addToast, hasRequiredAccess, isLoading, isPropertiesLoading, toastMessage]);

  if (isLoading || isPropertiesLoading) {
    return null;
  }

  if (!hasRequiredAccess) {
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;