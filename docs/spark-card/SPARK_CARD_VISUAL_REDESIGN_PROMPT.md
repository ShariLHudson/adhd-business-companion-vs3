# Spark Estate — Spark Card Visual Redesign Prompt
## Rebuild the Current Spark Cards to Match the Approved Reference Design

# Mission

Redesign the existing Spark Cards so they visually match the approved reference image:

`/mnt/data/spark-card-design(2).png`

The new Spark Cards must use the same overall visual language, composition, richness, warmth, and collectible quality shown in the reference.

This is a visual and interaction redesign only.

Do not remove any information, capabilities, categories, actions, metadata, personalization, saved-state behavior, or other content currently supported by Spark Cards.

The redesigned card must preserve everything the current Spark Card already contains while presenting it in this new approved format.

---

# Core Design Direction

The Spark Card should feel like:

- a small illustrated treasure
- a collectible card
- warm and whimsical
- beautifully crafted
- visually rich but still readable
- distinctive from a normal dashboard card
- emotionally uplifting
- polished enough to feel premium
- inviting enough that the user wants to open it

It should not look like:

- a plain white content panel
- a generic SaaS card
- a blog post
- a flat dashboard tile
- a simple bordered box
- a modern corporate information card
- a dense wall of text

The approved reference is the visual source of truth.

---

# Overall Card Composition

Use a large illustrated card with:

- warm parchment or cream base
- decorative gold frame
- subtle layered paper texture
- rounded corners
- dimensional edges
- soft shadow
- ornamental corner details
- teal, gold, cream, warm brown, and selective accent colors
- illustrated artwork that supports the card topic
- clear hierarchy between title, story, facts, meaning, use, and action

The card should feel handmade, storybook-inspired, and premium.

---

# Required Visual Sections

## 1. Spark Category Badge

Place a category label near the upper-left area.

Examples:

- Weird Holiday
- History of Inventions
- Today in History
- Funny Fact
- Business Person
- Quote
- Nature
- Innovation
- Kindness
- Curiosity
- Science
- Inspiration

Design:

- deep teal badge
- beveled or dimensional treatment
- small icon
- uppercase readable label
- gold or warm accent
- visually consistent across categories

Use the current Spark Card category data.

Do not reduce or replace the existing category system.

## 2. Main Title Area

Include:

- main Spark Card title
- optional subtitle or emotional hook
- decorative accent below the title

The title should be large, elegant, and highly readable.

The subtitle may use a handwritten or script-style treatment when appropriate, but must remain readable.

Use the current card title and subtitle content.

Do not fabricate replacement text if the current card already has approved copy.

## 3. Main Illustration

Use one large topic-specific illustration as the visual anchor.

The illustration should:

- relate directly to the card subject
- feel integrated into the card rather than pasted on
- use a watercolor, storybook, vintage editorial, or lightly painted style
- remain warm and uplifting
- support the information without obscuring it
- avoid photorealistic stock-image styling
- avoid overly childish cartoon styling

The visual may include multiple small subject elements when useful.

## 4. Spark Story / Main Content

Present the main explanatory content as a short engaging story.

This content should preserve everything currently shown in the Spark Card's main content area.

It should:

- explain what happened
- give enough context to be interesting
- feel conversational
- remain concise enough to fit visually
- use readable body text
- avoid tiny type

If the current content is longer than the visible card allows, use progressive disclosure, a More Details panel, an expandable section, an information icon, or a secondary full-card view.

Never silently delete content.

## 5. Supporting Insight Panels

Use a row or grouped set of visual panels similar to the approved reference.

Possible sections include:

- How It Came About
- Impact on the World
- Fun Fact
- How You Can Use This Spark
- Why It Matters
- What Happened Next
- Today’s Connection
- Spark Takeaway

The actual headings must come from the current Spark Card data and content model.

Do not force every card into identical headings if the current card has different information.

Each section should have:

- a distinct icon
- a short heading
- readable text
- light visual separation
- no heavy dashboard borders

## 6. Spark in Action

Create a visually distinct action area near the bottom.

This should preserve the current card's action, reflection, prompt, or next-step content.

Design:

- prominent but not overwhelming
- warm accent
- heart, spark, flame, star, or lightbulb icon as appropriate
- clear action sentence
- optional handwritten encouragement line
- strong enough to feel actionable

Use the current card's actual action content.

Do not replace existing actions with generic text.

## 7. Footer Line

Add a small warm footer phrase or card identity line.

Use either the existing approved Spark Card footer, a category-specific footer, or the current card's closing line.

Do not add repetitive copy if the card already contains a closing message.

---

# Preserve Everything the Current Card Has

The redesign must retain all current Spark Card capabilities and content, including where applicable:

- card title
- subtitle
- category
- date
- weird holiday name
- history content
- invention content
- quote
- source or attribution
- business-person content
- fun facts
- main story
- why it matters
- inspiration
- positive impact
- takeaway
- practical application
- Spark in Action
- reflection question
- user action
- saved state
- favorite state
- completion state
- viewed state
- date viewed
- related topic
- personalization
- accessibility text
- audio or read-aloud capability
- print
- save
- edit where allowed
- share
- export
- archive
- delete
- restore
- category filtering
- date filtering
- person filtering
- collapsed state
- expanded state
- daily card behavior
- card history
- saved-card library
- navigation
- analytics or internal tracking currently used

Do not remove functionality merely because it is not visible in the reference image.

Place secondary actions inside a discreet `More` menu when needed.

---

# Collapsed State

Create a compact collapsed version similar to the lower-right example in the reference.

The collapsed state should show:

- thumbnail illustration
- small Spark label
- title
- short subtitle or one-line summary
- category icon
- expand control

The collapsed state should still feel decorative and premium.

