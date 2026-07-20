# 079 — Browser Certification and Regression

## Navigation Certification

Verify:

- Full Workshop Map opens;
- every map item opens the correct section;
- return path works;
- previous and next work;
- direct Project links open the correct section;
- start-new preserves current work.

## Dialog Certification

Verify:

- completion dialog explains editability;
- delete moves to Trash;
- unsaved warning is truthful;
- focus is contained and restored;
- cancel causes no mutation.

## Panel Certification

Verify:

- assistance panel receives section context;
- inspector status updates map;
- history restores a version;
- mobile drawers close and restore focus.

## Responsive Certification

Verify desktop, tablet, and mobile for:

- editing;
- save;
- status;
- assistance;
- map navigation;
- completed-section reopen.

## Accessibility Certification

Verify:

- full keyboard operation;
- visible focus;
- semantic headings;
- screen-reader status;
- save and error announcements;
- reduced motion.

## Release Gate

A workspace interface is not production-ready until all certification scenarios pass in a real browser with durable persistence.
