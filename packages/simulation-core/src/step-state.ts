import type { ValidatedManifest } from '@off/contracts';
import { clamp } from '@off/deterministic-math';

import { applyInput } from './apply-input.js';
import type { NormalizedInputSample, SemanticEvent, SimulationState, StepResult } from './types.js';

export function createInitialState(manifest: ValidatedManifest): SimulationState {
  const initialPose = manifest.itinerary.segments[0]?.pose;
  if (initialPose === undefined) {
    throw new Error('Validated manifest has no initial itinerary pose');
  }

  return {
    tick: 0,
    camera: {
      radiusUnits: initialPose.radiusUnits,
      pitchRad: initialPose.pitchRad,
      yawRad: initialPose.yawRad,
      rollRad: initialPose.rollRad,
      fovDeg: initialPose.fovDeg,
      frozen: false,
      itineraryPaused: false,
    },
    field: {
      turbulenceNormalized: manifest.gameRules.initialTurbulenceNormalized,
    },
    trace: { active: false, traceId: null, samples: [] },
  };
}

export function stepState(
  state: SimulationState,
  inputs: readonly NormalizedInputSample[],
  stepSec: number,
  manifest: ValidatedManifest,
): StepResult {
  if (!Number.isFinite(stepSec) || stepSec <= 0) {
    throw new RangeError('stepSec must be finite and greater than zero');
  }

  let current = state;
  const events: SemanticEvent[] = [];
  for (const input of inputs) {
    const result = applyInput(current, input, manifest);
    current = result.state;
    events.push(...result.events);
  }

  const turbulenceNormalized = clamp(
    current.field.turbulenceNormalized - manifest.gameRules.turbulenceDecayPerSec * stepSec,
    0,
    1,
  );

  return {
    state: {
      ...current,
      tick: state.tick + 1,
      field: { ...current.field, turbulenceNormalized },
    },
    events,
  };
}
