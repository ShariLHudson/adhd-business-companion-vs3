# Spark Estate™ Place Master Manifest Protocol

## Purpose

Create the official source of truth for all Spark Estate™ locations.

The current system has multiple competing sources: - image filenames -
navigation labels - aliases - room names - media assets - code mappings

The goal is one verified Estate Place Master Manifest.

------------------------------------------------------------------------

## Core Principle

A filename is not a room.

An image is not a room.

A video is not a room.

A physical destination is a place.

The system must separate:

PLACE → VARIANTS / VIEWS → ASSETS

------------------------------------------------------------------------

## Master Registry

Create:

ESTATE_PLACE_MASTER_MANIFEST

This becomes the single source of truth for: - canonical places - media
mappings - aliases - navigation - room relationships

------------------------------------------------------------------------

## Place ID Standard

Use readable permanent IDs.

Examples:

-   AQUA-MAIN
-   BUTTERFLY-HOUSE
-   NOOK-STAIR
-   NOOK-WINDOW
-   TREEHOUSE-OUTSIDE
-   OBS-MAIN
-   OFFICE-SHARI

IDs remain stable even if names or assets change.

------------------------------------------------------------------------

## Required Fields

Every place requires:

-   Place ID
-   Official Name
-   Display Name
-   Category
-   Parent Area
-   Primary Image
-   Image Variants
-   Video
-   Audio
-   Aliases
-   Intent Tags
-   Related Places
-   Do Not Route To
-   Status

------------------------------------------------------------------------

## Place vs Variant Rules

Different views of the same location are variants.

Example:

OBS-MAIN

Variants: - daytime interior - daytime exterior - nighttime exterior

One place.

Shari Office:

OFFICE-SHARI

Variants: - base - autumn - christmas

One place.

------------------------------------------------------------------------

## Human Language Mapping

Users will not always use official names.

Examples:

Butterfly House™ aliases: - butterflies - butterfly - butterfly house -
butterfly garden - butterfly conservatory - I want to see butterflies

Aquarium Room™ aliases: - aquarium - fish tank - fish - underwater
room - I want to see fish

------------------------------------------------------------------------

## Conflict Prevention

Every place must include places it should never be confused with.

Example:

Butterfly House™

Do Not Route To: - Sunroom - Greenhouse - Garden

Aquarium Room™

Do Not Route To: - Conservatory - Greenhouse

Personal Library™

Do Not Route To: - Estate Library - Reading Nook

------------------------------------------------------------------------

## Known Corrections

### Butterfly House

Official name: Butterfly House™

"Butterfly Conservatory" is an alias only.

The butterfly video belongs only to Butterfly House.

------------------------------------------------------------------------

### Aquarium

Official name: Aquarium Room™

Do not route aquarium requests to The Conservatory.

------------------------------------------------------------------------

### Reading Nooks

Remove duplicate:

Reading Nook - quiet under stairs

Use:

Stairway Reading Nook™

Aliases: - reading nook under stairs

Keep separate: - Window Reading Nook - Treehouse Reading Nook

------------------------------------------------------------------------

### Decks

Remove duplicate:

Back Deck

Keep separate: - Fireside Deck - Personal Deck

------------------------------------------------------------------------

### Gardens

Do not route: - Estate Gardens → Greenhouse - Apple Orchard → Greenhouse

------------------------------------------------------------------------

### Celebration Garden

Keep separate from: Celebration Sounds

Room navigation must never open settings/audio.

------------------------------------------------------------------------

## Navigation Rules

When multiple places match:

Do not guess.

Show choices.

Example:

User: "Take me to the observatory."

Response: "I found several observatory spaces. Which would you like?"

Options: - Estate Observatory - Possibility House Observatory -
Telescope Deck

------------------------------------------------------------------------

## Media Rules

Images belong to places.

Videos belong to places.

Do not assign based on visual similarity.

Approved videos:

-   aquarium-room-video.mp4
-   butterfly-house-video.mp4

Audio may be shared across multiple places.

------------------------------------------------------------------------

## Do Not Do

Do not:

-   rename files before registry approval
-   modify navigation before registry approval
-   create rooms from images
-   create duplicate rooms from variants
-   route by visual similarity

------------------------------------------------------------------------

## Final Deliverables

Create:

1.  ESTATE_PLACE_MASTER_MANIFEST
2.  Place/Image Mapping Report
3.  Duplicate Place Report
4.  Alias Mapping Report
5.  Navigation Conflict Report
6.  Missing Asset Report

Spark Estate™ should feel like a real place, not a collection of
filenames.
