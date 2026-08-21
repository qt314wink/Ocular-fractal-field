# Ocular Fractal Field

## Canonical Production Design Specification

**Status:** Approved design, awaiting written-spec review  
**Date:** 2026-08-14  
**Architecture:** Framework-neutral TypeScript authority with a generated standalone HTML distribution  
**Source evidence:** `Particle Sim Game_260813_205450.pdf`  
**Source SHA-256:** `030f2dcd17465e235d50d546c9798dc8702817acff40a9e447ff796364fa8fe3`

## 1. Product Definition

Ocular Fractal Field is a deterministic, real-time particle instrument and short-form spatial game for modern browsers and mobile webviews. It combines a GPU-evaluated procedural field, interruptible camera choreography, gesture-derived play, synthesized spatial audio, elemental reactions, accessibility alternatives, replay evidence, and an adaptive visual-quality controller.

The experience begins as a bird's-eye mandala. Descent, pinch, wheel, and itinerary motion move the camera through a continuous immersion band into a volumetric particle field. The player identifies moving phase targets and traces their spatial behavior. Successful traces become persistent luminous threads. Thread intersections trigger explicit elemental reactions and gradually transform the field into a constellation authored through play.

The production claim is not “250,000 particles at 60 FPS on every phone.” The claim is:

> A deterministic simulation and game kernel produces reproducible state and events while a qualified adaptive renderer selects the highest sustainable visual tier without changing play results.

### 1.1 Canonical architecture decision

The editable authority is modular, framework-neutral TypeScript. The generated single-file HTML is a distribution artifact, not a second source implementation.

This provides:

- portable domain logic usable from plain Three.js, React, R3F, Astro, or a mobile webview;
- strict separation between canonical calculation and sensory rendering;
- independently testable simulation, camera, game, GPU, audio, input, and accessibility modules;
- a single offline-capable demonstration file compiled from the same verified source;
- deterministic replays and traceable verification receipts.

### 1.2 Version-one scope

Version one includes:

- deterministic fixed-timestep simulation;
- versioned JSON Schemas and generated TypeScript types;
- seeded particle metadata;
- Mandala Axial and Bismuth Hopper Grid fields;
- continuous pattern morphing;
- GPU particle evaluation with no per-frame CPU position loop;
- tiered spectral post-processing;
- itinerary and manual camera authority;
- velocity-matched itinerary rejoining;
- pointer, touch, wheel, keyboard, and optional calibrated gyro input;
- Phase-Weaving Constellation gameplay;
- five elemental identities and explicitly authored reactions;
- synthesized polyphonic audio with deterministic recipe selection;
- haptic and HUD adapters;
- reduced-motion, mute, non-gyro, simplified-input, and keyboard completion paths;
- replay export, state hashing, telemetry, and a verified standalone HTML build.

Deferred from version one:

- accounts, cloud saves, networking, and multiplayer;
- WebGPU, XR, and native applications;
- unreviewed procedural reaction generation;
- external runtime audio or visual assets;
- user-authored shader execution;
- monetization, scarcity, streaks, and engagement-pressure systems.

## 2. Authority and System Boundaries

Authority flows in one direction:

```text
versioned manifest
  -> validated configuration
  -> canonical fixed-step simulation
  -> ordered semantic events and immutable snapshots
  -> rendering, audio, haptic, HUD, and telemetry adapters
  -> generated standalone artifact
```

The manifest defines valid configuration. Types are generated from the schema. The simulation kernel owns canonical state. Domain modules communicate through stable ports and semantic events. Environment adapters consume snapshots and events but cannot mutate canonical state directly.

### 2.1 Package boundaries

