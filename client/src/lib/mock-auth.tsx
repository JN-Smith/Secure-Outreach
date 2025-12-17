import { createContext, useContext, useState, ReactNode } from "react";
import { useLocation } from "wouter";

type UserRole = "admin" | "pastor" | "worker";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();

  const login = (email: string, role: UserRole) => {
    // Mock login
    setUser({
      id: "1",
      name: email.split("@")[0],
      email,
      role,
    });
    setLocation("/");
  };

  const logout = () => {
    setUser(null);
    setLocation("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
