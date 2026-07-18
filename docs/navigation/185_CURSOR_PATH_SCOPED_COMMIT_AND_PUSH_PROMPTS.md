# 185_CURSOR_PATH_SCOPED_COMMIT_AND_PUSH_PROMPTS.md

# Cursor Prompts — Path-Scoped Commit and Push Sequence

Use these prompts one at a time, in order.

Do not use `git add .`.

Do not deploy to production.

---

# PROMPT 1 — Commit Settings Simplicity

Audit, test, and commit only the approved Settings simplicity work.

## Approved scope

Stage only the relevant Settings files:

- `components/companion/settings/`
- `components/companion/ConversationStylePanel.tsx`
- `components/companion/ConversationStylePanel.test.tsx`
- `components/companion/HelpModePanel.tsx`
- `components/companion/SettingsPanel.tsx`
- `components/companion/CuriosityBeforeCommandsPanel*` only if the current diffs are exclusively part of this Settings work
- `components/companion/NotificationSoundPreferences.tsx` only if the current diff is exclusively part of this Settings work
- `components/companion/PatternAwarenessPanel*` only if the current diffs are exclusively part of this Settings work
- `.cursor/rules/settings-simplicity-control.mdc`
- matching documentation under `docs/navigation/173_*`, `174_*`, and `175_*`, if present

## Required process

1. Run `git status`.
2. Inspect every approved file with `git diff`.
3. Exclude unrelated hunks.
4. Stage only the approved paths or reviewed hunks.
5. Run the relevant Settings tests.
6. Inspect the staged diff with `git diff --cached`.
7. Confirm no unrelated files, secrets, temporary files, generated files, or untested work are staged.
8. Commit only after the staged diff is clean.

## Commit message

Use:

`feat: simplify settings and response preferences`

## Stop conditions

Stop and report instead of committing if:

- an approved file contains unrelated changes that cannot be safely isolated
- relevant tests fail
- the staged diff contains unrelated work
- secrets or environment files appear
- the branch is not the intended preview branch

## Return

Report:

- tests run and results
- staged files
- excluded files
- commit hash
- commit message
- any remaining Settings limitations

Do not push yet.

---

# PROMPT 2 — Commit Talk It Out, RCI 182, and CI 183

Audit, test, and commit only the approved Talk It Out, Reflective Conversation Intelligence, and Conversational Intelligence work.

## Approved scope

Stage only:

- `lib/talkItOut/`
- `lib/reflectiveConversationIntelligence/`
- `lib/conversationalIntelligence/`
- `components/companion/TalkItOutPanel.tsx`
- `components/companion/estate/EstateTopRightChrome.tsx` only for the Talk It Out navigation/forward change
- documentation under:
  - `docs/navigation/170_*`
  - `docs/navigation/171_*`
  - `docs/navigation/172_*`
  - `docs/navigation/173_*` through `176_*` only where directly related to Talk It Out
  - `docs/navigation/182_*`
  - `docs/navigation/183_*`
  - `docs/navigation/TALK_IT_OUT_FINDABILITY_VERIFICATION.md`
- only the reviewed Talk It Out / RCI / CI hunks in `CompanionPageClient.tsx`

## Important staging rule

Do not stage the entire `CompanionPageClient.tsx`.

Use interactive hunk staging or another safe path-scoped method. Inspect each hunk before staging it.

Do not include package 184 unless its implementation files have been separately completed, tested, and audited.

## Required process

1. Run `git status`.
2. Inspect all approved paths with `git diff`.
3. Review `CompanionPageClient.tsx` hunk by hunk.
4. Stage only Talk It Out / RCI / CI changes.
5. Run all relevant tests, including:
   - Talk It Out tests
   - RCI tests
   - CI tests
   - navigation/findability tests
6. Inspect `git diff --cached`.
7. Confirm no unrelated Boardroom, Chamber, Project Home, portrait, Peaceful Places, Evidence Vault, CSS, gallery, spin-wheel, temporary, audit, or generated files are staged.
8. Commit only after the staged diff is clean.

## Commit message

Use:

`feat: add reflective and conversational intelligence to talk it out`

## Stop conditions

Stop and report instead of committing if:

- `CompanionPageClient.tsx` cannot be safely isolated by hunk
- tests fail
- Talk It Out files contain unrelated changes
- staged files include package 184 without separate approval
- branch is not the intended preview branch

## Return

Report:

- tests run and results
- staged files
- reviewed CPC hunks
- excluded files
- commit hash
- commit message
- remaining authenticated Talk It Out smoke-test requirements

Do not push yet.

---

# PROMPT 3 — Commit Create Launchers and Strategy Removal 180

Audit, test, and commit only the approved Create launcher and Strategy-removal work from package 180.

## Approved scope

Stage only:

- `lib/createCatalogData.ts`
- `lib/createCatalog.test.ts`
- `lib/createEstate/`
- `lib/createExperience/blockLegacyCreateWorkspaceRouting*`
- `lib/createWorkflow.ts` only for `hasLaunchableCreateWorkflow` and related package-180 changes
- `components/companion/CreateEstateEntrancePanel.tsx`
- documentation under `docs/navigation/180_*`
- only the reviewed Create-related hunks in `CompanionPageClient.tsx`

## Important staging rule

Do not stage the entire `CompanionPageClient.tsx`.

Use reviewed hunks only.

Do not stage unrelated Create taxonomy, gallery, CSS, automation, checklist, or other experimental work unless it is explicitly part of the approved 180 implementation and has passed its tests.

## Required process

1. Run `git status`.
2. Inspect every approved path with `git diff`.
3. Review `CompanionPageClient.tsx` hunk by hunk.
4. Stage only package-180 Create changes.
5. Run:
   - `createLaunchers180.test.ts`
   - related Create catalog tests
   - legacy Create guard tests
   - Create workflow tests
6. Verify from code and tests:
   - every visible Create option has a launchable workflow
   - Strategy Library is not in Create
   - Strategy data remains intact
   - Strategy Library remains reachable under Get Advice
7. Inspect `git diff --cached`.
8. Confirm no unrelated files are staged.
9. Commit only after the staged diff is clean.

## Commit message

Use:

`fix: enable create launchers and remove strategy from create`

## Stop conditions

Stop and report instead of committing if:

- Create changes cannot be safely isolated
- tests fail
- Strategy data was deleted
- Strategy Library no longer has a valid remaining route
- unrelated CPC hunks are staged
- branch is not the intended preview branch

## Return

Report:

- tests run and results
- staged files
- reviewed CPC hunks
- excluded files
- commit hash
- commit message
- remaining authenticated Create smoke-test requirements

Do not push yet.

---

# PROMPT 4 — Commit Reminders and Rhythms Cleanup 177

Audit, test, and commit only the approved Reminders and Rhythms cleanup work.

## Approved scope

Stage only:

- `components/companion/ReminderRhythmRoomChrome.tsx`
- `components/companion/RemindersRoomPanel.tsx`
- `components/companion/RhythmsRoomPanel.tsx`
- `lib/remindersVsRhythms/simplifyScreen177.test.ts`
- documentation under `docs/navigation/177_*`, if present and accurate

## Required process

1. Run `git status`.
2. Inspect all approved files with `git diff`.
3. Exclude unrelated reminder logic, notification-engine work, CSS, or experimental UI changes.
4. Stage only approved package-177 changes.
5. Run all relevant Reminders / Rhythms tests.
6. Inspect `git diff --cached`.
7. Confirm no unrelated files are staged.
8. Commit only after the staged diff is clean.

## Commit message

Use:

`refactor: simplify reminders and rhythms experience`

## Stop conditions

Stop and report instead of committing if:

- relevant tests fail
- approved files contain unrelated changes that cannot be isolated
- reminder behavior or stored data is broken
- branch is not the intended preview branch

## Return

Report:

- tests run and results
- staged files
- excluded files
- commit hash
- commit message
- remaining preview limitations

Do not push yet.

---

# PROMPT 5 — Final Combined Verification and Push

The four approved path-scoped commits should now exist.

Do not create another feature commit unless a critical verification fix is required and separately documented.

## Required verification

1. Run `git status`.
2. Confirm the working tree still contains only intentionally uncommitted and excluded work.
3. List the four new commits in order.
4. Confirm each commit contains only its intended bucket.
5. Run the combined relevant test suite for:
   - Settings
   - Talk It Out
   - Reflective Conversation Intelligence
   - Conversational Intelligence
   - Create
   - Reminders / Rhythms
6. Run repository-standard:
   - typecheck
   - lint
   - build
7. Do not include unrelated failing legacy checks without identifying them clearly.
8. Confirm the current branch is the intended preview branch.
9. Confirm the configured remote and upstream branch.
10. Push normally.
11. Do not force-push.
12. Do not deploy to production.

## Excluded work

Ensure the following remain uncommitted unless separately approved:

- Boardroom
- Chamber
- portraits
- Peaceful Places
- Project Homes
- Evidence Vault
- estate knowledge JSON
- `.tmp-*`
- `.audit-data.json`
- approved-upload dumps
- unrelated CSS
- gallery work
- spin-wheel work
- untested changes
- package 184 implementation unless separately audited and approved

## Push command safety

Use the repository's normal push command for the current preview branch.

Do not guess a production branch.

If upstream is not configured or the target is ambiguous, stop and report the branch and remote options instead of guessing.

## Required final report

Return:

- current branch
- remote
- pushed branch
- push result
- four commit hashes and messages
- tests run and results
- typecheck result
- lint result
- build result
- files intentionally left uncommitted
- any critical defects discovered
- any fixes made after the four commits
- remaining authenticated smoke tests for:
  - Talk It Out quality
  - Create launcher behavior
  - Strategy Library remaining route
  - pause/resume behavior
- confirmation that production was not deployed
- safe rollback instructions for each commit and for the full four-commit checkpoint