| Package | Owns | Must not own |
|---|---|---|
| `contracts` | Schemas, semantic validation, generated types, units | Runtime behavior |
| `deterministic-math` | PRNG, easing, interpolation, hashing helpers | DOM, Three.js, audio |
| `simulation-core` | Fixed-step state, input queue, state hashes | Rendering and raw browser input |
| `camera-director` | Itinerary evaluation, manual authority, rejoining, pose snapshots | Gesture capture and renderer mutation |
| `phase-weaving-game` | Targets, judgments, threads, scoring, reactions | Visual, audio, or haptic execution |
| `runtime-orchestrator` | Module order, snapshots, semantic-event dispatch | Environment-specific implementation |
| `input-browser` | Raw input normalization and intention arbitration | Scoring and camera calculations |
| `gpu-three` | WebGL resources, shaders, post-processing, quality tiers | Gameplay decisions |
| `audio-web` | Consent, voices, recipes, scheduling, mixing, limiting | Collision or score authority |
| `haptics-browser` | Bounded haptic recipe playback | Game judgment |
| `accessibility` | Equivalent profiles and sensory caps | Hidden difficulty manipulation |
| `replay` | Replay envelopes, compatibility, import/export | Visual-quality telemetry |
| `telemetry` | Noncanonical performance and diagnostic records | Canonical state mutation |

## 3. Contracts, Time, and Reproducibility

### 3.1 Schema rules

All production schemas use JSON Schema Draft 2020-12, stable `$id` values, explicit units, bounded numeric ranges, bounded arrays, stable identifiers, and `additionalProperties: false`.

The root manifest includes:

- `manifestId`;
- `semanticVersion`;
- `replayCompatibilityVersion`;
- engine and simulation configuration;
- feature-capability fallbacks;
- quality-tier profiles;
- itinerary and override policy;
- audio limits and recipes;
- game rules, target families, and reaction references;
- accessibility and sensory policies;
- color-space and tone-mapping declarations.

Cross-field constraints not expressible structurally are checked by semantic validators. These include itinerary ordering and overlap, unique identifiers, safe near/far ratios, valid reaction participants, accessibility-compatible visual recipes, audio limits, and relationships between quality-tier counts and allocated buffer capacity.

Generated TypeScript types are authoritative. Handwritten duplicate interfaces are prohibited.

### 3.2 Deterministic PRNG

The frozen version-one generator is the unsigned 32-bit LCG:

\[
x_{n+1}=(1664525x_n+1013904223)\bmod 2^{32}
\]

JavaScript uses `Math.imul` and unsigned coercion. For seed `424242`, the first output is frozen as `2800682729`. A sequence of test vectors prevents silent particle-layout changes.

### 3.3 Fixed-step accumulator

The simulation step is separate from display refresh:

\[
A_{n+1}=\min(A_n+\Delta t_{real},A_{max})
\]

```text
while accumulator >= step:
  previous = current
  process inputs for current tick
  execute canonical modules
  increment tick
  accumulator -= step

alpha = accumulator / step
```

Default simulation frequency is 60 Hz. Real delta is measured with a monotonic clock and clamped to prevent a spiral of death. Rendering interpolates between previous and current canonical snapshots. Audio schedules against `AudioContext.currentTime`, not display or simulation time.

### 3.4 Determinism levels

| Level | Guarantee |
|---|---|
| State determinism | Identical manifest, seed, inputs, engine, and compatibility version produce identical canonical state hashes |
| Event determinism | The same run produces the same ordered semantic events and scores |
| Visual equivalence | Output remains within declared device-class image and performance tolerances |

Bit-identical pixels across unrelated GPUs are not promised because driver, floating-point, resolution, and color-pipeline behavior can differ.

### 3.5 Replay envelope

Replay records manifest hash, engine version, compatibility version, seed, simulation frequency, and tick-addressed normalized inputs. Pointer coordinates are viewport-normalized; gyro is calibrated and expressed in radians; pressure and wheel/dolly intent are bounded and quantized. Generated targets are recreated from seed and ruleset rather than duplicated in the replay.

Quality-tier changes, measured FPS, GPU timings, and thermal telemetry are explicitly noncanonical.

## 4. GPU Field and Adaptive Quality

