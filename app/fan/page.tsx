"use client";
import Link from "next/link";
import { ZONES, densityColor } from "@/lib/mockData";

export default function FanHomePage() {
  const criticalZones = ZONES.filter((z) => z.percent >= 85);

  return (
    <div className="flex flex-col gap-6">
      {/* Mobile-only Header (since top bar is present on desktop) */}
      <div className="md:hidden flex items-center justify-between pt-2 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary pulse-teal" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">World Cup 2026 Portal</span>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
          <span className="material-symbols-outlined text-primary text-[14px]">language</span>
          <span className="text-[11px] font-bold text-primary">Auto-Detect</span>
        </div>
      </div>

      {/* Hero Live Match Banner */}
      <div className="bg-gradient-to-r from-primary via-violet-600 to-accent/80 rounded-3xl p-5 sm:p-7 text-white fan-shadow relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-white/90">🔴 LIVE — FIFA World Cup 2026 Group Stage</span>
          </div>
          <span className="text-xs font-mono font-bold bg-black/30 backdrop-blur-md px-3 py-1 rounded-full">
            67:23 ⚽
          </span>
        </div>

        <div className="flex items-center justify-between relative z-10 py-2 sm:py-4 max-w-2xl mx-auto">
          <div className="text-center flex-1">
            <div className="text-3xl sm:text-4xl font-black tracking-tight">🇧🇷 BRA</div>
            <div className="text-xs sm:text-sm font-semibold opacity-80 mt-1">Brazil National Team</div>
          </div>
          <div className="text-4xl sm:text-5xl font-black tabular-nums px-4 sm:px-8 tracking-tighter drop-shadow-md">
            2 — 1
          </div>
          <div className="text-center flex-1">
            <div className="text-3xl sm:text-4xl font-black tracking-tight">🇦🇷 ARG</div>
            <div className="text-xs sm:text-sm font-semibold opacity-80 mt-1">Argentina National Team</div>
          </div>
        </div>
      </div>

      {/* Desktop/Tablet Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Quick Actions & Announcements (7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Quick Access Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
                Smart Stadium Actions
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {[
                { href: "/fan/map", icon: "map", label: "Indoor Map", desc: "Turn-by-turn routes", color: "var(--primary)" },
                { href: "/fan/match-hub", icon: "sports_soccer", label: "AR Match Hub", desc: "Hawk-Eye & Replay", color: "var(--accent)" },
                { href: "/fan/order", icon: "restaurant", label: "Express Order", desc: "In-seat concessions", color: "#10b981" },
                { href: "/fan/chat", icon: "chat_bubble", label: "Gemini AI", desc: "Ask anything 24/7", color: "#3b82f6" },
                { href: "/fan/safety", icon: "emergency", label: "Safety & SOS", desc: "Emergency assistance", color: "#ff4b4b" },
              ].map((action) => (
                <Link key={action.href} href={action.href} className="group">
                  <div className="h-full bg-card hover:bg-card-hover rounded-2xl p-3.5 sm:p-4 text-center fan-shadow border border-border hover:border-primary/50 transition-all duration-200 flex flex-col items-center justify-center group-active:scale-95">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-muted flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-2xl sm:text-3xl" style={{ color: action.color }}>
                        {action.icon}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-foreground block leading-tight">{action.label}</span>
                    <span className="text-[10px] text-muted-foreground hidden sm:block mt-0.5 leading-tight">{action.desc}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Active Announcements */}
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">campaign</span>
              Live Stadium Feed & Announcements
            </h2>
            <div className="space-y-3">
              {[
                {
                  msg: "Zone A concourse is currently at high capacity (88%). Please use Gates 5-7 for faster access to the North Stand.",
                  time: "2m ago",
                  urgent: true,
                  icon: "warning",
                },
                {
                  msg: "Free chilled drinking water stations and cooling mist zones are active at Concourse B and C.",
                  time: "8m ago",
                  urgent: false,
                  icon: "water_drop",
                },
                {
                  msg: "Half-time shuttle buses to the Metro Express will begin staging at Exit Gate 4 immediately following the whistle.",
                  time: "15m ago",
                  urgent: false,
                  icon: "directions_bus",
                },
              ].map((ann, i) => (
                <div
                  key={i}
                  className={`bg-card rounded-2xl p-4 fan-shadow border transition-all hover:bg-card-hover ${
                    ann.urgent ? "border-red-500/40 bg-red-500/5" : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        ann.urgent ? "bg-red-500/15 text-red-500" : "bg-primary/15 text-primary"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{ann.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${ann.urgent ? "text-red-500" : "text-primary"}`}>
                          {ann.urgent ? "Priority Advisory" : "Operations Update"}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium">{ann.time}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">{ann.msg}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Crowd Status & Zone Heatmap (5 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-card rounded-3xl p-5 sm:p-6 fan-shadow border border-border">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <div>
                <h3 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent text-[20px]">groups</span>
                  Real-Time Crowd Density
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Live IoT sensor telemetry</p>
              </div>
              <span className="text-xs text-red-500 font-black bg-red-500/15 border border-red-500/30 px-3 py-1 rounded-full animate-pulse">
                82% LOAD
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {ZONES.slice(0, 8).map((zone) => (
                <div key={zone.id} className="bg-muted/50 rounded-2xl p-3 border border-border/60 text-center flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                      <span className="text-muted-foreground">Zone {zone.id}</span>
                      <span style={{ color: densityColor(zone.density) }}>{zone.percent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          background: densityColor(zone.density),
                          width: `${zone.percent}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                    {zone.name.split(" ")[0]}
                  </div>
                </div>
              ))}
            </div>

            {criticalZones.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5 flex items-start gap-3">
                <span className="material-symbols-outlined text-red-500 text-[20px] flex-shrink-0 mt-0.5">warning</span>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Bottleneck Alert</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Zones {criticalZones.map((z) => z.id).join(", ")} are experiencing heavy foot traffic (&gt;85%). We recommend navigating through concourse C.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
