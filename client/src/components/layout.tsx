import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type NavItem = { name: string; href: string; icon: string };

function getNavItems(role: string | undefined): NavItem[] {
  if (role === "evangelist") {
    return [
      { name: "My Dashboard", href: "/", icon: "person_pin" },
      { name: "My Contacts", href: "/contacts", icon: "contacts" },
      { name: "Follow-ups", href: "/followups", icon: "diversity_3" },
    ];
  }
  if (role === "pastor") {
    return [
      { name: "Ministry Overview", href: "/", icon: "church" },
      { name: "All Contacts", href: "/contacts", icon: "contacts" },
      { name: "Evangelists", href: "/evangelists", icon: "volunteer_activism" },
      { name: "Admins", href: "/admins", icon: "shield_person" },
      { name: "Analytics", href: "/analytics", icon: "bar_chart_4_bars" },
      { name: "Follow-ups", href: "/followups", icon: "diversity_3" },
      { name: "Settings", href: "/settings", icon: "settings" },
    ];
  }
  // admin
  return [
    { name: "Dashboard", href: "/", icon: "dashboard" },
    { name: "All Contacts", href: "/contacts", icon: "contacts" },
    { name: "Evangelists", href: "/evangelists", icon: "volunteer_activism" },
    { name: "Analytics", href: "/analytics", icon: "bar_chart_4_bars" },
    { name: "Follow-ups", href: "/followups", icon: "diversity_3" },
    { name: "Settings", href: "/settings", icon: "settings" },
  ];
}

function roleLabel(role: string | undefined) {
  if (role === "evangelist") return "Evangelist";
  if (role === "pastor") return "Pastor";
  if (role === "admin") return "Admin";
  return "";
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navigation = getNavItems(user?.role);
  const initials = user?.email?.substring(0, 2).toUpperCase() ?? "??";

  const SidebarInner = ({ onNav }: { onNav?: () => void }) => (
    <div className="flex flex-col h-full bg-surface-container-lowest">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-outline-variant/15">
        <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-on-primary-fixed text-[22px] filled">volunteer_activism</span>
        </div>
        <div>
          <p className="font-black text-on-surface text-sm leading-tight">Outreach Portal</p>
          <p className="text-xs text-secondary">Manifest Kenya</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 py-4 flex-1">
        {navigation.map((item) => {
          const active = location === item.href;
          return (
            <Link key={item.name} href={item.href} onClick={onNav}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium cursor-pointer ${
                active ? "nav-active-sp" : "nav-idle-sp"
              }`}>
                <span className={`material-symbols-outlined text-[20px] ${active ? "filled" : ""}`}>
                  {item.icon}
                </span>
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-5 border-t border-outline-variant/15">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center text-sm font-black text-on-surface-variant flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-on-surface truncate">{user?.email}</p>
            <p className="text-[10px] text-secondary capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-on-surface-variant hover:bg-surface-container-low hover:translate-x-1 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Sign Out
        </button>
        <p className="text-[9px] text-outline/50 font-bold tracking-widest uppercase mt-4 px-2">v1.0.0</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">

      {/* ── Top App Bar ── */}
      <header className="fixed top-0 w-full z-50 h-16 bg-surface border-b border-outline-variant/20 backdrop-blur-xl flex items-center justify-between px-6 shadow-sm shadow-black/[0.04]">
        <div className="flex items-center gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 rounded-lg text-secondary hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined">menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-r-0">
              <VisuallyHidden>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>Main navigation menu</SheetDescription>
              </VisuallyHidden>
              <SidebarInner onNav={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-extrabold text-on-surface tracking-tight">Manifest Kenya</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-primary hidden sm:block">{roleLabel(user?.role)}</span>
          {/* Dark / Light mode toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none border border-outline-variant/30 flex-shrink-0"
            style={{ background: theme === "dark" ? "#fca21e" : "#acadad" }}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span
              className="absolute flex items-center justify-center w-4 h-4 rounded-full bg-surface-container-lowest shadow transition-transform duration-300"
              style={{ transform: theme === "dark" ? "translateX(28px)" : "translateX(4px)" }}
            >
              <span className="material-symbols-outlined text-[11px] text-on-surface">
                {theme === "dark" ? "dark_mode" : "light_mode"}
              </span>
            </span>
          </button>
          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-sm font-black text-on-surface-variant border border-outline-variant/20 overflow-hidden">
            {initials}
          </div>
        </div>
      </header>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:block fixed top-16 left-0 w-72 h-[calc(100vh-64px)] z-40 rounded-r-lg shadow-2xl shadow-outline-variant/10 overflow-hidden">
        <SidebarInner />
      </aside>

      {/* ── Main Content ── */}
      <main className="pt-16 md:pl-72 pb-24 md:pb-0">
        <div className="max-w-6xl mx-auto p-6 md:p-10 lg:p-12">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-surface-container-lowest rounded-t-xl border-t border-outline-variant/15 shadow-[0_-4px_20px_0_rgba(81,93,105,0.06)]">
        {navigation.slice(0, 5).map((item) => {
          const active = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all active:scale-90 ${
                active
                  ? "bg-primary-container text-on-primary-fixed"
                  : "text-secondary hover:text-primary"
              }`}>
                <span className={`material-symbols-outlined text-[22px] ${active ? "filled" : ""}`}>{item.icon}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest leading-none">{item.name.split(" ")[0]}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