### 4.1 Pipeline

The renderer consumes an immutable interpolated snapshot, binds bounded uniforms, evaluates seeded particle metadata in the vertex shader, shades point fragments in linear light, optionally applies a screen-space spectral pass, tone maps, converts to the declared output space, and records performance telemetry.

Shaders are separate `.vert.glsl` and `.frag.glsl` modules. The build embeds their compiled strings into the standalone artifact.

### 4.2 Particle data

The initial layout uses stable prefixes so quality changes never reorder surviving particles.

| Buffer | Format | Approximate bytes per particle | Meaning |
|---|---:|---:|---|
| Metadata A | `vec4 float32` | 16 | seed, track, phase, depth bias |
| Metadata B | packed `uint32` | 4 | family, element, flags, reserved |
| Draw-count sentinel | implementation-dependent | 4-12 | renderer-compatible draw count only |

No animated position buffer is uploaded during ordinary frames. Tier-two particle allocation is expected to remain below 8 MB, while total GPU allocations, including render targets and post-processing, must remain below the qualified 64 MB budget.

### 4.3 Field mathematics

The procedural coordinate is:

\[
\mathbf p_i(t)=(1-m_p)\mathbf p_{mandala,i}(t)+m_p\mathbf p_{bismuth,i}(t)+\mathbf d_{turbulence,i}+\mathbf d_{effect,i}
\]

Mandala angle and radius:

\[
\theta_i(t)=2\pi\frac{k_i}{N}+a_\theta\cos(\omega_i t+\phi_i)
\]

\[
r_i(t)=Rs_i\left[b_r+a_rE\left(\frac{\sin(\omega_i t+\phi_i)+1}{2}\right)\right]
\]

The Bismuth field traverses explicit nested orthogonal edges. It must not collapse particles into four static corners. Continuous `patternMix` blends both coordinates.

Immersion is:

\[
I=1-\operatorname{smoothstep}(z_{min},z_{max},z)
\]

This removes the derivative discontinuity created by an abrupt depth threshold.

### 4.4 Optical behavior

Particle fragments provide a radial core, depth attenuation, phase-driven linear-light color, element emission, bounded shockwave whitening, and accessibility-capped scintillation.

Chromatic aberration is a framebuffer operation because authentic channel displacement samples neighboring pixels. Tier zero disables it; tier one uses a simplified radial displacement; tier two uses depth-aware spectral displacement, bounded bloom, and caustic modulation.

Color is authored perceptually, converted to linear-light working values, tone mapped once, and output-encoded once. Point size is clamped and particles behind the camera are suppressed.

### 4.5 Quality tiers

| Tier | Particles | DPR cap | Optical pass | Qualified target |
|---|---:|---:|---|---|
| Tier 0 | 60,000 | 1.0 | Off | 30 FPS floor |
| Tier 1 | 140,000 | 1.5 | Simplified | 45-60 FPS |
| Tier 2 | 250,000 | 2.0 | Full | 60 FPS on qualified hardware |

The adaptive controller uses rolling percentile windows, hysteresis, cooldowns, GPU timer queries where supported, frame timing otherwise, and immediate emergency downgrades for repeated context loss or memory pressure. Upgrade requires a longer stable period than downgrade. A tier change updates renderer DPR, framebuffer sizes, draw ranges, and the post-processing material.

Quality is visual-only. Target positions, judgments, collisions, thread state, scores, and replay hashes are unchanged.

### 4.6 GPU pass conditions

- p95 high-tier frame rate at least 55 FPS over a qualified 120-second run;
- p95 GPU frame time at most 14 ms;
- p95 CPU submission at most 2 ms;
- zero dynamic particle-position uploads per ordinary frame;
- context recovery within 2 seconds;
- no shader compile or link error;
- deterministic metadata hashes;
- reduced-motion and deterministic 2D fallback support.

## 5. Interruptible Itinerary Camera Director

### 5.1 States

