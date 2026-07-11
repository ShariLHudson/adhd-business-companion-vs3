# 060_CURSOR_IMPLEMENTATION_ORDER

# Spark Estate™
## Cursor Implementation Order

**Related architecture:** [151_SPARK_COMPANION_RUNTIME_ARCHITECTURE.md](./151_SPARK_COMPANION_RUNTIME_ARCHITECTURE.md) — complete companion runtime flow (message → response).

---

# Step 1 — Audit Existing Code

Find existing:

- evidence-bank references
- Evidence Vault routes
- Hall routes
- celebration features
- journal/accomplishment features
- routing/context state
- print/export utilities
- attachment handling

Do not delete until mapped.

---

# Step 2 — Create Shared Recognition Model

Implement shared data structures first.

Do not hard-code room-specific storage if it can use recognition_records.

---

# Step 3 — Fix Routing and State

Implement:

- visual_room
- conversation_context
- requested_destination
- active_recognition_flow

This prevents wrong room responses.

See also: [151_SPARK_COMPANION_RUNTIME_ARCHITECTURE.md](./151_SPARK_COMPANION_RUNTIME_ARCHITECTURE.md) §5 Room awareness.

---

# Step 4 — Build Evidence Vault™

Implement Evidence Vault™ first.

Reason:

It is the main capture point for future recognition.

---

# Step 5 — Build Management Layer

Search/filter/print/export must exist early.

Reason:

Members must be able to find and use what they save.

---

# Step 6 — Build Celebration Garden™ and Celebration Room™

Use shared recognition records.

---

# Step 7 — Build Legacy Studio™

Connect stories to existing records.

---

# Step 8 — Build Hall of Accomplishments™

Build after supporting data exists.

---

# Step 9 — Add Rediscovery

Add rule-based reminders and pattern suggestions.

Do not overbuild AI pattern detection in version 1.

---

# Step 10 — Test Complete Journeys

Test:

- chat discovery → Evidence Vault™
- discovery → celebration
- celebration → Legacy Studio™
- Legacy Studio → Hall exhibit
- Hall exhibit → print/export
- search → rediscovery

Runtime map for journey testing: [151_SPARK_COMPANION_RUNTIME_ARCHITECTURE.md](./151_SPARK_COMPANION_RUNTIME_ARCHITECTURE.md).
