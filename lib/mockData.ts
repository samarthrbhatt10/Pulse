// PULSE — Mock Data Layer
// Provides realistic stadium data for demo without Firebase

export type ZoneDensity = "low" | "medium" | "high" | "critical";

export interface Zone {
  id: string;
  name: string;
  occupancy: number;
  capacity: number;
  areaSquareMeters?: number; // physical area in square meters per Fruin LOS
  densityValue?: number;     // calculated density in people/m²
  percent: number;
  trend: "rising" | "falling" | "stable";
  density: ZoneDensity;
  lastUpdated: string;
  location?: string;
  pathD: string;
  labelX: number;
  labelY: number;
}

export interface Incident {
  id: string;
  type: "medical" | "security" | "crowd" | "logistics" | "technical";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  location: string;
  status: "open" | "dispatched" | "resolved";
  createdAt: string;
  agentRecommendation?: string;
  toolTrace?: TraceStep[];
}

export interface TraceStep {
  tool: string;
  input: string;
  output: string;
  timestampMs: number;
}

export interface BroadcastMessage {
  id: string;
  original: string;
  translations: Record<string, string>;
  sentAt: string;
  languages: string[];
}

export interface Gate {
  id: string;
  name: string;
  entryRate: number; // people/min
  queueLength: number;
  status: "open" | "controlled" | "closed";
}

// ===== Initial seeded data (deterministic for demo) =====

export const ZONES: Zone[] = [
  {
    id: "A", name: "Zone A — North Stand", occupancy: 6110, capacity: 6500, areaSquareMeters: 750, densityValue: 8.15,
    percent: 94, trend: "rising", density: "critical",
    lastUpdated: "00:04:12 ago",
    pathD: "M400,100 L600,100 L650,180 L350,180 Z",
    labelX: 490, labelY: 145,
  },
  {
    id: "B", name: "Zone B — North East", occupancy: 2730, capacity: 6500, areaSquareMeters: 2000, densityValue: 1.37,
    percent: 42, trend: "stable", density: "low",
    lastUpdated: "00:00:08 ago",
    pathD: "M620,110 L830,170 L780,250 L580,190 Z",
    labelX: 700, labelY: 185,
  },
  {
    id: "C", name: "Zone C — East Stand", occupancy: 4420, capacity: 6500, areaSquareMeters: 1500, densityValue: 2.95,
    percent: 68, trend: "rising", density: "medium",
    lastUpdated: "00:00:08 ago",
    pathD: "M840,190 L840,410 L740,380 L740,220 Z",
    labelX: 760, labelY: 310,
  },
  {
    id: "D", name: "Zone D — South East", occupancy: 1365, capacity: 6500, areaSquareMeters: 1500, densityValue: 0.91,
    percent: 21, trend: "falling", density: "low",
    lastUpdated: "00:00:08 ago",
    pathD: "M830,430 L620,490 L580,410 L780,350 Z",
    labelX: 700, labelY: 455,
  },
  {
    id: "E", name: "Zone E — South Stand", occupancy: 5915, capacity: 6500, areaSquareMeters: 730, densityValue: 8.10,
    percent: 91, trend: "rising", density: "critical",
    lastUpdated: "00:01:05 ago",
    pathD: "M600,500 L400,500 L350,420 L650,420 Z",
    labelX: 490, labelY: 465,
  },
  {
    id: "F", name: "Zone F — South West", occupancy: 4680, capacity: 6500, areaSquareMeters: 1500, densityValue: 3.12,
    percent: 72, trend: "stable", density: "medium",
    lastUpdated: "00:00:08 ago",
    pathD: "M380,490 L170,430 L220,350 L420,410 Z",
    labelX: 265, labelY: 450,
  },
  {
    id: "G", name: "Zone G — West Stand", occupancy: 2145, capacity: 6500, areaSquareMeters: 1600, densityValue: 1.34,
    percent: 33, trend: "falling", density: "low",
    lastUpdated: "00:00:08 ago",
    pathD: "M160,410 L160,190 L260,220 L260,380 Z",
    labelX: 185, labelY: 310,
  },
  {
    id: "H", name: "Zone H — North West", occupancy: 780, capacity: 6500, areaSquareMeters: 1200, densityValue: 0.65,
    percent: 12, trend: "stable", density: "low",
    lastUpdated: "00:00:08 ago",
    pathD: "M170,170 L380,110 L420,190 L220,250 Z",
    labelX: 270, labelY: 185,
  },
];

