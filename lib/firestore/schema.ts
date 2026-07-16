// PULSE — Complete Firestore Collection Schemas & Data Converters per 06_DATA_MODEL_AND_APIS.md
import { DocumentData, QueryDocumentSnapshot, SnapshotOptions, FirestoreDataConverter } from "firebase/firestore";
import { Zone, Incident, BroadcastMessage } from "../mockData";

export const COLLECTIONS = {
  ZONES: "zones",
  GATES: "gates",
  VENUE_NODES: "venueGraph_nodes",
  VENUE_EDGES: "venueGraph_edges",
  AMENITIES: "amenities",
  INCIDENTS: "incidents",
  AGENT_TRACES: "agentTraces",
  USERS: "users",
  BROADCASTS: "broadcasts",
} as const;

// 1. Gate Interface & Converter
export interface Gate {
  id: string;
  name: string;
  entryRatePerMin: number;
  queueEstimate: number;
  connectedZoneId: string;
  status?: "active" | "congested" | "closed";
}

export const gateConverter: FirestoreDataConverter<Gate> = {
  toFirestore(gate: Gate): DocumentData {
    return { ...gate };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Gate {
    const data = snapshot.data(options)!;
    return {
      id: snapshot.id,
      name: data.name ?? `Gate ${snapshot.id}`,
      entryRatePerMin: data.entryRatePerMin ?? 150,
      queueEstimate: data.queueEstimate ?? 5,
      connectedZoneId: data.connectedZoneId ?? "A",
      status: data.status ?? "active",
    };
  },
};

// 2. Venue Graph Node Interface & Converter
export interface VenueNode {
  id: string;
  label: string;
  type: "gate" | "section" | "amenity" | "junction";
  x: number;
  y: number;
  level: string;
}

export const venueNodeConverter: FirestoreDataConverter<VenueNode> = {
  toFirestore(node: VenueNode): DocumentData {
    return { ...node };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): VenueNode {
    const data = snapshot.data(options)!;
    return {
      id: snapshot.id,
      label: data.label ?? snapshot.id,
      type: data.type ?? "junction",
      x: data.x ?? 200,
      y: data.y ?? 200,
      level: data.level ?? "Level 1",
    };
  },
};

// 3. Venue Graph Edge Interface & Converter
export interface VenueEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  walkTimeSeconds: number;
}

export const venueEdgeConverter: FirestoreDataConverter<VenueEdge> = {
  toFirestore(edge: VenueEdge): DocumentData {
    return { ...edge };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): VenueEdge {
    const data = snapshot.data(options)!;
    return {
      id: snapshot.id,
      fromNodeId: data.fromNodeId ?? "",
      toNodeId: data.toNodeId ?? "",
      walkTimeSeconds: data.walkTimeSeconds ?? 60,
    };
  },
};

// 4. Amenity Interface & Converter
export interface Amenity {
  id: string;
  type: "restroom" | "medical" | "concession" | "exit" | "security";
  nodeId: string;
  name?: string;
  status: "open" | "long_queue" | "out_of_service";
}

export const amenityConverter: FirestoreDataConverter<Amenity> = {
  toFirestore(amenity: Amenity): DocumentData {
    return { ...amenity };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Amenity {
    const data = snapshot.data(options)!;
    return {
      id: snapshot.id,
      type: data.type ?? "restroom",
      nodeId: data.nodeId ?? "",
      name: data.name ?? `${data.type} ${snapshot.id}`,
      status: data.status ?? "open",
    };
  },
};

// 5. Agent Trace Interface & Converter
export interface AgentTrace {
  id?: string;
  incidentId: string | null;
  toolCalls: Array<{
    tool: string;
    input: Record<string, unknown>;
    output: unknown;
    timestampMs: number;
    durationMs?: number;
  }>;
  finalResponse: string;
  createdAt: string; // ISO string or timestamp
}

export const agentTraceConverter: FirestoreDataConverter<AgentTrace> = {
  toFirestore(trace: AgentTrace): DocumentData {
    return {
      incidentId: trace.incidentId ?? null,
      toolCalls: trace.toolCalls ?? [],
      finalResponse: trace.finalResponse ?? "",
      createdAt: trace.createdAt ?? new Date().toISOString(),
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): AgentTrace {
    const data = snapshot.data(options)!;
    return {
      id: snapshot.id,
      incidentId: data.incidentId ?? null,
      toolCalls: data.toolCalls ?? [],
      finalResponse: data.finalResponse ?? "",
      createdAt: data.createdAt ?? new Date().toISOString(),
    };
  },
};

// 6. User Interface & Converter
export interface UserDoc {
  uid: string;
  email?: string;
  role: "organizer" | "volunteer" | "fan";
  preferredLanguage: string;
}

export const userConverter: FirestoreDataConverter<UserDoc> = {
  toFirestore(user: UserDoc): DocumentData {
    return { ...user };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): UserDoc {
    const data = snapshot.data(options)!;
    return {
      uid: snapshot.id,
      email: data.email ?? "",
      role: data.role ?? "fan",
      preferredLanguage: data.preferredLanguage ?? "en",
    };
  },
};

// 7. Zone & Incident Converters per 06_DATA_MODEL_AND_APIS.md
export const zoneConverter: FirestoreDataConverter<Zone> = {
  toFirestore(zone: Zone): DocumentData {
    return { ...zone };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Zone {
    const data = snapshot.data(options)!;
    return {
      id: snapshot.id,
      name: data.name ?? `Zone ${snapshot.id}`,
      occupancy: data.occupancy ?? data.currentOccupancy ?? 0,
      capacity: data.capacity ?? 6500,
      percent: data.percent ?? Math.round(((data.occupancy ?? data.currentOccupancy ?? 0) / (data.capacity ?? 6500)) * 100),
      trend: data.trend ?? "stable",
      density: data.density ?? "low",
      lastUpdated: data.lastUpdated ?? new Date().toISOString(),
      location: data.location,
      pathD: data.pathD ?? "",
      labelX: data.labelX ?? 500,
      labelY: data.labelY ?? 300,
    };
  },
};

export const incidentConverter: FirestoreDataConverter<Incident> = {
  toFirestore(incident: Incident): DocumentData {
    return { ...incident };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Incident {
    const data = snapshot.data(options)!;
    return {
      id: snapshot.id,
      type: data.type ?? "security",
      severity: data.severity ?? "info",
      title: data.title ?? "Incident",
      description: data.description ?? "",
      location: data.location ?? data.locationNodeId ?? "Unknown",
      status: data.status ?? "open",
      createdAt: data.createdAt ?? new Date().toISOString(),
      agentRecommendation: data.agentRecommendation ?? data.recommendation,
      toolTrace: data.toolTrace ?? [],
    };
  },
};

export const broadcastConverter: FirestoreDataConverter<BroadcastMessage> = {
  toFirestore(msg: BroadcastMessage): DocumentData {
    return { ...msg };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): BroadcastMessage {
    const data = snapshot.data(options)!;
    return {
      id: snapshot.id,
      original: data.original ?? "",
      translations: data.translations ?? {},
      sentAt: data.sentAt ?? new Date().toISOString(),
      languages: data.languages ?? ["en"],
    };
  },
};
