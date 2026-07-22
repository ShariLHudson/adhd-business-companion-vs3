# 058 — Platform Workspace Experience Standard

**Status:** Production Implementation Standard  
**Applies to:** Every Creation Workspace in Spark Estate  
**Extends:** [045](./045_PLATFORM_INTENT_ROUTING_AND_CREATION_STANDARD.md)–[055](./055_UNIVERSAL_CREATION_ENTRYPOINT_STANDARD.md) · [056 Create](./056_CREATE_EXPERIENCE_REDESIGN_STANDARD.md) · [057 Projects](./057_PROJECTS_EXPERIENCE_AND_AUTOMATIC_WORKSPACE_STANDARD.md)  
**Paired with:** [059 Discovery → Workspace Transition](./059_DISCOVERY_TO_WORKSPACE_TRANSITION_STANDARD.md) · [060 Intelligent Recommendation Engine](./060_INTELLIGENT_RECOMMENDATION_ENGINE_STANDARD.md)  
**Runtime:** `components/companion/CreateEstateWorkingPanel.tsx` · `lib/discoveryToWorkspace/` · `lib/eventCreationWorkspace/` · `lib/intelligentRecommendation/`

## Mission

Every Creation Workspace should feel like entering a living place where meaningful work is already underway — not opening a blank document, folder, or project manager.

The user should never wonder: Where do I start? What next? What have I finished? Where did my work go?

## Core Principle

A Workspace is not a document. It is a living environment that remembers, organizes, recommends, adapts, and grows with the work.

## Universal Workspace Layout

```text
Workspace Header
  ↓ Current Focus
  ↓ What We Already Know
  ↓ Recommended Next Step
  ↓ Current Assets
  ↓ Planning Sections
  ↓ Related Assets
  ↓ Activity Timeline
  ↓ Progress & Readiness
```

Domain-specific areas may extend this structure — they must not replace it.

## Header (member-facing only)

Creation Name · Creation Type · Current Phase · Overall Progress · Last Worked On · Primary Goal

Never: IDs · Registries · Project Home · Internal architecture

## Current Focus

Always answer: *What should I work on right now?*

One recommendation · reason · estimated effort (when known) · expected outcome · one primary action.

## What We Already Know

Summarize known context immediately. Never ask the user to restate it unless genuinely uncertain.

## ADHD-Friendly Rules

One primary recommendation · progressive disclosure · restore context automatically · no infrastructure management · reassurance before more work.

## Empty State

A Workspace should never appear empty. If only foundation exists, still show What We Know, Recommended Next Step, and Sections Ready to Begin.

## Failure Conditions

Blank workspace · “What do you want to create first?” after discovery · exposed infrastructure · duplicated work · forgotten context · overwhelm · inconsistent workspace behavior without reason.

## Platform Principle

A Creation Workspace is not where users store work. It is where they experience progress.
