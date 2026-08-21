import Ajv2020, { type ErrorObject } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import manifestSchema from '../schemas/manifest.schema.json';

export type ContractDiagnostic = Readonly<{
  code: string;
  path: string;
  message: string;
}>;

export type ValidationResult<T> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; diagnostics: readonly ContractDiagnostic[] }>;

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validateStructure = ajv.compile(manifestSchema);

const asRecord = (value: unknown): Record<string, unknown> => value as Record<string, unknown>;
const asRecords = (value: unknown): Record<string, unknown>[] => value as Record<string, unknown>[];

const structuralDiagnostics = (errors: readonly ErrorObject[]): ContractDiagnostic[] =>
  errors.map((error) => ({
    code: `SCHEMA_${error.keyword.toUpperCase().replaceAll('-', '_')}`,
    path: error.instancePath || '/',
    message: error.message ?? 'Schema validation failed.',
  }));

const duplicateIdDiagnostics = (
  records: readonly Record<string, unknown>[],
  key: string,
  path: string,
): ContractDiagnostic[] => {
  const seen = new Set<string>();
  const diagnostics: ContractDiagnostic[] = [];
  records.forEach((record, index) => {
    const id = record[key] as string;
    if (seen.has(id)) {
      diagnostics.push({
        code: 'DUPLICATE_ID',
        path: `${path}/${index}/${key}`,
        message: `Identifier ${id} is duplicated.`,
      });
    }
    seen.add(id);
  });
  return diagnostics;
};

const semanticDiagnostics = (input: unknown): ContractDiagnostic[] => {
  const root = asRecord(input);
  const elements = asRecords(root.elements);
  const reactions = asRecords(root.reactions);
  const itinerary = asRecord(root.itinerary);
  const segments = asRecords(itinerary.segments);
  const qualityTiers = asRecords(root.qualityTiers);
  const diagnostics = [
    ...duplicateIdDiagnostics(elements, 'elementId', '/elements'),
    ...duplicateIdDiagnostics(reactions, 'reactionId', '/reactions'),
    ...duplicateIdDiagnostics(segments, 'segmentId', '/itinerary/segments'),
  ];

  segments.forEach((segment, index) => {
    const startTick = segment.startTick as number;
    const endTick = segment.endTick as number;
    if (endTick <= startTick) {
      diagnostics.push({
        code: 'ITINERARY_NONMONOTONIC',
        path: `/itinerary/segments/${index}`,
        message: 'Itinerary endTick must be greater than startTick.',
      });
    }
    const previous = segments[index - 1];
    if (previous) {
      const previousStartTick = previous.startTick as number;
      const previousEndTick = previous.endTick as number;
      if (startTick < previousStartTick) {
        diagnostics.push({
          code: 'ITINERARY_NONMONOTONIC',
          path: `/itinerary/segments/${index}/startTick`,
          message: 'Itinerary startTick values must be monotonic.',
        });
      }
      if (startTick < previousEndTick) {
        diagnostics.push({
          code: 'ITINERARY_OVERLAP',
          path: `/itinerary/segments/${index}/startTick`,
          message: 'Itinerary segments must not overlap.',
        });
      }
    }
  });

  qualityTiers.forEach((tier, index) => {
    const previous = qualityTiers[index - 1];
    if (previous && (tier.particleCount as number) < (previous.particleCount as number)) {
      diagnostics.push({
        code: 'QUALITY_TIER_INVERSION',
        path: `/qualityTiers/${index}/particleCount`,
        message: 'A higher quality tier cannot have fewer particles than the preceding tier.',
      });
    }
  });

  const elementIds = new Set(elements.map((element) => element.elementId as string));
  reactions.forEach((reaction, reactionIndex) => {
    (reaction.participantElementIds as string[]).forEach((participant, participantIndex) => {
      if (!elementIds.has(participant)) {
        diagnostics.push({
          code: 'REACTION_PARTICIPANT_UNKNOWN',
          path: `/reactions/${reactionIndex}/participantElementIds/${participantIndex}`,
          message: `Reaction participant ${participant} is not a declared element.`,
        });
      }
    });
  });

  const audio = asRecord(root.audio);
  if ((audio.masterGainNormalized as number) > 0.35) {
    diagnostics.push({
      code: 'AUDIO_MASTER_GAIN_UNSAFE',
      path: '/audio/masterGainNormalized',
      message: 'Audio master gain cannot exceed 0.35.',
    });
  }

  return diagnostics;
};

export function validateManifestStructure(input: unknown): ValidationResult<unknown> {
  if (!validateStructure(input)) {
    return { ok: false, diagnostics: structuralDiagnostics(validateStructure.errors ?? []) };
  }
  const diagnostics = semanticDiagnostics(input);
  return diagnostics.length === 0 ? { ok: true, value: input } : { ok: false, diagnostics };
}
