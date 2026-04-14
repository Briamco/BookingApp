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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user_data");

    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }

    setIsLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user_data", JSON.stringify(userData));
    setUser(userData);
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