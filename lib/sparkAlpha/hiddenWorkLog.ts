/**
 * Spark Alpha™ — Hidden Work Log (developer only).
 *
 * @see docs/SPARK_ALPHA_FRAMEWORK.md
 */

import type {
  SparkAlphaContextSnapshot,
  SparkAlphaConversationIntent,
  SparkAlphaFlowConfidence,
  SparkAlphaHiddenWorkEntry,
  SparkAlphaHiddenWorkLog,
} from "./types";
import {
  detectHiddenIntent,
  summarizeHiddenIntent,
} from "@/lib/sparkConversation/hiddenIntent";

let entryCounter = 0;

function nextEntryId(): string {
  entryCounter += 1;
  return `hw-${entryCounter}`;
}

export function createHiddenWorkLog(conversationId: string): SparkAlphaHiddenWorkLog {
  return { conversationId, entries: [] };
}

export function appendHiddenWork(
  log: SparkAlphaHiddenWorkLog,
  entry: Omit<SparkAlphaHiddenWorkEntry, "id" | "at">,
): SparkAlphaHiddenWorkLog {
  return {
    ...log,
    entries: [
      ...log.entries,
      {
        ...entry,
        id: nextEntryId(),
        at: new Date().toISOString(),
      },
    ],
  };
}

export function recordTurnHiddenWork(input: {
  log: SparkAlphaHiddenWorkLog;
  turnId: string;
  userMessage: string;
  context: SparkAlphaContextSnapshot;
  confidence: SparkAlphaFlowConfidence;
}): SparkAlphaHiddenWorkLog {
  let log = input.log;

  const hiddenIntent = detectHiddenIntent(input.userMessage);
  if (hiddenIntent) {
    log = appendHiddenWork(log, {
      turnId: input.turnId,
      category: "hidden_intent_hypothesis",
      status: "completed",
      summary: summarizeHiddenIntent(hiddenIntent),
      reason: hiddenIntent.coachingAngle,
    });
    log = appendHiddenWork(log, {
      turnId: input.turnId,
      category: "draft_prep",
      status: "withheld",
      summary: `Deliverable (${hiddenIntent.literalRequest}) withheld`,
      reason: "CT-11 — coach toward underlying goal before creating",
    });
  }

  log = appendHiddenWork(log, {
    turnId: input.turnId,
    category: "brain_retrieve",
    status: "completed",
    summary: `Retrieved Business Brain context for intent: ${input.context.intent}`,
    reason: input.context.reason,
  });

  if (input.context.loadedModules.length > 0) {
    log = appendHiddenWork(log, {
      turnId: input.turnId,
      category: "context_load",
      status: "completed",
      summary: `Loaded modules: ${input.context.loadedModules.join(", ")}`,
    });
  }

  if (input.context.unloadedModules.length > 0) {
    log = appendHiddenWork(log, {
      turnId: input.turnId,
      category: "context_unload",
      status: "completed",
      summary: `Unloaded modules: ${input.context.unloadedModules.join(", ")}`,
    });
  }

  if (/\bresearch\b/i.test(input.userMessage)) {
    log = appendHiddenWork(log, {
      turnId: input.turnId,
      category: "research_prep",
      status: "prepared",
      summary: "Research bundle prepared — not shown until member requests return",
    });
  }

  if (/\b(draft|write|create|post)\b/i.test(input.userMessage)) {
    log = appendHiddenWork(log, {
      turnId: input.turnId,
      category: "draft_prep",
      status: "prepared",
      summary: "Draft preparation started internally",
    });
    log = appendHiddenWork(log, {
      turnId: input.turnId,
      category: "draft_prep",
      status: "withheld",
      summary: "Draft not surfaced",
      reason: "Permission required before showing final work",
    });
  }

  if (input.confidence === "low") {
    log = appendHiddenWork(log, {
      turnId: input.turnId,
      category: "gap_analysis",
      status: "completed",
      summary: "Missing information identified — next question should clarify, not create",
    });
  }

  const intent = input.context.intent;
  if (intent === "idea") {
    log = appendHiddenWork(log, {
      turnId: input.turnId,
      category: "project_connect",
      status: "prepared",
      summary: "Idea capture slot linked — not announced to member",
    });
  }

  if (intent === "celebration") {
    log = appendHiddenWork(log, {
      turnId: input.turnId,
      category: "win_capture",
      status: "withheld",
      summary: "Win capture considered",
      reason: "Gallery/save requires explicit permission",
    });
  }

  if (intent === "marketing" || intent === "pricing") {
    log = appendHiddenWork(log, {
      turnId: input.turnId,
      category: "spark_card",
      status: "prepared",
      summary: "Possible Spark Card™ signal detected — not surfaced",
    });
  }

  return log;
}

export function estimateFlowConfidence(
  message: string,
  intent: SparkAlphaConversationIntent,
): SparkAlphaFlowConfidence {
  if (/\b(i don't know|not sure|unsure)\b/i.test(message)) return "low";
  if (intent === "general") return "medium";
  if (message.length > 40) return "high";
  return "medium";
}

export function latestHiddenIntentSummary(
  log: SparkAlphaHiddenWorkLog,
): string | null {
  const entry = [...log.entries]
    .reverse()
    .find((item) => item.category === "hidden_intent_hypothesis");
  return entry?.summary ?? null;
}

export function environmentScoreForIntent(
  intent: SparkAlphaConversationIntent,
): number {
  if (intent === "planning" || intent === "marketing" || intent === "pricing")
    return 9;
  if (intent === "overwhelmed" || intent === "idea") return 7;
  return 6;
}
