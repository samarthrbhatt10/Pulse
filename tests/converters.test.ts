import { describe, it, expect } from 'vitest';
import {
  gateConverter,
  venueNodeConverter,
  venueEdgeConverter,
  amenityConverter,
  agentTraceConverter,
  userConverter,
  zoneConverter,
  incidentConverter,
  broadcastConverter,
  ticketConverter,
  Gate,
  VenueNode,
  VenueEdge,
  Amenity,
  AgentTrace,
  UserDoc,
  Ticket,
} from '@/lib/firestore/schema';
import { Zone, Incident, BroadcastMessage } from '@/lib/mockData';

// Helper to create a fake QueryDocumentSnapshot
function createFakeSnapshot(id: string, dataObj: Record<string, any>) {
  return {
    id,
    data: (_options?: any) => dataObj,
    exists: () => true,
  } as any;
}

describe('Firestore Data Converters', () => {
  describe('gateConverter', () => {
    it('toFirestore and fromFirestore roundtrip cleanly with all fields', () => {
      const gate: Gate = {
        id: 'gate_1',
        name: 'North VIP Gate',
        entryRatePerMin: 250,
        queueEstimate: 12,
        connectedZoneId: 'A',
        status: 'congested',
      };
      const firestoreData = gateConverter.toFirestore(gate);
      const restored = gateConverter.fromFirestore(createFakeSnapshot('gate_1', firestoreData), {});
      expect(restored).toEqual(gate);
    });

    it('fromFirestore applies defaults when optional/missing fields occur', () => {
      const restored = gateConverter.fromFirestore(createFakeSnapshot('gate_fallback', {}), {});
      expect(restored).toEqual({
        id: 'gate_fallback',
        name: 'Gate gate_fallback',
        entryRatePerMin: 150,
        queueEstimate: 5,
        connectedZoneId: 'A',
        status: 'active',
      });
    });
  });

  describe('venueNodeConverter', () => {
    it('roundtrip works accurately', () => {
      const node: VenueNode = {
        id: 'node_101',
        label: 'Section 101 Lower',
        type: 'section',
        x: 150,
        y: 120,
        level: 'Lower Bowl',
      };
      const restored = venueNodeConverter.fromFirestore(
        createFakeSnapshot('node_101', venueNodeConverter.toFirestore(node)),
        {}
      );
      expect(restored).toEqual(node);
    });

    it('applies defaults for missing fields', () => {
      const restored = venueNodeConverter.fromFirestore(createFakeSnapshot('node_x', {}), {});
      expect(restored).toEqual({
        id: 'node_x',
        label: 'node_x',
        type: 'junction',
        x: 200,
        y: 200,
        level: 'Level 1',
      });
    });
  });

  describe('venueEdgeConverter', () => {
    it('roundtrip works accurately', () => {
      const edge: VenueEdge = {
        id: 'edge_1',
        fromNodeId: 'node_g1',
        toNodeId: 'node_j1',
        walkTimeSeconds: 45,
      };
      const restored = venueEdgeConverter.fromFirestore(
        createFakeSnapshot('edge_1', venueEdgeConverter.toFirestore(edge)),
        {}
      );
      expect(restored).toEqual(edge);
    });

    it('applies default walkTimeSeconds and node IDs when missing', () => {
      const restored = venueEdgeConverter.fromFirestore(createFakeSnapshot('edge_z', {}), {});
      expect(restored).toEqual({
        id: 'edge_z',
        fromNodeId: '',
        toNodeId: '',
        walkTimeSeconds: 60,
      });
    });
  });

  describe('amenityConverter', () => {
    it('roundtrip works accurately', () => {
      const amenity: Amenity = {
        id: 'amenity_1',
        type: 'medical',
        nodeId: 'node_a4',
        name: 'First Aid 1',
        status: 'open',
      };
      const restored = amenityConverter.fromFirestore(
        createFakeSnapshot('amenity_1', amenityConverter.toFirestore(amenity)),
        {}
      );
      expect(restored).toEqual(amenity);
    });

    it('applies defaults when data is missing', () => {
      const restored = amenityConverter.fromFirestore(createFakeSnapshot('am_2', {}), {});
      expect(restored).toEqual({
        id: 'am_2',
        type: 'restroom',
        nodeId: '',
        name: 'undefined am_2',
        status: 'open',
      });
    });
  });

  describe('agentTraceConverter', () => {
    it('roundtrip works accurately', () => {
      const trace: AgentTrace = {
        incidentId: 'inc_1',
        toolCalls: [
          { tool: 'crowd.getZoneDensity', input: { zoneId: 'A' }, output: { occupancy: 500 }, timestampMs: 120 },
        ],
        finalResponse: 'Zone A stable',
        createdAt: '2026-07-19T10:00:00.000Z',
      };
      const restored = agentTraceConverter.fromFirestore(
        createFakeSnapshot('trace_1', agentTraceConverter.toFirestore(trace)),
        {}
      );
      expect(restored.incidentId).toBe('inc_1');
      expect(restored.toolCalls).toHaveLength(1);
      expect(restored.finalResponse).toBe('Zone A stable');
    });

    it('applies defaults when trace properties missing', () => {
      const restored = agentTraceConverter.fromFirestore(createFakeSnapshot('trace_empty', {}), {});
      expect(restored.incidentId).toBeNull();
      expect(restored.toolCalls).toEqual([]);
      expect(restored.finalResponse).toBe('');
    });
  });

  describe('userConverter', () => {
    it('roundtrip works correctly', () => {
      const user: UserDoc = {
        uid: 'uid_123',
        email: 'cto@pulse.ai',
        role: 'organizer',
        preferredLanguage: 'es',
      };
      const restored = userConverter.fromFirestore(
        createFakeSnapshot('uid_123', userConverter.toFirestore(user)),
        {}
      );
      expect(restored).toEqual(user);
    });

    it('applies default fan role and en language when missing', () => {
      const restored = userConverter.fromFirestore(createFakeSnapshot('uid_missing', {}), {});
      expect(restored).toEqual({
        uid: 'uid_missing',
        email: '',
        role: 'fan',
        preferredLanguage: 'en',
      });
    });
  });

  describe('zoneConverter', () => {
    it('roundtrip and calculates accurate density value and percent', () => {
      const zone: Zone = {
        id: 'A',
        name: 'North Endzone',
        occupancy: 5000,
        capacity: 6500,
        areaSquareMeters: 1000,
        densityValue: 5,
        percent: 77,
        trend: 'rising',
        density: 'high',
        lastUpdated: '2026-07-19T12:00:00.000Z',
        location: { lat: 32.7, lng: -96.8 },
      };
      const restored = zoneConverter.fromFirestore(createFakeSnapshot('A', zoneConverter.toFirestore(zone)), {});
      expect(restored.id).toBe('A');
      expect(restored.occupancy).toBe(5000);
      expect(restored.densityValue).toBe(5);
      expect(restored.density).toBe('high');
    });

    it('applies capacity/area fallback defaults when snapshot only has minimal data', () => {
      const restored = zoneConverter.fromFirestore(createFakeSnapshot('Z', { occupancy: 1500 }), {});
      expect(restored.capacity).toBe(6500);
      expect(restored.areaSquareMeters).toBe(1000);
      expect(restored.densityValue).toBe(1.5);
      expect(restored.density).toBe('medium');
    });
  });

  describe('incidentConverter', () => {
    it('roundtrip works accurately', () => {
      const inc: Incident = {
        id: 'inc_99',
        type: 'medical',
        severity: 'critical',
        title: 'Fan slip',
        description: 'Slip near Section 101',
        location: 'Section 101',
        status: 'open',
        createdAt: '2026-07-19T11:00:00.000Z',
        agentRecommendation: 'Dispatch medics',
        toolTrace: [],
      };
      const restored = incidentConverter.fromFirestore(createFakeSnapshot('inc_99', incidentConverter.toFirestore(inc)), {});
      expect(restored).toEqual(inc);
    });

    it('applies defaults for missing fields', () => {
      const restored = incidentConverter.fromFirestore(createFakeSnapshot('inc_default', {}), {});
      expect(restored.type).toBe('security');
      expect(restored.severity).toBe('info');
      expect(restored.status).toBe('open');
    });
  });

  describe('broadcastConverter', () => {
    it('roundtrip works accurately', () => {
      const b: BroadcastMessage = {
        id: 'b_1',
        original: 'Please exit slowly.',
        translations: { es: 'Por favor salga con calma.' },
        sentAt: '2026-07-19T10:30:00.000Z',
        languages: ['en', 'es'],
      };
      const restored = broadcastConverter.fromFirestore(createFakeSnapshot('b_1', broadcastConverter.toFirestore(b)), {});
      expect(restored).toEqual(b);
    });

    it('applies default languages and translations when missing', () => {
      const restored = broadcastConverter.fromFirestore(createFakeSnapshot('b_min', { original: 'Hello' }), {});
      expect(restored.languages).toEqual(['en']);
      expect(restored.translations).toEqual({});
    });
  });

  describe('ticketConverter', () => {
    it('roundtrip works accurately', () => {
      const t: Ticket = {
        valid: true,
        used: false,
        matchName: 'WORLD CUP FINAL',
        seat: 'Row 1, Seat 1',
        usedByUid: null,
      };
      const restored = ticketConverter.fromFirestore(createFakeSnapshot('T_100', ticketConverter.toFirestore(t)), {});
      expect(restored.valid).toBe(true);
      expect(restored.used).toBe(false);
      expect(restored.usedByUid).toBeNull();
    });

    it('applies defaults when fields missing', () => {
      const restored = ticketConverter.fromFirestore(createFakeSnapshot('T_missing', {}), {});
      expect(restored.valid).toBe(true);
      expect(restored.used).toBe(false);
      expect(restored.matchName).toContain('GLOBAL TOURNAMENT 2026');
    });
  });
});
