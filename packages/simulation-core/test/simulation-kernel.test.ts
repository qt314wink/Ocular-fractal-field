import { describe, expect, it } from 'vitest';

import { SimulationKernel } from '../src/index.js';
import { validManifest } from './support/valid-manifest.js';

function createKernel(): SimulationKernel {
  return new SimulationKernel(validManifest);
}

describe('SimulationKernel', () => {
  it.each([30, 60, 120])('advances one canonical second at %i display Hz', (displayHz) => {
    const kernel = createKernel();

    for (let frame = 0; frame < displayHz; frame += 1) {
      kernel.advance(1 / displayHz, []);
    }

    expect(kernel.currentState.tick).toBe(60);
  });

  it('clamps a stalled frame without entering an unbounded catch-up loop', () => {
    const kernel = createKernel();
    const result = kernel.advance(10, []);

    expect(result.stepsExecuted).toBeLessThanOrEqual(15);
    expect(result.alpha).toBeGreaterThanOrEqual(0);
    expect(result.alpha).toBeLessThan(1);
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid real delta %s without advancing',
    (realDeltaSec) => {
      const kernel = createKernel();
      const result = kernel.advance(realDeltaSec, []);

      expect(result.stepsExecuted).toBe(0);
      expect(result.current.tick).toBe(0);
      expect(result.events).toHaveLength(1);
      expect(result.events[0]?.type).toBe('kernel.delta.rejected');
    },
  );

  it('queues future tick inputs and exposes immutable previous/current snapshots', () => {
    const kernel = createKernel();
    const initial = kernel.currentState;

    const result = kernel.advance(2 / 60, [{ tick: 1, type: 'camera.roll', deltaRad: 0.25 }]);

    expect(result.stepsExecuted).toBe(2);
    expect(result.previous.tick).toBe(1);
    expect(result.current.tick).toBe(2);
    expect(result.current.camera.rollRad).toBe(0.25);
    expect(initial.tick).toBe(0);
    expect(initial.camera.rollRad).toBe(0);
  });
});
