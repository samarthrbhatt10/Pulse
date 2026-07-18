"use client";
import { useState, useEffect } from "react";
import { Stadium3DEngine, SectorMetric, GateNode } from "../../components/Stadium3DEngine";

interface StadiumTelemetry {
  id: string;
  name: string;
  city: string;
  match: string;
  matchTime: string;
  capacity: number;
  liveFootfall: number;
  occupancyPercent: number;
  turnstileThroughput: number;
  nfcTickets: number;
  biometricTickets: number;
  concessionRevenue: string;
  concessionVelocity: string;
  weather: string;
  pitchHumidity: string;
  sectors: SectorMetric[];
}

const DALLAS_STADIUM: StadiumTelemetry = {
  id: "dallas",
  name: "Dallas Stadium — Central Command",
  city: "Dallas, TX, USA · Semifinal & Final Venue",
  match: "HOME CLUB vs VISITORS (Championship Series)",
  matchTime: "LIVE · 74' MIN (2-1)",
  capacity: 94000,
  liveFootfall: 80370,
  occupancyPercent: 85.5,
  turnstileThroughput: 4820,
  nfcTickets: 68110,
  biometricTickets: 12260,
  concessionRevenue: "$894,920",
  concessionVelocity: "$15,410 / min",
  weather: "22°C Clear · Wind 14 km/h NW",
  pitchHumidity: "42% Optimal",
  sectors: [
    { id: "SEC-A", name: "North Plaza Bowl (Gates 1-3)", capacity: 26000, current: 24570, percent: 94.5, status: "Critical", inflowRate: 1640, temp: 23.4, color: "#ef4444" },
    { id: "SEC-B", name: "East Concourse Tiers 1-2", capacity: 24000, current: 20160, percent: 84.0, status: "Moderate", inflowRate: 1120, temp: 22.8, color: "#f59e0b" },
    { id: "SEC-C", name: "South VIP & Suites", capacity: 23000, current: 21160, percent: 92.0, status: "Congested", inflowRate: 1380, temp: 21.9, color: "#f59e0b" },
    { id: "SEC-D", name: "West Media & Grandstand", capacity: 21000, current: 14480, percent: 69.0, status: "Optimal", inflowRate: 680, temp: 21.2, color: "#10b981" },
  ],
};

const OTHER_STADIUMS: StadiumTelemetry[] = [
  {
    ...DALLAS_STADIUM,
    id: "mexico-city",
    name: "Mexico City Stadium — South Command",
    city: "Mexico City, Mexico · Opening Match Venue",
    match: "DIVISION ALPHA vs DIVISION BETA (Playoffs)",
    matchTime: "HALFTIME · 45' (1-1)",
    capacity: 87523,
    liveFootfall: 84022,
    occupancyPercent: 96.0,
    turnstileThroughput: 5120,
    concessionRevenue: "$912,400",
    concessionVelocity: "$16,800 / min",
    sectors: [
      { id: "SEC-100", name: "Lower Bowl 100s", capacity: 32000, current: 31360, percent: 98.0, status: "Critical", inflowRate: 1840, temp: 21.5, color: "#ef4444" },
      { id: "SEC-200", name: "Mezzanine Club 200s", capacity: 24000, current: 22560, percent: 94.0, status: "Critical", inflowRate: 1420, temp: 21.0, color: "#ef4444" },
      { id: "SEC-300", name: "Upper Grandstand 300s", capacity: 31523, current: 30102, percent: 95.5, status: "Congested", inflowRate: 1860, temp: 20.2, color: "#f59e0b" },
    ],
  },
  {
    ...DALLAS_STADIUM,
    id: "new-york-new-jersey",
    name: "New York New Jersey Stadium — North Command",
    city: "East Rutherford, NJ, USA · Semifinal Venue",
    match: "STARS vs CHALLENGERS (Invitational Cup)",
    matchTime: "LIVE · 18' MIN (0-0)",
    capacity: 82500,
    liveFootfall: 78457,
    occupancyPercent: 95.1,
    turnstileThroughput: 3940,
    concessionRevenue: "$840,100",
    concessionVelocity: "$13,900 / min",
    sectors: [
      { id: "NYNJ-A", name: "Infinity Screen Bowl", capacity: 28000, current: 26768, percent: 95.6, status: "Critical", inflowRate: 1540, temp: 22.1, color: "#ef4444" },
      { id: "NYNJ-B", name: "Canyon Concourse", capacity: 28500, current: 26077, percent: 91.5, status: "Congested", inflowRate: 1320, temp: 21.8, color: "#f59e0b" },
      { id: "NYNJ-C", name: "Patio VIP Suites", capacity: 26000, current: 25740, percent: 99.0, status: "Critical", inflowRate: 1080, temp: 21.4, color: "#ef4444" },
    ],
  },
];

