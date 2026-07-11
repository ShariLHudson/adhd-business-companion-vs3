import { CHAMBER_OF_MOMENTUM_ROOM_BG } from "@/lib/estate/chamber/chamberOfMomentumRoomRegistry";
import { getEstateCollectionRoom } from "@/lib/estate/collectionFramework";
import { ESTATE_ROOM_BG } from "@/lib/estate/estateRoomAssets";
import {
  EVIDENCE_VAULT_ENTRANCE_BG,
  EVIDENCE_VAULT_ROOM_BG,
  JOURNAL_ROOM_BG,
} from "@/lib/growth/growthRoom";
import { PEACEFUL_PLACES_PATHWAY_BG } from "@/lib/peacefulPlaces/pathway";
import { MUSIC_ROOM_IMAGE } from "@/lib/peacefulPlaces/musicRoomPeacefulPlace";

/**
 * Estate plates to warm during idle time — reduces black gaps on first visit.
 */
export const ESTATE_PRIORITY_SCENE_PRELOAD_URLS: readonly string[] = [
  ESTATE_ROOM_BG.welcomeHome,
  EVIDENCE_VAULT_ENTRANCE_BG,
  EVIDENCE_VAULT_ROOM_BG,
  CHAMBER_OF_MOMENTUM_ROOM_BG,
  getEstateCollectionRoom("celebration-hall").backgroundImage,
  JOURNAL_ROOM_BG,
  PEACEFUL_PLACES_PATHWAY_BG,
  MUSIC_ROOM_IMAGE,
];
