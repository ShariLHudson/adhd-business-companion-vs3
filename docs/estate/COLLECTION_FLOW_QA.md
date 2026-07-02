# Collection Flow QA (dev)

Quick verification for **chat → permission → room → draft → save → browse** across Estate collection rooms.

**Dev page:** [`/companion/collection-flow-qa`](http://localhost:3000/companion/collection-flow-qa) (development builds only)

**Automated tests:** `lib/estate/collectionFramework/collectionFlowQa.test.ts`

```bash
cd companion-app
npx vitest run lib/estate/collectionFramework/collectionFlowQa.test.ts
```

**Console report** (on the QA page):

```js
window.__collectionFlowQa()
```

**Playbook (canonical routing):** [ESTATE_COLLECTIONS_PLAYBOOK.md](./ESTATE_COLLECTIONS_PLAYBOOK.md)

**Collection Intelligence (how Spark thinks):** [ESTATE_COLLECTION_INTELLIGENCE.md](./ESTATE_COLLECTION_INTELLIGENCE.md)

**User Journey (living in rooms over years):** [ESTATE_COLLECTION_USER_JOURNEY.md](./ESTATE_COLLECTION_USER_JOURNEY.md)

---

## Design rules (non-negotiable)

### Nothing auto-saves

Spark may open a collection room with a **prefilled draft**. The member must tap save in that room. No silent writes to Journal, Evidence Vault, Celebration Garden, Achievement Library, or other collection stores.

### Spark must always ask permission

Every collection offer is a **question**. Typical pattern:

- *"That sounds like something worth celebrating. Would you like to add it to the Celebration Garden?"*
- *"This sounds like strong evidence of a problem you solved. Would you like to preserve it in the Evidence Vault?"*
- *"That feels like a meaningful reflection. Would you like to save it in your Journal?"*

**Yes** → open suggested room with draft. **No** → stay in chat. **Different room** → numbered menu.

### Collection offers should not interrupt other intents

`evaluateCollectionSaveOffer()` returns `null` when the member is:

- Asking a direct question (*how / what / should I…*)
- Navigating (*take me to…*, *open…*)
- Sending a very short reply (*ok*, *thanks*, *yes*, *no*)
- Overwhelmed (emotional state)
- Already in a workspace panel
- Inside the offer cooldown window (~8 turns after the last offer)

If the member needs something else first, **help with that** — do not push a collection save.

### One offer at a time only

- At most **one** `CollectionPendingOffer` in session storage.
- Cooldown prevents back-to-back offers in the same conversation.
- While an offer is pending, the confirmation gate blocks follow-up LLM turns until the member answers.

---

## Ten-step manual checklist

| # | Verify |
|---|--------|
| 1 | Chat detects a **win** → offers Celebration Garden |
| 2 | Chat detects **problem solved** → offers Evidence Vault |
| 3 | Chat detects **reflection** → offers Journal |
| 4 | User can **decline** and remain in chat |
| 5 | User can choose **"different room"** → menu |
| 6 | Correct room opens with **prefilled draft** |
| 7 | User can **edit before saving** |
| 8 | **Attachments** work (photo/file/link) |
| 9 | **Saved card** displays correctly (preview, cover image) |
| 10 | **Search/filter** finds the entry afterward |

Sample messages and copy buttons live on the QA page. Use **Reset QA session** to clear pending offers, prefills, manual checkmarks, and cooldown before a fresh pass.

---

## Suggested test flow (~10 minutes)

1. Open `/companion/collection-flow-qa` → **Re-run** automated checks (should be all green).
2. **Reset QA session**.
3. Open **Companion** → send step 1 sample → confirm offer → **yes** → edit draft → save.
4. Return to chat → **Reset QA session** (or wait for cooldown) → run steps 2–3 with vault/journal samples.
5. Repeat decline (step 4) and different-room menu (step 5) without saving.
6. For attachments (step 8): attach a small image before save; confirm on card (step 9) and search (step 10).

**Room UI preview** (without chat): `/estate-collection/{roomId}` — e.g. `/estate-collection/journal`.

---

## Key modules

| Module | Role |
|--------|------|
| `collectionOfferIntelligence.ts` | Detect saveable moments; permission offers (Playbook-driven) |
| `estateCollectionsPlaybook.ts` | **Estate Collections Playbook™** — room purposes, decision tree, cross-room rules |
| `collectionOfferFlow.ts` | Yes / no / menu / room pick resolution |
| `collectionPendingOffer.ts` | Pending offer + cooldown |
| `collectionPrefillStore.ts` | Draft prefill consumed on room open |
| `collectionFlowQa.ts` | Checklist + automated smoke checks |
| `CompanionPageClient.tsx` | Live chat wiring |

---

## When something fails

1. Note **which step** failed and the exact user/assistant lines.
2. Run `window.__collectionFlowQa()` and attach output.
3. Check session storage keys: `spark:estate:collection-pending-offer:v1`, `spark:estate:collection-offer-cooldown:v1`.
4. Log to Observation Mode — **Rule of Three** before prompt changes.
