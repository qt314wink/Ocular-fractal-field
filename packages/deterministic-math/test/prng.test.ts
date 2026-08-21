import { describe, expect, it } from 'vitest';

import { DeterministicPrng } from '../src/index.js';

describe('DeterministicPrng', () => {
  it('matches the frozen seed-424242 vector', () => {
    const prng = new DeterministicPrng(424242);

    expect([prng.nextUint32(), prng.nextUint32(), prng.nextUint32()]).toEqual([
      2800682729, 2685674292, 3549394179,
    ]);
  });

  it('normalizes unsigned seeds and produces half-open unit floats', () => {
    const signedSeed = new DeterministicPrng(-1);
    const unsignedSeed = new DeterministicPrng(0xffffffff);

    expect(signedSeed.nextUint32()).toBe(unsignedSeed.nextUint32());

    const value = signedSeed.nextFloat();
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
  });
});
