import { createContext, useContext, useState, ReactNode } from "react";
import { useLocation } from "wouter";

type UserRole = "admin" | "pastor" | "evangelist" | "data_collector";

interface User {
  id: string;
  username: string;
  role: UserRole;
}

interface InternalUser extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const DEFAULT_USERS: InternalUser[] = [
  { id: "1", username: "admin", password: "admin123", role: "admin" },
  { id: "2", username: "pastor", password: "pastor123", role: "pastor" },
  { id: "3", username: "evangelist", password: "evangelist123", role: "evangelist" },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<InternalUser[]>(DEFAULT_USERS);
  const [, setLocation] = useLocation();

  const login = async (username: string, password: string) => {
    const found = users.find(
      (u) => u.username === username && u.password === password,
    );

    if (!found) {
      throw new Error("Invalid credentials");
    }

    setUser({ id: found.id, username: found.username, role: found.role });
    setLocation("/");
  };

  const signup = async (username: string, password: string, role: UserRole) => {
    const existing = users.find((u) => u.username === username);
    if (existing) {
      throw new Error("Username already exists");
    }

    const newUser: InternalUser = {
      id: Math.random().toString(36).slice(2),
      username,
      password,
      role,
    };

    setUsers((prev) => [...prev, newUser]);
    setUser({ id: newUser.id, username: newUser.username, role: newUser.role });
    setLocation("/");
  };

  const logout = () => {
    setUser(null);
    setLocation("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
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
