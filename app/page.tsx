import Link from "next/link";
import { ThemeToggle } from "./components/ThemeToggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary selection:text-white transition-colors duration-300 relative overflow-x-hidden">
      {/* Ambient Glass Gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/3 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Top Enterprise Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-700 via-violet-600 to-cyan-400 flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-105 transition-transform">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-xl text-black dark:text-white">PULSE</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-cyan-950/40 text-black dark:text-cyan-400 border border-slate-300 dark:border-cyan-500/30">
                  v2.0 Enterprise
                </span>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase block">
                Silicon Valley Sports Tech & Event Management Engine
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-wider text-muted-foreground">
            <Link href="#architecture" className="hover:text-black dark:hover:text-white transition-colors">
              Enterprise Architecture
            </Link>
            <Link href="/control-room/stadiums" className="hover:text-black dark:hover:text-cyan-400 transition-colors flex items-center gap-1">
              <span>3D Digital Twin</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
            </Link>
            <Link href="/control-room/broadcast" className="hover:text-black dark:hover:text-white transition-colors">
              Neural PA Engine
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-white border border-slate-300 dark:border-slate-700 transition-all shadow-sm"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-purple-700 to-cyan-500 dark:from-cyan-400 dark:to-purple-500 text-white dark:text-slate-950 hover:opacity-95 shadow-md transition-all hidden sm:inline-block"
            >
              Request Access
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 sm:pt-20 pb-16 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-cyan-950/40 text-black dark:text-cyan-400 border border-slate-300 dark:border-cyan-500/30 text-xs font-black uppercase tracking-widest mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
          Official GenAI & IoT Command Engine · Dallas Stadium Operations
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-[-0.04em] leading-[1.05] max-w-5xl mx-auto text-black dark:bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-cyan-400 dark:bg-clip-text dark:text-transparent">
          Predictive Unified Live Stadium Experience
        </h1>

        <p className="text-muted-foreground text-base sm:text-xl font-medium max-w-3xl mx-auto mt-6 leading-relaxed">
          Engineered by premier Silicon Valley CTOs, COOs, and sports event management leaders. PULSE unites autonomous 3D digital twins, Gemini 2.5 neural intelligence, and multilingual acoustic PA dispatch into one unbreakable enterprise platform.
        </p>

        {/* Live Status Pill Bar */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-bold text-muted-foreground bg-card/80 backdrop-blur-xl border border-border py-3 px-6 rounded-2xl max-w-3xl mx-auto shadow-sm">
          <div className="flex items-center gap-2 text-foreground">
            <span className="material-symbols-outlined text-primary text-base">groups</span>
            <span>Live Attendance: <strong className="font-mono text-primary">54,302</strong></span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-2 text-foreground">
            <span className="material-symbols-outlined text-accent text-base">cell_tower</span>
            <span>Active Turnstiles: <strong className="font-mono text-accent">4,200 Nodes</strong></span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-2 text-foreground">
            <span className="material-symbols-outlined text-green-500 text-base">bolt</span>
            <span>Neural Latency: <strong className="font-mono text-green-500">12.4ms</strong></span>
          </div>
        </div>

        {/* Dual Command Portals (CTO/COO vs Fan Hub) */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto text-left">
          {/* Portal 1: CTO / COO Command Suite */}
          <div className="bg-card/90 backdrop-blur-2xl border-2 border-border hover:border-primary/60 rounded-3xl p-6 sm:p-8 fan-shadow transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-primary/15 border border-primary/30 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <span className="material-symbols-outlined text-[32px]">monitor_heart</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/15 px-3 py-1 rounded-full border border-primary/20">
                    CTO / COO Console
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground mt-1">Level 5 Command Clearance</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                Control Room Suite & 3D Digital Twin
              </h2>
              <p className="text-muted-foreground text-sm font-medium mt-3 leading-relaxed">
                Empowering executive sports management teams with real-time crowd heatmap density algorithms, automated incident triage, predictive bottleneck rerouting, and instant 6-language PA voice broadcasting.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 pt-4 border-t border-border/60">
                <div className="flex items-center gap-2 text-xs font-extrabold text-foreground">
                  <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                  <span>3D Isometric Twin Mesh</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-extrabold text-foreground">
                  <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                  <span>Gemini 2.5 Agent Loop</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-extrabold text-foreground">
                  <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                  <span>Neural 6-Lang PA Speech</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-extrabold text-foreground">
                  <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                  <span>Live Turnstile Telemetry</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/control-room"
                className="flex-1 bg-gradient-to-r from-purple-700 via-violet-600 to-purple-800 dark:from-cyan-400 dark:via-purple-500 dark:to-cyan-500 text-white dark:text-slate-950 font-black py-3.5 px-6 rounded-2xl text-center text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 group-hover:scale-102"
              >
                <span>Launch Operations Control Room</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
              <Link
                href="/login"
                className="px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black text-xs uppercase tracking-wider text-center border border-slate-300 dark:border-slate-700 transition-all shadow-sm"
              >
                Officer SSO
              </Link>
            </div>
          </div>

          {/* Portal 2: Universal Fan Hub */}
          <div className="bg-card/90 backdrop-blur-2xl border-2 border-border hover:border-accent/60 rounded-3xl p-6 sm:p-8 fan-shadow transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-accent/15 border border-accent/30 rounded-2xl flex items-center justify-center text-accent shadow-inner">
                  <span className="material-symbols-outlined text-[32px]">stadium</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/15 px-3 py-1 rounded-full border border-accent/20">
                    Fan & VIP Portal
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground mt-1">Universal Stadium Gateway</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight group-hover:text-accent transition-colors">
                Next-Gen Fan Experience & AR Hub
              </h2>
              <p className="text-muted-foreground text-sm font-medium mt-3 leading-relaxed">
                Transforming the live event journey for 80,000+ attendees with indoor 3D concourse wayfinding, AI multilingual assistant, emergency safety triage, and real-time incident reporting.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 pt-4 border-t border-border/60">
                <div className="flex items-center gap-2 text-xs font-extrabold text-foreground">
                  <span className="material-symbols-outlined text-accent text-base">check_circle</span>
                  <span>Turn-by-Turn Indoor Map</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-extrabold text-foreground">
                  <span className="material-symbols-outlined text-accent text-base">check_circle</span>
                  <span>Acoustic Replay Audio</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-extrabold text-foreground">
                  <span className="material-symbols-outlined text-accent text-base">check_circle</span>
                  <span>Gemini AI Copilot</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-extrabold text-foreground">
                  <span className="material-symbols-outlined text-accent text-base">check_circle</span>
                  <span>SOS Emergency Triage</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/fan"
                className="flex-1 bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-700 dark:from-cyan-400 dark:via-teal-400 dark:to-cyan-300 text-white dark:text-slate-950 font-black py-3.5 px-6 rounded-2xl text-center text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 group-hover:scale-102"
              >
                <span>Launch Universal Fan Application</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
              <Link
                href="/fan/map"
                className="px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black text-xs uppercase tracking-wider text-center border border-slate-300 dark:border-slate-700 transition-all shadow-sm"
              >
                3D Concourse Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Silicon Valley Enterprise Architecture Showcase */}
      <section id="architecture" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 border-t border-border relative z-10">
        <div className="text-center mb-12">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-primary block mb-2">
            PULSE Core Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Built for Enterprise Scale & Peak Reliability
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-2xl mx-auto mt-2">
            Every submodule engineered to perform under extreme high-density World Cup conditions with zero downtime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Autonomous Agent Loop",
              icon: "auto_awesome",
              color: "text-primary",
              bg: "bg-primary/10 border-primary/20",
              desc: "Gemini 2.5 Flash multi-hop function calling executes deep spatial reasoning, crowd density queries (`getZoneDensity`), and automated incident triage with trace logging.",
            },
            {
              title: "Multilingual Acoustic PA",
              icon: "record_voice_over",
              color: "text-accent",
              bg: "bg-accent/10 border-accent/20",
              desc: "Native neural speech synthesis speaks live operational alerts across English, Spanish, French, Hindi, Arabic, and Portuguese with Web Audio acoustic attention chimes.",
            },
            {
              title: "3D Digital Twin Simulation",
              icon: "view_in_ar",
              color: "text-violet-500",
              bg: "bg-violet-500/10 border-violet-500/20",
              desc: "Live spatial graph modeling turnstile rates, concourse walk times, and isometric heatmap layering for flagship event venues and mega-stadiums.",
            },
            {
              title: "Enterprise SSO & Role Security",
              icon: "admin_panel_settings",
              color: "text-green-500",
              bg: "bg-green-500/10 border-green-500/20",
              desc: "Military-grade clearance segregation for CTOs, COOs, Security Chiefs, and Event Operations Chiefs with one-click demo verification.",
            },
          ].map((card, i) => (
            <div key={i} className="bg-card/80 border border-border rounded-2xl p-6 fan-shadow flex flex-col justify-between">
              <div>
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${card.bg} ${card.color}`}>
                  <span className="material-symbols-outlined text-[26px]">{card.icon}</span>
                </div>
                <h3 className="text-base font-black text-foreground mb-2">{card.title}</h3>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">{card.desc}</p>
              </div>
              <div className="mt-6 pt-3 border-t border-border/50 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                <span>System Verified</span>
                <span className="w-2 h-2 rounded-full bg-green-500" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Enterprise Footer */}
      <footer className="border-t border-border bg-card/40 py-10 px-4 sm:px-8 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="font-black text-foreground tracking-tight text-lg">PULSE</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">
                Enterprise Suite
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              © 2026 PULSE Sports Tech & Event Management Engine · Engineered for Next-Gen Stadium Operations.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
            <Link href="/login" className="hover:text-foreground transition-colors">
              SSO Sign In
            </Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">
              Workspace Access
            </Link>
            <Link href="/control-room" className="hover:text-primary transition-colors">
              Command Suite
            </Link>
            <Link href="/fan" className="hover:text-accent transition-colors">
              Fan Hub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
