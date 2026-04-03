import { useState } from "react";
import { useLocation } from "wouter";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth";
import { useEvangelistDashboard } from "@/lib/api/dashboard";
import { useContacts } from "@/lib/contacts-context";
import { useTeams } from "@/lib/api/teams";

const statusBadgeClass = (status: string) => {
  const map: Record<string, string> = {
    "New": "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    "Needs Follow-up": "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    "Actively Discipling": "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    "Connected to Church": "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    "Not Interested": "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700 dark:bg-surface-container dark:text-on-surface-variant",
  };
  return map[status] ?? "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700 dark:bg-surface-container dark:text-on-surface-variant";
};
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Mock timeline feed — represents recent activity
const ACTIVITY_FEED = [
  {
    id: 1,
    type: "Soul Saved",
    dotClass: "timeline-dot-amber",
    ringClass: "ring-primary-container/20",
    badgeClass: "bg-secondary-container text-on-secondary-container",
    title: "Outreach at Westlands Shopping Centre",
    body: "Prayer session with a group of students. Two individuals, Brian and Mary, committed to joining the cell group and continuing follow-up.",
    meta: { time: "2 hours ago", location: "Westlands, Nairobi", extra: "3 photos" },
  },
  {
    id: 2,
    type: "Follow-up Logged",
    dotClass: "timeline-dot-yellow",
    ringClass: "ring-tertiary-fixed/20",
    badgeClass: "bg-surface-container text-on-surface-variant",
    title: "Home Visit: The Ochieng Family",
    body: "Second visit. Father showed more openness. Mother requested devotional materials for the children. Follow-up scheduled for next week.",
    note: "\"They are warming up significantly. Need to bring children's Bible storybooks next visit.\"",
    meta: { time: "Yesterday, 4:15 PM", location: "Kibera, Nairobi" },
  },
  {
    id: 3,
    type: "Public Reach",
    dotClass: "timeline-dot-slate",
    ringClass: "ring-secondary/20",
    badgeClass: "bg-surface-container text-on-surface-variant",
    title: "Street Evangelism: University Way",
    body: "Distributed 120 tracts, engaged in 11 personal conversations. 4 contacts added for digital follow-up via WhatsApp.",
    meta: { time: "Mon, Mar 18", location: "CBD, Nairobi" },
  },
];

