import { describe, it, expect } from 'vitest';
import { TOOL_SCHEMAS } from '@/lib/agent/tools';

describe('Agent Tool Schema Validation', () => {
  it('has valid structure for all 8 registered tool schemas', () => {
    expect(TOOL_SCHEMAS).toHaveLength(8);
    for (const schema of TOOL_SCHEMAS) {
      expect(typeof schema.name).toBe('string');
      expect(schema.name.length).toBeGreaterThan(0);
      expect(typeof schema.description).toBe('string');
      expect(schema.parameters).toBeDefined();
      expect(schema.parameters.type).toBe('object');
      expect(schema.parameters.properties).toBeDefined();
    }
  });

  it('verifies required parameters across crowd, nav, ops, and lang families', () => {
    const forecastTool = TOOL_SCHEMAS.find((t) => t.name === 'crowd__forecastCongestion');
    expect(forecastTool?.parameters.required).toEqual(['zoneId', 'horizonMinutes']);

    const rerouteTool = TOOL_SCHEMAS.find((t) => t.name === 'crowd__suggestReroute');
    expect(rerouteTool?.parameters.required).toEqual(['fromZoneId']);

    const navPathTool = TOOL_SCHEMAS.find((t) => t.name === 'nav__findPath');
    expect(navPathTool?.parameters.required).toEqual(['from', 'to']);

    const navAmenityTool = TOOL_SCHEMAS.find((t) => t.name === 'nav__locateAmenity');
    expect(navAmenityTool?.parameters.required).toEqual(['amenityType', 'fromLocation']);

    const opsRecommendTool = TOOL_SCHEMAS.find((t) => t.name === 'ops__recommendAction');
    expect(opsRecommendTool?.parameters.required).toEqual(['incidentId']);

    const langTool = TOOL_SCHEMAS.find((t) => t.name === 'lang__translateAndAnnounce');
    expect(langTool?.parameters.required).toEqual(['message', 'languages']);
  });

  it('rejects/flags missing required parameters during argument validation before Gemini call', () => {
    function validateArgs(toolName: string, args: Record<string, unknown>): { valid: boolean; missing?: string[] } {
      const schema = TOOL_SCHEMAS.find((t) => t.name === toolName);
      if (!schema) return { valid: false, missing: ['UNKNOWN_TOOL'] };
      const required = (schema.parameters as any).required || [];
      const missing = required.filter((param: string) => args[param] === undefined || args[param] === null || args[param] === '');
      return {
        valid: missing.length === 0,
        missing: missing.length > 0 ? missing : undefined,
      };
    }

    // Missing 'to' in nav__findPath
    expect(validateArgs('nav__findPath', { from: 'node_g1' })).toEqual({
      valid: false,
      missing: ['to'],
    });

    // Valid nav__findPath call
    expect(validateArgs('nav__findPath', { from: 'node_g1', to: 'node_101' })).toEqual({
      valid: true,
      missing: undefined,
    });

    // Missing required parameters in crowd__forecastCongestion
    expect(validateArgs('crowd__forecastCongestion', { zoneId: 'A' })).toEqual({
      valid: false,
      missing: ['horizonMinutes'],
    });
  });
});
