import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../queryClient";
import type { User } from "../auth";

export function useUsers(role?: string) {
  return useQuery<User[]>({
    queryKey: ["/api/users", role],
    queryFn: async () => {
      const url = role ? `/api/users?role=${role}` : "/api/users";
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
      const res = await apiRequest("POST", "/api/users", data);
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
