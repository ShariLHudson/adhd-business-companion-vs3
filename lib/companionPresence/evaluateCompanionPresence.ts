/**
 * Companion Presence — context-aware photograph and presence state.
 *
 * Pure evaluator: photo src resolution happens in useCompanionPresence.
 */

import { shariImageStateToPhotoContext } from "@/lib/companionPhotoLibrary";
import { recognitionToShariPresence } from "@/lib/recognition/shariPresenceBridge";
import { isAppAnniversaryToday } from "@/lib/shariMemberSince";
import {
  getShariImageState,
  type ShariImageState,
  type ShariImageStateInput,
} from "@/lib/shariImageState";
import { expressionFromShariState } from "./expressionFromState";
import { homeStatePresenceMapping } from "./homeStateToPresence";
import { workspacePresenceMapping } from "./sectionToPhotoContext";
import { companionThinkingMessage } from "./thinkingCopy";
import {
  evaluateClearMyMindPresence,
  clearMyMindPresenceIsThinking,
  resolveClearMyMindPresencePhase,
} from "./clearMyMindPresence";
import type {
  CompanionAnimationState,
  CompanionPresenceInput,
  CompanionPresenceResult,
  CompanionSpeechBubbleState,
} from "./types";

function isRecoveryPresence(
  level: CompanionPresenceInput["recoveryLevel"],
): boolean {
  return (
    level === "depleted" ||
    level === "burnout_risk" ||
    level === "strained"
  );
}

function buildShariInput(input: CompanionPresenceInput): ShariImageStateInput {
  const now = input.now ?? new Date();
  const base: ShariImageStateInput = {
    now,
    emotion: input.emotion,
    userBirthday: input.userBirthday,
    recoveryMode: isRecoveryPresence(input.recoveryLevel),
    focusMode: input.focusMode ?? false,
    recognitionWin: input.recognitionWin ?? false,
    milestoneCelebration: isAppAnniversaryToday(input.memberSince ?? null, now)
      ? "app_anniversary"
      : null,
  };

  return recognitionToShariPresence(
    input.calmHome ? null : input.recognitionMoment,
    base,
  );
}

function recognitionStateOverride(
  moment: CompanionPresenceInput["recognitionMoment"],
): ShariImageState | null {
  if (!moment?.shariState) return null;
  return moment.shariState;
}

export function evaluateCompanionPresence(
  input: CompanionPresenceInput = {},
): CompanionPresenceResult {
  const now = input.now ?? new Date();

  if (input.clearMyMindPhase) {
    return evaluateClearMyMindPresence(input.clearMyMindPhase, now);
  }

  if (input.compact) {
    return {
      photoContext: "default",
      expression: "warm_welcome",
      animationState: "still",
      speechBubbleState: "default",
      shariImageState: "default",
      rotate: false,
      reason: "compact header",
      thinkingMessage: null,
    };
  }

  const animationState: CompanionAnimationState = input.isThinking
    ? "thinking"
    : "still";
  const speechBubbleState: CompanionSpeechBubbleState = input.isThinking
    ? "thinking"
    : "default";
  const thinkingMessage = input.isThinking
    ? (input.thinkingMessage ??
      companionThinkingMessage(now.getMinutes()))
    : null;

  if (input.calmHome && input.homeState) {
    const home = homeStatePresenceMapping(input.homeState);
    return {
      photoContext: home.photoContext,
      expression: home.expression,
      animationState,
      speechBubbleState,
      shariImageState:
        home.photoContext === "welcome" ? "default" : "morning",
      rotate: input.isThinking ? false : home.rotate,
      reason: `home:${input.homeState}`,
      thinkingMessage,
    };
  }

  const recognitionOverride = recognitionStateOverride(
    input.calmHome ? null : input.recognitionMoment,
  );
  if (recognitionOverride) {
    return {
      photoContext: shariImageStateToPhotoContext(recognitionOverride),
      expression: expressionFromShariState(recognitionOverride),
      animationState,
      speechBubbleState,
      shariImageState: recognitionOverride,
      rotate: false,
      reason: `recognition:${recognitionOverride}`,
      thinkingMessage,
    };
  }

  if (input.workspaceActiveBeside && input.workspacePanel) {
    const workspace = workspacePresenceMapping(input.workspacePanel);
    if (workspace) {
      const organic = getShariImageState(buildShariInput(input));
      const state =
        isRecoveryPresence(input.recoveryLevel) ||
        input.focusMode ||
        organic.state !== "default"
          ? organic.state
          : mapContextToDefaultState(workspace.photoContext);

      return {
        photoContext: workspace.photoContext,
        expression: workspace.expression,
        animationState,
        speechBubbleState,
        shariImageState: state,
        rotate: false,
        reason: `workspace:${input.workspacePanel}`,
        thinkingMessage,
      };
    }
  }

  const organic = getShariImageState(buildShariInput(input));

  return {
    photoContext: shariImageStateToPhotoContext(organic.state),
    expression: expressionFromShariState(organic.state),
    animationState,
    speechBubbleState,
    shariImageState: organic.state,
    rotate: false,
    reason: organic.reason,
    thinkingMessage,
  };
}

function mapContextToDefaultState(
  context: ReturnType<typeof shariImageStateToPhotoContext>,
): ShariImageState {
  switch (context) {
    case "celebration":
      return "celebration";
    case "reflection":
      return "support";
    case "planning":
      return "focus";
    case "teaching":
      return "default";
    case "growth":
      return "seasonal_spring";
    default:
      return "default";
  }
}
