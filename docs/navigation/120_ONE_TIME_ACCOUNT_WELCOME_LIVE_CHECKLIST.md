# Live Checklist — One-Time Account Welcome

## Brand-New Account

- [ ] welcome appears after account creation
- [ ] welcome appears only at approved first entry
- [ ] completion action closes it
- [ ] dismiss action closes it
- [ ] completion is persisted to the account

## Returning Login

- [ ] refresh does not reopen welcome
- [ ] logout/login does not reopen welcome
- [ ] new browser session does not reopen welcome
- [ ] another device does not reopen welcome
- [ ] clearing local storage does not reopen welcome

## Destination Protection

- [ ] Projects opens without welcome overlay
- [ ] Project Homes opens without welcome overlay
- [ ] My Business Estate opens without welcome overlay
- [ ] My Profile opens without welcome overlay
- [ ] Strategy Library opens without welcome overlay
- [ ] Chamber opens without welcome overlay
- [ ] no invisible backdrop blocks clicks

## Existing Accounts

- [ ] established account does not receive first-time welcome
- [ ] account with saved projects is treated as complete
- [ ] account with existing profile data is treated as complete
- [ ] deployment does not reset onboarding state

## Replay

- [ ] explicit Replay Welcome works
- [ ] replay does not clear completion flag
- [ ] next login still does not auto-show welcome

## Rendering

- [ ] no welcome flash while account state loads
- [ ] no setState-during-render warning
- [ ] no duplicate writes
- [ ] no stale local/session state reopens welcome

## Overall

- [ ] authenticated preview passes
- [ ] no unrelated navigation changes
- [ ] production remains blocked until all rows pass
