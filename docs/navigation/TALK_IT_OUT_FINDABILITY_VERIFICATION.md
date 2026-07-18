# Talk It Out Findability Verification

**Date:** 2026-07-18  
**Verdict:** Routing and catalog registration existed, but Welcome Home UI could **not** open Talk It Out until a missing chrome prop forward was fixed.

**Do not deploy production** until authenticated confirmation: Welcome Home → Take a Moment → Talk It Out opens the panel.

---

## Root cause (why the user could not find it)

| Layer | Status before fix |
|-------|-------------------|
| Registered in Take a Moment catalog | Yes — first destination |
| Menu maps `talk-it-out` → `onOpenTalkItOut` | Yes — `EstateRoomExperienceMenu` |
| CPC passes opener | Yes — `onOpenTalkItOut={() => openTalkItOutCore()}` to chrome |
| Chrome forwards prop to menu | **No** — `EstateTopRightChrome` omitted `onOpenTalkItOut` |
| Button rendered | **No** — `destinationAction` returned `undefined` → `renderDestinationButton` returned `null` |

**Conclusion:** The implementation report was correct about *intended* registration and incorrect about *actual reachability*. Navigation item existed in data, but the UI dropped it because the opener never reached the menu.

### Fix applied

`components/companion/estate/EstateTopRightChrome.tsx` — accept and forward `onOpenTalkItOut` to `EstateRoomExperienceMenu`.

Regression test: `lib/talkItOut/talkItOut.test.ts` asserts chrome forwards the prop.

---

## Where Talk It Out is registered

| Location | Present? | Notes |
|----------|----------|-------|
| `lib/estate/welcomeHomeNavigationStructure.ts` → Take a Moment | Yes | First item; support line set |
| `EstateRoomExperienceMenu` destination map | Yes | `"talk-it-out": onOpenTalkItOut` |
| `CompanionPageClient` → `openTalkItOutCore` | Yes | Opens section `talk-it-out` |
| `EstateTopRightChrome` | **Fixed** | Was missing; now forwards |
| Focus Hub → I'm Stuck | Yes | `lib/focusHub.ts` tool → `handleFocusHubAction` |
| How Do I help articles / content | Yes | `openSection: "talk-it-out"` |
| Estate brain capability / coaching | Yes | Intent routing, not a visible menu tile |
| GlobalEstateMenu / estate menu actions | No | Not listed |
| CompanionPreviewTestPanel / hidden dev menus | No | Not found |
| Welcome Home daily choices (retired) | No | Retired surface |

---

## Every navigation path that opens Talk It Out

1. **Welcome Home → Take a Moment → Talk It Out** (intended primary) — **was broken; fixed by chrome forward**  
2. **Focus / Help Me Think → I'm Stuck → Talk It Out** — wired if Focus section is opened (`FocusAreaPanel` → `handleFocusHubAction` → `openTalkItOutCore`)  
3. **How Do I** article “Talk It Out” → `openSection: "talk-it-out"`  
4. **Estate brain / coaching / intent** payloads with `openSection: "talk-it-out"`  
5. **URL / section restore** paths that call `openSectionFromUrlCore("talk-it-out")` or equivalent CPC section handlers  

---

## Reachability checklist

| Surface | Reachable through current UI? |
|---------|------------------------------|
| Welcome Home Experiences menu | **Yes after fix** (was No) |
| Experiences (same estate room menu) | Same as Welcome Home menu |
| Help Me Think / I'm Stuck | Yes — under Focus stuck tools (not Welcome Home top-level) |
| Hidden developer menus | No dedicated Talk It Out entry found |
| Unfinished navigation | Catalog was finished; chrome wiring was unfinished |

---

## Owners

| Responsibility | File / function |
|----------------|-----------------|
| Expose in navigation data | `lib/estate/welcomeHomeNavigationStructure.ts` |
| Render menu item | `components/companion/estate/EstateRoomExperienceMenu.tsx` |
| Forward Welcome Home openers | `components/companion/estate/EstateTopRightChrome.tsx` |
| Wire CPC → chrome | `app/companion/CompanionPageClient.tsx` (`onOpenTalkItOut`) |
| Open experience | `openTalkItOutCore()` in `CompanionPageClient.tsx` |
| Panel | `components/companion/TalkItOutPanel.tsx` |

---

## Implementation report accuracy

| Claim | Accurate? |
|-------|-----------|
| Available Welcome Home → Take a Moment → Talk It Out | Intended yes; **actually no** until chrome fix |
| First under Take a Moment | Yes in data |
| I'm Stuck pathway | Yes in Focus hub data + CPC handler |

---

## Screenshots

Authenticated screenshots should be captured after refresh:

1. Welcome Home menu top-level → **Take a Moment**  
2. Take a Moment submenu → **Talk It Out** first with support line  
3. Click → Talk It Out panel  
4. Optional: Focus → I'm Stuck → Talk It Out  

*(Capture in authenticated preview; this verification doc records the wiring finding.)*

---

## Deploy recommendation

**Do not deploy** until authenticated walkthrough confirms Talk It Out is visible under Take a Moment and opens successfully.
