import { describe, expect, it } from 'vitest';

import { compareReceipts, verifyDeterminism } from '../src/verify.js';

describe('compareReceipts', () => {
  it('fails when clean-run receipts differ', () => {
    const result = compareReceipts({ combinedHash: 'sha256:a' }, { combinedHash: 'sha256:b' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('DETERMINISM_MISMATCH');
    }
  });

  it('passes only exact canonical receipt equality', () => {
    expect(
      compareReceipts(
        { combinedHash: 'sha256:a', finalTick: 120 },
        { finalTick: 120, combinedHash: 'sha256:a' },
      ),
    ).toEqual({ ok: true });
  });

  it('matches two clean Node-process receipts to frozen canonical bytes', async () => {
    await expect(verifyDeterminism()).resolves.toMatchObject({
      runBytesEqual: true,
      hashFieldsEqual: true,
      frozenBytesEqual: true,
    });
  });
});
