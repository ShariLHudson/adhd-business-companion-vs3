# Universal Creation Framework™

**Status:** BINDING (implementation adapter — subordinate to [Creation Guidance Intelligence](../CREATION_GUIDANCE_INTELLIGENCE.md))  
**Runtime:** `lib/universalCreation/`  
**Philosophy:** One exceptional creation experience — document types are plugins, not separate builders.

**Member-facing creation:** Creating Together ([ESTATE_CREATION_EXPERIENCE.md](../ESTATE_CREATION_EXPERIENCE.md)).  
**Guidance authority:** [CREATION_GUIDANCE_INTELLIGENCE.md](../CREATION_GUIDANCE_INTELLIGENCE.md) owns lifecycle steps; Universal Creation persists plugin slots and phases as an **adapter**.

## Vision

Every creation in Spark Estate should feel the same — whether a one-page email or a 200-page course.

```
Discover → Prepare → Create → Enhance → Review → Revise → Approve → Deliver
```

The document type only changes **questions, templates, and enhancements** — not the member's experience.

## Eight phases

| Phase | Purpose |
|-------|---------|
| **1. Discovery** | Short conversation — what, why, who, success |
| **2. Preparation** | Templates, branding, prior work, research — ready before Create opens |
| **3. Guided Creation** | Conversation IS the interface — build while listening |
| **4. Enhancement** | Suggest useful additions (checklist from SOP, social from newsletter) |
| **5. Review** | Show complete · section by section · changes · summarize first |
| **6. Revision** | Unlimited natural edits until satisfied |
| **7. Approval** | *Does this feel ready?* |
| **8. Completion** | Print · Drive · PDF · template · project · library — per document type |

## Document plugins

Registered in `documentRegistry.ts`:

Email · Newsletter · SOP · Proposal · Guide · Workbook · Training Manual · Blog · Book Chapter · Course · Meeting Agenda · Social Post · Business Plan · Checklist · White Paper · Workflow · …

Each plugin defines:

- Detection patterns
- Discovery questions (what / why / who / success)
- Preparation behavior
- Enhancement offers
- Completion actions
- Uncertainty paths (teach · recommend · research · examples)

## Uncertainty rule → Research Create

If the member doesn't know an answer — especially **steps, process, or expertise** — Spark **never repeats the question** and **never leaves them stuck**.

**Immediate mode switch:** Research Create ([ADAPTIVE_CREATION_INTELLIGENCE.md](../ADAPTIVE_CREATION_INTELLIGENCE.md))

During Research Create, Spark may:

- Recommend a direction  
- Teach how it usually works  
- Show examples  
- Research best practices **with** the member  

Studio opens only after enough understanding exists to draft — not at create intent.

## Adaptive Intelligence

Throughout creation, Spark applies learned preferences:

- Conversation over forms
- Examples first
- Section-by-section review
- Checklists after SOPs
- PDF / Drive habits

See [ESTATE_ADAPTIVE_INTELLIGENCE.md](./ESTATE_ADAPTIVE_INTELLIGENCE.md).

## Pipeline position

```
User Request
    ↓
Conversation Mode (Create)
    ↓
Conversation Session
    ↓
Creation Guidance Intelligence  ← orient → capture → structure → draft → review → complete
    ↓
Universal Creation (adapter — plugins · persistence · UC phases)
    ↓
Studio Readiness → Create Studio (when populated)
```

Estate Discovery Mode handles **non-create** intents (focus, business growth, research).  
Create intents route through **Creation Guidance** first; Universal Creation **mirrors** session state — it does not own intake or step logic.

## Related

- [CREATION_GUIDANCE_INTELLIGENCE.md](../CREATION_GUIDANCE_INTELLIGENCE.md) — **binding** lifecycle authority
- [STUDIO_READINESS_INTELLIGENCE.md](../STUDIO_READINESS_INTELLIGENCE.md)
- [CONVERSATION_SESSION_ARCHITECTURE.md](../CONVERSATION_SESSION_ARCHITECTURE.md)
- [docs/README.md](../README.md) — architecture index
- [ESTATE_DISCOVERY_MODE.md](./ESTATE_DISCOVERY_MODE.md)
- [ESTATE_ADAPTIVE_INTELLIGENCE.md](./ESTATE_ADAPTIVE_INTELLIGENCE.md)
- [INTENT_FIRST_ESTATE_NAVIGATION.md](./INTENT_FIRST_ESTATE_NAVIGATION.md)
- Spec 104 Create Experience Philosophy
