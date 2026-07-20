# Cursor Prompt — Audit, Implement, Certify, Commit, and Push Create

You are working in the Spark Estate™ repository.

## Mission

Complete the implementation of the Universal Create experience so the actual platform behavior matches the committed Universal Creation standards 076–090.

The standards are already committed in:

- 076 V2 Bundles 01–14
- Create Foundation certification
- 077–083
- 084–090 completion architecture

The previous commit:

`81128ff3 — docs: ingest Universal Creation standards 076-090`

contained documentation only.

Do not treat documentation ingestion as implementation completion.

The objective now is to:

1. audit the existing Create implementation against standards 076–090;
2. identify what is implemented, partial, missing, conflicting, duplicated, or dead;
3. implement the missing and incorrect Create behavior;
4. browser-test the full experience;
5. isolate the Create code changes from unrelated dirty work;
6. commit and push only the verified Create implementation and its tests.

---

# Critical Repository Safety Rules

The repository currently contains a large number of unrelated dirty paths.

Do not:

- commit all dirty files;
- reset or discard unrelated work;
- include older standards 045–074 unless they are directly required by the Create implementation;
- mix unrelated Companion, Estate, navigation, profile, or other platform work into the Create implementation commit;
- remove code merely because it looks old;
- rename or reorganize unrelated files;
- overwrite working functionality without first mapping it;
- claim Create is complete before browser certification passes.

Before editing:

1. inspect `git status`;
2. identify every existing dirty path related to Create;
3. separate Create-related changes from unrelated work;
4. preserve all unrelated changes exactly as they are;
5. create a clearly scoped implementation plan.

Use small, reviewable commits where practical.

---

# Source of Truth

Use standards 076–090 as the governing source of truth.

Do not invent a competing architecture.

Use the existing repository implementation where it already satisfies the standards.

Where the code and standards conflict:

- document the conflict;
- determine whether the current behavior is intentional or obsolete;
- update the implementation to satisfy the standards unless doing so would break a verified dependency;
- explain any exception.

One capability should have one authoritative owner.

Avoid duplicate local implementations.

---

# Phase 1 — Full Create Implementation Audit

Perform a repository-wide audit of the current Create implementation.

Search for and inspect:

- Create pages and routes
- Continue / reopen experiences
- Full Workshop Map
- Work ID creation and persistence
- Section ID creation and routing
- section editors
- section click handlers
- save
- autosave
- durable persistence
- complete for now
- reopen completed sections
- delete
- archive
- restore
- duplicate
- branch
- rename
- move
- print
- PDF export
- DOCX / Markdown / HTML export
- templates
- starter drafts
- examples
- contextual AI actions
- Give Me Ideas
- I’m Not Sure
- Help Me Think
- Ask Shari
- Ask Chamber
- Ask Board
- review and quality checks
- version history
- version comparison
- Project conversion
- related work
- attachments
- search
- preferences
- recovery
- offline or failed-save behavior
- dialogs
- toolbar commands
- keyboard shortcuts
- mobile equivalents
- accessibility
- browser tests
- regression tests

Also inspect the currently dirty Create-related files, including but not limited to:

- `CompanionPageClient`
- Create runtime libraries
- Continue/delete work
- any uncommitted section-routing, save, delete, or reopen code

Do not assume those changes are correct or complete.

---

# Required Audit Output

Create a production-quality Markdown audit file in the repository.

Suggested filename:

`CREATE_IMPLEMENTATION_AUDIT_076_090.md`

For every standard from 076 through 090, classify each requirement as:

- Implemented
- Partially Implemented
- Missing
- Conflicting
- Duplicate
- Dead / Nonfunctional
- Not Applicable

For every finding include:

- standard and section;
- requirement;
- current file or component;
- current behavior;
- gap;
- risk;
- recommended implementation;
- dependencies;
- browser test required.

Also produce:

## A. Current Create Architecture Map

Document the actual current implementation:

- routes;
- components;
- hooks;
- services;
- state stores;
- database tables;
- persistence path;
- command handlers;
- editors;
- tests.

## B. Dead-Control Inventory

List every visible Create button, menu item, section row, toolbar item, or link that does not function correctly.

## C. Duplicate-Ownership Inventory

Identify capabilities implemented in more than one place.

## D. Data-Safety Risks

Identify any path where work could be:

- overwritten;
- lost;
- silently unsaved;
- deleted without recovery;
- opened with the wrong Work ID;
- opened with the wrong Section ID;
- replaced by a new draft;
- corrupted by multi-tab or stale-state behavior.

