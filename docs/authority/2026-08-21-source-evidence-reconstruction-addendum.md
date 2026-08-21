# Ocular Fractal Field Source-Evidence Reconstruction Addendum

**Date:** 2026-08-21
**Status:** `RECONSTRUCTION_BYTES_VERIFIED_ORIGINAL_BYTES_UNVERIFIED`
**Scope:** Source-evidence provenance reconciliation before Foundation Task 1

## Authority and scope

The August 14 design and foundation documents remain frozen historical authorities and are not rewritten by this addendum:

- `2026-08-14-ocular-fractal-field-design.md`
- `2026-08-14-ocular-fractal-field-foundation.md`

This addendum supersedes only their source-byte assumption concerning `Particle Sim Game_260813_205450.pdf`. It does not change their implementation architecture, package boundaries, foundation tasks, or acceptance requirements.

Foundation implementation authority continues to come from the approved Markdown design and foundation documents. The reconstructed PDF remains supporting source evidence rather than implementation authority.

## Reconstructed evidence record

The missing original PDF has not been recovered. The available reconstruction is not byte-identical to that missing original.

The raw bytes of the reconstruction have been independently hashed and explicitly approved by the decision owner as reconstruction evidence:

| Field | Verified value |
| --- | --- |
| Provided reconstruction | `Particle Sim Game_260813_205450 (Pages 1-58).pdf` |
| Byte length | `11869851` |
| Page count | `58` |
| Reconstruction SHA-256 | `1b85d574448714e897a4c5912ea383835291f9e992d9268bfb2ea36f4d2ecea1` |
| Evidence status | `RECONSTRUCTION_BYTES_VERIFIED_ORIGINAL_BYTES_UNVERIFIED` |

The former expected original SHA-256,
`030f2dcd17465e235d50d546c9798dc8702817acff40a9e447ff796364fa8fe3`,
is retained only as provenance. It must never be represented as the hash of a file currently possessed or verified.

## Effective Foundation Task 1 evidence rule

When Foundation Task 1 creates `evidence/source-pdf.sha256`, that file must reference the actual reconstruction bytes, not the superseded expected hash. Its expected line is:

```text
1b85d574448714e897a4c5912ea383835291f9e992d9268bfb2ea36f4d2ecea1  Particle Sim Game_260813_205450 (Pages 1-58).pdf
```

The former expected original hash must be preserved separately as provenance, such as in `evidence/source-provenance.json` or the applicable verification receipt. `evidence/source-pdf.sha256` must not contain a hash for an unavailable file.

## Future recovery rule

If a file is later recovered whose raw bytes independently hash to
`030f2dcd17465e235d50d546c9798dc8702817acff40a9e447ff796364fa8fe3`,
that recovery requires a new evidence-reconciliation checkpoint. It must not silently replace the approved reconstruction or alter its recorded provenance.
