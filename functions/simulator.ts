// PULSE — Real-Time Stadium IoT & Telemetry Simulator per 06_DATA_MODEL_AND_APIS.md §3
import { getZonesFromDb, getGatesFromDb, updateZoneInDb, updateGateInDb, saveIncidentToDb, getIncidentsFromDb } from "../lib/firestore/db";
import { Zone, Incident } from "../lib/mockData";
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
 * Step the stadium simulation forward by one interval (10-15s).
 * - Randomly walks zone occupancy within plausible bounds.
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
      // Random walk between -3% and +4% of capacity
      const deltaPercent = (Math.random() * 7 - 3) / 100;
      const deltaOcc = Math.round(cap * deltaPercent);
      const currentOcc = zone.occupancy ?? 0;
      const newOcc = Math.max(200, Math.min(cap, currentOcc + deltaOcc));
      const newPercent = Math.round((newOcc / cap) * 100);

      let newTrend: "rising" | "falling" | "stable" = "stable";
      if (deltaOcc > cap * 0.015) newTrend = "rising";
      else if (deltaOcc < -cap * 0.015) newTrend = "falling";

      let newDensity: "low" | "medium" | "high" | "critical" = "low";
      if (newPercent >= 90) newDensity = "critical";
      else if (newPercent >= 75) newDensity = "high";
      else if (newPercent >= 50) newDensity = "medium";

      await updateZoneInDb(zone.id, {
        occupancy: newOcc,
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
