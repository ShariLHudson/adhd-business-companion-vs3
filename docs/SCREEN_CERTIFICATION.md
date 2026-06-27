# Screen Certification Sprint Process

**P0.57+ — Production-ready, one screen at a time**

**P0.58+ — Governed by the [Product Constitution](./PRODUCT_CONSTITUTION.md)**

From this point forward, **stop working across multiple screens.** Complete one screen at a time until it is considered production-ready.

A screen is **not** finished because the code compiles.

A screen is **finished** because a first-time ADHD entrepreneur can use it confidently without confusion **and** the screen complies with the Product Constitution.

**Only after a screen is certified do we move to the next one.**

Companion Brain Intelligence modules activate **only after:**

1. Every screen in the certification order is marked **COMPLETE**, and  
2. The [Product Constitution](./PRODUCT_CONSTITUTION.md) is in force (P0.58), and  
3. [Development Governance](./DEVELOPMENT_GOVERNANCE.md) guides all new work (P0.58+).

---

## Related documents

| Document | Purpose |
|----------|---------|
| [PRODUCT_CONSTITUTION.md](./PRODUCT_CONSTITUTION.md) | **Governing law** — all screens, workflows, and intelligence must comply |
| [DEVELOPMENT_GOVERNANCE.md](./DEVELOPMENT_GOVERNANCE.md) | **Product-thinking standard** — how to decide what to build |
| [UX_PUNCH_LIST.md](./UX_PUNCH_LIST.md) | Living polish items + Future Opportunities per screen |
| [REMINDER_CHAT_INTAKE.md](./REMINDER_CHAT_INTAKE.md) | Reminder Center chat golden path + governance scenarios |

**Workflow:** Discover issues → Punch List → fix on that screen only → run checklist → Constitution compliance → capture Future Opportunities → mark COMPLETE → next screen.

---

## Release branch

Screen certification work runs on a dedicated branch so history stays clean:

**Branch:** `release/v1-screen-certification`

**Expected commit arc:**

