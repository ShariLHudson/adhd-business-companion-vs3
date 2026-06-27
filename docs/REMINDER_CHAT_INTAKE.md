# Reminder Chat Intake — Golden Path (P0.57)

Governed by [Product Constitution](./PRODUCT_CONSTITUTION.md) — [Conversation Governance](./PRODUCT_CONSTITUTION.md#conversation-governance) scenarios 1–7 apply to this flow.

Chat reminder creation follows a **locked conversation** until save succeeds or the user abandons intake (Scenario 5: cancel must clear session).

Implementation: `lib/reminderIntelligence.ts`  
Session persistence: `loadReminderIntakeSession()` / `saveReminderIntakeSession()` in `lib/reminderStore.ts`  
Chat handler: `CompanionPageClient.tsx` (early return while `phase === "collecting"`)

---

## Golden path

```
START  step=createReminder
  ↓
ask_name          (only when title is generic, e.g. "Create a reminder")
  ↓
name captured
  ↓
ask_times
  ↓
times captured
  ↓
ask_frequency     (when multiple times given)
  ↓
USER: weekdays
  ↓
frequency parsed  →  draft.recurrenceRule = weekdays-multi@…
  ↓
awaitingAnswer=false
  ↓
saveReminder()    (inside finalizeDraft → persistReminders)
  ↓
SUCCESS           kind=confirm, session cleared
  ↓
conversation unlocked
```

When the user includes the name in the first message (`Remind me to drink water`), **ask_name is skipped** and intake begins at **ask_times**.

---

## Step helpers

| Function | Purpose |
|----------|---------|
| `getReminderIntakeStep(draft, outcome)` | `createReminder` \| `ask_name` \| `ask_times` \| `ask_frequency` \| `complete` |
| `isReminderIntakeAwaitingAnswer(draft, outcome)` | `true` while `kind === "ask"` — conversation stays locked |
| `isReminderIntakeMessage(text)` | Detects assistant messages that are part of intake |

---

## Example: Drink Water, weekdays, 3× daily

| Turn | User | Step | Assistant |
|------|------|------|-----------|
| 1 | `Remind me to drink water` | ask_times | When would you like the reminder? |
| 2 | `10am, 1pm, and 5pm` | ask_frequency | Got it. I'll remind you: • … Every day or weekdays? |
| 3 | `weekdays` | complete | Reminder created — … |

Saved rule: `weekdays-multi@10:00,13:00,17:00`

---

## Tests

- `P0.57 golden path: createReminder → ask_name → …` — full four-step flow
- `P0.57 multi-time weekdays flow` — name in first message, weekdays at end
- `P0.33 multi-time daily flow` — `yes` / daily at end

Run: `npx vitest run lib/reminderIntelligence.test.ts`
