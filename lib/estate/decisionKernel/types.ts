/**
 * Estate Decision Kernel — single source of truth for member input routing.
 * Pure types only — no side effects.
 */

import type { CaptureType } from "@/lib/capture/types";
import type { EstateCommandDecision } from "@/lib/estateIntelligence/estateCommandRouter";
import type { ImpliedEstatePlaceMatch } from "../impliedEstatePlaceMatch";
import type { EstateRoomAction } from "../roomContext/types";

export type EstateAction = "CHAT" | "NAVIGATE" | "CAPTURE" | "AUDIO" | "MENU" | "ROOM_ACTION";

export type MemoryLibraryTargetTab =
  | "all"
  | "journal"
  | "portfolio"
  | "evidence"
  | "reflection"
  | "export";

export type EstateNavigateTarget =
  | { kind: "place"; command: EstateCommandDecision }
  | { kind: "memory"; tab: MemoryLibraryTargetTab };

export type EstateActionResult =
  | { action: "CHAT"; userText: string; immediateReply?: string }
  | { action: "NAVIGATE"; userText: string; target: EstateNavigateTarget; navigationLine?: string; impliedPlaceMatch?: ImpliedEstatePlaceMatch }
  | {
      action: "CAPTURE";
      userText: string;
      captureType: CaptureType;
      content: string;
    }
  | { action: "AUDIO"; userText: string; categoryId: string }
  | {
      action: "MENU";
      userText: string;
      menuKind: "place";
      line: string;
      placeIds: string[];
    }
  | {
      action: "MENU";
      userText: string;
      menuKind: "capture";
      line: string;
      captureOptions: CaptureType[];
    }
  | {
      action: "ROOM_ACTION";
      userText: string;
      currentPlaceId: string;
      roomAction: EstateRoomAction;
      immediateReply: string;
    };

export type ResolveEstateActionContext = {
  userText: string;
  lastAssistantText?: string | null;
  currentPlaceId?: string | null;
  /**
   * Live AppSection / shell section. When set, syncs room awareness before
   * already-here decisions so stale visual_room cannot win on the wrong page.
   */
  activeSection?: string | null;
  /** Explicit soundscape UI selection — never changes place. */
  soundscapeCategoryId?: string | null;
};
