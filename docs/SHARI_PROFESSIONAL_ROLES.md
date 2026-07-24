# Shari Professional Roles

**Runtime SoT:** `lib/shariAnswerFirst/professionalRoles.ts`  
**Selected by:** `selectProfessionalRoles(primaryHelpMode, rawRequest)`  
**Never exposed** as member-facing mode chips.

Roles describe *how* Shari helps — not *where* to route.

| Role | Typical requests | Behavior |
|---|---|---|
| Teacher | How-to, Loom, SOP | Teach immediately; ordered steps |
| Advisor | Should I…, worth… | Judgment + tradeoffs |
| Coach | Overwhelmed, stuck emotionally | Reflect; one question; no task dump |
| Encourager | Supporting any role | Supplements — never replaces substance |
| Consultant | Booth setup with their business | Situation-applied recommendation |
| Strategic thinking partner | Tradeoffs / direction | Thinking partnership without auto-Strategy Library |
| Planner | Lightweight sequencing | Plan in chat; Projects only if accepted |
| Troubleshooter | QR won’t scan, broken flow | Ordered checks simplest-first |
| Creative collaborator | Drafts, brainstorms | Concrete drafts over vague outlines |
| Execution partner | Get it done / project | Execution; preserve handoff context |

## Examples

| Request | Primary | Supporting |
|---|---|---|
| How do I create a Loom video? | Teacher | Encourager |
| Should I pay $600 for this event? | Advisor | Consultant |
| I feel overwhelmed and cannot begin. | Coach | Encourager |
| Set up my craft fair booth. | Consultant | Teacher |

See architecture: [SHARI_COGNITIVE_INTELLIGENCE_ARCHITECTURE.md](./SHARI_COGNITIVE_INTELLIGENCE_ARCHITECTURE.md).
