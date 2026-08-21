import { describe, expect, it } from 'vitest';

import { canonicalStringify, sha256Hex } from '../src/index.js';

describe('canonicalStringify', () => {
  it('serializes object keys canonically while preserving array order', () => {
    expect(canonicalStringify({ z: 1, a: { y: 2, b: 3 }, list: [3, 1] })).toBe(
      '{"a":{"b":3,"y":2},"list":[3,1],"z":1}',
    );
  });

  it('serializes negative zero as zero', () => {
    expect(canonicalStringify({ value: -0 })).toBe('{"value":0}');
  });

  it.each([
    ['undefined', undefined],
    ['NaN', Number.NaN],
    ['infinity', Number.POSITIVE_INFINITY],
    ['function', () => 0],
    ['symbol', Symbol('unsupported')],
    ['bigint', BigInt(1)],
  ])('rejects unsupported %s values', (_label, value) => {
    expect(() => canonicalStringify(value)).toThrow();
  });

  it('rejects cyclic objects', () => {
    const value: { self?: unknown } = {};
    value.self = value;

    expect(() => canonicalStringify(value)).toThrow(/cyclic/i);
  });
});

describe('sha256Hex', () => {
  it('hashes UTF-8 bytes', () => {
    expect(sha256Hex('hello')).toBe(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    );
  });
});
