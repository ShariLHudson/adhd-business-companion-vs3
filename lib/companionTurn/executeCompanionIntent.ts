/**
 * Step 2 — execute exactly one classified path (no secondary routers).
 */

import type { CaptureType } from "@/lib/capture/types";
import type { EstateCommandDecision } from "@/lib/estateIntelligence/estateCommandRouter";
import type { EstateActionExecutionPlan } from "@/lib/estate/decisionKernel";
import type { MemoryLibraryTargetTab } from "@/lib/estate/decisionKernel/types";
import type { EstateRoomAction } from "@/lib/estate/roomContext/types";
import type { ClassifiedCompanionIntent } from "./types";
import { companionIntentHandledByKernel } from "./classifyCompanionIntent";

export type CompanionIntentExecutor = {
  onCaptureWrite: (input: {
    userText: string;
    captureType: CaptureType;
    content: string;
  }) => void;
  onNavigateMemory: (input: {
    userText: string;
    tab: MemoryLibraryTargetTab;
  }) => void;
  onNavigatePlace: (input: {
    userText: string;
    command: EstateCommandDecision;
    navigationLine?: string;
  }) => void;
  onSoundscape: (input: {
    categoryId: string;
    soundscapeId: string | null;
  }) => void;
  onAssistantLine: (line: string) => void;
  onPlaceMenu: (input: {
    userText: string;
    line: string;
    placeIds: string[];
  }) => void;
  onCaptureMenu: (input: {
    userText: string;
    line: string;
    captureOptions: CaptureType[];
  }) => void;
  onRoomAction: (input: {
    userText: string;
    currentPlaceId: string;
    roomAction: EstateRoomAction;
    reply: string;
  }) => void;
  onClearPlaceMenu?: () => void;
  /** Opens the approved visual Explore Spark Estate map. */
  onOpenExploreSpark?: () => void;
};

function executePlan(
  plan: EstateActionExecutionPlan,
  executor: CompanionIntentExecutor,
): void {
  switch (plan.type) {
    case "capture-write":
      executor.onCaptureWrite({
        userText: plan.userText,
        captureType: plan.captureType,
        content: plan.content,
      });
      return;
    case "navigate-memory":
      executor.onNavigateMemory({ userText: plan.userText, tab: plan.tab });
      return;
    case "navigate-place":
      executor.onNavigatePlace({
        userText: plan.userText,
        command: plan.command,
        navigationLine: plan.navigationLine,
      });
      return;
    case "soundscape":
      executor.onSoundscape({
        categoryId: plan.categoryId,
        soundscapeId: plan.soundscapeId,
      });
      return;
    case "chat-local-reply":
      executor.onClearPlaceMenu?.();
      executor.onAssistantLine(plan.reply);
      return;
    case "place-menu":
      executor.onPlaceMenu({
        userText: plan.userText,
        line: plan.line,
        placeIds: plan.placeIds,
      });
      return;
    case "capture-menu":
      executor.onCaptureMenu({
        userText: plan.userText,
        line: plan.line,
        captureOptions: plan.captureOptions,
      });
      return;
    case "room-action":
      executor.onClearPlaceMenu?.();
      executor.onRoomAction({
        userText: plan.userText,
        currentPlaceId: plan.currentPlaceId,
        roomAction: plan.roomAction,
        reply: plan.reply,
      });
      return;
    case "open-explore-spark":
      executor.onClearPlaceMenu?.();
      executor.onOpenExploreSpark?.();
      return;
    case "noop":
      return;
    case "chat":
      return;
    default: {
      const _exhaustive: never = plan;
      return _exhaustive;
    }
  }
}

/**
 * Run the classified path. Returns true when the turn is complete (no chat API).
 */
export function executeCompanionIntent(
  classified: ClassifiedCompanionIntent,
  executor: CompanionIntentExecutor,
): boolean {
  if (!companionIntentHandledByKernel(classified)) {
    return false;
  }
  executePlan(classified.plan, executor);
  return true;
}
