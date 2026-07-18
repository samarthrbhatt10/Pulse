"use client";
import { useState } from "react";
import { ZONES, densityColor } from "@/lib/mockData";
import { usePulseSync } from "@/lib/usePulseSync";

const AMENITIES = [
  { id: "seat-104", x: 290, y: 150, icon: "event_seat", label: "Seat 104-08", color: "var(--primary)", desc: "Your Assigned Match Ticket Seat" },
  { id: "locker-bay-4", x: 210, y: 220, icon: "lock_clock", label: "Locker Bay #4", color: "#10b981", desc: "Express F&B Pickup Bay (Concourse B)" },
  { id: "restroom-B", x: 330, y: 340, icon: "wc", label: "Restroom B", color: "var(--accent)", desc: "North Bowl Restroom (Concourse B)" },
  { id: "food-grill", x: 80, y: 220, icon: "fastfood", label: "Smash Burger Bay", color: "var(--coral)", desc: "Concourse A Standard Queue" },
  { id: "first-aid", x: 210, y: 300, icon: "medical_services", label: "First Aid Hub", color: "#ef4444", desc: "Medical Emergency & Paramedics" },
];

export default function FanMapPage() {
  const { zones } = usePulseSync();
  const [destination, setDestination] = useState<string>("locker-bay-4");
  const [aiMessage, setAiMessage] = useState(
    "Optimal Route to Locker Bay #4: Head north from Gate 3 through Concourse B. This avoids the heavy Fruin LOS E critical congestion in Concourse A (94.5% capacity) and gets your F&B bundle in just 2 minutes 15 seconds."
  );
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [arActive, setArActive] = useState(false);

  async function handleQuery(query: string) {
    setInputVal(query);
    setLoading(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, role: "fan", context: "Fan is inside Dallas Stadium heading from Section 104 Row 12 to Concourse amenities" }),
      });
      const data = await res.json();
      setAiMessage(data.reply || aiMessage);
    } catch {
      setAiMessage("Follow Concourse B straight to Locker Bay #4. Route is clear with a 2-minute walking duration per Fruin LOS A metrics.");
    } finally {
      setLoading(false);
      setInputVal("");
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] max-w-6xl mx-auto gap-5 pb-8">
      {/* Top Wayfinding Banner */}
      <div className="bg-card border border-border rounded-3xl p-4 sm:p-5 fan-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-[26px]">navigation</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider">
                Fruin LOS Optimal Route
              </span>
              <span className="text-xs font-extrabold text-muted-foreground">Turn-by-Turn Indoor Guidance</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight mt-0.5">
              {AMENITIES.find((a) => a.id === destination)?.label ?? "Section 104, Seat 8"} — Live Guidance
            </h1>
            <p className="text-xs text-accent font-bold mt-0.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">directions_walk</span>
              <span>
                {destination === "locker-bay-4"
                  ? "2m 15s walk (180m) — via Concourse B Express (LOS A Normal)"
                  : destination === "restroom-B"
                  ? "3m 30s walk (260m) — via South Corridor"
                  : "4m walk (340m) — via Concourse A"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setArActive(!arActive)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all shadow-sm ${
              arActive
                ? "bg-gradient-to-r from-violet-600 to-primary text-white scale-105"
                : "bg-muted border border-border text-foreground hover:bg-muted/80"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
            <span>{arActive ? "AR Guidance ON" : "AR Camera Mode"}</span>
          </button>

          <button
            onClick={() => setDestination("locker-bay-4")}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-black text-emerald-500 hover:bg-emerald-500/25 transition-all"
          >
            F&B Bay #4 🍔
          </button>
          <button
            onClick={() => setDestination("restroom-B")}
            className="px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            Restrooms 🚻
          </button>
        </div>
      </div>

      {/* Main Grid: 3D Map + Crowd Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Canvas (7 cols) */}
        <div className="lg:col-span-7 h-[440px] sm:h-[520px] bg-card rounded-3xl relative overflow-hidden border border-border fan-shadow flex flex-col">
          {/* Live Position Overlay */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
            <div className="glass-card px-3.5 py-1.5 rounded-xl border border-border flex items-center gap-2 pointer-events-auto shadow-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-foreground">Live coordinate tracking: Section 104 Mesh</span>
            </div>
            <div className="glass-card px-3 py-1.5 rounded-xl border border-border flex items-center gap-1.5 text-xs font-bold text-primary pointer-events-auto">
              <span className="material-symbols-outlined text-[16px]">bluetooth</span>
              <span>UWB Beacon: Connected</span>
            </div>
          </div>

          {/* Isometric / AR View Stage */}
          {arActive ? (
            <div className="flex-1 w-full bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950 flex flex-col items-center justify-center p-6 relative">
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:20px_20px]" />
              <div className="w-28 h-28 rounded-full border-4 border-emerald-500/50 animate-ping absolute" />
              <div className="glass-card p-6 rounded-3xl border border-white/20 text-center z-10 max-w-sm">
                <span className="material-symbols-outlined text-emerald-400 text-[56px] animate-bounce">
                  turn_right
                </span>
                <h3 className="text-xl font-black text-white mt-2">Turn Right onto Concourse B</h3>
                <p className="text-xs text-slate-300 font-medium mt-1">
                  Avoid Concourse A (High Density). Concourse B is clear with direct access to Locker Bay #4.
                </p>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-xs font-bold text-emerald-400">
                  <span>Next Turn: 60m ahead</span>
                  <span>ETA: 2m 15s</span>
                </div>
              </div>
            </div>
          ) : (
            <svg className="flex-1 w-full h-full p-6" viewBox="0 0 400 500">
              <defs>
                <linearGradient id="routeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Stadium Bowl Outline */}
              <path
                d="M50 100 Q 200 40 350 100 L 370 410 Q 200 460 30 410 Z"
                fill="rgba(119,1,208,0.05)"
                stroke="var(--primary)"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
              <path
                d="M90 140 Q 200 90 310 140 L 320 370 Q 200 410 80 370 Z"
                fill="none"
                stroke="var(--border)"
                strokeWidth="1.5"
              />

              <text x="200" y="260" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)" fontWeight="900" opacity="0.35" letterSpacing="4">
                DALLAS STADIUM PITCH
              </text>

              {/* Amenity Markers */}
              {AMENITIES.map((am) => (
                <g key={am.id} onClick={() => setDestination(am.id)} className="cursor-pointer transition-transform hover:scale-110">
                  <rect
                    x={am.x - 18}
                    y={am.y - 18}
                    width="36"
                    height="36"
                    rx="10"
                    fill="var(--card)"
                    stroke={am.color}
                    strokeWidth={destination === am.id ? "3" : "1.5"}
                  />
                  <text
                    x={am.x}
                    y={am.y + 6}
                    textAnchor="middle"
                    fontSize="18"
                    fontFamily="Material Symbols Outlined"
                    fill={am.color}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {am.icon === "event_seat" ? "💺" : am.icon === "lock_clock" ? "🔒" : am.icon === "wc" ? "🚻" : am.icon === "fastfood" ? "🍔" : "🏥"}
                  </text>
                  <text x={am.x} y={am.y + 30} textAnchor="middle" fontSize="10" fill="var(--foreground)" fontWeight="900">
                    {am.label}
                  </text>
                </g>
              ))}

              {/* Current Position Dot (Section 104) */}
              <circle cx="110" cy="380" r="14" fill="rgba(0,219,231,0.2)" />
              <circle cx="110" cy="380" r="7" fill="var(--accent)" className="pulse-teal" />
              <text x="110" y="408" textAnchor="middle" fontSize="10" fill="var(--accent)" fontWeight="900">YOU (Sec 104)</text>

              {/* Curved Animated Path to Destination */}
              {destination && (
                <path
                  d={`M110 380 C 130 260, 220 200, ${AMENITIES.find((a) => a.id === destination)?.x ?? 210} ${(AMENITIES.find((a) => a.id === destination)?.y ?? 220) + 12}`}
                  fill="none"
                  stroke="url(#routeGrad)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeDasharray="8 6"
                  className="animate-[dash_3s_linear_infinite]"
                />
              )}
            </svg>
          )}

          {/* Map Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
            <button
              onClick={() => setDestination("seat-104")}
              className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase shadow-md active:scale-95"
            >
              Reset to Seat
            </button>
          </div>
        </div>

        {/* Right Navigation & Telemetry Console (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Real ZONES Fruin LOS Density Panel */}
          <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 fan-shadow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500 text-[20px]">groups</span>
                <h2 className="text-sm font-black uppercase tracking-wider text-foreground">Live Concourse Density</h2>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground">Fruin LOS Telemetry</span>
            </div>

            <div className="space-y-3">
              {zones.map((z) => (
                <div key={z.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-foreground">Zone {z.id} ({z.name.split(" ")[0]})</span>
                    <span className="font-mono font-extrabold" style={{ color: densityColor(z.density) }}>
                      {z.percent}% · {z.densityValue?.toFixed(1)} p/m² ({z.density.toUpperCase()})
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ background: densityColor(z.density), width: `${z.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Navigation Advice Card */}
          <div className="bg-gradient-to-br from-card via-muted/40 to-card border border-border rounded-3xl p-5 fan-shadow space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-500">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Gemini Smart Route Advisor</span>
            </div>

            <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed bg-card/80 p-3.5 rounded-2xl border border-border">
              {aiMessage}
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && inputVal && handleQuery(inputVal)}
                placeholder="Ask route assistant (e.g. Is Concourse C clear?)..."
                className="flex-1 bg-card border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => inputVal && handleQuery(inputVal)}
                disabled={loading}
                className="px-3.5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-extrabold shadow-sm active:scale-95 transition-all"
              >
                Ask
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
