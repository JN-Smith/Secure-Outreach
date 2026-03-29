import { useState } from "react";
import { useGetInviteInfo, useAcceptInvite } from "@/lib/api/users";
import { Loader2 } from "lucide-react";

export default function AcceptInvitePage() {
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get("token") ?? "";

  const { data: info, isLoading, error } = useGetInviteInfo(token);
  const acceptInvite = useAcceptInvite();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formError, setFormError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (password.length < 8) { setFormError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setFormError("Passwords do not match."); return; }

    acceptInvite.mutate(
      { token, password },
      {
        onSuccess: (data) => {
          localStorage.setItem("access_token", data.access_token);
          setDone(true);
          setTimeout(() => { window.location.href = "/"; }, 1500);
        },
        onError: () => setFormError("This invite link is invalid or has already been used."),
      },
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No invite token found in the URL.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm text-center space-y-3">
          <div className="text-5xl">🔗</div>
          <h2 className="text-xl font-bold">Invite link invalid</h2>
          <p className="text-muted-foreground text-sm">
            This invite link has already been used or has expired. Contact your admin for a new link.
          </p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm text-center space-y-3">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-bold">Account activated!</h2>
          <p className="text-muted-foreground text-sm">Redirecting you to the dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">volunteer_activism</span>
          </div>
          <div>
            <p className="font-black text-stone-800 leading-tight">Manifest Kenya</p>
            <p className="text-xs text-stone-500">Outreach Portal</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-stone-800 mb-1">Set your password</h1>
            <p className="text-sm text-stone-500">
              Welcome, <span className="font-semibold text-stone-700">{info.full_name}</span>! Create a password to activate your outreach account.
            </p>
            <p className="text-xs text-amber-600 font-medium mt-1">{info.email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Password</label>
              <input
                type="password"
                className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Confirm Password</label>
              <input
                type="password"
                className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            {formError && (
              <p className="text-sm text-red-600 font-medium">{formError}</p>
            )}

            <button
              type="submit"
              disabled={acceptInvite.isPending}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {acceptInvite.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {acceptInvite.isPending ? "Activating…" : "Activate Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
