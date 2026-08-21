import { describe, expect, it } from 'vitest';
import valid from '../../../fixtures/manifests/minimal-valid.json';
import overlap from '../../../fixtures/manifests/overlapping-itinerary.json';
import { validateManifestStructure } from '../src/validate-manifest.js';

const copy = (): typeof valid => structuredClone(valid);

describe('validateManifestStructure', () => {
  it('accepts the minimal canonical manifest', () => {
    expect(validateManifestStructure(valid)).toEqual({ ok: true, value: valid });
  });

  it('rejects unknown properties structurally', () => {
    expect(validateManifestStructure({ ...valid, mystery: true }).ok).toBe(false);
  });

  it('rejects overlapping itinerary intervals', () => {
    const result = validateManifestStructure(overlap);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
        'ITINERARY_OVERLAP',
      );
    }
  });

  it('rejects duplicate element identifiers', () => {
    const input = copy();
    input.elements[1]!.elementId = input.elements[0]!.elementId;
    const result = validateManifestStructure(input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain('DUPLICATE_ID');
    }
  });

  it('rejects audio master gain above the hard ceiling', () => {
    const input = copy();
    input.audio.masterGainNormalized = 0.36;
    const result = validateManifestStructure(input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
        'AUDIO_MASTER_GAIN_UNSAFE',
      );
    }
  });

  it('rejects quality tiers whose particle counts decrease', () => {
    const input = copy();
    input.qualityTiers[1]!.particleCount = input.qualityTiers[0]!.particleCount - 1;
    const result = validateManifestStructure(input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
        'QUALITY_TIER_INVERSION',
      );
    }
  });

  it('rejects reaction participants that are not declared elements', () => {
    const input = copy();
    input.reactions[0]!.participantElementIds[1] = 'void';
    const result = validateManifestStructure(input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
        'REACTION_PARTICIPANT_UNKNOWN',
      );
    }
  });
});
