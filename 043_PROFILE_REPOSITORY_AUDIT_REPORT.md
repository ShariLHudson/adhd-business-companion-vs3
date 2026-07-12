# 043 — Profile / My Business Estate™ Repository Audit Report

**Repository:** `spark-ecosystem-v4/companion-app`  
**Branch:** `deploy/companion-app-v3`  
**Audit date:** 2026-07-11  
**Packet source:** `PROFILE_MY_BUSINESS_ESTATE_IMPLEMENTATION_PACKET.zip` (docs 005–014)  
**Scope:** Read-only audit — no code changes in this cycle

---

## 1. Executive Summary

The approved Profile center is **My Business Estate™**. The runtime app does **not** implement that experience today.

| Approved destination | Runtime status |
|---|---|
| **My Business Estate™** | **Missing.** Profile menu opens **"My Estate"** — a chat-only `SparkEstateShell` with no business read view. |
| **People I Help™** | **Missing.** Closest stand-in: workspace section `client-avatars` labeled **"Audience Profile"** (`IdealClientBuilder`). |
| **Evidence Vault™** | **Live** — `EvidenceVaultRoomPanel` + `evidence-bank` section. |
| **Journal Gazebo™** | **Live** — `GrowthJournalRoomPanel` → `JournalGazeboExperience`. |
| **Portfolio** | **Live** as **"Hall of Accomplishments"** — `GrowthPortfolioPanel`. |
| **Preferences & Settings** | **Live** — `SettingsPanel` via `overlay === "settings"`. |

**Growth Profile** is a separate, Institute-centric room (`GrowthProfileRoomPanel`). It is hidden from the visible profile dropdown but still reachable via the Experience Test Launcher, programmatic menu IDs, and estate intelligence phrases. It must **not** become the default Profile destination.

**Central orchestration** lives in `app/companion/CompanionPageClient.tsx` (~22k lines). Profile-estate room IDs are registered in `lib/growth/profileEstateRooms.ts`. Shell-vs-panel guards were improved in commit `e2bdb16` (`lib/estate/estateShellRouting.ts`) for Growth Profile, Evidence Vault, and Journal Gazebo — but **My Estate still uses shell-only with no dedicated panel**.

**Data** is almost entirely client-side (`localStorage`). No Supabase profile tables exist. Business identity is fragmented across `companionStore`, phase onboarding, intelligence layer, and `sparkEstateMemberProfileEngine` without unified writes.

**Smallest safe next step (Cycle 1):** Introduce a centralized `ProfileDestination` resolver (default `my-business-estate`), wire Profile menu to that landing, stop accidental Growth Profile defaulting, ensure one panel mounts at a time, preserve conversation — **without** full editing UI or Journal Gazebo button fixes.

---

## 2. Current Profile Entry Points

### A. Global profile initials menu

| Item | File | Action | Result |
|---|---|---|---|
| Profile trigger | `components/companion/GlobalEstateMenu.tsx` | `my-profile` | `openProfileEstateRoomFromMenu("my-estate")` |
| Settings | same | `settings` | `overlay === "settings"` → `SettingsPanel` |
| Logout | same | `log-out` | Sign out |

Wired via `EstateTopRightChrome` in `CompanionPageClient.tsx` (~L22028).  
Menu config: `lib/estateMenu/menuConfig.ts` — visible order: Conversations → Settings → **Profile** → Logout.

**Hidden but routable menu IDs:** `growth-profile`, `estate-profile`, `progress-timeline`, `evidence-vault`, `portfolio`, `journal` (`profileEstateRooms.ts`).

### B. Room experience menu (upper-right, in-room)

`components/companion/estate/EstateRoomExperienceMenu.tsx` — Evidence Vault, Hall of Accomplishments, Journal Gazebo, Chamber of Momentum.  
Wired from `CompanionPageClient.tsx` (~L22047–L22054).

### C. Experience Test Launcher

`components/companion/CompanionPreviewTestPanel.tsx` — armed by `?previewTest=1`.  
Buttons: My Estate, **Growth Profile**, Evidence Vault, Journal Gazebo, Portfolio → `openProfileEstateRoomFromMenu`.

### D. URL / deep links

