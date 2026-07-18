/**
 * Question frequency — avoid interview feel.
 */

import { countQuestions } from "@/lib/reflectiveConversationIntelligence";
import type { CqriMessage } from "./types";

export function lastAssistantAskedQuestion(
  messages: readonly CqriMessage[],
): boolean {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m?.role === "assistant") {
      return countQuestions(m.content) >= 1;
    }
  }
  return false;
}

export function consecutiveAssistantQuestions(
  messages: readonly CqriMessage[],
): number {
  let count = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (!m) break;
    if (m.role === "user") continue;
    if (m.role === "assistant" && countQuestions(m.content) >= 1) {
      count += 1;
    } else if (m.role === "assistant") {
      break;
    }
  }
  return count;
}

/** User turns since last substantial user message (> 12 chars). */
export function userHadRoomToExplain(
  messages: readonly CqriMessage[],
  userText: string,
): boolean {
  if (userText.trim().length >= 40) return true;
  const recentUser = messages.filter((m) => m.role === "user").slice(-3);
  const substantial = recentUser.filter((m) => m.content.trim().length >= 40);
  return substantial.length >= 1;
}

export function shouldSuppressQuestion(input: {
  messages: readonly CqriMessage[];
  userText: string;
  repairActive?: boolean;
}): boolean {
  if (input.repairActive) return true;

  const assistantCount = input.messages.filter((m) => m.role === "assistant")
    .length;
  const userCount = input.messages.filter((m) => m.role === "user").length;
  // Welcome/opening question alone is not interview fatigue — allow the first reflective turn.
  if (assistantCount <= 1 && userCount === 0) {
    return false;
  }

  if (lastAssistantAskedQuestion(input.messages)) {
    // After a question, prefer observation unless user was very brief and needs a soft prompt
    if (input.userText.trim().length >= 20) return true;
    if (consecutiveAssistantQuestions(input.messages) >= 1) return true;
  }
  if (consecutiveAssistantQuestions(input.messages) >= 2) return true;
  return false;
}
