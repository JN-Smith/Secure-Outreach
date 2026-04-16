import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../queryClient";

export interface FollowUpLog {
  id: string;
  contact_id: string;
  created_by: string;
  date: string;
  method: string;
  outcome: string;
  notes: string | null;
  new_status: string | null;
  created_at: string;
  contact_name: string | null;
  evangelist_name: string | null;
}

export interface FollowUpLogCreate {
  contact_id: string;
  date: string;
  method: string;
  outcome: string;
  notes?: string;
  new_status?: string;
}

export function useMyFollowUps() {
  return useQuery<FollowUpLog[]>({
    queryKey: ["/api/followups"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/followups");
      return res.json();
    },
  });
}

export function useContactFollowUps(contactId: string) {
  return useQuery<FollowUpLog[]>({
    queryKey: ["/api/followups/contact", contactId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/followups/contact/${contactId}`);
      return res.json();
    },
    enabled: !!contactId,
  });
}

export function useLogFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: FollowUpLogCreate) => {
      const res = await apiRequest("POST", "/api/followups", data);
      return res.json() as Promise<FollowUpLog>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/followups"] });
      qc.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
  });
}
