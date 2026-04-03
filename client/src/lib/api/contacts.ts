import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../queryClient";

export interface Contact {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  gender?: string;
  age_range?: string;
  born_again: string;
  discipleship_status: string;
  baptized: string;
  location: string;
  is_student: boolean;
  institution?: string;
  course?: string;
  follow_up_method: string;
  prayer_requests?: string;
  notes?: string;
  status: string;
  tags: string[];
  evangelist_id: string;
  evangelist_name?: string;
  team_id: string;
  created_at: string;
  updated_at: string;
}

export interface ContactFilters {
  status?: string;
  team_id?: string;
  evangelist_id?: string;
  search?: string;
  is_student?: boolean;
  page?: number;
  limit?: number;
}

function buildQuery(filters?: ContactFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useContacts(filters?: ContactFilters) {
  return useQuery<Contact[]>({
    queryKey: ["/api/contacts", filters],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/contacts${buildQuery(filters)}`);
      return res.json();
    },
  });
}

export function useContact(id: string) {
  return useQuery<Contact>({
    queryKey: ["/api/contacts", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/contacts/${id}`);
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Contact, "id" | "created_at" | "updated_at" | "evangelist_id" | "status">) => {
      const res = await apiRequest("POST", "/api/contacts", data);
      return res.json() as Promise<Contact>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/contacts"] }),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Contact> & { id: string }) => {
      const res = await apiRequest("PATCH", `/api/contacts/${id}`, data);
      return res.json() as Promise<Contact>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/contacts"] }),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/contacts/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/contacts"] }),
  });
}
