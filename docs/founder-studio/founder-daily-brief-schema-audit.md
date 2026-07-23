# FIRE Portfolio ↔ Complete Executive Brief — Schema Audit

**Date:** 2026-07-23  
**Purpose:** Compare `FireExecutivePortfolio` with the Spark Estate Executive Intelligence Brief specification before the reading-experience redesign.

## Spec sections vs current shape

| Spec section | Represented today? | How | Risk if forced into panels only |
|---|---|---|---|
| Executive Summary | Partial | `executiveSummary[]` (what/why only) | Loses labeled Recommendation / Owner / Timing |
| AI and Technology Intelligence | Missing | — | Would be lost |
| ADHD Entrepreneur Community Intelligence | Missing | — | Would be lost |
| Business, Startup and Market Intelligence | Partial (generic) | `dashboardPanels` / opportunities | Hierarchy lost |
| Competitor and Partnership Intelligence | Missing | — | Would be lost |
| Weak Signals | Missing | Sample `FounderDailyBrief.weakSignals` not on FIRE portfolio | Would be lost |
| Founder Alerts | Partial | `alerts[]` (3 levels exist as attention/awareness/noted) | Missing decision-needed / timing fields |
| Product and Platform Recommendations | Partial | `opportunities.product` | Single string, no item blocks |
| Implementation Plans | Missing | — | Would be lost |
| Marketing Recommendations | Partial | `dashboardPanels` Marketing | Synopsis only |
| Business Growth Recommendations | Partial | `opportunities.revenue` / grow panel | Synopsis only |
| Member Impact | Missing as section | Scattered in whyItMatters | Would be lost as dedicated section |
| Development Recommendations | Partial | Development Progress panel | Synopsis only |
| Izna Daily Work Package | Missing | — | Step-by-step / DoD would be lost |
| Prioritized Founder Action Plan | Partial | `priorities[]` (flat, not Today/Week/Watch) | Timing buckets lost |
| Executive Conclusion | Missing | — | Would be lost |

## Generic panels today

`dashboardPanels` hold six short summaries (Business Momentum, Research, Customer Signals, Development, Marketing, Team). Useful as overview hints — **not** a substitute for full intelligence sections.

## Local daily record

Storage key `spark-estate:founder-fire-portfolios` already stores the full `FireExecutivePortfolio` JSON. An **optional** `executiveBriefDetail` field is backwards-compatible: older records without it still validate; the reading UI builds detail from core fields + adapters when absent.

## Decision

Add `FireExecutiveBriefDetail` as optional portfolio detail. Keep `fire-YYYY-MM-DD` and legacy arrays. Do not collapse the complete brief into dashboard panels.

## 2026-07-23 reading-experience extension

| Concern | Status |
|---|---|
| Multiple intelligence items per section | Yes — `FireBriefSection.items[]` |
| Recommendations / impact / owner / timing / evidence | Yes — optional fields on `FireIntelligenceItem` |
| Izna step-by-step + DoD | Yes — `FireIznaAssignment` |
| Prepared timestamp | Optional `preparedAt` on portfolio + detail display |
| Comparison with previous day | Overview `changedSinceYesterday` or honest `comparisonNote` |
| Member-facing provenance | Gentle string; internal `contentProvenance` kept |
