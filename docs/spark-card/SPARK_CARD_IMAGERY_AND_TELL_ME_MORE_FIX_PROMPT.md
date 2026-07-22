# Spark Estate — Spark Card Imagery and “Tell Me More” Expansion Fix
## Cursor / Claude Implementation Prompt

*(Archived verbatim from `c:\Users\Shari\Downloads\spark-estate-spark-card-imagery-and-tell-me-more-fix.md` — authoritative source prompt for the implementation documented in `SPARK_CARD_IMAGERY_AND_TELL_ME_MORE_FIX_REPORT.md`.)*

# Mission

Improve Spark Cards so they feel visually delightful, collectible, and genuinely rewarding to explore.

Two problems must be fixed:

1. The cards are not using enough fun, topic-specific imagery.
2. `Tell Me More` repeats or lightly rephrases information already visible on the front of the card instead of revealing new content.

The front of the card should create curiosity.

`Tell Me More` should reward that curiosity with additional facts, context, imagery, and discoveries that were not already shown.

Do not solve this by adding more plain text.

The expanded experience must feel like opening a second layer of the card.

---

# Product Principle

A Spark Card should not feel like a short article inside a box.

It should feel like:

- a small illustrated discovery
- a collectible treasure
- something fun to open
- visually engaging before the user reads
- worth expanding because there is something new inside

The card should combine:

- story
- surprise
- illustration
- visual details
- useful meaning
- one small action

---

# Front of Card vs. Tell Me More

## Front of Card

The front should contain only the strongest first layer:

- category
- title
- subtitle
- one main illustration
- short story or introduction
- Today's Spark
- Spark in Action
- save/favorite/share controls

The front should not contain every available fact.

Its job is to create interest and provide one complete, satisfying spark.

## Tell Me More

`Tell Me More` must reveal genuinely new information.

It must not:

- repeat the front story
- paraphrase Today's Spark
- repeat Spark in Action
- add one generic reflection paragraph
- merely expand the same copy into more words

It should add a second layer such as:

- behind-the-scenes story
- surprising facts
- historical context
- how it changed over time
- who was involved
- unexpected connection
- real-world examples
- visual timeline
- mini gallery
- object details
- map
- comparison
- quote or excerpt
- "what happened next"
- "look closer" details
- category-specific discoveries

---

# Required Expanded Content Model

Create separate content fields for the front and expanded states.

Suggested model:

```ts
type SparkCardContent = {
  front: {
    category: string;
    title: string;
    subtitle?: string;
    introStory: string;
    todaysSpark: string;
    sparkInAction: string;
    heroImage: SparkImage;
  };

  expanded: {
    newFacts: SparkFact[];
    deeperStory?: string;
    whatHappenedNext?: string;
    unexpectedConnection?: string;
    visualModules: SparkVisualModule[];
    gallery?: SparkImage[];
    timeline?: SparkTimelineItem[];
    sources?: SparkSource[];
    reflectionPrompt?: string;
  };
};
```

The expanded fields must be generated independently from the front fields.

Do not construct `Tell Me More` by concatenating the front content.

---

# New-Information Requirement

Before rendering `Tell Me More`, run a duplication check.

The expanded content must add new information in at least three of these categories:

- new fact
- new person or contributor
- new date or sequence
- new context
- new consequence
- new example
- new visual detail
- new connection to today
- new practical use
- new source or attribution

If fewer than three genuinely new elements exist, do not show the expanded state as complete.

---

# Fun Imagery Requirement

Every Spark Card should contain more than a generic placeholder panel.

The primary image should be:

- topic-specific
- playful or delightful where appropriate
- visually rich
- integrated with the card
- consistent with the approved illustrated Spark Card style

## Required visual approach

Use:

- storybook illustration
- watercolor or painted editorial imagery
- vintage ephemera
- illustrated objects
- playful handwritten notes
- small decorative discoveries
- visual labels
- mini diagrams
- maps
- timelines
- object close-ups
- fun supporting icons

Avoid:

- generic emoji in a blank box
- a single sprout icon standing in for the entire topic
- flat corporate illustrations
- stock-photo rectangles
- empty colored panels
- text-only expanded views

---

# Hero Image Rules

The front of every card should have one strong visual anchor.

Examples:

## Weird Holiday

- illustrated celebration scene
- calendar page
- themed objects
- playful visual joke

## Invention

- object sketch
- inventor's desk
- early prototype
- diagrams or labels

## Today in History

- scene illustration
- historical object
- map
- timeline fragment

## Business Person

- illustrated portrait
- workspace
- meaningful object
- visual milestone

## Nature

- botanical illustration
- animal or landscape
- close-up detail
- seasonal scene

## Quote

- illustrated scene inspired by the quote
- symbolic objects
- handwritten display treatment

---

# Supporting Imagery

The expanded view should include at least two additional visual elements when the content supports them.

Possible visual modules:

- image gallery
- then-and-now comparison
- mini timeline
- map
- illustrated fact cards
- labeled object
- before-and-after
- quote card
- "look closer" panel
- animated detail
- collectible sticker or badge
- small visual quiz

These visuals must add meaning, not decoration only.

---

# Example: Summer's Open Door

## Front

Keep:

- category
- title
- subtitle
- a short seasonal story
- Today's Spark
- Spark in Action
- one large illustrated summer scene

