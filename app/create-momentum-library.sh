#!/usr/bin/env bash
set -e

BASE="momentum-intelligence"

mkdir -p "$BASE/shared"
mkdir -p "$BASE/chamber-members/leadership"

# ---------- ROOT ----------

cat > "$BASE/README.md" <<'EOF'
# Momentum Intelligence Library

## Purpose
This library is the **source of truth** for all reusable intelligence used by
Momentum Chamber Members inside the companion-app. It exists independently of
any single feature or persona implementation — it is the knowledge layer that
Chamber Member behavior should eventually be built on top of.

## Status
This is currently a **skeleton only**. Folders and files exist as placeholders
with short notes describing intended content. Nothing here is yet connected to
runtime code or app behavior.

## Design Principle: Low-Token Retrieval
Content is intentionally split into many small, single-topic markdown files
rather than a few large documents. This allows a human or an AI assistant
(Cursor, Claude, etc.) to open only the specific file needed for a given task,
instead of loading large amounts of irrelevant context.

## Structure Overview
- `INDEX.md` — navigational map of the whole library
- `shared/` — standards that apply across all Chamber Members
- `chamber-members/` — one folder per Chamber Member persona (starting with `leadership/`)

See `INDEX.md` for where to find specific topics.
EOF

cat > "$BASE/INDEX.md" <<'EOF'
# Momentum Intelligence — Index

Use this file to navigate the library. Prefer opening only the specific file
you need rather than reading everything.

## Leadership (Chamber Member)
Path: `chamber-members/leadership/`
- Start at `README.md` in that folder, then `constitution.md`, then the one
  topic file relevant to your task (identity, philosophy, frameworks, etc.)

## Shared Standards (apply across all Chamber Members)
Path: `shared/`
- `conversation-standards.md`
- `coaching-standards.md`
- `teaching-standards.md`
- `writing-standards.md`
- `memory-standards.md`
- `ethics-and-boundaries.md`
- `orchestration-standards.md`
- `retrieval-standards.md`

## Frameworks
Path: `chamber-members/leadership/`
- `diagnostic-framework.md`
- `decision-frameworks.md`
- `coaching-framework.md`
- `teaching-framework.md`
- `mental-models.md`

## Playbooks & Processes
Path: `chamber-members/leadership/`
- `playbooks.md`
- `processes.md`

## Templates
Path: `chamber-members/leadership/templates.md`

## Handoff Rules
Path: `chamber-members/leadership/handoff-rules.md`
(also see `collaboration-rules.md` for cross-member collaboration norms)

## Executive Report Contributions
Path: `chamber-members/leadership/executive-report-contributions.md`

## Everything Else (Leadership)
- Mission & identity: `identity.md`, `mission-and-purpose.md`, `philosophy.md`, `guiding-principles.md`
- Knowledge base: `expertise.md`, `knowledge-domains.md`
- Conversation behavior: `discovery-questions.md`, `conversation-patterns.md`
- Supporting material: `stories-and-case-studies.md`, `quotes-and-wisdom.md`
- AI behavior: `ai-behavior-rules.md`, `memory-and-personalization.md`, `continuous-learning.md`
EOF

# ---------- SHARED ----------

cat > "$BASE/shared/README.md" <<'EOF'
# Shared Standards

## Purpose
Holds standards and rules that apply across **all** Chamber Members, not just
one persona (e.g. Leadership). When a Chamber Member needs to know "how should
I generally talk / coach / teach / write / remember / behave ethically /
hand off work / retrieve knowledge", it belongs here instead of being repeated
in every member's own folder.

## Files in this folder
- `conversation-standards.md` — general conversational tone/behavior rules
- `coaching-standards.md` — cross-member coaching approach
- `teaching-standards.md` — cross-member teaching approach
- `writing-standards.md` — voice, formatting, style rules for written output
- `memory-standards.md` — how personalization/memory should be handled
- `ethics-and-boundaries.md` — what members should never do
- `orchestration-standards.md` — how members coordinate with each other/the app
- `retrieval-standards.md` — how these files should be searched/loaded efficiently

## Status
Placeholder only — no real standards written yet.
EOF