`components/companion/CompanionUrlNavigation.tsx`:

| Param | Effect |
|---|---|
| `?overlay=profile` | `setOverlay("profile")` → **My Estate shell** (not `ProfilePanel`) |
| `?overlay=settings` | Settings modal |
| `?section=growth-journal` etc. | `openGrowthDestinationCore` |

Helpers: `lib/companionNavUrl.ts`.

### E. Sidebar / homestead nav

`CompanionPageClient.tsx` `handleNav` (~L8610): `journal`, `portfolio`, `evidence-bank`, `settings`.

### F. Chat / intelligence routing

| Trigger | Opens |
|---|---|
| Explicit "my estate" | `my-estate` (`lib/estate/estateRoomRouting.ts`) |
| Low business-confidence gate | `business-profile` or `client-avatars` via `BusinessConfidenceOfferCard` |
| Evidence capture / win save | Evidence Vault or Portfolio |
| Breathe → journal | Journal Gazebo |
| Conversation workflow | `client-avatars`, `business-profile` |

### G. Core routing function

`openProfileEstateRoomFromMenu` in `CompanionPageClient.tsx` (~L8724):

- `growth-profile` → `setOverlay("growth-profile")`
- `my-estate` → `setOverlay("profile")`
- `evidence-vault` → `enterEvidenceVaultRoomCore`
- `portfolio` → `openGrowthDestinationCore("growth-portfolio")`
- `journal` → direct estate visit + `growth-journal` section

Overlay mapping (~L2992): `overlay === "profile"` → `profileEstateRoomOverlayId = "my-estate"`.

---

## 3. Current Components

| File | Export | User label | Purpose | Data source | Activation | Used? |
|---|---|---|---|---|---|---|
| `GlobalEstateMenu.tsx` | `GlobalEstateMenu` | Profile (initials) | Profile dropdown | `getPrefs`, auth | `showGlobalEstateMenu` | Yes |
| `estate/SparkEstateShell.tsx` | `SparkEstateShell` | Place title from registry | Full-bleed scene + chat | estate shell state | `resolveSparkEstateShellPlaceId` | Yes — **My Estate UI today** |
| `GrowthProfileRoomPanel.tsx` | `GrowthProfileRoomPanel` | Growth Profile | Greenhouse + competencies | `growthProfileStore` | `overlay === "growth-profile"` | Yes — legacy |
| `GrowthProfilePanel.tsx` | `GrowthProfilePanel` | — | Timeline + competencies | `companion-institute-growth-profile-v1` | Inside room panel | Yes |
| `BusinessProfilePanel.tsx` | `BusinessProfilePanel` | Step wizard (no ™ title) | 7-step business onboarding | `companion-business-profile-v1` | `activeSection === "business-profile"` | Yes |
| `ProfilePanel.tsx` | `ProfilePanel` | Profile | Hub: prefs, business links, GTKY | `getPrefs` | Was modal overlay | **No — zero imports** |
| `ProfileEstateRoomExperience.tsx` | `ProfileEstateRoomExperience` | — | Deprecated shell delegate | — | — | **No — orphaned** |
| `SettingsPanel.tsx` | `SettingsPanel` | Settings | Tone, plan, reminders | `companion-prefs-v1` | `overlay === "settings"` | Yes |
| `GrowthJournalRoomPanel.tsx` | `GrowthJournalRoomPanel` | Journal Gazebo | Immersive journal | journal gazebo stores | `growth-journal` section | Yes |
| `estate-collection/EvidenceVaultRoomPanel.tsx` | `EvidenceVaultRoomPanel` | Evidence Vault | Vault ritual + files | `companion-evidence-bank-v1` | `evidence-bank` section | Yes |
| `GrowthPortfolioPanel.tsx` | `GrowthPortfolioPanel` | Hall of Accomplishments | Portfolio CRUD | `companion-growth-portfolio-v1` | `growth-portfolio` section | Yes |
| `IdealClientBuilder.tsx` | `IdealClientBuilder` | Audience Profile | Avatar / ICP builder | `companion-ideal-clients-v1` | `client-avatars` section | Yes — **People I Help stand-in** |
| `GettingToKnowYouPanel.tsx` | `GettingToKnowYouPanel` | Getting to know you | Phase discovery review | phase 1–2 stores | Inside `ProfilePanel` only | Indirectly orphaned |
| `CompanionPreviewTestPanel.tsx` | `CompanionPreviewTestPanel` | Experience test launcher | Dev routing | session | `previewTest=1` | Preview only |
| `HomeContinuityStack.tsx` | `HomeContinuityStack` | — | Home continuity CTA | — | — | **No — zero imports** |

