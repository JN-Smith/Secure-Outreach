import { useState } from "react";
import { toast } from "sonner";
import { useUsers, useInviteEvangelist, useEvangelistAnalytics, useResendInvite } from "@/lib/api/users";
import type { EvangelistKPI } from "@/lib/api/users";
import { useTeams } from "@/lib/api/teams";
import { Copy, Check, Mail, AlertCircle, UserPlus, RefreshCw, MapPin, Phone, Calendar, LogIn, Users, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { User } from "@/lib/auth";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 text-sm text-amber-700 hover:text-amber-900 font-semibold transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied!" : "Copy invite link"}
    </button>
  );
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]?.toUpperCase() ?? "").join("");
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-900 text-right">{children}</span>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-gray-50/60 dark:bg-gray-900/20 rounded-xl p-3 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</p>
    </div>
  );
}

export default function EvangelistsPage() {
  const { data: evangelists = [], isLoading } = useUsers("evangelist");
  const { data: teams = [] } = useTeams();
  const { data: kpis = [] } = useEvangelistAnalytics();
  const inviteEvangelist = useInviteEvangelist();
  const resendInvite = useResendInvite();

  const [selected, setSelected] = useState<{ user: User; kpi?: EvangelistKPI } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", teamId: "", role: "evangelist" });
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  function handleInvite() {
    if (!form.name || !form.email) { toast.error("Name and email are required"); return; }
    inviteEvangelist.mutate(
      { full_name: form.name, email: form.email, phone: form.phone || undefined, role: form.role },
      {
        onSuccess: (data) => {
          const url = `${window.location.origin}/accept-invite?token=${data.token}`;
          setInviteLink(url);
          setForm({ name: "", email: "", phone: "", teamId: "", role: "evangelist" });
          toast.success("Invite link generated");
        },
        onError: () => toast.error("Failed to create invite — email may already be registered"),
      },
    );
  }

  const pendingCount = evangelists.filter(e => e.invite_pending).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Team</p>
          <h2 className="text-2xl font-bold tracking-tight">
            Evangelists
            {evangelists.length > 0 && (
              <span className="ml-2 text-base font-normal text-muted-foreground">
                {evangelists.length} registered
                {pendingCount > 0 && ` · ${pendingCount} pending setup`}
              </span>
            )}
          </h2>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setInviteLink(null); }}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-4 py-2.5 rounded-lg transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Add Evangelist
        </button>
      </div>

      {/* Invite form */}
      {showForm && (
        <div className="bg-surface-container-lowest rounded-xl border p-6 space-y-5">
          <div>
            <p className="font-bold text-sm text-gray-900">Invite New Evangelist</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              An invite link will be generated. Share it with the evangelist — they'll set their own password.
            </p>
          </div>

          {inviteLink ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40 rounded-lg">
                <Mail className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-mono text-amber-800 break-all flex-1">{inviteLink}</p>
              </div>
              <div className="flex items-center gap-4">
                <CopyButton text={inviteLink} />
                <button
                  className="text-xs text-muted-foreground hover:text-foreground font-semibold"
                  onClick={() => { setInviteLink(null); setShowForm(false); }}
                >
                  Done
                </button>
                <button
                  className="text-xs text-amber-700 hover:text-amber-900 font-semibold"
                  onClick={() => setInviteLink(null)}
                >
                  Invite another
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Full Name *</label>
                  <input
                    className="w-full border border-outline-variant/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="Grace Achieng"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email *</label>
                  <input
                    type="email"
                    className="w-full border border-outline-variant/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="grace@manifest.ke"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Phone</label>
                  <input
                    type="tel"
                    className="w-full border border-outline-variant/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="+254 712 345 000"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Team (optional)</label>
                  <select
                    className="w-full border border-outline-variant/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-surface-container-lowest"
                    value={form.teamId}
                    onChange={e => setForm(p => ({ ...p, teamId: e.target.value }))}
                  >
                    <option value="">— Select team —</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Role</label>
                  <select
                    className="w-full border border-outline-variant/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-surface-container-lowest"
                    value={form.role}
                    onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  >
                    <option value="evangelist">Evangelist</option>
                    <option value="data_collector">Data Collector</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleInvite}
                  disabled={inviteEvangelist.isPending}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-bold px-4 py-2.5 rounded-lg transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  {inviteEvangelist.isPending ? "Generating…" : "Generate Invite Link"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-sm font-semibold text-muted-foreground hover:text-foreground border border-outline-variant/40 px-4 py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Evangelist list */}
      <div className="bg-surface-container-lowest rounded-xl border overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground text-sm">Loading evangelists…</div>
        ) : evangelists.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            No evangelists registered yet. Use "Add Evangelist" to invite your first team member.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/70">
                <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Team</th>
                <th className="text-right px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Contacts</th>
                <th className="text-right px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Follow-ups</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {evangelists.map((ev) => {
                const kpi = kpis.find(k => k.user_id === ev.id);
                return (
                  <tr key={ev.id} className="hover:bg-amber-50/40 transition-colors cursor-pointer" onClick={() => setSelected({ user: ev, kpi })}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-xs flex-shrink-0">
                          {initials(ev.full_name)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{ev.full_name}</p>
                          <p className="text-xs text-muted-foreground">{ev.phone ?? ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell text-muted-foreground text-xs">{ev.email}</td>
                    <td className="px-4 py-4 hidden lg:table-cell text-muted-foreground text-xs">{kpi?.team_name ?? "—"}</td>
                    <td className="px-4 py-4 text-right hidden lg:table-cell">
                      <span className="font-bold text-amber-600">{kpi?.contacts_total ?? 0}</span>
                      <span className="text-xs text-muted-foreground ml-1">total</span>
                    </td>
                    <td className="px-4 py-4 text-right hidden lg:table-cell">
                      <span className="font-semibold text-green-700">{kpi?.followups_done ?? 0}</span>
                      {(kpi?.followups_pending ?? 0) > 0 && (
                        <span className="ml-2 text-xs text-orange-500 font-semibold">{kpi!.followups_pending} pending</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {ev.invite_pending ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                            <AlertCircle className="h-3 w-3" /> Pending Setup
                          </span>
                          <button
                            disabled={resendInvite.isPending}
                            onClick={() =>
                              resendInvite.mutate(ev.id, {
                                onSuccess: (data) => {
                                  const url = `${window.location.origin}/accept-invite?token=${data.token}`;
                                  navigator.clipboard.writeText(url);
                                  toast.success("New invite link copied to clipboard");
                                },
                                onError: () => toast.error("Failed to regenerate invite link"),
                              })
                            }
                            className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-semibold disabled:opacity-50 transition-colors"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Resend
                          </button>
                        </div>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Active</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Evangelist detail modal */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Evangelist Details</DialogTitle>
          {selected && (
            <div className="space-y-5">
              {/* Hero */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-xl flex-shrink-0">
                  {initials(selected.user.full_name)}
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-lg leading-tight text-gray-900">{selected.user.full_name}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 capitalize">
                      {selected.user.role.replace("_", " ")}
                    </span>
                    {selected.kpi?.team_name && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {selected.kpi.team_name}
                      </span>
                    )}
                    {selected.user.invite_pending ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                        <AlertCircle className="h-3 w-3" /> Pending Setup
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Active</span>
                    )}
                  </div>
                </div>
              </div>

              {/* KPI stats */}
              {!selected.user.invite_pending && (
                <div className="grid grid-cols-4 gap-2">
                  <StatCard label="Contacts" value={selected.kpi?.contacts_total ?? 0} color="text-amber-600" />
                  <StatCard label="This week" value={selected.kpi?.contacts_this_week ?? 0} color="text-blue-600" />
                  <StatCard label="Done" value={selected.kpi?.followups_done ?? 0} color="text-green-600" />
                  <StatCard label="Pending" value={selected.kpi?.followups_pending ?? 0} color="text-orange-500" />
                </div>
              )}

              {/* Details */}
              <div className="bg-gray-50/60 dark:bg-gray-900/20 rounded-xl px-4 py-1">
                <DetailRow label="Email">{selected.user.email}</DetailRow>
                <DetailRow label="Phone">
                  {selected.user.phone ? (
                    <span className="flex items-center justify-end gap-1"><Phone className="h-3 w-3 text-muted-foreground" />{selected.user.phone}</span>
                  ) : "—"}
                </DetailRow>
                <DetailRow label="Location">
                  {selected.user.location ? (
                    <span className="flex items-center justify-end gap-1"><MapPin className="h-3 w-3 text-muted-foreground" />{selected.user.location}</span>
                  ) : "—"}
                </DetailRow>
                {selected.kpi?.converted != null && selected.kpi.converted > 0 && (
                  <DetailRow label="Converted">
                    <span className="flex items-center justify-end gap-1 text-green-700 font-semibold">
                      <CheckCircle2 className="h-3 w-3" />{selected.kpi.converted}
                    </span>
                  </DetailRow>
                )}
                <DetailRow label="Member since">
                  <span className="flex items-center justify-end gap-1"><Calendar className="h-3 w-3 text-muted-foreground" />{fmtDate(selected.user.created_at)}</span>
                </DetailRow>
                <DetailRow label="Last login">
                  <span className="flex items-center justify-end gap-1"><LogIn className="h-3 w-3 text-muted-foreground" />{fmtDateTime(selected.kpi?.last_login_at ?? selected.user.last_login_at)}</span>
                </DetailRow>
                <DetailRow label="Login count">
                  <span className="flex items-center justify-end gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    {selected.kpi?.login_count ?? selected.user.login_count ?? 0} sessions
                  </span>
                </DetailRow>
              </div>

              {/* Actions */}
              <div className="pt-1">
                <button
                  disabled={resendInvite.isPending}
                  onClick={() =>
                    resendInvite.mutate(selected.user.id, {
                      onSuccess: (data) => {
                        const url = `${window.location.origin}/accept-invite?token=${data.token}`;
                        navigator.clipboard.writeText(url);
                        toast.success("Password link copied to clipboard");
                      },
                      onError: () => toast.error("Failed to generate link"),
                    })
                  }
                  className="w-full flex items-center justify-center gap-2 border border-amber-300 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  {selected.user.invite_pending ? "Regenerate & Copy Invite Link" : "Generate Password Reset Link"}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
