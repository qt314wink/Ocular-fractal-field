# Ocular Fractal Field Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Gates 0-1: repository authority, authoritative manifests, generated types, deterministic math, a fixed-step simulation kernel, replay envelopes, hashing, and a verified two-run determinism proof.

**Architecture:** A pnpm TypeScript workspace separates contracts, deterministic mathematics, simulation, and replay into DOM-free packages. JSON Schema is authoritative; generated types and semantic validators feed a fixed-step kernel whose state and event receipts are hashable and replayable.

**Tech Stack:** Node.js `>=22.13.0 <23`, pnpm 10, TypeScript 5 strict mode, AJV 8, `ajv-formats`, `json-schema-to-typescript`, Vitest, ESLint, Prettier, GitHub Actions.

## Global Constraints

- Use JSON Schema Draft 2020-12 with stable `$id` values and `additionalProperties: false`.
- Generated TypeScript types are authoritative; do not hand-maintain duplicate manifest interfaces.
- Canonical packages import no DOM, Three.js, Web Audio, or browser-event types.
- Canonical state uses fixed simulation ticks; display refresh does not advance state directly.
- Canonical randomness uses the frozen unsigned 32-bit LCG only.
- Seed `424242` must produce first output `2800682729`.
- Every public numeric field includes a unit suffix unless dimensionless meaning is explicit.
- Replay input is tick-addressed, normalized, bounded, and serializable.
- Two clean runs with the same manifest and inputs must produce identical state and event hashes.
- Do not add React, R3F, GSAP, Framer Motion, a state-machine library, or a physics engine.
- Commit only after the focused tests for the task pass.

---

## File Map

```text
package.json                         workspace commands and runtime constraints
pnpm-workspace.yaml                 workspace membership
tsconfig.base.json                  strict compiler authority
eslint.config.mjs                   lint boundaries
.prettierrc.json                    deterministic formatting
.github/workflows/verify.yml        pull-request verification
docs/architecture/ADR-0001.md       source and authority decision
docs/architecture/units.md          canonical units glossary
docs/verification/foundation.md     Gate 0-1 receipt
evidence/source-pdf.sha256          frozen source evidence hash
packages/contracts/                 schemas, generated types, AJV and semantic validation
packages/deterministic-math/        PRNG, cubic Bézier, interpolation helpers
packages/simulation-core/           fixed-step state, input application, events
packages/replay/                    canonical JSON, SHA-256 receipts, replay runner
fixtures/manifests/                 valid and invalid manifest fixtures
fixtures/replays/                   frozen replay fixtures
fixtures/state-hashes/              expected deterministic receipts
tools/generate-types/               schema-to-TypeScript generation
tools/verify-determinism/           two-clean-run comparison
```

### Task 1: Establish workspace authority and verification commands

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `.prettierrc.json`
- Create: `eslint.config.mjs`
- Create: `docs/architecture/ADR-0001.md`
- Create: `docs/architecture/units.md`
- Create: `evidence/source-pdf.sha256`
- Test: `packages/contracts/test/workspace-smoke.test.ts`

**Interfaces:**
- Consumes: approved design specification and frozen PDF SHA-256.
- Produces: workspace commands `format:check`, `lint`, `typecheck`, `test`, `generate`, and `validate`; shared strict compiler configuration.

- [ ] **Step 1: Create the failing workspace smoke test**

```ts
// packages/contracts/test/workspace-smoke.test.ts
import { describe, expect, it } from 'vitest';

describe('workspace authority', () => {
  it('executes TypeScript tests from the workspace root', () => {
    expect(process.versions.node.split('.')[0]).toBe('22');
  });
});
```

- [ ] **Step 2: Add root configuration and run the test to verify the unconfigured workspace fails**

