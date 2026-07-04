/**
 * Dev metrics — token load for companion prompt stack.
 */

import { buildCompanionSystemPrompt } from "@/lib/companionPrompt";
import { buildSparkCompanionHint } from "./buildSparkCompanionHint";
import { getSparkCompanionPromptBlock } from "./getSparkCompanionPromptBlock";
import type { SparkCompanionPromptMetrics } from "./types";

function countSections(text: string): number {
  return text
    .split(/\n/)
    .filter((line) => /^#{1,3}\s|^##\s|^SPARK |^Intent |^-\s/.test(line.trim()))
    .length;
}

export function measureCompanionPromptLoad(input?: {
  userText?: string;
  overwhelmed?: boolean;
}): SparkCompanionPromptMetrics {
  const systemPrompt = buildCompanionSystemPrompt("today", "text");
  const consolidatedBlock = getSparkCompanionPromptBlock();
  const perTurnHint =
    input?.userText?.trim()
      ? buildSparkCompanionHint({
          userText: input.userText,
          overwhelmed: input.overwhelmed,
        }) ?? ""
      : "";

  return {
    systemPromptChars: systemPrompt.length,
    systemPromptSections: countSections(systemPrompt),
    consolidatedBlockChars: consolidatedBlock.length,
    perTurnHintChars: perTurnHint.length,
    perTurnHintSections: perTurnHint ? countSections(perTurnHint) : 0,
  };
}

export function logCompanionPromptLoad(
  input?: Parameters<typeof measureCompanionPromptLoad>[0],
): SparkCompanionPromptMetrics {
  const metrics = measureCompanionPromptLoad(input);
  if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
    console.info("[sparkCompanion] prompt load", metrics);
  }
  return metrics;
}
