import type { OcularFractalFieldManifest } from './generated/manifest.js';
import {
  validateManifestStructure,
  type ContractDiagnostic,
  type ValidationResult,
} from './validate-manifest.js';

export type * from './generated/manifest.js';
export { validateManifestStructure, type ContractDiagnostic, type ValidationResult };

declare const validatedManifestBrand: unique symbol;
export type ValidatedManifest = OcularFractalFieldManifest & {
  readonly [validatedManifestBrand]: true;
};

export function validateManifest(input: unknown): ValidationResult<ValidatedManifest> {
  const result = validateManifestStructure(input);
  return result.ok ? { ok: true, value: result.value as ValidatedManifest } : result;
}
