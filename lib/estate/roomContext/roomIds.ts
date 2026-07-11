import {
  getCanonicalEstatePlaceById,
} from "../canonicalEstateRegistry";
import { resolvePlaceId } from "../placeIdAliases";
import { resolveEstatePlaceIdFromUserText } from "../estateRoomAliasRegistry";
import { recognitionRoomsEquivalent } from "@/lib/sparkRecognitionEngine/recognitionIds";

const ROOM_EQUIVALENCE: Record<string, readonly string[]> = {
  journal: ["journal", "journal-gazebo"],
  "momentum-institute": [
    "momentum-institute",
    "momentum-room",
    "study-hall",
  ],
  "creative-studio": ["creative-studio", "art-studio", "strategy-studio"],
  library: ["library", "estate-library", "growth-library"],
  "personal-library": ["personal-library"],
  /** Recognition aliases — Bank≡Vault, Wins≡Garden, Hall collection≡Celebration Room */
  "evidence-vault": ["evidence-vault", "evidence-bank"],
  gardens: ["gardens", "celebration-garden", "wins-this-week"],
  "celebration-room": [
    "celebration-room",
    "celebration-hall",
    "growth-reports",
  ],
  "gallery-of-firsts": ["gallery-of-firsts", "gallery", "the-gallery"],
  portfolio: [
    "portfolio",
    "hall-of-accomplishments",
    "hall-of-achievements",
    "growth-portfolio",
  ],
};

export function normalizeEstateRoomId(
  placeId: string | null | undefined,
): string | null {
  if (!placeId?.trim()) return null;
  const trimmed = placeId.trim();
  const viaAlias = resolvePlaceId(trimmed);
  if (getCanonicalEstatePlaceById(viaAlias)) {
    return viaAlias;
  }
  return resolveEstatePlaceIdFromUserText(trimmed) ?? trimmed;
}

export function estateRoomsEquivalent(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  if (recognitionRoomsEquivalent(a, b)) return true;

  const na = normalizeEstateRoomId(a);
  const nb = normalizeEstateRoomId(b);
  if (!na || !nb) return false;
  if (na === nb) return true;

  for (const ids of Object.values(ROOM_EQUIVALENCE)) {
    if (ids.includes(na) && ids.includes(nb)) return true;
  }
  return false;
}
