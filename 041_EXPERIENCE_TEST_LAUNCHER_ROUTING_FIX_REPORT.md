# 041 — Experience Test Launcher Routing Fix Report

**Date:** 2026-07-11  
**Branch:** `deploy/companion-app-v3`  
**Commit:** `e2bdb16` — `fix: route launcher to dedicated estate room panels`  
**Preview URL:** https://adhd-business-companion-vs3-2ya5fforz-shari-hudsons-projects.vercel.app  
**Harness activation:** `/companion/login?previewTest=1`

---

## Summary

Minimal routing correction for the three ❌ Experience Test Launcher audit items. Dedicated estate room panels now mount alone; `SparkEstateShell` no longer dual-stacks on Growth Profile, Evidence Vault, or Journal Gazebo.

---

## Files changed

| File | Change |
|------|--------|
| `lib/estate/estateShellRouting.ts` | **New** — `profileEstateRoomUsesDedicatedPanel()`, `resolveSparkEstateShellPlaceId()` |
| `lib/estate/estateShellRouting.test.ts` | **New** — unit tests for shell routing |
| `lib/estateMenu/experienceTestLauncherRouting.test.ts` | **New** — CPC source contract tests |
| `app/companion/CompanionPageClient.tsx` | Import routing helper; mount `GrowthProfileRoomPanel` when `growthProfilePrimary` |

---

## Render condition change

### Before

```typescript
const sparkEstateShellPlaceId = clearMyMindWorkspaceActive
  ? null
  : profileEstateRoomOverlayId ??
    (showDirectEstateOverlay && !estateConservatoryEngaged
      ? estateChatRoomId
      : null);
```

- `profileEstateRoomOverlayId` included `"growth-profile"` → shell mounted for Growth Profile.
- `showDirectEstateOverlay` could be true on `growth-journal` / `evidence-bank` while dedicated panels also rendered → dual stack.

### After

```typescript
const sparkEstateShellPlaceId = resolveSparkEstateShellPlaceId({
  clearMyMindWorkspaceActive,
  profileEstateRoomOverlayId,
  showDirectEstateOverlay,
  estateConservatoryEngaged,
  estateChatRoomId,
  activeSection,
});
```

`resolveSparkEstateShellPlaceId` returns `null` when:

1. `clearMyMindWorkspaceActive` is true, or
2. `activeSection` is in `DEDICATED_ESTATE_ROOM_PANEL_SECTIONS`, or
3. `profileEstateRoomOverlayId` uses a dedicated panel (`growth-profile`, `journal`, `evidence-vault`, etc.)

Growth Profile overlay now renders:

```tsx
growthProfilePrimary ? (
  <main className="estate-room-main">
    <GrowthProfileRoomPanel
      emphasizeTimeline={growthProfileEmphasizeTimeline}
      onOpenEstatePlace={handleEstateMenuAction}
    />
  </main>
) : null
```

Journal and Evidence Vault continue to render their existing dedicated panels behind `activeSection` + `!showDirectEstateOverlay` guards; the shell helper prevents the competing `SparkEstateShell` layer.

---

## Before / after component mapping

| Launcher | Before | After |
|----------|--------|-------|
| Growth Profile | `SparkEstateShell` (chat-only) | `GrowthProfileRoomPanel` only |
| Evidence Vault | `SparkEstateShell` + `EvidenceVaultRoomPanel` | `EvidenceVaultRoomPanel` only |
| Journal Gazebo | `SparkEstateShell` + `GrowthJournalRoomPanel` | `GrowthJournalRoomPanel` only |
| Welcome Home | `WelcomeHomePage` | unchanged ✅ |
| Discovery Key | `DiscoveryKeyHost` + `SparkEstateShell` | unchanged ✅ |
| Shari arrival | `EstateArrivalHost` + `SparkEstateShell` | unchanged ✅ |
| Portfolio | `GrowthPortfolioPanel` | unchanged ✅ |
| My Estate | `SparkEstateShell` | unchanged ⚠️ (chat-only; not in scope) |

---

## Dual-stack confirmation

| Section / overlay | `SparkEstateShell` | Dedicated panel |
|-------------------|-------------------|-----------------|
| `growth-profile` overlay | ❌ not mounted | ✅ `GrowthProfileRoomPanel` |
| `evidence-bank` section | ❌ not mounted | ✅ `EvidenceVaultRoomPanel` |
| `growth-journal` section | ❌ not mounted | ✅ `GrowthJournalRoomPanel` |
| `stables` | ❌ not mounted | ✅ `StablesRoomPanel` (unchanged) |
| `momentum-institute` | ❌ not mounted | ✅ `MomentumInstituteRoomPanel` (unchanged) |
| `momentum-builder` | ❌ not mounted | ✅ `MomentumBuilderRoomPanel` (unchanged) |

No dual stack remains for the three fixed launcher paths.

---

## Tests

### New / updated

```
npx vitest run lib/estate/estateShellRouting.test.ts lib/estateMenu/experienceTestLauncherRouting.test.ts
```

- 2 files, 11 tests — **all passed**

### Regression checks

```
npx vitest run lib/companionPreviewTestHarness.test.ts lib/estate/estateShellState.test.ts lib/estateDiscovery/discoveryKeySystem.test.ts lib/welcomeHome/welcomeHome.test.ts
```

- 4 files, 16 tests — **all passed**

### Pre-commit

- `lib/companionBehaviorAudit.test.ts` — 4 tests passed (hook on commit)

---

## Build

```
npm run build
```

- **Passed** — Next.js 16.2.7 production build completed successfully

---

## Remaining ⚠️ launcher paths (out of scope)

| Launcher | Status | Notes |
|----------|--------|-------|
| My Estate | ⚠️ | Still routes to chat-only `SparkEstateShell`; dedicated profile editor exists but was not in Phase 1 scope |
| Discovery Key room shell | ⚠️ | Key ritual ✅; underlying room may still use generic shell where intended |

---

## Deployment

- Pushed to `origin/deploy/companion-app-v3`
- Vercel preview: **Ready** at commit `e2bdb16`
- `main` unchanged — not merged

---

**Stop for review.**
