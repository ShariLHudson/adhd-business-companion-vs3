# 065 — Certification Test Specification Template

## Status

Reusable production certification template.

**Published ID:** 065  
**Governing process:** [062 Implementation & Certification](./062_IMPLEMENTATION_AND_CERTIFICATION_STANDARD.md) · [063 Traceability](./063_STANDARD_IMPLEMENTATION_TRACEABILITY_MATRIX.md)  
**Draft filename redirect:** `063_CERTIFICATION_TEST_SPECIFICATION_TEMPLATE.md` → this file (063 is the Traceability Matrix).

Recommended filename:

`NNN_<CAPABILITY>_CERTIFICATION_SPECIFICATION.md`

---

# Capability

- Governing standard:
- Implementation specification:
- Runtime version:
- Test environment:
- Certification owner:
- Date:
- Current status:

---

# Certification Decision

Choose one:

- NOT_STARTED
- IN_IMPLEMENTATION
- TESTING
- BLOCKED
- NOT_CERTIFIED
- CONDITIONALLY_CERTIFIED
- CERTIFIED
- DEPRECATED

Decision:

Reason:

---

# Required Evidence

- [ ] implementation files identified
- [ ] canonical source of truth identified
- [ ] unit tests passed
- [ ] integration tests passed
- [ ] authenticated browser tests passed
- [ ] regression tests passed
- [ ] accessibility checks passed
- [ ] performance checks passed where required
- [ ] persistence verified
- [ ] return and resume verified
- [ ] duplicate prevention verified
- [ ] cross-entry consistency verified
- [ ] failure recovery verified
- [ ] traceability matrix updated
- [ ] no critical or high defects open

---

# Certification Scenarios

## Scenario 1 — First Use

**Given**

**When**

**Then**

Evidence:

Result: PASS / FAIL / BLOCKED

---

## Scenario 2 — Existing Work

**Given**

**When**

**Then**

Evidence:

Result:

---

## Scenario 3 — Multiple Entry Points

Test at minimum:

- Shari
- Create
- Projects
- Visual Thinking
- Chamber member
- Board
- Search
- Dashboard
- Cartography

**Given**

**When**

**Then**

Evidence:

Result:

---

## Scenario 4 — Duplicate Prevention

**Given**

**When**

**Then**

Evidence:

Result:

---

## Scenario 5 — Asset-First Entry

**Given**

**When**

**Then**

Evidence:

Result:

---

## Scenario 6 — Return and Resume

**Given**

**When**

**Then**

Evidence:

Result:

---

## Scenario 7 — Known Context Preservation

**Given**

**When**

**Then**

Evidence:

Result:

---

## Scenario 8 — Discovery Transition

**Given**

**When**

**Then**

Expected:

- discovery stops at sufficient confidence
- foundation is created
- workspace does not open blank
- known facts appear
- one next recommendation appears
- known facts are not re-asked

Evidence:

Result:

---

## Scenario 9 — Persistence Failure

**Given**

**When**

**Then**

Evidence:

Result:

---

## Scenario 10 — Recovery

**Given**

**When**

**Then**

Evidence:

Result:

---

## Scenario 11 — Archive and Reuse

**Given**

**When**

**Then**

Evidence:

Result:

---

## Scenario 12 — Accessibility

**Given**

**When**

**Then**

Evidence:

Result:

---

## Scenario 13 — Narrow Layout

**Given**

**When**

**Then**

Evidence:

Result:

---

## Scenario 14 — State Reversal

**Given**

**When**

**Then**

Evidence:

Result:

---

## Scenario 15 — Change Impact

**Given**

**When**

**Then**

Evidence:

Result:

---

# Standard-Specific Requirements

| Requirement ID | Requirement | Test | Expected | Actual | Result | Evidence |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |

---

# Browser Test Matrix

| Browser Flow | Authenticated | Desktop | Narrow View | Refresh | Return | Result |
|---|---:|---:|---:|---:|---:|---|
| Start from Shari |  |  |  |  |  |  |
| Start from Create |  |  |  |  |  |  |
| Continue from Projects |  |  |  |  |  |  |
| Asset-first from Chamber |  |  |  |  |  |  |
| Open from Search |  |  |  |  |  |  |
| Open from Cartography |  |  |  |  |  |  |
| Resume after absence |  |  |  |  |  |  |

---

# Accessibility Matrix

| Requirement | Result | Evidence | Defect |
|---|---|---|---|
| Keyboard navigation |  |  |  |
| Visible focus |  |  |  |
| Semantic controls |  |  |  |
| Screen-reader names |  |  |  |
| Contrast |  |  |  |
| Zoom |  |  |  |
| Responsive layout |  |  |  |
| Reduced motion |  |  |  |
| Error announcements |  |  |  |
| Drag-and-drop alternative |  |  |  |

---

# Performance Matrix

| Operation | Target | Actual | Result |
|---|---:|---:|---|
| Initial load |  |  |  |
| Context assembly |  |  |  |
| Search |  |  |  |
| Save |  |  |  |
| Resume |  |  |  |
| Recommendation generation |  |  |  |
| Registry loading |  |  |  |
| Relationship traversal |  |  |  |

---

# Defects

| Defect ID | Severity | Description | User Impact | Workaround | Owner | Status |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |

Critical or high defects block certification.

---

# Known Limitations

- 
- 
- 

---

# Regression Protection

List permanent tests added for defects and critical behaviors.

| Behavior | Regression Test | Test Path | Result |
|---|---|---|---|
|  |  |  |  |

---

# Final Certification Statement

## Certified Behavior

Describe exactly what has been proven.

## Not Yet Proven

Describe anything not validated.

## Decision

CERTIFIED / CONDITIONALLY_CERTIFIED / NOT CERTIFIED

## Conditions

List any required follow-up.

## Next Review Trigger

Examples:

- material runtime change
- persistence migration
- routing change
- editor replacement
- new entry point
- state-machine change
- recommendation-engine change
- unresolved defect fixed