**Duplication notes:**

- `ProfilePanel` duplicates hub intent spec'd for My Business Estate™ but is not mounted.
- `BusinessProfilePanel` is a separate wizard, not nested under Profile.
- Growth Profile ≠ business profile — different data (`growthProfileStore` vs `companionStore`).

---

## 4. Current Data Sources

### Persisted (localStorage unless noted)

| Key | Owner | Contents |
|---|---|---|
| `companion-prefs-v1` | `lib/companionStore.ts` | Name, email, portrait, tone, onboarding flags, `activeAvatarId` |
| `companion-business-profile-v1` | `lib/companionStore.ts` | Role, goals, sells, idealClient, traits, tone |
| `companion-ideal-clients-v1` | `lib/companionStore.ts` | `IdealClientAvatar[]` (audience) |
| `spark-estate-member-profile-v1` | `lib/estate/sparkEstateMemberProfileEngine.ts` | 7-layer estate personalization |
| `companion-evidence-bank-v1` | `lib/evidenceBankStore.ts` | Evidence entries |
| `companion-growth-portfolio-v1` | `lib/growthPortfolioStore.ts` | Portfolio / Hall entries |
| `companion-institute-growth-profile-v1` | `lib/momentumInstitute/growthProfileStore.ts` | Institute competencies (Growth Profile room) |
| `companion-growth-journal-v1` | `lib/growthJournalStore.ts` | Journal entries (gazebo presentation layer) |
| Phase 1/2/4 keys | `lib/phase1Onboarding.ts`, etc. | Progressive discovery |
| `companion-intelligence-profile-v1` | `lib/intelligence-layer/profileStore.ts` | Trait maps |

### Supabase

- Auth session only (`companion-supabase-auth`).
- Language prefs in user metadata (`lib/companionUserLanguage.ts`).
- **No profile / business / portfolio / evidence tables implemented.**

### Reuse for My Business Estate™ read view (Cycle 2)

- **Business snapshot:** `getBusinessProfile()`, `businessContextSummary()`
- **Identity:** `getPrefs()`, `userProfileDisplay`
- **Audience summary:** `getPrimaryAvatar()`, `getAvatars()`
- **Goals / learned context:** `buildWhatIveLearnedProfile()`, `getSparkEstateMemberProfile()`
- **Evidence / portfolio counts:** `evidenceBankStore`, `growthPortfolioStore` dashboard helpers

### Conflicts

- Business identity written in 5+ places without sync (`BusinessProfile`, phase stores, intelligence layer, estate member profile, in-memory core memory).
- `sparkEstateMemberProfileEngine` does not read `getPrefs()` / `getBusinessProfile()` on compose.
- "People I help" in `canonicalEstatePlaces.ts` aliases to **Evidence Vault**, not audience avatars.

---

## 5. Growth Profile Findings

**Defined in:**

- `lib/growth/profileEstateRooms.ts` — ID `growth-profile`
- `lib/estate/estateRoomRegistry.ts` — room metadata
- `components/companion/GrowthProfileRoomPanel.tsx` + `GrowthProfilePanel.tsx`
- `lib/momentumInstitute/growthProfileStore.ts`

**Opened via:**

1. `setOverlay("growth-profile")` from `openProfileEstateRoomFromMenu`
2. Experience Test Launcher **Growth Profile** button
3. Menu actions `growth-profile`, `progress-timeline` (not in visible dropdown)
4. Estate intelligence phrases
5. Place cards inside Growth Profile → portfolio / evidence vault

**Shows:** Institute competencies, learning timeline, links to Hall and Vault — **not** business identity or People I Help.

**Dependencies:** Momentum Institute learning flows write timeline; stables save paths read store.

