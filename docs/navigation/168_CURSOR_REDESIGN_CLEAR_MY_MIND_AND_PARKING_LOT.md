# 168_CURSOR_REDESIGN_CLEAR_MY_MIND_AND_PARKING_LOT

## Purpose

Redesign Clear My Mind, Park It, and Parking Lot so users immediately understand:

- which experience to use
- what each one does
- what happens next
- where captured items go
- how large numbers of items stay organized
- how the user can review only what matters now

This is not a copy-only correction.

The current model is too vague and will become overwhelming as lists grow.

Do not preserve a flat, unfiltered list architecture.

---

# Core Distinction

## Clear My Mind

Clear My Mind is for many thoughts competing for attention.

Use when the user has:

- several tasks
- ideas
- worries
- reminders
- unfinished conversations
- open loops
- too much in their head
- no clear place to begin

Approved explanation:

> Have a lot swirling around in your head? Put everything here—tasks, ideas, worries, reminders, and unfinished thoughts. Shari will help separate them and decide what belongs today, later, in a project, as a reminder, or nowhere at all.

Support line:

> Best when there is more than one thing on your mind.

Primary action:

**Empty My Mind**

---

## Park It

Park It is for one specific thing the user does not want to handle right now.

Use when the user has:

- one task
- one idea
- one worry
- one reminder
- one follow-up
- one distracting thought

Approved explanation:

> Have one thing you are not ready to deal with? Park it here so you can stop carrying it in your head. It will stay safely in your Parking Lot until you decide what to do with it.

Support line:

> Best for one task, idea, worry, follow-up, or reminder.

Primary action:

**Park This**

---

## Parking Lot

Parking Lot is the organized destination where parked items live.

Approved explanation:

> Your Parking Lot is a safe place for things you are not ready to act on yet. Nothing here needs your attention until you are ready. You can leave items alone, organize them, move them to Today, create reminders, add them to projects, or remove them when they no longer matter.

Support line:

> This is where you review and organize what you parked.

Primary action:

**View My Parking Lot**

---

# Clear My Mind Flow

## Step 1 — Capture

Allow the user to enter many thoughts at once.

Support:

- one thought per line
- commas
- voice input where already supported
- freeform brain dump
- pasted lists

Do not force structure during capture.

---

## Step 2 — Separate

Split the brain dump into individual thought items.

Preserve the user’s original wording.

Do not over-interpret.

Allow the user to:

- combine items
- split an item
- edit an item
- delete an item
- add a missing item

---

## Step 3 — Reassure

After capture, show:

> They’re out of your head now.

Then summarize:

- number captured
- number needing clarification
- number ready to organize

Do not immediately force the user to process every item.

---

## Step 4 — Gentle Next Choice

Offer:

- Review 5 Now
- Let Shari Organize Them
- Park Everything for Now
- Continue Tomorrow

Do not show the entire list by default if there are many items.

---

## Step 5 — Route Individually

Each separated thought can go to:

- Today
- Parking Lot
- Reminder
- Project
- Delete / Let Go
- Keep in Clear My Mind Draft

Preserve source = clear-my-mind.

Prevent duplicate creation.

---

# Clear My Mind Large-List Behavior

If many thoughts are captured:

- show counts first
- keep items collapsed
- process in small batches
- allow Review 5 Now
- allow Next 5
- preserve progress
- let the user stop at any time
- never require processing all items

Suggested message:

> You captured 47 thoughts. You do not need to sort all of them now. We can look at five, organize them automatically, or leave everything safely parked.

---

# Park It Flow

## Capture

Allow one item with:

- title
- optional note

Do not require:

- category
- review date
- project
- reminder
- priority

Quick capture must remain frictionless.

---

## Confirmation

After save, show:

> Parked. You can let this go for now—it will be waiting in your Parking Lot.

Primary action:

- Done

Secondary actions:

- Add a Review Date
- Move It Somewhere Else
- Edit

Do not force another decision.

---

# Parking Lot Home

The Parking Lot must not open to a giant flat list.

Show a calm summary first.

## Summary

- Total Parked
- Review Soon
- Recently Added
- Needs a Decision
- Resolved This Month

Suggested message:

> You have 38 parked items. Only 4 need your attention today.

Do not imply everything needs review.

---

# Default Parking Lot Sections

Use collapsed groups:

## Recently Parked

Newest items.

## Review Soon

Items with a review date approaching.

## Needs a Decision

Items flagged by the user or Shari.

## Leave Alone for Now

Items with no review date.

## Moved Elsewhere

Items moved to Today, reminders, or projects.

## Resolved or Archived

Completed, dismissed, or archived items.

Do not expand every group automatically.

---

# Parking Lot Data Model

Use one authoritative parked item model.

```ts
type ParkedItem = {
  id: string;
  userId: string;
  title: string;
  notes?: string;
  category?: string;
  source:
    | "park-it"
    | "clear-my-mind"
    | "conversation"
    | "project"
    | "other";
  status:
    | "parked"
    | "review-soon"
    | "needs-decision"
    | "moved-to-today"
    | "reminder-created"
    | "added-to-project"
    | "resolved"
    | "archived";
  parkedAt: string;
  reviewDate?: string;
  projectId?: string;
  reminderId?: string;
  tags?: string[];
  updatedAt: string;
};
```

Do not require every field at capture.

---

# Filters

Provide filters for:

## Status

- All Parked
- Review Soon
- Needs a Decision
- Moved to Today
- Reminder Created
- Added to Project
- Resolved
- Archived

## Source

