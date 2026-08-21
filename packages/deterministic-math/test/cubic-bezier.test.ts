import { describe, expect, it } from 'vitest';

import { clamp, CubicBezier, lerp, smoothstep, wrapRadians } from '../src/index.js';

describe('CubicBezier', () => {
  it('solves endpoints and remains monotonic', () => {
    const curve = new CubicBezier([0.42, 0], [0.58, 1]);

    expect(curve.solveY(0)).toBe(0);
    expect(curve.solveY(1)).toBe(1);

    const values = Array.from({ length: 101 }, (_, index) => curve.solveY(index / 100));
    expect(values.every((value, index) => index === 0 || value >= values[index - 1]!)).toBe(true);
  });

  it('clamps the input and solves a curve with flat endpoint derivatives', () => {
    const curve = new CubicBezier([0, 0], [0, 1]);

    expect(curve.solveY(-1)).toBe(0);
    expect(curve.solveY(2)).toBe(1);
    expect(curve.solveY(0.000_1)).toBeCloseTo(0.006_263_304, 4);
  });
});

describe('deterministic scalar helpers', () => {
  it('clamps, interpolates, wraps radians, and smoothsteps at boundaries', () => {
    expect(clamp(-1, 0, 1)).toBe(0);
    expect(clamp(2, 0, 1)).toBe(1);
    expect(lerp(10, 20, 0.25)).toBe(12.5);
    expect(wrapRadians(Math.PI * 3)).toBeCloseTo(-Math.PI);
    expect(smoothstep(0, 10, -1)).toBe(0);
    expect(smoothstep(0, 10, 5)).toBe(0.5);
    expect(smoothstep(0, 10, 11)).toBe(1);
  });
});