The camera director uses `AUTOPLAY`, `MANUAL`, `REJOINING`, `PAUSED`, and `COMPLETE`. Manual intent takes authority within one simulation tick. New input during rejoining immediately restores manual authority.

The default policy pauses itinerary time during manual exploration. After a configurable idle interval, the director samples future poses, rejects unsafe candidates, selects the nearest valid future intercept, and blends pose and velocity until terminal tolerances pass.

### 5.2 Camera model

Each keyframe declares a stable identifier, timing, spherical pose, roll, FOV, gaze mode, interpolation policy, yaw policy, pattern transition, and optional turbulence target.

Position is:

\[
\mathbf p(r,\theta,\phi)=
\begin{bmatrix}
r\sin\theta\cos\phi\\
r\sin\phi\\
r\cos\theta\cos\phi
\end{bmatrix}
\]

Large descents interpolate radius logarithmically:

\[
r(t)=\exp((1-e(t))\ln r_0+e(t)\ln r_1)
\]

Yaw supports `SHORTEST_ARC` and `EXPLICIT_TURNS`. Pitch stays away from exact poles. Orientation is constructed from `CENTER`, `OUTWARD`, `TARGET`, or `TANGENT` gaze and blended with quaternion slerp. There is no conditional center/outward `lookAt` snap.

Manual movement uses a critically damped response:

\[
\ddot{x}+2\omega\dot{x}+\omega^2(x-x_t)=0
\]

Radius and FOV cannot overshoot. Decorative roll may use small bounded overshoot outside reduced-motion mode.

### 5.3 Camera intent grammar

The director consumes semantic intents such as `camera.orbit`, `camera.dolly`, `camera.roll`, `camera.freeze`, `camera.recenter`, and `itinerary.resume`. It never sees pointer pixels, touch objects, wheel events, or device-orientation events.

Gyro requires explicit permission and neutral calibration. Reduced-motion substitutes stable-view crossfades for flights. FOV is bounded to 35-85 degrees. Near/far changes are gradual. Core exclusion boundaries require explicit authored permission to cross.

### 5.4 Camera pass conditions

- takeover latency no more than one simulation tick;
- position discontinuity no more than 0.02 world units;
- orientation discontinuity no more than 0.25 degrees;
- rejoin terminal position error no more than 0.01 world units;
- rejoin terminal angular error no more than 0.1 degree;
- zero unsafe-boundary penetrations and unexpected autoplay resumes;
- no ordinary-step garbage allocations;
- replay camera error no more than `1e-6` canonical units.

## 6. Polyphonic Spatial-Audio Bridge

### 6.1 Lifecycle and boundary

Audio states are `LOCKED`, `READY`, `RUNNING`, `SUSPENDED`, `MUTED`, and `FAILED`. Explicit consent is honored. Requested sample rate is advisory; actual hardware rate is recorded.

The audio bridge consumes semantic events and spatial snapshots. It does not judge collisions, compute score, inspect gestures, or mutate camera or simulation state.

### 6.2 Voice graph

Persistent reusable voice strips contain source, source gain, filter, envelope gain, spatial panner, dry bus, effects send, master compressor, limiter, and destination. Oscillators remain running at zero gain because stopped `OscillatorNode` instances cannot restart.

Allocation selects an idle voice, then a quiet releasing voice, then the oldest lower-priority voice. Otherwise the new event is rejected. Voice stealing applies a 3-8 ms release ramp. Completion events cannot be stolen by low-value trace ticks.

### 6.3 Spatial mapping

Depth maps exponentially across two octaves:

\[
f(z)=220\cdot 2^{2(1-\hat z)}
\]

At the declared endpoints, depth 130 maps to 220 Hz, depth 65 to 440 Hz, and depth 0 to 880 Hz.

Velocity maps logarithmically to filter cutoff; acceleration controls transient strength; turbulence controls bounded noise and detune; immersion controls reverb send; yaw controls azimuth; pitch controls elevation brightness; coherence controls consonance and stereo stability; pattern morph controls timbral crossfade.