## E. Implementation Order

Provide a dependency-aware implementation plan.

Do not begin broad implementation until the audit is complete.

---

# Phase 2 — Required Reference Workflow

Use Event as the first fully certified reference Work Type.

The Event Full Workshop Map must support at minimum:

- Event Type
- Purpose
- Outcomes
- Audience
- Format
- Date and Time
- Venue or Online Platform
- Budget
- Revenue and Pricing
- Program and Agenda
- Speakers and Facilitators
- Attendee Experience
- Registration
- Marketing
- Sponsors
- Vendors
- Volunteers and Team
- Equipment and Technology
- Accessibility
- Food and Hospitality
- Swag and Materials
- Risk and Contingencies
- Run of Show
- Communication Plan
- Day-of Operations
- Follow-Up
- Evaluation
- Final Review

Every visible section row must be clickable.

Every section must:

- open;
- display the correct content;
- allow editing;
- save;
- autosave;
- show truthful save status;
- support completion for now;
- reopen after completion;
- preserve versions;
- return to the Full Workshop Map;
- support previous and next section navigation;
- support Give Me Ideas;
- support I’m Not Sure;
- support Help Me Think;
- support contextual examples;
- support contextual review where defined.

A completed section must never become permanently read-only.

“Complete” means complete for now.

---

# Phase 3 — Core Create Commands

Implement or verify the authoritative command behavior from 084.

At minimum, ensure these work:

## Work-Level Commands

- Create New
- Open
- Recent
- Rename
- Duplicate
- Branch
- Move
- Archive
- Restore
- Move to Trash
- Permanently Delete where policy allows
- Save as Template
- Close safely

## Editing Commands

- Save
- Autosave
- Undo
- Redo
- Cut
- Copy
- Paste
- Find
- Replace

## Section Commands

- Open
- Edit
- Save
- Complete for Now
- Reopen
- Skip for Now
- Add Note
- Add Task
- Add Reminder
- Attach File
- Add Link
- Restore Version
- Add Optional Section
- Remove Optional Section where allowed

## Output Commands

- Print
- Export PDF
- Export DOCX
- Export Markdown
- Export HTML
- Copy All
- Publish or Share where currently supported

## Navigation Commands

- Previous Section
- Next Section
- Jump to Section
- Return to Workshop Map
- Return to Project
- Return to Source
- Return to Business Estate where applicable

Every visible command must either:

- work correctly; or
- be intentionally disabled with a clear reason.

No dead controls.

---

# Phase 4 — Persistence, Delete, and Recovery

This phase is release-blocking.

## Save

The interface must distinguish:

- editing locally;
- saving;
- durable save complete;
- save failed;
- recovery copy available.

Never show “Saved” before durable persistence succeeds.

## Delete

Define and implement distinct behavior for:

- remove from current view;
- archive;
- move to Trash;
- permanently delete.

Do not use one ambiguous “Delete” action for all meanings.

Deleting from Continue must:

- target the correct Work ID;
- remove only the selected item;
- preserve other work;
- update the Continue list immediately;
- allow recovery when using Trash;
- show a precise confirmation;
- survive refresh;
- pass browser certification.

## Recovery

Implement or verify:

- refresh recovery;
- crash recovery;
- failed-save recovery;
- stale-state detection;
- multi-tab conflict warning;
- safe reopen;
- no silent overwrite.

---

# Phase 5 — Print, Export, and Output

Implement or verify the output behavior from 085.

At minimum:

- print preview;
- print selected sections or full work;
- PDF export;
- editable document export where supported;
- correct source Work ID;
- correct source version;
- readable page layout;
- headings and page breaks;
- accessibility-conscious output;
- truthful failure reporting.

Do not claim a format is supported unless it works in the browser and produces a valid file.

---

# Phase 6 — Contextual Intelligence

Implement or verify the contextual action system from 082–083.

The following actions must use the active Work ID, Section ID, current content, Work Type, audience, purpose, and relevant constraints:

- Give Me Ideas
- I’m Not Sure
- Help Me Think
- Show Examples
- Research This
- Review This
- Improve This
- Find Gaps
- Check Consistency
- Ask Shari
- Ask Chamber
- Ask Board

Do not return generic help when section-specific context exists.

Do not expose internal routing complexity to the member.

The member should receive one coherent response.

---

# Phase 7 — Accessibility and Responsive Behavior

Verify:

