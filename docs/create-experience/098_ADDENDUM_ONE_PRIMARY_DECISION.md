# 098 Addendum — One Primary Decision While Writing

**Parent:** `098_CREATE_SECTION_NAVIGATION_AND_DOCUMENT_ASSEMBLY_REPORT.md`  
**Also intended for:** Cursor Prompt 098 (UX requirement)

## Requirement

Every Create section should present only the controls needed to complete that section. Secondary AI assistance should be available without competing with the primary writing flow. The interface should minimize decision fatigue by presenting one clear next step at a time.

## Anti-pattern (forbidden)

Asking the member, at once:

- Should I save?
- Should I ask for ideas?
- Should I review?
- Should I brainstorm?
- Should I skip?
- Should I complete?
- Should I build?
- Should I fill?
- Should I ask for help?

## Desired question

> What are you trying to do right now?

If the answer is **“I'm writing this section,”** almost everything else gets out of the way.

## Implementation contract

1. **Primary:** Save this section (single CTA).
2. **Secondary (disclosed):** Need a hand? → optional AI / skip.
3. **Work-level (disclosed):** When you're ready → done with section · assemble full piece · polished draft.
4. Never surface more than one primary action in the writing surface.
5. Assistance must not equal the visual weight of Save.

## Runtime

- `components/companion/CurrentFocusInteraction.tsx` — writing mode + Need a hand?
- `components/companion/CreateEstateWorkingPanel.tsx` — When you're ready disclosure
