import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../queryClient";

export interface Team {
  id: string;
  name: string;
  zone: string;
  lead_evangelist_id: string | null;
  outreach_days: string[];
  active_zones: string[];
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  team_role: string;
  created_at: string;
}

export function useTeams() {
  return useQuery<Team[]>({
    queryKey: ["/api/teams"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/teams/");
      return res.json();
    },
  });
}

export function useTeam(id: string) {
  return useQuery<Team>({
    queryKey: ["/api/teams", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/teams/${id}`);
      return res.json();
    },
    enabled: !!id,
  });
}

export function useTeamMembers(teamId: string) {
  return useQuery<TeamMember[]>({
    queryKey: ["/api/teams", teamId, "members"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/teams/${teamId}/members`);
      return res.json();
    },
    enabled: !!teamId,
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      zone: string;
      lead_evangelist_id?: string;
      outreach_days?: string[];
      active_zones?: string[];
    }) => {
      const res = await apiRequest("POST", "/api/teams/", data);
      return res.json() as Promise<Team>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/teams"] }),
  });
}

export function useAddTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, userId, teamRole = "member" }: { teamId: string; userId: string; teamRole?: string }) => {
      const res = await apiRequest("POST", `/api/teams/${teamId}/members`, {
        user_id: userId,
        team_role: teamRole,
      });
      return res.json() as Promise<TeamMember>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/teams"] }),
  });
}

export function useRemoveTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      await apiRequest("DELETE", `/api/teams/${teamId}/members/${userId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/teams"] }),
  });
}