cat > "$BASE/shared/conversation-standards.md" <<'EOF'
# Conversation Standards (Shared)

## Purpose
Defines the baseline conversational behavior expected of any Chamber Member —
tone, pacing, how to open/close a conversation, how to ask clarifying
questions.

## What Belongs Here
- General tone and register guidelines
- Rules for turn-taking and question-asking
- Do/don't examples for conversational style

## Status
Placeholder — no content yet.
EOF

cat > "$BASE/shared/coaching-standards.md" <<'EOF'
# Coaching Standards (Shared)

## Purpose
Baseline rules for how any Chamber Member should coach a member, independent
of persona-specific coaching frameworks.

## What Belongs Here
- General coaching posture (e.g. ask before advise)
- Shared do/don't rules for giving feedback
- Cross-member consistency rules for coaching style

## Status
Placeholder — no content yet.
EOF

cat > "$BASE/shared/teaching-standards.md" <<'EOF'
# Teaching Standards (Shared)

## Purpose
Baseline rules for how any Chamber Member should explain or teach a concept.

## What Belongs Here
- Preferred explanation structures (e.g. simple before complex)
- Rules on analogies, examples, jargon use
- Shared teaching tone guidelines

## Status
Placeholder — no content yet.
EOF

cat > "$BASE/shared/writing-standards.md" <<'EOF'
# Writing Standards (Shared)

## Purpose
Defines voice, formatting, and style rules for any written output produced by
a Chamber Member (documents, summaries, messages).

## What Belongs Here
- Formatting conventions (headings, lists, length norms)
- Voice/tone guidelines
- Words/phrases to avoid or prefer

## Status
Placeholder — no content yet.
EOF

cat > "$BASE/shared/memory-standards.md" <<'EOF'
# Memory Standards (Shared)

## Purpose
Defines how personalization and memory should be handled across all Chamber
Members — what should be remembered, for how long, and how it should be used.

## What Belongs Here
- What counts as useful long-term memory vs noise
- Rules for referencing past context appropriately
- Privacy/appropriateness boundaries for memory use

## Status
Placeholder — no content yet.
EOF

cat > "$BASE/shared/ethics-and-boundaries.md" <<'EOF'
# Ethics and Boundaries (Shared)

## Purpose
Defines hard boundaries that apply to every Chamber Member — things they
should never do or say, regardless of persona.

## What Belongs Here
- Prohibited behaviors/topics
- Escalation rules (when to defer to a human)
- Safety and appropriateness guardrails

## Status
Placeholder — no content yet.
EOF

cat > "$BASE/shared/orchestration-standards.md" <<'EOF'
# Orchestration Standards (Shared)

## Purpose
Defines how multiple Chamber Members (or a Chamber Member and other app
systems) coordinate — sequencing, priority, and shared context passing.

## What Belongs Here
- Rules for when one member should route to another
- Shared context-passing conventions
- Conflict resolution when guidance differs between members

## Status
Placeholder — no content yet.
EOF

cat > "$BASE/shared/retrieval-standards.md" <<'EOF'
# Retrieval Standards (Shared)

## Purpose
Defines how this knowledge library itself should be searched and loaded —
the retrieval contract for low-token usage.

## What Belongs Here
- Rules like "always read constitution.md before any topic file"
- Guidance on when to load multiple files vs a single file
- Naming/tagging conventions to keep retrieval predictable

## Status
Placeholder — no content yet.
EOF

# ---------- CHAMBER MEMBERS ----------

cat > "$BASE/chamber-members/README.md" <<'EOF'
# Chamber Members

## Purpose
Each subfolder here represents one Momentum Chamber Member persona and holds
that member's own intelligence (identity, frameworks, playbooks, etc.),
separate from the cross-member rules in `../shared/`.

## Current Members
- `leadership/` — the Leadership Chamber Member

## Adding a New Member
Future members should follow the same internal structure as `leadership/`
(a `README.md` describing read order, a `constitution.md`, and small
single-topic files).

## Status
Placeholder — only `leadership/` exists so far.
EOF

# ---------- LEADERSHIP ----------

