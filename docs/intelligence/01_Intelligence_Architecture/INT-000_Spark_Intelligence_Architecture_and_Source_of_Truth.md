# INT-000 — Spark Intelligence Architecture & Source of Truth

## Purpose

This document defines the authoritative structure for Spark Estate™ intelligence libraries.

Its purpose is to prevent duplication, conflict, drift, and unclear ownership as the system grows.

---

# Governing Rule

## One Document Owns One Responsibility

A document may reference another responsibility.

It must not redefine it.

When two documents overlap, the document assigned as the primary owner is authoritative.

---

# Intelligence Layers

## 1. Conversation Intelligence

### Owns

- how Shari responds
- conversation flow
- clarification
- routing
- handoffs
- pacing
- response structure
- action confirmations
- recovery from misunderstanding
- conversational execution

### Does Not Own

- ADHD research
- founder psychology
- human-behavior research
- capability logic
- navigation routes
- memory storage rules
- estate visual design

---

## 2. ADHD Intelligence

### Owns

- adult ADHD research
- executive-function friction
- working memory
- initiation
- time blindness
- emotional regulation
- sensory load
- hyperfocus
- transition difficulty
- prevention and recovery principles related to ADHD

### Does Not Own

- exact Shari scripts
- UI behavior
- navigation
- app actions
- founder-specific business strategy

---

## 3. Founder Experience Intelligence

### Owns

- solo-founder lived experience
- founder isolation
- role overload
- revenue uncertainty
- decision burden
- founder energy
- business-stage friction
- emotional weight of carrying a business alone

### Does Not Own

- general ADHD research
- exact conversation scripts
- capability implementation
- chamber-member navigation

---

## 4. Human Experience Intelligence

### Owns

- common human experiences that affect work and decision-making
- fear
- uncertainty
- grief
- conflict
- self-doubt
- confidence
- transitions
- emotional recovery
- social exhaustion
- identity and meaning

### Does Not Own

- ADHD-specific claims
- founder-specific business realities
- exact Shari responses
- app actions

---

## 5. Companion Intelligence

### Owns

- Shari's personality
- warmth
- trust
- presence
- pacing
- relationship development
- therapy-dog lens
- emotional safety
- boundaries
- nonjudgmental behavior

### Does Not Own

- feature logic
- exact routing
- ADHD research
- founder research
- navigation routes

---

## 6. Capability Intelligence

### Owns

- what each capability does
- inputs
- outputs
- permissions
- business rules
- limitations
- data requirements
- action behavior
- success and failure states

### Does Not Own

- conversation tone
- founder psychology
- ADHD research
- estate-room visuals

---

## 7. Estate Intelligence

### Owns

- rooms
- chamber members
- room purposes
- estate navigation structure
- destinations
- visual relationships
- room-to-capability mapping
- discovery locations

### Does Not Own

- conversation logic
- ADHD research
- memory rules
- feature permissions

---

## 8. Memory and Context Intelligence

### Owns

- what may be saved
- source of information
- confirmation state
- confidence
- freshness
- correction
- deletion
- retrieval
- relevant-context selection
- conflict resolution between memories

### Does Not Own

- conversation tone
- capability UI
- founder research
- ADHD research

---

## 9. Execution Intelligence

### Owns

- turning user intent into completed action
- orchestration order
- tool selection
- route selection
- action-risk level
- success confirmation
- failure fallback
- latency path
- retry rules

### Does Not Own

- the content of ADHD or founder knowledge
- Shari's personality
- estate visuals

---

## 10. Founder Intelligence

### Owns

- research-to-action reporting
- product opportunities
- evidence levels
- coverage gaps
- founder decisions
- product implications
- recommended next actions

### Does Not Own

- end-user conversation behavior
- ADHD knowledge itself
- founder lived-experience knowledge itself
- capability implementation

---

# Authoritative Processing Flow

```text
User Request
    ↓
Conversation Intelligence
    ↓
Intent + Confidence
    ↓
Relevant Intelligence Only
(ADHD / Founder / Human / Companion)
    ↓
Memory and Context Intelligence
    ↓
Execution Intelligence
    ↓
Capability Intelligence
    ↓
Estate Destination or Action
    ↓
Completion / Recovery
    ↓
Conversation Confirmation
```

---

# Precedence Order

When documents conflict, use this order:

1. Safety, privacy, and user-agency rules
2. INT-000 source-of-truth rules
3. Library-level standards
4. Capability specifications
5. Conversation patterns
6. Examples and sample wording

Examples never override standards.

Older documents must not override newer documents that explicitly supersede them.

---

# Document Ownership Header

Every new intelligence document should include:

```text
Primary Owner:
Supports:
Depends On:
Does Not Own:
Supersedes:
Status:
```

---

# Cross-Reference Rule

A document may reference another library for context.

Example:

- ADHD Intelligence explains why overwhelm occurs.
- Conversation Intelligence defines how Shari responds.
- Capability Intelligence defines what Clear My Mind™ does.
- Estate Intelligence defines where Clear My Mind™ lives.
- Execution Intelligence defines how the request reaches it.

No document should duplicate all five.

---

# Conflict Resolution Rule

If two documents disagree:

1. Identify the responsibility being disputed.
2. Find the library that owns that responsibility.
3. Treat that library's current standard as authoritative.
4. Mark the conflicting statement as superseded.
5. Update the manifest.

---

# Naming Rules

Use library prefixes consistently:

- INT — Intelligence architecture
- CONV — Conversation Intelligence
- ADHD — ADHD Intelligence
- FEI — Founder Experience Intelligence
- HEI — Human Experience Intelligence
- COMP — Companion Intelligence
- CAP — Capability Intelligence
- EST — Estate Intelligence
- MEM — Memory and Context Intelligence
- EXEC — Execution Intelligence
- FND — Founder Intelligence

---

# Repository Rule

Cursor should not implement from isolated files.

Cursor should first resolve:

- current owner
- current status
- superseding document
- dependencies
- applicable capability
- applicable execution rule

---

# Completion Standard

A new capability is complete only when:

- Capability Intelligence defines what it does.
- Estate Intelligence defines where it lives.
- Conversation Intelligence knows how users ask for it.
- Execution Intelligence can route and perform it.
- Memory and Context Intelligence defines what may be saved.
- Companion Intelligence ensures the interaction feels right.
- Relevant ADHD, Founder, or Human Intelligence is referenced.
- Founder Intelligence can evaluate its impact.

---

# Final Principle

Spark Estate™ should feel like one connected intelligence system.

The user should experience one Shari, one relationship, one shared context, and one clear path from conversation to completion.
