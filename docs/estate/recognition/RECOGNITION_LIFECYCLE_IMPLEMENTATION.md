# Recognition Lifecycle Implementation

**Status:** Implemented  
**Pipeline:** Conversation → Recognition → Evidence Vault™ → Celebration (optional) → Legacy Studio™ → Hall (optional) → Rediscovery  
**Law:** Do not route discoveries to Create unless explicitly requested.

---

## Runtime modules (`lib/sparkRecognitionEngine/`)

| Module | Role |
|--------|------|
| `pipeline.ts` | Evaluate turn + advance member choices through stages |
| `pipelineTypes.ts` | Pipeline stages, member choices, offer contracts |
| `createGate.ts` | Explicit Create vs discovery-language detection |
| `rediscovery.ts` | Revisit preserved / celebrated / chronicled records |
| `lifecycle.ts` | Internal status transitions; never auto-induct Hall |
| `routing.ts` | Preserve-first + Create block |
| `shellSync.ts` | Shell sync + `shouldBlockCreateForRecognitionTurn` |
| `store.ts` | `recognition_records` + Hall exhibits |

---

## Pipeline stages

| Stage | Room | Member options |
|-------|------|----------------|
| Conversation | — | (trigger detection) |
| Recognition | — | Notice language |
| Evidence Vault™ | `evidence-vault` | Preserve it · Celebrate it · Not now |
| Celebration | Garden or Celebration Room | Quiet · Joyful · Help me decide · Not now |
| Legacy Studio™ | `legacy-studio` | Tell the story · Not now · Remind me later |
| Hall (optional) | `gallery-of-firsts` | Mark candidate · Induct · Not now |
| Rediscovery | Vault / prior rooms | Revisit list |

Hall induction **requires** explicit `induct_into_hall` — never automatic.

---

## Create gate

| Input | Result |
|-------|--------|
| “I discovered how to create an amazing app…” | **Recognition** — preserve-first; Create blocked |
| “help me write a newsletter…” | **Create allowed** (explicit) |
| “open create” | **Create allowed** |
| Active `preserve_discovery` flow | Create blocked |

Wired into:
- `shouldBlockCreateForRecognitionTurn` → `openCreateWorkspace`
- `classifyPrimaryConversationTurn` → type `RECOGNITION`
- `reconcilePrimaryTurnWithDecisionEngine` — discovery beats Decision Engine CREATE
- Wisdom Loop prompt hint

---

## Entry points

```ts
import {
  evaluateRecognitionLifecycleTurn,
  advanceRecognitionLifecycle,
  preserveDiscoveryFromConversation,
  shouldBlockCreateForRecognitionTurn,
} from "@/lib/sparkRecognitionEngine";

const turn = evaluateRecognitionLifecycleTurn({ userText });
if (turn.ownsTurn) {
  // speak turn.offer.memberPrompt — options preserve_it / celebrate_it / not_now
}

const next = advanceRecognitionLifecycle({
  choice: "preserve_it",
  sourceText: userText,
});
```

---

## Tests

`lib/sparkRecognitionEngine/recognitionLifecycle.test.ts`