cat > "$BASE/chamber-members/leadership/README.md" <<'EOF'
# Leadership — Read Me First

## Reading Order (Important for Low-Token Retrieval)
1. Always read `constitution.md` first. It is the compact top-level summary
   of who Leadership is and how it should behave.
2. Then open **only** the single topic file needed for the current task
   (e.g. `coaching-framework.md` if coaching guidance is needed,
   `handoff-rules.md` if deciding whether to hand off to another member).
3. Do not load every file in this folder for a single task — that defeats
   the purpose of splitting content into small files.

## Folder Contents
This folder holds all Leadership-specific intelligence: identity, mission,
philosophy, expertise, frameworks, playbooks, templates, collaboration and
handoff rules, executive report contributions, stories, and AI behavior
rules. See `../../INDEX.md` for a full map.

## Status
Placeholder skeleton — files contain short notes only, not real content yet.
EOF

cat > "$BASE/chamber-members/leadership/constitution.md" <<'EOF'
# Leadership — Constitution

## Purpose
The single compact file that should be read first, before any other file in
this folder. It should summarize, at a high level, who Leadership is, what it
is for, and point to the detailed topic files for anything deeper.

## What Belongs Here
- A short statement of Leadership's role within the Momentum Chamber
- Pointers to `identity.md`, `mission-and-purpose.md`, `philosophy.md`, and
  `guiding-principles.md` for more depth
- Any non-negotiable top-level rules

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/identity.md" <<'EOF'
# Leadership — Identity

## Purpose
Describes who/what the Leadership Chamber Member is (persona, voice, role).

## What Belongs Here
- Persona description
- Voice and tone specific to Leadership
- What distinguishes Leadership from other Chamber Members

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/mission-and-purpose.md" <<'EOF'
# Leadership — Mission and Purpose

## Purpose
Describes why the Leadership Chamber Member exists and what outcome it is
meant to help members achieve.

## What Belongs Here
- Mission statement
- Intended outcomes for Chamber Members interacting with Leadership

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/philosophy.md" <<'EOF'
# Leadership — Philosophy

## Purpose
Describes the underlying beliefs/worldview that shape how Leadership
approaches problems.

## What Belongs Here
- Core beliefs about leadership and decision-making
- Perspective/approach that differentiates this persona

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/guiding-principles.md" <<'EOF'
# Leadership — Guiding Principles

## Purpose
Short list of operating principles Leadership should follow consistently.

## What Belongs Here
- Numbered/short list of principles
- Brief rationale for each

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/expertise.md" <<'EOF'
# Leadership — Expertise

## Purpose
Describes the areas of expertise Leadership is expected to draw on.

## What Belongs Here
- List of expertise areas
- Depth/level of expertise expected in each

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/knowledge-domains.md" <<'EOF'
# Leadership — Knowledge Domains

## Purpose
Maps out the broader knowledge domains Leadership should be aware of, beyond
core expertise.

## What Belongs Here
- List of relevant knowledge domains
- Notes on how deep vs surface-level knowledge should be in each

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/mental-models.md" <<'EOF'
# Leadership — Mental Models

## Purpose
Collects the mental models/frameworks-for-thinking Leadership should apply
when reasoning through problems.

## What Belongs Here
- Named mental models with a short description of each
- When to apply each model

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/discovery-questions.md" <<'EOF'
# Leadership — Discovery Questions

## Purpose
Bank of questions Leadership should ask to understand a member's situation
before giving guidance.

## What Belongs Here
- Categorized lists of discovery questions
- Notes on when to use each category

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/diagnostic-framework.md" <<'EOF'
# Leadership — Diagnostic Framework

## Purpose
Defines the structured approach Leadership uses to diagnose a member's
problem before recommending a path forward.

## What Belongs Here
- Step-by-step diagnostic process
- Signals/criteria used to identify root issues

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/decision-frameworks.md" <<'EOF'
# Leadership — Decision Frameworks

## Purpose
Collects decision-making frameworks Leadership can offer to members facing
a choice.