**Retire / adapt:**

- Already excluded from visible profile dropdown (tests in `welcomeHomeMenuVerification.test.ts`, `estateMenu.test.ts`).
- **Cannot retire entirely** without Institute regression — keep as internal room.
- **Must not** remain default Profile path; test launcher still exposes it prominently.
- Renaming to My Business Estate™ would be **incorrect** — different product concept.

---

## 6. My Business Estate™ Findings

**Spec / packet:** `.tmp-profile-estate-packet/005_*`, `007_*`, `010_*` — full IA, screen spec, routing spec. **Not in runtime.**

**Runtime naming:** **"My Estate"** everywhere (`estateRoomRegistry`, `CompanionPreviewTestPanel`, arrival copy). Trademark **My Business Estate™** never appears in UI (`002_VISIBLE_EXPERIENCE_IMPLEMENTATION_AUDIT.md` notes this).

**Room ID:** `my-estate` in `PROFILE_ESTATE_ROOM_IDS`.

**Mount behavior:** `profileEstateRoomUsesDedicatedPanel("my-estate") === false` → **`SparkEstateShell` only** (`estateShellRouting.ts`). No invitation grid (`estateRoomInvitationCatalog` has no `my-estate` entry). User gets background + chat — no business fields, no destination hub.

**Related but separate:**

- `BusinessProfilePanel` — wizard at `business-profile` section
- `ProfilePanel` — orphaned hub with business/audience links
- `sparkEstateMemberProfileEngine.ts` — backend intelligence, not wired to My Estate UI

**Proposed resolver from spec (`010_*`):** `resolveProfileDestination()` defaulting to `"my-business-estate"` — **not implemented**.

---

## 7. Destination-by-Destination Status

| Destination | Label in UI | Route / mount | Data | Implementation gap |
|---|---|---|---|---|
| My Business Estate™ | "My Estate" | `overlay=profile` → shell | Fragmented across stores | **No read view, no hub, wrong name** |
| People I Help™ | "Audience Profile" | `client-avatars` section | `IdealClientAvatar[]` | Wrong label; not in Profile menu |
| Evidence Vault™ | Evidence Vault | `evidence-bank` / `evidence-vault` | `evidenceBankStore` | **Live** — connect from Profile hub in Cycle 5 |
| Journal Gazebo™ | Journal Gazebo | `growth-journal` | journal gazebo + growth journal stores | **Live** — button click issue deferred |
| Portfolio | Hall of Accomplishments | `growth-portfolio` | `growthPortfolioStore` | **Live** — label ≠ Portfolio |
| Preferences & Settings | Settings | `overlay=settings` | `companion-prefs-v1` | **Live** |
| Saved Spark Cards | — | — | — | **Not found** |
| Business Documents | — | — | — | **Not found** |
| Integrations | — | — | — | **Not found** |
| Account & Subscription | Partial in Settings | settings plan section | prefs | Partial |
| Accessibility | — | — | — | **Not found** |
| Growth Profile (legacy) | Growth Profile | `overlay=growth-profile` | institute store | **Live but not approved Profile** |

---

## 8. Routing Conflicts

### Resolved (041 / `e2bdb16`)

| Room | Fix |
|---|---|
| Growth Profile | Dedicated `GrowthProfileRoomPanel` only — no dual `SparkEstateShell` |
| Evidence Vault | Dedicated `EvidenceVaultRoomPanel` only |
| Journal Gazebo | Dedicated `GrowthJournalRoomPanel` only + guide-beside guard |

### Remaining

| Issue | Severity | Detail |
|---|---|---|
| Profile opens shell, not business home | **High** | `?overlay=profile` and Profile menu → chat-only My Estate |
| Growth Profile reachable from test launcher | **Medium** | Looks like Profile to founders testing |
| `ProfilePanel` orphaned | **Medium** | Implemented hub never mounted |
| Label mismatch | **Medium** | My Estate / Audience Profile / Hall vs approved ™ names |
| `BusinessProfilePanel.onOpenAvatars` dead | **Medium** | Prop exists; `CompanionPageClient` never passes handler |
| Portfolio dual-mount risk | **Low** | Guarded by `!profileEstateRoomOverlayId` |
| Stale CSS | **Low** | `companion-growth-profile-root` applied to all profile estate chrome |

