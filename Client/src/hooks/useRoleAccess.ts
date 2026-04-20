import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useProperty } from "./useProperty";

export const useRoleAccess = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { properties, isLoading: isPropertiesLoading } = useProperty();

  const hasHostAccess = useMemo(() => {
    if (!user) return false;

    const currentUserId = user.id.toLowerCase();
    return properties.some((property) => property.hostId.toLowerCase() === currentUserId);
  }, [properties, user]);

  return {
    isAuthenticated,
    isAuthLoading,
    isPropertiesLoading,
    hasHostAccess,
  };
};