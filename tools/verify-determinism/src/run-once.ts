import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { validateManifest } from '@off/contracts';
import { canonicalStringify, runReplay, type ReplayEnvelope } from '@off/replay';

const [manifestPath, replayPath, outputPath] = process.argv.slice(-3);
if (manifestPath === undefined || replayPath === undefined || outputPath === undefined) {
  throw new Error('Usage: run-once.ts <manifest.json> <replay.json> <receipt.json>');
}

const manifestResult = validateManifest(
  JSON.parse(await readFile(resolve(manifestPath), 'utf8')) as unknown,
);
if (!manifestResult.ok) {
  throw new Error(`Manifest validation failed: ${JSON.stringify(manifestResult.diagnostics)}`);
}

const replay = JSON.parse(await readFile(resolve(replayPath), 'utf8')) as ReplayEnvelope;
const receipt = runReplay(manifestResult.value, replay);
await writeFile(resolve(outputPath), `${canonicalStringify(receipt)}\n`, 'utf8');
