// PULSE — Real-Time Stadium IoT & Telemetry Simulator per 06_DATA_MODEL_AND_APIS.md §3
import { getZonesFromDb, getGatesFromDb, updateZoneInDb, updateGateInDb, saveIncidentToDb, getIncidentsFromDb } from "../lib/firestore/db";
import { Zone, Incident, calculateDensityLevel, calculateDensityValue } from "../lib/mockData";
import { Gate } from "../lib/firestore/schema";
import demoScript from "./demoScript.json";

export interface SimulatorResult {
  success: boolean;
  timestamp: string;
  zonesUpdated: number;
  gatesUpdated: number;
  triggeredIncidents: Incident[];
  demoMode: boolean;
}

/**
 * Calculates realistic target occupancy ratio (0.0 to 1.0) based on match-day timeline (elapsed time).
 * Implements realistic curve shape:
 * 1. Slow, steady fill starting ~2 hours before kickoff (-120 min to -15 min)
 * 2. Sharp fill spike in the 15 minutes before kickoff (-15 min to 0 min)
 * 3. Relatively stable during play (0 min to 45 min, 60 min to 90 min)
 * 4. Halftime surge (~45 min to 60 min, or demo mark 31s-65s): pushes concourse/concession zones toward amber/red band
 * 5. Sharp decline (exodus) after final whistle (+90 min onwards, or demo mark >= 120s)
 */
function getMatchDayTargetRatio(zone: Zone, elapsedSeconds: number, demoMode: boolean): number {
  const zoneId = zone.id.toUpperCase();
  const isConcourseOrSurgeZone = zoneId === "A" || zoneId === "C" || zoneId === "E" || zone.name.toLowerCase().includes("concourse") || zone.name.toLowerCase().includes("stand");

  if (demoMode) {
    // In a 3-minute demo pitch (0s to 180s):
    // 0s-30s: Live kickoff / 1st half stable play (~85%-92%)
    if (elapsedSeconds <= 30) {
      return isConcourseOrSurgeZone ? 0.90 : 0.70;
    }
    // 31s-65s: Halftime concession/restroom surge! Push 2-3 concourse zones toward amber/red band
    if (elapsedSeconds <= 65) {
      return isConcourseOrSurgeZone ? 0.96 : 0.55;
    }
    // 66s-119s: 2nd half stable play (~82%-88%)
    if (elapsedSeconds <= 119) {
      return isConcourseOrSurgeZone ? 0.85 : 0.72;
    }
    // >= 120s: Final whistle & exodus phase — sharp decline
    const exodusProgress = Math.min(1.0, (elapsedSeconds - 120) / 60);
    return Math.max(0.05, 0.85 * (1 - exodusProgress));
  }

  // Non-demo mode: interpret elapsedSeconds as match timeline (in seconds -> minutes)
  // Or if 0 (no time passed), return live play baseline
  if (elapsedSeconds === 0) {
    return isConcourseOrSurgeZone ? 0.88 : 0.65;
  }

  const matchMin = elapsedSeconds / 60;

  // 1. Before -120 min: empty
  if (matchMin < -120) return 0.02;

  // 2. Slow steady fill (-120 to -15 min): 5% -> 50%
  if (matchMin < -15) {
    const progress = (matchMin + 120) / 105;
    return 0.05 + progress * 0.45;
  }

  // 3. Sharp kickoff fill spike (-15 to 0 min): 50% -> 92%
  if (matchMin <= 0) {
    const progress = (matchMin + 15) / 15;
    return 0.50 + progress * 0.42;
  }

  // 4. 1st half stable play (0 to 45 min)
  if (matchMin <= 45) {
    return isConcourseOrSurgeZone ? 0.90 : 0.70;
  }

  // 5. Halftime surge (45 to 60 min): concourse/restroom surge pushing 2-3 zones toward amber/red
  if (matchMin <= 60) {
    return isConcourseOrSurgeZone ? 0.95 : 0.52;
  }

  // 6. 2nd half play (60 to 90 min)
  if (matchMin <= 90) {
    return isConcourseOrSurgeZone ? 0.86 : 0.68;
  }

  // 7. Sharp decline (exodus) after final whistle (+90 min onwards)
  const exodusProgress = Math.min(1.0, (matchMin - 90) / 45);
  return Math.max(0.03, 0.88 * (1 - exodusProgress));
}

/**
 * Step the stadium simulation forward by one interval (10-15s).
 * - Follows realistic time-based match-day occupancy curve with natural noise.
 * - Randomly walks gate entry rates.
 * - Triggers timed incidents if demoMode is enabled.
 */
