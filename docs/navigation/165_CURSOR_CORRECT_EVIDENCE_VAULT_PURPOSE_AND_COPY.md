# Cursor Correction Prompt — Evidence Vault Purpose and Copy

## Purpose

Correct the conceptual definition, user-facing copy, discovery questions, and downstream behavior of the Evidence Vault.

The Evidence Vault is not primarily an accomplishments archive, strengths inventory, achievement tracker, portfolio, or proof-of-success system.

Its purpose is to preserve meaningful evidence of what the user is discovering through their life, work, decisions, relationships, challenges, and actions.

---

# Correct Definition

The Evidence Vault helps the user notice, preserve, and later revisit meaningful discoveries such as:

- something they discovered about themselves
- someone they helped
- a problem they solved
- something they learned
- a challenge they handled
- a pattern they noticed
- something they figured out
- something they created
- a decision they made
- a way they grew
- evidence that their perspective, confidence, judgment, or ability changed
- something meaningful they do not want to forget

The Vault may contain accomplishments or strengths when they are part of a meaningful discovery, but accomplishments and strengths are not the primary framing.

---

# Remove Incorrect Framing

Remove or rewrite copy that describes the Evidence Vault mainly as:

- proof of progress
- strengths
- results
- accomplishments
- achievements
- portfolio
- success archive
- performance record
- brag file

Do not position the Vault as a place where the user must prove their worth.

Do not make it sound like a résumé, trophy case, or achievement dashboard.

---

# Approved User-Facing Explanation

Use language similar to:

> The Evidence Vault helps you preserve what you are discovering about yourself, your work, and the difference you make. This might be someone you helped, a problem you solved, something you learned, a pattern you noticed, or a moment that showed you something important.

Optional shorter version:

> A private place to keep meaningful discoveries about yourself, your work, and the difference you make.

---

# Locked-State Copy

The locked state should remain minimal.

Show only:

> Click the moving key to open the Vault.

Do not place a long explanation over the locked doors.

The deeper explanation belongs inside How Do I… after opening.

---

# Today’s Discovery

## Heading

Use:

# Today’s Discovery

## Supporting Prompt

Use:

> What would you like to preserve today?

This is not limited to achievements.

---

# Discovery Questions

The six discovery questions should reflect the actual purpose of the Vault.

Recommended set:

1. **What happened?**
   - What moment, situation, conversation, challenge, or experience are you preserving?

2. **What did you discover about yourself?**
   - What did this show you about how you think, work, respond, decide, or care?

3. **Did you help someone?**
   - Who did you help, and what difference did your support make?

4. **What problem did you solve or move forward?**
   - What did you figure out, improve, repair, simplify, or make easier?

5. **What did you learn or notice?**
   - What lesson, pattern, insight, or new understanding emerged?

6. **Why might this matter later?**
   - What would you want your future self to remember about this?

These questions may be adapted for natural conversation, but the underlying purposes must remain.

Do not reduce the discovery flow to:

- What did you accomplish?
- What strength did you show?
- What result did you produce?

Those may appear only as optional follow-up prompts when relevant.

---

# Example Evidence Entries

Examples that belong in the Vault:

- I noticed I make better decisions when I talk through the options first.
- I helped a client feel less overwhelmed by breaking the project into smaller steps.
- I solved a recurring scheduling problem by changing the intake process.
- I realized I recover faster when I stop forcing myself to finish everything at once.
- I learned that a client objection was really confusion, not resistance.
- I created a simpler way to explain my offer.
- I handled a difficult conversation more calmly than I used to.
- I recognized a pattern in when I avoid certain tasks.
- I found a way to make a process easier for someone else.
- I made a choice that better matched my values.

Examples that may belong when tied to meaning:

- I completed a launch and discovered I can lead under pressure.
- I reached a goal and learned which support actually helped.
- I received positive feedback that confirmed a pattern I had not noticed.

The meaning is the discovery, not merely the achievement.

---

# How Do I…

How Do I… should explain:

## What belongs here?

- discoveries about yourself
- people you helped
- problems you solved
- lessons you learned
- patterns you noticed
- moments of growth
- meaningful decisions
- useful things you created or figured out

## What does not have to happen?

- you do not need a major accomplishment
- you do not need proof
- you do not need to write perfectly
- you do not need to answer every prompt in depth
- you do not need to turn every discovery into a goal

## Why keep these?

Because meaningful discoveries are easy to forget, especially when the user is tired, discouraged, overwhelmed, or focused on what remains unfinished.

The Vault helps the user remember what they have learned about themselves and how they make a difference.

---

# Data Model

The evidence record should support discovery-centered content.

Suggested conceptual shape:

```ts
type EvidenceDiscoveryRecord = {
  id: string;
  userId: string;
  title?: string;
  happened?: string;
  selfDiscovery?: string;
  personHelped?: string;
  problemSolved?: string;
  lessonOrPattern?: string;
  futureMeaning?: string;
  attachments?: EvidenceAttachment[];
  links?: EvidenceLink[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};
```

Do not require accomplishment, strength, metric, or result fields.

Those may exist only as optional metadata if useful.

---

# Retrieval and Reuse

Later retrieval may help the user:

- remember how they handled something before
- see recurring patterns
- recognize how they help people
- prepare for decisions
- reflect on growth
- strengthen confidence with grounded examples
- understand what approaches work for them
- reconnect with meaning during discouragement

Do not automatically convert Vault entries into marketing claims, résumé content, or public-facing proof.

The Vault is private by default.

---

# Relationship to Other Areas

## Evidence Vault

Owns meaningful discoveries and private evidence of learning, impact, problem-solving, and growth.

## Achievement Library

Owns formal accomplishments, completed work, portfolio items, milestones, and things the user may want to present or celebrate.

## Celebration Areas

Own recognition and celebration.

## Projects

Own active execution.

Do not collapse these into one area.

---

# Required Copy Audit

Search the repository for Evidence Vault copy using terms such as:

- accomplishment
- strengths
- results
- proof
- progress
- achievements
- portfolio

For every occurrence, classify it as:

- keep
- rewrite
- move to Achievement Library
- remove

Return the complete audit.

---

# Required Automated Tests

- locked state uses only key instruction
- Evidence Vault explanation uses discovery-centered language
- Today’s Discovery heading appears
- discovery questions include self-discovery
- discovery questions include helping someone
- discovery questions include problem-solving
- discovery questions include learning or patterns
- accomplishment language is not primary
- private-by-default rule is preserved
- Achievement Library ownership remains separate

---

# Authenticated Live Verification

1. Open Evidence Vault.
2. Confirm locked state contains no achievement-oriented paragraph.
3. Open the Vault.
4. Open How Do I….
5. Confirm it explains discoveries, helping, solving, learning, and patterns.
6. Start Today’s Discovery.
7. Confirm the questions are discovery-centered.
8. Complete an entry that is not an accomplishment.
9. Save it.
10. Reopen it.
11. Confirm it remains meaningful and understandable.
12. Confirm it does not appear as a portfolio or public achievement.

---

# Constraints

- do not frame the Vault as an accomplishment tracker
- do not frame it as a strengths inventory
- do not frame it as proof of worth
- do not move Achievement Library responsibilities into the Vault
- do not make entries public by default
- do not deploy production
- stop after authenticated preview and report results

---

# Required Report

Return:

- exact incorrect framing found
- exact files changed
- copy audit
- discovery question owner
- Evidence Vault data owner
- How Do I… owner
- Achievement Library separation owner
- automated test results
- authenticated preview URL
- screenshots
- remaining limitations
- deploy or do-not-deploy recommendation