export const INCIDENTS: Incident[] = [
  {
    id: "MED-2094",
    type: "medical",
    severity: "critical",
    title: "CRITICAL: Medical Request — Section 112",
    description: "Fan reported unconscious near Row G, Section 112. Security camera confirms. Crowd density 94% in Zone A complicates access.",
    location: "Section 112 / Concourse B, Zone A",
    status: "dispatched",
    createdAt: "00:04:12 ago",
    agentRecommendation: "Dispatch nearest medical team via Concourse B access point. Clear corridors at nodes N7→N12→B-East. Rapid Response Unit 4 is closest (1m 45s ETA). Recommend notifying Zone A stewards to create 2m clearance path. Fan-facing announcement should redirect Zone A ingress to Gates 5–7 temporarily.",
    toolTrace: [
      { tool: "crowd.getZoneDensity", input: '{"zoneId": "A"}', output: '{"percent": 94, "trend": "rising", "capacity": 6500}', timestampMs: 0 },
      { tool: "ops.getOpenIncidents", input: '{"severity": "critical"}', output: '[{"id": "MED-2094", "location": "Section 112"}]', timestampMs: 120 },
      { tool: "nav.findPath", input: '{"from": "MedStation-2", "to": "Section-112"}', output: '{"path": ["MedStation-2","N7","N12","B-East","Section-112"], "estimatedSeconds": 105}', timestampMs: 280 },
      { tool: "ops.recommendAction", input: '{"incidentId": "MED-2094"}', output: '{"action": "dispatch_medical", "route": "Concourse B", "ETA": "1m 45s"}', timestampMs: 410 },
    ],
  },
  {
    id: "SEC-0431",
    type: "security",
    severity: "critical",
    title: "CRITICAL: VIP Escort Route Deviation",
    description: "Route deviation detected for VIP convoy. Recalculating perimeter security protocols.",
    location: "VIP Entrance / Gate 1",
    status: "open",
    createdAt: "Just now",
    agentRecommendation: "Activate perimeter security protocol ALPHA-7. Divert VIP convoy to secondary route via Service Road C. Notify Gate 1 and Gate 2 stewards immediately.",
    toolTrace: [
      { tool: "ops.getOpenIncidents", input: '{"type": "security"}', output: '[{"id": "SEC-0431"}]', timestampMs: 0 },
      { tool: "nav.findPath", input: '{"from": "VIP-Gate", "to": "VIP-Suite", "avoidZones": ["A"]}', output: '{"path": ["VIP-Gate","ServiceRoad-C","VIP-Suite"], "estimatedSeconds": 180}', timestampMs: 150 },
      { tool: "ops.recommendAction", input: '{"incidentId": "SEC-0431"}', output: '{"action": "activate_protocol", "protocol": "ALPHA-7"}', timestampMs: 290 },
    ],
  },
  {
    id: "CRW-0091",
    type: "crowd",
    severity: "warning",
    title: "WARNING: Gate 4 Sensor Timeout",
    description: "Intermittent signal loss detected at Gate 4 turnstiles. Entry rate estimates unreliable.",
    location: "Gate 4 — East Entrance",
    status: "open",
    createdAt: "00:12:44 ago",
    agentRecommendation: "Dispatch technical team to Gate 4. Fallback to manual count protocol. Use Zone C sensor data to estimate Gate 4 throughput.",
    toolTrace: [
      { tool: "crowd.getZoneDensity", input: '{"zoneId": "C"}', output: '{"percent": 68, "trend": "rising"}', timestampMs: 0 },
      { tool: "ops.recommendAction", input: '{"incidentId": "CRW-0091"}', output: '{"action": "dispatch_technical", "fallback": "manual_count"}', timestampMs: 180 },
    ],
  },
  {
    id: "LOG-0182",
    type: "logistics",
    severity: "info",
    title: "INFO: Service Vehicle SV-92",
    description: "Service vehicle SV-92 entering loading dock 2. Clearance verified.",
    location: "Loading Dock 2 — South Wing",
    status: "resolved",
    createdAt: "00:21:05 ago",
    agentRecommendation: "No action required. Vehicle is cleared. Log for audit.",
    toolTrace: [],
  },
];

export const GATES: Gate[] = [
  { id: "G1", name: "Gate 1 — North Main", entryRate: 142, queueLength: 45, status: "controlled" },
  { id: "G2", name: "Gate 2 — North East", entryRate: 89, queueLength: 12, status: "open" },
  { id: "G3", name: "Gate 3 — East Main", entryRate: 201, queueLength: 88, status: "controlled" },
  { id: "G4", name: "Gate 4 — East Side", entryRate: 0, queueLength: 0, status: "closed" },
  { id: "G5", name: "Gate 5 — South East", entryRate: 67, queueLength: 8, status: "open" },
  { id: "G6", name: "Gate 6 — South Main", entryRate: 156, queueLength: 34, status: "open" },
  { id: "G7", name: "Gate 7 — West Main", entryRate: 34, queueLength: 4, status: "open" },
];

