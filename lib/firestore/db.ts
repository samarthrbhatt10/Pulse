// PULSE — Complete Firestore Database Operations & Accessors per 06_DATA_MODEL_AND_APIS.md
import { db } from "../firebase";
import {
  COLLECTIONS,
  zoneConverter,
  gateConverter,
  venueNodeConverter,
  venueEdgeConverter,
  amenityConverter,
  incidentConverter,
  agentTraceConverter,
  Gate,
  VenueNode,
  VenueEdge,
  Amenity,
  AgentTrace,
} from "./schema";
import { ZONES, INCIDENTS, Zone, Incident } from "../mockData";
import { INITIAL_GATES, INITIAL_VENUE_NODES, INITIAL_VENUE_EDGES, INITIAL_AMENITIES, runFullDatabaseSeed } from "./seed";
import { collection, getDocs, doc, setDoc, updateDoc, addDoc, query, orderBy, limit } from "firebase/firestore";

/**
 * Fetch all zones from Firestore (or mock fallback).
 */
export async function getZonesFromDb(): Promise<Zone[]> {
  try {
    const zonesRef = collection(db, COLLECTIONS.ZONES).withConverter(zoneConverter);
    const snapshot = await getDocs(zonesRef);
    if (snapshot.empty) return ZONES;
    return snapshot.docs.map((d) => d.data());
  } catch (err) {
    console.warn("[Firestore] getZonesFromDb fallback:", err);
    return ZONES;
  }
}

/**
 * Fetch all gates from Firestore (or mock fallback).
 */
export async function getGatesFromDb(): Promise<Gate[]> {
  try {
    const gatesRef = collection(db, COLLECTIONS.GATES).withConverter(gateConverter);
    const snapshot = await getDocs(gatesRef);
    if (snapshot.empty) return INITIAL_GATES;
    return snapshot.docs.map((d) => d.data());
  } catch (err) {
    console.warn("[Firestore] getGatesFromDb fallback:", err);
    return INITIAL_GATES;
  }
}

/**
 * Fetch all venue nodes from Firestore (or mock fallback).
 */
export async function getVenueNodesFromDb(): Promise<VenueNode[]> {
  try {
    const nodesRef = collection(db, COLLECTIONS.VENUE_NODES).withConverter(venueNodeConverter);
    const snapshot = await getDocs(nodesRef);
    if (snapshot.empty) return INITIAL_VENUE_NODES;
    return snapshot.docs.map((d) => d.data());
  } catch (err) {
    console.warn("[Firestore] getVenueNodesFromDb fallback:", err);
    return INITIAL_VENUE_NODES;
  }
}

/**
 * Fetch all venue edges from Firestore (or mock fallback).
 */
export async function getVenueEdgesFromDb(): Promise<VenueEdge[]> {
  try {
    const edgesRef = collection(db, COLLECTIONS.VENUE_EDGES).withConverter(venueEdgeConverter);
    const snapshot = await getDocs(edgesRef);
    if (snapshot.empty) return INITIAL_VENUE_EDGES;
    return snapshot.docs.map((d) => d.data());
  } catch (err) {
    console.warn("[Firestore] getVenueEdgesFromDb fallback:", err);
    return INITIAL_VENUE_EDGES;
  }
}

/**
 * Fetch all amenities from Firestore (or mock fallback).
 */
export async function getAmenitiesFromDb(): Promise<Amenity[]> {
  try {
    const amenitiesRef = collection(db, COLLECTIONS.AMENITIES).withConverter(amenityConverter);
    const snapshot = await getDocs(amenitiesRef);
    if (snapshot.empty) return INITIAL_AMENITIES;
    return snapshot.docs.map((d) => d.data());
  } catch (err) {
    console.warn("[Firestore] getAmenitiesFromDb fallback:", err);
    return INITIAL_AMENITIES;
  }
}

/**
 * Fetch all incidents from Firestore (or mock fallback).
 */
export async function getIncidentsFromDb(): Promise<Incident[]> {
  try {
    const incidentsRef = collection(db, COLLECTIONS.INCIDENTS).withConverter(incidentConverter);
    const snapshot = await getDocs(incidentsRef);
    if (snapshot.empty) return INCIDENTS;
    return snapshot.docs.map((d) => d.data());
  } catch (err) {
    console.warn("[Firestore] getIncidentsFromDb fallback:", err);
    return INCIDENTS;
  }
}

/**
 * Save an agent trace execution log to the agentTraces collection.
 */
export async function saveAgentTraceToDb(trace: AgentTrace): Promise<string | null> {
  try {
    const tracesRef = collection(db, COLLECTIONS.AGENT_TRACES).withConverter(agentTraceConverter);
    const docRef = await addDoc(tracesRef, trace);
    return docRef.id;
  } catch (err) {
    console.warn("[Firestore] saveAgentTraceToDb failed:", err);
    return null;
  }
}

/**
 * Fetch recent agent traces from Firestore.
 */
export async function getAgentTracesFromDb(maxResults = 25): Promise<AgentTrace[]> {
  try {
    const tracesRef = collection(db, COLLECTIONS.AGENT_TRACES).withConverter(agentTraceConverter);
    const q = query(tracesRef, orderBy("createdAt", "desc"), limit(maxResults));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data());
  } catch (err) {
    console.warn("[Firestore] getAgentTracesFromDb failed:", err);
    return [];
  }
}

/**
 * Seed Firestore with initial mock zones, gates, nodes, edges, amenities, and incidents if empty.
 */
export async function seedFirestoreIfEmpty(): Promise<boolean> {
  const result = await runFullDatabaseSeed();
  return result.success;
}

/**
 * Update zone in Firestore and in-memory state.
 */
export async function updateZoneInDb(zoneId: string, updates: Partial<Zone>): Promise<void> {
  const target = ZONES.find((z) => z.id.toUpperCase() === zoneId.toUpperCase());
  if (target) {
    Object.assign(target, updates);
  }
  try {
    const zoneDoc = doc(db, COLLECTIONS.ZONES, zoneId);
    await updateDoc(zoneDoc, updates);
  } catch (err) {
    console.warn(`[Firestore] Local/fallback update zone ${zoneId}`);
  }
}

/**
 * Update gate in Firestore and in-memory state.
 */
export async function updateGateInDb(gateId: string, updates: Partial<Gate>): Promise<void> {
  const target = INITIAL_GATES.find((g) => g.id === gateId);
  if (target) {
    Object.assign(target, updates);
  }
  try {
    const gateDoc = doc(db, COLLECTIONS.GATES, gateId);
    await updateDoc(gateDoc, updates);
  } catch (err) {
    console.warn(`[Firestore] Local/fallback update gate ${gateId}`);
  }
}

/**
 * Create or update an incident in Firestore and in-memory state.
 */
export async function saveIncidentToDb(incident: Incident): Promise<void> {
  const idx = INCIDENTS.findIndex((i) => i.id === incident.id);
  if (idx >= 0) {
    Object.assign(INCIDENTS[idx], incident);
  } else {
    INCIDENTS.unshift(incident);
  }
  try {
    const incDoc = doc(db, COLLECTIONS.INCIDENTS, incident.id);
    await setDoc(incDoc, incident, { merge: true });
  } catch (err) {
    console.warn(`[Firestore] Local/fallback save incident ${incident.id}`);
  }
}
