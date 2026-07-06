# Founder Studio™ — Executive Value Score

**Permanent prioritization system for GitHub issues and sprint planning**

| | |
|---|---|
| **Status** | Binding |
| **Goal** | Highest-value work first — not the most exciting work |
| **Parent** | [ARCHITECTURE_FREEZE.md](./ARCHITECTURE_FREEZE.md) · [NO_FEATURE_CREEP.md](./NO_FEATURE_CREEP.md) |

---

## The nine dimensions

Score each issue **0–10** per dimension. Use half-points when uncertain.

| Dimension | 0 | 10 |
|-----------|---|-----|
| **Founder Value** | No benefit to Shari's executive day | Transforms daily headquarters experience |
| **Member Value** | No member impact | Directly improves member outcomes |
| **Strategic Value** | Off-mission | Advances core studio strategy |
| **Development Effort** | Trivial (invert: 10 = low effort) | Massive undertaking (invert: 0 = high effort) |
| **Automation Potential** | One-time manual win | Compounds via automation forever |
| **Time Saved** | No time saved | Saves hours per week, reliably |
| **Competitive Advantage** | Commodity / ChatGPT parity | Unique to Spark institutional memory |
| **Founder Delight** | Feels like software | Feels like the finest executive office |
| **Long-Term Reusability** | Throwaway | Foundation for years of enrichment |
| **Executive Leverage** | Shari does more work | Shari decides; Founder prepared |

**Note on Development Effort:** Higher score = *less* effort (easier to ship). This keeps the formula aligned with "value per unit of work."

---

## Recommended formula

```
Priority Score = (
  Founder Value × 3.0 +
  Executive Leverage × 2.5 +
  Time Saved × 2.0 +
  Strategic Value × 2.0 +
  Competitive Advantage × 1.5 +
  Member Value × 1.5 +
  Automation Potential × 1.5 +
  Founder Delight × 1.0 +
  Long-Term Reusability × 1.0 +
  Development Effort × 1.0
) / 18.0
```

**Result:** 0–10 priority score. Sort descending. Work top of backlog first.

### Weight rationale

| Weight | Why |
|--------|-----|
| Founder Value ×3 | Founder exists for Shari's executive effectiveness |
| Executive Leverage ×2.5 | Preparation beats features |
| Time Saved ×2 | Measurable ROI for a solo executive |
| Strategic Value ×2 | Studio direction, not side quests |
| Competitive Advantage ×1.5 | Moat over generic AI |
| Member Value ×1.5 | Studio serves members; founder work must connect |
| Automation ×1.5 | Leverage compounds |
| Delight ×1 | Important but never over shiny UX |
| Reusability ×1 | Intelligence-ready architecture pays forward |
| Effort ×1 | Easier wins when value is equal |

---

## Issue template

```markdown
## Executive Value Score

| Dimension | Score (0–10) | Notes |
|-----------|--------------|-------|
| Founder Value | | |
| Member Value | | |
| Strategic Value | | |
| Development Effort | | (10 = easy) |
| Automation Potential | | |
| Time Saved | | |
| Competitive Advantage | | |
| Founder Delight | | |
| Long-Term Reusability | | |
| Executive Leverage | | |

**Priority Score:** ___

## No Feature Creep
_/8 yes — see NO_FEATURE_CREEP.md
```

---

## Thresholds

| Priority Score | Action |
|----------------|--------|
| **≥ 7.5** | Next sprint candidate |
| **6.0 – 7.4** | Backlog — schedule when capacity |
| **4.0 – 5.9** | Redesign as refinement or split |
| **< 4.0** | Reject or parking lot |

During architecture freeze, issues proposing **new engines or rooms** require score **≥ 8.0** plus Shari override.

---

## Anti-patterns

| Do not prioritize because… | Prioritize instead because… |
|----------------------------|----------------------------|
| It's technically interesting | It saves Shari time weekly |
| Competitor has it | Spark institutional memory makes it uniquely valuable |
| Developer velocity is high | Executive leverage is high |
| UI mockup looks beautiful | Founder Delight + reduced cognitive load are evidenced |
| "We've always wanted…" | Strategic Value + Member Value are scored |

---

## Review cadence

- **Weekly:** Re-sort top 10 by Priority Score  
- **Monthly:** Drop items below 4.0 unless strategic exception  
- **Quarterly:** Recalibrate weights with Shari if backlog misaligns with reality  

The goal is not perfect scoring. The goal is **resisting exciting low-value work**.
