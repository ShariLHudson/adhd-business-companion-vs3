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

### Wander persistent image view (immersive room-image experience)
- **Expected:** Open a room image from Wander; it stays open as an immersive background; opening it does not force navigation; controls don't obscure the scene; clear close/return.
- **Current [VERIFIED]:** Split between committed and uncommitted:
  - **Committed/deployed (`HEAD`):** a *framed* exclusive viewer — opens and **persists** (local `viewMode="image_viewer"` switch, `EstateMapFullScreen.tsx:264-282`; comment "do not navigate away yet" at :278), no forced navigation on open, controls sit **below** the stage (not obscuring), explicit exits only (× / "Back to Estate" / Esc → `closeViewerToGallery`, `EstateMapFullScreen.tsx:173-177`; parent Esc guard disabled while open, :254). Introduced by `8d075f8d` ("add focused wander image viewer"), label/Esc hint by `0b713a93`.
  - **Immersive full-bleed background + "Talk here with Spark" + repositioned pill controls:** exists **only in the uncommitted working tree** — `WanderEstateImageViewer.tsx` (`immersive` state :41; full-bleed CSS `.weiv-image--immersive`; background is inert, not an exit; Esc steps out of immersive then closes), `EstateMapFullScreen.tsx` (`enterViewerPlace`→`onSelectLocation`, `onEnterPlace` wired :304-309,:339), `wander-estate-image-viewer.css` (+65), `lib/estateMap/exploreEstateDestinations.ts`, plus an **untracked** test `lib/estateMap/wanderEstateImmersive.test.tsx`.
- **In repo/on branch:** framed viewer committed; **immersive layer uncommitted (on no branch — confirmed via `git log --all -S` for `weiv-root--immersive`, `Talk here with Spark`, `immersive` in `components/estateMap/`, all empty).** **In preview:** framed viewer present only if preview builds deploy (else deployment mismatch); **immersive layer can appear in NO preview** (never committed).
- **Same issue elsewhere? [VERIFIED] No.** `WanderEstateImageViewer` is mounted only by `EstateMapFullScreen` (`CompanionPageClient.tsx:28425-28438`). Other estate image entrypoints (ambient Wander `handleEstateWander` :11384-11403; peacefulPlaces cards; map "Talk here" `handleExploreSparkMapSelect` :11421-11495) **navigate into a room background by design** — they don't hold an image open, so they neither share nor exhibit this regression.
- **Cause:** **missed commit** — accepted immersive work never committed to any branch, so it is absent from every deploy and at silent-loss risk (compounded by deployment mismatch for the framed layer). **Confidence:** High.

---

## 2. Last-known-good commit map

| Feature | Last-known-good | Notes |
|---|---|---|
| Soundscapes / Peaceful Moments / Global sound | `deploy/companion-app-v3` @ **`517ed2e2`** | Current & correct on deploy; never existed on `main`. Introduced ~`9dc09da2` (soundscapes), `20d2947f` (estateAudioSettings), `70b7489e`/`971c8075` (peaceful places). |
| Coffee House **correct background pointer** | **`e1c31d7d`** (2026-07-04, parent of `fbecd015`) | Before `fbecd015` "renamed backgrounds", `lib` pointed at `/backgrounds/coffee-house-background.png`. `fbecd015` renamed it to nonexistent `room-coffee-house-background.png`; `18c661a2` (2026-07-08) then fell back to `tea-room-background.webp`. Prefer **forward re-point**, not revert (much changed since). |
| Coffee House **asset** | committed 2026-07-11 (`public/backgrounds/coffee-house-background.png`) | Present; only mis-referenced. |
| Room dedicated media (`estate-room-*-main.png`) | **none** | Never created; forward-fix (commission/accept), not restore. |
| Estate navigation menu | `517ed2e2` | Not regressed; gaps are pre-existing wiring. |
| Wander **framed** image viewer | `8d075f8d` (+ `0b713a93`) | Committed & current on deploy; persists, no forced nav, controls not obscuring. |
| Wander **immersive** persistent view + "Talk here" | **none (uncommitted)** | Never committed to any branch; lives only in the working tree here. Restore by committing it (below), not by reverting. |

