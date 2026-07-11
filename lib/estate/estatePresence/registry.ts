/**
 * Estate Presence — room-specific environmental life (slow, subtle, realistic).
 *
 * **Adapter (Phase B):** Presence profiles extend canonical places — ids must match
 * `canonicalEstateRegistry.ts`. Not a place registry.
 *
 * @see lib/estate/canonicalEstateRegistry.ts
 * @see docs/estate/PHASE_B_RUNTIME_REGISTRY_REPORT.md
 */

import type { EstatePresenceLayer, EstatePresenceProfile } from "./types";

const L = (
  kind: EstatePresenceLayer["kind"],
  pos: Partial<EstatePresenceLayer> = {},
): EstatePresenceLayer => ({ kind, ...pos });

export const ESTATE_PRESENCE_REGISTRY: Record<string, EstatePresenceProfile> = {
  "creative-studio": {
    roomId: "creative-studio",
    layers: [
      L("lamp-glow", { top: "38%", left: "62%", width: "14%", height: "12%" }),
      L("page-turn", { top: "58%", left: "48%", width: "18%", height: "10%", delay: 2 }),
      L("dust", { top: "32%", left: "40%", width: "30%", height: "40%" }),
    ],
  },
  "momentum-institute": {
    roomId: "momentum-institute",
    layers: [
      L("dust", { top: "22%", left: "28%", width: "35%", height: "45%" }),
      L("page-turn", { top: "48%", left: "18%", width: "12%", height: "8%", delay: 3 }),
      L("drawer-settle", { top: "52%", left: "72%", width: "8%", height: "6%", delay: 1 }),
      L("lantern", { top: "12%", left: "8%", width: "6%", height: "8%", delay: 2 }),
    ],
  },
  library: {
    roomId: "library",
    layers: [
      L("dust", { top: "20%", left: "30%", width: "40%", height: "50%" }),
      L("page-turn", { top: "45%", left: "22%", width: "14%", height: "10%", delay: 2 }),
      L("candle", { top: "68%", left: "14%", width: "4%", height: "5%", delay: 1 }),
    ],
  },
  "coffee-house": {
    roomId: "coffee-house",
    layers: [
      L("steam", { top: "55%", left: "42%", width: "8%", height: "14%", delay: 1 }),
      L("steam", { top: "52%", left: "58%", width: "6%", height: "12%", delay: 3 }),
      L("fireplace", { top: "62%", left: "22%", width: "16%", height: "14%", delay: 2 }),
    ],
  },
  conservatory: {
    roomId: "conservatory",
    layers: [
      L("water-ripple", { bottom: "18%", left: "30%", width: "40%", height: "22%" }),
      L("leaves", { top: "8%", left: "55%", width: "35%", height: "30%" }),
      L("bird-pass", { top: "20%", left: "-5%", width: "20%", height: "10%", delay: 2 }),
      L("wind-sway", { top: "0", left: "0", width: "100%", height: "100%" }),
    ],
  },
  "clear-my-mind": {
    roomId: "clear-my-mind",
    layers: [
      L("wind-sway", { top: "0", left: "0", width: "100%", height: "100%" }),
      L("water-ripple", { bottom: "20%", left: "25%", width: "50%", height: "18%" }),
      L("leaves", { top: "10%", left: "60%", width: "30%", height: "25%" }),
    ],
  },
  "music-room": {
    roomId: "music-room",
    layers: [
      L("lamp-glow", { top: "35%", left: "50%", width: "20%", height: "15%" }),
      L("page-turn", { top: "62%", left: "38%", width: "16%", height: "8%", delay: 2 }),
      L("dust", { top: "28%", left: "45%", width: "25%", height: "35%", delay: 1 }),
    ],
  },
  "apple-orchard": {
    roomId: "apple-orchard",
    layers: [
      L("leaves", { top: "5%", left: "20%", width: "60%", height: "40%" }),
      L("blossom-drift", { top: "15%", left: "40%", width: "30%", height: "25%", delay: 2 }),
      L("bird-pass", { top: "25%", left: "70%", width: "18%", height: "8%", delay: 3 }),
      L("apple-fall", { top: "30%", left: "55%", width: "4%", height: "4%", delay: 4 }),
    ],
  },
  stables: {
    roomId: "stables",
    layers: [
      L("horse-calm", { top: "42%", left: "38%", width: "28%", height: "35%" }),
      L("lantern", { top: "18%", left: "72%", width: "5%", height: "7%", delay: 1 }),
      L("lantern", { top: "22%", left: "12%", width: "4%", height: "6%", delay: 3 }),
      L("wind-sway", { top: "0", left: "0", width: "100%", height: "100%" }),
    ],
  },
  "decision-compass": {
    roomId: "decision-compass",
    layers: [
      L("compass-glow", { top: "45%", left: "48%", width: "12%", height: "12%" }),
      L("lamp-glow", { top: "30%", left: "65%", width: "10%", height: "8%", delay: 2 }),
      L("dust", { top: "25%", left: "35%", width: "30%", height: "40%", delay: 1 }),
    ],
  },
  observatory: {
    roomId: "observatory",
    layers: [
      L("cloud-drift", { top: "8%", left: "0", width: "100%", height: "35%" }),
      L("star-twinkle", { top: "10%", left: "20%", width: "60%", height: "50%" }),
      L("lamp-glow", { top: "55%", left: "42%", width: "14%", height: "10%", delay: 2 }),
    ],
  },
  "grow-observatory": {
    roomId: "grow-observatory",
    layers: [
      L("cloud-drift", { top: "8%", left: "0", width: "100%", height: "35%" }),
      L("star-twinkle", { top: "10%", left: "20%", width: "60%", height: "50%" }),
    ],
  },
  "peaceful-places": {
    roomId: "peaceful-places",
    layers: [
      L("leaves", { top: "0", left: "0", width: "100%", height: "45%" }),
      L("bird-pass", { top: "18%", left: "10%", width: "15%", height: "8%", delay: 2 }),
      L("water-ripple", { bottom: "10%", left: "20%", width: "60%", height: "20%", delay: 1 }),
    ],
  },
  "momentum-builder": {
    roomId: "momentum-builder",
    layers: [
      L("curtain-sway", { top: "0", left: "0", width: "100%", height: "100%" }),
      L("lamp-glow", { top: "40%", left: "58%", width: "12%", height: "10%", delay: 1 }),
      L("dust", { top: "30%", left: "42%", width: "28%", height: "35%", delay: 3 }),
    ],
  },
  journal: {
    roomId: "journal",
    layers: [
      L("candle", { top: "58%", left: "32%", width: "3%", height: "4%", delay: 1 }),
      L("page-turn", { top: "52%", left: "45%", width: "14%", height: "9%", delay: 2 }),
      L("dust", { top: "28%", left: "38%", width: "30%", height: "38%" }),
    ],
  },
  greenhouse: {
    roomId: "greenhouse",
    layers: [
      L("leaves", { top: "0", left: "0", width: "100%", height: "50%" }),
      L("wind-sway", { top: "0", left: "0", width: "100%", height: "100%" }),
      L("water-ripple", { bottom: "12%", left: "25%", width: "50%", height: "18%", delay: 2 }),
      L("bird-pass", { top: "16%", left: "65%", width: "16%", height: "8%", delay: 3 }),
    ],
  },
  "porch-swing": {
    roomId: "porch-swing",
    layers: [
      L("wind-sway", { top: "0", left: "0", width: "100%", height: "100%" }),
      L("leaves", { top: "5%", left: "15%", width: "70%", height: "40%" }),
      L("bird-pass", { top: "22%", left: "8%", width: "18%", height: "8%", delay: 2 }),
      L("water-ripple", { bottom: "8%", left: "30%", width: "40%", height: "14%", delay: 1 }),
    ],
  },
  "summer-terrace": {
    roomId: "summer-terrace",
    layers: [
      L("water-ripple", { bottom: "15%", left: "20%", width: "60%", height: "22%" }),
      L("wind-sway", { top: "0", left: "0", width: "100%", height: "100%" }),
      L("leaves", { top: "10%", left: "50%", width: "35%", height: "28%", delay: 1 }),
    ],
  },
  "reading-nook": {
    roomId: "reading-nook",
    layers: [
      L("candle", { top: "64%", left: "18%", width: "3%", height: "4%", delay: 1 }),
      L("page-turn", { top: "56%", left: "42%", width: "14%", height: "9%", delay: 3 }),
      L("dust", { top: "24%", left: "34%", width: "32%", height: "42%" }),
      L("bird-pass", { top: "18%", left: "72%", width: "14%", height: "7%", delay: 4 }),
    ],
  },
  "growth-journal": {
    roomId: "growth-journal",
    layers: [
      L("candle", { top: "58%", left: "32%", width: "3%", height: "4%", delay: 1 }),
      L("page-turn", { top: "52%", left: "45%", width: "14%", height: "9%", delay: 2 }),
      L("dust", { top: "28%", left: "38%", width: "30%", height: "38%" }),
    ],
  },
  /** Estate Profile — gate pillars + manor entrance lanterns on spark-estate-photo plate */
  "my-estate": {
    roomId: "my-estate",
    layers: [
      L("lantern", { top: "47%", left: "11%", width: "7%", height: "9%", delay: 1 }),
      L("lantern", { top: "47%", right: "11%", width: "7%", height: "9%", delay: 2 }),
      L("lantern", { top: "34%", left: "36%", width: "4%", height: "5%", delay: 3 }),
      L("lantern", { top: "34%", right: "36%", width: "4%", height: "5%", delay: 4 }),
    ],
  },
};

