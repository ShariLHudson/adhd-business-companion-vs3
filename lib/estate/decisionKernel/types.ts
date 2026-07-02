/**
 * Estate Decision Kernel™ — single source of truth for member input routing.
 * Pure types only — no side effects.
 */

import type { CaptureType } from "@/lib/capture/types";
import type { EstateCommandDecision } from "@/lib/estateIntelligence/estateCommandRouter";

export type EstateAction = "CHAT" | "NAVIGATE" | "CAPTURE" | "AUDIO" | "MENU";

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
  | { action: "NAVIGATE"; userText: string; target: EstateNavigateTarget }
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
    };

export type ResolveEstateActionContext = {
  userText: string;
  lastAssistantText?: string | null;
  currentPlaceId?: string | null;
  /** Explicit soundscape UI selection — never changes place. */
  soundscapeCategoryId?: string | null;
};