- Park It
- Clear My Mind
- Conversation
- Project
- Other

## Category

- Business
- Client
- Content
- Idea
- Personal
- Follow-Up
- Worry / Concern
- Someday
- Other

Categories are optional.

## Time

- Today
- This Week
- This Month
- Older

---

# Search

Search across:

- title
- notes
- category
- tags
- source

Search must work with large numbers of items.

---

# Sort

Provide:

- Newest first
- Oldest first
- Review date
- Recently updated
- Category

---

# Grouping

Allow grouping by:

- Status
- Category
- Review date
- Source

Preserve the user’s last chosen view.

---

# Item Display

Use compact rows or compact cards.

Each item should show only:

- title
- date parked
- source
- optional category
- review status

Do not show all notes and actions by default.

Use progressive disclosure.

---

# Item Actions

Each item must support:

- Leave Parked
- Move to Today
- Create Reminder
- Add to Project
- Set Review Date
- Edit
- Mark Resolved
- Archive
- Delete

Use one visible primary action and a More menu.

Do not place nine buttons on every item.

---

# Bulk Actions

When many items exist, allow safe bulk actions:

- Set Category
- Set Review Date
- Archive
- Delete with confirmation
- Move to Project

Do not bulk Move to Today without a strong confirmation.

Do not bulk-create reminders unintentionally.

---

# Scale Requirements

Test with at least:

- 25 items
- 100 items
- 300 items

Requirements:

- no giant wall of expanded cards
- filters remain responsive
- search remains responsive
- groups collapse
- pagination or virtualization is used where needed
- item actions remain accessible
- selected filters persist during navigation

---

# Review Without Pressure

The Parking Lot should not nag.

Suggested message:

> Nothing here needs your attention right now. You can review one item, organize a few, or leave everything parked.

Provide:

- Review One Item
- Review Items Due Soon
- Organize a Few
- Leave Everything Alone

Do not use alarming overdue styling unless the user explicitly assigned a review date.

---

# How Do I…

Add How Do I… to Clear My Mind, Park It, and Parking Lot.

Explain:

## Clear My Mind

Use when many things are competing for attention.

## Park It

Use when there is one specific thing you want to stop thinking about for now.

## Parking Lot

This is the organized place where parked items live.

Also explain:

- what Leave Parked means
- how review dates work
- how to move items
- how to organize many items
- that nothing must be processed immediately

---

# Relationship Between the Three

Clear My Mind
→ capture many thoughts
→ separate them
→ route each thought

Park It
→ capture one item
→ send it directly to Parking Lot

Parking Lot
→ review and organize parked items later

Do not route Park It into Clear My Mind.

Do not make Parking Lot another capture flow.

---

# Required Root-Cause Audit

Investigate:

- why current descriptions remain unclear
- whether Park It and Clear My Mind share duplicate copy
- whether both routes use the same component incorrectly
- whether Parking Lot is a flat list
- whether large lists render unbounded
- whether filter state exists
- whether parked item source is preserved
- whether item actions actually update state
- whether Clear My Mind creates duplicates
- whether moved items remain incorrectly visible as active parked items

Report exact causes.

---

# Required Automated Tests

## Copy

- Clear My Mind describes many thoughts
- Park It describes one item
- Parking Lot describes an organized destination
- CTAs are distinct
- support lines are distinct

## Clear My Mind

- multiple thoughts capture
- split works
- combine works
- edit works
- Review 5 Now works
- Park Everything for Now works
- individual routing works
- duplicates are prevented

## Park It

- one item saves
- note is optional
- category is optional
- review date is optional
- confirmation appears
- source = park-it

## Parking Lot

- search works
- filters work
- sorting works
- grouping works
- compact display works
- item actions work
- review dates work
- source filters work
- categories remain optional
- archived items separate correctly

## Scale

- 25 items remain usable
- 100 items remain usable
- 300 items remain usable
- no unbounded expanded rendering
- pagination or virtualization works
- filters remain responsive

---

# Authenticated Live Verification

## Explanations

1. Open Clear My Mind.
2. Read the description.
3. Open Park It.
4. Read the description.
5. Open Parking Lot.
6. Confirm the difference is obvious without extra explanation.

## Clear My Mind

1. Enter at least 20 thoughts.
2. Confirm they separate correctly.
3. Review only five.
4. Park several.
5. Move one to Today.
6. Create one reminder.
7. Add one to a project.
8. Continue later.
9. Confirm progress is preserved.

## Park It

1. Park one item.
2. Confirm the reassuring save message.
3. Finish without categorizing.
4. Confirm the item appears in Parking Lot.

## Parking Lot

1. Test with at least 25 items.
2. Search.
3. Filter by source.
4. Filter by status.
5. Sort.
6. Group.
7. Set review dates.
8. Move items to Today.
9. Create reminders.
10. Add to projects.
11. Archive items.
12. Confirm the interface remains calm and readable.

---

# Constraints

- do not use vague duplicate descriptions
- do not keep a flat unfiltered list
- do not require categories during capture
- do not force users to process everything
- do not show all actions on every item
- do not pressure the user to empty the Parking Lot
- do not deploy production
- stop after authenticated preview and report results

---

# Required Implementation Report

Return:

- exact root causes
- exact files changed
- Clear My Mind owner
- Park It owner
- Parking Lot data owner
- search/filter owner
- grouping/sort owner
- bulk-action owner
- saved-state owner
- automated test results
- authenticated preview URL
- screenshots
- remaining limitations
- deploy or do-not-deploy recommendation
