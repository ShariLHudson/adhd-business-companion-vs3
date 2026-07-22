# 142 — Destination Gallery & Connections Integration Certification

**Status:** Provisional (code certified; browser matrix not fully run this session)  
**Date:** 2026-07-21  
**Branch:** `deploy/companion-app-v3`

## Mission

Every Destination Gallery crystal is a real doorway: opens a destination, launches a connected service, explains how to connect, or stays hidden until ready. Connections Settings is the Digital Workspace Preferences source of truth (auth + preferred destinations).

## Product principle

If it shines, it works. If it needs setup, Spark explains. If unavailable, members know why.

## Architecture shipped

| Layer | Runtime |
|-------|---------|
| Crystal registry | `lib/destinationGallery/destinationRegistry.ts` |
| Preference-aware launch | `lib/destinationGallery/resolveCrystalLaunch.ts` |
| Connection capability | `lib/destinationGallery/crystalConnectionMapping.ts` |
| Canva connection | `lib/connections/canvaConnection.ts` |
| Digital Workspace Preferences | `lib/connections/digitalWorkspacePreferences.ts` |
| Connections catalog | `lib/connections/settingsConnectionCatalog.ts` |
| Settings UI | `components/companion/SettingsPanel.tsx` · `SettingsConnectionCard.tsx` |
| Gallery UI | `components/companion/destinationGallery/DestinationGalleryPanel.tsx` |
| Activation wiring | `app/companion/CompanionPageClient.tsx` → `handleSelectDestinationCrystal` |

## Part 1 — Crystal certification (code)

| Crystal | Label | Launch | Disconnected / missing | Notes |
|---------|-------|--------|------------------------|-------|
| `schedule` | Schedule | Opens Estate Calendar when Google or Outlook ready | Explains + Open Connections | Keyboard hit area retained |
| `write` | Document | Prepared export using Documents preference | Word URL missing → Connections | Google Docs / local / Spark Estate prepared |
| `save` | Store | Prepared store + Connections CTA when Drive missing | Honest message | Does not open Drive as a file browser |
| `spark-social-media` | Share | Prepared share (approval required) | Needs profile in Connections | Never auto-publishes |
| `print` | Print | Prepared print/PDF using Printing preference | N/A (local) | Preference label shown |
| `create` | Design | Opens Canva URL when connected | Explains + Open Connections | **Never** legacy Create / content-generator |

Coming Soon services (Sheets, Slides, Excel, OneDrive, Dropbox, OneNote, Notion as OAuth cards) remain **hidden** in `SETTINGS_CONNECTIONS_HIDDEN_FROM_UI` until ready — preference slots reserved.

## Part 2–3 — Connections + Canva

- Canva card: connect · update link · verify · disconnect  
- URL validation: `https` + `canva.com` host only  
- Design crystal: connected → `window.open` preferred URL; else in-gallery guide → Settings → Connections  

## Part 4–5 — Documents & Printing preferences

Stored in `companion-digital-workspace-preferences-v1`:

- Documents: Google Docs · Microsoft Word · Spark Estate Documents · Local  
- Printing: Save as PDF · Print dialog · Preferred print provider  
- Calendar: Google · Outlook  
- Storage: Google Drive · OneDrive · Dropbox (preference; OAuth deferred)  

## Part 6 — Smart crystal states

Functional statuses: `connected` · `available_to_connect` · `coming_soon` · `disabled`  
Resolved via `resolveCrystalFunctionalStatus` from live connection action.

## Part 7 — Registry fields

Each entry: Crystal Name · Internal ID · User-facing Label · Destination Type · Required Connection · Launch Behavior · Fallback Behavior · Status · `visibleInGallery`.

## Part 8 — Browser certification

| Check | Status |
|-------|--------|
| Click each crystal | Unit + wiring covered; full browser matrix **not run** (browser MCP unavailable) |
| Keyboard Enter/Space | Hit-area buttons retain handlers |
| Connected Canva opens URL | Unit + client handler |
| Disconnected Canva → Connections | Unit + panel CTA |
| Invalid Canva URL rejected | `canvaConnection` tests |
| Return Gallery / Estate chrome | Existing Back / Estate / Gallery controls |
| No silent fail | Launch plan always returns message + kind |

## Tests run

Focused vitest on:

- `lib/destinationGallery/crystalActivation.test.ts`
- `lib/destinationGallery/destinationRegistry.test.ts`
- `lib/destinationGallery/resolveCrystalLaunch.test.ts`
- `lib/destinationGallery/crystalConnectionMapping.test.ts`
- `lib/connections/canvaConnection.test.ts`
- `lib/connections/settingsConnections.test.ts`

## Verdict

**Provisional certify** for code integration. Full browser certification remains open until Destination Gallery is exercised live with connected and disconnected Canva/Google states.

## Deferred

- OAuth for Microsoft Word / OneDrive / Dropbox / Notion  
- Live Google connection snapshot inside Destination Gallery handler (Document still uses ExportActions prepared path)  
- Visual “Connected / Available” badges on painted artwork (status is functional in registry; artwork stays diegetic)