Score never controls loudness.

### 6.4 Harmonic semantics

Semantic functions include confirmation, correction, accumulation, transformation, spatial punctuation, resolution, and destabilization. Exact notes come from versioned recipes containing scale, root, voicing, inversion, register, waveform, envelope, filtering, panning, and effects sends.

The initial sonic palette is:

- Bismuth: triangle plus metallic partials, stepped arpeggiation;
- Caustic: sine clusters and resonant shimmer, expanding bloom;
- Symmetry: pulse/triangle hybrid, interlocking rhythm;
- Void: filtered noise and sub-sine, gravitational compression;
- Plasma: band-limited saw and glass transient, branching flare.

### 6.5 Safety and performance

Default master gain is at most 0.15, hard manifest ceiling at most 0.35, with compression, limiting, event aggregation, and independent audio/haptic controls. The complete game remains legible while muted.

Pass conditions include p95 interaction onset at most 40 ms on supported mobile, p95 scheduled event error at most 5 ms, no audible steal clicks, no unbounded node growth, no game-state divergence when muted, and no remote audio dependency.

## 7. Phase-Weaving Constellation

### 7.1 Core loop

The loop is `SEARCHING -> TELEGRAPHING -> TRACING -> RESOLVING`, followed by `THREAD_LOCKED` or `RECOVERING`. Locked threads may enter `REACTING`; the last required node enters `LATTICE_COMPLETE`.

Typical phases last:

- search: 1.0-2.5 seconds;
- telegraph: 0.6-1.4 seconds;
- trace: 0.35-1.8 seconds;
- resolve: 0.12-0.3 seconds;
- reaction: 0.5-2.0 seconds;
- completion reveal: 2.0-4.0 seconds.

A constellation takes approximately 25-75 seconds. Endless exploration is optional; no streak or scarcity pressure exists.

### 7.2 Target families

Targets are deterministic parametric paths in normalized screen, field-local, or world space. Initial families are radial arcs, orthogonal steps, Lissajous curves, spirals, and cubic Bézier paths. Each target declares a node, active tick range, intercept window, direction, element, difficulty, and visual-hint recipe.

### 7.3 Trace normalization and judgment

Raw samples are normalized, resampled by arc length, deterministically smoothed, and transformed into the target comparison space. Evaluation is independent of browser event rate.

Spatial error:

\[
E_p=\frac{1}{N}\sum_{i=1}^{N}\frac{\|\mathbf g_i-\mathbf q_i\|}{d_{viewport}}
\]

Tangent error:

\[
E_\theta=\frac{1}{N}\sum_{i=1}^{N}\frac{|wrap(\theta_i^g-\theta_i^q)|}{\pi}
\]

Timing error:

\[
E_t=\frac{|t_{intercept}-t_{target}|}{w_{intercept}}
\]

Velocity-profile error:

\[
E_v=\frac{1}{N}\sum_{i=1}^{N}|\hat v_i^g-\hat v_i^q|
\]

Composite coherence:

\[
C=clamp(1-(0.40E_p+0.25E_\theta+0.20E_t+0.15E_v),0,1)
\]

Judgments are `RESONANT` at 0.93 or above, `LOCKED` from 0.82, `GLANCING` from 0.68, and `DIVERGED` below 0.68. Target families may adjust weights within declared bounds.

Failure remains explanatory: spatial divergence bends away, timing divergence shows phase separation, reversal unzips, excessive speed outruns anchors, and incomplete traces retain the missing segment.

### 7.4 Threads and scoring

Successful traces create canonical threads with endpoints, element, coherence, charge, creation tick, and lifecycle. Quality tiers do not alter thread state.

Thread charge:

\[
Q=C^{1.6}M_cM_d
\]

Trace score:

\[
S=round(B\cdot C^{1.6}\cdot M_d\cdot M_c)
\]

Combo multiplier is bounded:

