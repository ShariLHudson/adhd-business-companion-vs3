# Cursor Implementation Prompt — Make Initial Welcome Account-First-Time Only

## Purpose

Change the initial Spark Estate™ welcome message so it appears automatically only once:

- after a user creates an account
- on the first authenticated entry into Spark Estate
- never automatically again after it has been completed or dismissed

The message must not reappear on later logins, browser refreshes, new sessions, device changes, room changes, Return to Estate, New Chat, New Day, or navigation back to Welcome Home.

This is an account-level onboarding rule, not a session-level rule.

---

# Confirmed Problem

The initial welcome message is appearing beyond the first account visit.

This causes:

- repeated onboarding
- visual obstruction
- confusion on normal destination pages
- unnecessary interruption
- the impression that the user is entering Spark Estate for the first time every time

The screenshot shows the welcome layer appearing over the Projects destination. That must not happen after first-time onboarding has been completed.

---

# Governing Rule

The automatic initial welcome may appear only when all of the following are true:

1. the user is authenticated
2. the account has completed account creation
3. the account-level initial welcome flag is not complete
4. the user has not previously dismissed or completed the welcome
5. the current route is an approved first-entry location
6. no stale local/session state falsely reopens it

Once completed or dismissed, store that decision persistently for the authenticated account.

---

# Persistent Account State

Create or use one authoritative persisted account-level field.

Recommended concept:

```ts
type AccountOnboardingState = {
  initialWelcomeCompleted: boolean;
  initialWelcomeCompletedAt?: string;
  initialWelcomeVersion?: string;
};
```

Preferred persistence:

- authenticated user profile record
- Supabase user/account metadata
- existing onboarding/preferences store backed by the account

Do not rely only on:

- React state
- localStorage
- sessionStorage
- cookies
- browser memory
- route state

Local state may be used as a temporary rendering cache, but the account record is authoritative.

---

# First-Time Display Behavior

On the first valid authenticated entry:

- show the approved initial welcome
- keep it readable and dismissible
- do not cover unrelated destinations after the user has already navigated away
- allow the user to complete or dismiss it
- persist completion immediately after a valid close/complete action
- prevent duplicate writes
- prevent the message from reopening during the same render cycle

The initial welcome should be associated with the first Welcome Home onboarding experience, not mounted globally over every route.

---

# Completion Rules

Mark `initialWelcomeCompleted = true` when the user:

- completes the welcome
- clicks the approved continue/start action
- explicitly closes or dismisses the welcome
- finishes the first onboarding sequence, according to the existing approved behavior

Once true:

- do not automatically show the message again
- do not reset it during logout/login
- do not reset it during New Chat
- do not reset it during New Day
- do not reset it during browser refresh
- do not reset it during deployment
- do not reset it on another device
- do not reset it when profile data changes

---

# Replay by User Choice

The welcome may remain available for voluntary replay from an approved help, guide, or settings location.

Recommended:

- Spark Estate Guide
- Help / How Do I…
- Settings → Replay Welcome

Replay behavior must:

- be explicitly chosen by the user
- not clear the completed account flag
- not cause future automatic display
- close normally
- return to the prior valid location

Do not create replay if an approved replay location already exists; connect to the existing one.

---

# Route and Mount Requirements

The initial welcome must not mount over:

- Projects
- Project Homes
- Business Estate
- Profile
- Chamber
- Strategy Library
- Journal Gazebo
- Reminders
- Rhythms
- Plan My Day
- Adapt My Day
- any other destination

unless the user explicitly selected Replay Welcome.

On normal authenticated return:

- render the requested destination
- do not render a hidden welcome overlay
- do not leave a pointer-blocking backdrop
- do not start an onboarding state write during render

---

# Loading and Hydration

Avoid flashing the welcome before account state is known.

Required:

1. load authoritative onboarding state
2. show a neutral/loading shell if necessary
3. decide whether welcome is eligible
4. mount welcome only when eligible

Do not:

- default to showing welcome while data loads
- briefly flash the welcome and then remove it
- call state setters during render
- create a race between localStorage and account profile
- reopen because of stale cached state

Use an effect or data-loading boundary for synchronization.

---

# Existing Users and Migration

Existing accounts should not suddenly receive the first-time welcome again.

Migration rule:

- if the account predates this fix and has meaningful prior activity, mark the welcome complete
- if existing onboarding completion evidence exists, honor it
- if no evidence exists but the account clearly has saved work, projects, conversations, profile data, or prior estate activity, treat onboarding as complete

Do not show a "first-time" welcome to established users.

Create a safe migration or compatibility fallback.

---

# Multiple Devices

The completed state must follow the account.

After completion on Device A:

- login on Device B must not auto-show the welcome
- login in another browser must not auto-show the welcome
- clearing browser storage must not restore the welcome

The server-backed account state remains authoritative.

---

# Failure Handling

If the account-state request fails:

- do not repeatedly flash or loop the welcome
- prefer a safe normal entry for established authenticated users
- log the failure for diagnosis
- do not overwrite a completed value with false
- do not block the full platform indefinitely

For genuinely new accounts where state cannot be confirmed, use the safest existing onboarding fallback without creating an endless loop.

---

# Required Automated Tests

## New Account

- new account with incomplete welcome sees it once
- complete action persists account state
- dismiss action persists account state
- welcome closes
- route continues correctly

## Returning Account

- completed account does not see welcome at login
- completed account does not see welcome on refresh
- completed account does not see welcome after logout/login
- completed account does not see welcome on another destination
- completed account does not see welcome after New Chat
- completed account does not see welcome after New Day

## Existing Account Migration

- account with prior project activity is treated as completed
- account with profile data is treated as completed
- account with existing onboarding flag is honored
- deployment does not reset completion

## Route Protection

- Projects opens without welcome overlay
- Business Estate opens without welcome overlay
- Profile opens without welcome overlay
- Strategy Library opens without welcome overlay
- no hidden backdrop blocks clicks

## Replay

- explicit replay works
- replay does not clear completion
- next login still does not auto-show welcome

## Rendering

- no welcome flash before account state resolves
- no setState during render
- no duplicate completion writes
- no stale local state reopens welcome

---

# Live Verification

## First-Time Test Account

1. create a brand-new account
2. authenticate
3. confirm welcome appears
4. dismiss or complete it
5. refresh
6. confirm it does not reappear
7. log out and back in
8. confirm it does not reappear
9. open Projects
10. confirm no welcome overlay appears

## Existing Account

1. use an established account
2. log in
3. confirm welcome does not appear
4. navigate to Projects
5. navigate to Profile
6. navigate to Business Estate
7. return to Welcome Home
8. confirm welcome never appears automatically

## Cross-Device

1. complete welcome on one browser
2. log in on another browser or incognito session
3. confirm welcome does not appear

---

# Constraints

- do not make this a per-session flag
- do not rely only on browser storage
- do not remove voluntary replay
- do not show the welcome globally over every route
- do not reset completion on New Day or New Chat
- do not show established users the welcome again
- do not deploy production until authenticated preview passes

---

# Required Report

Return:

- exact root cause of repeated welcome
- authoritative onboarding-state owner
- database/profile field used
- completion write path
- eligibility read path
- migration rule for existing users
- replay location
- files changed
- automated tests
- local result
- preview URL
- screenshots or video evidence
- remaining limitations
- deploy or do-not-deploy recommendation
