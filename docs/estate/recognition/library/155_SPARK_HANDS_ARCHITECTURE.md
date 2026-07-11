# 155_SPARK_HANDS_ARCHITECTURE

# Spark Estate™
## Spark Hands™ Architecture

**Version:** 1  
**Status:** Architecture  
**Date:** 2026-07-09  
**Concept:** External services are Spark's hands — not member destinations

**Related:**
- [154 Clear My Mind Experience Architecture](./154_CLEAR_MY_MIND_EXPERIENCE_ARCHITECTURE.md)
- [156 Destination Gallery™](./156_DESTINATION_GALLERY_ARCHITECTURE.md) — member chooses outcome crystals
- Settings → Connections (current connect surface)
- Founder Executive Integration Center (internal tooling — not the member model)

---

## Purpose

Spark Estate™ should never feel like a collection of apps.

External services are not destinations.  
They are Spark's hands.

Members interact with Spark.  
Spark interacts with connected services.

---

## Core Principle

Never ask members to "go to" Google Calendar, Google Docs, Google Drive, Facebook, LinkedIn, Pinterest, or other services.

Instead Spark naturally offers actions at the appropriate moment.

Examples:

- Would you like me to schedule this?
- Would you like me to save this?
- Would you like me to publish this?
- Would you like me to store a copy?

The member chooses the outcome.  
Spark chooses the connected service.

---

## Connections Conservatory™

One beautiful estate location where members connect accounts one time.

Connections may include:

- Google Calendar
- Google Drive
- Google Docs
- Gmail
- Facebook
- Instagram
- LinkedIn
- Pinterest
- YouTube
- Canva
- HighLevel (GHL)

After setup members rarely need to visit again.

**Note (runtime today):** Account linking currently lives under Settings → Connections. Connections Conservatory™ is the intended Estate place for one-time setup; do not route members into external apps as destinations.

---

## Connected Account Profile

Each connection stores:

- Connected status
- Purpose
- Default behaviors
- Project preferences
- Publishing preferences
- Permissions

---

## Spark Behaviors

Writing complete?

→ Offer to save.

Meeting discussed?

→ Offer to schedule.

Social content finished?

→ Offer to publish.

Project completed?

→ Offer to store a copy.

Spark never exposes unnecessary technical steps.

---

## Publishing Intelligence

Spark remembers preferred destinations.

Example:

| Content type | Preferred hands |
|--------------|-----------------|
| Long-form content | Google Docs |
| Master copy | Google Drive |
| Social | LinkedIn · Facebook · Pinterest |

Members can override at any time.

---

## Storage Intelligence

Spark learns where members prefer to store:

- Documents
- Images
- Videos
- Research
- Templates
- Projects

---

## Calendar Intelligence

Calendar is a universal utility.

Scheduling should be offered naturally during conversation.

Members never browse calendars inside Spark Estate™.

---

## Design Philosophy

Members interact with Spark.

Spark quietly uses connected services behind the scenes.

Technology disappears.  
The companion remains.

---

## Success Criteria

- Spark Estate™ feels like a companion, not an app.
- Members think in outcomes.
- Spark handles the technology.

---

## Implementation notes (non-binding)

| Layer | Intent |
|-------|--------|
| Conversation | Offer outcome verbs (schedule / save / publish / store) — never “open Google…” |
| Connections Conservatory™ | One-time connect place; rare return visits |
| Hands runtime | Map outcomes → connected services using preferences + permissions |
| Anti-pattern | Deep-linking members into third-party UIs as the primary path |

This document is architecture. Runtime wiring of each hand is separate work.