---

## 3. Root-cause classification (per the required taxonomy)

- **Deployment mismatch** — soundscapes, peaceful moments, global sound, estate navigation, and most media *if* preview builds main/stale. [DOC MA-38; VERIFIED main is 844 behind]
- **Incorrect media path** — Coffee House `canonicalEstatePlaces.ts:117` → nonexistent `room-coffee-house-background.png` (introduced `fbecd015`). [VERIFIED]
- **Placeholder fallback** — Coffee House `estatePlaceMedia.ts:55` + manifest → `tea-room-background.webp` (introduced `18c661a2`). [VERIFIED]
- **Asset / manifest omission** — canonical `estate-room-*-main.png` (0 files); orphaned committed Coffee House asset; manifest under-reports working coffee audio. [VERIFIED/DOC]
- **Route / navigation regression (pre-existing gap)** — Research Library not forwarded; Destination Gallery has no menu destination. [VERIFIED]
- **Merge overwrite / missed commit** — the coffee "renamed backgrounds" (`fbecd015`) is a rename that was never accompanied by the renamed file: effectively a half-landed change. [VERIFIED]
- **Missed commit (uncommitted accepted work)** — the Wander immersive persistent image view + "Talk here" is fully built and tested in the working tree but committed on no branch, so it cannot deploy and is one `git checkout`/`stash` from loss. [VERIFIED]
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
- **Step 6 — Wander persistent image view (commit the uncommitted immersive work)**: after review, commit **only** the Wander viewer files as one contained change so the accepted immersive experience is preserved and can deploy: `components/estateMap/WanderEstateImageViewer.tsx`, `components/estateMap/EstateMapFullScreen.tsx`, `components/estateMap/wander-estate-image-viewer.css`, `lib/estateMap/exploreEstateDestinations.ts` (+ its test), and the untracked `lib/estateMap/wanderEstateImmersive.test.tsx`. Do **not** sweep the other ~55 unrelated uncommitted files (soundscape tweaks, deleted `ExecutiveBusinessSnapshot.tsx`, docs) into this commit, and do not touch Saved Work. This is a "commit accepted work," not a code rewrite. (If the deployment mismatch in Step 1 is unresolved, this still won't show until the correct branch is deployed.)

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
8. **Wander image view:** open a room image from Wander — it **stays open** (doesn't close/replace or force navigation), can go **immersive full-bleed**, controls stay out of the scene's center, and ×/"Back to Estate"/Esc return cleanly. Confirm "Talk here with Spark" is the *only* control that navigates into the room.
9. **No uncommitted accepted work:** `git status` on the deploy branch is clean for feature code — nothing accepted is sitting untracked/modified (guards against the Wander-immersive silent-loss pattern).
10. Record the checklist result + SHA in the deploy log.

---

## 6. Recommended automated regression tests

- **Manifest ↔ disk integrity test** (unit, CI): every asset path referenced by `estatePlaceMedia.ts`, `canonicalEstatePlaces.ts`, `estateRoomRegistry.ts`, `*FolderManifest.ts`, and `ESTATE_PLACE_MASTER_MANIFEST.json` resolves to a file that exists under `public/`. Fails the build on any missing/renamed asset (would have caught `room-coffee-house-background.png`).
- **Soundscape/Peaceful manifest asset test**: every filename in `soundscapesFolderManifest.ts` / `peacefulPlacesFolderManifest.ts` exists on disk (catches untracked-mp3 drift).
- **Coffee House pointer test**: assert Coffee House background resolves to `coffee-house-background.png` (guards the re-point once done).
- **Navigation reachability test**: every `WELCOME_HOME_NAV_CATEGORIES` destination resolves to a forwarded handler (would have caught Research Library); every handler prop passed to `EstateTopRightChrome` is declared/forwarded.
- **AppSection coverage test**: every menu/route target is a valid `AppSection`; flag orphans.
- **Single-audio-controller test**: already exists (`globalSoundControl.test.ts`) — keep.
- **Wander persistent image-view interaction test** (already authored, currently untracked `lib/estateMap/wanderEstateImmersive.test.tsx` — commit it with Step 6): asserts the viewer stays mounted on open, background click does not exit, repeated clicks/Prev-Next keep immersive, Esc steps out of immersive then closes, and opening does not force navigation. Add a companion assertion that only "Talk here" calls `onSelectLocation`.
- **No-uncommitted-accepted-work guard** (CI): fail if `git status --porcelain` shows modified/untracked files under `components/` or `lib/` on the deploy branch build — turns the silent-loss pattern into a hard signal.

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

---

## 10. Verified deployment diagnostic (2026-07-31) — via authenticated Vercel CLI (read-only)

**Vercel project:** `adhd-business-companion-vs3` (team `shari-hudsons-projects`), linked via `companion-app/.vercel`.

**Deployment model — no Git→Vercel pipeline (verified):** `vercel project inspect` shows only General + Framework Settings — **no "Git Repository" / "Production Branch"** section. No deployment carries a git commit or branch: `vercel inspect --json` contains no `gitSource`/`githubCommit*`, and the only 40-hex present is a Vercel **blob digest** (`git cat-file` → *bad object*, not a commit). **Deployments are manual `vercel deploy` uploads of the local working directory.**

**Production:** alias `adhd-business-companion-vs3.vercel.app` → deployment `6ogtcyibg`, `target: production`, created **2026-07-26 19:47 CDT (~4 days stale)** — predates the Estate/Create commits landed through 2026-07-29 on `deploy/companion-app-v3 @ 517ed2e2`.

**Cause (confirmed):** *deployment alias pointing to an older deployment* + *no Git integration* → no reproducible branch→deploy mapping; production is frozen at a Jul 26 CLI upload. This is the structural reason many completed Estate experiences can "disappear at once."

**Redeploy sufficiency:** a fresh deploy from the correct source restores the audio / soundscape / peaceful-moments / navigation / **framed** Wander set; it does **not** fix the Coffee House / room-media placeholders (on-branch), and the Wander **immersive** layer required committing first (now done — `42e87822`).

### Clean Preview deployment (executed this task — Preview only)
- **Source:** clean git worktree at `audit/beta-experience-readiness` @ **`42e878223c92d098d33b07c2166c0abf71c426f8`** — `git status` clean, no untracked files; includes deploy inheritance (`517ed2e2`), durable Saved Work through `a62ac279`, the Wander immersive commit `42e87822`, and the regression audit `61418ddc`.
- **Deployed to Preview only** (no `--prod`, no promote, no alias/settings/git-integration change).
- **Deployment id:** `dpl_BFgDKbecbBtWVbRbLuvcsZmEXFrJ` · **URL:** https://adhd-business-companion-vs3-8mcjimq1j-shari-hudsons-projects.vercel.app · **target: preview** · **READY** · build succeeded (`npm run build`, Next.js 16.2.7, photo manifest generated; no build errors).
- **Production alias unchanged** — still → `6ogtcyibg` (Jul 26).

---

## 11. Manual Preview acceptance (`42e87822`) + Soundscapes / Peaceful Moments diagnostic

**Manual acceptance (Shari, clean Preview `dpl_BFgDKbecbBtWVbRbLuvcsZmEXFrJ` @ `42e87822`):**
- ✅ Coffee House reachable through Wander the Estate.
- ✅ A Wander Estate background can be opened and **kept open** (persistent + immersive Wander viewer works). → The committed Wander immersive work is now live in Preview.
- ❌ **Soundscapes — not available.** ❌ **Peaceful Moments — not available.**

**Diagnostic (Soundscapes + Peaceful Moments only; committed-code analysis — see runtime limitation):**

- **Committed vs uncommitted:** Both features are **fully committed in `42e87822`** — components, menu entries, chrome host, chat intents, and 24 audio assets (`public/audio/Soundscapes/*` ×12, `public/audio/peaceful-places/*` ×12). They are **not** dependent on the 54 uncommitted files. The uncommitted items are additive soundscape tracks/manifest/tests (+2 tracks) and a *separate* "hide/show conversation" estate-visibility feature — neither gates these two.
- **Expected member path:**
  - Soundscapes → estate chrome `EstateTopRightChrome` → room "Audio" menu → Soundscapes, or the GlobalSoundControl "Soundscapes" button → `SoundscapeSelectionOverlay` (`CompanionPageClient.tsx:28291,28308`); also chat intent → `executeSoundscapeIntent` (`CompanionPageClient.tsx:17623`).
  - Peaceful Moments → estate chrome → Audio menu → Peaceful Moments, or GlobalSoundControl → `openPeacefulPlacesCore` → section `focus-audio` (`FocusAudioPanel`→`PeacefulMomentsRoom`); also chat intent → `openFocusAudioCore` (~15 call sites via `detectAudioRequest`).
- **Verified root cause (shared):** the **visible** entry points for BOTH features (the room "Audio" menu and the GlobalSoundControl) live inside `EstateTopRightChrome`, gated by `const visible = showProfile || (showRoom && Boolean(roomId))` (`EstateTopRightChrome.tsx:121-122`). Fed by `showProfile={showGlobalEstateMenu}` / `showRoom={showEstateExperienceMenu}` (`CompanionPageClient.tsx:28204-28207`), where `showEstateExperienceMenu = overlay!=="signin" && Boolean(roomMenuRoomId)` (`:25220`) and `showGlobalEstateMenu = estateChromePolicy.showSubtleEstateMenu && overlay!=="signin"` (`:25109`). On the home/arrival surface (no room context, subtle estate menu not shown), the chrome — and thus both audio entries — does not render, so both appear unavailable. Both retain chat-intent fallbacks that require typing an audio request. This is one shared visibility/reachability condition — **not** missing code, assets, a feature flag, or autoplay.
- **Deployed asset status:** assets committed and in the build; HTTP verification blocked — every Preview request returns **302 → Vercel Login** (Vercel Deployment Protection). Not an app-level asset failure.
- **Feature-flag / environment:** no feature flag gates these; sound is **opt-in** (`estateAudioSettings.ts:33-40`) which affects *playback after selection*, not entry *visibility*; Supabase auth gates the whole app and Vercel SSO gates the whole Preview — neither selectively hides these two; autoplay restrictions apply only on play, not to whether the entry appears.
- **Runtime limitation:** authenticated in-browser inspection (console, network, rendered UI) was not possible — the Preview is behind Vercel SSO and I do not enter credentials. Recommend Shari, while authenticated, confirm whether `EstateTopRightChrome` renders on her surface and whether `/audio/*` requests return 200.
- **Confidence:** committed-not-uncommitted — **High**; shared chrome-visibility gate as the mechanism — **Medium-High** (code-verified; exact runtime surface for Shari unconfirmed).
- **Smallest contained correction (not implemented):** surface a persistent audio entry reachable on the home/arrival surface — e.g., allow the GlobalSoundControl to render outside the room/profile-menu condition (relax the `EstateTopRightChrome` visibility gate for the sound control), or add one always-present home-level "Sound" affordance. Contained to the chrome visibility condition / one control; do not modify the features, assets, Wander, Saved Work, or Coffee House.
- **Tests to prevent recurrence:** (a) reachability test — the sound control / Audio entry renders from the home/arrival state; (b) menu-resolution test — every "Audio" nav destination resolves a forwarded handler and renders (as with the Research Library gap); (c) chat-intent parity test — an audio request opens Peaceful and a soundscape request opens the overlay; (d) manifest↔disk asset integrity for soundscape/peaceful filenames.
