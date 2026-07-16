// PULSE — Seed Data Script per 06_DATA_MODEL_AND_APIS.md §4
import { db } from "../firebase";
import { COLLECTIONS } from "./schema";
import { ZONES, INCIDENTS } from "../mockData";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { Gate, VenueNode, VenueEdge, Amenity } from "./schema";

export const INITIAL_GATES: Gate[] = [
  { id: "gate_1", name: "Gate 1 - North Plaza", entryRatePerMin: 180, queueEstimate: 4, connectedZoneId: "zone_a", status: "active" },
  { id: "gate_2", name: "Gate 2 - East Concourse", entryRatePerMin: 220, queueEstimate: 7, connectedZoneId: "zone_b", status: "active" },
  { id: "gate_3", name: "Gate 3 - South VIP Arch", entryRatePerMin: 340, queueEstimate: 14, connectedZoneId: "zone_c", status: "congested" },
  { id: "gate_4", name: "Gate 4 - West Metro Entrance", entryRatePerMin: 390, queueEstimate: 18, connectedZoneId: "zone_d", status: "congested" },
  { id: "gate_5", name: "Gate 5 - Fan Zone Portal", entryRatePerMin: 150, queueEstimate: 3, connectedZoneId: "zone_e", status: "active" },
];

export const INITIAL_VENUE_NODES: VenueNode[] = [
  // Gates
  { id: "node_g1", label: "Gate 1 North", type: "gate", x: 100, y: 50, level: "Concourse Level" },
  { id: "node_g2", label: "Gate 2 East", type: "gate", x: 350, y: 200, level: "Concourse Level" },
  { id: "node_g3", label: "Gate 3 South", type: "gate", x: 200, y: 450, level: "Concourse Level" },
  { id: "node_g4", label: "Gate 4 West", type: "gate", x: 50, y: 250, level: "Concourse Level" },
  // Sections / Seating
  { id: "node_101", label: "Section 101 Lower", type: "section", x: 150, y: 120, level: "Lower Bowl" },
  { id: "node_108", label: "Section 108 Lower", type: "section", x: 280, y: 160, level: "Lower Bowl" },
  { id: "node_114", label: "Section 114 Lower", type: "section", x: 250, y: 350, level: "Lower Bowl" },
  { id: "node_118", label: "Section 118 Lower", type: "section", x: 120, y: 320, level: "Lower Bowl" },
  { id: "node_205", label: "Section 205 Upper Club", type: "section", x: 310, y: 100, level: "Club Level" },
  { id: "node_212", label: "Section 212 Upper Club", type: "section", x: 300, y: 400, level: "Club Level" },
  // Junctions / Concourses
  { id: "node_j1", label: "North Concourse Hub", type: "junction", x: 160, y: 80, level: "Concourse Level" },
  { id: "node_j2", label: "East Concourse Hub", type: "junction", x: 310, y: 210, level: "Concourse Level" },
  { id: "node_j3", label: "South Concourse Hub", type: "junction", x: 210, y: 390, level: "Concourse Level" },
  { id: "node_j4", label: "West Concourse Hub", type: "junction", x: 80, y: 260, level: "Concourse Level" },
  { id: "node_j5", label: "Central Plaza Ring", type: "junction", x: 200, y: 250, level: "Concourse Level" },
  // Amenities
  { id: "node_a1", label: "Restroom A (North)", type: "amenity", x: 180, y: 70, level: "Concourse Level" },
  { id: "node_a2", label: "Restroom B (East)", type: "amenity", x: 330, y: 240, level: "Concourse Level" },
  { id: "node_a3", label: "Restroom C (South)", type: "amenity", x: 230, y: 420, level: "Concourse Level" },
  { id: "node_a4", label: "First Aid Station 1", type: "amenity", x: 90, y: 220, level: "Concourse Level" },
  { id: "node_a5", label: "Grill 12 Concession", type: "amenity", x: 290, y: 180, level: "Concourse Level" },
  { id: "node_a6", label: "Ice Cream & Churro Stand", type: "amenity", x: 140, y: 360, level: "Concourse Level" },
];

export const INITIAL_VENUE_EDGES: VenueEdge[] = [
  { id: "edge_1", fromNodeId: "node_g1", toNodeId: "node_j1", walkTimeSeconds: 45 },
  { id: "edge_2", fromNodeId: "node_j1", toNodeId: "node_101", walkTimeSeconds: 60 },
  { id: "edge_3", fromNodeId: "node_j1", toNodeId: "node_a1", walkTimeSeconds: 30 },
  { id: "edge_4", fromNodeId: "node_j1", toNodeId: "node_j5", walkTimeSeconds: 90 },
  { id: "edge_5", fromNodeId: "node_g2", toNodeId: "node_j2", walkTimeSeconds: 50 },
  { id: "edge_6", fromNodeId: "node_j2", toNodeId: "node_108", walkTimeSeconds: 65 },
  { id: "edge_7", fromNodeId: "node_j2", toNodeId: "node_a2", walkTimeSeconds: 40 },
  { id: "edge_8", fromNodeId: "node_j2", toNodeId: "node_a5", walkTimeSeconds: 35 },
  { id: "edge_9", fromNodeId: "node_j2", toNodeId: "node_j5", walkTimeSeconds: 85 },
  { id: "edge_10", fromNodeId: "node_g3", toNodeId: "node_j3", walkTimeSeconds: 55 },
  { id: "edge_11", fromNodeId: "node_j3", toNodeId: "node_114", walkTimeSeconds: 70 },
  { id: "edge_12", fromNodeId: "node_j3", toNodeId: "node_a3", walkTimeSeconds: 35 },
  { id: "edge_13", fromNodeId: "node_j3", toNodeId: "node_a6", walkTimeSeconds: 50 },
  { id: "edge_14", fromNodeId: "node_j3", toNodeId: "node_j5", walkTimeSeconds: 95 },
  { id: "edge_15", fromNodeId: "node_g4", toNodeId: "node_j4", walkTimeSeconds: 40 },
  { id: "edge_16", fromNodeId: "node_j4", toNodeId: "node_118", walkTimeSeconds: 60 },
  { id: "edge_17", fromNodeId: "node_j4", toNodeId: "node_a4", walkTimeSeconds: 25 },
  { id: "edge_18", fromNodeId: "node_j4", toNodeId: "node_j5", walkTimeSeconds: 80 },
  { id: "edge_19", fromNodeId: "node_j1", toNodeId: "node_205", walkTimeSeconds: 120 },
  { id: "edge_20", fromNodeId: "node_j3", toNodeId: "node_212", walkTimeSeconds: 130 },
];

