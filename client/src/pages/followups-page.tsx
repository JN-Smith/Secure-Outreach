import { useState } from "react";
import { useContacts } from "@/lib/contacts-context";
import { useMyFollowUps, useContactFollowUps, useLogFollowUp } from "@/lib/api/followups";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, ChevronRight, Clock } from "lucide-react";
import { toast } from "sonner";

const METHODS = ["Call", "WhatsApp", "Visit", "Church Invitation"];
const OUTCOMES = ["Positive", "Neutral", "No Response", "Not Interested"];
const STATUSES = ["New", "Needs Follow-up", "Actively Discipling", "Connected to Church", "Not Interested"];

const OUTCOME_STYLE: Record<string, string> = {
  Positive: "bg-green-100 text-green-700",
  Neutral: "bg-amber-100 text-amber-700",
  "No Response": "bg-gray-100 text-gray-500",
  "Not Interested": "bg-red-100 text-red-600",
};

const STATUS_STYLE: Record<string, string> = {
  New: "bg-amber-100 text-amber-700",
  "Needs Follow-up": "bg-orange-100 text-orange-700",
  "Actively Discipling": "bg-purple-100 text-purple-700",
  "Connected to Church": "bg-green-100 text-green-700",
  "Not Interested": "bg-gray-100 text-gray-500",
};

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("");
}

function ContactHistory({ contactId }: { contactId: string }) {
  const { data: logs = [], isLoading } = useContactFollowUps(contactId);
  if (isLoading) return <p className="text-xs text-muted-foreground py-2">Loading history...</p>;
  if (logs.length === 0) return <p className="text-xs text-muted-foreground py-2">No follow-up history yet.</p>;
  return (
    <div className="space-y-2 mt-2">
      {logs.map((log) => (
        <div key={log.id} className="border rounded-lg p-3 text-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{log.method}</span>
            <div className="flex gap-1.5 items-center">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${OUTCOME_STYLE[log.outcome] ?? "bg-gray-100 text-gray-600"}`}>
                {log.outcome}
              </span>
              <span className="text-xs text-muted-foreground">{new Date(log.date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
          </div>
          {log.new_status && (
            <p className="text-xs text-muted-foreground">
              Status changed to: <span className="font-medium text-foreground">{log.new_status}</span>
            </p>
          )}
          {log.notes && <p className="text-xs text-muted-foreground leading-relaxed">{log.notes}</p>}
        </div>
      ))}
    </div>
  );
}

export default function FollowUpsPage() {
  const { contacts, isLoading: contactsLoading } = useContacts();
  const { data: recentLogs = [] } = useMyFollowUps();
  const logFollowUp = useLogFollowUp();

  const [selected, setSelected] = useState<(typeof contacts)[0] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [historyContact, setHistoryContact] = useState<(typeof contacts)[0] | null>(null);

  const [form, setForm] = useState({
    method: "Call",
    outcome: "Positive",
    notes: "",
    new_status: "",
    date: new Date().toISOString().slice(0, 10),
  });

  // Contacts that need attention (not yet connected to church or not interested)
  const pending = contacts.filter(
    (c) => c.status !== "Connected to Church" && c.status !== "Not Interested"
  );

  function openLog(contact: (typeof contacts)[0]) {
    setSelected(contact);
    setForm({ method: "Call", outcome: "Positive", notes: "", new_status: contact.status, date: new Date().toISOString().slice(0, 10) });
    setShowForm(true);
    setHistoryContact(null);
  }

  function submitLog() {
    if (!selected) return;
    logFollowUp.mutate(
      {
        contact_id: selected.id,
        date: form.date,
        method: form.method,
        outcome: form.outcome,
        notes: form.notes || undefined,
        new_status: form.new_status || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Follow-up logged", { description: `${selected.fullName} · ${form.outcome}` });
          setSelected(null);
          setShowForm(false);
        },
        onError: () => toast.error("Failed to save follow-up"),
      },
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Discipleship Tracker</p>
        <h2 className="text-2xl font-bold tracking-tight">Follow-ups</h2>
        <p className="text-sm text-muted-foreground mt-1">Log progress and track your discipleship journeys.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left — pending contacts */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Pending contacts ({pending.length})
          </h3>
          <div className="bg-surface-container-lowest rounded-xl border overflow-hidden divide-y">
            {contactsLoading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
              </div>
            ) : pending.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-12">All contacts are connected or closed.</p>
            ) : (
              pending.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="h-9 w-9 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {initials(c.fullName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{c.fullName}</p>
                    <p className="text-xs text-muted-foreground">{c.phone} · {c.followUpMethod}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold hidden sm:inline ${STATUS_STYLE[c.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {c.status}
                  </span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="View history"
                      onClick={() => { setHistoryContact(c); setShowForm(false); setSelected(null); }}>
                      <Clock className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" className="h-8 gap-1 text-xs" onClick={() => openLog(c)}>
                      <Plus className="h-3.5 w-3.5" /> Log
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right — recent activity */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent Logs</h3>
          <div className="bg-surface-container-lowest rounded-xl border overflow-hidden divide-y">
            {recentLogs.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No logs yet.</p>
            ) : (
              recentLogs.slice(0, 10).map((log) => {
                const contact = contacts.find((c) => c.id === log.contact_id);
                return (
                  <div key={log.id} className="px-4 py-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold truncate">{contact?.fullName ?? "Unknown"}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${OUTCOME_STYLE[log.outcome] ?? "bg-gray-100"}`}>
                        {log.outcome}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {log.method} · {new Date(log.date).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
                    </p>
                    {log.notes && <p className="text-xs text-muted-foreground line-clamp-1">{log.notes}</p>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Log follow-up dialog */}
      <Dialog open={showForm} onOpenChange={(o) => { if (!o) { setShowForm(false); setSelected(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Follow-up — {selected?.fullName}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 mt-2 text-sm">
              <div className="p-3 bg-muted rounded-lg text-xs space-y-0.5">
                <p><span className="font-medium">Phone:</span> {selected.phone}</p>
                <p><span className="font-medium">Current status:</span> {selected.status}</p>
                <p><span className="font-medium">Preferred method:</span> {selected.followUpMethod}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Method</label>
                  <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Outcome</label>
                <Select value={form.outcome} onValueChange={(v) => setForm({ ...form, outcome: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{OUTCOMES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Update contact status (optional)</label>
                <Select value={form.new_status} onValueChange={(v) => setForm({ ...form, new_status: v })}>
                  <SelectTrigger><SelectValue placeholder="Keep current status" /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</label>
                <Textarea
                  placeholder="What happened during this follow-up?"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => { setShowForm(false); setSelected(null); }}>Cancel</Button>
                <Button className="flex-1" onClick={submitLog} disabled={logFollowUp.isPending}>
                  {logFollowUp.isPending ? "Saving..." : "Save Log"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* History dialog */}
      <Dialog open={!!historyContact} onOpenChange={(o) => { if (!o) setHistoryContact(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Follow-up History — {historyContact?.fullName}</DialogTitle>
          </DialogHeader>
          {historyContact && (
            <div className="mt-2 max-h-[60vh] overflow-y-auto">
              <ContactHistory contactId={historyContact.id} />
            </div>
          )}
          <Button variant="outline" className="w-full mt-2" onClick={() => setHistoryContact(null)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
