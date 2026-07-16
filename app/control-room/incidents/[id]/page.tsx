"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { INCIDENTS, Incident } from "@/lib/mockData";

function StreamingText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const idxRef = useRef(0);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    idxRef.current = 0;
    const interval = setInterval(() => {
      if (idxRef.current < text.length) {
        setDisplayed(text.slice(0, idxRef.current + 1));
        idxRef.current++;
      } else {
        setDone(true);
        clearInterval(interval);
        onComplete?.();
      }
    }, 18);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle animate-[blink_0.8s_infinite]" />}
    </span>
  );
}

function TraceTimeline({ steps }: { steps: NonNullable<Incident["toolTrace"]> }) {
  if (!steps.length) return (
    <div className="text-muted-foreground text-xs italic font-medium">No automated agent trace recorded for this incident.</div>
  );
  return (
    <div className="relative">
      <div className="absolute left-[11px] top-4 bottom-0 w-[2px] bg-border" />
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3 mb-4 relative z-10">
          <div className="w-6 h-6 rounded-full bg-card border-2 border-primary flex items-center justify-center flex-shrink-0 shadow-2xs">
            <span className="text-[10px] text-primary font-black">{i + 1}</span>
          </div>
          <div className="flex-1 bg-muted/60 border border-border rounded-xl p-3 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-primary font-mono">{step.tool}</span>
              <span className="text-[10px] text-muted-foreground font-semibold">{step.timestampMs}ms</span>
            </div>
            <div className="text-[11px] font-mono text-foreground font-medium break-all">
              <span className="text-muted-foreground font-bold">IN: </span>
              {JSON.stringify(step.input).slice(0, 95)}
            </div>
            <div className="text-[11px] font-mono text-accent font-medium mt-1 break-all">
              <span className="text-muted-foreground font-bold">OUT: </span>
              {JSON.stringify(step.output).slice(0, 110)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const incident = INCIDENTS.find((i) => i.id === id) ?? INCIDENTS[0];
  const [streamDone, setStreamDone] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [dispatched, setDispatched] = useState(incident.status === "dispatched");

  const severityClass = {
    critical: { badge: "bg-red-600 text-white", border: "border-red-500/50", icon: "text-red-500" },
    warning: { badge: "bg-amber-500/20 text-amber-500 border border-amber-500/30", border: "border-amber-500/50", icon: "text-amber-500" },
    info: { badge: "bg-muted text-muted-foreground", border: "border-border", icon: "text-muted-foreground" },
  }[incident.severity];

  const iconMap: Record<Incident["type"], string> = {
    medical: "medical_services",
    security: "shield_person",
    crowd: "groups",
    logistics: "local_shipping",
    technical: "settings",
  };

  async function handleDispatch() {
    setDispatching(true);
    await new Promise((r) => setTimeout(r, 1500));
    setDispatched(true);
    setDispatching(false);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Map + Camera Feeds (7 cols on desktop) */}
      <div className="lg:col-span-7 flex flex-col gap-6 w-full">
        {/* Map Header + Canvas */}
        <div className="flex-1 bg-card border border-border rounded-3xl relative overflow-hidden fan-shadow min-h-[340px] sm:min-h-[420px] flex flex-col">
          <div className="scanline" />
          {/* Animated incident marker */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-2 border-red-500 animate-ping opacity-30 absolute -inset-6" />
              <div className="w-5 h-5 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.8)] relative z-10" />
            </div>
          </div>
          {/* Map overlays */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
            <div className="glass-card px-3.5 py-1.5 border border-border rounded-xl flex items-center gap-2 pointer-events-auto shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-black uppercase text-foreground">Active Telemetry: {incident.id}</span>
            </div>
            <div className="glass-card px-3 py-1.5 border border-border rounded-xl pointer-events-auto shadow-sm">
              <span className="text-xs font-bold text-muted-foreground">Coordinates: <strong className="text-foreground">{incident.location}</strong></span>
            </div>
          </div>
          {/* SVG stadium mini-map */}
          <svg className="w-full h-full p-8 opacity-40" viewBox="0 0 1000 600">
            <path d="M500,50 L850,150 L850,450 L500,550 L150,450 L150,150 Z" fill="none" stroke="var(--border)" strokeWidth="2.5" />
            <circle cx="500" cy="300" fill="none" r="120" stroke="var(--border)" strokeWidth="1.5" />
            <circle cx="430" cy="320" r="24" fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth="2.5" />
          </svg>
        </div>

        {/* Live CCTV feeds */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3 fan-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">videocam</span>
              <span className="text-xs font-black uppercase text-foreground tracking-wider">Live Security & CCTV Feeds</span>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Optical OCR Active</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["CAM-12-CONCOURSE", "CAM-08-GATE"].map((cam) => (
              <div key={cam} className="bg-black rounded-xl aspect-video relative overflow-hidden flex items-center justify-center border border-border/40 shadow-inner">
                <div className="text-muted-foreground/60 text-xs font-mono font-bold tracking-wider">{cam}</div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[9px] font-extrabold text-white tracking-widest">LIVE REC</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Incident Detail & Neural Trace (5 cols on desktop) */}
      <div className="lg:col-span-5 flex flex-col gap-4 w-full">
        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-muted-foreground text-xs font-bold hover:text-primary transition-colors self-start"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Return to Incident Queue</span>
        </button>

        <div className={`bg-card border ${severityClass.border} rounded-3xl overflow-hidden fan-shadow flex flex-col`}>
          {/* Incident header */}
          <div className="p-5 bg-muted/50 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl bg-card border ${severityClass.border} flex items-center justify-center shadow-xs`}>
                <span className={`material-symbols-outlined ${severityClass.icon} fill-icon text-2xl`}>{iconMap[incident.type]}</span>
              </div>
              <div>
                <h2 className="font-black text-lg text-foreground tracking-tight">{incident.type.toUpperCase()} INCIDENT</h2>
                <p className="text-xs font-mono font-bold text-muted-foreground">ID: #{incident.id}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className={`px-2.5 py-1 ${severityClass.badge} rounded-md text-[10px] font-black uppercase tracking-wider`}>
                {incident.severity}
              </span>
              <span className="text-primary font-mono font-bold text-xs tabular-nums">{incident.createdAt}</span>
            </div>
          </div>

          {/* Description */}
          <div className="p-5 border-b border-border">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-1.5">Incident Report Summary</h3>
            <p className="text-sm text-foreground font-medium leading-relaxed">{incident.description}</p>
            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl self-start inline-flex">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              <span>Location: {incident.location}</span>
            </div>
          </div>

          {/* AI Recommendation Box */}
          <div className="p-5 border-b border-border">
            <div className="bg-gradient-to-br from-primary/10 via-violet-500/10 to-accent/10 border border-primary/30 rounded-2xl p-4 relative overflow-hidden shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-[18px] fill-icon">auto_awesome</span>
                <span className="text-xs font-black uppercase tracking-widest text-primary">Gemini Neural Recommendation</span>
              </div>
              <p className="text-foreground text-sm font-medium leading-relaxed">
                {incident.agentRecommendation ? (
                  <StreamingText text={incident.agentRecommendation} onComplete={() => setStreamDone(true)} />
                ) : (
                  "Automated recommendation processing..."
                )}
              </p>
            </div>
          </div>

          {/* Agent Trace */}
          <div className="p-5 border-b border-border max-h-[320px] overflow-y-auto custom-scrollbar">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">account_tree</span>
              Autonomous Agent Trace Log
            </h4>
            <TraceTimeline steps={incident.toolTrace ?? []} />
          </div>

          {/* Actions */}
          <div className="p-5 flex flex-col sm:flex-row gap-3 bg-muted/30">
            {!dispatched ? (
              <button
                onClick={handleDispatch}
                disabled={dispatching}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-sm py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-98 disabled:opacity-50"
              >
                {dispatching ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
                    Dispatching Response Team...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    Dispatch Emergency Response Unit
                  </>
                )}
              </button>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-2 bg-green-500/15 border border-green-500/40 text-green-500 font-extrabold text-sm py-3.5 px-4 rounded-xl">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                Response Unit Dispatched & En Route
              </div>
            )}
            <Link
              href="/control-room/broadcast"
              className="px-5 flex items-center justify-center gap-2 border border-border bg-card text-foreground font-bold text-sm py-3.5 rounded-xl hover:bg-muted transition-all shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">campaign</span>
              <span>Broadcast Alert</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
