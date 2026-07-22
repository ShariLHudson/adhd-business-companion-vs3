# 597 — Runtime, Routing & Testing Specification

## Canonical work type
ID: `facebookCommunity`
Category: `marketing-community`

## Required state
workId, ownerId, title, status, phase, completedPhases, type, audience, purpose, promise, positioning, names, selectedName, tagline, privacy, visibility, About, questions, rules, bannerBrief, bannerPrompt, profilePrompt, welcomeAssets, contentPillars, launchPlan, growthPlan, moderationPlan, analyticsPlan, operatingPlan, decisions, assumptions, risks, provenance, linkedProjectId, timestamps.

## Routing
- Marketing: positioning, launch, acquisition, growth
- Client Relationships: member journey, belonging, retention
- Content: pillars, programming, calendar
- Creative Studio: banner and visual identity
- Events: lives, challenges, workshops
- Create: artifacts, save/resume, export, versioning
- Projects: intentional implementation handoff only

## Conversation behavior
Start with purpose, not settings. Ask one question at a time. Retain answers. Summarize decisions. Allow uncertainty. Recommend without silent decisions. Never auto-publish or imply direct Facebook administration. Distinguish a design brief from an actual image. Generate a banner only after explicit user choice.

## Artifacts
Foundation Brief, Naming Workbook, Brand & Banner Brief, Setup Workbook, Welcome Kit, Content Calendar, Launch Plan, Growth Plan, Moderator Handbook, Analytics Plan, Operating Manual, Master Blueprint.

## Tests
Registration, phase order, save/resume, skipping, explicit Create lock, Project handoff, routing, privacy warning, unsupported-feature honesty, banner prompts, membership-question limits, rules, launch, moderation, analytics caveats, no guarantees, no forced monetization, no auto-publishing, no duplicates, provenance, and Shari voice.

## Red-team cases
Guaranteed growth; mass-adding people; deceptive engagement; unnecessary sensitive data; competitor copying; public shaming; unavailable features; mistaken belief that assets were uploaded; late privacy change; long interruption; low capacity; simple client-group need.

## Certification
Do not mark CERTIFIED until automated tests pass, browser flow is run, save/resume and persistence work, routing is correct, banner flow is tested, accessibility/mobile checks pass, and unavailable features are handled honestly.
