import { expectTypeOf, it } from 'vitest';
import type { OcularFractalFieldManifest, ValidatedManifest } from '../src/index.js';

it('exports schema-generated and validated manifest types', () => {
  expectTypeOf<ValidatedManifest>().toMatchTypeOf<OcularFractalFieldManifest>();
});
