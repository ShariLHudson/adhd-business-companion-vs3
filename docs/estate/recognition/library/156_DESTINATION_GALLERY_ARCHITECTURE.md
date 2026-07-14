# 156_DESTINATION_GALLERY_ARCHITECTURE

# Spark Estate™
## Destination Gallery™ Architecture

**Version:** 1  
**Status:** Architecture + place registration  
**Date:** 2026-07-09  
**Place id:** `destination-gallery`  
**Background asset:** `/backgrounds/destination-gallery.png`  
**Related:** [155 Spark Hands™](./155_SPARK_HANDS_ARCHITECTURE.md) · Connections Conservatory™ (one-time account linking)

---

## Purpose

Destination Gallery™ is the place where members choose where Spark should send their completed work.

This room is **NOT**:

- a settings page  
- a file manager  
- a collection of apps  

It is a beautiful gallery that represents the destinations available to Spark.

Members think in outcomes.  
Spark handles the technology.

---

## Core Philosophy

The member never thinks:

> "I need Google Docs."

Instead they think:

> "I'd like to save this."

Spark knows which destination to use — or opens Destination Gallery™ when the member should choose.

---

## Crystal Destinations

Each crystal is one outcome category.  
One purpose · one crystal · no dashboards · no technical language.

### Schedule

| | |
|--|--|
| **Purpose** | Schedule work, meetings, reminders, and focus sessions |
| **Destination (hand)** | Google Calendar |
| **Spark can** | Create calendar events · Schedule focus sessions · Schedule workshops · Block work time · Add reminders |

### Document *(internal id: `write`)*

| | |
|--|--|
| **Purpose** | Save written content |
| **Destination (hand)** | Google Docs |
| **Spark can** | Create documents · Save workshops · blog posts · SOPs · books · journals · meeting notes |

### Store *(internal id: `save`)*

| | |
|--|--|
| **Purpose** | Store important files |
| **Destination (hand)** | Google Drive |
| **Spark can** | Save files · Create folders · Organize projects · Store PDFs · images · presentations |

### Share *(internal id: `spark-social-media`)*

| | |
|--|--|
| **Purpose** | Prepare content for publishing |
| **Destinations (hands)** | Facebook · Instagram · LinkedIn · Pinterest · TikTok · YouTube |
| **Spark can** | Create posts · captions · Pinterest pins · carousels · video descriptions · Adapt content per platform |

Destination Gallery™ **prepares** the content.  
Actual publishing occurs **only after member approval**.

### Print

| | |
|--|--|
| **Purpose** | Prepare printable versions |
| **Spark can** | Print · Save as PDF · Download · Export workbook · checklist · journal · worksheets |

### Design *(internal id: `create`)*

| | |
|--|--|
| **Purpose** | Create visual assets |
| **Destination (hand)** | Canva |
| **Spark can** | Create presentations · graphics · social images · workbooks · guides · PDFs |

---

## Crystal Status Indicators

Every crystal shows a **tiny, tasteful status indicator at its base**:

| Indicator | Meaning |
|-----------|---------|
| 🟢 **Ready** | Connected and available |
| 🟡 **Needs Connection** | Not yet connected — route gently to Connections Conservatory™ / Settings → Connections |
| 🔵 **Recently Used** | Last destination used for this outcome family |
| ⭐ **Favorite** | Member's default choice for this outcome |

Rules:

- Indicators are quiet — never compete with the crystal or gallery atmosphere  
- Prefer one primary status (Ready / Needs Connection); Recently Used and Favorite may combine as secondary marks when needed  
- Never show raw OAuth / API / “Google” chrome as the crystal label — outcome name first  

Runtime constants: `lib/destinationGallery/`

---

## Member Experience

Spark asks naturally:

> "Where would you like me to send this?"

The Destination Gallery™ opens.  
The member selects a crystal.  
Spark handles everything else.

---

## Routing

Open Destination Gallery™ when members say things like:

- Save this  
- Schedule this  
- Put this on my calendar  
- Create a document  
- Save to Google Docs  
- Save to Drive  
- Create a Canva graphic  
- Make a workbook  
- Print this  
- Download this  
- Export this  
- Create social media  
- Post this  
- Share this  
- Send this somewhere  

The member never needs to know the room name.  
Spark understands intent.

**Background (binding):**  
`public/backgrounds/destination-gallery.png`  
Runtime: `DESTINATION_GALLERY_BG` in `lib/destinationGallery/constants.ts`

---

## Design Principles

- Beautiful · Calm · Timeless  
- One purpose  
- One destination per crystal  
- No dashboards · No settings · No technical language  

Technology disappears.  
Spark remains.

---

## Relationship to Spark Hands™

| Layer | Role |
|-------|------|
| **Spark Hands™ (155)** | Services act for Spark behind the scenes |
| **Connections Conservatory™** | One-time account linking |
| **Destination Gallery™ (156)** | Member chooses **outcome crystals** when Spark should ask where to send work |

Never send members “into Google” as a destination.  
Crystals are outcomes; hands are the connected services.

---

## Future Expansion

Additional destination crystals may be added only for **major new output categories**, e.g.:

- Video  
- Podcast  
- Books  
- Client Portal  

Do **not** add a crystal merely because another application exists.  
Keep the gallery elegant and uncluttered.

---

## Implementation notes (non-binding)

| Layer | Intent |
|-------|--------|
| Place id | `destination-gallery` |
| Background | `destination-gallery.png` |
| Conversation | Offer “Where would you like me to send this?” → open gallery |
| Crystal select | Map outcome → connected hand(s) using preferences + status |
| Needs Connection | Soft path to connect — never dump into third-party UI as primary |
| Anti-pattern | Settings-style lists, file browsers, app grids |

This document is architecture. Full gallery UI and hand wiring are separate work.