## What Belongs Here
- Named frameworks (e.g. cost/benefit, reversible vs irreversible decisions)
- Guidance on when each framework applies

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/conversation-patterns.md" <<'EOF'
# Leadership — Conversation Patterns

## Purpose
Persona-specific conversation patterns for Leadership, layered on top of the
shared conversation standards.

## What Belongs Here
- Example conversation flows specific to Leadership topics
- Persona-specific phrasing patterns

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/coaching-framework.md" <<'EOF'
# Leadership — Coaching Framework

## Purpose
Persona-specific coaching methodology for Leadership, layered on top of the
shared coaching standards.

## What Belongs Here
- Step-by-step coaching approach specific to leadership topics
- Example coaching flows

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/teaching-framework.md" <<'EOF'
# Leadership — Teaching Framework

## Purpose
Persona-specific teaching methodology for Leadership, layered on top of the
shared teaching standards.

## What Belongs Here
- How Leadership explains leadership concepts
- Preferred structures/examples for teaching this persona's topics

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/playbooks.md" <<'EOF'
# Leadership — Playbooks

## Purpose
Concrete step-by-step playbooks for common leadership situations/scenarios.

## What Belongs Here
- Named playbooks (e.g. "handling a difficult 1:1")
- Step sequences for each scenario

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/processes.md" <<'EOF'
# Leadership — Processes

## Purpose
Repeatable internal processes Leadership follows or recommends.

## What Belongs Here
- Named processes with ordered steps
- Notes on inputs/outputs of each process

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/templates.md" <<'EOF'
# Leadership — Templates

## Purpose
Reusable templates Leadership can offer to members (documents, message
formats, plans).

## What Belongs Here
- Named templates with structure/placeholders
- Notes on when to use each template

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/collaboration-rules.md" <<'EOF'
# Leadership — Collaboration Rules

## Purpose
Rules for how Leadership collaborates with other Chamber Members or systems
within the app.

## What Belongs Here
- When Leadership should loop in another member
- How shared context should be communicated during collaboration

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/handoff-rules.md" <<'EOF'
# Leadership — Handoff Rules

## Purpose
Defines when and how Leadership should hand a conversation/task off to
another Chamber Member or to a human.

## What Belongs Here
- Trigger conditions for handoff
- What context must be passed along during a handoff

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/executive-report-contributions.md" <<'EOF'
# Leadership — Executive Report Contributions

## Purpose
Defines what Leadership should contribute when an executive-level report or
summary is being assembled.

## What Belongs Here
- What sections/insights Leadership is responsible for
- Format expectations for its contribution

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/stories-and-case-studies.md" <<'EOF'
# Leadership — Stories and Case Studies

## Purpose
Collects illustrative stories/case studies Leadership can reference to make
guidance concrete.

## What Belongs Here
- Short named stories/case studies
- The lesson/point each one illustrates

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/quotes-and-wisdom.md" <<'EOF'
# Leadership — Quotes and Wisdom

## Purpose
Collects short quotes or pieces of wisdom Leadership can draw on.

## What Belongs Here
- Short quotes with attribution
- Context on when each is useful

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/ai-behavior-rules.md" <<'EOF'
# Leadership — AI Behavior Rules

## Purpose
Persona-specific behavior rules for how an AI assistant should act while
operating as Leadership (beyond the shared ethics/boundaries rules).

## What Belongs Here
- Persona-specific dos and don'ts
- Edge cases specific to Leadership's scope

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/memory-and-personalization.md" <<'EOF'
# Leadership — Memory and Personalization

## Purpose
Persona-specific notes on memory/personalization, layered on top of the
shared memory standards.

## What Belongs Here
- What Leadership specifically should remember about a member
- How that memory should shape future leadership guidance

## Status
Placeholder — no real content yet.
EOF

cat > "$BASE/chamber-members/leadership/continuous-learning.md" <<'EOF'
# Leadership — Continuous Learning

## Purpose
Describes how the Leadership intelligence itself should evolve/improve over
time.

## What Belongs Here
- Process for capturing new learnings
- Notes on how/where updates should be reflected in this library

## Status
Placeholder — no real content yet.
EOF

echo "momentum-intelligence library scaffolded successfully."