export default function DribbbleStadiumAnalyticsPage() {
  const [activeStadium, setActiveStadium] = useState<StadiumTelemetry>(DALLAS_STADIUM);
  const [selectedSector, setSelectedSector] = useState<SectorMetric>(DALLAS_STADIUM.sectors[0]);
  const [selectedGate, setSelectedGate] = useState<GateNode | null>(null);
  const [viewLayer, setViewLayer] = useState<"isometric" | "heatmap" | "turnstile" | "optical">("isometric");
  const [cameraFeed, setCameraFeed] = useState<string>("CAM-04 Gate 4");
  const [isScanning, setIsScanning] = useState(false);
  const [aiProtocolStatus, setAiProtocolStatus] = useState<string | null>(null);

  const [liveFootfall, setLiveFootfall] = useState(DALLAS_STADIUM.liveFootfall);
  const [livePulseRate, setLivePulseRate] = useState(DALLAS_STADIUM.turnstileThroughput);

  useEffect(() => {
    setLiveFootfall(activeStadium.liveFootfall);
    setLivePulseRate(activeStadium.turnstileThroughput);
    setSelectedSector(activeStadium.sectors[0]);
    setSelectedGate(null);
  }, [activeStadium]);

  // Micro-fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveFootfall((prev) => Math.min(activeStadium.capacity, prev + Math.floor(Math.random() * 22 - 8)));
      setLivePulseRate((prev) => Math.max(3200, Math.min(6800, prev + Math.floor(Math.random() * 140 - 70))));
    }, 2500);
    return () => clearInterval(interval);
  }, [activeStadium]);

  const handlePulseScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2200);
  };

  const handleExecuteAiProtocol = () => {
    setAiProtocolStatus("EXECUTING AUTONOMOUS REROUTE TO GATE 6 NFC EXPRESS...");
    setTimeout(() => {
      setAiProtocolStatus("✅ REROUTE SUCCESSFUL: 420 Fans diverted · Concourse pressure normal.");
      setTimeout(() => setAiProtocolStatus(null), 5000);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 space-y-6 font-sans transition-colors duration-200">
      {/* Real-World Official Sponsor Header Ribbon */}
      <div className="w-full bg-card dark:bg-gradient-to-r dark:from-slate-900 dark:via-cyan-950/60 dark:to-slate-900 border border-border dark:border-slate-800 rounded-2xl py-2.5 px-4 flex items-center justify-between overflow-hidden shadow-sm dark:shadow-lg transition-colors">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 font-mono text-[10px] font-black uppercase tracking-wider">
            ★ OFFICIAL SPONSOR NETWORK
          </span>
          <span className="text-xs font-mono font-bold text-muted-foreground dark:text-slate-300 hidden sm:inline">
            OFFICIAL EVENT TELEMETRY SUITE
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono font-black text-teal-600 dark:text-cyan-300 overflow-x-auto whitespace-nowrap scrollbar-none">
          <span>GLOBAL BEVERAGES®</span>
          <span className="text-muted-foreground dark:text-slate-600">|</span>
          <span>AERO-DYNAMICS®</span>
          <span className="text-muted-foreground dark:text-slate-600">|</span>
          <span>VERTEX PAYMENTS®</span>
          <span className="text-muted-foreground dark:text-slate-600">|</span>
          <span>HYPER-DRIVE®</span>
          <span className="text-muted-foreground dark:text-slate-600">|</span>
          <span>SKYLINE AIRWAYS®</span>
          <span className="text-muted-foreground dark:text-slate-600">|</span>
          <span>NEXUS ASSETS®</span>
        </div>
      </div>

      {/* Top Dribbble Hero Banner */}
      <div className="bg-card dark:bg-slate-900/90 backdrop-blur-2xl border border-border dark:border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-2xl relative overflow-hidden transition-colors">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-black tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                <span>3D DIGITAL TWIN & REAL-TIME ANALYTICS</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-muted dark:bg-slate-800/90 border border-border dark:border-slate-700 text-foreground dark:text-slate-300 font-mono text-xs font-bold">
                {activeStadium.match}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 font-mono text-xs font-extrabold animate-pulse">
                {activeStadium.matchTime}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-foreground via-primary to-emerald-600 dark:from-white dark:via-slate-100 dark:to-emerald-400 bg-clip-text text-transparent">
              {activeStadium.name}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground dark:text-slate-400 font-medium flex items-center gap-4 flex-wrap">
              <span>📍 {activeStadium.city}</span>
              <span>🌤️ {activeStadium.weather}</span>
              <span>🌱 Pitch Humidity: {activeStadium.pitchHumidity}</span>
            </p>
          </div>

          {/* Multi-Stadium Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {[DALLAS_STADIUM, ...OTHER_STADIUMS].map((st) => (
              <button
                key={st.id}
                onClick={() => setActiveStadium(st)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border flex items-center gap-2 ${
                  activeStadium.id === st.id
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white dark:text-slate-950 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105 font-extrabold"
                    : "bg-card dark:bg-slate-900/90 border-border dark:border-slate-800 text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-white hover:border-border dark:hover:border-slate-700"
                }`}
              >
                <span>{st.id === "dallas" ? "🏟️ Dallas Stadium" : st.id === "mexico-city" ? "🏟️ Mexico City Stadium" : "🏟️ NY/NJ Stadium"}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 3-Column Dribbble Real-World Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Real-Time Attendance Gauge & Velocity Charts (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Circular Occupancy & Footfall Index */}
          <div className="bg-card dark:bg-slate-900/90 backdrop-blur-xl border border-border dark:border-slate-800 rounded-3xl p-6 shadow-md dark:shadow-xl relative overflow-hidden group hover:border-border dark:hover:border-slate-700 transition-all">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-slate-400 block">
              Real-Time Occupancy Index
            </span>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-foreground dark:text-white tabular-nums tracking-tight">
                  {((liveFootfall / activeStadium.capacity) * 100).toFixed(1)}%
                </div>
                <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {liveFootfall.toLocaleString()} / {activeStadium.capacity.toLocaleString()}
                </div>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 dark:border-t-emerald-400 flex items-center justify-center font-black text-xs text-emerald-600 dark:text-emerald-400 animate-spin-slow">
                ⚡
              </div>
            </div>
            <div className="w-full bg-muted dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${(liveFootfall / activeStadium.capacity) * 100}%` }}
              />
            </div>
          </div>

          {/* Turnstile Inflow Velocity Gauge */}
          <div className="bg-card dark:bg-slate-900/90 backdrop-blur-xl border border-border dark:border-slate-800 rounded-3xl p-6 shadow-md dark:shadow-xl space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-slate-400">
                Turnstile Throughput
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[10px] font-mono font-black">
                GATES 1-12 ACTIVE
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400 tabular-nums tracking-tight">
                {livePulseRate.toLocaleString()} <span className="text-xs text-muted-foreground dark:text-slate-400 font-bold">fans/min</span>
              </div>
              <p className="text-xs text-muted-foreground dark:text-slate-400 font-medium mt-1">
                Peak inflow currently at <strong className="text-foreground dark:text-white">Gate 4 (East Palcos VIP)</strong>
              </p>
            </div>

            {/* Sparkline SVG Chart Simulation */}
            <div className="pt-2">
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground dark:text-slate-500 mb-1">
                <span>-30 MIN</span>
                <span>-15 MIN</span>
                <span>NOW</span>
              </div>
              <div className="h-16 w-full flex items-end gap-1.5 pt-2">
                {[42, 55, 68, 80, 92, 74, 88, 95, 82, 90, 98, 100].map((h, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 rounded-t transition-all duration-300 ${
                      idx === 11 ? "bg-gradient-to-t from-cyan-600 to-cyan-300 shadow-[0_0_10px_cyan]" : "bg-muted dark:bg-slate-800 hover:bg-muted-foreground/30 dark:hover:bg-slate-700"
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Ticket Verification & Biometric Split */}
          <div className="bg-card dark:bg-slate-900/90 backdrop-blur-xl border border-border dark:border-slate-800 rounded-3xl p-6 shadow-md dark:shadow-xl space-y-3 transition-colors">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-slate-400">
              <span>Pass Authentication</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">100% VERIFIED</span>
            </div>
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-foreground dark:text-slate-300">NFC Digital Wallet Passes</span>
                  <span className="text-foreground dark:text-white font-mono">{activeStadium.nfcTickets.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-muted dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 dark:bg-cyan-400 rounded-full" style={{ width: "86%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-foreground dark:text-slate-300">Biometric Express Fast-Pass</span>
                  <span className="text-foreground dark:text-white font-mono">{activeStadium.biometricTickets.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-muted dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 dark:bg-violet-400 rounded-full" style={{ width: "14%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Hero Column: Interactive 3D WebGL/Canvas Stadium Engine (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Layer Controls Bar */}
          <div className="bg-card dark:bg-slate-900/90 backdrop-blur-xl border border-border dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-md dark:shadow-xl flex flex-wrap items-center justify-between gap-3 transition-colors">
            <div className="flex items-center gap-1.5 bg-muted dark:bg-slate-950 p-1.5 rounded-2xl border border-border dark:border-slate-800">
              {[
                { id: "isometric", label: "3D Twin", icon: "view_in_ar" },
                { id: "heatmap", label: "Crowd Heat", icon: "local_fire_department" },
                { id: "turnstile", label: "Gate Inflow", icon: "meeting_room" },
                { id: "optical", label: "Optical AR", icon: "videocam" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setViewLayer(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 ${
                    viewLayer === tab.id
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white dark:text-slate-950 shadow-md scale-102 font-extrabold"
                      : "text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-white"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handlePulseScan}
              disabled={isScanning}
              className="px-4 py-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-600 dark:text-cyan-300 font-black text-xs uppercase tracking-wider hover:bg-cyan-500/25 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              <span className={`material-symbols-outlined text-[18px] ${isScanning ? "animate-spin" : ""}`}>
                radar
              </span>
              <span>{isScanning ? "Scanning Matrix..." : "Scan Telemetry"}</span>
            </button>
          </div>

          {/* The High-Performance 3D Stadium Canvas */}
          <Stadium3DEngine
            stadiumId={activeStadium.id}
            stadiumName={activeStadium.name}
            viewLayer={viewLayer}
            isScanning={isScanning}
            sectors={activeStadium.sectors}
            selectedSectorId={selectedSector?.id}
            onSelectSector={(sec) => setSelectedSector(sec)}
            onSelectGate={(gate) => setSelectedGate(gate)}
          />

          {/* Optical AI Surveillance & Camera Switcher Bar */}
          <div className="bg-card dark:bg-slate-900/90 backdrop-blur-xl border border-border dark:border-slate-800 rounded-3xl p-5 shadow-md dark:shadow-xl space-y-3 transition-colors">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase text-muted-foreground dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-base">videocam</span>
                Optical AI Surveillance Matrix
              </span>
              <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400">4K OPTICAL FEED LIVE</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: "CAM-04 Gate 4", label: "Gate 4 Turnstile", desc: "Queue analysis" },
                { id: "CAM-12 North VIP", label: "North Plaza VIP", desc: "Biometric node" },
                { id: "CAM-18 Pitch AR", label: "Pitch Perimeter", desc: "Player/Ball Optical Tracking" },
                { id: "CAM-22 Concourse", label: "Concourse C Bowl", desc: "Heatmap monitoring" },
              ].map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => setCameraFeed(cam.id)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    cameraFeed === cam.id
                      ? "bg-cyan-500/15 border-cyan-500 dark:border-cyan-400 text-foreground dark:text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                      : "bg-muted dark:bg-slate-950/80 border-border dark:border-slate-800 text-muted-foreground dark:text-slate-400 hover:border-border dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-black text-cyan-600 dark:text-cyan-400">{cam.id.split(" ")[0]}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                  </div>
                  <span className="text-[11px] font-bold text-foreground dark:text-white mt-1 block truncate">{cam.label}</span>
                  <span className="text-[9px] text-muted-foreground dark:text-slate-400 mt-0.5">{cam.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Sector Micro-Triage, Autonomous AI & Concessions (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Selected Sector Drilldown & AI Intervention Card */}
          <div className="bg-card dark:bg-slate-900/90 backdrop-blur-xl border border-border dark:border-slate-800 rounded-3xl p-6 shadow-md dark:shadow-xl space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-border dark:border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                {selectedGate ? "Gate Node Analysis" : "Sector Micro-Triage"}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                  selectedGate?.status === "Bottleneck" || selectedSector.status === "Critical"
                    ? "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/40"
                    : "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40"
                }`}
              >
                {selectedGate ? selectedGate.status : selectedSector.status}
              </span>
            </div>

            {selectedGate ? (
              <div>
                <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">{selectedGate.id}</span>
                <h3 className="text-lg font-black text-foreground dark:text-white">{selectedGate.name}</h3>
                <div className="text-xs text-muted-foreground dark:text-slate-400 font-semibold mt-1">
                  Current Throughput: <strong className="text-foreground dark:text-white font-mono">{selectedGate.rate} fans/min</strong>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">{selectedSector.id}</span>
                <h3 className="text-lg font-black text-foreground dark:text-white">{selectedSector.name}</h3>
                <div className="text-xs text-muted-foreground dark:text-slate-400 font-semibold mt-1">
                  {selectedSector.current.toLocaleString()} / {selectedSector.capacity.toLocaleString()} fans (`{selectedSector.percent}%`)
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="bg-muted dark:bg-slate-950 p-3 rounded-2xl border border-border dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-muted-foreground dark:text-slate-400 block">Inflow Velocity</span>
                <span className="text-base font-black text-foreground dark:text-white font-mono mt-0.5 block">
                  {selectedGate ? selectedGate.rate : selectedSector.inflowRate} <span className="text-[10px] text-muted-foreground dark:text-slate-400">/min</span>
                </span>
              </div>
              <div className="bg-muted dark:bg-slate-950 p-3 rounded-2xl border border-border dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-muted-foreground dark:text-slate-400 block">HVAC Temp</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                  {selectedSector.temp}°C
                </span>
              </div>
            </div>

            {/* Autonomous Gemini AI Action Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/15 via-card to-emerald-500/15 dark:via-slate-900 border border-cyan-500/40 space-y-2.5">
              <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-base">auto_awesome</span>
                <span>Autonomous Gemini AI Reroute</span>
              </div>
              <p className="text-xs text-foreground dark:text-slate-300 font-medium leading-relaxed">
                {selectedSector.status === "Critical" || selectedGate?.status === "Bottleneck"
                  ? "High density threshold detected. Autonomous AI suggests diverting 350 fans to Gate 6 NFC Express portal and boosting concourse HVAC by +15%."
                  : "Concourse flow index optimal. Maintain thermal circulation and standard ingress velocity."}
              </p>
              {aiProtocolStatus ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-bold animate-pulse">
                  {aiProtocolStatus}
                </div>
              ) : (
                <button
                  onClick={handleExecuteAiProtocol}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-95 text-white dark:text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  <span>Execute AI Reroute Protocol</span>
                </button>
              )}
            </div>
          </div>

          {/* Concessions & F&B Velocity */}
          <div className="bg-card dark:bg-slate-900/90 backdrop-blur-xl border border-border dark:border-slate-800 rounded-3xl p-6 shadow-md dark:shadow-xl space-y-3 transition-colors">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-slate-400">
              <span>Concession & F&B Velocity</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">PEAK SALES</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-foreground dark:text-white tabular-nums">{activeStadium.concessionRevenue}</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">{activeStadium.concessionVelocity}</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <span className="material-symbols-outlined text-2xl">payments</span>
              </div>
            </div>
          </div>

          {/* Sector Quick Selector Grid */}
          <div className="bg-card dark:bg-slate-900/90 backdrop-blur-xl border border-border dark:border-slate-800 rounded-3xl p-6 shadow-md dark:shadow-xl space-y-3 transition-colors">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-slate-400 block">
              Sectors Overview (Click to Inspect)
            </span>
            <div className="space-y-2">
              {activeStadium.sectors.map((sec) => (
                <div
                  key={sec.id}
                  onClick={() => {
                    setSelectedSector(sec);
                    setSelectedGate(null);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedSector.id === sec.id
                      ? "bg-muted dark:bg-slate-800 border-cyan-500 dark:border-cyan-400 text-foreground dark:text-white shadow-sm scale-102"
                      : "bg-muted/50 dark:bg-slate-950/60 border-border dark:border-slate-800 text-muted-foreground dark:text-slate-400 hover:border-border dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-black text-cyan-600 dark:text-cyan-400">{sec.id.split("-")[1]}</span>
                    <span className="text-xs font-bold text-foreground dark:text-white truncate max-w-[120px]">{sec.name.split(" ")[0]} {sec.name.split(" ")[1]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-foreground dark:text-white">{sec.percent}%</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        sec.status === "Critical" ? "bg-red-500 animate-ping" : sec.status === "Congested" ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
