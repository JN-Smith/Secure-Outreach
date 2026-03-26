import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../queryClient";

export interface DailyTrendPoint {
  day: string;
  contacts: number;
}

export interface WeeklyTrendPoint {
  week: string;
  contacts: number;
  saved: number;
}

export interface PipelineStage {
  status: string;
  count: number;
}

export interface TeamPerformance {
  team_id: string;
  team_name: string;
  contacts: number;
  saved: number;
}

export interface TopEvangelist {
  user_id: string;
  full_name: string;
  contacts: number;
  saved: number;
}

export interface RecentSession {
  id: string;
  date: string;
  location: string;
  contacts_made: number;
  saved_count: number;
}

export interface EvangelistDashboard {
  total_contacts: number;
  this_week_contacts: number;
  this_month_contacts: number;
  saved_count: number;
  follow_up_pending: number;
  connected_to_church: number;
  weekly_trend: DailyTrendPoint[];
}

export interface AdminDashboard {
  total_reached: number;
  saved_all_time: number;
  active_evangelists: number;
  follow_up_pending: number;
  weekly_trends: WeeklyTrendPoint[];
  pipeline: PipelineStage[];
  team_performance: TeamPerformance[];
}

export interface PastorDashboard {
  total_reached: number;
  saved_all_time: number;
  students_reached: number;
  connected_to_church: number;
  weekly_trends: WeeklyTrendPoint[];
  pipeline: PipelineStage[];
  team_performance: TeamPerformance[];
  top_evangelists: TopEvangelist[];
  recent_sessions: RecentSession[];
}

export function useEvangelistDashboard() {
  return useQuery<EvangelistDashboard>({
    queryKey: ["/api/dashboard/evangelist"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/dashboard/evangelist");
      return res.json();
    },
  });
}

export function useAdminDashboard() {
  return useQuery<AdminDashboard>({
    queryKey: ["/api/dashboard/admin"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/dashboard/admin");
      return res.json();
    },
  });
}

export function usePastorDashboard() {
  return useQuery<PastorDashboard>({
    queryKey: ["/api/dashboard/pastor"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/dashboard/pastor");
      return res.json();
    },
  });
}
