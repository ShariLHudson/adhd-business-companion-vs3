# 341 — Extension Implementation Plan

**Date:** 2026-07-21  
**Governing spec:** [336](./336_PLUGIN_AND_EXTENSION_ARCHITECTURE.md)  
**Related:** [335](./335_PLATFORM_EVOLUTION_ARCHITECTURE.md) · [327](./327_CAPABILITY_EXECUTION_AND_CONTRIBUTION_RUNTIME.md) · [312](./312_UNIVERSAL_REGISTRY_ARCHITECTURE.md) · [340](./340_EVOLUTION_AUDIT.md)  
**Mode:** Plan — host contracts first; **no marketplace or third-party plugin runner yet**  
**Primary slice:** E1 — internal extension manifest + load rules

---

## 1. Goals

1. Define how future modules, integrations, AI providers, and packaged content **publish capabilities** without shadow stores.  
2. Require Universal Work respect, provenance, and certification before production.  
3. Prefer **internal** first-party packages as the first “extensions.”  

---

## 2. Non-goals

- Public marketplace  
- Arbitrary third-party code execution in the companion  
- New Work engine per plugin  
- Bypassing Research/Output approval  
- Shipping agents as the extension host (see 342)  

---

## 3. Current related surfaces (not an extension host)

| Surface | Role today |
|---------|------------|
| UWE Work Type packages | First-party “extensions” of Create |
| Chamber Members | Domain presence — not plugin loaders |
| Estate Brain registries | Routing/knowledge — not executable plugins |
| Workspace environments (091) | Visual place packs — not capability plugins |
| Integrations (Google, etc.) | Connected sources — must stay minimal-scope (320) |
| Createability / Blueprint packs | Content + structure — cert gated |

---

## 4. Slice sequence

### E1 — Extension manifest contract (types only)

```
ExtensionManifest {
  extensionId, version, owner,
  publishesCapabilityIds[],
  requiresWorkTypeIds[],
  certificationStatus,
  permissions[],          // read_work | draft_output | mutate_with_approval | connected_source
  provenancePolicy,
  shadowStoreForbidden: true
}
```

Home: `lib/platformExtensions/` (types + validate only) **or** under UWE `extensions/` if scoped to Create.

**Success:** Vitest rejects manifests that declare private Work stores or mutate-without-approval.

### E2 — First-party adapter

Treat one existing package as an extension (e.g. Events intelligence or Handmade Business Collection façade) via read adapter — no new runtime.

### E3 — Capability publish bridge

Extension → capability IDs resolve through 327 execution contract (after R1).

### E4 — Connected-source extensions

Integrations declare scope, retention, and failure degradation (331/334).

### E5 — Packaged content (Blueprints / Collections)

Content packs must pass createability (233–236) + Collection ownership (304/328) before “installed” presentation.

### E6 — External providers (later)

AI provider / third-party only after E1–E5 and certification registry (314/316).

---

## 5. Certification gates for extensions

| Gate | Rule |
|------|------|
| SoT | No shadow Work / profile / registry |
| Work | Mutations only via UWE + approval modes |
| Provenance | Every contribution carries source fields (318) |
| Createability | Promised outputs certified or honestly limited |
| Privacy | Connected sources minimal scope (320) |
| Recovery | Unavailable → failed_safe (331) |

---

## 6. Alignment

| Plan | Relationship |
|------|----------------|
| 332 R1 | Capability execution must exist before extensions publish executable capabilities |
| 316 G1 | Extension IDs can use registry kernel entry shape |
| 340 | Evolution gate applies to every extension merge |

---

## 7. Completion criteria (this landing)

- Specs **335–339** stored  
- Audits/plans **340–342** complete  
- **317** updated  

**E1 code:** separate PR when approved — after or alongside R1 types, not instead of R1.
