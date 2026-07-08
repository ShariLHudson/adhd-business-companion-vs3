# Spark Authoring Guide

Quick reference from **SPARK_NOTE_CONTENT_LIBRARY_MASTER_STANDARD.md**.

## Every Spark delivers

1. Curiosity  
2. Learning  
3. Meaning  
4. Connection  

## Record checklist

| Field | Guidance |
|-------|----------|
| `spark_id` | `SPARK-INV-001` format — never reuse |
| `title` | Short, curiosity-driven |
| `category` | See master standard categories |
| `subcategory` | e.g. accidental discoveries, leadership |
| `short_teaser` | One sentence hook |
| `story` | Conversational — who, what, when, how |
| `impact` | Why it matters for life, business, creativity |
| `spark_application` | Reflection question ending with `?` |
| `tags` | innovation, creativity, entrepreneurship, … |
| `date_rules` | `evergreen`, specific date, or season |
| `status` | draft → review → active |

## Story structure (card sections)

1. **Teaser** — the interesting idea  
2. **Story** — what happened  
3. **Impact** — why it matters  
4. **Spark It** — connection question  

## Quality tests (before publish)

Run `npm run spark-library:validate` — checks:

- **Curiosity** — would someone open this?  
- **Story** — is there a real narrative?  
- **Connection** — can the user apply it?  
- **Simplicity** — quick to understand  
- **Spark** — positive feeling or idea  

## ID prefixes

| Prefix | Category |
|--------|----------|
| INV | Inventions |
| ENT | Inspiring people / entrepreneurs |
| BIZ | Business lessons |
| HIS | History |
| HOL | Holidays |
| FUN | Fun facts |
| CRE | Creativity |
| GRO | Personal growth |
| ADHD | ADHD-friendly |
| QTE | Quotes |

See `lib/sparkNote/contentDatabase/categoryTaxonomy.ts` for full taxonomy.