\[
M_c=1+\min(n_{chain},8)\cdot0.125
\]

The ordinary maximum is 2x. Score cannot scale volume, flashes, haptic force, particle count, or camera displacement.

### 7.5 Elements and reactions

Initial elements are Bismuth, Caustic, Symmetry, Void, and Plasma. Each has explicit geometry, force, color, motion, audio, and accessibility semantics.

Initial reviewed reactions include:

| Pair | Reaction | Persistent mechanical consequence |
|---|---|---|
| Bismuth + Caustic | Prismatic Hopper Bloom | Mirrored-echo target |
| Bismuth + Void | Event Horizon Lattice | Temporary target-phase slowing |
| Caustic + Plasma | Solar Corona Burst | Short bonus intercept |
| Symmetry + Void | Eclipse Twin | Hidden opposite node reveal |
| Plasma + Bismuth | Ionized Staircase | Corners become rhythm gates |
| Caustic + Symmetry | Rosette Phase Mirror | Optional paired trace |

Unsupported pairs are explicit. Three-element reactions require separate authorship and review.

Reaction resolution considers intersection geometry, elements, combined charge, and temporal order. It produces a canonical rule effect plus separate visual, audio, and haptic recipe identifiers.

### 7.6 Motion-interaction grammar

Every interaction follows:

```text
raw input -> normalized intent -> canonical change
-> semantic event -> sensory confirmation -> persistent consequence
```

| Gesture | Intent | Canonical effect | Visual verb |
|---|---|---|---|
| Tap target | Inspect | Reveal phase | Focus |
| Hold | Anchor | Slow local phase | Condense |
| Directional trace | Weave | Attempt thread | Draw and lock |
| Pinch inward/outward | Descend/survey | Camera dolly | Submerge/unfold |
| Twist | Rotate lattice | Camera roll intent | Torque |
| Tilt | Bias view | Calibrated camera offset | Lean |
| Double tap | Recenter | Camera recenter | Snap-align |
| Two-finger trace | Couple | Advanced paired attempt | Braid |

The feedback hierarchy is contact, recognition, commitment, judgment, persistence, reaction, and completion. Large spectacle requires a legible causal action.

Camera and trace systems use deterministic intention thresholds and capture ownership. An active target region claims input only after the trace threshold; otherwise the gesture remains camera input.

### 7.7 Accessibility

Equivalent completion paths include larger corridors, persistent hints, tap-sequence tracing, keyboard or switch-direction tracing, timing-only or shape-only profiles, no gyro, muted audio, high-contrast palettes, and reduced motion. Difficulty may alter windows, complexity, hints, and weighting but cannot change gesture meaning, require color or audio, violate camera safety, or introduce irreversible failure.

## 8. Integration Blueprint

### 8.1 Repository structure

```text
ocular-fractal-field/
  apps/
    standalone/
    laboratory/
  packages/
    contracts/
    deterministic-math/
    simulation-core/
    camera-director/
    phase-weaving-game/
    effect-recipes/
    runtime-orchestrator/
    input-browser/
    gpu-three/
    audio-web/
    haptics-browser/
    accessibility/
    replay/
    telemetry/
  fixtures/
    manifests/
    replays/
    state-hashes/
    images/
    audio/
    performance/
  tools/
    generate-types/
    build-standalone/
    verify-standalone/
    benchmark/
  docs/
    architecture/
    specifications/
    motion-grammar/
    reactions/
    accessibility/
    verification/
```

The laboratory isolates every field, transition, gesture judgment, recipe, reaction, fallback, and accessibility profile before product integration.

### 8.2 Dependency requirements

Runtime dependencies are limited to Three.js for the WebGL adapter and AJV plus format support for validation. Vite builds the standalone artifact. Canonical packages use internal TypeScript only. Audio, input, haptics, and device orientation use platform APIs.

