import { describe, it, expect } from 'vitest';
import { calculateDensityLevel, calculateDensityValue, FRUIN_THRESHOLDS } from '@/lib/mockData';

describe('Crowd Density Severity Classification (Fruin LOS)', () => {
  describe('calculateDensityLevel', () => {
    it('returns "low" when areaSquareMeters is missing, zero, or negative', () => {
      expect(calculateDensityLevel(100, undefined)).toBe('low');
      expect(calculateDensityLevel(100, 0)).toBe('low');
      expect(calculateDensityLevel(100, -50)).toBe('low');
    });

    it('returns "low" for density strictly under NORMAL_MAX (1.5 people/m²)', () => {
      expect(calculateDensityLevel(0, 100)).toBe('low'); // 0.0
      expect(calculateDensityLevel(140, 100)).toBe('low'); // 1.4
      expect(calculateDensityLevel(149, 100)).toBe('low'); // 1.49
    });

    it('returns "medium" at the exact NORMAL_MAX boundary (1.5 people/m²)', () => {
      expect(calculateDensityLevel(150, 100)).toBe('medium'); // exactly 1.5
    });

    it('returns "medium" for density clearly inside the medium band [1.5, 4.0)', () => {
      expect(calculateDensityLevel(200, 100)).toBe('medium'); // 2.0
      expect(calculateDensityLevel(350, 100)).toBe('medium'); // 3.5
      expect(calculateDensityLevel(399, 100)).toBe('medium'); // 3.99
    });

    it('returns "high" at the exact MODERATE_MAX boundary (4.0 people/m²)', () => {
      expect(calculateDensityLevel(400, 100)).toBe('high'); // exactly 4.0
    });

    it('returns "high" for density clearly inside the high band [4.0, 8.0)', () => {
      expect(calculateDensityLevel(500, 100)).toBe('high'); // 5.0
      expect(calculateDensityLevel(750, 100)).toBe('high'); // 7.5
      expect(calculateDensityLevel(800, 100)).toBe('high'); // exactly 8.0
    });

    it('returns "critical" strictly above the HIGH_MAX boundary (> 8.0 people/m²)', () => {
      expect(calculateDensityLevel(801, 100)).toBe('critical'); // 8.01
      expect(calculateDensityLevel(1000, 100)).toBe('critical'); // 10.0
      expect(calculateDensityLevel(2500, 100)).toBe('critical'); // 25.0
    });
  });

  describe('calculateDensityValue', () => {
    it('returns 0 when area is invalid or 0', () => {
      expect(calculateDensityValue(500, 0)).toBe(0);
      expect(calculateDensityValue(500, undefined)).toBe(0);
    });

    it('calculates accurate rounded density value', () => {
      expect(calculateDensityValue(333, 100)).toBe(3.33);
      expect(calculateDensityValue(800, 100)).toBe(8);
      expect(calculateDensityValue(150, 100)).toBe(1.5);
    });
  });
});
