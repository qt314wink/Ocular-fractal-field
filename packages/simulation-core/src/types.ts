export interface CameraState {
  readonly radiusUnits: number;
  readonly pitchRad: number;
  readonly yawRad: number;
  readonly rollRad: number;
  readonly fovDeg: number;
  readonly frozen: boolean;
  readonly itineraryPaused: boolean;
}

export interface FieldState {
  readonly turbulenceNormalized: number;
}

export interface TracePoint {
  readonly xNormalized: number;
  readonly yNormalized: number;
}

export interface TraceState {
  readonly active: boolean;
  readonly traceId: string | null;
  readonly samples: readonly TracePoint[];
}

export interface SimulationState {
  readonly tick: number;
  readonly camera: CameraState;
  readonly field: FieldState;
  readonly trace: TraceState;
}

export type SimulationSnapshot = SimulationState;

interface TickAddressedInput {
  readonly tick: number;
}

export type NormalizedInputSample =
  | (TickAddressedInput & {
      readonly type: 'camera.orbit';
      readonly deltaYawRad: number;
      readonly deltaPitchRad: number;
    })
  | (TickAddressedInput & {
      readonly type: 'camera.dolly';
      readonly logarithmicDelta: number;
    })
  | (TickAddressedInput & {
      readonly type: 'camera.roll';
      readonly deltaRad: number;
    })
  | (TickAddressedInput & {
      readonly type: 'camera.freeze';
      readonly frozen: boolean;
    })
  | (TickAddressedInput & { readonly type: 'camera.recenter' })
  | (TickAddressedInput & { readonly type: 'itinerary.resume' })
  | (TickAddressedInput & {
      readonly type: 'trace.begin';
      readonly traceId: string;
    })
  | (TickAddressedInput & {
      readonly type: 'trace.sample';
      readonly xNormalized: number;
      readonly yNormalized: number;
    })
  | (TickAddressedInput & { readonly type: 'trace.end' });

export type SemanticEvent =
  | {
      readonly tick: number;
      readonly type: 'input.rejected';
      readonly inputType: NormalizedInputSample['type'];
      readonly reason:
        | 'TICK_MISMATCH'
        | 'NON_FINITE_VALUE'
        | 'CAMERA_FROZEN'
        | 'TRACE_ALREADY_ACTIVE'
        | 'TRACE_NOT_ACTIVE'
        | 'TRACE_SAMPLE_OUT_OF_RANGE'
        | 'EMPTY_TRACE_ID';
    }
  | {
      readonly tick: number;
      readonly type: 'camera.intent.accepted';
      readonly inputType:
        'camera.orbit' | 'camera.dolly' | 'camera.roll' | 'camera.freeze' | 'camera.recenter';
    }
  | {
      readonly tick: number;
      readonly type: 'safety.clamped';
      readonly field: 'camera.radiusUnits' | 'camera.pitchRad';
      readonly attempted: number;
      readonly applied: number;
    }
  | {
      readonly tick: number;
      readonly type: 'kernel.delta.rejected';
      readonly reason: 'NEGATIVE_DELTA' | 'NON_FINITE_DELTA';
    };

export interface StepResult {
  readonly state: SimulationState;
  readonly events: readonly SemanticEvent[];
}
