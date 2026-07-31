# Spark Estate — Regression Audit & Restoration Plan

**Date:** 2026-07-31
**Branch audited:** `audit/beta-experience-readiness` (= `deploy/companion-app-v3` + 15 persistence commits; **0 behind** deploy)
**Status:** AUDIT ONLY — no restoration performed. No Saved Work touched. No persistence domain migrated.

---

## Method & limitations

Evidence sources: git history/forensics on this machine, code presence on the current branch, and the repo's own asset/manifest reports. **What I could not do:** access the live Vercel preview (no preview URL provided, `gh` CLI unavailable, preview URLs in the repo are ephemeral per-deploy hashes behind auth). Every "in the deployed preview?" conclusion below is therefore reasoned from *which branch/commit the preview builds*, with the exact verification step called out. Findings tagged **[VERIFIED]** (git/code proven), **[DOC]** (repo's own audit records), **[NEEDS PREVIEW]** (requires the live preview to confirm).

---

## Headline: there are TWO independent regression pictures

1. **Deployment mismatch (structural, explains a broad "everything is gone").** `main` is **844 commits behind** `deploy/companion-app-v3` and contains **none** of the Estate feature code (5 matching files vs 224 on deploy). The repo already records this: `docs/architecture/MASTER_AUDIT_FINDINGS_MATRIX.md:92` — *"MA-38 | Production branch lags deploy branch by weeks of shipped work | H | deployment."* If the environment the user is calling "the latest preview" builds `main`/production or a stale branch, **all** Estate features (soundscapes, peaceful moments, coffee house, sound controls, estate media, estate navigation) are simply absent from that build. This is the only single cause that explains *all* of them missing at once, because the audio features are provably present on deploy.

2. **On-branch media degradation (present even on the correct branch).** Coffee House and ~24 other rooms render **borrowed placeholder art**, the real committed Coffee House asset is **orphaned**, and the canonical `estate-room-*-main.png` scheme references **0 existing files**. This degradation is on `deploy` itself, so it appears in *any* preview of deploy and will persist after the deployment mismatch is fixed.

**Audio features (soundscapes, peaceful moments, global sound) are fully present, wired, and asset-backed on the deploy/audit branch** — so if they appear missing, that is scenario (1), not code loss.

---

## The decisive diagnostic (run first, before any restoration)