Development uses strict TypeScript, Vitest, Playwright, axe-core, ESLint, Prettier, schema-to-TypeScript generation, visual comparison, shader compilation, and bundle-budget checks. Versions are pinned by lockfile. The runtime uses no CDN, remote font, or remote asset.

Version one deliberately avoids React, R3F, GSAP, Framer Motion, a physics engine, a state-machine dependency, and an audio framework. UI-framework adapters may be added later without changing domain ports.

### 8.3 Language requirements

TypeScript uses strict mode, unchecked-index protection, exact optional-property semantics, exhaustive unions, immutable public snapshots, explicit units, and no production `any`. Domain packages import no DOM or Three.js types and receive clocks, randomness, storage, and environment capabilities through ports.

GLSL targets WebGL2/GLSL ES 3.00 with explicit precision, bounded loops, separate modules, validated buffer layouts, point-size clamps, diagnostic receipts, linear-light output, and declared capability variants.

## 9. Translation and Traceability Protocol

Every capability follows:

```text
observation
-> evidence qualification
-> mechanism interpretation
-> user/system value
-> bounded design intent
-> module authority
-> parameter definition
-> JSON Schema
-> generated type
-> fixture
-> isolated implementation
-> verification receipt
-> integrated artifact
```

Observations remain distinct from authored decisions. Each parameter records semantic meaning, unit, valid range, default, source category (`OBSERVED`, `DERIVED`, or `AUTHORED`), derivation, affected consumers, forbidden consumers, and fixtures.

Each feature contract records the problem, evidence, design intent, canonical inputs and outputs, forbidden effects, acceptance criteria, and fixture identifiers. This creates a reconstructable path from source evidence through engineering choice and QA.

## 10. Build Order and Gates

### Gate 0: Repository authority

Create README, ADR, file-tree contract, units glossary, CI skeleton, and PDF evidence record. Exit when clean install and empty verification pass.

### Gate 1: Contracts and deterministic mathematics

Implement schemas, semantic validators, generated types, PRNG, easing, fixed timestep, replay, and state hashing. Exit when two clean runs produce identical canonical hashes.

### Gate 2: GPU field isolates

Implement deterministic metadata, Mandala, Bismuth, morphing, fragments, spectral passes, color management, tiers, and context recovery. Exit when isolated visual and performance fixtures pass.

### Gate 3: Camera director

Implement keyframes, spherical paths, quaternion gaze, manual authority, safe rejoining, and reduced-motion transitions. Exit when continuity and replay fixtures pass.

### Gate 4: Input routing

Implement pointer/touch unification, pinch, twist, hold, trace, wheel, keyboard, gyro calibration, and game/camera arbitration. Exit when normalized fixtures are event-sampling invariant.

### Gate 5: Phase-Weaving kernel

Implement target families, trace resampling, judgment, threads, scoring, and completion. Exit when replay reproduces every judgment and score.

### Gate 6: Reactions and sensory adapters

Implement elemental recipes, effect events, audio, haptics, and accessibility variants. Exit when removing sensory adapters leaves canonical hashes unchanged.

### Gate 7: Integrated instrument

Implement runtime orchestration, HUD, consent, telemetry, and recovery. Exit when the complete loop works across required input and accessibility modes.

### Gate 8: Standalone build

Inline compiled JavaScript, CSS, schemas, shaders, and deterministic impulse responses. Embed manifest and build receipt. Exit when offline and modular-equivalence tests pass.

### Gate 9: Production verification

Run desktop/mobile matrices, sustained and thermal performance, context loss, replay proof, accessibility, visual regression, audio analysis, and documentation review. Exit with no unresolved release blocker.

## 11. UX Hierarchy

The field, actionable target, immediate trace feedback, persistent thread state, and camera awareness outrank score and diagnostic telemetry. Desktop may expose a technical instrument panel. Mobile defaults to a quiet field with contextual labels and an expandable telemetry drawer.

The original PDF's full-screen diagnostic HUD is retained as an optional laboratory mode, not the default mobile hierarchy. The field remains live behind UI changes. Only permission and recovery states may interrupt active play.

