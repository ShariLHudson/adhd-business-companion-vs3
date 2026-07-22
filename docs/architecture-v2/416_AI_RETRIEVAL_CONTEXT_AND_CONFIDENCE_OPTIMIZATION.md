# 416 — AI Retrieval, Context & Confidence Optimization

## Purpose

Ensure AI / Intelligence answers use the right knowledge, current evidence, and confidence language.

## Retrieval order

1. current user context
2. canonical platform knowledge
3. member-specific durable knowledge
4. approved current research
5. external live verification when required

## Context assembly

Include only what affects:

- outcome
- risk
- constraints
- prior decisions
- user capability
- workflow environment
- data sensitivity

## Confidence levels

- high
- moderate
- low
- insufficient

## Confidence factors

- source quality
- source agreement
- freshness
- task ambiguity
- domain risk
- model certainty
- evidence completeness

## Response rule

When confidence is not high:

- state what is known
- state what is uncertain
- explain what would change the answer
- avoid unsupported specificity

## Retrieval failure

If relevant knowledge is missing:

- say so
- ask for the minimum missing context
- use live research when appropriate
- do not invent a complete answer

## Context-size discipline

Do not overload the model with every related artifact.

Prefer:

- active goal
- relevant constraints
- recent decisions
- highest-authority sources
