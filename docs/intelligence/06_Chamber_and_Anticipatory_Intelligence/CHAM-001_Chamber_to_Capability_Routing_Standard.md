# CHAM-001 — Chamber-to-Capability Routing Standard

## Primary Owner

Chamber Intelligence

## Supports

- Execution Intelligence
- Conversation Intelligence
- Capability Intelligence
- Estate Intelligence

## Depends On

- CHAM-000 — Chamber Members as Intelligent Entry Points
- Capability Registry
- Route Registry
- Shared Working Context

## Does Not Own

- Capability business rules
- Global route architecture
- Memory policy
- User interface styling

## Status

Current

---

# Purpose

Define how Chamber Members route user needs to the correct capability, destination, or workflow without causing dead ends or unnecessary navigation.

---

# Routing Sequence

1. Understand the user's desired outcome.
2. Check whether the member can solve it conversationally.
3. Check whether a dedicated capability is needed.
4. Check whether another Chamber Member should contribute.
5. Retrieve only relevant shared context.
6. Ask only required questions.
7. Navigate or perform.
8. Confirm completion.
9. Suggest one likely follow-up.
10. Return the result to shared context.

---

# Routing Priority

## 1. Solve Conversationally

Use when no dedicated interface is required.

## 2. Perform Directly

Use when the user clearly requested the action and the member has permission.

## 3. Open the Exact Capability

Use when the user needs to review, edit, compare, or use a specialized tool.

## 4. Bring in Another Member

Use when additional expertise materially improves the result.

Do not bounce the user between members.

The original member or Shari remains responsible for continuity.

---

# No Dead-End Rule

Navigation is not completion.

After opening a destination, the member should continue:

> “We are now in People I Help™. I’ll stay with you while we build the profile.”

---

# No Generic Destination Rule

Open the exact:

- record
- tab
- settings section
- builder
- room
- workflow step

Do not send the user to a general menu when a deep link exists.

---

# Failure Recovery

If navigation fails:

- preserve the user's request
- explain simply
- offer a direct conversational fallback
- provide the manual route only when needed
- do not make the user restate the request

Example:

> “I could not open the builder, but I still have everything you told me. We can build the profile here, and I’ll save it when the page is available.”

---

# Routing Validation

Every Chamber Member requires a tested map of:

- common user phrases
- supported outcomes
- capabilities
- routes
- permissions
- related members
- fallback behavior
- completion confirmation

---

# Success Criteria

- Correct destination on the first try
- No broken navigation
- No repeated questions
- No loss of context
- No unnecessary member handoffs
- The user completes the intended outcome
