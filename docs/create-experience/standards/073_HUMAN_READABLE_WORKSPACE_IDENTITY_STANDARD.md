# 073_HUMAN_READABLE_WORKSPACE_IDENTITY_STANDARD.md

# Spark Estate — Human-Readable Workspace Identity Standard
## Mandatory Platform Rule
### 12/10 Production Standard

## Purpose

Every Creation Workspace must have two identities:

1. an internal system identity used by the platform
2. a human-readable identity used by the member

The platform must never expect a member to recognize or remember technical workspace labels such as:

- Workshop Creation Workspace
- Document Creation Workspace
- Runtime Creation Record
- Workspace ID
- Schema Version

Those labels may exist internally, but they are not the member-facing identity of the work.

---

## Core Rule

Members should always recognize their work by what they are creating, not by the technical workspace that contains it.

The platform must display:

- the work's real title
- the creation type
- its current status
- the current focus
- progress
- the last activity time

The platform must use the internal workspace identity only behind the scenes to reopen the exact same workspace.

---

## Internal Identity

Every Creation Workspace must maintain a stable internal identity containing:

- immutable Workspace ID
- Runtime Creation Record ID
- Creation Type
- Creation Subtype
- Schema Version
- Persistence Version
- Resume Target
- Created Timestamp
- Updated Timestamp

Internal identity must never change during resume.

Internal identity must never be shown as the primary member-facing label.

---

## Human-Readable Identity

Every Creation Workspace must maintain a member-facing identity containing:

- Human-Readable Title
- Creation Type
- Optional Subtype
- Current Status
- Current Focus
- Progress Summary
- Last Worked Date and Time
- Optional Short Description
- Optional Thumbnail or Icon

Example:

**Build Your Simple Productivity System**

Workshop · Draft Ready

Working on: Dates

12 of 30 sections complete

Last worked: Today at 2:15 PM

---

## Title Rules

The member-facing title must describe the actual work.

Good examples:

- Build Your Simple Productivity System
- Q4 Marketing Campaign
- Client Welcome Guide
- Employee Handbook
- Podcast Launch Plan
- Annual Leadership Retreat
- New Client Onboarding SOP

Do not use technical titles such as:

- Workshop Creation Workspace
- Event Workspace
- Project Workspace
- Document Creation Workspace
- Untitled Workspace
- Runtime Creation Record

If the member has not named the work yet, Spark Estate may generate a temporary human-readable title based on the member's request.

Example:

Member request:

> I want to create a workshop for ADHD business owners about simple productivity.

Temporary title:

> Simple Productivity Workshop for ADHD Business Owners

The member must be able to rename it later.

---

## Naming Priority

Use the first available source in this order:

1. Member-provided title
2. Confirmed title from Current Focus
3. Generated temporary title based on the original request
4. Creation type plus meaningful topic
5. Last-resort temporary label such as:
   - Untitled Workshop
   - Untitled Project
   - Untitled SOP

Never use “Creation Workspace” as the member-facing fallback.

---

## Resume Surface Rule

Every resume surface must display the human-readable identity.

This applies to:

- Welcome Home
- Continue Where You Left Off
- Older Drafts
- Projects
- Create
- Search
- Notifications
- Chat-based resume
- Recent Work
- Active Work
- Future mobile views
- Future dashboard views

Example card:

**Build Your Simple Productivity System**

Workshop · Draft Ready

Next step: Dates

Last worked: Today

[Continue]

---

## Resume Behavior

When the member chooses Continue, the platform must use the internal identity to reopen:

- the exact same Workspace ID
- the exact same Runtime Creation Record
- the exact same Current Focus
- the exact same section schema
- the exact same answers
- the exact same draft
- the exact same progress

The human-readable identity is for recognition.

The internal identity is for exact restoration.

Do not reconstruct a new workspace from the title.

Do not use the title as the primary database key.

Do not create duplicates when titles match.

---

## Chat Resume Rule

When a member asks:

- Let's go back to my workshop.
- Continue my productivity workshop.
- Open the client guide I was working on.
- Take me back to my SOP.

Spark Estate must:

1. search active and recent work by human-readable identity
2. resolve the exact internal Workspace ID
3. reopen the exact workspace
4. verify the Current Focus
5. then respond naturally

Example:

> Welcome back. I've reopened **Build Your Simple Productivity System**. We were working on the Dates section.

Do not say:

- I've opened Create.
- I've opened your Workshop Creation Workspace.
- I can help you build that in Create.
- Opening Create beside us.
- Let's start a new workshop.

If multiple works match, ask a focused clarification using human-readable titles.

Example:

> I found two workshops:
>
> **Build Your Simple Productivity System**
>
> **ADHD Business Planning Workshop**
>
> Which one would you like to continue?

---

## Display Consistency

The same human-readable title must appear consistently across:

- Current Focus
- Workspace header
- Welcome Home
- Projects
- Create
- Search
- Resume cards
- Chat confirmations
- Notifications
- Saved work lists

Do not allow one surface to call it:

> Workshop Creation Workspace

while another calls it:

> Workshop

and another calls it:

> Build Your Simple Productivity System

The human-readable title is the canonical member-facing name.

The creation type may appear as secondary metadata.

---

## Status Language

Use member-friendly status labels such as:

- Getting Started
- In Progress
- Draft Ready
- Needs Review
- Ready to Use
- Paused
- Completed

Do not show internal statuses such as:

- hydrated
- persisted
- runtime_active
- schema_locked
- record_resolved

---

## Progress Language

Progress must help the member understand where they are.

Good examples:

- Working on: Dates
- Next step: Audience
- 5 of 30 sections complete
- Draft ready for review
- Last worked: Yesterday
- Waiting for your answer

Avoid vague labels such as:

- Active
- Open
- Workspace exists
- Record found

---

## Accessibility and ADHD Usability

The member-facing identity must be easy to scan.

Required hierarchy:

1. Title
2. Type and Status
3. Current Focus or Next Step
4. Progress
5. Last Worked
6. Continue action

Do not overload resume cards with internal details.

Use large readable text.

Keep each card visually distinct.

Use the same layout everywhere.

Avoid requiring the member to remember where the work was created.

---

## Duplicate Title Handling

Two workspaces may have the same human-readable title.

The platform must distinguish them using secondary metadata such as:

- creation type
- date
- client
- project
- status
- last worked time

Example:

**Client Welcome Guide**

Document · Acme Consulting · Last worked Monday

**Client Welcome Guide**

Document · Hudson Coaching · Last worked June 8

Internal Workspace IDs remain the true identifiers.

---

## Title Updates

When the member renames the work:

- update the human-readable title everywhere
- preserve the same Workspace ID
- preserve the same Runtime Creation Record
- preserve resume continuity
- preserve history
- do not create a new workspace

---

## Failure Rule

If the human-readable title cannot be loaded:

- do not replace it with technical workspace language
- use a safe temporary label based on creation type
- preserve the internal identity
- allow the member to continue

Example:

> Untitled Workshop

Do not display:

> workspace_7f2a91

---

## Certification Requirements

This standard is not complete until browser validation proves:

1. A new creation receives a human-readable title.
2. The title appears in the workspace header.
3. The same title appears in Welcome Home.
4. The same title appears in Projects.
5. The same title appears in Create.
6. Chat uses the same title when resuming.
7. Resume opens the exact same Workspace ID.
8. Renaming updates every surface without creating a duplicate.
9. Two same-title items remain distinguishable.
10. No member-facing surface uses “Creation Workspace” as the primary name.
11. No technical IDs are shown to the member.
12. Refresh preserves both internal and human-readable identity.

---

## Completion Standard

This rule is complete only when members can always answer:

- What am I working on?
- Which item is this?
- Where did I leave off?
- How far have I gotten?
- When did I last work on it?
- How do I continue?

without needing to understand how Spark Estate stores or routes the work.

The member should recognize the work instantly.

The platform should restore it exactly.