export async function stepSimulator(options: { demoMode?: boolean; elapsedSeconds?: number } = {}): Promise<SimulatorResult> {
  const { demoMode = false, elapsedSeconds = 0 } = options;
  const triggeredIncidents: Incident[] = [];

  try {
    // 1. Nudge Zone Occupancies & Trends
    const zones = await getZonesFromDb();
    let zonesUpdated = 0;

    for (const zone of zones) {
      const cap = zone.capacity || 6500;
      const targetRatio = getMatchDayTargetRatio(zone, elapsedSeconds, demoMode);
      const targetOcc = Math.round(cap * targetRatio);
      const currentOcc = zone.occupancy ?? Math.round(cap * 0.7);

      // Move toward target occupancy with drift + natural biological noise
      const diff = targetOcc - currentOcc;
      const drift = Math.round(diff * 0.25);
      const noise = Math.round(cap * ((Math.random() * 5 - 2.5) / 100));
      const deltaOcc = drift + noise;

      const newOcc = Math.max(50, Math.min(cap, currentOcc + deltaOcc));
      const newPercent = Math.round((newOcc / cap) * 100);

      let newTrend: "rising" | "falling" | "stable" = "stable";
      if (deltaOcc > cap * 0.015) newTrend = "rising";
      else if (deltaOcc < -cap * 0.015) newTrend = "falling";

      const area = zone.areaSquareMeters ?? 1000;
      const densityValue = calculateDensityValue(newOcc, area);
      const newDensity = calculateDensityLevel(newOcc, area);

      await updateZoneInDb(zone.id, {
        occupancy: newOcc,
        areaSquareMeters: area,
        densityValue,
        percent: newPercent,
        trend: newTrend,
        density: newDensity,
        lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      });
      zonesUpdated++;
    }

    // 2. Nudge Gate Throughputs & Queues
    const gates = await getGatesFromDb();
    let gatesUpdated = 0;

    for (const gate of gates) {
      const deltaRate = Math.round(Math.random() * 40 - 20);
      const newRate = Math.max(50, Math.min(480, (gate.entryRatePerMin ?? 180) + deltaRate));
      const newQueue = Math.max(1, Math.round(newRate / 22));

      let newStatus: "active" | "congested" | "closed" = "active";
      if (newRate >= 350 || newQueue >= 15) newStatus = "congested";

      await updateGateInDb(gate.id, {
        entryRatePerMin: newRate,
        queueEstimate: newQueue,
        status: newStatus,
      });
      gatesUpdated++;
    }

    // 3. Process Demo Script / Probability Incidents
    if (demoMode) {
      // Check if any demoScript item should fire within a 15-second window around elapsedSeconds
      const matchingEvents = demoScript.filter((evt) => {
        const diff = Math.abs(evt.atSecond - elapsedSeconds);
        return diff <= 7;
      });

      const existingIncidents = await getIncidentsFromDb();

      for (const evt of matchingEvents) {
        // Prevent duplicate firing if incident title already open
        const alreadyFired = existingIncidents.some((inc) => inc.title === evt.title && inc.status === "open");
        if (!alreadyFired) {
          const newIncident: Incident = {
            id: `inc_demo_${evt.atSecond}_${Date.now()}`,
            type: (evt.type as any) || "crowd",
            severity: (evt.severity as any) || "critical",
            title: evt.title,
            description: evt.description,
            location: evt.location,
            status: "open",
            createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            agentRecommendation: "Analyzing real-time telemetry...",
            toolTrace: [],
          };

          await saveIncidentToDb(newIncident);
          triggeredIncidents.push(newIncident);
        }
      }
    } else {
      // 5% spontaneous probability check per simulation step during live non-demo ops
      if (Math.random() < 0.05) {
        const spontaneousInc: Incident = {
          id: `inc_spontaneous_${Date.now()}`,
          type: "logistics",
          severity: "warning",
          title: "Automated Sensor Alert — Concessions Restock Needed",
          description: "Inventory weight sensors in Section 108 report beverage levels below 15% threshold during halftime surge.",
          location: "Section 108 Concessions",
          status: "open",
          createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          agentRecommendation: "Dispatch supply runner from Concourse N reserve warehouse.",
          toolTrace: [],
        };
        await saveIncidentToDb(spontaneousInc);
        triggeredIncidents.push(spontaneousInc);
      }
    }

    return {
      success: true,
      timestamp: new Date().toISOString(),
      zonesUpdated,
      gatesUpdated,
      triggeredIncidents,
      demoMode,
    };
  } catch (err) {
    console.error("[Simulator] Step error:", err);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      zonesUpdated: 0,
      gatesUpdated: 0,
      triggeredIncidents: [],
      demoMode,
    };
  }
}