- keyboard navigation;
- visible focus;
- logical focus order;
- screen-reader labels;
- save and error announcements;
- dialogs that restore focus;
- large readable text;
- sufficient spacing;
- touch-sized targets;
- no hover-only core controls;
- mobile access to every critical Create action;
- reduced-motion support.

Do not remove capabilities on mobile merely to simplify layout.

---

# Phase 8 — Browser Certification

Use real browser testing.

Do not rely only on unit tests or code inspection.

At minimum, certify these end-to-end scenarios:

## Scenario 1 — Create New Event

1. Open Create.
2. Choose Event.
3. Create a new Event.
4. Confirm a new Work ID.
5. Confirm the Full Workshop Map appears.
6. Confirm every visible section row is clickable.

## Scenario 2 — Edit and Save

1. Open Purpose.
2. Enter content.
3. Save.
4. Leave the section.
5. Refresh.
6. Reopen Purpose.
7. Confirm content persists.

## Scenario 3 — Complete and Reopen

1. Mark Purpose Complete for Now.
2. Return to the map.
3. Confirm status updates.
4. Reopen Purpose.
5. Edit it.
6. Save.
7. Confirm the previous version remains available.

## Scenario 4 — Continue

1. Leave the Event.
2. Open Continue.
3. Open the same Event.
4. Confirm the correct Work ID and last meaningful location.

## Scenario 5 — Delete from Continue

1. Delete one selected work item.
2. Confirm precise behavior.
3. Confirm only that Work ID is affected.
4. Refresh.
5. Confirm the list remains correct.
6. Restore it if Trash is used.

## Scenario 6 — Contextual Help

1. Open Audience.
2. Select I’m Not Sure.
3. Confirm the help is audience-specific.
4. Use Give Me Ideas.
5. Confirm ideas are Event/Audience-specific.
6. Insert one suggestion.
7. Save and refresh.

## Scenario 7 — Print and Export

1. Print the Event.
2. Export PDF.
3. Confirm correct sections and current version.
4. Open the generated file.
5. Confirm readable formatting.

## Scenario 8 — Save Failure

1. Simulate a failed save.
2. Confirm the interface does not claim durable success.
3. Confirm recovery options.
4. Retry.
5. Confirm successful durable save.

## Scenario 9 — Mobile

1. Open Event on a mobile viewport.
2. Open a section.
3. Edit.
4. Save.
5. Use contextual help.
6. Return to map.
7. Complete and reopen.

## Scenario 10 — Accessibility

1. Complete the core workflow using keyboard only.
2. Verify visible focus.
3. Verify dialog focus behavior.
4. Verify status and error announcements.

Record evidence for every scenario.

---

# Phase 9 — Implementation Report

Create a final implementation report.

Suggested filename:

`CREATE_IMPLEMENTATION_CERTIFICATION_REPORT.md`

Include:

- what was implemented;
- files changed;
- database changes;
- migrations;
- tests added;
- browser scenarios passed;
- failures found and corrected;
- known limitations;
- deferred items;
- screenshots or test evidence references;
- exact commit hashes;
- exact pushed branch.

Do not say “complete” when anything release-blocking remains.

---

# Phase 10 — Commit and Push

After implementation and certification:

1. inspect `git status`;
2. stage only Create-related implementation, tests, migrations, and required documentation;
3. exclude unrelated dirty files;
4. review the staged diff;
5. run type checking, linting, tests, and browser certification;
6. commit in clearly scoped commits;
7. push to the intended branch;
8. report the branch and commit hashes.

Suggested commit structure:

1. `audit(create): map implementation against standards 076-090`
2. `feat(create): implement universal workspace and section behavior`
3. `feat(create): implement commands delete save reopen print and export`
4. `feat(create): add contextual intelligence and recovery`
5. `test(create): certify universal create workflows`
6. `docs(create): record implementation certification`

Do not use a single “commit everything” command.

Do not stage unrelated dirty paths.

---

# Final Response Required

When finished, report:

## Architecture Audit

- Implemented
- Partial
- Missing
- Conflicting
- Duplicate
- Dead

## Implementation Completed

List the actual working capabilities.

## Browser Certification

List every passed scenario.

## Remaining Limitations

Be explicit.

## Git Status

- branch
- commits
- pushed or not
- unrelated dirty files preserved
- exact number of remaining dirty paths

## Completion Decision

Use one of these exact conclusions:

- `CREATE IMPLEMENTATION CERTIFIED`
- `CREATE IMPLEMENTATION PARTIALLY COMPLETE`
- `CREATE IMPLEMENTATION NOT READY`

Do not declare certification unless all release-blocking scenarios pass.
