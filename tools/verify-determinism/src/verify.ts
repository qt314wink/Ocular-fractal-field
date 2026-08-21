import { spawn } from 'node:child_process';
import { readFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdtemp } from 'node:fs/promises';

import { canonicalStringify, type StateHashReceipt } from '@off/replay';

type ReceiptLike = Readonly<Record<string, unknown>>;

export type ReceiptComparison =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly code: 'DETERMINISM_MISMATCH';
      readonly firstCanonical: string;
      readonly secondCanonical: string;
    };

export interface VerificationSummary {
  readonly run1: StateHashReceipt;
  readonly run2: StateHashReceipt;
  readonly frozen: StateHashReceipt;
  readonly runBytesEqual: true;
  readonly hashFieldsEqual: true;
  readonly frozenBytesEqual: true;
}

const HASH_FIELDS = ['manifestHash', 'finalStateHash', 'eventStreamHash', 'combinedHash'] as const;

export function compareReceipts(first: ReceiptLike, second: ReceiptLike): ReceiptComparison {
  const firstCanonical = canonicalStringify(first);
  const secondCanonical = canonicalStringify(second);
  return firstCanonical === secondCanonical
    ? { ok: true }
    : {
        ok: false,
        code: 'DETERMINISM_MISMATCH',
        firstCanonical,
        secondCanonical,
      };
}

export async function verifyDeterminism(): Promise<VerificationSummary> {
  const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
  const manifestPath = join(repositoryRoot, 'fixtures', 'manifests', 'minimal-valid.json');
  const replayPath = join(repositoryRoot, 'fixtures', 'replays', 'foundation-camera.json');
  const frozenPath = join(repositoryRoot, 'fixtures', 'state-hashes', 'foundation-camera.json');
  const workerPath = join(repositoryRoot, 'tools', 'verify-determinism', 'src', 'run-once.ts');
  const viteNodePath = createRequire(import.meta.url).resolve('vite-node/vite-node.mjs');

  const firstDirectory = await mkdtemp(join(tmpdir(), 'off-determinism-run-1-'));
  const secondDirectory = await mkdtemp(join(tmpdir(), 'off-determinism-run-2-'));
  const firstPath = join(firstDirectory, 'receipt.json');
  const secondPath = join(secondDirectory, 'receipt.json');

  try {
    await Promise.all([
      runWorker(
        viteNodePath,
        workerPath,
        manifestPath,
        replayPath,
        firstPath,
        firstDirectory,
        repositoryRoot,
      ),
      runWorker(
        viteNodePath,
        workerPath,
        manifestPath,
        replayPath,
        secondPath,
        secondDirectory,
        repositoryRoot,
      ),
    ]);

    const [firstBytes, secondBytes, frozenBytes] = await Promise.all([
      readFile(firstPath),
      readFile(secondPath),
      readFile(frozenPath),
    ]);
    if (!firstBytes.equals(secondBytes)) {
      throw new Error('DETERMINISM_MISMATCH: clean-run receipt bytes differ');
    }

    const run1 = parseReceipt(firstBytes);
    const run2 = parseReceipt(secondBytes);
    const frozen = parseReceipt(frozenBytes);
    for (const field of HASH_FIELDS) {
      if (run1[field] !== run2[field]) {
        throw new Error(`DETERMINISM_MISMATCH: ${field} differs between runs`);
      }
    }

    if (!firstBytes.equals(frozenBytes)) {
      throw new Error('FROZEN_FIXTURE_MISMATCH: clean receipt bytes differ');
    }

    return {
      run1,
      run2,
      frozen,
      runBytesEqual: true,
      hashFieldsEqual: true,
      frozenBytesEqual: true,
    };
  } finally {
    await Promise.all([
      rm(firstDirectory, { recursive: true, force: true }),
      rm(secondDirectory, { recursive: true, force: true }),
    ]);
  }
}

async function runWorker(
  viteNodePath: string,
  workerPath: string,
  manifestPath: string,
  replayPath: string,
  outputPath: string,
  workingDirectory: string,
  repositoryRoot: string,
): Promise<void> {
  await new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn(
      process.execPath,
      [
        viteNodePath,
        '--root',
        repositoryRoot,
        '--script',
        workerPath,
        manifestPath,
        replayPath,
        outputPath,
      ],
      { cwd: workingDirectory, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    let standardError = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk: string) => {
      standardError += chunk;
    });
    child.on('error', rejectPromise);
    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`Determinism worker exited ${code}: ${standardError.trim()}`));
      }
    });
  });
}

function parseReceipt(bytes: Uint8Array): StateHashReceipt {
  return JSON.parse(Buffer.from(bytes).toString('utf8')) as StateHashReceipt;
}

async function main(): Promise<void> {
  const summary = await verifyDeterminism();
  process.stdout.write(`${canonicalStringify(summary)}\n`);
}

const entryPath = process.argv[1];
if (entryPath !== undefined && pathToFileURL(resolve(entryPath)).href === import.meta.url) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
