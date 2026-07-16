"use client";
import { useState } from "react";
import { speakNeural, playPitchEventSound } from "@/lib/speech";

const COMMENTARY_EVENTS: Record<string, { tactical: string; biased: string; neutral: string }> = {
  corner: {
    tactical: "Brazil earns a corner on the left flank. Watch out for Militao attacking the near post while Raphinha holds the edge of the 18-yard box for second balls.",
    biased: "YES! Corner ball for Brazil! The crowd is roaring — let's whip it right into the danger zone and bury this third goal!",
    neutral: "Corner kick awarded to Brazil after Argentina's fullback blocks the cross out of play. 74th minute of action.",
  },
  miss: {
    tactical: "That switch of play stretches Argentina's low block and opens the half-space behind the right back — a brilliant tactical shift that just whistled inches past the far post.",
    biased: "SO CLOSE! What an incredible strike from 25 yards out! Argentina's keeper was completely frozen — we are dominating every blade of grass right now!",
    neutral: "A dangerous long-range effort goes just wide of the right post. Goal kick to Argentina.",
  },
  tackle: {
    tactical: "Exceptional counter-pressing recovery by Casemiro. By stepping up 15 meters above the pivot line, he denies the transition before Argentina can launch Alvarez into space.",
    biased: "MONSTER TACKLE! Casemiro shuts the door right in the midfield! That is pure passion and defensive royalty right there!",
    neutral: "Firm slide tackle in the central circle breaks up the counter-attack cleanly. Play continues.",
  },
  goal: {
    tactical: "GOAL! A textbook overload on the left half-space pulls the central defender out of structure, creating a 1v1 gap that is finished with clinical precision.",
    biased: "GOOOOOOOOOAL!!! ABSOLUTE MAGIC! The stadium is shaking! Brazil extends the lead with a world-class team goal of the tournament!",
    neutral: "Goal scored by Brazil in the 76th minute. The scoreline moves to Brazil 3, Argentina 1.",
  },
};

