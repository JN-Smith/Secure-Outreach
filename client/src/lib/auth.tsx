import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiRequest } from "./queryClient";

export type UserRole = "pastor" | "admin" | "evangelist" | "data_collector";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  location: string | null;
  is_active?: boolean;
  invite_pending?: boolean;
  last_login_at?: string | null;
  login_count?: number;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: try to rehydrate session from persisted access token
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(async (res) => {
        if (res.ok) {
          setUser(await res.json());
        } else {
          // Try refresh
          const refreshRes = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
          });
          if (refreshRes.ok) {
            const { access_token } = await refreshRes.json();
            localStorage.setItem("access_token", access_token);
            const meRes = await fetch("/api/auth/me", {
              headers: { Authorization: `Bearer ${access_token}` },
              credentials: "include",
            });
            if (meRes.ok) setUser(await meRes.json());
            else localStorage.removeItem("access_token");
          } else {
            localStorage.removeItem("access_token");
          }
        }
      })
      .catch(() => localStorage.removeItem("access_token"))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const res = await apiRequest("POST", "/api/auth/login", { email, password });
    const data = await res.json();
    localStorage.setItem("access_token", data.access_token);
    setUser(data.user);
  }

  async function logout(): Promise<void> {
    try {
      await apiRequest("POST", "/api/auth/logout");
    } catch {
      // ignore errors on logout
    }
    localStorage.removeItem("access_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
