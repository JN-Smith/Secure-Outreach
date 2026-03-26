import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../queryClient";

export interface OutreachSession {
  id: string;
  date: string;
  team_id: string;
  location: string;
  evangelists_present: number;
  contacts_made: number;
  saved_count: number;
  prayer_count: number;
  notes?: string;
  created_by: string;
  created_at: string;
}

export function useOutreachSessions(filters?: { team_id?: string; date_from?: string; date_to?: string }) {
  return useQuery<OutreachSession[]>({
    queryKey: ["/api/outreach-sessions", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.team_id) params.set("team_id", filters.team_id);
      if (filters?.date_from) params.set("date_from", filters.date_from);
      if (filters?.date_to) params.set("date_to", filters.date_to);
      const qs = params.toString();
      const res = await apiRequest("GET", `/api/outreach-sessions${qs ? `?${qs}` : ""}`);
      return res.json();
    },
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      date: string;
      team_id: string;
      location: string;
      evangelists_present?: number;
      contacts_made?: number;
      saved_count?: number;
      prayer_count?: number;
      notes?: string;
    }) => {
      const res = await apiRequest("POST", "/api/outreach-sessions", data);
      return res.json() as Promise<OutreachSession>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/outreach-sessions"] }),
  });
}
