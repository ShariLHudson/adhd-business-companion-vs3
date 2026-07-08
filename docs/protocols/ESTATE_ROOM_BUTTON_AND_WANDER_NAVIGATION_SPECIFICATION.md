# Estate Room Button and Wander Navigation Specification

## Purpose

This document defines the final top navigation behavior for Spark
Estate™.

The goal:

Reduce navigation clutter by having one primary room control while
keeping settings and exploration simple.

The user should always know:

-   where they are
-   how to return home
-   how to explore
-   how to adjust experience settings

------------------------------------------------------------------------

# Top Navigation Structure

The top navigation contains only two primary elements:

## 1. Room Button

## 2. User Initials/Profile Button

Do not add separate buttons for:

-   Wander
-   Settings
-   Back to Estate
-   Audio controls
-   Chat controls

These belong inside the appropriate menus.

------------------------------------------------------------------------

# Room Button

The Room Button represents the user's current location.

Example:

    🌿 Garden Estate ▼

The displayed room name must always match:

-   current room
-   current image
-   current route

The Room Button must be powered by the Estate Place Manifest.

Do not use separate hardcoded room names.

------------------------------------------------------------------------

# Room Button Dropdown Structure

The dropdown contains two sections.

------------------------------------------------------------------------

# Menu 1: Experience Controls

Purpose:

Adjust the current experience.

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

Returns user to the currently selected room view if another panel or
overlay is open.

------------------------------------------------------------------------

# Menu 2: Estate Navigation

Purpose:

Move through Spark Estate™.

Options:

## Back To Estate

Returns to:

Welcome Home Room

This is the main estate entrance.

------------------------------------------------------------------------

## Wander

Purpose:

Allow exploration without choosing a destination.

Wander is not a room.

Wander is a navigation action.

------------------------------------------------------------------------

# Wander Rules

When the user selects Wander:

The system must select a complete place record.

It must NOT:

-   select an image separately
-   select a name separately
-   use old aliases randomly
-   mix legacy mappings

The selected place controls everything.

------------------------------------------------------------------------

# Wander Selection Flow

Correct:

    Select Place

    ↓

    Load Place Manifest Entry

    ↓

    Load:

    - Place Name
    - Image
    - Route
    - Description
    - Related Data

    ↓

    Display Room

------------------------------------------------------------------------

Incorrect:

    Pick Image

    +

    Guess Room Name

------------------------------------------------------------------------

# Room Identity Rule

Every room must have one source of truth.

The manifest entry controls:

-   official name
-   display name
-   image
-   variants
-   video
-   aliases
-   route

Example:

    PLACE ID:
    BUTTERFLY-HOUSE

    Display Name:
    Butterfly House™

    Primary Image:
    butterfly-house-background.png

    Route:
    butterfly-house

The button, image, and destination must always agree.

------------------------------------------------------------------------

# Wander Validation

Before displaying a Wander destination, verify:

✓ Room name matches manifest

✓ Image belongs to same place

✓ Route belongs to same place

✓ No deprecated mapping is used

------------------------------------------------------------------------

# User Experience Goal

The user experience should feel like:

Click Room Button:

"I know where I am and where I can go."

Choose Wander:

"Take me somewhere interesting."

Arrive:

"The name, image, and place all match."

------------------------------------------------------------------------

# Final Navigation Model

    Room Button

            |

            ├── Experience Controls
            │
            ├── Chat On/Off
            ├── Sound On/Off
            ├── Full Screen On/Off
            └── Return To Room


            |

            └── Estate Navigation

                ├── Back To Estate
                └── Wander

------------------------------------------------------------------------

# Implementation Rule

Do not create additional navigation buttons.

The Room Button is the single doorway for:

-   room identity
-   room controls
-   exploration
-   returning home
-   wandering

The experience should remain simple, calm, and predictable.
