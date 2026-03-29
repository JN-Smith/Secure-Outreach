import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../queryClient";
import type { User } from "../auth";

export function useUsers(role?: string) {
  return useQuery<User[]>({
    queryKey: ["/api/users", role],
    queryFn: async () => {
      const url = role ? `/api/users/?role=${role}` : "/api/users/";
      const res = await apiRequest("GET", url);
      return res.json();
    },
  });
}

export function useUser(id: string) {
  return useQuery<User>({
    queryKey: ["/api/users", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/users/${id}`);
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      role: string;
      full_name: string;
      phone?: string;
      location?: string;
    }) => {
      const res = await apiRequest("POST", "/api/users/", data);
      return res.json() as Promise<User>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/users"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: string; full_name?: string; phone?: string; location?: string; is_active?: boolean }) => {
      const res = await apiRequest("PATCH", `/api/users/${id}`, data);
      return res.json() as Promise<User>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/users"] }),
  });
}

export interface InviteResult {
  user: User;
  token: string;
}

export function useInviteEvangelist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { full_name: string; email: string; phone?: string; role?: string }) => {
      const res = await apiRequest("POST", "/api/auth/invite", data);
      return res.json() as Promise<InviteResult>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/users"] }),
  });
}

export function useGetInviteInfo(token: string) {
  return useQuery<{ email: string; full_name: string }>({
    queryKey: ["/api/auth/invite", token],
    queryFn: async () => {
      const res = await fetch(`/api/auth/invite/${token}`);
      if (!res.ok) throw new Error("Invalid invite link");
      return res.json();
    },
    enabled: !!token,
    retry: false,
  });
}

export function useAcceptInvite() {
  return useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const res = await fetch("/api/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to accept invite");
      return res.json() as Promise<{ access_token: string; user: User }>;
    },
  });
}

export interface EvangelistKPI {
  user_id: string;
  full_name: string;
  email: string;
  team_name: string | null;
  contacts_total: number;
  contacts_this_week: number;
  followups_done: number;
  followups_pending: number;
  converted: number;
  last_login_at: string | null;
  login_count: number;
  invite_pending: boolean;
}

export function useEvangelistAnalytics() {
  return useQuery<EvangelistKPI[]>({
    queryKey: ["/api/dashboard/evangelist-analytics"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/dashboard/evangelist-analytics/");
      return res.json();
    },
  });
}
