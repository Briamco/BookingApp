import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const { addToast } = useToast();
  const hasShownToastRef = useRef(false);

  useEffect(() => {
    if (isLoading || isAuthenticated) {
      hasShownToastRef.current = false;
      return;
    }

    if (!hasShownToastRef.current) {
      addToast("warning", "Need to be logged in to access this page");
      hasShownToastRef.current = true;
    }
  }, [addToast, isAuthenticated, isLoading]);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;