export default function EvangelistDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { theme, setTheme } = useTheme();
  const { data: dashboard } = useEvangelistDashboard();
  const { contacts: myContacts } = useContacts();
  const { data: teams = [] } = useTeams();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Compatibility shim — keep the same "me" and "myTeam" variable names used throughout
  const me = {
    name: user?.full_name ?? "",
    location: user?.location ?? "",
    savedCount: dashboard?.saved_count ?? 0,
    totalContacts: dashboard?.total_contacts ?? 0,
    thisWeekContacts: dashboard?.this_week_contacts ?? 0,
    thisMonthContacts: dashboard?.this_month_contacts ?? 0,
    followUpPending: dashboard?.follow_up_pending ?? 0,
    connectedToChurch: dashboard?.connected_to_church ?? 0,
  };
  const myTeam = teams[0] ?? null;
  const weeklyData = dashboard?.weekly_trend ?? DAYS.map((day) => ({ day, contacts: 0 }));
  const statuses = ["All", "New", "Needs Follow-up", "Actively Discipling", "Connected to Church", "Not Interested"];

  const filtered = myContacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.fullName.toLowerCase().includes(q) || c.location.toLowerCase().includes(q)) &&
      (statusFilter === "All" || c.status === statusFilter)
    );
  });

  return (
    <div className="space-y-10 animate-fade-up">

      {/* Page Header */}
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
              {myTeam?.name} · {myTeam?.zone}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter leading-none mb-5">
              Activity Monitor
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-primary-container p-0.5 bg-surface-container-high flex items-center justify-center text-sm font-black text-on-surface-variant">
                {me.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className="font-bold text-lg leading-tight text-on-surface">{me.name}</p>
                <p className="text-sm text-secondary font-medium">{me.location}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap items-center">
            {/* Dark / Light mode toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative inline-flex items-center w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none border border-outline-variant/30"
              style={{ background: theme === "dark" ? "#fca21e" : "#e1e3e3" }}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span
                className="absolute flex items-center justify-center w-5 h-5 rounded-full bg-surface-container-lowest shadow transition-transform duration-300"
                style={{ transform: theme === "dark" ? "translateX(32px)" : "translateX(4px)" }}
              >
                <span className="material-symbols-outlined text-[14px] text-on-surface">
                  {theme === "dark" ? "dark_mode" : "light_mode"}
                </span>
              </span>
            </button>
            <button className="btn-outline text-sm py-2.5 px-5">Export PDF</button>
            <button
              className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2"
              onClick={() => navigate("/contacts/new")}
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              New Contact
            </button>
          </div>
        </div>
      </header>

      {/* Bento Metric Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Souls Saved */}
        <div className="metric-card metric-card-amber group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <span className="material-symbols-outlined text-9xl">auto_awesome</span>
          </div>
          <p className="sp-label mb-4">Total Souls Saved</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-black text-on-surface">{me.savedCount}</h3>
            <span className="text-primary font-bold text-sm">+8%</span>
          </div>
          <p className="text-sm text-secondary/70 mt-4 leading-relaxed">
            Top performer in {myTeam?.name} this month.
          </p>
        </div>

        {/* Total Reached */}
        <div className="metric-card metric-card-slate group">
          <p className="sp-label mb-4">Total Reached</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-black text-on-surface">{me.totalContacts}</h3>
            <span className="text-primary font-bold text-sm">+{me.thisWeekContacts} wk</span>
          </div>
          <div className="mt-6 h-1 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-secondary" style={{ width: `${Math.min((me.totalContacts / 150) * 100, 100)}%` }} />
          </div>
          <p className="text-sm text-secondary/70 mt-4">Progress towards monthly reach goal of 150.</p>
        </div>

        {/* Pending Follow-ups */}
        <div className="metric-card metric-card-yellow group">
          <p className="sp-label mb-4">Pending Follow-ups</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-black text-on-surface">{me.followUpPending}</h3>
            <span className={`font-bold text-sm ${me.followUpPending > 8 ? "text-error" : "text-secondary"}`}>
              {me.followUpPending > 8 ? "Critical" : "On track"}
            </span>
          </div>
          <div className="mt-6 flex -space-x-2">
            {myContacts.slice(0, 3).map((c, i) => (
              <div key={c.id} className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                {c.fullName[0]}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full bg-surface-container border-2 border-surface-container-lowest flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
              +{Math.max(me.followUpPending - 3, 0)}
            </div>
          </div>
          <p className="text-sm text-secondary/70 mt-4">Scheduled for follow-up this week.</p>
        </div>
      </section>

      {/* Weekly Activity Chart */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-8 shadow-sm">
          <p className="sp-label mb-1">This Week</p>
          <h3 className="text-2xl font-black text-on-surface tracking-tight mb-6">Daily Activity</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e8e8" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 700, fill: "#5a5c5c" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5a5c5c" }} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "#f0f1f1" }}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 16px rgba(131,80,0,0.12)", fontSize: 12, fontWeight: 600 }}
                />
                <Bar dataKey="contacts" fill="#fca21e" radius={[4, 4, 0, 0]} name="Contacts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm flex flex-col gap-4">
          <div>
            <p className="sp-label mb-0.5">This Month</p>
            <h3 className="text-2xl font-black text-on-surface tracking-tight">Progress</h3>
          </div>
          <div className="space-y-5 flex-1">
            {[
              { label: "Contacts Made", val: me.thisMonthContacts, max: 50, color: "#fca21e" },
              { label: "Saved", val: me.savedCount, max: me.totalContacts, color: "#835000" },
              { label: "Connected to Church", val: me.connectedToChurch, max: me.savedCount, color: "#515d69" },
            ].map(({ label, val, max, color }) => (
              <div key={label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-semibold text-secondary">{label}</span>
                  <span className="text-xs font-bold text-on-surface">{val}</span>
                </div>
                <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min((val / max) * 100, 100)}%`, backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-outline-variant/20">
            <p className="text-xs text-secondary">
              Salvation rate: <span className="font-black text-on-surface">
                {Math.round((me.savedCount / me.totalContacts) * 100)}%
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Activity Feed */}
      <section className="max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-on-surface tracking-tight">Recent Activity Feed</h3>
          <div className="flex gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-container" />
            <span className="w-2 h-2 rounded-full bg-outline-variant/30" />
          </div>
        </div>

        <div className="space-y-0 relative">
          {/* Vertical timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-outline-variant/20" />

          {ACTIVITY_FEED.map((item, i) => (
            <div key={item.id} className={`relative pl-16 ${i < ACTIVITY_FEED.length - 1 ? "pb-12" : ""} group`}>
              <div className={`absolute left-4 top-2 w-4 h-4 rounded-full border-4 border-surface ${item.dotClass} ring-2 ${item.ringClass} group-hover:scale-125 transition-transform duration-300`} />
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-1 rounded ${item.badgeClass}`}>
                    {item.type}
                  </span>
                  <span className="text-xs text-secondary/60">{item.meta.time}</span>
                </div>
                <h4 className="font-bold text-on-surface mb-2">{item.title}</h4>
                <p className="text-sm text-secondary leading-relaxed">{item.body}</p>
                {item.note && (
                  <div className="mt-4 p-3 bg-surface-container-low rounded-md border-l-2 border-primary">
                    <p className="text-[11px] italic text-on-surface-variant">{item.note}</p>
                  </div>
                )}
                <div className="mt-4 flex gap-4 text-[10px] font-bold text-primary uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {item.meta.location}
                  </span>
                  {item.meta.extra && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">attachment</span>
                      {item.meta.extra}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-12 py-4 border-2 border-dashed border-outline-variant/30 text-secondary font-bold text-sm rounded-xl hover:bg-surface-container transition-colors">
          View Older Activity
        </button>
      </section>

      {/* My Contacts */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-on-surface tracking-tight">My Contacts</h3>
          <div className="flex gap-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[16px]">search</span>
              <input
                className="field-input pl-9 text-xs h-9 w-44"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="field-input text-xs h-9 w-auto pr-6 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-secondary/50">
              <span className="material-symbols-outlined text-5xl mb-3">manage_search</span>
              <p className="text-sm font-semibold">No contacts found</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/10">
              {filtered.map((c) => (
                <div key={c.id} className="flex items-center gap-4 px-6 py-4 hover:bg-surface-container-low transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-primary-container/15 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
                    {c.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-on-surface">{c.fullName}</p>
                      <span className={statusBadgeClass(c.status)}>{c.status}</span>
                    </div>
                    <p className="text-xs text-secondary mt-0.5">
                      <span className="material-symbols-outlined text-[12px] mr-0.5 align-middle">location_on</span>
                      {c.location}{c.institution && ` · ${c.institution}`}
                    </p>
                  </div>
                  <div className="hidden md:flex flex-col items-end gap-0.5 text-xs text-secondary/70">
                    <span>{c.followUpMethod}</span>
                    <span>{new Date(c.createdAt).toLocaleDateString("en-KE", { month: "short", day: "numeric" })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="px-6 py-3 bg-surface-container-low/50 border-t border-outline-variant/10">
            <p className="text-xs text-secondary">{filtered.length} of {myContacts.length} contacts</p>
          </div>
        </div>
      </section>
    </div>
  );
}
