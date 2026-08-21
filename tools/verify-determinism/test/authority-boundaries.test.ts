import { globSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const repositoryRoot = new URL('../../../', import.meta.url);
const canonicalSources = globSync(
  'packages/{contracts,deterministic-math,simulation-core,replay}/src/**/*.ts',
  { cwd: repositoryRoot },
);

const forbiddenAuthority = [
  /Math\.random/u,
  /\bDate\s*[.(]/u,
  /\bperformance\s*\./u,
  /\b(?:document|window)\s*[.[]/u,
  /\bAudioContext\b/u,
  /from\s+['"]three(?:\/|['"])/u,
];

describe('canonical package authority boundaries', () => {
  it('contains no randomness, wall-clock, DOM, Three.js, or audio authority', () => {
    const violations = canonicalSources.flatMap((relativePath) => {
      const source = readFileSync(new URL(relativePath, repositoryRoot), 'utf8');
      return forbiddenAuthority
        .filter((pattern) => pattern.test(source))
        .map((pattern) => `${relativePath}: ${pattern.source}`);
    });

    expect(canonicalSources.length).toBeGreaterThan(0);
    expect(violations).toEqual([]);
  });
});
