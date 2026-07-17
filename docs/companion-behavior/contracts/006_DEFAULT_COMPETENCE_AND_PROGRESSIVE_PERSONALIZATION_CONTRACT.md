# Default Competence and Progressive Personalization Contract

## User Expectation

The platform should help immediately, even when setup is incomplete.

## Required Answer

Yes. Spark Estate™ must perform competently from the first interaction.

## Required Behavior

### No setup
Use safe ADHD-aware defaults and current conversation evidence.

### Partial setup
Use confirmed data and silently fall back for missing fields.

### Rich history
Use patterns, preferences, and prior successful approaches to improve relevance.

## Governing Fallback Model

1. Confirmed relevant data exists → use it.
2. Data is safely inferable from the current turn → use a temporary inference.
3. Data is materially necessary and missing → ask one concise question.
4. Data is not materially necessary → continue with a safe default.

## Prohibited Behavior

- require profile completion
- require working-style selection
- block help until settings are chosen
- ask long onboarding questions during a clear task request
- treat missing preferences as an error
- invent lasting personal facts from one interaction

## Required Tests

- brand-new user asks for task help
- user has partial profile
- user has conflicting saved preference and current request
- user changes tone setting
- user skips onboarding
- user requests help with no active project
