import { useState } from "react";
import { toast } from "sonner";
import { useAdminDashboard } from "@/lib/api/dashboard";
import { useUsers, useInviteEvangelist, useEvangelistAnalytics, type EvangelistKPI } from "@/lib/api/users";
import { useTeams } from "@/lib/api/teams";
import { useContacts } from "@/lib/contacts-context";
import { Copy, Check, Mail, AlertCircle } from "lucide-react";

const PIPELINE_COLORS: Record<string, string> = {
  "New": "#fca21e",
  "Needs Follow-up": "#835000",
  "Actively Discipling": "#515d69",
  "Connected to Church": "#16a34a",
  "Not Interested": "#9ca3af",
};

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "New": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    case "Needs Follow-up": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
    case "Actively Discipling": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    case "Connected to Church": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    default: return "bg-gray-100 text-gray-700 dark:bg-surface-container dark:text-on-surface-variant";
  }
};
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

type Tab = "overview" | "analytics" | "evangelists" | "teams" | "contacts";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-semibold transition-colors"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}

function formatLoginTime(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-KE", { day: "numeric", month: "short" });
}

function AnalyticsTab({ kpis }: { kpis: EvangelistKPI[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Evangelists", value: kpis.length, icon: "volunteer_activism", color: "text-amber-600" },
          { label: "Pending Setup", value: kpis.filter(k => k.invite_pending).length, icon: "pending", color: "text-orange-500" },
          { label: "Follow-ups Done", value: kpis.reduce((s, k) => s + k.followups_done, 0), icon: "check_circle", color: "text-green-600" },
          { label: "Converted", value: kpis.reduce((s, k) => s + k.converted, 0), icon: "church", color: "text-purple-600" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
            <span className={`material-symbols-outlined text-2xl ${color} mb-2 block`}>{icon}</span>
            <p className="text-3xl font-black text-on-surface">{value}</p>
            <p className="text-xs font-semibold text-secondary mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
        <div className="px-6 py-4 border-b border-outline-variant/10">
          <p className="text-sm font-black text-on-surface">Evangelist Activity Breakdown</p>
          <p className="text-xs text-secondary mt-0.5">Login activity, contacts, and follow-up progress per evangelist</p>
        </div>
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-surface-container-low/50 text-left">
              <th className="px-6 py-3 sp-label">Evangelist</th>
              <th className="px-4 py-3 sp-label">Team</th>
              <th className="px-4 py-3 sp-label text-right">This Week</th>
              <th className="px-4 py-3 sp-label text-right">Total</th>
              <th className="px-4 py-3 sp-label text-right">Follow-ups Done</th>
              <th className="px-4 py-3 sp-label text-right">Pending</th>
              <th className="px-4 py-3 sp-label text-right">Converted</th>
              <th className="px-4 py-3 sp-label">Last Login</th>
              <th className="px-4 py-3 sp-label text-right">Logins</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {kpis.map((k) => (
              <tr key={k.user_id} className="hover:bg-surface-container-low/40 transition-colors">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary-container/15 flex items-center justify-center text-primary font-black text-xs flex-shrink-0">
                      {k.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-on-surface text-sm">{k.full_name}</p>
                      {k.invite_pending && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-orange-500 flex items-center gap-0.5">
                          <AlertCircle className="h-2.5 w-2.5" /> Pending Setup
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-xs text-secondary">{k.team_name ?? "—"}</td>
                <td className="px-4 py-3.5 text-right font-black text-primary">{k.contacts_this_week}</td>
                <td className="px-4 py-3.5 text-right text-secondary">{k.contacts_total}</td>
                <td className="px-4 py-3.5 text-right font-semibold text-green-700">{k.followups_done}</td>
                <td className="px-4 py-3.5 text-right">
                  <span className={`font-bold text-xs ${k.followups_pending > 5 ? "text-error" : "text-secondary"}`}>
                    {k.followups_pending}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right font-semibold text-purple-700">{k.converted}</td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-semibold ${!k.last_login_at ? "text-secondary/50" : "text-on-surface"}`}>
                    {formatLoginTime(k.last_login_at)}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right text-xs text-secondary">{k.login_count}</td>
              </tr>
            ))}
            {kpis.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-10 text-center text-secondary text-sm">
                  No evangelists found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [contactSearch, setContactSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showNewEvForm, setShowNewEvForm] = useState(false);
  const [newEv, setNewEv] = useState({ name: "", email: "", phone: "", teamId: "", role: "evangelist" });
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const { data: dashboard } = useAdminDashboard();
  const { data: evangelists = [] } = useUsers("evangelist");
  const { data: teamsData = [] } = useTeams();
  const { contacts: allContacts } = useContacts();
  const inviteEvangelist = useInviteEvangelist();
  const { data: kpis = [] } = useEvangelistAnalytics();

  const MOCK_STATS = {
    totalReached: dashboard?.total_reached ?? 0,
    savedAllTime: dashboard?.saved_all_time ?? 0,
    savedThisMonth: 0,
    activeEvangelists: dashboard?.active_evangelists ?? 0,
    totalEvangelists: dashboard?.active_evangelists ?? 0,
    totalTeams: teamsData.length,
    followUpPending: dashboard?.follow_up_pending ?? 0,
    pendingFollowUps: dashboard?.follow_up_pending ?? 0,
  };

  const MOCK_WEEKLY_TRENDS = (dashboard?.weekly_trends ?? []).map(t => ({
    week: new Date(t.week).toLocaleDateString("en-KE", { month: "short", day: "numeric" }),
    contacts: t.contacts,
    saved: t.saved,
  }));

  const pipeline = (dashboard?.pipeline ?? []).map(p => ({
    stage: p.status,
    count: p.count,
    color: PIPELINE_COLORS[p.status] ?? "#9ca3af",
  }));

  const MOCK_EVANGELISTS = evangelists.map(e => ({
    id: e.id,
    name: e.full_name,
    email: e.email,
    phone: e.phone ?? "",
    location: e.location ?? "",
    teamId: "",
    teamRole: "member",
  }));

  const MOCK_TEAMS = teamsData.map(t => ({
    id: t.id,
    name: t.name,
    zone: t.zone,
    memberIds: [] as string[],
    outreachDays: t.outreach_days,
    leadEvangelistId: t.lead_evangelist_id ?? "",
    thisMonthContacts: 0,
    totalContacts: 0,
    savedCount: 0,
  }));

  const getEvangelist = (id: string) => evangelists.find(e => e.id === id);
  const MOCK_CONTACTS = allContacts;
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
    { key: "analytics", label: "Analytics", icon: "bar_chart_4_bars" },
    { key: "evangelists", label: "Evangelists", icon: "volunteer_activism" },
    { key: "teams", label: "Teams", icon: "groups" },
    { key: "contacts", label: "All Contacts", icon: "contacts" },
  ];

  function handleSendInvite() {
    if (!newEv.email || !newEv.name) {
      toast.error("Name and email are required");
      return;
    }
    inviteEvangelist.mutate(
      { full_name: newEv.name, email: newEv.email, phone: newEv.phone || undefined, role: newEv.role || "evangelist" },
      {
        onSuccess: (data) => {
          const url = `${window.location.origin}/accept-invite?token=${data.token}`;
          setInviteLink(url);
          setNewEv({ name: "", email: "", phone: "", teamId: "", role: "evangelist" });
          toast.success("Evangelist invited — share the link below");
        },
        onError: () => toast.error("Failed to create invite"),
      },
    );
  }

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

            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <p className="sp-label mb-1">Spiritual Journey</p>
              <h3 className="text-2xl font-black text-on-surface tracking-tight mb-6">Pipeline</h3>
              <div className="space-y-3.5">
                {pipeline.map(({ stage, count, color }) => {
                  const total = MOCK_CONTACTS.length || 1;
                  const pct = Math.round((count / total) * 100);
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
            </div>
          </section>

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

      {/* ── ANALYTICS ── */}
      {tab === "analytics" && <AnalyticsTab kpis={kpis} />}

      {/* ── EVANGELISTS ── */}
      {tab === "evangelists" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-secondary">{MOCK_EVANGELISTS.length} registered evangelists</p>
            <button
              onClick={() => { setShowNewEvForm(!showNewEvForm); setInviteLink(null); }}
              className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Add Evangelist
            </button>
          </div>

          {showNewEvForm && (
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm animate-fade-up space-y-6">
              <p className="text-sm font-black text-on-surface">Invite New Evangelist</p>
              <p className="text-xs text-secondary -mt-3">
                An invite link will be generated. Share it with the evangelist so they can set their own password.
              </p>

              {inviteLink ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <Mail className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <p className="text-xs text-amber-800 font-mono flex-1 break-all">{inviteLink}</p>
                  </div>
                  <div className="flex gap-3">
                    <CopyButton text={inviteLink} />
                    <button
                      className="text-xs text-secondary hover:text-on-surface font-semibold"
                      onClick={() => { setInviteLink(null); setShowNewEvForm(false); }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <label className="sp-label ml-0.5">Team (optional)</label>
                      <select
                        className="field-input cursor-pointer"
                        value={newEv.teamId}
                        onChange={e => setNewEv(p => ({ ...p, teamId: e.target.value }))}
                      >
                        <option value="">— Select team —</option>
                        {MOCK_TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="sp-label ml-0.5">Role</label>
                      <select
                        className="field-input cursor-pointer"
                        value={newEv.role}
                        onChange={e => setNewEv(p => ({ ...p, role: e.target.value }))}
                      >
                        <option value="evangelist">Evangelist</option>
                        <option value="data_collector">Data Collector</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="btn-primary text-sm py-2.5 flex items-center gap-2"
                      onClick={handleSendInvite}
                      disabled={inviteEvangelist.isPending}
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      {inviteEvangelist.isPending ? "Creating…" : "Generate Invite Link"}
                    </button>
                    <button className="btn-outline text-sm py-2.5" onClick={() => setShowNewEvForm(false)}>Cancel</button>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/15 bg-surface-container-low/50">
                  <th className="text-left px-6 py-3.5 sp-label">Evangelist</th>
                  <th className="text-left px-4 py-3.5 sp-label hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3.5 sp-label hidden md:table-cell">Phone</th>
                  <th className="text-left px-4 py-3.5 sp-label">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {MOCK_EVANGELISTS.map((ev) => {
                  const kpi = kpis.find(k => k.user_id === ev.id);
                  return (
                    <tr key={ev.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-container/15 flex items-center justify-center text-primary font-black text-xs">
                            {ev.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-on-surface">{ev.name}</p>
                            <p className="text-xs text-secondary hidden sm:block">{kpi?.team_name ?? "No team"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell text-secondary text-xs">{ev.email}</td>
                      <td className="px-4 py-4 hidden md:table-cell text-secondary text-xs">{ev.phone || "—"}</td>
                      <td className="px-4 py-4">
                        {kpi?.invite_pending ? (
                          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-orange-100 text-orange-700 flex items-center gap-1 w-fit">
                            <AlertCircle className="h-2.5 w-2.5" /> Pending Setup
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-green-100 text-green-700">
                            Active
                          </span>
                        )}
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
                    {members.length === 0 && <p className="text-xs text-secondary">No members assigned</p>}
                    {members.map(ev => (
                      <div key={ev.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary-container/15 flex items-center justify-center text-primary font-black text-[10px]">
                            {ev.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="text-sm font-semibold text-on-surface">{ev.name}</span>
                        </div>
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
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadgeClass(c.status)}`}>{c.status}</span>
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
