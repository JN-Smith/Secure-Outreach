import { createContext, useContext, useState, ReactNode } from "react";
import { useLocation } from "wouter";

type UserRole = "admin" | "pastor" | "evangelist" | "data_collector";

interface User {
  id: string;
  email: string;
  role: UserRole;
}

interface InternalUser extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const DEFAULT_USERS: InternalUser[] = [
  { id: "1", email: "admin@manifest.ke", password: "admin123", role: "admin" },
  { id: "2", email: "pastor@manifest.ke", password: "pastor123", role: "pastor" },
  { id: "3", email: "evangelist@manifest.ke", password: "evangelist123", role: "evangelist" },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();

  const login = async (email: string, password: string) => {
    const found = DEFAULT_USERS.find(
      (u) => u.email === email && u.password === password,
    );

    if (!found) {
      throw new Error("Invalid credentials");
    }

    setUser({ id: found.id, email: found.email, role: found.role });
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
