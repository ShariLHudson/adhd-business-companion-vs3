# Spark Estate — Connections Settings Simplification
## Cursor Implementation Prompt / Build File

### Objective

Redesign the current Connections settings experience so it feels calm, clear, and easy to understand.

The current page repeats the same services across several sections:

- service connection cards
- preferred destination choices
- browser shortcuts
- social profile links

This creates unnecessary repetition and decision fatigue.

The new experience must follow this rule:

> One thing. One home.

A connected service should appear once in the connection-management area. Default destinations should be managed separately. Social links should move out of Connections entirely.

---

# Primary Goals

1. Reduce repeated appearances of the same service.
2. Make each settings section answer one clear question.
3. Keep the number of visible choices low.
4. Use progressive disclosure so advanced controls stay hidden until needed.
5. Preserve all existing connection functionality.
6. Make the page understandable without technical knowledge.
7. Keep the experience visually consistent with Spark Estate.
8. Do not remove working integrations unless explicitly required below.

---

# Current Problems To Fix

The current page includes four overlapping layers:

## 1. Service Connections

Current services include:

- Google Calendar
- Google Docs
- Google Drive
- Outlook Calendar
- Canva

Each service currently has its own connection, status, or management controls.

## 2. Preferred Destinations

Current destination groups include:

### Documents

- Google Docs
- Microsoft Word
- Spark Estate Documents
- Local Documents

### Printing

- Save as PDF
- Print dialog
- Preferred print provider

### Calendar

- Google Calendar
- Outlook Calendar

### Storage

- Google Drive
- OneDrive
- Dropbox

## 3. Browser Shortcuts

Current shortcuts include:

- My Calendar
- Docs
- Drive
- Outlook Calendar
- Google Calendar

## 4. Social Profile Links

Current social links include:

- Facebook
- Instagram
- LinkedIn
- TikTok
- Pinterest

Google Calendar, Google Docs, and Google Drive currently appear in multiple places with different wording.

This duplication must be removed.

---

# New Settings Architecture

Create or preserve three separate settings destinations:

## 1. Connected Services

Purpose:

> Connect and manage the outside services Spark Estate can use.

This area should answer only:

> What services are connected?

## 2. Defaults

Purpose:

> Choose where Spark Estate should save, send, or schedule things automatically.

This area should answer only:

> Where should things go by default?

## 3. Profile

Purpose:

> Manage personal, business, website, and social profile information.

Social links must move here.

---

# Navigation Changes

Rename the current top-level or section label:

- From: `Connections`
- To: `Connected Services`

Add or confirm a separate settings destination:

- `Defaults`

Move social profile fields to:

- `Profile`

Recommended Settings navigation labels:

- Profile
- Connected Services
- Defaults
- Notifications
- Accessibility
- Appearance
- Privacy
- Account

Do not place social links under Connected Services.

---

# Connected Services Page

## Page Header

Title:

# Connected Services

Description:

Connect the services you want Spark Estate to use. You can manage or disconnect them at any time.

Keep the description short.

---

# Service Card Design

Each external service should appear exactly once on this page.

Use one calm card per service.

Each card should show:

- service name
- service icon
- connection status
- one primary action
- one optional secondary action
- short plain-language description

Do not show destination preferences inside the service card.

Do not show browser shortcuts in the main card layout.

---

## Connected Card Example

### Google Drive

Status:

`Connected`

Description:

Save and open files through Google Drive.

Primary action:

`Manage`

Secondary action:

`Disconnect`

Optional small secondary link:

`Open Google Drive`

The Open link should not compete visually with Manage.

---

## Disconnected Card Example

### Outlook Calendar

Status:

`Not connected`

Description:

Add Outlook events and use them when shaping your day.

Primary action:

`Connect`

Do not show disabled controls for features that require connection.

---

# Services To Display

Display these current integrations:

- Google Calendar
- Outlook Calendar
- Google Drive
- Google Docs
- Canva

Only display additional services if there is working integration support.

Do not create fake connection states or placeholder integrations that appear functional.

---

# Connection Status Rules

Use clear status labels:

- Connected
- Not connected
- Needs attention
- Connecting

Do not rely only on color to communicate status.

Use an icon plus text.

Examples:

- check icon + Connected
- warning icon + Needs attention
- neutral circle icon + Not connected

---

# Card Action Rules

## Connected Service

Show:

- Manage
- Disconnect

Optional contextual open link:

- Open Google Drive
- Open Google Calendar
- Open Canva

## Disconnected Service

Show:

- Connect

## Needs Attention

Show:

- Reconnect

Avoid showing more than two prominent actions at once.

---

# Progressive Disclosure

Clicking `Manage` should open a compact panel, modal, drawer, or expanded card.

Only show advanced service-specific settings after Manage is selected.

Examples:

- connected account
- sync permissions
- last sync
- reconnect
- disconnect
- open service

Do not show these details on the default page view.

