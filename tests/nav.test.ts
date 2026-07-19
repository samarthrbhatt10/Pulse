import { describe, it, expect } from 'vitest';
import { INITIAL_VENUE_NODES, INITIAL_VENUE_EDGES } from '@/lib/firestore/seed';
import { executeTool } from '@/lib/agent/loop';
import { VenueNode, VenueEdge } from '@/lib/firestore/schema';

// Core Dijkstra / A* graph algorithm calculation over concourse network
export function calculateShortestPath(
  fromNodeId: string,
  toNodeId: string,
  nodes: VenueNode[],
  edges: VenueEdge[]
): { path: string[] | null; estimatedSeconds: number; error?: string } {
  if (fromNodeId === toNodeId) {
    return { path: [fromNodeId], estimatedSeconds: 0 };
  }

  const nodeMap = new Map<string, VenueNode>();
  for (const n of nodes) nodeMap.set(n.id, n);

  if (!nodeMap.has(fromNodeId) || !nodeMap.has(toNodeId)) {
    return { path: null, estimatedSeconds: 0, error: 'Source or destination node not found in graph.' };
  }

  // Adjacency list (undirected graph for walk paths)
  const adj = new Map<string, Array<{ to: string; weight: number }>>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) {
    adj.get(e.fromNodeId)?.push({ to: e.toNodeId, weight: e.walkTimeSeconds });
    adj.get(e.toNodeId)?.push({ to: e.fromNodeId, weight: e.walkTimeSeconds });
  }

  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const unvisited = new Set<string>();

  for (const n of nodes) {
    dist.set(n.id, Infinity);
    prev.set(n.id, null);
    unvisited.add(n.id);
  }
  dist.set(fromNodeId, 0);

  while (unvisited.size > 0) {
    let curr: string | null = null;
    let minDist = Infinity;
    for (const u of unvisited) {
      const d = dist.get(u) ?? Infinity;
      if (d < minDist) {
        minDist = d;
        curr = u;
      }
    }

    if (curr === null || minDist === Infinity || curr === toNodeId) break;
    unvisited.delete(curr);

    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.to)) continue;
      const alt = (dist.get(curr) ?? Infinity) + neighbor.weight;
      if (alt < (dist.get(neighbor.to) ?? Infinity)) {
        dist.set(neighbor.to, alt);
        prev.set(neighbor.to, curr);
      }
    }
  }

  if (dist.get(toNodeId) === Infinity) {
    return { path: null, estimatedSeconds: 0, error: 'No path found (unreachable destination).' };
  }

  const path: string[] = [];
  let step: string | null = toNodeId;
  while (step !== null) {
    path.unshift(step);
    step = prev.get(step) ?? null;
  }

  return {
    path,
    estimatedSeconds: dist.get(toNodeId) ?? 0,
  };
}

describe('Pathfinding (nav.findPath) Graph Algorithm', () => {
  describe('calculateShortestPath algorithm over stadium concourse graph', () => {
    it('returns trivial/zero-length result when source equals destination (from === to)', () => {
      const result = calculateShortestPath('node_g1', 'node_g1', INITIAL_VENUE_NODES, INITIAL_VENUE_EDGES);
      expect(result.path).toEqual(['node_g1']);
      expect(result.estimatedSeconds).toBe(0);
      expect(result.error).toBeUndefined();
    });

    it('returns clear error/null when destination is unreachable or disconnected', () => {
      const testNodes: VenueNode[] = [
        ...INITIAL_VENUE_NODES,
        { id: 'isolated_island', label: 'Isolated Suite', type: 'section', x: 999, y: 999, level: 'Roof' },
      ];
      const result = calculateShortestPath('node_g1', 'isolated_island', testNodes, INITIAL_VENUE_EDGES);
      expect(result.path).toBeNull();
      expect(result.error).toBe('No path found (unreachable destination).');
    });

    it('returns optimal shortest path and walk distance on a small fixed test graph', () => {
      const fixedNodes: VenueNode[] = [
        { id: 'A', label: 'Start Gate', type: 'gate', x: 0, y: 0, level: '1' },
        { id: 'B', label: 'Hub 1', type: 'junction', x: 10, y: 0, level: '1' },
        { id: 'C', label: 'Hub 2', type: 'junction', x: 0, y: 10, level: '1' },
        { id: 'D', label: 'End Seat', type: 'section', x: 10, y: 10, level: '1' },
      ];
      // Path A->B->D total 50s vs Path A->C->D total 120s
      const fixedEdges: VenueEdge[] = [
        { id: 'e1', fromNodeId: 'A', toNodeId: 'B', walkTimeSeconds: 20 },
        { id: 'e2', fromNodeId: 'B', toNodeId: 'D', walkTimeSeconds: 30 },
        { id: 'e3', fromNodeId: 'A', toNodeId: 'C', walkTimeSeconds: 60 },
        { id: 'e4', fromNodeId: 'C', toNodeId: 'D', walkTimeSeconds: 60 },
      ];

      const result = calculateShortestPath('A', 'D', fixedNodes, fixedEdges);
      expect(result.path).toEqual(['A', 'B', 'D']);
      expect(result.estimatedSeconds).toBe(50);
    });
  });

  describe('executeTool("nav__findPath") tool handler in agent loop', () => {
    it('executes tool handler cleanly and returns structured route response', async () => {
      const res = await executeTool('nav__findPath', { from: 'Gate 1', to: 'Section 101' });
      expect(res).toBeDefined();
      expect(res).toHaveProperty('path');
      expect(res).toHaveProperty('estimatedSeconds');
    });
  });
});
