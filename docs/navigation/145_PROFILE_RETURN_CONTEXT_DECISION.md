# Profile Return Context Decision

## Rule

Any destination opened from My Profile must provide a clear, direct way to return to the exact Profile context the user came from.

## Restore

Return must preserve:

- Profile tab
- Profile section
- setup step
- draft values
- expanded state
- scroll position where practical

## Control

A visible **Return to My Profile** or **Continue Profile Setup** action must appear in the opened destination.

## Architecture

Use one reusable navigation-origin context.

Do not create separate return logic for each destination.

## Status

- correction approved
- implementation complete (unit verified)
- authenticated preview not verified
- production not approved
