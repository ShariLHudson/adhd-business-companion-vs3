# 097 — Universal Work Engine Blockers

**Status:** No unresolved release-blocking issues for the Universal Work Engine extraction  
**Companion report:** `096_UNIVERSAL_WORK_ENGINE_EXTRACTION_REPORT.md`  
**Authority:** `095_CREATE_CORE_OWNERSHIP_AUDIT.md`

---

## Release-blocking issues

**None.**

Evidence:

1. **Canonical identity** — New master work mints `work-*` via `allocateCanonicalWorkId`. Legacy `evt-*` Event records are adopted as canonical without rewrite (`workIdentity.test.ts`, architecture boundary suite).  
2. **Universal registry** — `event_plan` registered through UWE Event package; `cert_probe` explicitly registered for certification; `requireWorkTypePackage` / bootstrap throw `UnknownWorkTypeError` for `marketing_plan` / `sop` (no silent template fallthrough for resolved IDs).  
3. **Tasks / milestones** — Owned by `lib/universalWorkEngine/tasks/workTasksApi.ts`; Event syncs confirmed tasks via `syncEventTasksIntoUniversalWork`.  
4. **Research** — Shared attachment model with Research → Review → Approve → Apply; apply does not overwrite master work.  
5. **Cartography** — Relationships reference Work IDs; `syncCreationToCartography` does not duplicate work content.  
6. **Durable DB boundary** — Forbidden packages scanned; no Work Type package / Event Intelligence direct repository access.  
7. **Event regression** — Final batch **9 files / 65 tests passed**, including:
   - `lib/universalWorkEngine/**` (12)
   - `productionCreateFoundation.cert.test.ts` (Event reference)
   - `universalCreateRuntimeConsolidation.cert.test.ts`
   - `createCertification.test.ts`
   - `createCommands.test.ts`
   - `createProjectsIntegration.test.ts`
   - `schemaFirstBootstrap.test.ts`
   - `eventCreationWorkspace.test.ts`

---

## Explicitly not blockers (tracked, out of UWE release scope)

| Item | Why not a UWE blocker |
|------|------------------------|
| CPC source-string certs (`shouldBindWorkspace`, `enterCreationFromShari` in `CompanionPageClient.tsx`) | Pre-existing estate host WIP; unrelated to UWE identity/registry/tasks/research extraction |
| `createWorkspaceV2` chat-hint copy expectation (`Copy any parts you like`) | Hint copy drift outside UWE ownership |
| SOP / Marketing Plan Begin until packages ship | Intentional fail-visible behavior; packages deferred by product decision |
| Persisting UWE in-memory research/relationship stores to Supabase | Hardening follow-on; durable work content already via `creationDurable` |

---

## Gate for next Work Type

Do **not** start Marketing Plan (or any new Work Type) until:

1. A Work Type package is registered through UWE (no template fallthrough for that ID)  
2. Begin / Estate Create catches `UnknownWorkTypeError` with Shari recovery voice  
3. No private identity/save/registry forks in the new package  

---

**Signed-off extraction condition:** Universal Work Engine is ready for Event production use under the constraints above; no release blockers remain for this phase.