// Navgraph nodes for indoor navigation
export const NAV_NODES = {
  "entrance-north": { x: 200, y: 80, label: "North Entrance", amenity: null },
  "concourse-A": { x: 200, y: 150, label: "Concourse A", amenity: null },
  "section-101": { x: 100, y: 200, label: "Section 101", amenity: null },
  "section-108": { x: 300, y: 350, label: "Section 108", amenity: null },
  "section-112": { x: 200, y: 320, label: "Section 112", amenity: null },
  "restroom-B": { x: 320, y: 320, label: "Restroom B", amenity: "wc" },
  "food-east": { x: 60, y: 200, label: "Food Court", amenity: "fastfood" },
  "first-aid": { x: 200, y: 240, label: "First Aid", amenity: "medical_services" },
  "you": { x: 100, y: 320, label: "You Are Here", amenity: null },
};

// Demo script — deterministic incidents for guaranteed demo flow
export const DEMO_SCRIPT = [
  { delayMs: 5000, incidentId: "MED-2094", action: "escalate" },
  { delayMs: 15000, incidentId: "CRW-0091", action: "update", zonePercent: 75 },
  { delayMs: 30000, incidentId: "SEC-0431", action: "resolve" },
];

/**
 * Fruin's Level of Service (LOS) Density Bands for Crowd Science & Safety:
 * - < 1.5 people/m²: Normal (low) — Free movement, LOS A-C
 * - 1.5–4.0 people/m²: Moderate (medium) — Restricted movement, Fruin LOS D-E territory
 * - 4.0–8.0 people/m²: High/Critical (high) — Approaching real crowd-crush-risk density (peer-reviewed analysis of 2022 Itaewon crush measured avg crush density at 7.57 people/m², peak 9.95)
 * - > 8.0 people/m²: Critical/Emergency (critical) — Extreme crush hazard, LOS F+
 */
export const FRUIN_THRESHOLDS = {
  NORMAL_MAX: 1.5,
  MODERATE_MAX: 4.0,
  HIGH_MAX: 8.0,
} as const;

export function calculateDensityLevel(occupancy: number, areaSquareMeters?: number): ZoneDensity {
  if (!areaSquareMeters || areaSquareMeters <= 0) return "low";
  const density = occupancy / areaSquareMeters;
  if (density > FRUIN_THRESHOLDS.HIGH_MAX) return "critical";
  if (density >= FRUIN_THRESHOLDS.MODERATE_MAX) return "high";
  if (density >= FRUIN_THRESHOLDS.NORMAL_MAX) return "medium";
  return "low";
}

export function calculateDensityValue(occupancy: number, areaSquareMeters?: number): number {
  if (!areaSquareMeters || areaSquareMeters <= 0) return 0;
  return Number((occupancy / areaSquareMeters).toFixed(2));
}

// Helper: zone density color
export function densityColor(density: ZoneDensity): string {
  switch (density) {
    case "critical": return "#ffb4ab";
    case "high": return "#ffb86c";
    case "medium": return "#ffb86c";
    case "low": return "#00dbe7";
    default: return "#849495";
  }
}

export function densityFill(density: ZoneDensity): string {
  switch (density) {
    case "critical": return "rgba(255,180,171,0.25)";
    case "high": return "rgba(255,184,108,0.2)";
    case "medium": return "rgba(255,184,108,0.15)";
    case "low": return "rgba(0,219,231,0.12)";
    default: return "rgba(132,148,149,0.1)";
  }
}

export function severityBg(severity: Incident["severity"]): string {
  switch (severity) {
    case "critical": return "bg-[#1a0a0a] border-l-4 border-[#ffb4ab]";
    case "warning": return "bg-[#272a31] border-l-4 border-[#ffb86c]";
    case "info": return "bg-[#272a31] border-l-4 border-[#849495]";
  }
}

export function severityBadge(severity: Incident["severity"]): string {
  switch (severity) {
    case "critical": return "bg-[#93000a] text-[#ffdad6]";
    case "warning": return "bg-[#ffb86c]/20 text-[#ffb86c]";
    case "info": return "bg-[#849495]/20 text-[#849495]";
  }
}
