# Create Registry — Gap Analysis

**Date:** 2026-07-23  
**Master inventory:** [`../CREATE_MASTER_INVENTORY_AND_REGISTRY.md`](../CREATE_MASTER_INVENTORY_AND_REGISTRY.md)  
**Current architecture:** [`create-registry-current-architecture.md`](./create-registry-current-architecture.md)

---

## 1. Existing versus master inventory

| Master expectation | Current repository |
|---|---|
| One canonical `CreationRegistryItem` registry | Fragmented: `CREATE_CATALOG` + `CREATE_PARENT_TYPES` + option audit + UWE packages + docs |
| 9 categories | 7 Browse categories; different names; Personal empty |
| Market & Grow **and** Sell & Convert | Collapsed as **Market & Sell** |
| Develop Ideas | Missing as category (Explore Ideas partially retired) |
| Organize Knowledge | Named **Organize Information** |
| Personal & Community | **Personal** empty; Facebook Community under Market & Sell |
| Lifecycle statuses + verification flags | Not on menu rows |
| `isUserVisible` only when ready+verified | No such gate; launchable filter only |
| Based on Your Business entry | Missing |
| Browse by Goal | Missing (Browse More / Help Me Choose exist) |
| Registry-driven How Do I… | Missing |
| Registry-driven Chamber/Map/Board recs | Not wired from Create registry IDs |
| Unbuilt types kept internal | Many planned types exist only in docs/blueprints, not in a readiness-gated registry |

---

## 2. Missing release essentials (highest risk)

1. **Honest visibility** — menu peers imply guided depth that only 4 types have.  
2. **Browser/Founder certification** — all Create browser standards `NOT_RUN`.  
3. **Save/reopen certainty** for simple artifacts under Spec 113 language (durable path exists; member-facing certainty **needs-audit**).  
4. **Dead/duplicate cards** — Launch vs Event vs Marketing Campaign; Workshop routing; phantom workType IDs (`sop`, `checklist`, `proposal`).  
5. **Create→Project** linked source-of-truth — partial; not certified as non-duplicating.  
6. **Based on Your Business** — product decision present in master inventory; not in Create entrance.  
7. **Multi-avatar / business context** on create — not on Create home.

---

## 3. Duplicates

| Cluster | Where |
|---|---|
| Category taxonomies | Catalog 6 · Browse 7 · Explore Ideas 7 · Master 9 |
| Type labels | Catalog 42 · Parents 30 · Audit 42 · UWE 4 |
| Orchestration | Begin UI · entrypoint · UCE · legacy `universalCreation` · Anywhere-Origin |
| Strategy labels | Marketing Strategy / Content Strategy → Strategy parent |
| Social platforms | Facebook/LinkedIn/Social Post → Social Content |
| SOP aliases | SOP / Process / Automation / GHL Workflow |
| Blueprint registries | UWE blueprints vs `platformIntent/blueprintRegistry` adapter |

---

## 4. Obsolete / quarantine candidates

- Explore Ideas category cards as parallel Create taxonomy (`lib/createEstate/exploreIdeas/categories.ts`) if Browse More is canonical.  
- Legacy split Create shell (ownership contract quarantine).  
- Stale simplification report claiming “33 items” vs live 42 catalog labels.  
- Client Avatar as Create output (already routed away — keep out of visible Create registry).

---

## 5. Routing gaps

- Free-text Begin uses heuristics + catalog match — not master registry aliases.  
- Phantom IDs resolve in label→workType helpers without schemas.  
- Workshop → Event Plan path must be proven (needs-audit).  
- Deep links / old saved item URLs — needs-audit for convergence on entrypoint.

---

## 6. Persistence gaps

- Durable table + creationDurable is the right seam.  
- Risk: some paths still treat local/memory success as saved (**needs-audit** per UI).  
- Versioning / restore / trash consistency across guided vs simple — needs-audit.  
- Spec 113 “where is it / can I find it” copy not uniformly tied to registry metadata.

---

## 7. Action gaps

Universal actions (print, export, rename, duplicate, archive, trash) are uneven:

- Guided packages: export/actions vary by package.  
- Simple drafts: ContentGenerator export paths; not all actions certified.  
- Master inventory requires required-actions verified before visibility — **not met**.

---

## 8. Profile / avatar gaps

- No Create-home “Based on Your Business”.  
- Avatar selection modes from master inventory not implemented on Create.  
- Profile prompts for missing fields exist in blueprint context docs; not progressive Create prompts.  
- Business context inheritance into Projects — partial via project sync; needs-audit.

---

## 9. How Do I… gaps

- Contextual, page-aware, registry-driven How Do I… **not found** as a Create subsystem.  
- Estate How-To / Guidebook exists elsewhere; not bound to `CreationRegistryItem.help` metadata.

---

## 10. Project gaps

| Master rule | Current |
|---|---|
| Create remains source of truth | Intended; not certified |
| Project stores source reference | `project_home_id` exists |
| Bidirectional open | Partial bridges |
| No uncontrolled duplication | needs-audit |
| Inherit business/avatar context | needs-audit |

---

## 11. Category mapping (current 7 → master 9)

| Current Browse | Master destination |
|---|---|
| Write & Communicate | Write & Communicate |
| Market & Sell | Split → Market & Grow **and** Sell & Convert |
| Work With Clients | Work With Clients |
| Plan Something | Plan an Experience |
| Build the Business | Build & Run the Business |
| Organize Information | Organize Knowledge |
| Personal | Personal & Community (+ community types such as Facebook Community) |
| *(missing)* | Develop Ideas |

---

## 12. Bottom line

The platform already has **strong seams** (ownership contract, Begin outcomes, durable workspaces, four guided packages). The gap is not “no Create” — it is **many sources of truth without readiness honesty**. Closing the gap means adding the master registry foundation and migrating discovery onto it, not rebuilding all builders at once.
