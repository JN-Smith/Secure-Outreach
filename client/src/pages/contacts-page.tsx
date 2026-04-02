import { useState } from "react";
import { Link } from "wouter";
import { useContacts, Contact } from "@/lib/contacts-context";
import { useUpdateContact } from "@/lib/api/contacts";
import { useContactFollowUps } from "@/lib/api/followups";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus, ChevronRight, Loader2, Pencil, History } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const OUTCOME_STYLE: Record<string, string> = {
  Positive: "bg-green-100 text-green-700",
  Neutral: "bg-amber-100 text-amber-700",
  "No Response": "bg-gray-100 text-gray-500",
  "Not Interested": "bg-red-100 text-red-600",
};

function ContactFollowUpHistory({ contactId }: { contactId: string }) {
  const { data: logs = [], isLoading } = useContactFollowUps(contactId);
  if (isLoading) return <p className="text-xs text-muted-foreground py-2">Loading…</p>;
  if (logs.length === 0) return <p className="text-xs text-muted-foreground py-2">No follow-up logs yet.</p>;
  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div key={log.id} className="border rounded-lg p-3 text-sm space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold">{log.method}</span>
            <div className="flex gap-1.5 items-center">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${OUTCOME_STYLE[log.outcome] ?? "bg-gray-100"}`}>
                {log.outcome}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(log.date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
          {log.new_status && (
            <p className="text-xs text-muted-foreground">
              Status → <span className="font-medium text-foreground">{log.new_status}</span>
            </p>
          )}
          {log.notes && <p className="text-xs text-muted-foreground leading-relaxed">{log.notes}</p>}
        </div>
      ))}
    </div>
  );
}

const STATUS_FILTERS = ["ALL", "New", "Needs Follow-up", "Actively Discipling", "Connected to Church"] as const;

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("");
}

const STATUS_BADGE: Record<string, string> = {
  New: "bg-amber-100 text-amber-700",
  "Needs Follow-up": "bg-orange-100 text-orange-700",
  "Actively Discipling": "bg-purple-100 text-purple-700",
  "Connected to Church": "bg-green-100 text-green-700",
  "Not Interested": "bg-gray-100 text-gray-500",
};

const AVATAR_COLORS = ["bg-amber-500", "bg-orange-400", "bg-yellow-500", "bg-stone-500", "bg-amber-700"];

function avatarColor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

const STATUSES = ["New", "Needs Follow-up", "Actively Discipling", "Connected to Church", "Not Interested"];
const FOLLOW_UP_METHODS = ["Call", "WhatsApp", "Visit", "Church Invitation"];

export default function ContactsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "pastor";
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [selected, setSelected] = useState<Contact | null>(null);
  const [detailTab, setDetailTab] = useState<"info" | "followups">("info");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    status: string;
    follow_up_method: string;
    discipleship_status: string;
    prayer_requests: string;
    notes: string;
    tags: string;
  } | null>(null);
  const { contacts, isLoading } = useContacts();
  const updateContact = useUpdateContact();

  const filtered = contacts.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "ALL" || c.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  function openDetail(c: Contact) {
    setSelected(c);
    setEditing(false);
    setEditForm(null);
    setDetailTab("info");
  }

  function startEdit(c: Contact) {
    setEditForm({
      status: c.status,
      follow_up_method: c.followUpMethod,
      discipleship_status: c.discipleshipStatus,
      prayer_requests: c.prayerRequests ?? "",
      notes: c.notes ?? "",
      tags: c.tags?.join(", ") ?? "",
    });
    setEditing(true);
  }

  function saveEdit() {
    if (!selected || !editForm) return;
    updateContact.mutate(
      {
        id: selected.id,
        status: editForm.status,
        follow_up_method: editForm.follow_up_method,
        discipleship_status: editForm.discipleship_status,
        prayer_requests: editForm.prayer_requests || undefined,
        notes: editForm.notes || undefined,
        tags: editForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      },
      {
        onSuccess: () => {
          toast.success("Contact updated");
          setEditing(false);
          setSelected(null);
        },
        onError: () => toast.error("Failed to update contact"),
      },
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Outreach Registry
          </p>
          <h2 className="text-2xl font-bold tracking-tight">
            Contacts
            {contacts.length > 0 && (
              <span className="ml-2 text-base font-normal text-muted-foreground">
                {contacts.length} recorded
              </span>
            )}
          </h2>
        </div>
        <Link href="/contacts/new">
          <Button size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Record New
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or area..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              activeFilter === f
                ? "bg-amber-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f === "ALL" ? "All" : f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-surface-container-lowest rounded-xl border overflow-hidden divide-y divide-border">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading contacts...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            {contacts.length === 0 ? "No contacts recorded yet." : "No results for this filter."}
          </div>
        ) : (
          filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => openDetail(c)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors text-left"
            >
              <div className={`h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold ${avatarColor(c.fullName)}`}>
                {initials(c.fullName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{c.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {c.phone}{c.location ? ` · ${c.location}` : ""}
                </p>
                {isAdmin && c.evangelistName && (
                  <p className="text-xs text-amber-600 truncate font-medium">{c.evangelistName}</p>
                )}
              </div>
              {c.tags?.length > 0 && (
                <div className="hidden sm:flex gap-1 flex-wrap">
                  {c.tags.slice(0, 2).map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[c.status] ?? "bg-gray-100 text-gray-600"}`}>
                {c.status === "Needs Follow-up" ? "Follow-up" : c.status}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </button>
          ))
        )}
      </div>

      {/* Detail / Edit dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setEditing(false); } }}>
        <DialogContent className="max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-1">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${avatarColor(selected.fullName)}`}>
                    {initials(selected.fullName)}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-lg">{selected.fullName}</DialogTitle>
                    <p className="text-sm text-muted-foreground">{selected.phone}</p>
                  </div>
                  {!editing && (
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => startEdit(selected)}>
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                  )}
                </div>
              </DialogHeader>

              {!editing && isAdmin && (
                <div className="flex gap-1 mt-2 border-b pb-2">
                  {(["info", "followups"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setDetailTab(tab)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        detailTab === tab
                          ? "bg-amber-500 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {tab === "info" ? "Info" : "Follow-ups"}
                    </button>
                  ))}
                </div>
              )}

              {!editing && isAdmin && detailTab === "followups" ? (
                <div className="mt-3 space-y-3">
                  <ContactFollowUpHistory contactId={selected.id} />
                  <DialogClose asChild>
                    <Button variant="outline" className="mt-2 w-full">Close</Button>
                  </DialogClose>
                </div>
              ) : !editing ? (
                <div className="space-y-3 text-sm mt-2">
                  <Row label="Status">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[selected.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {selected.status}
                    </span>
                  </Row>
                  <Row label="Location">{selected.location}</Row>
                  <Row label="Gender">{selected.gender || "—"}</Row>
                  <Row label="Age Range">{selected.ageRange || "—"}</Row>
                  <Row label="Born Again">{selected.bornAgain}</Row>
                  <Row label="Baptized">{selected.baptized}</Row>
                  <Row label="Discipleship">{selected.discipleshipStatus}</Row>
                  {selected.isStudent && (
                    <>
                      <Row label="Institution">{selected.institution || "—"}</Row>
                      <Row label="Course">{selected.course || "—"}</Row>
                    </>
                  )}
                  <Row label="Follow-up">{selected.followUpMethod}</Row>
                  {selected.prayerRequests && <Row label="Prayer Requests">{selected.prayerRequests}</Row>}
                  {selected.notes && <Row label="Notes">{selected.notes}</Row>}
                  {selected.tags?.length > 0 && (
                    <Row label="Tags">
                      <div className="flex gap-1 flex-wrap justify-end">
                        {selected.tags.map((t) => (
                          <span key={t} className="px-2 py-0.5 bg-muted rounded-full text-xs">{t}</span>
                        ))}
                      </div>
                    </Row>
                  )}
                  {isAdmin && selected.evangelistName && (
                    <Row label="Recorded by">
                      <span className="font-medium text-amber-700">{selected.evangelistName}</span>
                    </Row>
                  )}
                  <DialogClose asChild>
                    <Button variant="outline" className="mt-4 w-full">Close</Button>
                  </DialogClose>
                </div>
              ) : (
                <div className="space-y-4 mt-2 text-sm">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</label>
                    <Select value={editForm!.status} onValueChange={(v) => setEditForm({ ...editForm!, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Follow-up Method</label>
                    <Select value={editForm!.follow_up_method} onValueChange={(v) => setEditForm({ ...editForm!, follow_up_method: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FOLLOW_UP_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Discipleship</label>
                    <Select value={editForm!.discipleship_status} onValueChange={(v) => setEditForm({ ...editForm!, discipleship_status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Not Started", "In Progress", "Done"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tags (comma separated)</label>
                    <Input
                      value={editForm!.tags}
                      onChange={(e) => setEditForm({ ...editForm!, tags: e.target.value })}
                      placeholder="e.g. student, youth"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Prayer Requests</label>
                    <Textarea
                      value={editForm!.prayer_requests}
                      onChange={(e) => setEditForm({ ...editForm!, prayer_requests: e.target.value })}
                      className="min-h-[60px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</label>
                    <Textarea
                      value={editForm!.notes}
                      onChange={(e) => setEditForm({ ...editForm!, notes: e.target.value })}
                      className="min-h-[60px]"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => setEditing(false)}>Cancel</Button>
                    <Button className="flex-1" onClick={saveEdit} disabled={updateContact.isPending}>
                      {updateContact.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground font-medium shrink-0">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}
