# Strategy Synthesis Architecture

**Runtime:** `lib/strategyChamber/intelligence/synthesis/`  
**Audit:** `00_SYNTHESIS_AUDIT.md`

## Why synthesis exists

Members rarely face a single-domain decision. Price touches capacity. Growth touches delivery. Hiring touches focus. Synthesis lets Shari hold the whole decision without sounding like several modules taking turns.

## Product rule

Multiple domains may contribute. The member hears **one** connected strategic experience.

Never surface: “Pricing says…”, “Growth says…”, “Capacity says…”, confidence scores, or orchestration jargon.

## Authority boundary

| Layer | Owns |
|-------|------|
| Synthesis | Primary/secondary selection, contributions, conflicts, integrated question/next-gap hints, option **pattern candidates**, warm recommendation **copy** |
| Shared Strategy engine | Next-thinking-move, option readiness, decision readiness, stages, confirmation, ≤3 options, live `StrategicOption` / risk / experiment / recommendation objects |
| Strategy Work Item | Source of truth |

Domain knowledge advises. The shared engine decides when intelligence is used.

## Pipeline

1. Select primary domain from full context  
2. Load at most one secondary when threshold + pair registry allow  
3. Extract budgeted contributions  
4. Dedupe / merge equivalents  
5. Detect and resolve conflicts (internal)  
6. Produce one strategic question, one next-question gap, pattern candidates, trade-offs, risk summaries, experiment hint, recommendation copy  
7. Shared engine generates live options / moves / Decision Record enrichment  

## Adaptive Companion

Presentation only — Fewer Choices, One Step, Summary First, More Structure, Talk Freely, Examples, Big Picture. Does not load more domains or expose more internal detail.
