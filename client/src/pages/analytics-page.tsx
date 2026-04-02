import { useEvangelistAnalytics, type EvangelistKPI } from "@/lib/api/users";
import { Loader2, AlertCircle } from "lucide-react";

function formatLoginTime(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-KE", { day: "numeric", month: "short" });
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]?.toUpperCase() ?? "").join("");
}

function KPICard({ label, value, sub, color }: { label: string; value: number; sub?: string; color: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className={`text-4xl font-black ${color}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: kpis = [], isLoading } = useEvangelistAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    );
  }

  const totalContacts = kpis.reduce((s, k) => s + k.contacts_total, 0);
  const thisWeek = kpis.reduce((s, k) => s + k.contacts_this_week, 0);
  const followupsDone = kpis.reduce((s, k) => s + k.followups_done, 0);
  const pending = kpis.reduce((s, k) => s + k.followups_pending, 0);
  const converted = kpis.reduce((s, k) => s + k.converted, 0);
  const pendingSetup = kpis.filter(k => k.invite_pending).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Overview</p>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard label="Total Contacts" value={totalContacts} color="text-amber-600" />
        <KPICard label="This Week" value={thisWeek} sub="new contacts" color="text-amber-500" />
        <KPICard label="Follow-ups Done" value={followupsDone} color="text-green-600" />
        <KPICard label="Pending Follow-up" value={pending} color="text-orange-500" />
        <KPICard label="Converted" value={converted} sub="connected to church" color="text-purple-600" />
        <KPICard label="Pending Setup" value={pendingSetup} sub="awaiting password" color="text-on-surface-variant" />
      </div>

      {/* Per-evangelist breakdown */}
      <div className="bg-surface-container-lowest rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50/70">
          <p className="text-sm font-bold text-on-surface">Evangelist Activity Breakdown</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Login frequency, contacts made, and follow-up progress per evangelist
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b bg-gray-50/50">
                {["Evangelist", "Team", "This Week", "Total", "Follow-ups Done", "Pending", "Converted", "Last Login", "# Logins"].map(h => (
                  <th key={h} className={`px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground ${h === "Evangelist" ? "text-left pl-6" : h === "Team" || h === "Last Login" ? "text-left" : "text-right"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {kpis.map((k: EvangelistKPI) => (
                <tr key={k.user_id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-xs flex-shrink-0">
                        {initials(k.full_name)}
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface text-sm">{k.full_name}</p>
                        {k.invite_pending && (
                          <span className="flex items-center gap-0.5 text-[10px] text-orange-500 font-bold uppercase tracking-wide">
                            <AlertCircle className="h-2.5 w-2.5" /> Pending Setup
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{k.team_name ?? "—"}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-amber-600">{k.contacts_this_week}</td>
                  <td className="px-4 py-3.5 text-right text-muted-foreground">{k.contacts_total}</td>
                  <td className="px-4 py-3.5 text-right font-semibold text-green-700">{k.followups_done}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={`font-semibold text-sm ${k.followups_pending > 5 ? "text-red-600" : "text-muted-foreground"}`}>
                      {k.followups_pending}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-purple-700">{k.converted}</td>
                  <td className="px-4 py-3.5 text-sm">
                    <span className={!k.last_login_at ? "text-muted-foreground/50" : "text-on-surface font-medium"}>
                      {formatLoginTime(k.last_login_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right text-muted-foreground text-xs">{k.login_count}</td>
                </tr>
              ))}
              {kpis.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground text-sm">
                    No evangelist data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
