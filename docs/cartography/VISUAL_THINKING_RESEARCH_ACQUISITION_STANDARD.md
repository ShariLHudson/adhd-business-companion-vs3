# Visual Thinking — Research Acquisition Intelligence Standard

**Status:** Binding implementation standard (Build 9)  
**Date:** 2026-07-24  
**Scope:** Acquire missing knowledge identified by the Knowledge Package  
**Upstream:** [VISUAL_THINKING_KNOWLEDGE_INTELLIGENCE_STANDARD.md](./VISUAL_THINKING_KNOWLEDGE_INTELLIGENCE_STANDARD.md)

**Runtime:** `lib/cartographersStudio/visualThinkingResearchAcquisition.ts`  
**Session key:** `companion-visual-thinking-research-v1`

---

## Mission

Fill verified knowledge gaps so understanding can be complete enough to generate safely.

Research is **not** the product. Understanding is the product.

Never research because it is possible.  
Research because additional verified knowledge is genuinely required.

---

## Does not

- reinterpret the request  
- change user goals  
- recreate the Experience Plan  
- choose new deliverables  
- rewrite approved knowledge  
- change the Presentation Plan  
- modify workspace organization  

It extends the Knowledge Package. It never replaces it.

---

## Pipeline

```
Request
→ Understanding
→ Experience
→ Knowledge Plan
→ Knowledge Package
→ Research Acquisition
→ Updated Knowledge Package
→ Generation
→ Presentation
→ Thinking Workspace
```

---

## Research Plan

`VisualThinkingResearchPlan`

Fields: id · knowledgePackageId · requestedResearch · researchPriority · requiredResearch · optionalResearch · blockedResearch · researchQuestions · acceptedSources · excludedSources · freshnessRequirement · evidenceRequirement · strategy · status · createdAt · updatedAt

Statuses: `draft` · `ready` · `acquiring` · `partial` · `complete` · `failed` · `blocked`

---

## Research Item

`VisualThinkingResearchItem`

Fields: question · reason · priority · status · sourceRequirements · freshness · confidence · verification · notes · findingContent · citations · knowledge item links · userAuthority

Statuses include: planned · resolved · partially_resolved · still_unresolved · contradictory · obsolete · blocked · failed

---

## Research types

current product · regulations · pricing · technology · competitors · definitions · historical facts · best practices · scientific evidence · market information · public documentation · reference material

**Providers are never hardcoded.** Findings arrive as provider-agnostic inputs.

---

## Source categories

Official documentation · Government · Academic · Industry publication · Verified company information · Trusted reference · Existing Estate knowledge · Previously verified user information · Internal user documents · Community discussion

Confidence is scored separately from category.

---

## Source confidence

`verified` · `high` · `medium` · `low` · `unknown`

Evidence-based. Never assumed.

---

## Freshness

`real_time` · `recent` · `current` · `stable` · `historical` · `timeless` · `unknown`

Plans set freshness requirements. Obsolete findings stay marked obsolete.

---

## Verification

`verified` · `partially_verified` · `unverified` · `conflicting` · `obsolete` · `unknown`

Unknown remains unknown.

---

## Conflicts

When research disagrees — do **not** choose automatically.

`VisualThinkingResearchConflict`: source A · source B · difference · confidence · recommended action

Generation may acknowledge uncertainty. Conflicts are never hidden.

---

## Duplicates

Equivalent findings merge. Preserve all source references, confidence, freshness, and verification.

---

## Strategies

`single_source` · `multi_source_confirmation` · `official_first` · `freshness_first` · `evidence_first` · `user_authority` · `internal_only`

The Knowledge Plan (and Adaptive Companion, for optional visibility) informs strategy. Overrides are explicit.

---

## User authority

When the member is the authoritative source (internal SOP, workflow, preferences, Estate information):

- Prefer internal / previously verified user sources  
- Do **not** replace user knowledge with outside research  

---

## Citations

`VisualThinkingCitation` — internal model: source · title · publisher · date · retrieved · confidence · freshness · verification · supportsItems

Presentation decides how citations appear to members.

---

## Knowledge updates

Research **extends**:

existing knowledge + verified research + remaining gaps + conflicts + citations

Approved items are never rewritten away.

After acquisition, Generation may receive `knowledgeResearchSatisfied` so the research gate can lift **without** changing the Experience Plan.

---

## Workspace behavior

If research completes while the member is in the Thinking Workspace:

Offer: **“New verified information is available.”**

Never replace the current workspace automatically. Member dismisses or reviews.

---

## Adaptive Companion

May influence:

- whether optional research is suggested  
- whether freshness warnings appear  
- choice load on optional questions  

Never hides conflicts, missing research, or obsolete information.

---

## Accessibility

Research status uses clear language — not color, animation, or icons alone.

---

## Future compatibility

Do **not** begin here:

- Dynamic Representation Switching  
- Cross-Estate Integration  

Live provider adapters may plug into `VisualThinkingResearchFindingInput` without changing this contract.

---

## Certification checklist

- [ ] Research Plan creation  
- [ ] Required vs optional vs blocked  
- [ ] Confidence / freshness / verification  
- [ ] Conflicts recorded without auto-resolve  
- [ ] Duplicate merge preserves sources  
- [ ] Citations created  
- [ ] Knowledge Package extended (not replaced)  
- [ ] Workspace notification (no auto-apply)  
- [ ] User-authority / internal-only  
- [ ] Partial / failed research honest  
- [ ] Generation gate satisfied without Experience Plan rewrite  
- [ ] Builds 1–8 remain passing  