export const INITIAL_AMENITIES: Amenity[] = [
  { id: "amenity_r1", type: "restroom", nodeId: "node_a1", name: "Restroom A (North)", status: "open" },
  { id: "amenity_r2", type: "restroom", nodeId: "node_a2", name: "Restroom B (East)", status: "open" },
  { id: "amenity_r3", type: "restroom", nodeId: "node_a3", name: "Restroom C (South)", status: "long_queue" },
  { id: "amenity_med1", type: "medical", nodeId: "node_a4", name: "First Aid Station 1", status: "open" },
  { id: "amenity_conc1", type: "concession", nodeId: "node_a5", name: "Grill 12 Concession", status: "open" },
  { id: "amenity_conc2", type: "concession", nodeId: "node_a6", name: "Ice Cream & Churro Stand", status: "open" },
  { id: "amenity_sec1", type: "security", nodeId: "node_j5", name: "Central Security Command Post", status: "open" },
];

/**
 * Execute seed script to populate all 6 core collections if empty.
 */
export async function runFullDatabaseSeed(): Promise<{ success: boolean; stats: Record<string, number>; message: string }> {
  try {
    const stats: Record<string, number> = {};

    // 1. ZONES
    const zonesSnap = await getDocs(collection(db, COLLECTIONS.ZONES));
    if (zonesSnap.empty) {
      for (const zone of ZONES) {
        await setDoc(doc(db, COLLECTIONS.ZONES, zone.id), zone);
      }
      stats.zones = ZONES.length;
    } else {
      stats.zones = zonesSnap.size;
    }

    // 2. GATES
    const gatesSnap = await getDocs(collection(db, COLLECTIONS.GATES));
    if (gatesSnap.empty) {
      for (const gate of INITIAL_GATES) {
        await setDoc(doc(db, COLLECTIONS.GATES, gate.id), gate);
      }
      stats.gates = INITIAL_GATES.length;
    } else {
      stats.gates = gatesSnap.size;
    }

    // 3. VENUE NODES
    const nodesSnap = await getDocs(collection(db, COLLECTIONS.VENUE_NODES));
    if (nodesSnap.empty) {
      for (const node of INITIAL_VENUE_NODES) {
        await setDoc(doc(db, COLLECTIONS.VENUE_NODES, node.id), node);
      }
      stats.venueNodes = INITIAL_VENUE_NODES.length;
    } else {
      stats.venueNodes = nodesSnap.size;
    }

    // 4. VENUE EDGES
    const edgesSnap = await getDocs(collection(db, COLLECTIONS.VENUE_EDGES));
    if (edgesSnap.empty) {
      for (const edge of INITIAL_VENUE_EDGES) {
        await setDoc(doc(db, COLLECTIONS.VENUE_EDGES, edge.id), edge);
      }
      stats.venueEdges = INITIAL_VENUE_EDGES.length;
    } else {
      stats.venueEdges = edgesSnap.size;
    }

    // 5. AMENITIES
    const amenitiesSnap = await getDocs(collection(db, COLLECTIONS.AMENITIES));
    if (amenitiesSnap.empty) {
      for (const amenity of INITIAL_AMENITIES) {
        await setDoc(doc(db, COLLECTIONS.AMENITIES, amenity.id), amenity);
      }
      stats.amenities = INITIAL_AMENITIES.length;
    } else {
      stats.amenities = amenitiesSnap.size;
    }

    // 6. INCIDENTS
    const incidentsSnap = await getDocs(collection(db, COLLECTIONS.INCIDENTS));
    if (incidentsSnap.empty) {
      for (const inc of INCIDENTS) {
        await setDoc(doc(db, COLLECTIONS.INCIDENTS, inc.id), inc);
      }
      stats.incidents = INCIDENTS.length;
    } else {
      stats.incidents = incidentsSnap.size;
    }

    console.info("[Firestore Seed] Full database seed complete:", stats);
    return { success: true, stats, message: "All 6 Firestore collections seeded successfully." };
  } catch (error) {
    console.error("[Firestore Seed] Seeding error:", error);
    return { success: false, stats: {}, message: `Seeding error: ${String(error)}` };
  }
}
