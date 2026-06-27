# Companion Workspace Standard v1
## Every Homestead Workspace Shares One Design Language

**Version:** 1.0  
**Status:** Canonical — Clear My Mind is the reference implementation  
**Code:** `lib/companionWorkspaceStandard/` · `components/companion/CompanionWorkspaceShell.tsx`

---

## Primary Goals

1. The room always remains visible.
2. The user always feels surrounded by the Homestead.
3. The workspace feels like it belongs inside the room — not on top of it.
4. The Companion logo appears consistently (bottom left, ~85–90% opacity).
5. Calm, elegant, handcrafted — never generic software chrome.

---

## Universal Workspace Rules

Every workspace includes:

- ✓ Companion logo (bottom left — `CompanionHomesteadLogo`)
- ✓ Living Border (`LivingBorderFrame`)
- ✓ Protected Conversation Zone (`companion-protected-zone`)
- ✓ Frosted glass workspace (`companion-workspace-frosted`)
- ✓ Signature Companion Object in header (`CompanionObjectVisual` feature form)
- ✓ Seasonal room + time-of-day lighting (via `CompanionBackground`)
- ✓ Environmental Truth
- ✓ Communication Anchor
- ✓ No floating portraits inside the workspace panel
- ✓ Calm transitions

---

## Panel Style

Soft frosted glass — rounded corners, subtle shadow, warm edge lighting, no harsh borders.

```css
.companion-workspace-frosted
```

Not an opaque software card on top of the photo.

---

## Living Border

Environmental motion stays **outside** the protected zone:

- Curtains, trees, birds, steam, candle flicker, lamp glow
- Never behind readable text
- `prefers-reduced-motion` respected

---

## Clear My Mind Reference

**Room:** Window Seat (`brain-dump` / `clear-my-mind`)

**Signature object:** Reflection Journal (`sig-reflection-journal`)

**Composition:**
- Left: bookshelf, lamp glow, candle (border)
- Center: frosted journal workspace
- Right: window trees, curtains, bird, steam mug (border)
- Bottom left: Companion logo (global)

**Removed from workspace:**
- Floating Shari portrait
- "I've safely got your thoughts…" embedded copy (belongs in conversation)

**Copy:**
- "What's on your mind?" / "Let's get it out of your head."

---

## Success Test

Open Clear My Mind. Write for 20 minutes.

Occasionally notice curtains, sunlight, a bird, steam, candlelight — **none interrupting work**.

You think: *"I'm sitting somewhere peaceful."*

That is every Companion workspace.

---

## Code Reference

```
lib/companionWorkspaceStandard/tokens.ts
components/companion/CompanionWorkspaceShell.tsx
components/companion/LivingBorderFrame.tsx
components/companion/BrainDumpPanel.tsx
app/companion/companion.css  (Companion Workspace Standard v1 section)
```