It must not become a plain list row.

Clicking the card or expand control should open the full Spark Card.

---

# Expanded State

The expanded state should show the complete card experience.

It should include all current card information either directly on the card, in expandable sections, in a connected details panel, or in a scrollable interior when absolutely necessary.

Do not reduce font size excessively to force everything onto one static screen.

Readability is more important than showing all content simultaneously.

---

# Responsive Behavior

## Desktop

- preserve the premium full-card composition
- maintain balanced spacing
- use the illustration as a major visual element
- keep text readable
- avoid overly wide text lines

## Tablet

- allow content panels to wrap
- preserve decorative framing
- retain image prominence
- keep actions usable

## Mobile

Do not shrink the desktop card until the text becomes unreadable.

Instead:

- stack sections vertically
- preserve the decorative frame
- keep title and artwork prominent
- maintain large type
- use accordions for secondary information
- keep Spark in Action visible
- preserve the collectible feel

---

# Readability Requirements

- title must be large and prominent
- subtitle must be clearly legible
- section headings must be bold and distinct
- body text must remain comfortable to read
- actions must be obvious and tappable
- text must contrast strongly with parchment
- no text may sit directly over busy artwork without a readable panel
- no washed-out frosted-glass overlays
- no tiny informational copy

---

# Visual Style Tokens

Use the existing Spark Estate brand system where possible.

Recommended palette direction:

- Deep Teal: `#0F6F7C`
- Aqua: `#30B6D5`
- Gold: `#F5C16C`
- Bronze: `#C8922E`
- Light Gold: `#FFD98A`
- Charcoal: `#2E2E2E`
- Warm parchment and cream neutrals

Accent colors may vary by section:

- heart: warm rose or red
- fun fact: green
- use this spark: violet or indigo
- category badge: teal and gold
- decorative frame: gold and bronze

Do not make the card look rainbow-colored or visually chaotic.

---

# Typography

Use a refined hierarchy:

- elegant serif for the main title
- readable serif or humanist typeface for body text
- restrained handwritten/script accent for subtitles or short handwritten notes
- clean uppercase sans serif for small category labels and section headings

Do not use script fonts for long paragraphs.

Do not use more than three coordinated type styles on one card.

---

# Content Adaptation Rules

Different Spark Card categories may need slightly different internal layouts.

## Weird Holiday

May include:

- what the holiday is
- why it exists
- fun fact
- how to celebrate
- Spark in Action

## Invention

May include:

- origin story
- accidental discovery
- impact
- surprising fact
- how to use the idea today

## Today in History

May include:

- what happened
- context
- why it mattered
- surprising detail
- today's connection

## Quote

May include:

- quote
- attribution
- context
- meaning
- reflection
- Spark in Action

## Business Person

May include:

- person
- what they built
- challenge
- turning point
- lesson
- practical application

The visual shell should remain consistent while the internal section labels adapt.

---

# User Actions

The full card must support applicable universal actions.

Visible actions may include:

- Save
- Favorite
- Expand or Collapse

Inside `More`:

- Print
- Share
- Export
- Archive
- Delete
- Restore when applicable
- Edit where permitted

Do not clutter the face of the card with all actions at once.

---

# Daily Spark Card Behavior

Preserve the current daily Spark Card behavior.

The redesigned card should still:

- appear as the daily card
- use the correct date
- rotate across approved categories
- avoid repeating the same category too frequently
- save separately when the user chooses
- remain available in saved Spark Cards or history
- support filters by topic, date, or person where already designed

The redesign must not break the content-selection engine.

---

# Implementation Requirement

Do not rebuild Spark Cards as a disconnected prototype.

Update the actual reusable Spark Card component used throughout the platform.

Use one adaptable design system for:

- full card
- collapsed card
- saved-card view
- daily-card view
- mobile view
- print view

Avoid separate implementations that drift apart.

---

# Print View

The print version should retain:

- decorative card frame
- title
- category
- main illustration
- story
- key insight sections
- Spark in Action
- date
- relevant attribution

Remove:

- navigation
- hover controls
- audio controls
- More menus
- unrelated platform chrome

Ensure the printed version remains readable and does not split important sections awkwardly.

---

# Testing Requirements

Test the redesign with at least:

1. Weird Holiday card
2. Invention card
3. Today in History card
4. Funny Fact card
5. Quote card
6. Business Person card
7. Long-content card
8. Short-content card
9. Card with attribution
10. Card with all supported actions

Test:

- desktop
- tablet
- mobile
- expanded state
- collapsed state
- saved state
- print
- keyboard navigation
- screen reader labels
- long titles
- long subtitles
- missing illustration fallback
- image loading failure
- content overflow

---

# Acceptance Criteria

- [ ] Spark Cards visually match the approved reference design.
- [ ] Cards have a warm parchment base and decorative gold frame.
- [ ] Cards feel illustrated, premium, whimsical, and collectible.
- [ ] The category badge appears near the top.
- [ ] The title and subtitle are prominent.
- [ ] A strong topic-specific illustration anchors the card.
- [ ] Main story content is preserved.
- [ ] Supporting insights are clearly organized.
- [ ] Spark in Action remains prominent.
- [ ] The collapsed state matches the same design language.
- [ ] Everything the current Spark Card contains is preserved.
- [ ] No functionality is removed.
- [ ] Secondary actions remain accessible.
- [ ] Mobile text remains readable.
- [ ] Print remains functional.
- [ ] Existing saved cards and history remain intact.
- [ ] All current Spark Card categories continue to work.

---

# Final Experience

The user should open a Spark Card and feel that they have received a small, beautifully designed discovery made especially for them.

It should look and feel like the approved reference image while still containing every piece of information and every capability supported by the current Spark Card.