---

# Defaults Page

## Page Header

Title:

# Defaults

Description:

Choose where Spark Estate should save, schedule, and send things automatically.

This page is separate from connection management.

---

# Defaults Groups

Use four simple groups:

1. Documents
2. File Storage
3. Calendar
4. Printing

Each group should show one current selection and a `Change` action.

Do not show every possible option all at once unless the user selects Change.

---

## Collapsed Default Group Example

### Documents

Current default:

`Spark Estate Documents`

Button:

`Change`

---

## Expanded Group Behavior

When the user clicks `Change`, show available choices.

Only show services that are:

- built into Spark Estate
- connected
- truly available

Disconnected services may appear only if clearly labeled:

`Connect to use`

Selecting one should start or route to the connection flow.

---

# Document Defaults

Possible choices:

- Spark Estate Documents
- Google Docs
- Microsoft Word
- Local Documents

Use the actual supported options in the codebase.

Do not imply Microsoft Word integration if only file export is supported.

If Word is export-only, label it clearly:

`Microsoft Word file`

Do not label it as a connected service unless it is actually connected.

---

# File Storage Defaults

Possible choices:

- Spark Estate
- Google Drive
- OneDrive
- Dropbox

Only show OneDrive and Dropbox as selectable if working integrations exist.

If they are future features, hide them instead of showing disabled clutter.

---

# Calendar Defaults

Possible choices:

- Google Calendar
- Outlook Calendar

Only connected calendars may be selected as the active default.

If only one calendar is connected, select it automatically unless the user has explicitly chosen another supported option.

---

# Printing Defaults

Possible choices:

- Save as PDF
- Print dialog
- Preferred print provider

Simplify this group.

Recommended visible choices:

- Save as PDF
- Open print dialog

Only show a print-provider setting if Spark Estate has a real provider integration.

---

# Default Selection Rules

1. Never ask the user to choose the same default repeatedly.
2. Save the selection immediately.
3. Show a brief confirmation.
4. Preserve the user's current valid defaults during migration.
5. If a selected service becomes disconnected, do not silently fail.
6. Mark the affected default as `Needs attention`.
7. Offer a simple replacement choice.

Example:

> Google Drive is no longer connected. Choose a new file storage default.

---

# Browser Shortcuts

Remove the standalone `Shortcuts — open in your browser` section.

Do not keep a separate list containing:

- My Calendar
- Docs
- Drive
- Outlook Calendar
- Google Calendar

These links should appear contextually instead.

Examples:

- `Open Google Drive` inside Google Drive's Manage panel
- `Open Google Calendar` inside Google Calendar's Manage panel
- `Open in Google Docs` on an actual document
- `Open Calendar` from a calendar-related screen

This avoids repeating services in multiple settings sections.

---

# Social Profile Links

Move all social profile fields out of Connected Services.

New location:

`Settings > Profile`

Recommended section title:

# Online Presence

Fields:

- Website
- Facebook
- Instagram
- LinkedIn
- TikTok
- Pinterest

Optional future fields:

- YouTube
- Threads

Do not add fields unless there is a real product need.

---

# Profile Field Behavior

Each field should:

- use a clear label
- accept a URL
- validate basic URL format
- allow empty values
- save without requiring every field
- display a helpful example only when the field is empty

Do not require users to complete social profiles.

---

# Visual Design Rules

The page should feel calm and easy to scan.

Use:

- generous spacing
- large readable headings
- short descriptions
- one clear primary action per card
- subtle status indicators
- consistent card heights where possible
- collapsible advanced details
- simple language

Avoid:

- dense grids
- repeated service names
- multiple rows of buttons
- long explanatory paragraphs
- technical connection details on the default screen
- disabled future options
- duplicate shortcuts
- settings within settings within settings

---

# Mobile Behavior

On smaller screens:

- stack service cards in one column
- keep status and primary action visible
- place secondary actions inside Manage
- avoid horizontal scrolling
- ensure all tap targets are large
- keep one main action per visible card

---

# Accessibility Requirements

- Do not communicate status through color alone.
- All controls must be keyboard accessible.
- Focus states must be visible.
- Buttons and links must have accessible names.
- Modal, drawer, or expanded content must return focus correctly.
- Use readable contrast.
- Use the platform's accessibility type sizes and spacing rules.
- Avoid tiny status text.
- Avoid icon-only actions unless an accessible label is included.

---

# Data And State Preservation

Before changing the UI:

1. Identify current connection-state storage.
2. Identify current destination preference storage.
3. Identify social-link storage.
4. Preserve existing saved values.
5. Do not reset valid connected services.
6. Do not reset valid default destinations.
7. Migrate social links without data loss.

If old data uses different keys, add a safe migration or compatibility layer.

Do not create duplicate sources of truth.

---

# Suggested Component Structure

Use the existing project architecture and naming conventions where practical.

Suggested structure:

