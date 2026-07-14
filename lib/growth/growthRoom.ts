import { ESTATE_ROOM_BG } from "@/lib/estate/estateRoomAssets";
import {
  EVIDENCE_VAULT_CLOSED_DOOR_BG,
  EVIDENCE_VAULT_ROOM_STATIC_BG,
} from "@/lib/estate/evidenceVaultDoor";

/** Growth hub — greenhouse sanctuary background. */
export const GROWTH_ROOM_BG = ESTATE_ROOM_BG.greenhouse;

/** Journal — quiet writing room, full-bleed background. */
export const JOURNAL_ROOM_BG = ESTATE_ROOM_BG.gazeboJournal;

/** Evidence Vault — exterior doors plate (entrance ritual). */
export const EVIDENCE_VAULT_ENTRANCE_BG = EVIDENCE_VAULT_CLOSED_DOOR_BG;

/** Evidence Vault — open portal plate after entrance (doors removed). */
export const EVIDENCE_VAULT_ROOM_BG = EVIDENCE_VAULT_ROOM_STATIC_BG;

/** Portfolio — creative work archive, full-bleed background. */
export const PORTFOLIO_ROOM_BG =
  "/backgrounds/accomplisments-room-background.png" as const;

/** Estate Profile / My Estate — member's estate portrait plate. */
export const ESTATE_PROFILE_ROOM_BG =
  "/backgrounds/spark-estate-photo-background.png" as const;

export const GROWTH_WORKSPACE_MAX_WIDTH = "42rem" as const;
export const GROWTH_WORKSPACE_MIN_WIDTH = "27.5rem" as const;
