# 076 — Architectural Decision Framework

## 1. Purpose

Provide a repeatable way to decide whether a proposed capability belongs in Universal Creation and how it should be implemented.

## 2. Decision Questions

1. Does this capability create or develop meaningful work?
2. Does a shared capability already exist?
3. What is the authoritative Work ID?
4. Who owns content?
5. Who owns execution?
6. What context is required?
7. What is persisted?
8. What can fail?
9. How does the member recover?
10. How is behavior certified?

## 3. Build, Extend, or Configure

### Configure
Use when shared capability already supports the need.

### Extend
Use when new domain behavior is needed but core contracts remain valid.

### Build Shared
Use when multiple consumers need a new reusable capability.

### Exception
Use only when constitutional requirements cannot reasonably apply.

## 4. Decision Record Template

```md
Decision ID:
Title:
Problem:
Member impact:
Affected consumers:
Existing capabilities considered:
Decision:
Alternatives:
Tradeoffs:
Data impact:
Migration:
Security:
Accessibility:
Certification:
Owner:
Review date:
```

## 5. Red Flags

- “It’s easier to build locally.”
- “We only need it in one place.”
- “We can connect it later.”
- “The user probably won’t notice.”
- “localStorage is enough for now.”
- “The button can be a placeholder.”
- “We can duplicate the work and sync later.”

## 6. Decision Quality Test

A good decision:

- reduces future fragmentation;
- preserves Work ID;
- supports reuse;
- has a migration path;
- is testable;
- protects member trust.
