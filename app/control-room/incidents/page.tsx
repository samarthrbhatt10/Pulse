"use client";
import Link from "next/link";
import { INCIDENTS, severityBg, severityBadge } from "@/lib/mockData";
import { usePulseSync } from "@/lib/usePulseSync";

export default function IncidentsPage() {
  const { incidents } = usePulseSync();
  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-red-500 text-[28px]">warning</span>
            Active Incident Queue & Logs
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            Real-time emergency tracking, dispatch status, and automated AI resolution workflows
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-black text-white bg-red-600 px-3.5 py-2 rounded-xl uppercase tracking-wider shadow-sm animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full bg-white" />
          {incidents.filter((i) => i.severity === "critical" && i.status !== "resolved").length} CRITICAL INCIDENTS
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        {incidents.map((incident) => (
          <Link key={incident.id} href={`/control-room/incidents/${incident.id}`}>
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start gap-4 fan-shadow hover:scale-[1.008] active:scale-[0.995] ${
              incident.severity === "critical"
                ? "bg-red-500/10 border-red-500/40"
                : incident.severity === "warning"
                ? "bg-amber-500/10 border-amber-500/40"
                : "bg-card border-border"
            }`}>
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-wider ${
                    incident.severity === "critical"
                      ? "bg-red-600 text-white"
                      : incident.severity === "warning"
                      ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {incident.severity}
                  </span>
                  <span className="font-extrabold text-sm text-foreground uppercase tracking-wider">[{incident.id}]</span>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-bold uppercase ${
                    incident.status === "dispatched" ? "bg-accent/20 text-accent border border-accent/30" : "bg-primary/20 text-primary border border-primary/30"
                  }`}>
                    {incident.status}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight">{incident.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed max-w-3xl">{incident.description}</p>
                <div className="flex flex-wrap gap-4 mt-1 pt-2 border-t border-border/50 text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                    {incident.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    {incident.createdAt}
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex-shrink-0 self-center sm:self-center">
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
