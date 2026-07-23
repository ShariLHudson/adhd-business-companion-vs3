/**
 * Shared direct-navigation interrupt for surfaces that are not handleSend
 * (e.g. Create Estate composer). Uses the same destination resolver as the arbiter.
 */

import { isDirectNavigationPriorityTurn } from "@/lib/chatScope/directNavigationPriority";
import { resolveNavigationTarget } from "./resolveNavigationTarget";

export type DirectNavigationInterrupt =
  | {
      interrupted: true;
      userText: string;
      destinationId: string;
      label: string;
      source: "estate_command" | "hard_nav" | "alias";
    }
  | { interrupted: false };

/**
 * When the utterance is explicit Estate navigation, return the resolved target
 * so the caller can suspend its scope and navigate — before any local classifier.
 */
export function tryDirectNavigationInterrupt(
  userText: string,
): DirectNavigationInterrupt {
  const trimmed = userText.trim();
  if (!trimmed || !isDirectNavigationPriorityTurn(trimmed)) {
    return { interrupted: false };
  }
  const target = resolveNavigationTarget(trimmed);
  if (!target) {
    return { interrupted: false };
  }
  return {
    interrupted: true,
    userText: trimmed,
    destinationId: target.destinationId,
    label: target.label,
    source: target.source,
  };
}