---

## 9. Duplicate or Legacy Code

| Artifact | Status | Recommendation |
|---|---|---|
| `ProfilePanel.tsx` | Orphaned | Remount as My Business Estate hub **or** fold into new panel — do not maintain two hubs |
| `ProfileEstateRoomExperience.tsx` | Deprecated | Remove in later cleanup cycle |
| `HomeContinuityStack.tsx` | Orphaned | Delete or wire in Cycle 2 |
| Growth Profile room | Legacy but active | Keep for Institute; gate from Profile default |
| `business-profile` wizard vs My Estate | Parallel | Nest wizard behind My Business Estate sections in Cycle 3 |
| Multiple business identity stores | Architectural debt | Read adapters in Cycle 2; unified write path in Cycle 3+ |

---

## 10. Reusable Assets and Components

| Asset | Path | Reuse for |
|---|---|---|
| Profile estate registry | `lib/growth/profileEstateRooms.ts` | Extend with `ProfileDestination` keys |
| Shell routing guard | `lib/estate/estateShellRouting.ts` | Pattern for `my-estate` dedicated panel |
| Estate room backgrounds | `lib/growth/growthRoom.ts` | My Estate plate already exists |
| `ProfilePanel` layout patterns | `components/companion/ProfilePanel.tsx` | Section cards, prefs links |
| `BusinessProfilePanel` steps | `components/companion/BusinessProfilePanel.tsx` | Business Identity / Direction editing |
| `IdealClientBuilder` | `components/companion/IdealClientBuilder.tsx` | People I Help™ Cycle 4 |
| Evidence / Portfolio panels | existing room panels | Cycle 5–6 connections |
| `SettingsPanel` | `components/companion/SettingsPanel.tsx` | Preferences & Settings |
| Packet screen spec | `.tmp-profile-estate-packet/007_*` | Cycle 2 layout |
| Prior routing tests | `lib/estate/estateShellRouting.test.ts` | Extend for Profile resolver |

---

## 11. Data Migration Risks

| Risk | Mitigation |
|---|---|
| Renaming `my-estate` → `my-business-estate` breaks bookmarks | Keep `my-estate` as internal alias; change labels only in Cycle 1 |
| Split business fields across stores | Cycle 2 read-only adapters; no migration until Cycle 3 writes |
| `ProfilePanel` remount shows stale prefs | Use existing `getPrefs()` / event buses |
| Supabase profile tables spec'd but absent | Do not add tables in Cycle 1 — localStorage only |
| Growth Profile timeline conflated with business progress | Keep stores separate; link from My Business Estate cards only |
| Journal gazebo local state | Do not touch in Profile cycles per handoff |

---

## 12. Smallest Implementation Plan

### Cycle 1 — Profile routing foundation (next code cycle)

1. Add `lib/profile/profileDestination.ts` (or extend `profileEstateRooms.ts`):
   - `ProfileDestination` union per spec `010_*`
   - `resolveProfileDestination(dest?)` → default `"my-business-estate"`
   - Map destinations → existing sections/overlays/panels
2. Add `MyBusinessEstatePanel` (minimal landing):
   - Read-only placeholder sections per `007_*` **or** thin wrapper remounting `ProfilePanel` sections
   - Approved fallback copy for unimplemented sub-destinations
   - Links to live destinations (Vault, Journal, Portfolio, Settings)
3. Register `my-estate` as **dedicated panel** in `profileEstateRoomUsesDedicatedPanel` / `estateShellRouting.ts`.
4. Update `openProfileEstateRoomFromMenu("my-estate")` to mount `MyBusinessEstatePanel` instead of shell-only chat.
5. Update `GlobalEstateMenu` / test launcher labels: **My Business Estate™** (display only).
6. Ensure Growth Profile requires explicit action — not default from Profile.
7. Wire `BusinessProfilePanel` `onOpenAvatars` → `client-avatars` (small fix, unblocks People I Help path).
8. Tests: resolver unit tests + routing tests from `013_*` checklist (menu, launcher, back, one panel).

