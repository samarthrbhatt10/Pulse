"use client";
import { useState, useEffect, useCallback } from "react";
import { Zone, Incident, ZONES, INCIDENTS } from "@/lib/mockData";

export interface PulseSyncState {
  zones: Zone[];
  incidents: Incident[];
  loading: boolean;
  refresh: () => Promise<void>;
  resolveIncident: (id: string) => Promise<void>;
  createIncident: (incident: Incident) => Promise<void>;
  updateZone: (zoneId: string, updates: Partial<Zone>) => Promise<void>;
}

export function usePulseSync(): PulseSyncState {
  const [zones, setZones] = useState<Zone[]>(ZONES);
  const [incidents, setIncidents] = useState<Incident[]>(INCIDENTS);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    try {
      const [zRes, iRes] = await Promise.all([
        fetch("/api/zones", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/incidents", { cache: "no-store" }).then((r) => r.json()),
      ]);

      if (zRes?.zones && Array.isArray(zRes.zones)) {
        setZones(zRes.zones);
      }
      if (iRes?.incidents && Array.isArray(iRes.incidents)) {
        setIncidents(iRes.incidents);
      }
    } catch (err) {
      console.warn("[Pulse Sync] Polling error, retaining local state:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveIncident = useCallback(
    async (id: string) => {
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? { ...inc, status: "resolved" } : inc)));

      try {
        await fetch("/api/incidents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "resolve", id }),
        });
        window.dispatchEvent(new CustomEvent("pulse-sync-trigger"));
      } catch (err) {
        console.error("[Pulse Sync] Failed to resolve incident on server:", err);
      }
    },
    []
  );

  const createIncident = useCallback(
    async (incident: Incident) => {
      setIncidents((prev) => [incident, ...prev]);

      try {
        await fetch("/api/incidents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create", incident }),
        });
        window.dispatchEvent(new CustomEvent("pulse-sync-trigger"));
      } catch (err) {
        console.error("[Pulse Sync] Failed to create incident on server:", err);
      }
    },
    []
  );

  const updateZone = useCallback(
    async (zoneId: string, updates: Partial<Zone>) => {
      setZones((prev) => prev.map((z) => (z.id.toUpperCase() === zoneId.toUpperCase() ? { ...z, ...updates } : z)));

      try {
        await fetch("/api/zones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ zoneId, updates }),
        });
        window.dispatchEvent(new CustomEvent("pulse-sync-trigger"));
      } catch (err) {
        console.error("[Pulse Sync] Failed to update zone on server:", err);
      }
    },
    []
  );

  useEffect(() => {
    let mounted = true;

    refresh();

    const interval = setInterval(() => {
      if (mounted) refresh();
    }, 3000);

    const handleSyncEvent = () => {
      if (mounted) refresh();
    };

    window.addEventListener("pulse-sync-trigger", handleSyncEvent);
    window.addEventListener("storage", handleSyncEvent);

    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener("pulse-sync-trigger", handleSyncEvent);
      window.removeEventListener("storage", handleSyncEvent);
    };
  }, [refresh]);

  return {
    zones,
    incidents,
    loading,
    refresh,
    resolveIncident,
    createIncident,
    updateZone,
  };
}