## Tell Me More

Add new content such as:

- why summer historically became associated with travel and exploration
- a surprising fact about local "micro-adventures"
- three illustrated examples:
  - sunrise walk
  - new neighborhood café
  - picnic in an unfamiliar park
- a mini "choose your adventure" visual
- a seasonal color or object gallery
- a "look closer" fact about daylight or seasonal routines
- one optional reflection question

Do not repeat:

> A change of pace can reset creativity.

That insight is already on the front.

---

# Category-Specific Tell Me More Modules

## Weird Holiday

Expanded view may include:

- origin of the holiday
- how people celebrate
- surprising regional variations
- visual celebration ideas
- illustrated "try this today" options

## Invention

Expanded view may include:

- original failed idea
- prototype
- key contributor
- what happened next
- visual evolution
- how the invention is used today

## Today in History

Expanded view may include:

- timeline
- map
- key people
- lesser-known fact
- consequence
- artifact image

## Funny Fact

Expanded view may include:

- why the fact is true
- visual explanation
- comparison
- related surprising fact
- mini quiz

## Business Person

Expanded view may include:

- turning point
- early challenge
- visual timeline
- notable decision
- business lesson
- lesser-known personal detail

## Nature

Expanded view may include:

- habitat
- life cycle
- close-up anatomy
- behavior
- conservation note
- seasonal observation

---

# Interaction Design

When the user clicks `Tell Me More`, the card should feel like it opens.

Recommended behavior:

- expand vertically or open a connected panel
- reveal visual modules progressively
- use a subtle unfolding or page-turn animation
- keep the original card context visible
- avoid forcing the user into a long plain-text modal

The first expanded section should be visual, not another paragraph.

Example order:

1. visual reveal
2. surprising fact
3. deeper story
4. image or timeline
5. optional reflection
6. sources

---

# Progressive Disclosure

Do not display all expanded content in one dense wall.

Use sections such as:

- Look Closer
- What Happened Next
- Surprising Connection
- See It Differently
- Try This
- Sources

Allow sections to expand individually.

---

# Content Generation Rules

When generating a new Spark Card:

1. Create the front content.
2. Create expanded content separately.
3. Compare the two.
4. Remove repeated facts.
5. Add visual concepts for both states.
6. Verify that `Tell Me More` contains at least three new discoveries.
7. Verify that at least one expanded module is primarily visual.

Do not approve the card if `Tell Me More` is only a longer version of the front.

---

# Image Generation / Selection Rules

For each card, store:

- hero image prompt
- expanded image prompts
- alt text
- focal point
- crop guidance
- category style
- visual consistency metadata

Suggested model:

```ts
type SparkImage = {
  id: string;
  role: "hero" | "gallery" | "timeline" | "detail" | "comparison";
  prompt: string;
  alt: string;
  focalPoint?: string;
  styleKey: string;
};
```

All generated imagery should use a shared Spark Card visual style key so cards feel like one collection.

---

# Fallback Behavior

If a generated image is unavailable:

- show a topic-specific illustrated fallback
- do not show a blank color panel
- do not show a generic sprout, star, or flame unrelated to the topic

Fallbacks should still be category-specific.

---

# Accessibility

- every image needs useful alt text
- decorative imagery should be marked decorative
- text must not be embedded only inside images
- expanded content must remain keyboard accessible
- image galleries need previous/next labels
- reduced-motion users should not receive forced unfolding animation
- visual modules need text equivalents where necessary

---

# Print Behavior

The printed Spark Card may include:

- hero illustration
- selected expanded visuals
- deeper story
- new facts
- Spark in Action
- sources

Do not print UI controls.

Avoid printing a blank placeholder where an image should appear.

---

# Testing Requirements

Test at least:

1. Summer / seasonal card
2. Weird Holiday card
3. Invention card
4. Today in History card
5. Business Person card
6. Nature card
7. Quote card
8. Short-content card
9. Long-content card
10. Card with multiple expanded visuals

For every test card, verify:

- hero image is topic-specific
- front is not overloaded
- Tell Me More adds at least three new facts or discoveries
- Tell Me More includes at least one meaningful visual module
- no paragraph is repeated from the front
- Today's Spark is not repeated
- Spark in Action is not repeated
- expanded view is not a plain text wall
- mobile layout remains readable
- print includes useful imagery

---

# Acceptance Criteria

- [ ] Spark Cards use fun, topic-specific imagery.
- [ ] Generic placeholder image panels are removed.
- [ ] Every card has a meaningful hero illustration.
- [ ] Tell Me More reveals genuinely new information.
- [ ] Tell Me More does not repeat the front.
- [ ] Expanded content adds at least three new discoveries.
- [ ] Expanded content contains meaningful visual elements.
- [ ] The first expanded section is visual or highly visual.
- [ ] Category-specific visual modules are supported.
- [ ] Cards remain collectible, warm, and whimsical.
- [ ] Save, favorite, share, print, and other existing actions remain intact.
- [ ] Accessibility and print behavior remain functional.

---

# Final Experience

The front of the Spark Card should make the user curious.

The imagery should make them smile or want to look closer.

When they choose `Tell Me More`, they should feel:

> Oh, there is actually more here.

They should discover new facts, new visuals, and new connections—not simply reread the same card in longer form.