```text
settings/
  connected-services/
    ConnectedServicesPage
    ServiceConnectionCard
    ServiceManagePanel
  defaults/
    DefaultsPage
    DefaultPreferenceCard
    DefaultPreferencePicker
  profile/
    OnlinePresenceSection
```

Suggested shared types:

```ts
type ConnectionStatus =
  | "connected"
  | "disconnected"
  | "needs_attention"
  | "connecting";

type ConnectedService = {
  id: string;
  name: string;
  description: string;
  status: ConnectionStatus;
  icon?: React.ReactNode;
  openUrl?: string;
};

type DefaultCategory =
  | "documents"
  | "storage"
  | "calendar"
  | "printing";
```

Adapt these to the current codebase rather than forcing a parallel architecture.

---

# Important Product Behavior

## Connected Services

Answers:

> What can Spark Estate work with?

## Defaults

Answers:

> Where should Spark Estate put things automatically?

## Profile

Answers:

> What information belongs to me or my business?

Do not mix these three questions on one page.

---

# Empty And Error States

## No Services Connected

Show a calm message:

> You do not need to connect everything. Choose only the services you already use.

Then show available service cards.

## Connection Error

Show:

> We could not complete the connection.

Primary action:

`Try Again`

Secondary action:

`Cancel`

Do not expose raw technical errors to the user.

Log technical details for development debugging.

## Default Uses Disconnected Service

Show:

> This default needs attention because the service is no longer connected.

Primary action:

`Choose Another`

Secondary action:

`Reconnect`

---

# Confirmation Messages

Use short confirmations.

Examples:

- Google Drive connected.
- Outlook Calendar disconnected.
- Default calendar updated.
- Social links saved.

Do not use large success screens for simple settings changes.

---

# Remove Or Relocate

## Remove From Connected Services Page

- preferred destination groups
- browser shortcut section
- social profile links
- duplicate calendar choices
- duplicate docs choices
- duplicate storage choices

## Relocate To Defaults

- document destination
- storage destination
- calendar destination
- print behavior

## Relocate To Profile

- Facebook
- Instagram
- LinkedIn
- TikTok
- Pinterest
- website, if available

---

# Do Not Do

- Do not remove functional OAuth connection flows.
- Do not create placeholder integrations.
- Do not display unsupported services as selectable.
- Do not keep the old sections below the new sections.
- Do not duplicate connection states in Defaults.
- Do not duplicate social links in multiple settings pages.
- Do not replace clear words with technical integration language.
- Do not make every card expandable by default.
- Do not force a user to choose defaults before using Spark Estate.
- Do not make the user reconnect services during migration unless the existing token is invalid.

---

# Acceptance Criteria

The work is complete only when all of the following are true.

## Connected Services

- [ ] The page is renamed Connected Services.
- [ ] Each external service appears once.
- [ ] Each card shows name, status, description, and one primary action.
- [ ] Advanced details are hidden behind Manage.
- [ ] Browser shortcuts are no longer a separate section.
- [ ] Social links no longer appear here.
- [ ] Existing connection flows still work.
- [ ] Existing connected states are preserved.

## Defaults

- [ ] Defaults is a separate settings page or clearly separate destination.
- [ ] Documents, storage, calendar, and printing are shown as separate groups.
- [ ] Each group shows only the current default until Change is selected.
- [ ] Disconnected services cannot silently become active defaults.
- [ ] Unsupported services are hidden.
- [ ] Existing valid defaults are preserved.

## Profile

- [ ] Social links appear under Profile.
- [ ] Social fields are optional.
- [ ] Existing social URLs are preserved.
- [ ] URL validation is clear and non-blocking for unrelated fields.

## Experience

- [ ] The same service does not appear in three different sections.
- [ ] The page has fewer visible choices.
- [ ] The user can understand the difference between connection and default.
- [ ] Mobile layout is calm and usable.
- [ ] Keyboard and screen-reader behavior works.
- [ ] No connection or settings data is lost.

---

# Testing Requirements

Test at minimum:

## Connection States

- connected
- disconnected
- needs attention
- connecting
- connection failure
- reconnection
- disconnect

## Defaults

- one calendar connected
- two calendars connected
- current default disconnected
- no external storage connected
- valid built-in fallback
- changing each default
- refreshing after save

## Profile

- empty fields
- valid URLs
- invalid URL format
- partial completion
- saved existing links
- clearing a link

## Responsive Layout

- desktop
- tablet
- mobile

## Accessibility

- keyboard navigation
- visible focus
- screen-reader labels
- status not color-only
- modal or drawer focus management

---

# Final UX Standard

The redesigned settings experience should feel like this:

## Connected Services

> Connect what you use.

## Defaults

> Choose where things go.

## Profile

> Add information about you.

The user should never have to wonder why Google Calendar, Google Drive, or Google Docs appears three different times.

The final experience should be simpler, calmer, and easier to understand while preserving all working functionality.
