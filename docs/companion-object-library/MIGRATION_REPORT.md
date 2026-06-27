# Companion Object Library — Migration Report

**Phase:** 1 — Registry complete (no emoji replacement yet)  
**Audit date:** 2026-06-25  
**Registry:** `lib/companionUniverse/libraries/objectLibrary.ts`

---

## Executive summary

The Companion Homestead currently uses **Unicode emoji as feature iconography** across **176 production files** with **211 distinct emoji glyphs** (including variation selectors). This report inventories every usage class, maps features to Signature Objects, and defines the phased migration to a single visual language.

**Phase 1 is complete:** a central registry exists with 22 primary features plus extended navigation, growth, hospitality, and momentum mappings. **All artwork status: Needs artwork.**

---

## Registry quick reference

| Feature | Signature Object | Room | Status |
|---------|------------------|------|--------|
| Clear My Mind | Leather journal | Window Seat | Needs artwork |
| Plan My Day | Open leather planner | Planning Table | Needs artwork |
| Today's Reality | Morning mug and notebook | Kitchen Table | Needs artwork |
| Decision Compass | Elegant brass compass | Outlook Point | Needs artwork |
| Focus Studio | Premium headphones | Focus Studio | Needs artwork |
| Breathing | Lit candle | Focus Studio | Needs artwork |
| Games | Wooden puzzle | Living Room | Needs artwork |
| Create | Sketchbook with paint brushes | Creative Studio | Needs artwork |
| Business | Leather portfolio | Business Office | Needs artwork |
| Learning | Stack of books | Library | Needs artwork |
| Reading | Open hardcover book | Reading Nook | Needs artwork |
| Parking Lot | Seed packet / idea box | Garden Path | Needs artwork |
| Evidence Bank | Keepsake box | Library | Needs artwork |
| Wins | Framed accomplishment | Fire Circle | Needs artwork |
| Growth | Growing plant | Greenhouse | Needs artwork |
| Calendar | Desktop calendar | Planning Table | Needs artwork |
| Projects | Project binder | Barn | Needs artwork |
| Messages | Handwritten note | Living Room | Needs artwork |
| Settings | Vintage brass key | Front Porch | Needs artwork |
| Search | Magnifying glass | Library | Needs artwork |
| Notifications | Small desk bell | Kitchen Table | Needs artwork |
| Help | Open guidebook | Library | Needs artwork |

Full registry (80+ entries including House Map, Toolbelt, growth, games, hospitality): see `objectLibrary.ts`.

---

## Audit methodology

Automated scan (`scripts/audit-emojis.mjs`) of `app/`, `components/`, and `lib/` (excluding `*.test.ts`):

| Metric | Count |
|--------|------:|
| Files with emoji | 176 |
| Unique emoji glyphs | 211 |
| Registry entries | 80+ |
| Primary features | 22 |

Raw audit data: `docs/companion-object-library/emoji-audit.json`

---

## Usage classes (what we found)

### 1. Feature iconography — **MUST migrate**

Emoji used as the visual identity of a product feature. These must reference `COMPANION_OBJECT_LIBRARY`.

| Area | Files | Top emojis | Registry coverage |
|------|-------|------------|-------------------|
| Top navigation | `TopBar.tsx`, `companionUi.ts` | 🧠 📅 🌤️ 💬 | `clear-my-mind`, `plan-my-day`, `todays-reality`, `messages` |
| House Map | `companionLayoutSystem.ts` | 🏡 🪟 🍵 📝 🎯 🎨 💼 📚 | `nav-*` + primary features |
| Toolbelt | `companionLayoutSystem.ts` | 💬 🔍 💭 🅿️ 📁 📋 💾 | `toolbelt-*` entries |
| Sidebar | `companionUi.ts`, `AppSidebar.tsx` | 💬 🚧 💡 📈 ➕ ❓ | `messages`, `focus-my-brain`, `visual-thinking`, `business`, `other`, `help` |
| Workspace modes | `workspaceMode.ts` | 23 mode emojis | Mapped via feature ids |
| Growth hub | `GrowthCenterPanel.tsx`, `growthNavigation.ts` | 🏆 📈 ✨ 🌱 | `wins`, `evidence-bank`, `my-highlights`, `growth` |
| Focus tools | `focusToolDefinitions.ts`, `stressRouting.ts` | 📌 🧠 🛡 🎯 🧭 | `strategies`, `clear-my-mind`, `safe-for-today`, `decision-compass` |
| Create catalog | `createCatalogData.ts` | 40 item emojis | Parent: `content-types`; subtypes TBD Phase 2b |
| Momentum games | `momentumGames.ts` | 37 lines | Category entries + per-game expansion Phase 2b |
| How Do I | `howDoIHelpArticles.ts` | 105 lines | Article-level icons → learning/memory objects Phase 2b |
| Director's Studio | `directorExperience.ts` | 🌷 🍂 🫖 🎂 🚀 🌅 🌨️ 🌧️ | `season-*`, `hospitality-*`, `atmosphere-*` |
| Dashboard actions | `companionDashboard.ts` | 30 lines | Quick actions → planning/focus objects |
| Strategies | `StrategiesPanel.tsx` | 14 tool emojis | `strategies` + per-tool aliases |
| Saved browse | `SavedBrowsePanel.tsx` | 9 categories | Projects, templates, compass, etc. |

