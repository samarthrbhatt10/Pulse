"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "../components/ThemeToggle";

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-lg sm:text-xl font-bold text-accent tabular-nums tracking-tight">{time}</span>;
}

const NAV_LINKS = [
  { href: "/control-room", label: "Dashboard", icon: "monitor_heart" },
  { href: "/control-room/stadiums", label: "3D Stadiums", icon: "view_in_ar" },
  { href: "/control-room/incidents", label: "Incidents", icon: "warning" },
  { href: "/control-room/zones", label: "Zones", icon: "grid_view" },
  { href: "/control-room/broadcast", label: "Broadcast", icon: "campaign" },
];

export default function ControlRoomLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [userName, setUserName] = useState("STATION_04");

  // Check role & close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("pulse_user_role");
      const name = localStorage.getItem("pulse_user_name");
      if (name) {
        setUserName(name.slice(0, 15).toUpperCase());
      }
      // If user is explicitly logged in as 'fan', deny access to CTO/COO command room
      if (role === "fan") {
        setAccessDenied(true);
      } else {
        setAccessDenied(false);
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pulse_user_role");
      localStorage.removeItem("pulse_user_name");
    }
    router.push("/login");
  };

  // If Fan attempts to access Control Room, render Access Denied Screen
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="w-full max-w-lg bg-card/90 backdrop-blur-2xl border-2 border-red-500/40 rounded-3xl p-8 fan-shadow relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto mb-5 animate-pulse">
            <span className="material-symbols-outlined text-[36px]">gpp_maybe</span>
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-red-500/15 text-red-500 text-[10px] font-black uppercase tracking-widest mb-3 border border-red-500/30">
            Clearance Violation · Level 5 Command
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Access Restricted to Enterprise Officers
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-3 leading-relaxed">
            Your credentials are authenticated as a <strong className="text-foreground">World Cup Fan / VIP Account</strong> (<code className="text-accent">pulse_user_role: fan</code>). You are not authorized to view or modify CTO/COO stadium operations, turnstile nodes, or AI command triage.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 border-t border-border">
            <Link
              href="/fan"
              className="w-full sm:w-auto flex-1 bg-gradient-to-r from-accent via-teal-600 to-accent text-white font-black py-3.5 px-6 rounded-2xl hover:opacity-95 transition-all text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
            >
              <span>Launch Fan Application</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-muted hover:bg-red-500/15 hover:text-red-500 hover:border-red-500/40 text-foreground border border-border font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span>Sign Out & Switch Role</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col transition-colors duration-300">
      {/* Top Nav */}
      <header className="flex items-center justify-between px-4 sm:px-6 h-16 bg-card border-b border-border flex-shrink-0 z-50 sticky top-0 shadow-sm">
        <div className="flex items-center gap-4 lg:gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-accent pulse-teal" />
            <span className="font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
              PULSE OPS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/control-room"
                  ? pathname === "/control-room"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-accent/15 text-accent border border-accent/30 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <LiveClock />
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">System Time</span>
          </div>

          <Link
            href="/control-room?demo=true"
            className="hidden sm:inline-flex px-3 py-1.5 border border-accent/40 text-accent text-xs font-bold uppercase tracking-wider hover:bg-accent/10 transition-all rounded-lg"
          >
            Demo Mode
          </Link>

          <ThemeToggle variant="compact" />

          <div className="flex items-center gap-3 border-l border-border pl-3 sm:pl-4">
            <div className="hidden xl:flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center">
                <span className="material-symbols-outlined text-accent text-[18px]">admin_panel_settings</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-none">{userName}</span>
                <span className="text-[10px] text-muted-foreground leading-none mt-0.5">LEVEL 5 CLEARANCE</span>
              </div>
            </div>

            {/* Logout Button (Desktop) */}
            <button
              onClick={handleLogout}
              title="Sign Out & Return to Login"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-red-500/15 hover:text-red-500 hover:border-red-500/40 border border-border text-xs font-bold uppercase tracking-wider transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className="hidden lg:inline">Sign Out</span>
            </button>

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 transition-all text-xs font-black uppercase tracking-wider shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
              <span>{mobileMenuOpen ? "Close" : "Modules"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-background/95 backdrop-blur-xl z-40 border-b border-border p-4 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-2 mb-6">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-1">
              Operations Navigation
            </div>
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/control-room"
                  ? pathname === "/control-room"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-accent/15 text-accent border border-accent/30 shadow-sm"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col gap-4 p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between sm:hidden">
              <span className="text-xs font-bold text-muted-foreground uppercase">Live Clock</span>
              <LiveClock />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase">Officer ID</span>
              <span className="text-xs font-mono font-bold text-accent">{userName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-500/25 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Sign Out of Enterprise Console</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 overflow-x-hidden">{children}</main>
    </div>
  );
}
