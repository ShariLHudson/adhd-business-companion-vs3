# 212 — Conversation Governance & Change Standard

**Runtime:** `lib/conversationArchitecture/governance.ts`  
**Cursor rule:** `.cursor/rules/conversation-governance.mdc`

## Purpose

Prevent architectural drift.

## Rules

1. No experience may bypass the Conversation Intelligence Engine (production).
2. No duplicate response generators.
3. No hidden prompt chains.
4. One owner per responsibility.
5. All changes require regression testing.
6. New conversational patterns must be registered.
7. Gold Standard examples must be certified before runtime use.
8. Legacy conversation code must be removed after migration.

## PR review

Every conversation-related pull request must verify:

- architecture compliance
- validator compatibility
- Shari voice consistency
- regression coverage
- no new bypass pipeline
- gold certification if corpus changed

Checks: `CONVERSATION_PR_REVIEW_CHECKS`
