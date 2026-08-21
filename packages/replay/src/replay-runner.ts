import type { ValidatedManifest } from '@off/contracts';
import {
  SimulationKernel,
  type NormalizedInputSample,
  type SemanticEvent,
} from '@off/simulation-core';

import { canonicalStringify } from './canonical-json.js';
import { sha256Hex } from './hash.js';

export interface ReplayEnvelope {
  readonly replayId: string;
  readonly totalTicks: number;
  readonly inputs: readonly NormalizedInputSample[];
}

export interface StateHashReceipt {
  readonly manifestHash: string;
  readonly finalStateHash: string;
  readonly eventStreamHash: string;
  readonly combinedHash: string;
  readonly finalTick: number;
}

export function runReplay(manifest: ValidatedManifest, replay: ReplayEnvelope): StateHashReceipt {
  validateReplayEnvelope(replay);

  const inputsByTick = new Map<number, NormalizedInputSample[]>();
  for (const input of replay.inputs) {
    const inputs = inputsByTick.get(input.tick);
    if (inputs === undefined) {
      inputsByTick.set(input.tick, [input]);
    } else {
      inputs.push(input);
    }
  }

  const kernel = new SimulationKernel(manifest);
  const events: SemanticEvent[] = [];
  const stepSec = 1 / manifest.engine.simulationHz;
  for (let tick = 0; tick < replay.totalTicks; tick += 1) {
    const result = kernel.advance(stepSec, inputsByTick.get(tick) ?? []);
    if (result.stepsExecuted !== 1) {
      throw new Error(`Replay tick ${tick} executed ${result.stepsExecuted} canonical steps`);
    }
    events.push(...result.events);
  }

  const manifestHash = hashCanonical(manifest);
  const finalStateHash = hashCanonical(kernel.currentState);
  const eventStreamHash = hashCanonical(events);
  const combinedHash = hashCanonical({
    eventStreamHash,
    finalStateHash,
    manifestHash,
  });

  return {
    manifestHash,
    finalStateHash,
    eventStreamHash,
    combinedHash,
    finalTick: kernel.currentState.tick,
  };
}

function hashCanonical(value: unknown): string {
  return `sha256:${sha256Hex(canonicalStringify(value))}`;
}

function validateReplayEnvelope(replay: ReplayEnvelope): void {
  if (replay.replayId.length === 0) {
    throw new TypeError('Replay ID must not be empty');
  }
  if (!Number.isSafeInteger(replay.totalTicks) || replay.totalTicks < 0) {
    throw new TypeError('Replay totalTicks must be a non-negative safe integer');
  }
  for (const input of replay.inputs) {
    if (!Number.isSafeInteger(input.tick) || input.tick < 0 || input.tick >= replay.totalTicks) {
      throw new RangeError(`Replay input tick ${input.tick} is outside its run`);
    }
  }
}