Determine **what the "latest preview" actually builds**:
- Open the preview; check the deployed commit SHA (Vercel deployment page → "Source" / commit, or the app's build stamp) and compare to `deploy/companion-app-v3` HEAD = **`517ed2e2`**.
- In Vercel → Project → Settings → Git, check the **Production Branch** and whether **preview deployments** are enabled for `deploy/companion-app-v3` / `audit/beta-experience-readiness`.
- **If the deployed SHA is on `main` or predates the Estate work → confirmed deployment mismatch (Scenario 1).** Fix that first (restores everything at once).
- **If the deployed SHA is on `deploy`/`audit` → the missing items are Scenario 2 (media placeholders) + perceived-missing audio** (opt-in defaults + chrome visibility gate; see inventory).

---

## 1. Regression inventory

Columns: Expected · Current · In repo? · On current branch? · In preview? · Cause class · Confidence.

### Soundscapes
- **Expected:** Ambient soundscape overlay (14 looping tracks), openable from Audio menu, GlobalSoundControl, and room menu.
- **Current [VERIFIED]:** Fully implemented and wired. `components/companion/estate/SoundscapeSelectionOverlay.tsx`; tracks `lib/soundscapes/soundscapesFolderManifest.ts`; render `app/companion/CompanionPageClient.tsx:28307`; menu `lib/estate/welcomeHomeNavigationStructure.ts:284-289`. All 12 committed assets exist under `public/audio/Soundscapes/`.
- **In repo/on branch:** Yes / Yes. **In preview:** **[NEEDS PREVIEW]** — present if preview builds deploy; absent if preview builds main.
- **Cause (if missing):** deployment mismatch. **Confidence:** High (that code is present); preview state pending.

### Peaceful Moments
- **Expected:** Peaceful Moments room (guided listening, 12 tracks), Audio menu + GlobalSoundControl.
- **Current [VERIFIED]:** Implemented + wired. `components/companion/peacefulPlaces/PeacefulMomentsRoom.tsx` (via `FocusAudioPanel.tsx`), section `focus-audio` render `CompanionPageClient.tsx:27313`; menu `welcomeHomeNavigationStructure.ts:278-283`. All 12 assets exist under `public/audio/peaceful-places/`.
- **In repo/on branch:** Yes / Yes. **In preview:** **[NEEDS PREVIEW]**.
- **Cause (if missing):** deployment mismatch. **Confidence:** High (code present).

### Global sound controls
- **Expected:** Persistent On/Paused/Off transport + Settings audio panel.
- **Current [VERIFIED]:** Present. `components/companion/estate/GlobalSoundControl.tsx` (single canonical mount, `EstateTopRightChrome.tsx:126`); Settings `EstateAudioSettings.tsx` (`SettingsPanel.tsx:721`); state `lib/estate/estateAudioSettings.ts`.
- **Nuances that read as "missing" even when present:** (a) the header control only mounts when the profile menu or a room is active — `EstateTopRightChrome.tsx:121-122`; (b) all sound is **opt-in by default** — `estateAudioSettings.ts:33-40` (`autoplayAllowed:false, ambienceEnabled:false, soundscapeOverlayEnabled:false`), so nothing plays until the member acts.
- **In preview:** **[NEEDS PREVIEW]**. **Cause (if missing):** deployment mismatch; else visibility-gate/opt-in perception. **Confidence:** High.

### Coffee House content & media
- **Expected:** Coffee House room renders its dedicated Version A artwork (`/backgrounds/coffee-house-background.png`, committed 2026-07-11) with working ambience.
- **Current [VERIFIED]:** Renders the **Tea Room** placeholder; real asset **orphaned**. Registries disagree:
  - `lib/estate/estatePlaceMedia.ts:55` → `tea-room-background.webp` (placeholder)
  - `lib/estate/canonicalEstatePlaces.ts:117` → `/backgrounds/room-coffee-house-background.png` (**file does not exist**)
  - `docs/estate/ESTATE_PLACE_MASTER_MANIFEST.json:191` → `tea-room-background.webp`, `status:"Draft"`, `media_ownership:"borrowed_pending_dedicated_asset"`
  - `lib/estateMap/exploreEstateDestinations.ts:124` → `/backgrounds/coffee-house-background.png` (correct; **working-tree only**, uncommitted)
  - Audio is healthy: `lib/estate/estatePlaceAmbientSound.ts:74` → `/audio/peaceful-places/java-seranade-coffee-house.mp3` (exists).
- **In repo/on branch:** Asset yes / registries mis-pointed yes. **In preview:** degraded (placeholder) in **any** deploy preview.
- **Cause:** **incorrect media path** + **placeholder fallback** + **asset/registry omission** (re-point never approved/committed). **Confidence:** High.

### Estate room media (broad)
- **Expected:** Rooms render dedicated art.
- **Current [VERIFIED/DOC]:** ~24 rooms flagged `borrowed_pending_dedicated_asset` and 4 `missing_dedicated_asset` in `docs/estate/ESTATE_PLACE_MISSING_ASSET_REPORT.md`; the canonical `estate-room-*-main.png` targets reference **0 files on disk** (scheme is aspirational). Rooms render via borrowed legacy plates or graceful "Image being prepared" placeholders (`EstateMapFullScreen.tsx:84-91`).
- **Cause:** **asset/manifest omission** (dedicated assets never created) + the coffee rename regression. **Confidence:** High.

### Estate navigation
- **Expected:** Room menu + estate map reach all accepted rooms.
- **Current [VERIFIED]:** **Not regressed on this branch** — Audio/Peaceful/Soundscapes menu entries present and reachable (`welcomeHomeNavigationStructure.ts:273-291`); Wander the Estate functional and *improved* by the working tree (adds map→room "Talk here"). Two **pre-existing** menu-reachability gaps: **Research Library** (`onOpenResearchLibrary` declared at `CompanionPageClient.tsx:28255` but dropped — not forwarded by `EstateTopRightChrome.tsx`), and **Destination Gallery** (handler exists, but no menu destination in `WELCOME_HOME_NAV_CATEGORIES`). Both remain reachable by other routes.
- **Cause:** **route/navigation wiring gap** (pre-existing, not a regression from a good state). **Confidence:** High.

### Estate map (Wander)
- **Current [VERIFIED]:** Functional; graceful per-image placeholders; working-tree changes are additive. Not a regression.

---

## 2. Last-known-good commit map

| Feature | Last-known-good | Notes |
|---|---|---|
| Soundscapes / Peaceful Moments / Global sound | `deploy/companion-app-v3` @ **`517ed2e2`** | Current & correct on deploy; never existed on `main`. Introduced ~`9dc09da2` (soundscapes), `20d2947f` (estateAudioSettings), `70b7489e`/`971c8075` (peaceful places). |
| Coffee House **correct background pointer** | **`e1c31d7d`** (2026-07-04, parent of `fbecd015`) | Before `fbecd015` "renamed backgrounds", `lib` pointed at `/backgrounds/coffee-house-background.png`. `fbecd015` renamed it to nonexistent `room-coffee-house-background.png`; `18c661a2` (2026-07-08) then fell back to `tea-room-background.webp`. Prefer **forward re-point**, not revert (much changed since). |
| Coffee House **asset** | committed 2026-07-11 (`public/backgrounds/coffee-house-background.png`) | Present; only mis-referenced. |
| Room dedicated media (`estate-room-*-main.png`) | **none** | Never created; forward-fix (commission/accept), not restore. |
| Estate navigation menu | `517ed2e2` | Not regressed; gaps are pre-existing wiring. |

---

## 3. Root-cause classification (per the required taxonomy)

- **Deployment mismatch** — soundscapes, peaceful moments, global sound, estate navigation, and most media *if* preview builds main/stale. [DOC MA-38; VERIFIED main is 844 behind]
- **Incorrect media path** — Coffee House `canonicalEstatePlaces.ts:117` → nonexistent `room-coffee-house-background.png` (introduced `fbecd015`). [VERIFIED]
- **Placeholder fallback** — Coffee House `estatePlaceMedia.ts:55` + manifest → `tea-room-background.webp` (introduced `18c661a2`). [VERIFIED]
- **Asset / manifest omission** — canonical `estate-room-*-main.png` (0 files); orphaned committed Coffee House asset; manifest under-reports working coffee audio. [VERIFIED/DOC]
- **Route / navigation regression (pre-existing gap)** — Research Library not forwarded; Destination Gallery has no menu destination. [VERIFIED]
- **Merge overwrite / missed commit** — the coffee "renamed backgrounds" (`fbecd015`) is a rename that was never accompanied by the renamed file: effectively a half-landed change. [VERIFIED]
- **Unknown / next step** — the exact live-preview branch (run the decisive diagnostic above).

Not implicated: branch divergence *away from deploy* (deploy is the most complete branch); competing audio implementation (single canonical transport, `globalSoundControl.test.ts` enforces one mount); feature-flag/env mismatch for audio (none found).

---

## 4. Restoration order (one contained change per commit) — NOT executed

> Each step is independently revertible. Do not combine. Do not touch Saved Work.

- **Step 0 — Diagnose the preview** (no code): run the decisive diagnostic. Record the deployed SHA + Vercel Production Branch. This decides whether Step 1 is needed.
- **Step 1 — Deployment alignment** *(if mismatch confirmed; highest leverage, restores everything at once)*: point the previewed/production environment at the branch carrying the Estate work (`deploy/companion-app-v3`), or merge `deploy/companion-app-v3` → the production branch. Config/merge only — no feature code. Verify the deployed SHA matches afterward.
- **Step 2 — Coffee House background re-point** *(first code restoration; asset is ready; matches the approved Version A decision)*: converge the four references on `/backgrounds/coffee-house-background.png` — `estatePlaceMedia.ts:55`, `canonicalEstatePlaces.ts:117`, `docs/estate-knowledge-base/estate-locations.json:103` + `estate-assets.json:295`, then regenerate `ESTATE_PLACE_MASTER_MANIFEST.json` via `scripts/generate-estate-place-master-manifest.mjs`. One contained commit. *(Per the recorded artwork decision, confirm Shari's go before committing the registry re-point.)*
- **Step 3 — Room media, per room/batch**: for each `borrowed_pending_dedicated_asset` / `missing_dedicated_asset` room, either add the dedicated asset or formally accept the borrowed plate (update `media_ownership` + manifest). One contained change per room or small batch; prioritize the report's commission list (Library, Orchard, Stables, Music, Coffee).
- **Step 4 — Navigation reachability**: forward `onOpenResearchLibrary` through `EstateTopRightChrome`; add a Destination Gallery menu destination (or remove its dangling handler). One contained commit.
- **Step 5 — Asset hygiene**: commit the two untracked Soundscape mp3s (`distant-thunder.mp3`, `rain-and-thunder.mp3`) together with the manifest change that references them — or revert that manifest addition. Never ship a manifest referencing uncommitted assets.

---

## 5. Permanent preview acceptance checklist

Before accepting any preview as "good":
1. **Deployed SHA** matches the intended branch HEAD (record both).
2. **Estate audio:** open Audio → Soundscapes and → Peaceful Moments; each lists tracks and plays one (opt-in defaults mean you must press Play).
3. **Global sound control** appears when a room/profile menu is open; mute/resume works.
4. **Coffee House** renders its **own** artwork (not the Tea Room plate) and plays coffee ambience.
5. **Estate map (Wander)** loads; spot-check 5 rooms render real art, not "Image being prepared."
6. **Navigation:** every Welcome Home menu entry opens something (no dead rows); Research Library + Gallery reachable.
7. **No console 404s** for `/audio/*` or `/backgrounds/*` on the previewed pages.
8. Record the checklist result + SHA in the deploy log.

---

## 6. Recommended automated regression tests

- **Manifest ↔ disk integrity test** (unit, CI): every asset path referenced by `estatePlaceMedia.ts`, `canonicalEstatePlaces.ts`, `estateRoomRegistry.ts`, `*FolderManifest.ts`, and `ESTATE_PLACE_MASTER_MANIFEST.json` resolves to a file that exists under `public/`. Fails the build on any missing/renamed asset (would have caught `room-coffee-house-background.png`).
- **Soundscape/Peaceful manifest asset test**: every filename in `soundscapesFolderManifest.ts` / `peacefulPlacesFolderManifest.ts` exists on disk (catches untracked-mp3 drift).
- **Coffee House pointer test**: assert Coffee House background resolves to `coffee-house-background.png` (guards the re-point once done).
- **Navigation reachability test**: every `WELCOME_HOME_NAV_CATEGORIES` destination resolves to a forwarded handler (would have caught Research Library); every handler prop passed to `EstateTopRightChrome` is declared/forwarded.
- **AppSection coverage test**: every menu/route target is a valid `AppSection`; flag orphans.
- **Single-audio-controller test**: already exists (`globalSoundControl.test.ts`) — keep.

## 7. Recommended asset & manifest integrity checks

- Add a `scripts/verify-estate-assets.mjs` run in `prebuild` (and CI) that: (a) validates every referenced `/backgrounds/*` and `/audio/*` path exists; (b) flags committed-but-unreferenced assets (orphans like `coffee-house-background.png`); (c) flags manifest entries whose `media_ownership` is `borrowed_pending_dedicated_asset` and reports the count as a release gate metric.
- Fail the build (not just warn) on referenced-but-missing assets.
- Ensure `.gitignore` does not exclude live assets — note `/public/achived images/` (misspelled) and `*(1).*` are excluded; verify no room references anything under those.

## 8. Recommended branch & merge protections

- **Define one deploy source of truth.** Decide whether production tracks `deploy/companion-app-v3` or `main`, and make Vercel's Production Branch match. Today `main` lags deploy by 844 commits (MA-38) — the single biggest silent-loss risk.
- **Protect the deploy branch:** required status checks (the integrity + reachability tests above) before merge; no force-push.
- **Regular deploy→main (or chosen production) merges** so shipped Estate work reaches the deployed environment; alert when production lags deploy beyond a threshold.
- **PR template checkbox:** "assets committed for any new manifest reference" + "ran the preview acceptance checklist."
- **No half-rename commits:** renaming an asset reference must include the renamed/created file in the same commit (the `fbecd015` failure mode).

---

## 9. First restoration change — recommendation

**Do Step 0 (diagnose the preview) first, then:**
- **If the preview builds `main`/a stale branch (most likely, per MA-38): the first restoration change is deployment alignment (Step 1).** It is the highest-leverage, lowest-code-risk action and restores soundscapes, peaceful moments, global sound, navigation, and all present media in a single move. Nothing else should precede it, because code-level fixes won't appear until the correct branch is deployed.
- **If the preview already builds `deploy`/`audit`: the first change is the Coffee House background re-point (Step 2)** — one contained commit, the asset is already committed, and it matches the approved Version A artwork decision (confirm Shari's go on the registry re-point).

Everything here preserves the validated durable Saved Work work and changes nothing yet.
