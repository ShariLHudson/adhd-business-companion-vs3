# 273 — Universal Blueprint Profile Context Connection Standard

## Standard ID

`standard.blueprint.profile_context_connection`

## Governing rule

Every Spark Estate Blueprint must automatically connect to the user’s existing business context so the user does not have to repeatedly re-enter information already known by the platform.

This applies to every existing Blueprint and every future Blueprint.

A Blueprint must use saved context intelligently, confirm only what is materially ambiguous, and never overwrite canonical profile information without the user’s permission.

## Scope

This Standard governs connections among:

- My Business Estate
- Business Profile
- Business DNA
- People I Help
- client avatars
- offers and services
- products
- brand voice
- values
- goals
- positioning
- business stage
- location and service area
- pricing assumptions
- team and role information
- current Projects
- Create artifacts
- Blueprint sessions
- Chamber capabilities
- canonical Universal Work
- saved decisions
- prior Blueprint outputs

## Core principle

The platform must distinguish between:

- information the user already established
- information specific to the current Blueprint
- temporary project-level overrides
- proposed updates to canonical business records
- assumptions
- missing information
- stale information
- conflicting information

The user should not have to type the same foundational information again unless:

- it is missing
- it is materially outdated
- the current Blueprint intentionally uses different information
- more than one valid context exists
- the user chooses to revise it

## Required automatic context loading

At Blueprint start, load all relevant available context, including:

- active business
- business name
- business type
- business description
- business model
- audience
- selected client avatar
- offers
- products
- services
- mission
- values
- brand voice
- brand attributes
- goals
- business stage
- location
- service area
- channels
- team
- operating constraints
- preferred language and terminology
- relevant existing Projects
- relevant Create artifacts
- prior outputs from the same Blueprint
- prior related decisions

## Context selection hierarchy

Use information in this order:

1. Current user answer in the active Blueprint
2. Current Blueprint-session override
3. Current creation or Project context
4. Selected business context
5. Selected client avatar, offer, product, or service
6. Business Profile
7. Business DNA
8. Platform defaults

A lower-priority source must never silently overwrite a higher-priority source.

## Context confirmation behavior

Do not ask the user to re-enter known information.

When ambiguity exists, ask a concise confirmation such as:

> “Is this for Visual Spark Studios and your ADHD entrepreneur audience?”

Do not ask broad repeated intake questions when the answer already exists.

## Required connection outcomes

Every Blueprint must:

- prefill known information
- show which business is active
- show which audience or avatar is active
- preserve the selected context
- allow temporary overrides
- allow intentional canonical updates
- remember prior Blueprint-specific choices
- resume with the same context
- retain provenance
- detect stale or conflicting information
- ask only necessary questions
- support multiple businesses
- support multiple avatars
- prevent accidental cross-business contamination

## Multiple-business support

When the user has more than one business, the Blueprint must:

- use the currently active business when unambiguous
- display the active business
- allow switching
- preserve Blueprint sessions by business
- never combine business data unless explicitly requested
- prevent one business’s avatar, offers, pricing, or brand voice from leaking into another business

## Multiple-avatar support

When more than one client avatar exists:

- use the selected avatar when already chosen
- use the most relevant avatar only when confidence is high
- ask for selection when ambiguity is material
- allow a Blueprint-specific audience override
- never alter the canonical avatar without permission

## No-repeat rule

A Blueprint must not ask for information that:

- exists in the selected canonical source
- is sufficiently current
- is relevant to the current work
- has not been intentionally overridden

Repeated questions are a certification failure unless the Blueprint is explicitly confirming a high-impact assumption.

## Governing statement

> Spark Estate should carry the user’s business understanding forward, not make the user rebuild it every time.