**Explicitly excluded from Cycle 1:** Journal button fixes, full read view polish, editing, Supabase, auth changes.

### Cycles 2–8

Per packet `012_*` and handoff `014_*` (read view → editing → People I Help → Vault → Portfolio → Settings → Journal return).

---

## 13. Exact Files Proposed for Change (Cycle 1 only)

| File | Change |
|---|---|
| `lib/profile/profileDestination.ts` | **New** — destination types + resolver |
| `lib/growth/profileEstateRooms.ts` | Map `my-business-estate` ↔ `my-estate`; export helpers |
| `lib/estate/estateShellRouting.ts` | `my-estate` uses dedicated panel |
| `lib/estate/estateShellRouting.test.ts` | Assert shell suppressed for My Business Estate |
| `components/companion/MyBusinessEstatePanel.tsx` | **New** — landing / fallback hub |
| `app/companion/CompanionPageClient.tsx` | Wire resolver, mount panel, `onOpenAvatars`, menu handlers |
| `lib/estateMenu/menuConfig.ts` | Display label My Business Estate™ |
| `components/companion/CompanionPreviewTestPanel.tsx` | Rename My Estate button; optional destination list alignment |
| `components/companion/GlobalEstateMenu.tsx` | Destination submenu (if Cycle 1 includes nav — spec `006_*`) |
| `lib/estate/estateRoomRegistry.ts` | Display name update |
| `lib/estateMenu/experienceTestLauncherRouting.test.ts` | Profile default tests |

---

## 14. Files That Must Not Be Touched (Cycle 1)

Per handoff `014_*` guardrails:

| Area | Reason |
|---|---|
| `components/journal-gazebo/**` | Journal button work deferred |
| `lib/journalGazebo/**` | Same |
| Growth Profile competency logic | Institute regression risk |
| `lib/supabase/**`, auth flows | Not required for routing |
| Welcome Home, Discovery Key, Chamber, Cartographers | Unrelated estate rooms |
| `public/backgrounds/**` | Unrelated assets |
| Intelligence / chamber documents in `docs/` | Not implementation |
| `main` branch | No production merge before founder review |

---

## 15. Open Questions That Block Implementation

1. **Cycle 1 landing depth:** Minimal placeholder with destination cards vs remounting existing `ProfilePanel` content as My Business Estate™?
2. **Profile submenu in Cycle 1:** Should the initials dropdown list all six approved destinations immediately, or only open My Business Estate™ with in-panel navigation?
3. **Growth Profile test launcher:** Hide, rename to "Institute Progress," or keep for dev only?
4. **`my-estate` room ID:** Rename internally to `my-business-estate` or label-only change?
5. **Chat in My Business Estate:** Keep center chat on landing, or read-only hub without chat until user asks Shari?
6. **People I Help routing:** Open `client-avatars` as-is in Cycle 1 fallback, or wait for Cycle 4 label + UX pass?
7. **Business Documents / Saved Spark Cards:** Include as "coming soon" cards on landing, or omit until features exist?
8. **Founder review gate:** Confirm Cycle 1 preview on `deploy/companion-app-v3` before any Cycle 2 read view work.

---

## Appendix — Key file index

```
app/companion/CompanionPageClient.tsx
lib/growth/profileEstateRooms.ts
lib/estate/estateShellRouting.ts
lib/estateMenu/menuConfig.ts
components/companion/GlobalEstateMenu.tsx
components/companion/ProfilePanel.tsx          (orphaned)
components/companion/BusinessProfilePanel.tsx
components/companion/GrowthProfileRoomPanel.tsx
components/companion/estate/SparkEstateShell.tsx
components/companion/CompanionPreviewTestPanel.tsx
components/companion/CompanionUrlNavigation.tsx
lib/companionStore.ts
lib/estate/sparkEstateMemberProfileEngine.ts
.tmp-profile-estate-packet/                    (spec packet — not runtime)
041_EXPERIENCE_TEST_LAUNCHER_ROUTING_FIX_REPORT.md
002_VISIBLE_EXPERIENCE_IMPLEMENTATION_AUDIT.md
```

---

*End of audit. Awaiting founder review before Cycle 1 implementation.*
