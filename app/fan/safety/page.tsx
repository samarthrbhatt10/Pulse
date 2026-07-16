"use client";

const EMERGENCY_CONTACTS = [
  { label: "Medical & First Aid", number: "EXT 911 (or click to alert center)", icon: "medical_services", color: "#ff4b4b", urgent: true },
  { label: "Stadium Security & Police", number: "EXT 112 · Concourse A Command", icon: "shield_person", color: "var(--primary)", urgent: false },
  { label: "Lost & Found / Info Desk", number: "EXT 100 · Gate 3 Hub", icon: "info", color: "var(--accent)", urgent: false },
];

const NEAREST_EXITS = [
  { gate: "Gate 2 (North East)", concourse: "Concourse A", distance: "180m (~2 mins)", status: "OPEN - FAST TRACK" },
  { gate: "Gate 5 (South East)", concourse: "Concourse C", distance: "220m (~3 mins)", status: "OPEN" },
  { gate: "Gate 7 (West Concourse)", concourse: "Concourse B", distance: "300m (~4 mins)", status: "MODERATE TRAFFIC" },
];

export default function SafetyPage() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 py-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
          <span className="material-symbols-outlined text-red-500 text-[32px]">emergency</span>
          Safety, SOS & Emergency Hub
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          World Cup 2026 Emergency Assistance Protocol. Live connection to PULSE Ops Command.
        </p>
      </div>

      {/* SOS Quick Action Box */}
      <div className="bg-red-500/10 border-2 border-red-500/40 rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500 text-white flex items-center justify-center mb-3 animate-pulse shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-3xl sm:text-4xl">sos</span>
        </div>
        <h2 className="text-lg sm:text-xl font-black text-foreground">Immediate Emergency Assistance</h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
          Pressing the SOS beacon immediately shares your seat coordinates (Sec 105, Row 12) with the nearest medical and security teams.
        </p>
        <button className="px-6 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-extrabold text-sm tracking-wider uppercase shadow-md active:scale-95 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined">wifi_tethering</span>
          <span>Trigger Live SOS Alert</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emergency Contacts List */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <span className="material-symbols-outlined text-red-500 text-[18px]">call</span>
            Emergency Hotline Dispatch
          </h2>
          <div className="space-y-3">
            {EMERGENCY_CONTACTS.map((c) => (
              <div key={c.label} className="bg-card rounded-2xl p-4 fan-shadow border border-border flex items-center justify-between hover:border-primary/40 transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-muted flex-shrink-0">
                    <span className="material-symbols-outlined text-xl" style={{ color: c.color }}>{c.icon}</span>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{c.label}</div>
                    <div className="text-xs text-muted-foreground font-medium mt-0.5">{c.number}</div>
                  </div>
                </div>
                <button
                  className={`px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-xs active:scale-95 ${
                    c.urgent ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
                  }`}
                >
                  Call Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Nearest emergency exits */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <span className="material-symbols-outlined text-green-500 text-[18px]">exit_to_app</span>
            Nearest Evacuation Exits (From Sec 105)
          </h2>
          <div className="space-y-3">
            {NEAREST_EXITS.map((exit) => (
              <div key={exit.gate} className="bg-card rounded-2xl p-4 fan-shadow border border-border flex items-center justify-between hover:border-green-500/40 transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-xl">directions_run</span>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{exit.gate}</div>
                    <div className="text-xs text-muted-foreground font-medium mt-0.5">
                      {exit.concourse} · <span className="text-foreground font-semibold">{exit.distance}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-black text-green-500 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-md">
                  {exit.status.split(" - ")[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety tips & protocols */}
      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-5 sm:p-6 mt-2">
        <h2 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">verified_user</span>
          World Cup Stadium Safety Protocols & Guidelines
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-foreground font-medium">
          <div className="flex items-start gap-2.5 bg-card/60 p-3 rounded-xl border border-border/50">
            <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
            <span>Stay in your designated ticketed zone unless guided by security or stadium stewards.</span>
          </div>
          <div className="flex items-start gap-2.5 bg-card/60 p-3 rounded-xl border border-border/50">
            <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
            <span>In the event of a concourse advisory, follow the green illuminated exit arrows on your floor.</span>
          </div>
          <div className="flex items-start gap-2.5 bg-card/60 p-3 rounded-xl border border-border/50">
            <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
            <span>Report unattended baggage or suspicious activity directly to Gate Security or via AI Chat.</span>
          </div>
          <div className="flex items-start gap-2.5 bg-card/60 p-3 rounded-xl border border-border/50">
            <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
            <span>Keep your digital ticket QR code and identification ready when re-entering concourse gates.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
