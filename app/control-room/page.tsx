"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { ZONES, INCIDENTS, densityColor, densityFill, Zone } from "@/lib/mockData";
import { Stadium3DEngine, SectorMetric } from "../components/Stadium3DEngine";

// ===== Heatmap SVG =====
function StadiumHeatmap({ zones, onZoneClick }: { zones: Zone[]; onZoneClick: (id: string) => void }) {
  return (
    <div className="flex-1 relative bg-card border border-border overflow-hidden rounded-2xl min-h-[380px] flex flex-col shadow-sm">
      <div className="scanline" />
      <svg className="flex-1 w-full h-full p-4 sm:p-8 opacity-95" viewBox="0 0 1000 600">
        <defs>
          <filter id="glow">
            <feGaussianBlur result="coloredBlur" stdDeviation="2" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M500,50 L850,150 L850,450 L500,550 L150,450 L150,150 Z"
          fill="none" stroke="var(--border)" strokeDasharray="8,4" strokeWidth="2.5"
        />
        <circle cx="500" cy="300" fill="none" r="120" stroke="var(--border)" strokeWidth="1.5" />
        <text x="500" y="305" textAnchor="middle" className="fill-muted-foreground text-xs font-black tracking-[0.3em]">PITCH</text>

        {zones.map((zone) => {
          const fill = densityFill(zone.density);
          const stroke = densityColor(zone.density);
          return (
            <g key={zone.id} onClick={() => onZoneClick(zone.id)} className="cursor-pointer transition-transform hover:scale-105">
              <path
                d={zone.pathD}
                fill={fill}
                stroke={stroke}
                strokeWidth="2"
                filter={zone.density === "critical" ? "url(#glow)" : undefined}
                className="transition-all duration-500 hover:opacity-80"
              />
              <text
                x={zone.labelX} y={zone.labelY}
                textAnchor="middle"
                fontSize="12"
                fontWeight="800"
                fill={stroke}
                className="pointer-events-none select-none drop-shadow-sm"
              >
                {`ZONE ${zone.id} [${zone.percent}%]`}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="absolute bottom-4 left-4 glass-card border border-border p-3 flex flex-wrap gap-4 sm:gap-6 rounded-xl z-10 shadow-md">
        <div>
          <div className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest">SENSOR NODES</div>
          <div className="text-lg sm:text-xl font-black text-accent tabular-nums tracking-tight">
            1,204 <span className="text-xs font-semibold uppercase text-muted-foreground">Online</span>
          </div>
        </div>
        <div className="border-l border-border pl-4">
          <div className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest">LATENCY</div>
          <div className="text-lg sm:text-xl font-black text-amber-500 tabular-nums tracking-tight">
            14ms <span className="text-xs font-semibold uppercase text-muted-foreground">Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Incident Queue =====
function IncidentQueue({ incidents }: { incidents: typeof INCIDENTS }) {
  const open = incidents.filter((i) => i.status !== "resolved");
  const criticalCount = open.filter((i) => i.severity === "critical").length;

  return (
    <section className="flex flex-col flex-1 min-h-[300px] overflow-hidden bg-card rounded-2xl border border-border p-3 sm:p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-red-500 text-[20px] fill-icon">warning</span>
          <span className="text-xs font-black uppercase tracking-widest text-foreground">Active Incident Queue</span>
        </div>
        {criticalCount > 0 && (
          <span className="text-[10px] font-black text-white bg-red-600 px-2.5 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
            {criticalCount} CRITICAL
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto custom-scrollbar pr-1">
        {open.map((incident) => (
          <Link key={incident.id} href={`/control-room/incidents/${incident.id}`}>
            <div className={`p-3.5 flex justify-between items-start cursor-pointer hover:scale-[1.01] transition-all rounded-xl border ${
              incident.severity === "critical"
                ? "bg-red-500/10 border-red-500/40"
                : incident.severity === "warning"
                ? "bg-amber-500/10 border-amber-500/40"
                : "bg-muted border-border"
            }`}>
              <div className="flex flex-col gap-1.5 flex-1 mr-2">
                <span className="text-xs font-black uppercase tracking-wider text-foreground">
                  {incident.title}
                </span>
                <span className="text-xs text-muted-foreground font-medium leading-relaxed">{incident.description.slice(0, 95)}...</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase ${
                    incident.status === "dispatched" ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
                  }`}>
                    {incident.status === "dispatched" ? "Dispatched" : "Open"}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">{incident.createdAt}</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-muted-foreground text-base flex-shrink-0 mt-1">chevron_right</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ===== Agent Trace Log =====
const INITIAL_LOGS = [
  { time: "00:00:01", text: "SYS_INIT: Booting PULSE Neural Control Core v2.5...", color: "var(--accent)" },
  { time: "00:00:02", text: "NET_SCAN: 1,204/1,205 IoT nodes handshake confirmed.", color: "var(--accent)" },
  { time: "00:00:04", text: "AI_AGENT: Potential bottleneck identified in ZONE A.", color: "#ff4b4b" },
  { time: "00:00:04", text: "TOOL_CALL: crowd__getZoneDensity({zoneId:'A'}) → {percent:94, trend:'rising'}", color: "var(--accent)" },
  { time: "00:00:05", text: "TOOL_CALL: crowd__forecastCongestion({zoneId:'A', horizon:15}) → {risk:'critical'}", color: "var(--accent)" },
  { time: "00:00:05", text: "AI_AGENT: Executing reroute recommendation protocol #82.", color: "var(--foreground)" },
  { time: "00:00:08", text: "HEATMAP: Refreshing spatial telemetry layers... (54k attendees)", color: "var(--muted-foreground)" },
  { time: "00:00:12", text: "SENSOR: Gate 4 OCR processing failed. Timeout after 3 retries.", color: "#ffb86c" },
];

function AgentTracePanel() {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      const text = `SENSOR_DATA: Polling gate node #${Math.floor(Math.random() * 12 + 1)} throughput (${Math.floor(Math.random() * 800 + 400)}/m)`;
      setLogs((prev) => [...prev.slice(-40), { time, text, color: "var(--muted-foreground)" }]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="h-[220px] sm:h-[250px] bg-card border border-border rounded-2xl flex flex-col overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-border bg-muted/40 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-accent text-[16px]">terminal</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Neural Engine Trace Log</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-bold">v2.5.0-LIVE</span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 font-mono text-[11px] leading-relaxed">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-muted-foreground flex-shrink-0 font-bold">[{log.time}]</span>
            <span style={{ color: log.color }}>{log.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </section>
  );
}

// ===== Mock Sectors for 3D Engine on Dashboard =====
const MOCK_SECTORS: SectorMetric[] = [
  { id: "SEC-A", name: "North Plaza Bowl (Gates 1-3)", capacity: 24000, current: 22680, percent: 94.5, status: "Critical", inflowRate: 1640, temp: 23.4, color: "#ef4444" },
  { id: "SEC-B", name: "East Concourse Tiers 1-2", capacity: 22000, current: 18480, percent: 84.0, status: "Moderate", inflowRate: 1120, temp: 22.8, color: "#f59e0b" },
  { id: "SEC-C", name: "South Palcos VIP & Suites", capacity: 21523, current: 19800, percent: 92.0, status: "Congested", inflowRate: 1380, temp: 21.9, color: "#f59e0b" },
  { id: "SEC-D", name: "West Media & Grandstand", capacity: 20000, current: 13852, percent: 69.3, status: "Optimal", inflowRate: 680, temp: 21.2, color: "#10b981" },
];

// ===== PULSE Ops Tactical AI Copilot Console =====
function OpsTacticalCopilot() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string; trace?: any[] }>>([
    {
      role: "assistant",
      content: "🛡️ **PULSE Tactical Command Copilot active (Role: OPS).**\nI am monitoring 8 stadium zones, 1,204 IoT nodes, and 3 open incidents across Dallas Stadium.\n\nAsk me for real-time Fruin LOS density briefings, CCTV deployments, or turnstile rerouting advisories.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          role: "ops",
          history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
          context: "Command Officer in Master Control Room requesting operational briefing, security deployment, or crowd rerouting.",
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Briefing generated.", trace: data.toolTrace },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ **Tactical Telemetry Briefing:**\nZone A density is at 7.57 p/m² (LOS E Critical). Recommend diverting incoming footfall at Gate 3 to Concourse B Locker Bay #4 immediately.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-card border border-primary/40 rounded-2xl flex flex-col overflow-hidden shadow-md min-h-[360px] max-h-[440px]">
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border bg-primary/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px] animate-pulse">support_agent</span>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-foreground">Ops Tactical AI Advisor</div>
            <div className="text-[9px] font-mono font-bold text-primary">ROLE: OPS COMMAND · LEVEL 5</div>
          </div>
        </div>
        <span className="text-[10px] font-extrabold uppercase bg-primary text-primary-foreground px-2 py-0.5 rounded-full shadow-2xs">
          Live Telemetry
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 text-xs">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`p-3 rounded-2xl max-w-[92%] leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground font-semibold rounded-br-2xs shadow-2xs"
                  : "bg-muted/80 border border-border text-foreground font-medium rounded-bl-2xs shadow-2xs"
              }`}
            >
              {m.content}
            </div>
            {m.trace && m.trace.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {m.trace.map((t: any, i: number) => (
                  <span key={i} className="text-[9px] font-mono bg-accent/15 text-accent border border-accent/30 px-1.5 py-0.5 rounded-md">
                    ⚡ {t.tool} ({t.durationMs}ms)
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono p-2 bg-muted/40 rounded-xl w-fit">
            <span className="material-symbols-outlined text-primary text-sm animate-spin">autorenew</span>
            <span>Synthesizing command telemetry...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-2 border-t border-border bg-muted/30 flex items-center gap-2 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Ops AI: e.g. 'Status of Gate 3 security?' or 'Reroute Zone A'..."
          className="flex-1 bg-card border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground px-3.5 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1 shadow-xs"
        >
          <span className="material-symbols-outlined text-sm">send</span>
        </button>
      </form>
    </section>
  );
}

import { usePulseSync } from "@/lib/usePulseSync";

export default function ControlRoomDashboard() {
  const { zones, incidents } = usePulseSync();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [centerMode, setCenterMode] = useState<"3d" | "heatmap">("3d");
  const [viewLayer, setViewLayer] = useState<"isometric" | "heatmap" | "turnstile" | "optical">("isometric");
  const [selectedSector, setSelectedSector] = useState<SectorMetric>(MOCK_SECTORS[0]);

  const totalAttendees = zones.reduce((acc, z) => acc + Math.round((z.capacity * z.percent) / 100), 0) || 74812;
  const totalCapacity = zones.reduce((acc, z) => acc + z.capacity, 0) || 87523;
  const capacityPct = Math.round((totalAttendees / totalCapacity) * 100);

  return (
    <div className="p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[calc(100vh-4rem)]">
      {/* QUICK CONSOLE LAUNCHER BAR */}
      <section className="lg:col-span-12">
        <div className="bg-card/90 border border-border rounded-3xl p-4 sm:p-5 fan-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">rocket_launch</span>
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-foreground">
                Executive Command Modules & Quick Navigation
              </h2>
            </div>
            <span className="text-[10px] font-extrabold uppercase bg-primary/15 text-primary px-2.5 py-1 rounded-md">
              Level 5 Command
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link href="/control-room/stadiums" className="group">
              <div className="bg-muted/70 hover:bg-card border border-border hover:border-accent/60 rounded-2xl p-4 transition-all flex items-center gap-3 shadow-2xs group-hover:scale-[1.02]">
                <div className="w-11 h-11 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">view_in_ar</span>
                </div>
                <div>
                  <h3 className="text-xs font-black text-foreground uppercase tracking-wider group-hover:text-accent transition-colors">
                    3D Digital Twin
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-semibold leading-tight mt-0.5">
                    Full flagship telemetry suite
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/control-room/broadcast" className="group">
              <div className="bg-muted/70 hover:bg-card border border-border hover:border-primary/60 rounded-2xl p-4 transition-all flex items-center gap-3 shadow-2xs group-hover:scale-[1.02]">
                <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">campaign</span>
                </div>
                <div>
                  <h3 className="text-xs font-black text-foreground uppercase tracking-wider group-hover:text-primary transition-colors">
                    Neural PA Broadcast
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-semibold leading-tight mt-0.5">
                    6-Lang AI translations & acoustic speech engine
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/control-room/zones" className="group">
              <div className="bg-muted/70 hover:bg-card border border-border hover:border-amber-500/60 rounded-2xl p-4 transition-all flex items-center gap-3 shadow-2xs group-hover:scale-[1.02]">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">grid_view</span>
                </div>
                <div>
                  <h3 className="text-xs font-black text-foreground uppercase tracking-wider group-hover:text-amber-500 transition-colors">
                    Zone Analytics
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-semibold leading-tight mt-0.5">
                    Turnstile rates, capacity forecast & gate nodes
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/control-room/incidents" className="group">
              <div className="bg-muted/70 hover:bg-card border border-border hover:border-red-500/60 rounded-2xl p-4 transition-all flex items-center gap-3 shadow-2xs group-hover:scale-[1.02]">
                <div className="w-11 h-11 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">warning</span>
                </div>
                <div>
                  <h3 className="text-xs font-black text-foreground uppercase tracking-wider group-hover:text-red-500 transition-colors">
                    Incident Command Hub
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-semibold leading-tight mt-0.5">
                    Full security triage, dispatch logs & deep-dive
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CENTERPIECE: 3D DIGITAL TWIN vs 2D HEATMAP TOGGLE (8 cols) */}
      <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4 min-h-0">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border rounded-2xl p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-accent text-xl">layers</span>
            <span className="text-xs font-black uppercase tracking-wider text-foreground">
              Command Stage View Mode
            </span>
          </div>

          <div className="flex items-center gap-2 bg-muted p-1 rounded-xl border border-border">
            <button
              onClick={() => setCenterMode("3d")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-1.5 ${
                centerMode === "3d"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-sm font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="material-symbols-outlined text-base">view_in_ar</span>
              <span>3D Digital Twin (Canvas)</span>
            </button>
            <button
              onClick={() => setCenterMode("heatmap")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-1.5 ${
                centerMode === "heatmap"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-sm font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="material-symbols-outlined text-base">map</span>
              <span>2D Zone Heatmap</span>
            </button>
          </div>
        </div>

        {centerMode === "3d" ? (
          <div className="space-y-4">
            <Stadium3DEngine
              stadiumId="dallas"
              stadiumName="Dallas Stadium Command Center"
              viewLayer={viewLayer}
              isScanning={false}
              sectors={MOCK_SECTORS}
              selectedSectorId={selectedSector.id}
              onSelectSector={(sec) => setSelectedSector(sec)}
            />
            {/* Quick layer switchers below 3D */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-card border border-border rounded-2xl p-3 shadow-sm">
              <span className="text-[11px] font-bold text-muted-foreground">3D Layer Mode:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: "isometric", label: "3D Twin" },
                  { id: "heatmap", label: "Crowd Heat" },
                  { id: "turnstile", label: "Gate Inflow" },
                  { id: "optical", label: "Optical AR" },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setViewLayer(l.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                      viewLayer === l.id ? "bg-accent text-slate-950" : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <StadiumHeatmap zones={zones} onZoneClick={setSelectedZone} />
        )}
      </section>

      {/* RIGHT SIDEBAR: Incidents + Ops Copilot + Agent Trace (4 cols) */}
      <aside className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 min-h-0">
        <OpsTacticalCopilot />
        <IncidentQueue incidents={incidents} />
        <AgentTracePanel />
      </aside>
    </div>
  );
}