### 2. UI affordances — **do not map to Signature Objects**

These are interaction feedback, not brand iconography. Replace with typography or minimal SVG in a separate UI icon pass — **not** the Object Library.

| Glyph | Approx. uses | Purpose |
|-------|-------------:|---------|
| ✓ | 70 | Success, saved, selected |
| ✕ | 14 | Close, dismiss |
| ✅ | 24 | Completion checkmarks |
| 🟢 / 🟨 / 🟩 / 🟥 | 15+ | Coaching mode markers in `companionPrompt.ts` |
| ☑ / ☐ | few | Checkbox states |
| 🔒 / 🟢 / 🔴 | few | Lock/status indicators |

### 3. Inline copy & help text — **migrate in Phase 2**

Emoji embedded in prose (help articles, AI knowledge, onboarding). Replace with object name text or inline `<CompanionObjectIcon id="..." />` once assets exist.

Heavy files:
- `lib/howDoIHelpArticles.ts` (105 hit lines)
- `lib/appFeatureKnowledge.ts`
- `lib/howDoIContent.ts`
- `lib/workspaceHelpContent.ts`
- `lib/chatWorkspaceHelpContent.ts`

### 4. Game & delight content — **selective migration**

`MomentumGameRunner.tsx` uses emoji inside mini-game content (sort items, coffee/tea pairs). These are playful in-context content, not navigation icons. Phase 4: evaluate per-game whether homestead objects or abstract shapes work better.

### 5. Third-party / external links — **neutral treatment**

Google Workspace links (📅 📝 📊 📁 in `SettingsPanel.tsx`, `AppSidebar.tsx`) should use subdued external-ledger objects, not Google-branded emoji.

---

## Files by emoji density (top 30)

| Hits | File |
|-----:|------|
| 105 | `lib/howDoIHelpArticles.ts` |
| 40 | `lib/createCatalogData.ts` |
| 37 | `lib/momentumGames.ts` |
| 36 | `components/companion/IdealClientBuilder.tsx` |
| 33 | `lib/adjustMyDay.ts` |
| 30 | `lib/companionDashboard.ts` |
| 23 | `lib/workspaceMode.ts` |
| 22 | `lib/strategySystem.ts` |
| 19 | `components/companion/SpinWheelPanel.tsx` |
| 19 | `lib/ecosystem/automation/automationRouter.ts` |
| 17 | `lib/companionUniverse/companionLayoutSystem.ts` |
| 16 | `components/companion/SettingsPanel.tsx` |
| 16 | `lib/ecosystem/actions/workspaceMapper.ts` |
| 15 | `lib/companionStore.ts` |
| 15 | `lib/thinkingSpace/collectionColors.ts` |
| 15 | `lib/weeklyWins.ts` |
| 14 | `components/companion/StrategiesPanel.tsx` |
| 14 | `lib/companionUi.ts` |
| 13 | `components/companion/EmailGeneratorPanel.tsx` |
| 13 | `lib/howDoIEcosystemGuide.ts` |
| 12 | `app/companion/CompanionPageClient.tsx` |
| 12 | `lib/companionHospitalityPrototype/directorExperience.ts` |
| 12 | `lib/howDoIHelpTypes.ts` |
| 12 | `lib/thinkingSpace/thoughtEmoji.ts` |
| 11 | `components/companion/ProgressPanel.tsx` |
| 10 | `lib/companionRouting.ts` |
| 9 | `components/companion/SavedBrowsePanel.tsx` |
| 9 | `lib/appFeatureKnowledge.ts` |
| 9 | `lib/intelligence-layer/adhdEntrepreneurIntelligenceBenchmark.ts` |
| 9 | `lib/projectCoachChoices.ts` |

Complete file list: `emoji-audit.json` → `files` key.

---

## Duplicate emoji → single object (consolidation map)

Several emojis currently represent the same feature. Phase 2 must unify:

