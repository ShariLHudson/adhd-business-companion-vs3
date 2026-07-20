# 077 — Full Workshop Map Standard

## Purpose

Define the full working map that shows every part of a work item and allows the member to open and work on any section in any order.

## Example

For an Event, the Full Workshop Map may include:

- Event Type — Complete
- Purpose — Not Started
- Audience — Not Started
- Format — Not Started
- Date & Time — Not Started
- Budget — Not Started
- Venue or Platform — Not Started
- Speakers — Not Started
- Marketing — Not Started
- Registration — Not Started
- Volunteers — Not Started
- Vendors — Not Started
- Swag — Not Started
- Equipment — Not Started
- Run of Show — Not Started
- Attendee Experience — Not Started
- Follow-Up — Not Started
- Evaluation — Not Started

## Click Behavior

Every row or card must support the entire clickable surface, not only a tiny icon.

Clicking a section must:

1. resolve the current Work ID;
2. resolve the Section ID;
3. load current saved content;
4. load current status;
5. open the section editor;
6. preserve the map return path;
7. show save state;
8. show contextual assistance.

## Required Visual States

### Not Started
- clearly clickable;
- “Start” action;
- optional starter draft;
- “I’m not sure” support;
- “Give me ideas.”

### In Progress
- clearly clickable;
- shows last edited date;
- opens latest saved content;
- shows next suggested step.

### Complete
- clearly clickable;
- opens in review/edit mode;
- shows “Edit,” “Reopen,” and “Keep Complete”;
- editing changes status to “In Progress” only after a meaningful change is saved.

### Needs Review
- opens directly to review notes;
- shows what needs attention;
- allows accept, revise, or defer.

### Skipped for Now
- remains visible;
- opens normally;
- does not block unrelated progress unless structurally required.

## Map Navigation

The member can:

- open any section;
- return to map;
- move to previous or next section;
- filter by status;
- show only incomplete sections;
- show recommended next step;
- reorder optional sections where permitted.

## Anti-Patterns

Prohibited:

- display-only status cards;
- “Complete” sections that cannot open;
- rows that look clickable but are not;
- only allowing work in a fixed sequence;
- hiding completed sections;
- opening the wrong section;
- resetting content on reopen.
