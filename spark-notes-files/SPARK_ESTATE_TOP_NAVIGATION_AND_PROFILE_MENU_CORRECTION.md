# Spark Estate™ Top Navigation and Profile Menu Correction Specification

## Purpose

This document corrects the top navigation structure for Spark Estate™.

The goal:

Create a simple, predictable ADHD-friendly navigation system with only
two permanent top-right controls:

1.  Room Navigation Button
2.  User Profile/Settings Button

Do not create additional standalone navigation buttons.

------------------------------------------------------------------------

# Final Top Navigation Layout

Top right corner:

    [ Current Room ▼ ]        [ User Initials ▼ ]

Example:

    [ 🌿 Garden Estate ▼ ]    [ SH ▼ ]

------------------------------------------------------------------------

# Control 1: Room Navigation Button

## Purpose

The Room Button answers:

"Where am I?"

and:

"Where can I go?"

It controls estate navigation and room experience settings.

The displayed room name must always match:

-   current room
-   displayed image
-   route
-   Estate Manifest entry

The room button must never display a name that does not match the room
image.

------------------------------------------------------------------------

# Room Button Dropdown

The dropdown contains two sections.

------------------------------------------------------------------------

# Section 1: Experience Controls

These settings affect the current experience.

Options:

## Chat

Toggle:

-   Chat On
-   Chat Off

------------------------------------------------------------------------

## Sound

Toggle:

-   Sound On
-   Sound Off

------------------------------------------------------------------------

## Full Screen

Toggle:

-   Full Screen On
-   Full Screen Off

------------------------------------------------------------------------

## Return To Room

Returns the user to the current room view.

------------------------------------------------------------------------

# Section 2: Estate Navigation

Options:

## Back To Estate

Returns the user to:

Welcome Home Room

This is the main estate entrance.

------------------------------------------------------------------------

## Wander

Wander is an exploration option.

It is not a separate button.

It belongs inside the Room dropdown.

------------------------------------------------------------------------

# Wander Requirements

Wander must select a complete Estate place.

The system must select:

-   place ID
-   official name
-   image
-   route
-   related metadata

from the same manifest record.

Never:

-   choose an image separately
-   choose a room name separately
-   mix old aliases
-   use deprecated mappings

Correct:

    Choose Place

    ↓

    Load Manifest Record

    ↓

    Display:

    Room Name
    +
    Correct Image
    +
    Correct Route

------------------------------------------------------------------------

# Control 2: User Initials/Profile Button

## Purpose

The initials button represents the person.

Example:

    SH ▼

This is separate from room navigation.

It controls:

-   profile
-   settings
-   conversations
-   personal information

------------------------------------------------------------------------

# User Profile Dropdown

The initials dropdown should include:

## Profile

Access:

-   user information
-   preferences
-   personalization

------------------------------------------------------------------------

## Settings

Access:

-   app preferences
-   display settings
-   notification settings
-   experience preferences

------------------------------------------------------------------------

## Conversations

Access:

-   previous conversations
-   saved chats
-   conversation history

------------------------------------------------------------------------

## Personalization

Access:

-   interests
-   important dates
-   preferences
-   Spark learning settings

------------------------------------------------------------------------

## Account

Access:

-   account information
-   membership information

------------------------------------------------------------------------

# Separation Rule

Room Button:

"I want to explore or adjust my environment."

Initials Button:

"I want to manage myself and my account."

Do not combine these menus.

------------------------------------------------------------------------

# Final Navigation Model

    TOP RIGHT

    Current Room ▼

        |
        ├── Chat On/Off
        ├── Sound On/Off
        ├── Full Screen On/Off
        ├── Return To Room
        |
        ├── Back To Estate
        └── Wander


    User Initials ▼

        |
        ├── Profile
        ├── Settings
        ├── Conversations
        ├── Personalization
        └── Account

------------------------------------------------------------------------

# Testing Requirements

Verify:

## Room Button

✓ Shows correct room name

✓ Matches displayed room image

✓ Opens dropdown

✓ Wander works

✓ Back To Estate works

✓ Settings controls work

## Initials Button

✓ Opens profile dropdown

✓ Settings accessible

✓ Conversations accessible

✓ Personal information remains separate from estate navigation

------------------------------------------------------------------------

# Final Experience Goal

The user should immediately understand:

Room Button: "Where am I and where can I go?"

Initials Button: "Who am I and what are my settings?"

This keeps Spark Estate™ simple, calm, and easy to navigate.
