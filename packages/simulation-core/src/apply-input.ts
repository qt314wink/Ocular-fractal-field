import type { ValidatedManifest } from '@off/contracts';
import { clamp } from '@off/deterministic-math';

import type { NormalizedInputSample, SemanticEvent, SimulationState } from './types.js';

interface InputResult {
  readonly state: SimulationState;
  readonly events: readonly SemanticEvent[];
}

const PITCH_LIMIT_RAD = Math.PI / 2 - 1e-4;

export function applyInput(
  state: SimulationState,
  input: NormalizedInputSample,
  manifest: ValidatedManifest,
): InputResult {
  if (input.tick !== state.tick) {
    return reject(state, input, 'TICK_MISMATCH');
  }

  switch (input.type) {
    case 'camera.orbit': {
      if (!areFinite(input.deltaYawRad, input.deltaPitchRad)) {
        return reject(state, input, 'NON_FINITE_VALUE');
      }
      if (state.camera.frozen) {
        return reject(state, input, 'CAMERA_FROZEN');
      }
      const attemptedPitch = state.camera.pitchRad + input.deltaPitchRad;
      const pitchRad = clamp(attemptedPitch, -PITCH_LIMIT_RAD, PITCH_LIMIT_RAD);
      return acceptCamera(
        state,
        input,
        {
          ...state.camera,
          pitchRad,
          yawRad: state.camera.yawRad + input.deltaYawRad,
          itineraryPaused: true,
        },
        pitchRad === attemptedPitch
          ? []
          : [clamped(state.tick, 'camera.pitchRad', attemptedPitch, pitchRad)],
      );
    }
    case 'camera.dolly': {
      if (!areFinite(input.logarithmicDelta)) {
        return reject(state, input, 'NON_FINITE_VALUE');
      }
      if (state.camera.frozen) {
        return reject(state, input, 'CAMERA_FROZEN');
      }
      const attemptedRadius = state.camera.radiusUnits * Math.exp(input.logarithmicDelta);
      const radiusUnits = clamp(
        attemptedRadius,
        manifest.gameRules.cameraRadiusMinUnits,
        manifest.gameRules.cameraRadiusMaxUnits,
      );
      return acceptCamera(
        state,
        input,
        { ...state.camera, radiusUnits, itineraryPaused: true },
        radiusUnits === attemptedRadius
          ? []
          : [clamped(state.tick, 'camera.radiusUnits', attemptedRadius, radiusUnits)],
      );
    }
    case 'camera.roll':
      if (!areFinite(input.deltaRad)) {
        return reject(state, input, 'NON_FINITE_VALUE');
      }
      if (state.camera.frozen) {
        return reject(state, input, 'CAMERA_FROZEN');
      }
      return acceptCamera(state, input, {
        ...state.camera,
        rollRad: state.camera.rollRad + input.deltaRad,
        itineraryPaused: true,
      });
    case 'camera.freeze':
      return acceptCamera(state, input, {
        ...state.camera,
        frozen: input.frozen,
        itineraryPaused: input.frozen || state.camera.itineraryPaused,
      });
    case 'camera.recenter': {
      if (state.camera.frozen) {
        return reject(state, input, 'CAMERA_FROZEN');
      }
      const initialPose = manifest.itinerary.segments[0]?.pose;
      if (initialPose === undefined) {
        throw new Error('Validated manifest has no initial itinerary pose');
      }
      return acceptCamera(state, input, {
        radiusUnits: initialPose.radiusUnits,
        pitchRad: initialPose.pitchRad,
        yawRad: initialPose.yawRad,
        rollRad: initialPose.rollRad,
        fovDeg: initialPose.fovDeg,
        frozen: false,
        itineraryPaused: true,
      });
    }
    case 'itinerary.resume':
      return {
        state: {
          ...state,
          camera: { ...state.camera, frozen: false, itineraryPaused: false },
        },
        events: [],
      };
    case 'trace.begin':
      if (input.traceId.length === 0) {
        return reject(state, input, 'EMPTY_TRACE_ID');
      }
      if (state.trace.active) {
        return reject(state, input, 'TRACE_ALREADY_ACTIVE');
      }
      return {
        state: {
          ...state,
          trace: { active: true, traceId: input.traceId, samples: [] },
        },
        events: [],
      };
    case 'trace.sample':
      if (!areFinite(input.xNormalized, input.yNormalized)) {
        return reject(state, input, 'NON_FINITE_VALUE');
      }
      if (!state.trace.active) {
        return reject(state, input, 'TRACE_NOT_ACTIVE');
      }
      if (
        input.xNormalized < 0 ||
        input.xNormalized > 1 ||
        input.yNormalized < 0 ||
        input.yNormalized > 1
      ) {
        return reject(state, input, 'TRACE_SAMPLE_OUT_OF_RANGE');
      }
      return {
        state: {
          ...state,
          trace: {
            ...state.trace,
            samples: [
              ...state.trace.samples,
              {
                xNormalized: input.xNormalized,
                yNormalized: input.yNormalized,
              },
            ],
          },
        },
        events: [],
      };
    case 'trace.end':
      if (!state.trace.active) {
        return reject(state, input, 'TRACE_NOT_ACTIVE');
      }
      return {
        state: { ...state, trace: { ...state.trace, active: false } },
        events: [],
      };
  }
}

function acceptCamera(
  state: SimulationState,
  input: Extract<NormalizedInputSample, { type: `camera.${string}` }>,
  camera: SimulationState['camera'],
  events: readonly SemanticEvent[] = [],
): InputResult {
  return {
    state: { ...state, camera },
    events: [
      {
        tick: state.tick,
        type: 'camera.intent.accepted',
        inputType: input.type,
      },
      ...events,
    ],
  };
}

function reject(
  state: SimulationState,
  input: NormalizedInputSample,
  reason: Extract<SemanticEvent, { type: 'input.rejected' }>['reason'],
): InputResult {
  return {
    state,
    events: [
      {
        tick: state.tick,
        type: 'input.rejected',
        inputType: input.type,
        reason,
      },
    ],
  };
}

function clamped(
  tick: number,
  field: Extract<SemanticEvent, { type: 'safety.clamped' }>['field'],
  attempted: number,
  applied: number,
): SemanticEvent {
  return { tick, type: 'safety.clamped', field, attempted, applied };
}

function areFinite(...values: readonly number[]): boolean {
  return values.every(Number.isFinite);
}
