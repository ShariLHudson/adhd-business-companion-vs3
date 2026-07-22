# Spark Estate — Board of Directors Personalization & Selection Fix
## Cursor Implementation Prompt

# Mission

Fix two Board of Directors behaviors:

1. Each selected Board member must naturally refer to the current user by name when responding.
2. Selected Board members must appear brighter and more prominent, while unselected members must appear visually subdued.

These changes must apply throughout all Board decision experiences.

---

# 1. Use the User's Name in Board Responses

## Required Behavior

When Thomas or another Director responds, the response should acknowledge the actual user's question or decision.

Examples:

- `We are evaluating Shari's question about whether to move forward with this partnership.`
- `Shari, here is how I see this decision from the Chair's perspective.`
- `In reviewing Shari's options, I see three important considerations.`

Do not literally display the word `user`.

Do not hard-code `Shari`.

Always pull the current user's name from the existing profile source of truth.

## Name Resolution Order

Use:

1. preferred name
2. first name
3. display name
4. fallback to `your question` or `your decision`

Never display:

- undefined
- null
- an email address
- an internal user ID
- `[Name]`
- the literal word `user`

## Prompt Instruction

Pass the resolved name into the Board-member prompt.

Use an instruction similar to:

```text
Address the person naturally by the provided preferred name near the beginning of your response.
When appropriate, refer to the matter as "[Name]'s question" or "[Name]'s decision."
If no name is available, use "your question" or "your decision."
Never use placeholders or the literal word "user" in the visible response.
Do not repeat the name excessively.
```

Each Director must retain their own role, voice, and reasoning style.

## Example

### Thomas Ellison
Chair

> We are evaluating Shari's question about whether this is the right time to expand. From the Chair's perspective, the key issue is whether the decision supports the larger direction Shari has established.

---

# 2. Reverse the Selected and Unselected Visual States

## Current Problem

The current visual state is backwards:

- selected member has a check mark but appears dim
- unselected members have no check mark but appear bright or white

## Required Behavior

### Selected Director

A selected Director must:

- appear brighter
- use full portrait visibility
- have stronger contrast
- show the check mark
- have a clear selected border, glow, or highlight
- look active and ready to participate

### Unselected Director

An unselected Director must:

- appear less bright
- use a subtle dimming overlay
- have reduced emphasis
- remain recognizable
- not show a check mark

The selected Director must always be the visually dominant state.

## Suggested Styling

Use the existing Spark Estate tokens where possible.

```css
.board-director-card[data-selected="true"] {
  opacity: 1;
  filter: brightness(1.05) saturate(1.05);
  border: 2px solid var(--spark-gold);
  box-shadow:
    0 0 0 3px rgba(245, 193, 108, 0.2),
    0 10px 28px rgba(0, 0, 0, 0.22);
  transform: translateY(-2px);
}

.board-director-card[data-selected="false"] {
  opacity: 0.62;
  filter: brightness(0.72) saturate(0.7);
  border-color: rgba(255, 255, 255, 0.16);
  box-shadow: none;
}
```

These values are examples. Match the current card design while preserving the rule:

> Selected is bright and prominent. Unselected is subdued.

## Accessibility

Use the existing selection state and expose it accessibly.

```tsx
<button
  type="button"
  aria-pressed={isSelected}
  data-selected={isSelected}
>
  {isSelected && (
    <span aria-hidden="true" className="selection-check">
      ✓
    </span>
  )}
</button>
```

Do not rely on brightness alone.

Use:

- check mark
- selected border or glow
- accessible selected state

## Hover and Focus

Hover and keyboard focus must not look identical to selected.

- An unselected card may brighten slightly on hover.
- It must not become as bright as a selected card.
- Keyboard focus should use a separate visible focus ring.
- Selected state must remain obvious during hover and focus.

## Multi-Select

If multiple Directors can be selected:

- every selected Director is bright and checked
- every unselected Director is subdued
- Select All brightens and checks all
- Clear All returns all to the subdued state
- deselection updates immediately

---

# Response Attribution

Each response must clearly show:

- Director name
- Director role
- Director-specific response

Example:

```text
Thomas Ellison
Chair

We are evaluating Shari's question about...
```

Do not merge responses in a way that makes it unclear who is speaking.

---

# Data Rules

Do not create a second source of truth.

Use:

- the existing user profile for name resolution
- the existing selected Director IDs for selection state

Preserve:

- selected Directors
- Board session history
- saved decisions
- previous Board responses
- multi-select behavior

---

# Testing

## Personalization

Test:

- preferred name exists
- first name only
- display name only
- no name
- updated preferred name
- multiple Directors selected
- returning Board session

Confirm:

- the correct current name appears
- no hard-coded `Shari`
- no undefined, null, email, or internal ID
- fallback wording is natural
- name is not repeated excessively

## Selection State

Test:

- no Directors selected
- one selected
- several selected
- Select All
- Clear All
- deselect one
- hover
- keyboard focus
- desktop
- mobile

Confirm:

- selected cards are brightest
- selected cards show check marks
- unselected cards are subdued
- hover does not look selected
- focus does not look selected
- state persists correctly

---

# Acceptance Criteria

## Board Responses

- [ ] Every selected Director receives the resolved current user's name.
- [ ] The name appears naturally near the beginning.
- [ ] Responses may say `[Name]'s question` or `[Name]'s decision`.
- [ ] The visible response never says the literal word `user`.
- [ ] No name is hard-coded.
- [ ] Natural fallback wording is used when no name exists.
- [ ] Each Director retains their assigned voice and role.

## Selection Appearance

- [ ] Selected Directors appear brighter and more prominent.
- [ ] Selected Directors show a check mark.
- [ ] Unselected Directors appear dimmer and less prominent.
- [ ] Unselected Directors do not show a check mark.
- [ ] Selection uses more than brightness alone.
- [ ] Hover, focus, and selected states are visually distinct.
- [ ] Multi-select works correctly.
- [ ] Mobile and keyboard behavior work.

---

# Final Experience

When Shari selects Thomas and asks a question:

1. Thomas's card appears bright, active, and checked.
2. Unselected Directors appear softly subdued.
3. Thomas naturally acknowledges Shari by name.
4. It is immediately clear who was selected and who is speaking.
