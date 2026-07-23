# 133 — Global Library & Collection Standard™

**Status:** Binding product law — permanent governance  
**Date:** 2026-07-23  
**Authority class:** Product constitution (extends series **113–117** · complements **128** and **132**)  
**Cursor rule:** `.cursor/rules/global-library-collection-standard.mdc`  
**Runtime types:** `lib/sparkLibraryCollection/types.ts`

**Related:** [128 Simplicity & Cognitive Load](./128_SPARK_ESTATE_SIMPLICITY_AND_COGNITIVE_LOAD_CONSTITUTION.md) · [132 Momentum Protection](./132_EXPERIENCE_PERFECTION_AND_MOMENTUM_PROTECTION_STANDARD.md) · [113 Product Constitution](./113_SPARK_ESTATE_PRODUCT_CONSTITUTION.md) · [Estate Collections Playbook](../estate/ESTATE_COLLECTIONS_PLAYBOOK.md) · [295 Shared Object Library](../create-experience/standards/295_MASTER_SHARED_OBJECT_LIBRARY_STANDARD.md) · [The Member Wins™](../THE_MEMBER_WINS.md)

> **Conflict rule:** Spec **128** wins on complexity, architecture exposure, and ADHD/simplicity certification. Spec **132** wins on momentum, intentional navigation, truthfulness, and the Ten-Second Rule. Spec **130** One Creation Rule™ still wins — never silently create Work. This Standard (**133**) governs how multi-record libraries and collections present items and expose actions on cards and list rows.

---

## Mission

Every Spark Estate experience that displays **multiple user-owned records** must feel like one coherent library — calm, truthful, and action-ready — not a different interaction language per room.

Members should recognize a record, know what it is, and act on it **without being forced to open it** when the action does not require the interior.

---

## Scope

Applies to **every** Spark Estate experience that displays multiple user-owned records, including (not limited to):

- Create  
- Projects  
- Journal  
- Evidence Vault  
- Spark Cards  
- Business Estate  
- Marketing  
- Founder Workspace  
- Learning  
- Documents  
- Conversations  
- Future Chamber libraries  

Also applies to any future gallery, shelf, vault, inbox, archive, or browse surface that lists member-owned work.

### Out of scope (sibling law)

| Sibling | Owns |
|---------|------|
| [Estate Collections Playbook](../estate/ESTATE_COLLECTIONS_PLAYBOOK.md) | *Where* meaning belongs emotionally across rooms |
| [295 Shared Object Library](../create-experience/standards/295_MASTER_SHARED_OBJECT_LIBRARY_STANDARD.md) | Canonical object identity and lifecycle in data |
| Chamber / knowledge library standards | Intelligence content packages — not member record UIs |

**133** owns the **member-facing library/collection interaction pattern** for user-owned records.

---

## Constitutional Principle

**If a member can reasonably perform an action without opening an item, they must be able to do so from the item’s card or list row.**

Opening an item is for reading, deep editing, or multi-step interior work — not for unlocking common lifecycle actions.

---

## Core Rules (1–12)

### 1. Card / Row Action Parity

Every common action that does not require the item’s interior must be available from the card or list row.

Examples of actions that usually belong on the card/row:

- Continue / Resume / Open (primary)  
- Rename  
- Favorite / pin (when the surface uses them)  
- Archive / restore  
- Duplicate (when safe and meaningful)  
- Move / file into a collection (when the surface supports it)  
- Export / download / print (when the artifact supports it)  
- Delete (always with confirmation)  
- Mark complete / status change (when status is a first-class field)

If the only path is “open → find overflow → act,” the library fails this Standard.

### 2. Opening Is for Interior Work

Require opening only when the member needs:

- the full content  
- a multi-field editor  
- a conversation attached to the item  
- a guided interior flow  

Do not require opening to discover whether an action exists.

### 3. One Primary Action Per Card

Each card or row has **one** obvious primary action — usually Continue / Open / Resume.

Secondary actions use progressive disclosure (overflow / “More”) so the surface does not become a toolbar dashboard.

Align with Universal Experience: **max 3 visible choices** before disclosure (T-003 / Spec 103).

### 4. Honest Identity on the Card

Without opening, the member must be able to answer:

- What is this?  
- Why does it matter / what is it about?  
- What is its status?  
- What happens if I continue?

Show human-readable titles, calm status, and a short preview or purpose line — never raw IDs, enums, or architecture labels (**128**).

### 5. Counts and Labels Tell the Truth

Library counts, filters, section labels, and “Current” / “Active” badges must match reality (**132** interface truthfulness).

No “3 items” when 4 are listed. No hidden archived items inside an Active count.

### 6. Empty, Loading, and Error Are First-Class

Every library must resolve:

- **Loading** → ready, empty, or error (never permanent loading)  
- **Empty** → calm next step (create, capture, or return) — not a blank void  
- **Error** → recoverable hospitality language — never system internals  

