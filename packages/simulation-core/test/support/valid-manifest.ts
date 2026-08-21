import { readFileSync } from 'node:fs';

import { validateManifest, type ValidatedManifest } from '@off/contracts';

const fixtureUrl = new URL('../../../../fixtures/manifests/minimal-valid.json', import.meta.url);
const result = validateManifest(JSON.parse(readFileSync(fixtureUrl, 'utf8')) as unknown);

if (!result.ok) {
  throw new Error(`Invalid test manifest: ${JSON.stringify(result.diagnostics)}`);
}

export const validManifest: ValidatedManifest = result.value;
