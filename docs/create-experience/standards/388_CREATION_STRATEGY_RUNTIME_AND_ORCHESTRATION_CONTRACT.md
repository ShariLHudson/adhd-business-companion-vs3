# 388 — Creation Strategy Runtime & Orchestration Contract

## Purpose

Add strategic evaluation without slowing ordinary creation.

## Runtime sequence

1. receive creation intent
2. determine whether strategy review is warranted
3. search canonical artifacts and relationships
4. compare intended outcome and use
5. evaluate existing Blueprints and Projects
6. calculate similarity and duplication risk
7. evaluate smallest sufficient scope
8. calculate reusable value
9. recommend one strategy
10. hand off to the canonical owner
11. record the strategy decision and outcome

## Strategy review triggers

Run when:

- the user asks what is best
- the request is substantial
- strong similarity matches exist
- repeated creation is detected
- a connected asset set may exist
- a Blueprint or Project may already solve the need
- the output may become reusable knowledge

Skip or minimize when:

- the request is small
- the user explicitly wants direct creation
- no meaningful overlap exists
- delay would add more friction than value

## Handoff owners

- new or revised artifact → Universal Create
- adaptation → Create Once, Adapt Everywhere
- connected set → Connected Creation Set service
- Blueprint → Blueprint router
- execution → Projects
- knowledge candidate → canonical Knowledge Intelligence authority
- archive or deletion → artifact lifecycle owner

## Observability

Record:

- strategy review reason
- matches considered
- recommended action
- user choice
- artifact outcome
- duplication avoided
- reuse achieved
- later value signal
