import { usePastorDashboard } from "@/lib/api/dashboard";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PIPELINE_COLORS: Record<string, string> = {
  "New": "#fca21e",
  "Needs Follow-up": "#835000",
  "Actively Discipling": "#515d69",
  "Connected to Church": "#16a34a",
  "Not Interested": "#9ca3af",
};

export default function PastorDashboard() {
  const { data: dashboard } = usePastorDashboard();

  // Map API data to shapes used by existing UI
  const MOCK_STATS = {
    totalReached: dashboard?.total_reached ?? 0,
    savedAllTime: dashboard?.saved_all_time ?? 0,
    studentsReached: dashboard?.students_reached ?? 0,
    connectedToChurch: dashboard?.connected_to_church ?? 0,
    thisWeekContacts: 0,
  };

  const MOCK_WEEKLY_TRENDS = (dashboard?.weekly_trends ?? []).map(t => ({
    week: new Date(t.week).toLocaleDateString("en-KE", { month: "short", day: "numeric" }),
    contacts: t.contacts,
    saved: t.saved,
    students: 0,
  }));

  const pipeline = (dashboard?.pipeline ?? []).map(p => ({
    stage: p.status,
    count: p.count,
    color: PIPELINE_COLORS[p.status] ?? "#9ca3af",
  }));

  const totalInPipeline = pipeline.reduce((a, p) => a + p.count, 0);
  const connectedPct = Math.round(
    ((pipeline.find(p => p.stage === "Connected to Church")?.count ?? 0) / Math.max(MOCK_STATS.totalReached, 1)) * 100
  );
  const savedPct = Math.round((MOCK_STATS.savedAllTime / Math.max(MOCK_STATS.totalReached, 1)) * 100);

  const teamPerf = (dashboard?.team_performance ?? []).map(t => ({
    name: t.team_name.replace("Team ", ""),
    contacts: t.contacts,
    saved: t.saved,
    rate: Math.round((t.saved / Math.max(t.contacts, 1)) * 100),
  }));

  // Map top evangelists and recent sessions for the UI sections below
  const MOCK_EVANGELISTS = (dashboard?.top_evangelists ?? []).map(e => ({
    id: e.user_id,
    name: e.full_name,
    thisMonthContacts: e.contacts,
    savedCount: e.saved,
    teamId: "",
  }));

  const MOCK_SESSIONS = (dashboard?.recent_sessions ?? []).map(s => ({
    id: s.id,
    location: s.location,
    date: s.date,
    contactsMade: s.contacts_made,
    savedCount: s.saved_count,
    prayerCount: 0,
    teamId: "",
  }));

  // Map team performance for the team list section
  const MOCK_TEAMS = (dashboard?.team_performance ?? []).map(t => ({
    id: t.team_id,
    name: t.team_name,
    zone: "",
    savedCount: t.saved,
    totalContacts: t.contacts,
    thisMonthContacts: t.contacts,
    leadEvangelistId: "",
    activeZones: [] as string[],
  }));

  const getEvangelist = (_id: string): { name: string } | null => null;

  return (
    <div className="space-y-10 animate-fade-up">

      {/* Page Header */}
      <header>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
              Ministry Overview
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter leading-none">
              Pastor's Report
            </h2>
            <p className="text-secondary font-medium mt-2">Manifest Fellowship Kenya · Nairobi Region · March 2026</p>
          </div>
          <div className="flex gap-3">
            <button className="btn-outline text-sm py-2.5 px-5">Export PDF</button>
            <button className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">present_to_all</span>
              Present
            </button>
          </div>
        </div>
      </header>

      {/* Top Metric Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Reached",
            value: MOCK_STATS.totalReached.toLocaleString(),
            delta: `+${MOCK_STATS.thisWeekContacts} this wk`,
            accent: "metric-card-amber",
            icon: "diversity_3",
          },
          {
            label: "Saved All Time",
            value: MOCK_STATS.savedAllTime,
            delta: `${savedPct}% rate`,
            accent: "metric-card-slate",
            icon: "favorite",
          },
          {
            label: "Students Reached",
            value: MOCK_STATS.studentsReached,
            delta: "campus outreach",
            accent: "metric-card-yellow",
            icon: "school",
          },
          {
            label: "Church Connected",
            value: MOCK_STATS.connectedToChurch,
            delta: `${connectedPct}% conversion`,
            accent: "metric-card-amber",
            icon: "church",
          },
        ].map(({ label, value, delta, accent, icon }) => (
          <div key={label} className={`metric-card ${accent} group`}>
            <div className="absolute -right-3 -bottom-3 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
              <span className="material-symbols-outlined text-8xl">{icon}</span>
            </div>
            <p className="sp-label mb-4">{label}</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="text-4xl lg:text-5xl font-black text-on-surface">{value}</h3>
            </div>
            <p className="text-sm text-secondary/70 mt-3">{delta}</p>
          </div>
        ))}
      </section>

      {/* Trend + Pipeline */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 12-week area chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-8 shadow-sm">
          <p className="sp-label mb-1">12-Week Growth</p>
          <h3 className="text-2xl font-black text-on-surface tracking-tight mb-6">Outreach Momentum</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_WEEKLY_TRENDS}>
                <defs>
                  <linearGradient id="gradContacts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fca21e" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#fca21e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradSaved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#515d69" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#515d69" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e8e8" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fontWeight: 700, fill: "#5a5c5c" }} tickLine={false} axisLine={false} interval={1} />
                <YAxis tick={{ fontSize: 10, fill: "#5a5c5c" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 16px rgba(131,80,0,0.12)", fontSize: 12 }} />
                <Area type="monotone" dataKey="contacts" stroke="#fca21e" strokeWidth={2.5} fill="url(#gradContacts)" name="Contacts" />
                <Area type="monotone" dataKey="saved" stroke="#515d69" strokeWidth={2} fill="url(#gradSaved)" name="Saved" strokeDasharray="5 3" />
                <Area type="monotone" dataKey="students" stroke="#835000" strokeWidth={1.5} fill="none" name="Students" strokeDasharray="2 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-5 mt-3 text-xs text-secondary">
            <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-[#fca21e] inline-block rounded" />Contacts</span>
            <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-[#515d69] inline-block rounded" />Saved</span>
            <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-[#835000] inline-block rounded" />Students</span>
          </div>
        </div>

        {/* Pipeline */}
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
          <p className="sp-label mb-1">Spiritual Journey</p>
          <h3 className="text-2xl font-black text-on-surface tracking-tight mb-6">Pipeline</h3>
          <div className="space-y-4">
            {pipeline.map(({ stage, count, color }) => {
              const pct = Math.round((count / totalInPipeline) * 100);
              return (
                <div key={stage}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-semibold text-secondary">{stage}</span>
                    <span className="text-xs font-bold text-on-surface">{count} <span className="text-secondary font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-5 border-t border-outline-variant/20 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-3xl font-black text-on-surface">{savedPct}%</p>
              <p className="sp-label mt-0.5">Salvation Rate</p>
            </div>
            <div>
              <p className="text-3xl font-black text-on-surface">{connectedPct}%</p>
              <p className="sp-label mt-0.5">Church Connected</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Comparison */}
      <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
        <p className="sp-label mb-1">By Zone</p>
        <h3 className="text-2xl font-black text-on-surface tracking-tight mb-8">Team Performance</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamPerf} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e8e8" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: "#5a5c5c" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5a5c5c" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", fontSize: 12 }} />
                <Bar dataKey="contacts" fill="#fca21e" radius={[4, 4, 0, 0]} barSize={24} name="Contacts (month)" />
                <Bar dataKey="saved" fill="#515d69" radius={[4, 4, 0, 0]} barSize={24} name="Saved (all time)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {MOCK_TEAMS.map((team) => {
              const lead = getEvangelist(team.leadEvangelistId);
              const rate = Math.round((team.savedCount / team.totalContacts) * 100);
              return (
                <div key={team.id}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-on-surface">{team.name}</p>
                    <span className="text-xs font-black text-primary">{rate}% saved</span>
                  </div>
                  <p className="text-xs text-secondary mb-1.5">Lead: {lead?.name} · {team.zone}</p>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary-container" style={{ width: `${rate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sessions + Top Evangelists */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-outline-variant/10 bg-surface-container-low/30">
            <p className="sp-label mb-0.5">Recent Activity</p>
            <h3 className="text-base font-black text-on-surface">Outreach Sessions</h3>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {MOCK_SESSIONS.slice(0, 6).map((s) => {
              const team = MOCK_TEAMS.find(t => t.id === s.teamId);
              return (
                <div key={s.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">{s.location}</p>
                    <p className="text-xs text-secondary">{team?.name} · {new Date(s.date).toLocaleDateString("en-KE", { weekday: "short", month: "short", day: "numeric" })}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs flex-shrink-0">
                    <div className="text-center">
                      <p className="font-black text-primary">{s.contactsMade}</p>
                      <p className="text-secondary/70">contacts</p>
                    </div>
                    <div className="text-center">
                      <p className="font-black text-emerald-600">{s.savedCount}</p>
                      <p className="text-secondary/70">saved</p>
                    </div>
                    <div className="text-center">
                      <p className="font-black text-blue-600">{s.prayerCount}</p>
                      <p className="text-secondary/70">prayed</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-outline-variant/10 bg-surface-container-low/30">
            <p className="sp-label mb-0.5">This Month</p>
            <h3 className="text-base font-black text-on-surface">Top Evangelists</h3>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {[...MOCK_EVANGELISTS]
              .sort((a, b) => b.thisMonthContacts - a.thisMonthContacts)
              .slice(0, 6)
              .map((ev, i) => (
                <div key={ev.id} className="px-6 py-3.5 flex items-center gap-4">
                  <span className={`text-xs font-black w-5 text-center ${i < 3 ? "text-primary" : "text-outline"}`}>
                    #{i + 1}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-primary-container/15 flex items-center justify-center text-primary font-black text-xs flex-shrink-0">
                    {ev.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">{ev.name}</p>
                    <p className="text-xs text-secondary">{MOCK_TEAMS.find(t => t.id === ev.teamId)?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary">{ev.thisMonthContacts}</p>
                    <p className="text-xs text-secondary/70">this month</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Zones */}
      <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
        <p className="sp-label mb-4">Zone Coverage</p>
        <h3 className="text-2xl font-black text-on-surface tracking-tight mb-6">Active Outreach Zones</h3>
        <div className="flex flex-wrap gap-3">
          {MOCK_TEAMS.flatMap(t => t.activeZones.map(z => ({ zone: z, team: t.name }))).map(({ zone, team }) => (
            <div key={zone} className="flex items-center gap-2 bg-surface-container-low rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
              <div>
                <p className="text-sm font-bold text-on-surface">{zone}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-secondary">{team}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