```json
{
  "name": "ocular-fractal-field",
  "private": true,
  "packageManager": "pnpm@10.15.0",
  "engines": { "node": ">=22.13.0 <23" },
  "scripts": {
    "generate": "pnpm --filter @off/contracts generate",
    "format:check": "prettier --check .",
    "lint": "eslint .",
    "typecheck": "pnpm -r typecheck",
    "test": "vitest run",
    "validate": "pnpm generate && pnpm format:check && pnpm lint && pnpm typecheck && pnpm test"
  },
  "devDependencies": {
    "@eslint/js": "^9.0.0",
    "@types/node": "^22.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0",
    "typescript-eslint": "^8.0.0",
    "vitest": "^3.0.0"
  }
}
```

Run: `corepack enable && pnpm install && pnpm test packages/contracts/test/workspace-smoke.test.ts`  
Expected: FAIL until workspace files and package metadata exist.

- [ ] **Step 3: Add strict shared configuration**

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "useUnknownInCatchVariables": true,
    "verbatimModuleSyntax": true,
    "declaration": true,
    "skipLibCheck": true
  }
}
```

Set `pnpm-workspace.yaml` packages to `packages/*`, `tools/*`, and `apps/*`. Configure flat ESLint for TypeScript and prohibit `Math.random`, `Date.now`, DOM globals, and imports from `three` inside `contracts`, `deterministic-math`, `simulation-core`, and `replay`.

- [ ] **Step 4: Add authority documentation and verify the workspace**

`ADR-0001.md` must state that modular TypeScript is authoritative, standalone HTML is generated, the PDF is evidence rather than implementation authority, and domain packages are environment-free. `units.md` must define seconds, milliseconds, ticks, radians, degrees for display only, normalized coordinates, world units, hertz, bytes, and normalized `[0,1]` values. Store this exact line in `evidence/source-pdf.sha256`:

```text
030f2dcd17465e235d50d546c9798dc8702817acff40a9e447ff796364fa8fe3  Particle Sim Game_260813_205450.pdf
```

Run: `pnpm test packages/contracts/test/workspace-smoke.test.ts && pnpm typecheck`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-workspace.yaml tsconfig.base.json .prettierrc.json eslint.config.mjs docs/architecture evidence packages/contracts/test/workspace-smoke.test.ts
git commit -m "chore: establish ocular field workspace authority"
```

### Task 2: Create the authoritative manifest schema and semantic validator

**Files:**
- Create: `packages/contracts/package.json`
- Create: `packages/contracts/tsconfig.json`
- Create: `packages/contracts/schemas/manifest.schema.json`
- Create: `packages/contracts/src/validate-manifest.ts`
- Create: `packages/contracts/src/index.ts`
- Create: `fixtures/manifests/minimal-valid.json`
- Create: `fixtures/manifests/overlapping-itinerary.json`
- Test: `packages/contracts/test/manifest-validation.test.ts`

**Interfaces:**
- Consumes: JSON Schema Draft 2020-12 and units glossary.
- Produces: `validateManifestStructure(input: unknown): ValidationResult<unknown>` plus structural and semantic diagnostic codes. Task 3 adds the generated branded return type.

- [ ] **Step 1: Write failing structural and semantic validation tests**

```ts
import { describe, expect, it } from 'vitest';
import valid from '../../../fixtures/manifests/minimal-valid.json';
import overlap from '../../../fixtures/manifests/overlapping-itinerary.json';
import { validateManifestStructure } from '../src/validate-manifest.js';

describe('validateManifest', () => {
  it('accepts the minimal canonical manifest', () => {
    expect(validateManifestStructure(valid).ok).toBe(true);
  });

  it('rejects unknown properties', () => {
    expect(validateManifestStructure({ ...valid, mystery: true }).ok).toBe(false);
  });

  it('rejects overlapping itinerary intervals', () => {
    const result = validateManifestStructure(overlap);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.diagnostics.map((d) => d.code)).toContain('ITINERARY_OVERLAP');
  });
});
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `pnpm test packages/contracts/test/manifest-validation.test.ts`  
Expected: FAIL because schema and validator do not exist.

- [ ] **Step 3: Implement the schema and validator**

The schema must require root identity/version fields, engine, feature fallbacks, three quality tiers, itinerary, audio, game rules, accessibility, elements, and reactions. Define `$defs` for camera pose, cubic-Bézier easing, quality tier, element, and reaction. Use explicit fields including `simulationHz`, `sampleRateHz`, `durationMs`, `radiusUnits`, `pitchRad`, `yawRad`, `traceMatchToleranceRad`, and `maxGpuMemoryBudgetBytes`.

```ts
export type ContractDiagnostic = {
  code: string;
  path: string;
  message: string;
};

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; diagnostics: readonly ContractDiagnostic[] };

export function validateManifestStructure(input: unknown): ValidationResult<unknown> {
  if (!validateStructure(input)) return { ok: false, diagnostics: mapAjvErrors() };
  const diagnostics = validateSemanticRules(input);
  return diagnostics.length === 0
    ? { ok: true, value: input }
    : { ok: false, diagnostics };
}
```

Semantic validation must reject duplicate IDs, nonmonotonic or overlapping itinerary intervals, invalid reaction participants, a lower quality tier with more particles than a higher tier, and audio master gain above `0.35`.

- [ ] **Step 4: Run validation tests**

Run: `pnpm test packages/contracts/test/manifest-validation.test.ts`  
Expected: PASS with three tests.

- [ ] **Step 5: Commit**

```bash
git add packages/contracts fixtures/manifests
git commit -m "feat: define authoritative simulation manifest"
```

### Task 3: Generate and guard canonical TypeScript types

**Files:**
- Create: `tools/generate-types/package.json`
- Create: `tools/generate-types/src/generate.ts`
- Create: `packages/contracts/src/generated/manifest.ts`
- Modify: `packages/contracts/package.json`
- Modify: `packages/contracts/src/index.ts`
- Test: `packages/contracts/test/generated-types.test.ts`

**Interfaces:**
- Consumes: `manifest.schema.json`.
- Produces: generated `OcularFractalFieldManifest`, `ItineraryKeyframe`, `ElementDefinition`, and `ReactionDefinition`; `ValidatedManifest` branded alias; typed `validateManifest(input: unknown): ValidationResult<ValidatedManifest>` wrapper.

- [ ] **Step 1: Write a failing generated-type surface test**

```ts
import { expectTypeOf, it } from 'vitest';
import type { OcularFractalFieldManifest, ValidatedManifest } from '../src/index.js';

it('exports schema-generated and validated manifest types', () => {
  expectTypeOf<ValidatedManifest>().toMatchTypeOf<OcularFractalFieldManifest>();
});
```

- [ ] **Step 2: Run the test and verify missing exports**

Run: `pnpm test packages/contracts/test/generated-types.test.ts`  
Expected: FAIL with missing generated type exports.

- [ ] **Step 3: Implement deterministic type generation**

Use `json-schema-to-typescript` with banner text stating the file is generated and must not be edited. The generator writes only when bytes differ and formats output through Prettier. Define:

```ts
declare const validatedManifestBrand: unique symbol;
export type ValidatedManifest = OcularFractalFieldManifest & {
  readonly [validatedManifestBrand]: true;
};
```

The validator is the only production constructor of this branded value.

Wrap the Task 2 structural validator without duplicating validation logic:

```ts
export function validateManifest(input: unknown): ValidationResult<ValidatedManifest> {
  const result = validateManifestStructure(input);
  return result.ok
    ? { ok: true, value: result.value as ValidatedManifest }
    : result;
}
```

- [ ] **Step 4: Generate twice and prove zero drift**

Run: `pnpm generate && cp packages/contracts/src/generated/manifest.ts /tmp/manifest-first.ts && pnpm generate && cmp /tmp/manifest-first.ts packages/contracts/src/generated/manifest.ts && pnpm test packages/contracts/test/generated-types.test.ts`  
Expected: `cmp` exits 0 and the test passes.

- [ ] **Step 5: Commit**

```bash
git add tools/generate-types packages/contracts
git commit -m "build: generate manifest types from schema"
```

### Task 4: Implement frozen deterministic mathematics

**Files:**
- Create: `packages/deterministic-math/package.json`
- Create: `packages/deterministic-math/tsconfig.json`
- Create: `packages/deterministic-math/src/prng.ts`
- Create: `packages/deterministic-math/src/cubic-bezier.ts`
- Create: `packages/deterministic-math/src/scalars.ts`
- Create: `packages/deterministic-math/src/index.ts`
- Test: `packages/deterministic-math/test/prng.test.ts`
- Test: `packages/deterministic-math/test/cubic-bezier.test.ts`

**Interfaces:**
- Produces: `DeterministicPrng`, `CubicBezier.solveY(x)`, `clamp`, `lerp`, `wrapRadians`, and `smoothstep`.

- [ ] **Step 1: Write frozen PRNG and easing tests**

```ts
import { describe, expect, it } from 'vitest';
import { CubicBezier, DeterministicPrng } from '../src/index.js';

describe('DeterministicPrng', () => {
  it('matches the frozen seed-424242 vector', () => {
    const prng = new DeterministicPrng(424242);
    expect([prng.nextUint32(), prng.nextUint32(), prng.nextUint32()]).toEqual([
      2800682729, 2685674292, 3549394179,
    ]);
  });
});

describe('CubicBezier', () => {
  it('solves endpoints and remains monotonic', () => {
    const curve = new CubicBezier([0.42, 0], [0.58, 1]);
    expect(curve.solveY(0)).toBe(0);
    expect(curve.solveY(1)).toBe(1);
    const values = Array.from({ length: 101 }, (_, i) => curve.solveY(i / 100));
    expect(values.every((v, i) => i === 0 || v >= values[i - 1]!)).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm test packages/deterministic-math/test`  
Expected: FAIL because exports do not exist.

- [ ] **Step 3: Implement the minimal deterministic math package**

`nextUint32()` must use `(Math.imul(state, 1664525) + 1013904223) >>> 0`. `nextFloat()` divides by `4294967296`. Bézier solving performs bounded Newton-Raphson, clamps the parameter to `[0,1]`, and falls back to 16 bisection iterations when the derivative is below `1e-7` or Newton exits the interval.

- [ ] **Step 4: Run focused and property tests**

Run: `pnpm test packages/deterministic-math/test && pnpm --filter @off/deterministic-math typecheck`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/deterministic-math
git commit -m "feat: add frozen deterministic math primitives"
```

### Task 5: Define canonical input, state, event, and snapshot contracts

**Files:**
- Create: `packages/simulation-core/package.json`
- Create: `packages/simulation-core/tsconfig.json`
- Create: `packages/simulation-core/src/types.ts`
- Create: `packages/simulation-core/src/apply-input.ts`
- Create: `packages/simulation-core/src/step-state.ts`
- Create: `packages/simulation-core/src/index.ts`
- Test: `packages/simulation-core/test/step-state.test.ts`

**Interfaces:**
- Consumes: `ValidatedManifest`, deterministic scalar helpers.
- Produces: `NormalizedInputSample`, `SimulationState`, `SimulationSnapshot`, `SemanticEvent`, `createInitialState(manifest)`, and `stepState(state, inputs, stepSec, manifest)`.

- [ ] **Step 1: Write failing state-transition tests**

```ts
import { describe, expect, it } from 'vitest';
import { createInitialState, stepState } from '../src/index.js';
import { validManifest } from './support/valid-manifest.js';

describe('stepState', () => {
  it('applies tick-addressed dolly input and bounded turbulence decay', () => {
    const state = createInitialState(validManifest);
    const result = stepState(
      state,
      [{ tick: 0, type: 'camera.dolly', logarithmicDelta: -0.1 }],
      1 / 60,
      validManifest,
    );
    expect(result.state.tick).toBe(1);
    expect(result.state.camera.radiusUnits).toBeLessThan(130);
    expect(result.state.field.turbulenceNormalized).toBeGreaterThanOrEqual(0);
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm test packages/simulation-core/test/step-state.test.ts`  
Expected: FAIL with missing state functions.

- [ ] **Step 3: Implement immutable state transitions**

Define input as a discriminated union for `camera.orbit`, `camera.dolly`, `camera.roll`, `camera.freeze`, `camera.recenter`, `itinerary.resume`, `trace.begin`, `trace.sample`, and `trace.end`. Define semantic events initially for input rejection, camera intent acceptance, and safety clamps. `stepState` returns `{ state, events }` without mutating its input.

- [ ] **Step 4: Run tests and typecheck domain boundaries**

Run: `pnpm test packages/simulation-core/test && pnpm --filter @off/simulation-core typecheck && pnpm lint`  
Expected: PASS with no DOM or Three.js import.

- [ ] **Step 5: Commit**

```bash
git add packages/simulation-core
git commit -m "feat: define canonical simulation state transitions"
```

### Task 6: Implement the real-delta fixed-step kernel

**Files:**
- Create: `packages/simulation-core/src/simulation-kernel.ts`
- Modify: `packages/simulation-core/src/index.ts`
- Test: `packages/simulation-core/test/simulation-kernel.test.ts`

**Interfaces:**
- Consumes: `stepState`, tick-addressed `NormalizedInputSample[]`.
- Produces: `SimulationKernel.advance(realDeltaSec, inputs): AdvanceResult`, including immutable previous/current snapshots, interpolation alpha, and emitted events.

- [ ] **Step 1: Write failing refresh-rate equivalence tests**

```ts
it.each([30, 60, 120])('advances one canonical second at %i display Hz', (displayHz) => {
  const kernel = createKernel();
  for (let frame = 0; frame < displayHz; frame += 1) kernel.advance(1 / displayHz, []);
  expect(kernel.currentState.tick).toBe(60);
});

it('clamps a stalled frame without entering an unbounded catch-up loop', () => {
  const kernel = createKernel();
  const result = kernel.advance(10, []);
  expect(result.stepsExecuted).toBeLessThanOrEqual(15);
  expect(result.alpha).toBeGreaterThanOrEqual(0);
  expect(result.alpha).toBeLessThan(1);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm test packages/simulation-core/test/simulation-kernel.test.ts`  
Expected: FAIL because `SimulationKernel` is missing.

- [ ] **Step 3: Implement the accumulator**

Use `h = 1 / simulationHz`, `maxAccumulatorSec = 0.25`, and `maxStepsPerAdvance = ceil(maxAccumulatorSec / h)`. Queue inputs by tick without filtering the entire queue on every step. Reject negative or nonfinite real deltas with a diagnostic event. Return `alpha = accumulator / h` and do not interpolate integer score or tick values.

- [ ] **Step 4: Verify refresh-rate equivalence**

Run: `pnpm test packages/simulation-core/test/simulation-kernel.test.ts`  
Expected: PASS at 30, 60, and 120 display Hz.

- [ ] **Step 5: Commit**

```bash
git add packages/simulation-core
git commit -m "feat: add fixed-step simulation accumulator"
```

### Task 7: Add canonical replay serialization and state hashing

**Files:**
- Create: `packages/replay/package.json`
- Create: `packages/replay/tsconfig.json`
- Create: `packages/replay/src/canonical-json.ts`
- Create: `packages/replay/src/hash.ts`
- Create: `packages/replay/src/replay-runner.ts`
- Create: `packages/replay/src/index.ts`
- Create: `fixtures/replays/foundation-camera.json`
- Test: `packages/replay/test/canonical-json.test.ts`
- Test: `packages/replay/test/replay-runner.test.ts`

**Interfaces:**
- Consumes: `ValidatedManifest`, `NormalizedInputSample`, `SimulationKernel`.
- Produces: `canonicalStringify(value)`, `sha256Hex(bytes)`, `runReplay(manifest, replay)`, and `StateHashReceipt`.

- [ ] **Step 1: Write failing canonical-order and replay tests**

```ts
it('serializes object keys canonically', () => {
  expect(canonicalStringify({ z: 1, a: { y: 2, b: 3 } })).toBe('{"a":{"b":3,"y":2},"z":1}');
});

it('produces identical receipts for two clean replay runs', async () => {
  const first = await runReplay(validManifest, foundationReplay);
  const second = await runReplay(validManifest, foundationReplay);
  expect(second).toEqual(first);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm test packages/replay/test`  
Expected: FAIL because replay functions do not exist.

- [ ] **Step 3: Implement canonical JSON, SHA-256, and replay execution**

Canonical JSON recursively sorts object keys, preserves array order, rejects `undefined`, nonfinite numbers, functions, symbols, bigint, and cyclic references, and serializes `-0` as `0`. Hash UTF-8 bytes with `node:crypto` in the Node adapter. `runReplay` advances exact ticks, collects events in order, and returns manifest, final-state, event-stream, and combined hashes.

- [ ] **Step 4: Run replay tests twice from clean processes**

Run: `pnpm test packages/replay/test && pnpm test packages/replay/test`  
Expected: both invocations PASS with identical frozen receipt output.

- [ ] **Step 5: Commit**

```bash
git add packages/replay fixtures/replays
git commit -m "feat: add canonical replay and state receipts"
```

### Task 8: Create the two-run verifier, CI gate, and foundation receipt

**Files:**
- Create: `tools/verify-determinism/package.json`
- Create: `tools/verify-determinism/src/verify.ts`
- Create: `.github/workflows/verify.yml`
- Create: `fixtures/state-hashes/foundation-camera.json`
- Create: `docs/verification/foundation.md`
- Modify: `package.json`
- Test: `tools/verify-determinism/test/verify.test.ts`

**Interfaces:**
- Consumes: manifest fixture, replay fixture, `runReplay`.
- Produces: `pnpm verify:determinism`, nonzero exit on mismatch, frozen JSON receipt, Gate 0-1 verification document.

- [ ] **Step 1: Write a failing verifier test**

```ts
it('fails when clean-run receipts differ', async () => {
  const result = await compareReceipts(
    { combinedHash: 'sha256:a' },
    { combinedHash: 'sha256:b' },
  );
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.code).toBe('DETERMINISM_MISMATCH');
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm test tools/verify-determinism/test/verify.test.ts`  
Expected: FAIL because the comparison and CLI do not exist.

- [ ] **Step 3: Implement the verifier and CI workflow**

The verifier must launch two separate Node processes, write their receipts into distinct temporary directories, compare exact canonical JSON, compare against the frozen fixture, and print the manifest, state, event, and combined hashes. Add root command:

```json
"verify:determinism": "pnpm --filter @off/verify-determinism start",
"validate": "pnpm generate && pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm verify:determinism"
```

CI uses Node 22, Corepack, `pnpm install --frozen-lockfile`, and `pnpm validate`.

- [ ] **Step 4: Run the complete Gate 0-1 verification and write the receipt**

Run: `pnpm validate`  
Expected: PASS; generated files have no drift; two subprocess receipts match the frozen fixture.

`docs/verification/foundation.md` must record the source PDF hash, manifest ID/version, replay compatibility version, simulation frequency, PRNG vector, commands, final hashes, and explicit Gate 0-1 pass status.

- [ ] **Step 5: Commit**

```bash
git add tools/verify-determinism .github/workflows/verify.yml fixtures/state-hashes docs/verification package.json pnpm-lock.yaml
git commit -m "test: prove deterministic foundation across clean runs"
```

## Foundation Exit Checklist

- [ ] Root workspace validates from a frozen lockfile.
- [ ] The source PDF SHA-256 and architecture authority are recorded.
- [ ] Valid manifest fixtures pass structural and semantic validation.
- [ ] Unknown fields, duplicate IDs, unsafe audio, tier inversions, and itinerary overlap fail with stable diagnostics.
- [ ] Generated TypeScript output has zero drift across two generations.
- [ ] Seed `424242` produces the frozen LCG vector beginning with `2800682729`.
- [ ] Bézier endpoints, monotonicity, clamping, and bisection fallback pass.
- [ ] Thirty-, sixty-, and 120-Hz display loops advance the same 60 canonical ticks per second.
- [ ] Replay canonicalization rejects unsupported values.
- [ ] Two clean subprocess runs produce identical state, event, and combined hashes.
- [ ] Domain packages have no DOM, Three.js, Web Audio, `Math.random`, or wall-clock authority.
- [ ] Gate 0-1 verification receipt is complete and reviewed.
