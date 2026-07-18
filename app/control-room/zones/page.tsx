"use client";
import { ZONES, densityColor } from "@/lib/mockData";
import { usePulseSync } from "@/lib/usePulseSync";

export default function ZonesPage() {
  const { zones } = usePulseSync();
  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[28px]">dashboard</span>
            Zone Capacity & IoT Sensor Telemetry
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            Real-time occupancy metrics and predictive bottleneck forecasting across all 8 stadium sectors
          </p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-xl text-xs font-bold text-foreground fan-shadow">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span>8 Sectors Active · 1,204 Nodes Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {zones.map((zone) => (
          <div key={zone.id} className="bg-card border border-border rounded-2xl p-5 fan-shadow hover:border-primary/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-black text-foreground">{zone.name}</h3>
                  <p className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest mt-0.5">{zone.location}</p>
                </div>
                <span
                  className="text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-2xs"
                  style={{
                    color: zone.density === "critical" ? "#ffffff" : densityColor(zone.density),
                    background: zone.density === "critical" ? "#dc2626" : `${densityColor(zone.density)}25`,
                  }}
                >
                  {zone.density}
                </span>
              </div>

              {/* Capacity bar */}
              <div className="my-4">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-foreground">{zone.occupancy.toLocaleString()} / {zone.capacity.toLocaleString()}</span>
                  <span style={{ color: densityColor(zone.density) }} className="font-black text-sm">{zone.percent}%</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden p-0.5 border border-border/50">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${zone.percent}%`,
                      background: densityColor(zone.density),
                      boxShadow: zone.density === "critical" ? `0 0 10px ${densityColor(zone.density)}` : undefined,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-semibold">
              <span
                className="flex items-center gap-1 font-bold"
                style={{ color: zone.trend === "rising" ? "#ffb86c" : zone.trend === "falling" ? "var(--primary)" : "var(--muted-foreground)" }}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {zone.trend === "rising" ? "trending_up" : zone.trend === "falling" ? "trending_down" : "trending_flat"}
                </span>
                <span className="uppercase">{zone.trend}</span>
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">{zone.lastUpdated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
