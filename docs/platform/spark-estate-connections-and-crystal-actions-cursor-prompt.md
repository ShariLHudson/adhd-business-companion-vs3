
# Spark Estate — Connections & Crystal Actions
## Cursor Implementation Prompt

# Goal

Simplify Connections, remove Destination Gallery from navigation, and reuse the crystal concept as Spark Estate's universal action experience.

The platform should ask users to make as few decisions as possible.

Core principles:

- One thing. One place.
- Configure once.
- Use everywhere.
- Show only what is needed.

---

# PART 1 — Connections

Rename or keep the page as:

## Connections

This page has only TWO sections.

---

## 1. Services

Purpose:

Tell Spark Estate which services you use.

Display as simple expandable categories.

### Calendar

- Google Calendar
- Outlook Calendar

### Documents

- Spark Estate Documents
- Google Docs
- Microsoft Word (if supported)

### Storage

- Spark Estate Storage
- Google Drive
- OneDrive (if supported)
- Dropbox (if supported)

### Design

- Canva

Selecting a service should initiate the connection flow if authentication is required.

If already connected, show:

Connected ✓

Do NOT create individual service cards.

Do NOT create browser shortcuts.

Do NOT duplicate settings.

---

## 2. Social Media

Simple URL fields:

- Website
- Facebook
- Instagram
- LinkedIn
- TikTok
- Pinterest

Nothing else belongs here.

---

# Remove Completely

Remove:

- Preferred Destinations
- Destination Gallery settings
- Browser Shortcuts
- Open in Browser section
- Duplicate Google Docs selections
- Duplicate Google Drive selections
- Duplicate Calendar selections
- Multiple configuration areas for the same service

---

# Behavior

Connections become the single source of truth.

Spark Estate should automatically remember connected services and use them throughout the platform.

Do not ask the user repeatedly.

---

# PART 2 — Remove Destination Gallery

Remove Destination Gallery from:

- Main navigation
- Estate navigation
- Menus
- Settings

The user should never need to visit a Destination Gallery.

The underlying routing logic should remain.

---

# PART 3 — Crystal Actions

Keep the crystal concept.

Retire the Destination Gallery room.

The crystals become Spark Estate's universal action system.

Whenever a user finishes creating or updating something, display a compact Crystal Actions panel.

Title:

What would you like to do next?

Only display actions that make sense for the current item.

Examples:

Document

- Save
- Share
- Export
- Print

Event

- Add to Calendar
- Share
- Print

Image

- Download
- Share

Project

- Continue Working
- Share
- Archive

Journal

- Save
- Export
- Print

The action names should remain generic.

Do not expose provider names unless the user has multiple connected options.

Example:

Selecting "Save" automatically uses the preferred connected destination.

Only if more than one valid destination exists should Spark Estate ask which one to use.

Remember the user's choice.

---

# Crystal Design

Keep the crystal visual identity.

Do not recreate the Destination Gallery room.

Display the crystals as a compact overlay, modal, tray, or floating panel.

The crystal should simply represent an action.

Avoid decorative clutter.

---

# Decision Rules

Spark Estate should:

- know connected services
- know previous choices
- know the item type

Then present the smallest possible set of actions.

Never ask unnecessary questions.

---

# Acceptance Criteria

Connections

- Only two sections:
  - Services
  - Social Media

- No duplicated service configuration.
- Existing connections preserved.

Navigation

- Destination Gallery removed from all menus.

Crystal Actions

- Crystal experience appears contextually.
- Generic action names are used.
- Provider-specific choices appear only when necessary.
- Previous choices are remembered.
- Existing routing logic is reused.

Result

The platform feels simpler while preserving the unique Spark Estate crystal identity.
