import { useState } from "react";
import {
  MOCK_STATS,
  MOCK_EVANGELISTS,
  MOCK_TEAMS,
  MOCK_CONTACTS,
  MOCK_WEEKLY_TRENDS,
  getPipelineSummary,
  getEvangelist,
  statusBadgeClass,
} from "@/lib/mock-data";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Tab = "overview" | "evangelists" | "teams" | "contacts";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [contactSearch, setContactSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showNewEvForm, setShowNewEvForm] = useState(false);
  const [newEv, setNewEv] = useState({ name: "", email: "", phone: "", teamId: "t1", role: "member" });

  const pipeline = getPipelineSummary();
  const trendLast8 = MOCK_WEEKLY_TRENDS.slice(-8);
  const statuses = ["All", "New", "Needs Follow-up", "Actively Discipling", "Connected to Church", "Not Interested"];

  const filteredContacts = MOCK_CONTACTS.filter((c) => {
    const q = contactSearch.toLowerCase();
    return (
      (c.fullName.toLowerCase().includes(q) || c.location.toLowerCase().includes(q)) &&
      (statusFilter === "All" || c.status === statusFilter)
    );
  });

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "dashboard" },
    { key: "evangelists", label: "Evangelists", icon: "volunteer_activism" },
    { key: "teams", label: "Teams", icon: "groups" },
    { key: "contacts", label: "All Contacts", icon: "contacts" },
  ];

  return (
    <div className="space-y-10 animate-fade-up">

      {/* Page Header */}
      <header>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
              Admin Portal
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter leading-none">
              Dashboard
            </h2>
            <p className="text-secondary font-medium mt-2">Manifest Fellowship Kenya · Nairobi Outreach</p>
          </div>
          <div className="flex gap-3">
            <button className="btn-outline text-sm py-2.5 px-5">Export PDF</button>
            <button className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Full Report
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-container rounded-xl p-1 w-fit overflow-x-auto">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              tab === key
                ? "bg-primary-container text-on-primary-fixed shadow-sm"
                : "text-secondary hover:text-on-surface"
            }`}
          >
            <span className={`material-symbols-outlined text-[16px] ${tab === key ? "filled" : ""}`}>{icon}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div className="space-y-8">
          {/* Metric Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Total Reached", value: MOCK_STATS.totalReached, delta: "+42", icon: "diversity_3", accent: "metric-card-amber", deltaClass: "text-primary" },
              { label: "Saved All Time", value: MOCK_STATS.savedAllTime, delta: `+${MOCK_STATS.savedThisMonth} mo`, icon: "favorite", accent: "metric-card-slate", deltaClass: "text-primary" },
              { label: "Active Evangelists", value: MOCK_STATS.totalEvangelists, delta: `${MOCK_STATS.totalTeams} teams`, icon: "volunteer_activism", accent: "metric-card-yellow", deltaClass: "text-secondary" },
              { label: "Pending Follow-ups", value: MOCK_STATS.pendingFollowUps, delta: "Critical", icon: "pending_actions", accent: "metric-card-error", deltaClass: "text-error" },
            ].map(({ label, value, delta, icon, accent, deltaClass }) => (
              <div key={label} className={`metric-card ${accent} group`}>
                <div className="absolute -right-3 -bottom-3 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                  <span className="material-symbols-outlined text-8xl">{icon}</span>
                </div>
                <p className="sp-label mb-4">{label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-5xl font-black text-on-surface">{value}</h3>
                  <span className={`font-bold text-sm ${deltaClass}`}>{delta}</span>
                </div>
              </div>
            ))}
          </section>

          {/* Charts Row */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <p className="sp-label mb-1">12-Week Trend</p>
              <h3 className="text-2xl font-black text-on-surface tracking-tight mb-6">Outreach Growth</h3>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendLast8}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e8e8" />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fontWeight: 700, fill: "#5a5c5c" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#5a5c5c" }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 16px rgba(131,80,0,0.12)", fontSize: 12 }} />
                    <Line type="monotone" dataKey="contacts" stroke="#fca21e" strokeWidth={2.5} dot={{ r: 3, fill: "#fca21e" }} name="Contacts" />
                    <Line type="monotone" dataKey="saved" stroke="#515d69" strokeWidth={2} dot={false} strokeDasharray="5 3" name="Saved" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pipeline */}
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <p className="sp-label mb-1">Spiritual Journey</p>
              <h3 className="text-2xl font-black text-on-surface tracking-tight mb-6">Pipeline</h3>
              <div className="space-y-3.5">
                {pipeline.map(({ stage, count, color }) => {
                  const pct = Math.round((count / MOCK_CONTACTS.length) * 100);
                  return (
                    <div key={stage}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-semibold text-secondary">{stage}</span>
                        <span className="text-xs font-bold text-on-surface">{count}</span>
                      </div>
                      <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant/20">
                <p className="text-xs text-secondary">
                  Church connection rate: <span className="font-black text-on-surface">
                    {Math.round((pipeline.find(p => p.stage === "Connected")?.count ?? 0) / MOCK_CONTACTS.length * 100)}%
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* Team Performance */}
          <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
            <p className="sp-label mb-1">This Month</p>
            <h3 className="text-2xl font-black text-on-surface tracking-tight mb-6">Team Performance</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_TEAMS.map(t => ({ name: t.name.replace("Team ", ""), contacts: t.thisMonthContacts, saved: t.savedCount }))} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e8e8" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: "#5a5c5c" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#5a5c5c" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "none", fontSize: 12 }} />
                  <Bar dataKey="contacts" fill="#fca21e" radius={[4, 4, 0, 0]} barSize={28} name="Contacts" />
                  <Bar dataKey="saved" fill="#515d69" radius={[4, 4, 0, 0]} barSize={28} name="Saved" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      )}

      {/* ── EVANGELISTS ── */}
      {tab === "evangelists" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-secondary">{MOCK_EVANGELISTS.length} registered evangelists</p>
            <button
              onClick={() => setShowNewEvForm(!showNewEvForm)}
              className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Add Evangelist
            </button>
          </div>

          {showNewEvForm && (
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm animate-fade-up">
              <p className="text-sm font-black text-on-surface mb-6">Register New Evangelist</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { key: "name", label: "Full Name", placeholder: "Grace Achieng", type: "text" },
                  { key: "email", label: "Email", placeholder: "grace@manifest.ke", type: "email" },
                  { key: "phone", label: "Phone", placeholder: "+254 712 345 000", type: "tel" },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className="sp-label ml-0.5">{label}</label>
                    <input
                      type={type}
                      className="field-input"
                      placeholder={placeholder}
                      value={(newEv as any)[key]}
                      onChange={(e) => setNewEv(p => ({ ...p, [key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div className="flex flex-col gap-1.5">
                  <label className="sp-label ml-0.5">Team</label>
                  <select className="field-input cursor-pointer" value={newEv.teamId} onChange={e => setNewEv(p => ({ ...p, teamId: e.target.value }))}>
                    {MOCK_TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="sp-label ml-0.5">Role</label>
                  <select className="field-input cursor-pointer" value={newEv.role} onChange={e => setNewEv(p => ({ ...p, role: e.target.value }))}>
                    <option value="member">Member</option>
                    <option value="lead">Team Lead</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="btn-primary text-sm py-2.5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Save Evangelist
                </button>
                <button className="btn-outline text-sm py-2.5" onClick={() => setShowNewEvForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/15 bg-surface-container-low/50">
                  <th className="text-left px-6 py-3.5 sp-label">Evangelist</th>
                  <th className="text-left px-4 py-3.5 sp-label hidden md:table-cell">Team</th>
                  <th className="text-right px-4 py-3.5 sp-label">This Week</th>
                  <th className="text-right px-4 py-3.5 sp-label hidden lg:table-cell">Total</th>
                  <th className="text-right px-4 py-3.5 sp-label hidden lg:table-cell">Follow-ups</th>
                  <th className="text-left px-4 py-3.5 sp-label hidden md:table-cell">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {MOCK_EVANGELISTS.map((ev) => {
                  const team = MOCK_TEAMS.find(t => t.id === ev.teamId);
                  return (
                    <tr key={ev.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-container/15 flex items-center justify-center text-primary font-black text-xs">
                            {ev.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-on-surface">{ev.name}</p>
                            <p className="text-xs text-secondary hidden sm:block">{ev.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell text-secondary text-xs">{team?.name}</td>
                      <td className="px-4 py-4 text-right font-black text-primary">{ev.thisWeekContacts}</td>
                      <td className="px-4 py-4 text-right hidden lg:table-cell text-secondary">{ev.totalContacts}</td>
                      <td className="px-4 py-4 text-right hidden lg:table-cell">
                        <span className={`font-bold text-xs ${ev.followUpPending > 8 ? "text-error" : "text-secondary"}`}>{ev.followUpPending}</span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full ${
                          ev.teamRole === "lead"
                            ? "bg-primary-container/20 text-on-primary-container"
                            : "bg-surface-container text-on-surface-variant"
                        }`}>
                          {ev.teamRole === "lead" ? "Lead" : "Member"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TEAMS ── */}
      {tab === "teams" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-secondary">{MOCK_TEAMS.length} active teams across Nairobi</p>
            <button className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">group_add</span>
              Create Team
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_TEAMS.map((team) => {
              const lead = getEvangelist(team.leadEvangelistId);
              const members = MOCK_EVANGELISTS.filter(e => team.memberIds.includes(e.id));
              return (
                <div key={team.id} className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="sp-label mb-1">{team.zone}</p>
                      <h3 className="text-2xl font-black text-on-surface tracking-tight">{team.name}</h3>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {team.outreachDays.slice(0, 3).map(d => (
                        <span key={d} className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container text-secondary">{d}</span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { label: "This Month", val: team.thisMonthContacts },
                      { label: "Total", val: team.totalContacts },
                      { label: "Saved", val: team.savedCount },
                    ].map(({ label, val }) => (
                      <div key={label} className="bg-surface-container-low rounded-lg px-3 py-3 text-center">
                        <p className="text-2xl font-black text-on-surface">{val}</p>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-secondary mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="sp-label mb-3">Members ({members.length})</p>
                    {members.map(ev => (
                      <div key={ev.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary-container/15 flex items-center justify-center text-primary font-black text-[10px]">
                            {ev.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="text-sm font-semibold text-on-surface">{ev.name}</span>
                          {ev.teamRole === "lead" && (
                            <span className="text-[8px] font-black uppercase tracking-wider text-on-primary-container bg-primary-container/20 px-1.5 py-0.5 rounded-full">Lead</span>
                          )}
                        </div>
                        <span className="text-xs text-secondary">{ev.thisWeekContacts} this wk</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ALL CONTACTS ── */}
      {tab === "contacts" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[16px]">search</span>
              <input
                className="field-input pl-10"
                placeholder="Search name or location…"
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
              />
            </div>
            <select
              className="field-input sm:w-52 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-3.5 bg-surface-container-low/50 border-b border-outline-variant/10">
              <p className="sp-label">{filteredContacts.length} contacts</p>
            </div>
            {filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-secondary/50">
                <span className="material-symbols-outlined text-5xl mb-3">manage_search</span>
                <p className="text-sm font-semibold">No contacts found</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/10">
                {filteredContacts.map((c) => {
                  const ev = MOCK_EVANGELISTS.find(e => e.id === c.evangelistId);
                  return (
                    <div key={c.id} className="flex items-center gap-4 px-6 py-4 hover:bg-surface-container-low/50 transition-colors">
                      <div className="w-9 h-9 rounded-full bg-primary-container/15 flex items-center justify-center text-primary font-black text-xs flex-shrink-0">
                        {c.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-on-surface">{c.fullName}</p>
                          <span className={statusBadgeClass(c.status)}>{c.status}</span>
                        </div>
                        <p className="text-xs text-secondary">
                          {c.location}{ev && <> · <span className="font-semibold">{ev.name}</span></>}
                        </p>
                      </div>
                      <div className="hidden md:flex flex-col items-end gap-0.5 text-xs text-secondary/70">
                        <span>{c.followUpMethod}</span>
                        <span>{new Date(c.createdAt).toLocaleDateString("en-KE", { month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
