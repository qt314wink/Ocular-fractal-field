/*
 * GENERATED FILE - DO NOT EDIT.
 * Source: packages/contracts/schemas/manifest.schema.json
 * Source SHA-256: 3dd898d8a70f86a31e47b9fd62e6ec102cd772622b216de99b7876d32c721867
 */

export interface OcularFractalFieldManifest {
  manifestId: string;
  semanticVersion: string;
  replayCompatibilityVersion: number;
  engine: {
    engineVersion: string;
    simulationHz: number;
    maxAccumulatorSec: number;
  };
  featureFallbacks: {
    reducedMotion: 'STABLE_VIEW';
    audioUnavailable: 'MUTED';
    gyroUnavailable: 'MANUAL_ONLY';
  };
  /**
   * @minItems 3
   * @maxItems 3
   */
  qualityTiers: [QualityTier, QualityTier, QualityTier];
  itinerary: {
    /**
     * @minItems 1
     */
    segments: [ItineraryKeyframe, ...ItineraryKeyframe[]];
  };
  audio: {
    sampleRateHz: number;
    masterGainNormalized: number;
  };
  gameRules: {
    traceMatchToleranceRad: number;
    cameraRadiusMinUnits: number;
    cameraRadiusMaxUnits: number;
    initialTurbulenceNormalized: number;
    turbulenceDecayPerSec: number;
  };
  accessibility: {
    reducedMotionDefault: boolean;
    colorIndependentCues: boolean;
  };
  /**
   * @minItems 1
   */
  elements: [ElementDefinition, ...ElementDefinition[]];
  reactions: ReactionDefinition[];
}
/**
 * This interface was referenced by `OcularFractalFieldManifest`'s JSON-Schema
 * via the `definition` "qualityTier".
 */
export interface QualityTier {
  tierId: 'LOW' | 'MEDIUM' | 'HIGH';
  particleCount: number;
  maxGpuMemoryBudgetBytes: number;
}
/**
 * This interface was referenced by `OcularFractalFieldManifest`'s JSON-Schema
 * via the `definition` "itineraryKeyframe".
 */
export interface ItineraryKeyframe {
  segmentId: string;
  startTick: number;
  endTick: number;
  durationMs: number;
  pose: CameraPose;
  easing: CubicBezierEasing;
}
/**
 * This interface was referenced by `OcularFractalFieldManifest`'s JSON-Schema
 * via the `definition` "cameraPose".
 */
export interface CameraPose {
  radiusUnits: number;
  pitchRad: number;
  yawRad: number;
  rollRad: number;
  fovDeg: number;
  gazeMode: 'CENTER' | 'OUTWARD' | 'TARGET' | 'TANGENT';
}
/**
 * This interface was referenced by `OcularFractalFieldManifest`'s JSON-Schema
 * via the `definition` "cubicBezierEasing".
 */
export interface CubicBezierEasing {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
/**
 * This interface was referenced by `OcularFractalFieldManifest`'s JSON-Schema
 * via the `definition` "element".
 */
export interface ElementDefinition {
  elementId: string;
  displayName: string;
}
/**
 * This interface was referenced by `OcularFractalFieldManifest`'s JSON-Schema
 * via the `definition` "reaction".
 */
export interface ReactionDefinition {
  reactionId: string;
  /**
   * @minItems 2
   * @maxItems 2
   */
  participantElementIds: [string, string];
  effectId: string;
}
