# Live Behavior Release Gate

## Rule

Conversation quality is a release blocker.

## A Release Is Not Proven By

- code completion
- unit tests
- a successful build
- a Cursor summary
- a decision-layer pass
- a mocked response
- a harness that cannot capture the visible reply

## Required Evidence

For every critical behavior capture:

- exact user input
- exact visible Shari response
- conversation ID
- state used
- decision mode
- permissions
- route
- final response owner
- action executed
- visible result
- refresh result
- new-chat result
- pass/fail

## Required Test Categories

- no-setup first interaction
- new chat isolation
- new day isolation
- casual update
- bare overwhelm
- task-linked overwhelm
- task initiation
- continue previous work
- return after absence
- decision support
- low energy
- low motivation
- numbered pending choice
- named pending choice
- direct navigation
- unavailable destination filtering
- tone setting change
- memory correction
- refresh/session restoration
- production parity

## Approval Questions

1. Did Shari understand the actual need?
2. Did the response reduce rather than add friction?
3. Did the platform preserve user control?
4. Did it ask only necessary questions?
5. Did the promised action visibly occur?
6. Did it work with incomplete setup?
7. Did it sound like one consistent companion?
8. Did new chat clear temporary context?
9. Did any bypass or second response owner interfere?
10. Would an ADHD business owner reasonably trust this behavior again?

Any critical “no” blocks release.
