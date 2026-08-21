import type { ValidatedManifest } from '@off/contracts';
import { clamp } from '@off/deterministic-math';

import { createInitialState, stepState } from './step-state.js';
import type {
  NormalizedInputSample,
  SemanticEvent,
  SimulationSnapshot,
  SimulationState,
} from './types.js';

export interface AdvanceResult {
  readonly previous: SimulationSnapshot;
  readonly current: SimulationSnapshot;
  readonly alpha: number;
  readonly stepsExecuted: number;
  readonly events: readonly SemanticEvent[];
}

export class SimulationKernel {
  private readonly stepSec: number;
  private readonly maxAccumulatorSec: number;
  private readonly maxStepsPerAdvance: number;
  private readonly queuedInputs = new Map<number, NormalizedInputSample[]>();
  private accumulatorSec = 0;
  private previousSnapshot: SimulationState;
  private currentSnapshot: SimulationState;

  public constructor(private readonly manifest: ValidatedManifest) {
    this.stepSec = 1 / manifest.engine.simulationHz;
    this.maxAccumulatorSec = manifest.engine.maxAccumulatorSec;
    this.maxStepsPerAdvance = Math.ceil(this.maxAccumulatorSec / this.stepSec);
    this.currentSnapshot = createInitialState(manifest);
    this.previousSnapshot = this.currentSnapshot;
  }

  public get currentState(): SimulationSnapshot {
    return this.currentSnapshot;
  }

  public get previousState(): SimulationSnapshot {
    return this.previousSnapshot;
  }

  public advance(realDeltaSec: number, inputs: readonly NormalizedInputSample[]): AdvanceResult {
    if (!Number.isFinite(realDeltaSec)) {
      return this.rejectedDelta('NON_FINITE_DELTA');
    }
    if (realDeltaSec < 0) {
      return this.rejectedDelta('NEGATIVE_DELTA');
    }

    const events = this.queueInputs(inputs);
    this.accumulatorSec = Math.min(this.accumulatorSec + realDeltaSec, this.maxAccumulatorSec);

    let stepsExecuted = 0;
    const comparisonEpsilon = this.stepSec * 1e-12;
    while (
      this.accumulatorSec + comparisonEpsilon >= this.stepSec &&
      stepsExecuted < this.maxStepsPerAdvance
    ) {
      const tick = this.currentSnapshot.tick;
      const tickInputs = this.queuedInputs.get(tick) ?? [];
      this.queuedInputs.delete(tick);

      this.previousSnapshot = this.currentSnapshot;
      const result = stepState(this.currentSnapshot, tickInputs, this.stepSec, this.manifest);
      this.currentSnapshot = result.state;
      events.push(...result.events);

      this.accumulatorSec -= this.stepSec;
      if (this.accumulatorSec < 0 && this.accumulatorSec > -comparisonEpsilon) {
        this.accumulatorSec = 0;
      }
      stepsExecuted += 1;
    }

    return {
      previous: this.previousSnapshot,
      current: this.currentSnapshot,
      alpha: clamp(this.accumulatorSec / this.stepSec, 0, 1 - Number.EPSILON),
      stepsExecuted,
      events,
    };
  }

  private queueInputs(inputs: readonly NormalizedInputSample[]): SemanticEvent[] {
    const events: SemanticEvent[] = [];
    for (const input of inputs) {
      if (!Number.isSafeInteger(input.tick) || input.tick < this.currentSnapshot.tick) {
        events.push({
          tick: this.currentSnapshot.tick,
          type: 'input.rejected',
          inputType: input.type,
          reason: 'TICK_MISMATCH',
        });
        continue;
      }

      const queued = this.queuedInputs.get(input.tick);
      if (queued === undefined) {
        this.queuedInputs.set(input.tick, [input]);
      } else {
        queued.push(input);
      }
    }
    return events;
  }

  private rejectedDelta(
    reason: Extract<SemanticEvent, { type: 'kernel.delta.rejected' }>['reason'],
  ): AdvanceResult {
    return {
      previous: this.previousSnapshot,
      current: this.currentSnapshot,
      alpha: clamp(this.accumulatorSec / this.stepSec, 0, 1 - Number.EPSILON),
      stepsExecuted: 0,
      events: [{ tick: this.currentSnapshot.tick, type: 'kernel.delta.rejected', reason }],
    };
  }
}
