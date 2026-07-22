# 070 — Authoritative Truth Standard

**Status:** Architecture Standard (design published; runtime not wired)  
**Audit:** [AUTHORITATIVE_TRUTH_AUDIT.md](../AUTHORITATIVE_TRUTH_AUDIT.md)  
**Extends:** [067 Trust Contract](./067_TRUST_CONTRACT_STANDARD.md) · [068 Commit Coordinator](./068_CREATION_COMMIT_COORDINATOR_STANDARD.md) · [069 Trust Kernel](./069_TRUST_KERNEL_STANDARD.md)  
**Does not replace:** Universal Creation Platform 045–065

> **Numbering:** Trust Contract remains **067**. Authoritative Truth is **070**.

## Mission

Every member-visible statement, recommendation, UI update, and recovery action must derive from one verified **Authoritative Truth Object (ATO)**.

There shall never be competing truths inside Spark Estate for an active creation.

## The Rule

For any active creation (Event, Book, Course, Project, Marketing Campaign, etc.), there is exactly one ATO.

The ATO is **not** another database or another workflow.  
It is the verified representation of what is true **right now** for that creation.

Every component reads from it. No component reconstructs reality independently.

## Domain vs ATO

| Layer | Role |
|---|---|
| **Creation / Event Record** | Durable domain owner (sections, facts, lifecycle) |
| **ATO** | Verified runtime snapshot + sole read API for member surfaces |
| **Trust Kernel** | Authorizes speech/UI claims from ATO verification |

For Events today, domain owner already exists: `EventRecord`. ATO completes it with workspace, persist, resume, conversation position, and verification fields.

## Authority Chain (no shortcuts)

User Message → Intent → Creation Engine → Persistence → Verification → **ATO updated** → only then UI, workspace, resume, recommendations, search, Current Focus, Shari.

## Golden Rule

Shari never speaks from assumptions, intentions, pending operations, or inferred state.  
She speaks only from the ATO.

## Forbidden

- Parallel Current Focus fields that invent focus  
- Resume by weak labels  
- Continuity claiming SoT while omitting Creation/Event ids  
- Success speech before ATO verification  
- A second Creation engine or duplicate content store
