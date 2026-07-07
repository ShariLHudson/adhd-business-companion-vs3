# Discovery Content Template

Copy into `discovery-library.json` → `items` array. Set `status` to `"Draft"`.

## Standard structure (every Discovery Entry)

| Field | Purpose |
|-------|---------|
| **title** | Member-facing headline |
| **discoveryText** | Discovery — the main body |
| **whyItMatters** | Why This Matters |
| **foodForThought** | Food for Thought (optional) |
| **primaryButton** | Primary Button label |
| **companionResponse** | What Spark says when the button is tapped — turns the card into a conversation |
| **destinationRoute** + **destinationType** | Destination (optional — conversation-only entries omit these) |
| **relatedRoom** | Related Room |
| **relatedFeature** | Related Feature |
| **relatedSparkCards** | Future Spark Card connection |
| **collectionId** | Discovery Collection slug (e.g. `welcome-to-spark-estate`) |

```json
{
  "id": "DISC-XXX",
  "status": "Draft",
  "priority": "Helpful",
  "category": "welcome",
  "collectionId": "welcome-to-spark-estate",
  "title": "Title Here",
  "subtitle": null,
  "image": null,
  "discoveryText": "Discovery body — warm, human, trust-first.",
  "whyItMatters": "Why this matters to the member.",
  "foodForThought": "Optional reflection question.",
  "primaryButton": "Continue",
  "companionResponse": "What Spark says when the member taps the button.",
  "destinationRoute": null,
  "destinationType": null,
  "saveAllowed": true,
  "relatedRoom": null,
  "relatedFeature": null,
  "relatedTool": null,
  "relatedSparkCards": [],
  "targetRegistry": "estate-rooms",
  "targetId": "sunroom",
  "triggerRules": [],
  "tags": [],
  "keywords": [],
  "version": 1,
  "createdAt": "2026-07-06",
  "lastUpdated": "2026-07-06",
  "author": "Shari",
  "editorial": {
    "reviewNotes": null,
    "approvedAt": null
  },
  "future": {
    "scheduling": null,
    "seasonal": null,
    "featured": false,
    "translations": null,
    "memberSegments": null,
    "difficulty": null,
    "estimatedReadingMinutes": null
  }
}
```

## Checklist before Review

- [ ] `targetId` exists and is **Live** in Estate Knowledge Base™
- [ ] `relatedRoom` / `relatedFeature` match Knowledge Base ids
- [ ] `destinationRoute` matches Knowledge Base route (if navigation)
- [ ] **companionResponse** written — every button has a Spark line
- [ ] Title uses official vocabulary (welcome / story categories may use editorial titles)
- [ ] Voice standards pass
- [ ] `discoveryText` is complete — not placeholder

## Checklist before Live

- [ ] Status was **Approved**
- [ ] `validateDiscoveryForLive()` returns no errors
- [ ] Placement exists in `room-placement-library.json` if in-scene key required

## Welcome Collection 001

**Collection:** `welcome-to-spark-estate`  
**DISC-001 … DISC-010** — trust-first orientation, not feature training.  
Rebuild from `scripts/build-discovery-library-items.mjs` after editing welcome copy.
