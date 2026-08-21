# Ocular Fractal Field — Gates 0–1 Foundation Verification

- Verification date: 2026-08-21
- Repository: `qt314wink/Ocular-fractal-field`
- Branch: `foundation/gates-0-1-determinism`
- Immutable genesis: `3f2e577c20444cc29c7bf3216823f3ba668e2d00`
- Implementation base: `a1cf74f40f15f6340e35c4cd46a49250ffae8aab`
- Runtime: Node.js `v22.23.2`, Corepack `0.34.6`, pnpm `10.15.0`

## Source evidence

Status: `RECONSTRUCTION_BYTES_VERIFIED_ORIGINAL_BYTES_UNVERIFIED`

Verified reconstruction receipt:

```text
1b85d574448714e897a4c5912ea383835291f9e992d9268bfb2ea36f4d2ecea1  Particle Sim Game_260813_205450 (Pages 1-58).pdf
```

The missing original's formerly expected SHA-256,
`030f2dcd17465e235d50d546c9798dc8702817acff40a9e447ff796364fa8fe3`,
is retained as superseded provenance only. It is not represented as a hash of
bytes possessed or verified by this repository. The August 21 reconstruction
addendum governs this distinction.

## Frozen authority and vectors

- Manifest ID: `ocular-foundation-minimal`
- Manifest semantic version: `1.0.0`
- Replay compatibility version: `1`
- Canonical simulation frequency: `60 Hz`
- Frozen seed: `424242`
- Frozen LCG uint32 vector: `2800682729, 2685674292, 3549394179`
- Generated manifest TypeScript SHA-256:
  `a563b2a3dbdba592730eb0e399cd313b2cdaac95bfed9ae0e7bd67f92703e216`
- Committed dependency lock SHA-256:
  `b9fa2a0b9fb23935902ec0f385230ccdb6fac3d3ab8bc1e5c6f19e8e240bf6c4`
- Frozen receipt fixture file SHA-256:
  `f8a0e03ef52adbf0a606ffdb0eaf6e024801b16fdb480117812c0fc8ff7f4868`
- Generation run 1 SHA-256:
  `a563b2a3dbdba592730eb0e399cd313b2cdaac95bfed9ae0e7bd67f92703e216`
- Generation run 2 SHA-256:
  `a563b2a3dbdba592730eb0e399cd313b2cdaac95bfed9ae0e7bd67f92703e216`
- Display refresh proof: `30 Hz → 60 ticks`, `60 Hz → 60 ticks`,
  `120 Hz → 60 ticks`

## Determinism receipt

Both independent Node processes and the frozen fixture produced:

| Receipt              | SHA-256                                                            |
| -------------------- | ------------------------------------------------------------------ |
| Manifest             | `b5b722e92ccd4dae237a86573d2579ef093356ad0cb8a650d511fa3dad40eb02` |
| Final state          | `25da20d99cfbf3e7557d1516c0428a27d7a49e7dc6556c0e15854903ccc8102a` |
| Ordered event stream | `46a356c89b4f3dc27571a82fa64ad821d7ae79d859541b70dee1bd6916ae447a` |
| Combined             | `0dd8e1f2aeee891af88ca4f3ab9f9419bd81a8de2284cc33ccda25fc2fe8367e` |

- Run 1 vs run 2 canonical receipt bytes: `IDENTICAL`
- Run hashes: `IDENTICAL`
- Clean-run receipt vs frozen fixture bytes: `IDENTICAL`
- Final canonical tick: `120`

## Verification commands

```text
pnpm install --frozen-lockfile
pnpm generate
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm verify:determinism
pnpm validate
```

The validation gate also rejects generated-type drift and scans canonical
packages for `Math.random`, wall-clock authority, DOM/browser globals,
Three.js, and Web Audio authority.

## Status

`GATES_0_1_FOUNDATION_IMPLEMENTATION: PASS`

This status covers only the authorized Gates 0–1 software foundation. It does
not assert that the missing original PDF bytes were recovered, and it makes no
claim for any later gate, renderer, audio system, browser adapter, or product
experience.
