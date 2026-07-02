# Estate Objects™

| Field | Value |
|-------|-------|
| **Series** | Spark Estate Documentation · **04 of 10** |
| **Status** | Canonical object-layer spec |
| **Parent** | [03 — Room Catalog](./03%20-%20Estate%20Room%20Catalog.md) · [08 — UI Philosophy](./08%20-%20UI%20Philosophy.md) |
| **Next** | [05 — Conversation Philosophy](./05%20-%20Conversation%20Philosophy.md) |

---

## Principle

Software panels are retired. **Objects** are what you would touch in a real room.

Objects live in **Layer 3** — beneath the scene, beside or behind the conversation float. They never replace the photograph as hero.

---

## Object vs panel

| Object (use) | Panel (reject) |
|--------------|----------------|
| Book on a desk | Help sidebar |
| Drawer pull in a wall | CRUD grid with column headers |
| Folio on a table | Portfolio dashboard |
| Vault door ajar | “Evidence manager” |
| Folded map in corner | Navigation tree |
| Brass latch on cabinet | Settings modal |

**Necessity Test:** Would this control exist if you were standing in the room?

---

## Canonical objects

### Guidebook™

**Category:** Destination object (portable — may open from any room).

| Treat as | Never as |
|----------|----------|
| Leather-bound book | `/help` with left nav |
| Pages that turn | FAQ accordion |
| Chapters browsed by eye | Search-first docs |
| Pick up when lost | Full-screen app takeover |

**Behavior:** Open → dim float slightly → read pages → close book → return to scene.  
**Copy:** Written for someone in a chair — not a support ticket.

---

### Momentum Institute — Drawer Wall

**Room:** `momentum-institute`

- Wall of drawers — each drawer a topic collection  
- Index cards — one concept per Knowledge Card™  
- Open drawer → cards on surface — not a lesson list modal  
- Cabinet save → “file in My Institute Cabinet™?” (permission)

**Content rule:** Experiences reference cards by id — never duplicate card bodies.

---

### Evidence Vault — Latch & Archive

**Room:** `evidence-vault`

- Vault door, shelves, or folio of proof  
- Wins as artifacts — not rows in a table  
- Empty vault → possibility in chat, not “No records found”

---

### Portfolio — Folio

**Room:** `portfolio`

- Open folio on desk — work spreads across pages  
- Pride and craft — not file extensions and sort columns

---

### Celebration — Shelf & Garden

**Room:** `gardens` / celebration destinations

- Objects of celebration — milestones, notes, garden tokens  
- Outdoor light, seasonal cues ([09 — Seasonal Guide](./09%20-%20Seasonal%20Estate%20Guide.md))

---

### Folded Estate Map

**Not a room** — recessive corner object.

- Pauses conversation; does not destroy thread  
- Shows places, not features  
- Closes back to scene — never “navigate to module”

---

### Institute Cabinet — Filing Drawer

**Overlay / menu destination:** `institute-cabinet`

- References only — drawer name, card label, return path  
- Never duplicate lesson content

---

### Growth Profile — Quiet Ledger

**Overlay:** `growth-profile`

- Earned capability — not badges or streaks  
- May share Greenhouse scene; object is a personal ledger, not a stats page

---

## Object interaction rules

1. **One object system per Destination Room**  
2. Opening an object **dims** the float; closing **restores** conversation  
3. Scene **never unmounts** while object is open  
4. Save / export / share → **permission** in room language  
5. Empty states → Shari in chat, not red error text  

---

## Conversation Places — no objects (default)

Reading Nook, Dock, Greenhouse (talk-first), Porch Swing, etc. → **scene + float only**.

Exception: ambient controls (mute birds, dim fire) — icon-only, recessive.

---

## Engineering note

Object components register against `roomId` + `objectId`. Navigation uses `goToPlace(roomId)` — objects do not introduce new routes.

See [07 — Estate Navigation](./07%20-%20Estate%20Navigation.md).
