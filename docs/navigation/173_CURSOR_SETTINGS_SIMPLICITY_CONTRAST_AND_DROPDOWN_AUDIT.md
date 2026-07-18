# Cursor Implementation Prompt — Settings Simplicity, Contrast, and Dropdown Audit

## Purpose

Audit and simplify every Spark Estate Settings surface. This is a platform-wide correction, not a one-page fix.

The entire Settings experience must be:

- simple
- readable
- compact
- accessible
- low in decision fatigue

## Global Contrast Rule

Every light card or light control surface must use dark readable text.

Do not use pale yellow, light gold, cream, low-opacity white, or washed-out gray on white, cream, pale gray, or pale teal backgrounds.

Disabled text must remain readable. Selected state must not rely on text color alone.

Audit all shared tokens, CSS classes, inline styles, component overrides, option lists, helper text, buttons, selected states, disabled states, and mobile styles.

## Scope

Audit every current Settings destination, including:

- Notifications
- all Notification Sounds
- Reminder Sounds
- Attention Needed Sounds
- Celebration Sounds
- Calendar Sounds
- Focus Sounds
- Time Block Alerts
- Desktop Notifications
- Accessibility
- Pattern Awareness
- How Shari Invites Me
- Planning Preferences
- Reminder Settings
- AI Preferences
- Privacy
- Working Style
- Integrations
- Calendar Settings
- Experience Controls
- all Profile-linked settings
- any additional Settings routes found in the repository

Do not stop after fixing the supplied screenshots.

## Sound Settings Redesign

The sound settings currently show too many large boxes at once.

Whenever the user chooses one option from one group, use one dropdown.

Each sound family should show:

1. short label
2. one dropdown
3. one short description of the selected option
4. optional Test Sound button
5. optional Learn More accordion, closed by default

Do not render every sound choice as a large card.

### Recommended Structure

#### Reminder Sound

Dropdown:
- None
- Gentle Chime
- Soft Bell
- Warm Tone
- other approved sounds

Show only the selected sound description.

Button:
**Test Reminder Sound**

#### Attention Needed Sound

Dropdown:
- None
- Gentle Alert
- Clear Bell
- other approved sounds

Short note:
> Used only for overdue or conflicting items.

#### Celebration Sound

Dropdown:
- Follow My Celebration Preference
- None
- Simple
- Full

Short note:
> Celebration sounds follow your Celebration preference unless you choose otherwise here.

#### Notification Volume

Keep one clearly labeled slider with an accessible value.

## Dropdown Requirements

Every dropdown must:

- show the current selection
- use dark readable text on light surfaces
- support keyboard navigation
- have a meaningful screen-reader label
- preserve selection after refresh
- close after selection
- not clip options
- work on desktop and mobile

## Global Settings Simplicity Standard

Every Settings section should show, in this order:

1. one-sentence explanation
2. the setting control
3. one short description of the current selection
4. optional Learn More accordion

Examples, philosophy, technical details, and long explanations remain collapsed by default.

## Correct Control Rule

Use:

- toggle for on/off
- dropdown for one choice from several
- slider for a continuous range
- text field for typed values
- accordion for optional explanation

Do not use a stack of large option cards for a mutually exclusive choice.

## Pattern Awareness

Visible by default:

- one-sentence explanation
- Notice New Patterns toggle
- Use My Saved Patterns toggle
- My Patterns summary
- Add a Pattern I Already Know

Collapsed:

- Why This Can Help
- What Spark May Notice
- You Stay in Control
- examples
- longer explanation

## How Shari Invites Me

Replace the visible option-card stack with one dropdown:

**How should Shari usually invite optional actions?**

Options:

- Use the situation — Recommended
- Usually ask a curiosity question
- Mix questions and direct invitations
- Be direct with me
- I'm not sure yet

Show only the selected option description. Put examples under a closed **See Examples** accordion.

## Save Behavior

For every setting:

- show **Settings saved**
- remain on the current page
- preserve Universal Navigation context
- preserve Profile drafts
- do not redirect automatically

## Shared Component Requirement

Use reusable components and shared tokens rather than isolated CSS patches.

Standardize or create:

- SettingsSection
- SettingsDropdown
- SettingsToggle
- SettingsSlider
- SettingsHelpAccordion
- SettingsSaveStatus
- SettingsDescription

## Accessibility

Meet WCAG AA contrast at minimum.

Verify:

- light-card text
- helper text
- disabled states
- visible focus
- keyboard operation
- screen-reader labels
- selected state not communicated by color alone
- adequate touch targets

## Required Tests

Verify:

- no pale yellow text remains on light Settings surfaces
- all sound families use dropdowns
- only selected sound descriptions are visible
- Test Sound tests the selected value
- None produces no sound
- selections persist after refresh
- Pattern Awareness is simplified
- How Shari Invites Me uses one dropdown
- Settings saved appears
- user remains on page
- navigation origin remains intact
- mobile has no clipping or horizontal overflow

## Required Authenticated Report

Return:

- all Settings routes found
- files changed
- shared component owner
- contrast token owner
- dropdown owner
- sound settings owner
- pages migrated
- pages not migrated
- before/after screenshots
- authenticated preview URL
- automated test results
- accessibility results
- remaining limitations
- deploy or do-not-deploy recommendation

Do not deploy production until the authenticated Settings audit passes.
