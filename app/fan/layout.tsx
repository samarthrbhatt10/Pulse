"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "../components/ThemeToggle";

const NAV_ITEMS = [
  { href: "/fan", label: "Home", icon: "home" },
  { href: "/fan/order", label: "F&B Order", icon: "restaurant" },
  { href: "/fan/map", label: "Map (3D)", icon: "map" },
  { href: "/fan/chat", label: "AI Chat", icon: "chat_bubble" },
  { href: "/fan/safety", label: "Safety", icon: "emergency" },
];

export default function FanLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobilePreview, setMobilePreview] = useState(false);
  const [userRole, setUserRole] = useState<string | null>("fan");
  const [userName, setUserName] = useState("Event Fan");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("pulse_user_role");
      const name = localStorage.getItem("pulse_user_name");
      if (role) setUserRole(role);
      if (name) setUserName(name.slice(0, 18));
    }
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pulse_user_role");
      localStorage.removeItem("pulse_user_name");
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      {/* Top Header Bar for Web & Desktop / Tablet */}
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-primary pulse-teal" />
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-primary via-violet-500 to-accent bg-clip-text text-transparent">
              PULSE FAN
            </span>
          </Link>

          {/* Web Desktop Navigation (Strictly Fan Pages) */}
          <nav className="hidden md:flex items-center gap-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === "/fan" ? pathname === "/fan" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? "bg-primary/15 text-primary border border-primary/30 shadow-sm scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Live Match Badge */}
          <div className="hidden xl:flex items-center gap-2.5 bg-card px-3 py-1.5 rounded-full border border-border shadow-2xs text-xs">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="font-bold uppercase tracking-wider text-muted-foreground">LIVE MATCH:</span>
            <span className="font-extrabold">🇧🇷 BRA 2 — 1 ARG 🇦🇷</span>
          </div>

          {/* Mobile Preview Toggle for Desktop QA */}
          <button
            onClick={() => setMobilePreview(!mobilePreview)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold transition-all"
            title="Toggle between full web layout and phone frame preview"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">
              {mobilePreview ? "desktop_windows" : "smartphone"}
            </span>
            <span>{mobilePreview ? "Web View" : "Phone View"}</span>
          </button>

          <ThemeToggle variant="compact" />

          {/* Only if user is specifically an Ops officer visiting fan mode, show return button */}
          {userRole === "ops" && (
            <Link
              href="/control-room"
              className="hidden sm:inline-flex px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-bold uppercase tracking-wider hover:bg-accent/25 border border-accent/30 transition-all"
            >
              Return to Ops
            </Link>
          )}

          {/* Logout Button (Always available in Fan Portal to redirect to Login) */}
          <button
            onClick={handleLogout}
            title="Sign Out & Return to Login"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-muted hover:bg-red-500/15 hover:text-red-500 hover:border-red-500/40 border border-border text-xs font-bold uppercase tracking-wider transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area: Responsive Web Fullscreen or Phone Frame */}
      <div className={`flex-1 flex flex-col items-center justify-start ${mobilePreview ? "py-8 bg-muted/40" : ""}`}>
        <div
          className={`w-full flex flex-col flex-1 relative transition-all duration-300 ${
            mobilePreview
              ? "max-w-[420px] min-h-[844px] rounded-[40px] border-8 border-foreground/15 shadow-2xl overflow-hidden bg-background my-auto"
              : "max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6"
          }`}
        >
          {/* Decorative ambient glows */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

          <main className="flex-1 pb-24 md:pb-8 relative z-10">{children}</main>

          {/* Bottom Navigation (Always on mobile / inside phone preview, hidden on desktop web when not in preview) */}
          <nav
            className={`fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border px-4 py-2.5 pb-safe rounded-t-3xl fan-shadow transition-all ${
              mobilePreview
                ? "absolute bottom-0 w-full rounded-b-[32px] rounded-t-2xl"
                : "md:hidden"
            }`}
          >
            <div className="max-w-md mx-auto flex justify-around items-center">
              {NAV_ITEMS.map((item) => {
                const isActive = item.href === "/fan" ? pathname === "/fan" : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} className="flex-1">
                    <div
                      className={`flex flex-col items-center justify-center py-1 transition-all rounded-xl ${
                        isActive ? "bg-primary/15 text-primary scale-105" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[22px]"
                        style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
                      >
                        {item.icon}
                      </span>
                      <span className="text-[10px] font-bold mt-0.5">{item.label.split(" ")[0]}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
