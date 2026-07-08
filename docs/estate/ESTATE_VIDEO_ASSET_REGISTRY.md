# Estate Video Asset Registry

**Status:** Approved  
**ID scheme:** `ESTATE-VID-###` · see [`ESTATE_ID_REGISTRY.md`](./ESTATE_ID_REGISTRY.md)  
**Room registry:** [`ESTATE_ROOM_REGISTRY.json`](./ESTATE_ROOM_REGISTRY.json)  
**Scope:** Spark Estate™ room experience videos only  
**Location:** `public/Videos/`

The Estate currently contains **only two** video experiences.  
**Do not invent additional video filenames.**

---

## Rules

- Videos are assets **attached to rooms** — not separate rooms unless specifically defined.
- **Do not create** additional video references in code or docs beyond this registry.
- **Do not rename** these video files unless explicitly instructed.
- **Do not substitute** image backgrounds for video assets when a room experience video is available (poster images are allowed while video buffers).

---

## Video Asset 001

| Field | Value |
|-------|-------|
| **Registry ID** | ESTATE-VID-001 |
| **Filename** | `aquarium-room-video.mp4` |
| **Asset type** | Room Experience Video |
| **Maps to room** | Aquarium Room™ |
| **Room ID** | ESTATE-ROOM-003 |
| **Canonical `placeId`** | `conservatory` |
| **Poster image** | `aquarium-room-background.png` |
| **Public URL** | `/Videos/aquarium-room-video.mp4` |
| **Purpose** | Animated immersive room experience |
| **Avoid confusion with** | Sunroom, Greenhouse, Ocean Conservatory |
| **Code** | `lib/oceanConservatory/media.ts` → `OCEAN_CONSERVATORY_VIDEO` |

---

## Video Asset 002

| Field | Value |
|-------|-------|
| **Registry ID** | ESTATE-VID-002 |
| **Filename** | `butterfly-house-video.mp4` |
| **Asset type** | Room Experience Video |
| **Maps to room** | Butterfly House™ |
| **Room ID** | ESTATE-ROOM-Butterfly-House |
| **Legacy numeric ID** | ESTATE-ROOM-004 |
| **Canonical `placeId`** | `butterfly-house` |
| **Poster image** | `butterfly-conservatory.png` |
| **Public URL** | `/Videos/butterfly-house-video.mp4` |
| **Purpose** | Animated immersive room experience |
| **Avoid confusion with** | Butterfly House, Greenhouse |
| **Code** | `lib/companionHomestead/homesteadRoomRegistry.ts` → `SUNROOM_BUTTERFLY_VIDEO` |

---

## Room ↔ video matrix

| Room | Video | Poster |
|------|-------|--------|
| Aquarium Room™ (`conservatory`) | `aquarium-room-video.mp4` | `aquarium-room-background.png` |
| Butterfly House™ (`butterfly-house`) | `butterfly-house-video.mp4` | `butterfly-conservatory.png` |

**Never cross-assign:** Aquarium video ≠ Butterfly House; Butterfly video ≠ Aquarium Room.