export function resolveEstatePresenceProfile(
  roomId: string,
): EstatePresenceProfile | null {
  return ESTATE_PRESENCE_REGISTRY[roomId] ?? null;
}

export function estatePresenceRoomForSection(
  section: string,
): string | null {
  const map: Record<string, string> = {
    // Clear My Mind lives at Treehouse Reflection Desk (Architecture 154) —
    // not Butterfly Conservatory.
    "brain-dump": "clear-my-mind",
    "momentum-institute": "momentum-institute",
    "chamber-of-momentum": "momentum-institute",
    "growth-library": "library",
    "how-do-i": "library",
    stables: "stables",
    "focus-audio": "peaceful-places",
    "content-generator": "creative-studio",
    "decision-compass": "decision-compass",
    "grow-observatory": "observatory",
    "momentum-builder": "momentum-builder",
    "grow-momentum-builders": "momentum-builder",
    "evidence-bank": "evidence-vault",
  "growth-journal": "journal",
  };
  return map[section] ?? null;
}

export type ResolveEstatePresenceRoomIdInput = {
  activeSection: string;
  momentumInstitutePrimary?: boolean;
  stablesPrimary?: boolean;
  directEstateVisit?: { roomId: string } | null;
  showDirectEstateOverlay?: boolean;
  /** `getEstateMemory().currentRoom?.entryId` — may lag behind navigation. */
  memoryRoomId?: string | null;
};

/**
 * Presence + ambience room id for the current screen.
 * Section mapping wins over stale memory so Coffee House audio does not follow
 * the member into Clear My Mind or other immersive sections.
 */
export function resolveEstatePresenceRoomId(
  input: ResolveEstatePresenceRoomIdInput,
): string | null {
  if (input.momentumInstitutePrimary) return "momentum-institute";
  if (input.stablesPrimary) return "stables";
  if (input.showDirectEstateOverlay && input.directEstateVisit?.roomId) {
    return input.directEstateVisit.roomId;
  }

  const sectionRoom = estatePresenceRoomForSection(input.activeSection);
  if (sectionRoom) return sectionRoom;

  const memRoom = input.memoryRoomId;
  if (memRoom && memRoom !== "welcome-home") return memRoom;

  return null;
}