### 7. Search, Filter, and Sort Protect Momentum

Changing view controls must not wipe in-progress selection without cause, and must not force a full mental restart.

Prefer:

- sticky filters while browsing  
- clear “showing X of Y” when filtered  
- easy clear-filters  

### 8. Destructive Actions Stay Calm and Confirmed

Delete, permanent erase, and irreversible archive require an intentional confirm.

Confirm copy passes the Shari test — never “Error” / “Failed” / software guilt.

### 9. Connection-Gated Actions Stay Honest

If an action needs a connection (Google, Outlook, Canva, etc.):

- the control may appear when the destination is compatible with the artifact  
- state must read as **available but connection required** — not a silent no-op  
- incompatible destinations must **not** appear merely because a service is connected  

(See Destination Gallery / artifact destination capabilities for export crystals; the same honesty applies to library row actions.)

### 10. Same Pattern Everywhere

Create, Projects, Journal, Vault, Cards, Founder, and future Chamber libraries must share the same mental model:

- card/row = recognition + common actions  
- open = interior  
- overflow = secondary  

Local flavor (estate scene, typography, object metaphors) is welcome. A new interaction grammar per room is not.

### 11. ADHD / Executive Function First

Libraries must reduce:

- memory load (show status and next step on the card)  
- initiation friction (Continue is obvious)  
- hunting (don’t bury rename/archive inside the item)  

Prefer recognition over recall. Prefer one clear Continue over five equal buttons.

### 12. Estate Language, Not File-Manager Language

Member-facing copy uses places, work, and hospitality — not “records,” “entities,” “dataset,” or OS file-manager jargon unless the member is explicitly in a document/export context.

---

## Card / Row Minimum Content

Every library item presentation should include, when applicable:

| Element | Required |
|---------|----------|
| Human title | Yes |
| Short preview or purpose | Yes (or honest empty) |
| Status / freshness | When the surface has status |
| Primary action | Yes |
| Secondary actions path | Yes (overflow acceptable) |
| Owner/context cue | When multi-context lists exist |

Optional: thumbnail, collection color, quiet favorite mark — never a KPI strip on every card.

---

## Action Placement Guide

| Action type | Default placement |
|-------------|-------------------|
| Continue / Open / Resume | Primary on card/row |
| Rename, favorite, archive, duplicate, move | Card/row (overflow OK) |
| Export / print / download (compatible) | Card/row when no interior judgment needed |
| Edit full body / multi-section work | Interior (open) |
| Guided conversation about the item | Interior or companion — not forced before row actions |
| Delete | Card/row + confirm |

When unsure: **if a thoughtful friend could do it from a stack of index cards on a table, it belongs on the card.**

---

## Certification Gate (all must pass)

Before shipping or materially changing a multi-record library:

- [ ] Common actions are available from card/row without opening?  
- [ ] One primary action is obvious within ten seconds (**132**)?  
- [ ] Secondary actions disclosed without a button farm?  
- [ ] Title + preview + status answer “what is this?” without opening?  
- [ ] Counts / filters / labels truthful?  
- [ ] Loading / empty / error all resolve calmly?  
- [ ] Destructive actions confirmed with hospitality language?  
- [ ] Incompatible / connection-gated actions honest — no silent no-op?  
- [ ] Pattern matches other Estate libraries (not a one-off grammar)?  
- [ ] Passes **128** ADHD / simplicity audit?  

Any **no** → not ready.

---

## Order of authority

When this Standard conflicts with feature convenience:

1. User trust and safety  
2. **113 Product Constitution**  
3. **128** on mental load / architecture exposure / ADHD gates  
4. **130** One Creation Rule™  
5. **131** on Create intent understanding  
6. **132** on momentum, intentional navigation, truthfulness, Ten-Second Rule  
7. **This Standard (133)** on library/collection card-row interaction  
8. Implementation convenience  

---

## Relationship to sibling law

| Document | Relationship |
|----------|----------------|
| [128 Simplicity](./128_SPARK_ESTATE_SIMPLICITY_AND_COGNITIVE_LOAD_CONSTITUTION.md) | Wins on complexity; 133 applies that calm to lists |
| [132 Momentum](./132_EXPERIENCE_PERFECTION_AND_MOMENTUM_PROTECTION_STANDARD.md) | Wins on surprise / Ten-Second Rule; 133 removes open-to-act friction |
| [295 Object Library](../create-experience/standards/295_MASTER_SHARED_OBJECT_LIBRARY_STANDARD.md) | Shared data objects; 133 is the browse/act UX law |
| [Estate Collections Playbook](../estate/ESTATE_COLLECTIONS_PLAYBOOK.md) | Emotional placement of meaning; 133 is list interaction |

---

**Status:** Permanent v1.0 — binding
