# Momentum Institute™ — Curriculum Development

**Status:** Curriculum Development phase — architecture complete, content authoring begins.

## Important

**Cursor does not create curriculum.** Shari and ChatGPT author educational content. That content is **proprietary intellectual property of Visual Spark Studios**.

This folder holds authored assets. The **delivery engine** lives in `lib/momentumInstitute/curriculum/`.

## Folder structure

```
curriculum/
  curriculum-registry.json     # Central index (auto-updated by scan script)
  knowledge-cards/             # One markdown file per Knowledge Card™
    marketing/
      KC-001-why-people-buy.md
      KC-002-trust-before-transaction.md
      ...
  business-mastery-minutes/
  apprenticeships/
  business-labs/
  simulations/
  challenges/
  worksheets/
```

## Adding a Knowledge Card™

1. Copy `knowledge-cards/_TEMPLATE.md` into the right department folder.
2. Fill frontmatter metadata and all fifteen sections.
3. Set `status: draft` while authoring; `published` when ready for members.
4. Run `npm run curriculum:scan` from `companion-app/` to refresh the registry.

## Metadata (required frontmatter)

| Field | Description |
|-------|-------------|
| `id` | Unique id, e.g. `KC-001-why-people-buy` |
| `title` | Member-facing title |
| `college` | Optional college label |
| `department` | e.g. `marketing` |
| `drawer` | Knowledge collection slug |
| `competencies` | Competency slugs (YAML array) |
| `difficulty` | foundational · intermediate · advanced · expert |
| `estimated_time` | Minutes |
| `related_cards` | Optional related card ids |
| `related_apprenticeships` | Optional |
| `related_business_labs` | Optional |
| `related_simulations` | Optional |
| `related_challenges` | Optional |
| `status` | draft · review · published · archived |
| `author` | Author name |
| `version` | Semver |
| `last_updated` | ISO date |

## Delivery components

`components/companion/momentumInstitute/curriculum/`

- `KnowledgeCardViewer` — full fifteen-section card
- `BusinessMasteryMinute` — fast grounding
- `ReflectionPanel` · `TryItThisWeek` · `MakeItMine`
- `CompetencyLinks` · `SaveActions` · `ProgressTracker`

## Related docs

- [KNOWLEDGE_CARD_FRAMEWORK.md](../KNOWLEDGE_CARD_FRAMEWORK.md) — fifteen-section standard
- [MOMENTUM_INSTITUTE_ARCHITECTURE.md](../../MOMENTUM_INSTITUTE_ARCHITECTURE.md)
