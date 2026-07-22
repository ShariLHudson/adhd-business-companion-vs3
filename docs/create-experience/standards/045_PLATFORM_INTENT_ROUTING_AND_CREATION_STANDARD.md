# 045 — Platform Intent Routing and Creation Standard

**Status:** Binding  
**Companion:** [046 Create Blueprint Standard](./046_CREATE_BLUEPRINT_STANDARD.md) · [047 Create Ecosystem & Asset Generation](./047_CREATE_ECOSYSTEM_AND_ASSET_GENERATION_STANDARD.md) · [048 Creation Workspace](./048_CREATION_WORKSPACE_STANDARD.md) · [049 Connection & Relationship Registry](./049_CREATION_ECOSYSTEM_CONNECTION_STANDARD.md)  
**Runtime:** `lib/platformIntent/`

## Mission

Spark Estate does not expect users to understand platform architecture.

Users should never have to decide:

- Which Chamber member to use
- Whether to use Create
- Whether to create a Project
- Whether to use Cartography
- Whether to ask the Board

The platform determines the appropriate experience based on the user's intent.

## Core Philosophy

Users describe what they want to accomplish.

Spark Estate decides:

- who should help
- what expertise is needed
- what blueprint should be used
- whether a Project Home is appropriate
- whether Visible Thinking would help
- whether Board advice is valuable

The user should experience one continuous conversation.

## Universal Intent Detection

Every incoming message must first determine the user's primary intent before answering.

### Intent Types

| Intent | Meaning | Action |
|--------|---------|--------|
| **KNOW** | Wants knowledge | Stay in current Chamber member. Answer. Do not launch Create or Projects. Do not change destinations. |
| **DECIDE** | Wants help choosing | Stay in conversation. Offer Round Table Board if appropriate. Never auto-switch destinations. |
| **CREATE** | Wants to build something | Identify Create Blueprint. Launch Create into that blueprint. Never force menus when intent is clear. |
| **IMPROVE** | Already has something | Open/continue existing asset in Create. Preserve history. |
| **CONTINUE** | Resume previous work | Locate existing creation. Resume. Never duplicate. |

### Examples

**KNOW**

- What is the best way to…
- Explain…
- Why…
- How does…
- What should I consider when planning a retreat?

**DECIDE**

- Which option is better?
- Should I…
- Compare…
- Help me choose…

**CREATE**

- Help me create…
- I want to write…
- I need to plan…
- Let's build…
- Help me make…
- I want to plan a retreat.

**IMPROVE**

- Improve this…
- Rewrite…
- Expand…
- Update…
- Fix…

**CONTINUE**

- Continue my…
- Let's finish…
- Open my…

## Chamber Member Routing Rules

Every Chamber member behaves identically regarding routing. Only expertise changes. Conversation quality remains identical.

### Knowledge → stay

| Member | Example | Action |
|--------|---------|--------|
| Marketing | What is the best way to market a membership? | Answer. Stay. No Create. |
| Events | What should I consider when planning a retreat? | Answer. Stay. No Create. |
| Leadership | How do I motivate volunteers? | Answer. Stay. No Create. |

### Create → blueprint doorway

| Member | Example | Launch |
|--------|---------|--------|
| Marketing | I want to create a launch plan. | Create → Marketing Launch Blueprint |
| Content | I want to write an ebook. | Create → Book Blueprint |
| Events | I want to plan a retreat. | Create → Retreat Event Blueprint |
| Finance | Help me create a budget. | Create → Budget Blueprint |
| Leadership | Help me build leadership training. | Create → Leadership Training Blueprint |

The Chamber member becomes the intelligent doorway.

## Create Rules

- Create never begins with a blank page.
- Every creation uses a Blueprint (see 046).
- Project creation is automatic when beneficial — never require the user to decide.
- Visible Thinking is offered when the Blueprint says Helpful or higher — never forced.
- Board members advise; they never create. When a decision results in creation, offer one-click setup.

## Universal Conversation Rules

Every Chamber member must:

1. Understand the entire request
2. Determine intent
3. Remain conversational
4. Stay on topic
5. Avoid unnecessary clarification
6. Ask only information required
7. Never restart the conversation
8. Never repeat the user's wording
9. Never force menus
10. Never expose internal routing
11. Never require the user to understand architecture

## Create Home Screen

Create begins with: “What would you like to create?”

Large text entry. Below:

1. I know what I want.
2. Help me figure it out.
3. Browse Categories.

If the user types a clear creation (“I want to create a retreat.”) → immediately Events / Retreat Blueprint. No menus.

If they need help figuring out what to create → Shari helps determine intent, then selects Blueprint.

## Cross-System Connections

Every creation shares one canonical Creation Record, used by Create, Projects, Cartography, relevant Chamber member, Search, History, Conversations, and Knowledge retrieval.

Never duplicate the same creation across systems.

## Platform Principle

Users describe what they want to accomplish.

Spark Estate determines the correct expert, blueprint, workflow, project structure, visual thinking support, and implementation path.

The platform should feel like working with an exceptionally capable human guide—not like navigating software.