1. Governance milestone (`docs: establish governance framework…`) — on `main`
2. `certify: Plan My Day complete`
3. `certify: Visual Thinking complete`
4. `certify: Projects complete`
5. … (one commit per certified screen, in [certification order](#recommended-certification-order))
6. `release: Version 1.0 screen certification complete`

Merge to `main` when all 15 screens pass all 10 gates and the impress question.

---

## The final question

Before marking any screen COMPLETE, answer honestly:

> **If this were the only screen a new user saw today, would they be impressed enough to come back tomorrow?**

- **Yes** → certify it (if all gates pass).
- **Not yet** → keep polishing until it earns that response.

---

## Certification checklist

Every screen must pass **all** of the following before it is marked COMPLETE.

### 1. Workflow

Complete every workflow from beginning to end. No dead ends. Aligns with **Workflow Constitution** (see [§7](./PRODUCT_CONSTITUTION.md#7-workflow-constitution)).

| Workflow | Verify |
|----------|--------|
| Create | |
| Edit | |
| Save | |
| Delete | |
| Archive | |
| Restore | |
| Print | |
| Export | |
| Search | |
| Sort | |
| Filter | |
| Google integration | If applicable |

### 2. Navigation

Aligns with **Navigation Constitution** ([§6](./PRODUCT_CONSTITUTION.md#6-navigation-constitution)).

| Check | Verify |
|-------|--------|
| Back button | Returns to expected parent |
| Previous screen restoration | State feels preserved where appropriate |
| Open / Close behavior | Predictable |
| Dropdown behavior | One-open rules where specified |
| Expand / Collapse behavior | Starts collapsed; progressive disclosure |
| Sidebar navigation | Correct section highlights and routes |

### 3. UX

Aligns with **UX Constitution** ([§2](./PRODUCT_CONSTITUTION.md#2-ux-constitution)). Ask: **Can this be simpler?**

### 4. ADHD evaluation

Aligns with **ADHD Constitution** ([§3](./PRODUCT_CONSTITUTION.md#3-adhd-constitution)).

| Question | Pass? |
|----------|-------|
| Is anything overwhelming? | |
| Is anything easy to miss? | |
| Is the next step obvious? | |
| Does the page reduce decision fatigue? | |
| Does it encourage action? | |

### 5. Companion alignment

Aligns with **Companion Constitution** ([§1](./PRODUCT_CONSTITUTION.md#1-companion-constitution)) and **Emotional Safety Constitution** ([§4](./PRODUCT_CONSTITUTION.md#4-emotional-safety-constitution)). Calm, supportive, conversational, trustworthy — never like enterprise software.

### 6. Consistency

Compare with every **previously certified** screen: back buttons, How To Use, search, More menu, buttons, dropdowns, empty states, success messages.

### 7. Accessibility

Keyboard navigation, focus order, touch targets, readable text, color contrast, responsive layout.

### 8. Testing

```bash
npm run audit:companion
npx vitest run
```

Plus a **live browser walkthrough** of every workflow on the screen. **No new failures.**

### 9. Future Intelligence Readiness

Aligns with **Intelligence Constitution** ([§5](./PRODUCT_CONSTITUTION.md#5-intelligence-constitution)).

| Question | Pass? |
|----------|-------|
| Structured information (not just free text)? | |
| Linkable to Goals, Projects, Growth Vault, Content, or Evidence? | |
| Timestamps recorded? | |
| Source known (manual, chat, import, Google, etc.)? | |
| Useful for future patterns? | |
| Useful for evidence-based encouragement? | |
| Avoids duplicate information? | |

### 10. Constitution Compliance

Explicit pass against all seven articles of the [Product Constitution](./PRODUCT_CONSTITUTION.md):

| Article | Pass? |
|---------|-------|
| §1 Companion Constitution | |
| §2 UX Constitution | |
| §3 ADHD Constitution | |
| §4 Emotional Safety Constitution | |
| §5 Intelligence Constitution | |
| §6 Navigation Constitution | |
| §7 Workflow Constitution | |

**Guided conversations** on or through this screen must also pass [Conversation Governance](./PRODUCT_CONSTITUTION.md#conversation-governance) (all 7 scenarios) where applicable.

A screen is **not** production-ready unless it complies with the Product Constitution.

---

## Certification gate

A screen is marked **COMPLETE** only when:

- [x] Gates 1–8 pass (workflow through testing)
- [x] Gate 9 — Future Intelligence Readiness reviewed
- [x] Gate 10 — Constitution Compliance (all 7 articles + conversation scenarios if applicable)
- [x] **Final question:** impressed enough to come back tomorrow?

### Required deliverable: Future Opportunities note

Capture a **Future Opportunities** note in [UX_PUNCH_LIST.md](./UX_PUNCH_LIST.md) under that screen (breadcrumbs for Companion Brain, not build-now features).

---

## Recommended certification order

**Daily execution screens first**, then reflective Growth screens, then system layers.

| # | Screen | Status | Certified |
|---|--------|--------|-----------|
| 1 | Plan My Day | Not started | — |
| 2 | Visual Thinking | Not started | — |
| 3 | Projects | Not started | — |
| 4 | Create | Not started | — |
| 5 | Focus | Not started | — |
| 6 | Reminder Center | Not started | — |
| 7 | Growth Vault (hub) | Not started | — |
| 8 | My Wins | Not started | — |
| 9 | Evidence Bank | Not started | — |
| 10 | Portfolio | Not started | — |
| 11 | My Journey | Not started | — |
| 12 | Outcome Goals | Not started | — |
| 13 | Settings | Not started | — |
| 14 | Chat | Not started | — |
| 15 | Today | Not started | — |

Future Opportunities drafts: [UX_PUNCH_LIST.md](./UX_PUNCH_LIST.md)

> **Note:** Today (`TodayPanel.tsx`) is currently unmounted.

---

## Per-screen certification record

```markdown
## Certification: [Screen Name]

**Date:**
**Certified by:**

### Final question
Would a new user come back tomorrow if this were their only screen?
**Answer:** Yes / Not yet

### Workflows exercised
- [ ] …

### Issues found & fixed
- …

### Constitution Compliance (Gate 10)
- [ ] §1 Companion
- [ ] §2 UX
- [ ] §3 ADHD
- [ ] §4 Emotional Safety
- [ ] §5 Intelligence
- [ ] §6 Navigation
- [ ] §7 Workflow
- [ ] Conversation Governance (if guided flows): scenarios 1–7

### Future Intelligence Readiness
- …

### Future Opportunities
- …

### Tests
- [ ] npm run audit:companion
- [ ] npx vitest run
- [ ] Browser walkthrough

### Gate
- [ ] All 10 gates pass
- [ ] Future Opportunities in UX_PUNCH_LIST.md
```

---

## Final goal

One unified companion experience — governed by the Product Constitution and Development Governance, certified screen by screen (all **10 gates**), with structured data ready for Companion Brain Intelligence only after every screen passes.
