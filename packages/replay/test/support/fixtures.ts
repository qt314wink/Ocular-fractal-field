import { readFileSync } from 'node:fs';

import { validateManifest, type ValidatedManifest } from '@off/contracts';

import type { ReplayEnvelope } from '../../src/index.js';

function readJson(relativePath: string): unknown {
  return JSON.parse(readFileSync(new URL(relativePath, import.meta.url), 'utf8')) as unknown;
}

const manifestResult = validateManifest(
  readJson('../../../../fixtures/manifests/minimal-valid.json'),
);
if (!manifestResult.ok) {
  throw new Error(`Invalid test manifest: ${JSON.stringify(manifestResult.diagnostics)}`);
}

export const validManifest: ValidatedManifest = manifestResult.value;
export const foundationReplay = readJson(
  '../../../../fixtures/replays/foundation-camera.json',
) as ReplayEnvelope;
