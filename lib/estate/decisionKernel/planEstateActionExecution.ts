/**
 * planEstateActionExecution™ — maps kernel decision to execution instructions.
 * Still side-effect free — CompanionPageClient performs the work.
 */

import { recommendedSoundscapeForLegacyCategory } from "@/lib/soundscapes";
import type { EstateCommandDecision } from "@/lib/estateIntelligence/estateCommandRouter";
import type { ImpliedEstatePlaceMatch } from "../impliedEstatePlaceMatch";
import type { CaptureType } from "@/lib/capture/types";
import type { EstateActionResult, MemoryLibraryTargetTab } from "./types";
import type { EstateRoomAction } from "../roomContext/types";

export type EstateActionExecutionPlan =
  | { type: "noop" }
  | { type: "chat"; userText: string }
  | { type: "chat-local-reply"; userText: string; reply: string }
  | {
      type: "navigate-place";
      userText: string;
      command: EstateCommandDecision;
      navigationLine?: string;
      impliedPlaceMatch?: ImpliedEstatePlaceMatch;
    }
  | { type: "navigate-memory"; userText: string; tab: MemoryLibraryTargetTab }
  | {
      type: "capture-write";
      userText: string;
      captureType: CaptureType;
      content: string;
    }
  | {
      type: "soundscape";
      categoryId: string;
      soundscapeId: string | null;
    }
  | {
      type: "place-menu";
      userText: string;
      line: string;
      placeIds: string[];
    }
  | {
      type: "capture-menu";
      userText: string;
      line: string;
      captureOptions: CaptureType[];
    }
  | {
      type: "room-action";
      userText: string;
      currentPlaceId: string;
      roomAction: EstateRoomAction;
      reply: string;
    };

export function planEstateActionExecution(
  result: EstateActionResult,
): EstateActionExecutionPlan {
  switch (result.action) {
    case "CHAT":
      if (result.immediateReply) {
        return {
          type: "chat-local-reply",
          userText: result.userText,
          reply: result.immediateReply,
        };
      }
      return { type: "chat", userText: result.userText };
    case "NAVIGATE":
      if (result.target.kind === "memory") {
        return {
          type: "navigate-memory",
          userText: result.userText,
          tab: result.target.tab,
        };
      }
      return {
        type: "navigate-place",
        userText: result.userText,
        command: result.target.command,
        navigationLine: result.navigationLine,
        impliedPlaceMatch: result.impliedPlaceMatch,
      };
    case "CAPTURE":
      return {
        type: "capture-write",
        userText: result.userText,
        captureType: result.captureType,
        content: result.content,
      };
    case "AUDIO": {
      const soundscape = recommendedSoundscapeForLegacyCategory(result.categoryId);
      return {
        type: "soundscape",
        categoryId: result.categoryId,
        soundscapeId: soundscape?.id ?? null,
      };
    }
    case "MENU":
      if (result.menuKind === "place") {
        return {
          type: "place-menu",
          userText: result.userText,
          line: result.line,
          placeIds: result.placeIds,
        };
      }
      return {
        type: "capture-menu",
        userText: result.userText,
        line: result.line,
        captureOptions: result.captureOptions,
      };
    case "ROOM_ACTION":
      return {
        type: "room-action",
        userText: result.userText,
        currentPlaceId: result.currentPlaceId,
        roomAction: result.roomAction,
        reply: result.immediateReply,
      };
    default: {
      const _exhaustive: never = result;
      return _exhaustive;
    }
  }
}