## 12. QA and CI

QA layers are schema, semantic validation, unit, property, determinism, boundary contract, integration, visual, audio, interaction, accessibility, performance, resilience, and standalone equivalence.

Every pull request runs frozen-lockfile installation, schema validation, generated-file drift checks, strict type checking, linting, unit/property tests, two-run determinism comparison, replay fixtures, shader compilation, standalone build, offline/network tests, browser smoke tests, accessibility checks, and bundle-budget enforcement.

Scheduled or device-lab verification adds mobile GPU performance, visual comparisons, offline audio analysis, thermal-duration runs, WebGL context recovery, and hardware gyro/touch checks. Performance baselines cannot update silently.

## 13. Global Standards

- Canonical calculations are reproducible.
- Visual equivalence is tolerance-based across GPUs.
- Adaptive quality cannot alter gameplay.
- Sensory intensity cannot scale directly with score.
- Raw browser events cannot enter domain modules.
- Environment adapters cannot own canonical authority.
- Every capability has a fallback or explicit unsupported state.
- Every public parameter has units, bounds, provenance, and fixtures.
- Every effect has a causal semantic event.
- Every generated artifact records source hashes and versions.
- The release works without runtime network access.
- Mobile thermal stability outranks peak particle count.
- Failure feedback explains the mismatched dimension without punishment.
- No mechanic relies on streak anxiety, hidden odds, or monetized scarcity.

## 14. Expected Deliverables

- modular TypeScript packages;
- authoritative JSON Schemas;
- generated TypeScript types;
- GLSL modules and compiled variants;
- validated manifests, elements, reactions, audio, visual, and haptic recipes;
- laboratory isolates;
- deterministic replay and state-hash fixtures;
- visual and offline-audio references;
- performance and thermal reports;
- accessibility profiles;
- offline standalone HTML;
- architecture, motion-grammar, reaction, and QA documentation;
- source-to-requirement traceability matrix;
- final verification receipt.

## 15. Global Definition of Done

Version one is complete when:

1. all ten gates, numbered 0 through 9, pass;
2. two clean executions produce identical canonical state and event hashes;
3. both GPU fields and their continuous morph pass isolated fixtures;
4. adaptive tiers preserve target, judgment, thread, score, and replay results;
5. camera takeover and rejoining remain within continuity tolerances;
6. a constellation is completable with touch, pointer, keyboard, reduced motion, muted audio, and no gyro;
7. supported elemental reactions are explicit, bounded, and reproducible;
8. no runtime network request occurs;
9. no release-blocking accessibility violation remains;
10. mobile performance reports declare hardware, browser, viewport, DPR, tier, thermal duration, and percentile timings;
11. context loss, audio interruption, focus loss, and resize recover without canonical-state corruption;
12. the standalone artifact embeds its manifest hash, engine version, source revision, and verification receipt;
13. documentation traces every important design decision from evidence through implementation and QA.

## 16. Superseded Prototype Assumptions

The following source-PDF patterns are explicitly superseded:

- invalid generic Cloudflare script URL as a Three.js dependency;
- merged vertex and fragment shader containers;
- frame-rate-dependent interpolation loops;
- runtime `Math.random()` for canonical layouts;
- abrupt center-to-outward `lookAt` switching;
- per-frame CPU particle-position updates;
- raw angle-only gesture judgment;
- hardcoded frequency arrays as musical authority;
- newly allocated oscillator graphs for every event;
- DOM mutation from game, camera, GPU, or audio domain logic;
- passive touch assumptions that do not resolve browser gesture ownership;
- universal 250,000-particle/60-FPS mobile claims;
- pixel-identical cross-GPU determinism claims;
- telemetry text claiming a fixed FPS rather than measured performance.

These prototype fragments remain useful as evidence of intended experience, terminology, initial geometry, and interaction direction. They are not production implementation authority.