export default function FanMatchHubPage() {
  const [commentaryMode, setCommentaryMode] = useState<"tactical" | "biased" | "neutral">("tactical");
  const [currentEvent, setCurrentEvent] = useState<string>("miss");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [arCameraActive, setArCameraActive] = useState(false);

  function triggerCommentarySpeech(eventKey: string, mode: "tactical" | "biased" | "neutral") {
    const text = COMMENTARY_EVENTS[eventKey]?.[mode] ?? COMMENTARY_EVENTS.miss.tactical;
    playPitchEventSound(eventKey as any);

    speakNeural(text, "en", {
      pitch: mode === "biased" ? 1.15 : mode === "tactical" ? 1.0 : 0.95,
      rate: mode === "biased" ? 1.08 : mode === "tactical" ? 0.98 : 0.92,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
    });
  }

  function handleTriggerEvent(key: string) {
    setCurrentEvent(key);
    triggerCommentarySpeech(key, commentaryMode);
  }

  function handleReplayAudio() {
    if (isPlayingAudio && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }
    triggerCommentarySpeech(currentEvent, commentaryMode);
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] max-w-5xl mx-auto gap-6 pb-12">
      {/* Live Match Header */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 fan-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-widest text-red-500">
              ● Live Match Telemetry · 74'
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
            🇧🇷 Brazil 2 — 1 Argentina 🇦🇷
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-0.5">
            FIFA World Cup 2026 Quarter-Final · Estadio Azteca / MetLife Stadium
          </p>
        </div>

        <button
          onClick={() => setArCameraActive(!arCameraActive)}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 ${
            arCameraActive
              ? "bg-gradient-to-r from-violet-600 to-primary text-white scale-105"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
          <span>{arCameraActive ? "AR Overlay Active" : "Launch AR Camera View"}</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* AI Commentary Feed (7 cols) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-3xl p-5 sm:p-6 fan-shadow space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">spatial_audio_off</span>
              <h2 className="text-sm font-black uppercase tracking-wider text-foreground">AI Commentary Feed</h2>
            </div>

            {/* Mode selection */}
            <div className="flex gap-1 bg-muted p-1 rounded-xl border border-border">
              {(["tactical", "biased", "neutral"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setCommentaryMode(mode);
                    triggerCommentarySpeech(currentEvent, mode);
                  }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                    commentaryMode === mode
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode === "biased" ? "Team-Biased" : mode}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Trigger Buttons */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground block">
              Simulate Live Pitch Events (With Acoustic Sound & Speech):
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "corner", label: "Corner kick won ⛳" },
                { key: "miss", label: "Near miss on goal ⚡" },
                { key: "tackle", label: "Great tackle to break attack 🛡️" },
                { key: "goal", label: "GOAL! ⚽🔥" },
              ].map((ev) => (
                <button
                  key={ev.key}
                  onClick={() => handleTriggerEvent(ev.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    currentEvent === ev.key
                      ? "bg-primary/15 border-primary text-primary font-black shadow-2xs scale-102"
                      : "bg-muted/60 border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {ev.label}
                </button>
              ))}
            </div>
          </div>

          {/* Synthesized Commentary Output Card */}
          <div className="bg-gradient-to-br from-muted/60 to-card border border-primary/30 rounded-2xl p-5 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black text-xs">
                  AI
                </span>
                <div>
                  <span className="text-xs font-black text-foreground uppercase">
                    {commentaryMode === "tactical"
                      ? "Gemini Tactical Analyst"
                      : commentaryMode === "biased"
                      ? "Brazil Home Voice AI"
                      : "Official FIFA Feed"}
                  </span>
                  <span className="text-[10px] text-muted-foreground block font-semibold">
                    {isPlayingAudio ? "🔴 Streaming Acoustic Audio Feed..." : "Live Synthesized Audio Feed"}
                  </span>
                </div>
              </div>

              {isPlayingAudio && (
                <div className="flex items-center gap-1 bg-primary/20 px-2.5 py-1 rounded-full text-primary text-[10px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  <span>Speaking Now...</span>
                </div>
              )}
            </div>

            <p className="text-sm sm:text-base text-foreground font-medium leading-relaxed italic bg-card/80 p-4 rounded-xl border border-border">
              "{COMMENTARY_EVENTS[currentEvent]?.[commentaryMode] ?? COMMENTARY_EVENTS.miss.tactical}"
            </p>

            {/* Audio waveform visualization */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1 h-6">
                {[4, 12, 8, 16, 24, 14, 20, 10, 18, 6, 14, 22, 12, 8, 18, 26, 14, 10].map((h, idx) => (
                  <div
                    key={idx}
                    className={`w-1 rounded-full bg-primary transition-all duration-300 ${
                      isPlayingAudio ? "animate-pulse" : "opacity-30"
                    }`}
                    style={{ height: isPlayingAudio ? `${Math.min(28, h + Math.random() * 14)}px` : `${h}px` }}
                  />
                ))}
              </div>

              <button
                onClick={handleReplayAudio}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
                  isPlayingAudio
                    ? "bg-primary text-primary-foreground border-primary shadow-md scale-102"
                    : "bg-card border-border text-foreground hover:border-primary hover:bg-muted"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isPlayingAudio ? "pause" : "volume_up"}
                </span>
                <span>{isPlayingAudio ? "Pause Audio" : "🔊 Replay Audio Feed"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* AR Match Stats & Optical Tracking (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 fan-shadow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-accent text-[22px]">analytics</span>
                <h2 className="text-sm font-black uppercase tracking-wider text-foreground">AR Optical Tracking Stats</h2>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-accent/15 text-accent">
                Hawk-Eye Mesh
              </span>
            </div>

            {/* Player Telemetry Cards */}
            <div className="space-y-3">
              <div className="bg-muted/50 border border-border rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🇧🇷</span>
                    <div>
                      <h3 className="text-xs font-black text-foreground">Vinicius Jr. (LW)</h3>
                      <span className="text-[10px] text-muted-foreground font-semibold">Sprint Top Speed Telemetry</span>
                    </div>
                  </div>
                  <span className="text-sm font-black text-primary font-mono">35.2 km/h</span>
                </div>
                <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "94%" }} />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground pt-0.5">
                  <span>Distance Covered: 8.4 km</span>
                  <span>High-Speed Sprints: 24</span>
                </div>
              </div>

              <div className="bg-muted/50 border border-border rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🇦🇷</span>
                    <div>
                      <h3 className="text-xs font-black text-foreground">Lionel Messi (CAM)</h3>
                      <span className="text-[10px] text-muted-foreground font-semibold">Playmaking & xA Telemetry</span>
                    </div>
                  </div>
                  <span className="text-sm font-black text-accent font-mono">92% Pass Acc</span>
                </div>
                <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: "92%" }} />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground pt-0.5">
                  <span>Key Passes: 4</span>
                  <span>Expected Assists (xA): 0.84</span>
                </div>
              </div>
            </div>

            {/* Pitch Heat Zone Visualizer */}
            <div className="bg-muted/30 border border-border rounded-2xl p-4 text-center space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                Tactical Zone Dominance (2nd Half)
              </span>
              <div className="h-20 bg-gradient-to-r from-green-600/30 via-amber-500/30 to-red-500/40 rounded-xl border border-border flex items-center justify-around font-mono text-[10px] font-black text-foreground">
                <span>BRA Def 22%</span>
                <span className="text-primary">Midfield Battle 48%</span>
                <span className="text-red-400">BRA Final Third 30%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
