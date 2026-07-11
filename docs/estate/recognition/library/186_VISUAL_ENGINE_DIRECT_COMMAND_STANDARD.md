# 186_VISUAL_ENGINE_DIRECT_COMMAND_STANDARD

# Spark Estate™
## Spark Visual Engine™ Direct Command Standard

**Version:** 1  
**Status:** Binding product law  
**Date:** 2026-07-09  
**Series:** Spark Visual Engine (185–194)  
**Source:** `Downloads/186_VISUAL_ENGINE_DIRECT_COMMAND_STANDARD.md`

**Related:**
- [184 Spark Visual Engine Standard](./184_SPARK_VISUAL_ENGINE_STANDARD.md)
- [183 Universal Access Standard](./183_UNIVERSAL_ACCESS_STANDARD.md)
- Runtime — `lib/sparkVisualEngine/`

---

## Purpose

Define how Spark responds when a member directly asks for a visual map, diagram, timeline, process, workflow, or related visual view.

---

## Core Rule

Direct visual requests must be fulfilled immediately.

Do not ask if the member wants to visualize.

Do not redirect to another room first.

Do not make the member choose from a menu when the requested view is clear.

---

## Direct Command Examples

If member says:

- Create a mind map.
- Make a mindmap.
- Map this out.
- Show this visually.
- Create a workflow.
- Make a flowchart.
- Show this as a timeline.
- Create a decision tree.
- Show the relationships.
- Make a project map.
- Show the steps.
- Create a process map.
- Show me the possibilities.

Spark should open the Spark Visual Engine™ in the correct view.

---

## Routing Table

| Member Phrase | Visual View |
|---|---|
| mind map / mindmap / idea map / concept map | Mind Map |
| map this out / show this visually | Thought Map or recommended view |
| workflow / flowchart / SOP / process | Process Map |
| timeline / roadmap / sequence / phases | Timeline View |
| decision tree / compare options / pros and cons | Decision View |
| relationship map / connections / network | Relationship Map |
| project map / project board | Project Map |
| priority / what first / quick wins | Priority View |
| possibilities / expand this / brainstorm paths | Possibility View |
| customer journey / member journey / transformation path | Journey View |

---

## When Context Exists

If the member is already working on something, use the current context.

Example:

Member is creating a workshop and says:

“Make a mind map.”

Spark creates a mind map of the workshop.

---

## When Context Is Missing

If there is no content yet, open the requested view with a simple starter prompt.

Example:

“Create a mind map.”

Spark opens Mind Map view and asks:

“What should we put in the center?”

---

## No-Block Rule

The current room or experience must not block a direct visual command.

Examples:

- Journal Gazebo™ → Create a process map
- Projects™ → Create a decision tree
- Peaceful Places™ → Make a mind map
- Clear My Mind™ → Show timeline
- Evidence Vault™ → Show relationships

All should work.

---

## Success Criteria

Direct requests feel instant.

The member does not feel questioned, redirected, or corrected.

Spark behaves like it understood exactly what they asked for.