| Emoji | Current usages | Canonical object id |
|-------|----------------|---------------------|
| 🧠 | Clear My Mind, brain dump, overwhelm | `clear-my-mind` |
| 📅 / 🗓️ / 📋 | Plan My Day, time block, calendar | `plan-my-day` / `calendar` |
| 🌤️ / 🙂 / 🍵 | Today's Reality | `todays-reality` |
| 💬 | Chat, messages, talk-through | `messages` |
| 📈 / ⭐ | Growth sidebar, Evidence Bank | `evidence-bank` / `growth` |
| ✨ / 🌟 | Highlights, Build With Shari | `my-highlights` / `build-with-shari` |
| 🎯 | Focus nav, strategies, spin categories | `nav-focus` / `strategies` |
| 📝 / 🅿️ | Parking lot, parking emoji | `parking-lot` |

---

## Object categories (12)

| Category | Registry count | Examples |
|----------|---------------:|----------|
| Planning Objects | 8+ | Planner, calendar, strategies, parking lot |
| Focus Objects | 10+ | Headphones, candle, timer, safe-for-today |
| Creative Objects | 8+ | Sketchbook, templates, visual thinking |
| Business Objects | 7+ | Portfolio, projects, email, playbook |
| Reflection Objects | 6+ | Journal, compass, decision map |
| Hospitality Objects | 8+ | Messages, tea service, director actions |
| Seasonal Objects | 5+ | Spring bloom, snow day, rain day |
| Celebration Objects | 6+ | Wins frame, spin wheel, games puzzle |
| Learning Objects | 3+ | Books stack, guidebook, reading |
| Memory Objects | 6+ | Keepsake box, journey journal, polaroid |
| Nature Objects | 4+ | Growing plant, XP tiers |
| Navigation Objects | 4+ | Key, magnifying glass, tool drawer |

---

## Future-ready asset contract

Every registry entry supports:

| Capability | Field | Default |
|------------|-------|---------|
| Static PNG | (asset path TBD) | — |
| SVG | (asset path TBD) | — |
| Transparent version | `transparentAsset` | `true` |
| Animated version | `motionCompatible` | per entry |
| Seasonal variations | `seasonalVariants[]` | per entry |
| High resolution | `future3D` | `true` |
| Potential 3D | `future3D` | `true` |

**Art direction (locked):** Warm homestead realism — natural materials, soft lighting, subtle depth, premium craftsmanship. Every object must look like it belongs in Shari's home under the same light.

---

## Migration phases

### Phase 1 — Build library ✅

- [x] Create `objectLibrary.ts` with full schema
- [x] Register in `libraryCatalog.ts` as Companion Object Library
- [x] Export from `companionUniverse/index.ts`
- [x] Audit application (`emoji-audit.json`)
- [x] Migration report (this document)
- [x] Tests for registry completeness

### Phase 2 — Replace emojis globally

1. Add `CompanionObjectIcon` component (PNG/SVG src from registry id)
2. Replace `emoji` fields in `companionUi.ts`, `companionLayoutSystem.ts`, `workspaceMode.ts`, `TopBar.tsx`
3. Update `StrategiesPanel`, `GrowthCenterPanel`, `SavedBrowsePanel`, `focusToolDefinitions.ts`
4. Expand registry for `createCatalogData` subtypes (40 items)
5. Expand registry for `momentumGames` per-game icons (30+ games)
6. Update help copy to reference object names

### Phase 3 — Update navigation cards

- House Map cards use Signature Object renders
- Toolbelt uses secondary-weight object thumbnails
- Sidebar six doors unified

### Phase 4 — Update room experiences

- Hospitality living room evidence objects align with registry
- Director's Studio scenario tiles
- Plan My Day, Clear My Mind, Growth room headers

### Phase 5 — Remove emoji assets

- Delete emoji string literals from feature definitions
- Lint rule: no Unicode emoji in `components/` or `lib/` except tests and UI affordance whitelist
- Remove `thoughtEmoji.ts` category emoji map → object ids

---

## Definition of done

- [ ] No production emoji represents a **feature** anywhere in the app
- [ ] Every feature references `companionObjectById()` or `CompanionObjectIcon`
- [ ] One complete art collection in unified homestead style
- [ ] New development imports from Object Library — never adds raw emoji for features

---

## Next step: art production

Generate **one complete collection** in identical style before Phase 2 UI work. Recommended batch order:

1. **Primary 22** (table above) — highest visibility
2. **House Map + Toolbelt** (10 objects)
3. **Growth quartet** (wins, evidence, highlights, journey)
4. **Seasonal/hospitality** (Director's Studio scenarios)
5. **Create catalog + games** (long tail)

When art lands, set `artworkStatus` to `ready` and add `assetPath` field in a follow-up schema extension.
