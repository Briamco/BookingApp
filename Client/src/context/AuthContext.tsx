import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type JwtPayload = {
  sub?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  phone_number?: string;
  is_confirmed?: boolean | string;
  exp?: number;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = atob(padded);

    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

function parseBoolean(value: JwtPayload["is_confirmed"]): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return false;
}

function getUserFromToken(token: string): User | null {
  const payload = decodeJwtPayload(token);

  if (!payload?.sub || !payload.email) {
    return null;
  }

  return {
    id: payload.sub,
    firstName: payload.given_name || "",
    lastName: payload.family_name || "",
    email: payload.email,
    phone: payload.phone_number || "",
    isConfirmed: parseBoolean(payload.is_confirmed),
  };
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return false;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowInSeconds;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || isTokenExpired(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user_data");
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    const userFromToken = getUserFromToken(token);

    setIsAuthenticated(true);

    if (userFromToken) {
      setUser(userFromToken);
      localStorage.setItem("user_data", JSON.stringify(userFromToken));
    } else {
      const userData = localStorage.getItem("user_data");

      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch {
          localStorage.removeItem("user_data");
          setUser(null);
        }
      }
    }

    setIsLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    const userFromToken = getUserFromToken(token);
    const authenticatedUser = userFromToken ?? userData;

    localStorage.setItem("token", token);
    localStorage.setItem("user_data", JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_data");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");

  return context;
}