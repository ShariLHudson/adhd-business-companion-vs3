# 060 — Intelligent Recommendation Engine Standard

**Status:** Production Implementation Standard  
**Applies:** Platform-wide  
**Extends:** [045](./045_PLATFORM_INTENT_ROUTING_AND_CREATION_STANDARD.md)–[055](./055_UNIVERSAL_CREATION_ENTRYPOINT_STANDARD.md) · [058 Workspace Experience](./058_PLATFORM_WORKSPACE_EXPERIENCE_STANDARD.md) · [059 Discovery Transition](./059_DISCOVERY_TO_WORKSPACE_TRANSITION_STANDARD.md) · [061 State Machine](./061_UNIVERSAL_CREATION_STATE_MACHINE_STANDARD.md)  
**Runtime:** `lib/intelligentRecommendation/`  
**Note:** Document ID is **060**. Your draft filename `058_INTELLIGENT_…` redirects here (058 is Platform Workspace Experience).

## Mission

Spark Estate should always recommend the most helpful next step — not the next checklist item, not a random suggestion, not every option. **The best next step.**

## Core Principle

Recommendations exist to reduce thinking. Never to increase it.

Users should feel: *"I was just about to do that."*

## Recommendation Hierarchy

Current Goal → Creation Phase → Dependencies → Known Context → Progress → Readiness → Relationships → Previous Decisions → Conversation → Preferences → Energy (when known) → Historical Patterns

Never simply: "Next item in template."

## Categories

Continue Work · Build Something · Make a Decision · Review · Complete · Resolve Dependency · Prepare · Connect · Improve · Celebrate · Learn · Archive · Reuse

## Confidence

| Level | Behavior |
|-------|----------|
| Very High | Immediately recommend |
| High | Recommend normally |
| Medium | Offer as alternative |
| Low | Do not display unless requested |
| Very Low | Suppress |

## Limits (ADHD-friendly)

- **One** primary recommendation (Current Focus)
- **At most three** secondary
- **At most one** urgent
- Never flood the screen · never guilt · never shame unfinished work

## Dependency Awareness

Recommend work that unlocks additional work (e.g. Agenda → Workbook → Presentation → Run of Show).

Changing one asset may trigger **review** recommendations elsewhere — never silently rewrite dependents.

## Conversation

Never: "You should complete Step 6."

Instead: natural Shari voice explaining why now, effort, and what it unlocks.

## Universal Rule

Every Creation Workspace uses the same Recommendation Engine. No Workspace implements independent recommendation logic.

## Platform Principle

Spark Estate should never ask "What would you like to do next?" if it already knows. Guide confidently toward the highest-value next step — final decision always remains with the member.
