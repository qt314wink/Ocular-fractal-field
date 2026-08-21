import { describe, expect, it } from 'vitest';

describe('workspace authority', () => {
  it('executes TypeScript tests from the workspace root under Node 22', () => {
    expect(process.versions.node.split('.')[0]).toBe('22');
  });
});
