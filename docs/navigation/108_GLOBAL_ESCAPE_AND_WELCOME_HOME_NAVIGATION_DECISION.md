# Global Escape and Welcome Home Navigation Decision

## Approved Behaviors

### Dismiss Active Window

Every dismissible estate window supports:

- visible close control where appropriate
- Escape key
- click outside
- focus restoration
- unsaved-content protection

### Persistent Return

A clickable **Welcome Home** control remains available in the top-left throughout Spark Estate.

It always returns to:

**Spark Estate → Welcome Home lobby**

### Spark Estate Guide

The guide:

- has a visible close control
- closes with Escape
- closes by clicking outside
- unmounts when closed
- never traps the user

## Global Ownership

Use one dismissal controller and one authoritative `returnToWelcomeHome()` action.

## Status

- requirement confirmed
- implementation on preview (see live results)
- authenticated live checklist pending
- production not approved
