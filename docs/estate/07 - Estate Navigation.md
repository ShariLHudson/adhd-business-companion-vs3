# Estate Navigation™

| Field | Value |
|-------|-------|
| **Series** | Spark Estate Documentation · **07 of 10** |
| **Status** | Canonical routing philosophy |
| **Code target** | `goToPlace(roomId)` · `estateRoomAliasRegistry` · `estateCommandRouter` |
| **Parent** | [05 — Conversation Philosophy](./05%20-%20Conversation%20Philosophy.md) |
| **Next** | [08 — UI Philosophy](./08%20-%20UI%20Philosophy.md) |

---

## One rule

**Conversation is primary. Navigation is something you say — or a single gentle suggestion when feelings, not names, guide the move.**

---

## Routing order (final target)

```
1. Exact room phrase (alias registry)  → goToPlace — immediate, no offer
2. Estate command (feeling / intent)   → offer OR goToPlace by confidence
3. Legacy / governor intent            → only if estate returned none
4. LLM reply                           → never auto-route to home
```

---

## Named place → immediate move

Triggers: “take me to…”, “open…”, “visit…”, bare room name (bounded match).

| Behavior | Detail |
|----------|--------|
| **No** permission dialog | They named it |
| **No** “Step into X?” card | Direct path only |
| **No** arrival lecture | Scene + optional one chat line |
| **Yes** thread preserved | Same messages after transition |

**Tests must cover full chain:** `handleSend` → navigation — not only `evaluateEstateCommand`.

---

## Feeling → one place

When member names a **need**, not a **place**:

| Signal | Typical place (one) |
|--------|---------------------|
| Overwhelmed | Momentum Builder™ |
| Need calm | Peaceful Places™ / Dock |
| Clear head | Conservatory / Clear My Mind™ |
| Learn pricing (skill) | Momentum Institute™ |
| Read / inspire | Library / Reading Nook |
| Celebrate | Gardens / Celebration |
| Decide | Decision Compass™ |
| Research trends | Observatory™ |

**Max one** primary suggestion. Offer card: **Yes · Stay · Map** — not a feature grid.

---

## What to retire (cleanup)

Parallel paths that must converge on `goToPlace`:

- `acceptWorkspaceOfferCore` for explicit room names  
- Duplicate `intentRoutingIntelligence` estate intents  
- `v3BehaviorRecovery` overlapping opens  
- Governor `workspace_open` fallthrough to `home`  
- `AppSection` matrix as primary mental model  

See [Estate Cleanup Roadmap](../ESTATE_CLEANUP_ROADMAP.md) Phase 2.

---

## Menu & map

| Surface | Rule |
|---------|------|
| **Global menu** | Destinations only — not grow-hub feature catalog |
| **Folded map** | Places, not modules; pauses chat |
| **Sidebar** | Recessive; hide stub sections |
| **URL** | Resolve to `roomId` via registry |

---

## Critical vocabulary fixes

| Wrong (audit) | Right |
|---------------|-------|
| `library` id → Institute name | `library` = Library / Reading Nook |
| `momentum-institute` section → `library` entry | Separate registry rows |
| “reading nook” as library alias only | Nook = library scene; Institute = drawer wall |

---

## In-room suppression

While in a named Conversation Place, suppress re-invite to the same place ( `estateRoomInConversation` ).

Estate intent routing defers when member is already at destination.

---

## Forbidden navigation language

- “Navigate to…”  
- “Choose a room”  
- “Open the [feature] workspace”  
- “Switching to…”  
- Breadcrumbs: `Estate > Growth > …`  

---

## Member-visible wayfinding

They know where they are from:

1. The **photograph**  
2. **Memory** of the place  
3. **Shari** — one line at most  

Not from persistent room labels on glass ([08 — UI Philosophy](./08%20-%20UI%20Philosophy.md)).

---

## Related

- Catalog: [03 — Estate Room Catalog](./03%20-%20Estate%20Room%20Catalog.md)  
- Aliases: `lib/estate/estateRoomAliasRegistry.ts`  
- Spec 108 Environment Integration
