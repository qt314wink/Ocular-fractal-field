import { describe, expect, it } from 'vitest';

import { createInitialState, stepState, type NormalizedInputSample } from '../src/index.js';
import { validManifest } from './support/valid-manifest.js';

describe('stepState', () => {
  it('applies tick-addressed dolly input and bounded turbulence decay immutably', () => {
    const state = createInitialState(validManifest);
    const original = structuredClone(state);

    const result = stepState(
      state,
      [{ tick: 0, type: 'camera.dolly', logarithmicDelta: -0.1 }],
      1 / 60,
      validManifest,
    );

    expect(result.state.tick).toBe(1);
    expect(result.state.camera.radiusUnits).toBeLessThan(130);
    expect(result.state.field.turbulenceNormalized).toBeGreaterThanOrEqual(0);
    expect(result.events).toContainEqual({
      tick: 0,
      type: 'camera.intent.accepted',
      inputType: 'camera.dolly',
    });
    expect(state).toEqual(original);
  });

  it('clamps camera safety limits and emits an exact safety event', () => {
    const state = createInitialState(validManifest);
    const result = stepState(
      state,
      [{ tick: 0, type: 'camera.dolly', logarithmicDelta: -100 }],
      1 / 60,
      validManifest,
    );

    expect(result.state.camera.radiusUnits).toBe(validManifest.gameRules.cameraRadiusMinUnits);
    expect(result.events.some((event) => event.type === 'safety.clamped')).toBe(true);
  });

  it('rejects mistimed and non-finite inputs without applying them', () => {
    const state = createInitialState(validManifest);
    const result = stepState(
      state,
      [
        { tick: 1, type: 'camera.roll', deltaRad: 0.5 },
        { tick: 0, type: 'camera.orbit', deltaYawRad: Number.NaN, deltaPitchRad: 0 },
      ],
      1 / 60,
      validManifest,
    );

    expect(result.state.camera).toEqual(state.camera);
    expect(result.events).toHaveLength(2);
    expect(result.events.every((event) => event.type === 'input.rejected')).toBe(true);
  });

  it('exposes every authorized normalized input discriminant', () => {
    const inputs = [
      { tick: 0, type: 'camera.orbit', deltaYawRad: 0, deltaPitchRad: 0 },
      { tick: 0, type: 'camera.dolly', logarithmicDelta: 0 },
      { tick: 0, type: 'camera.roll', deltaRad: 0 },
      { tick: 0, type: 'camera.freeze', frozen: true },
      { tick: 0, type: 'camera.recenter' },
      { tick: 0, type: 'itinerary.resume' },
      { tick: 0, type: 'trace.begin', traceId: 'trace-1' },
      { tick: 0, type: 'trace.sample', xNormalized: 0.5, yNormalized: 0.5 },
      { tick: 0, type: 'trace.end' },
    ] satisfies NormalizedInputSample[];

    expect(inputs.map((input) => input.type)).toHaveLength(9);
  });
});
