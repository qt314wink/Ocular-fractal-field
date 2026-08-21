import { describe, expect, it } from 'vitest';

import { runReplay } from '../src/index.js';
import { foundationReplay, validManifest } from './support/fixtures.js';

describe('runReplay', () => {
  it('produces identical receipts for two clean replay runs', () => {
    const first = runReplay(validManifest, foundationReplay);
    const second = runReplay(validManifest, foundationReplay);

    expect(second).toEqual(first);
    expect(first.finalTick).toBe(foundationReplay.totalTicks);
    expect(first.combinedHash).toMatch(/^sha256:[a-f0-9]{64}$/u);
  });
});
