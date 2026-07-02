# Momentum Institute™ — Curriculum Development

**Milestone:** Architecture complete → Curriculum Development begins.

## Division of responsibility

| Role | Responsibility |
|------|----------------|
| **Shari + ChatGPT** | Author Knowledge Cards™, experiences, worksheets |
| **Cursor / engineering** | Curriculum delivery system only |
| **Visual Spark Studios** | Owns all educational content as proprietary IP |

## Curriculum folder

`docs/momentum-institute/curriculum/`

One file per asset. Knowledge Cards live under `knowledge-cards/{department}/`.

## Delivery engine

| Layer | Location |
|-------|----------|
| Types & parser | `lib/momentumInstitute/curriculum/` |
| Registry | `registry.ts` + `curriculum-registry.json` |
| Server loader | `lib/momentumInstitute/curriculum/server/loader.ts` |
| Catalog compiler | `compiler.ts` — markdown → `KnowledgeCardDefinition` |
| UI components | `components/companion/momentumInstitute/curriculum/` |

## Authoring workflow

1. Copy `knowledge-cards/_TEMPLATE.md`
2. Author fifteen sections + frontmatter metadata
3. `npm run curriculum:scan` — refresh registry
4. POST `/api/momentum-institute/curriculum` — load into runtime (dev)
5. Set `status: published` when ready for members

## Scale

Designed for **thousands of cards over many years** — one markdown file per card, indexed registry, lazy server load, no content in code.

## Tests

`lib/momentumInstitute/curriculum/curriculum.test.ts`
