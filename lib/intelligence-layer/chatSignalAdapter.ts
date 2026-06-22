/**
 * Maps classified chat signals to Unified Signal Bus emits (shadow only).
 */

import type { ClassifiedUserSignals } from "@/lib/ecosystem/userIntelligenceEngine";
import type { EmotionalState } from "@/lib/companionEmotions";

import { isUnifiedSignalBusEnabled } from "./featureFlags";
import { emitCompanionSignal } from "./signalBus";
import type { CompanionSignal, EmitResult, SignalDomain } from "./signalBusTypes";
import { lookupRegistryEntry } from "./signalRegistry";

const CHAT_EMITTER = "companion.chat";

function struggleToDomain(category: string): SignalDomain {
  if (category === "content_creation" || category === "marketing") {
    return "business";
  }
  if (category === "overwhelm") return "emotional";
  return "conversation";
}

function emotionValence(
  category: string,
): "positive" | "neutral" | "negative" | undefined {
  if (category === "excited" || category === "hopeful") return "positive";
  if (
    category === "frustrated" ||
    category === "stuck" ||
    category === "confused"
  ) {
    return "negative";
  }
  return "neutral";
}

function emotionalStateToBus(
  state: EmotionalState,
  source: string,
): Array<{ domain: SignalDomain; category: string; valence?: "positive" | "neutral" | "negative" }> {
  switch (state) {
    case "overwhelmed":
      return [
        { domain: "emotional", category: "overwhelm", valence: "negative" },
      ];
    case "stuck":
      return [{ domain: "emotional", category: "stuck", valence: "negative" }];
    case "emotional":
      return [
        { domain: "emotional", category: "frustrated", valence: "negative" },
      ];
    case "building":
      return [
        {
          domain: "creation",
          category: "content_created",
          valence: "positive",
        },
      ];
    case "focused":
      return [
        { domain: "energy", category: "high_energy", valence: "positive" },
      ];
    default:
      return [];
  }
}

export type ChatBusEmitSummary = {
  emitted: CompanionSignal[];
  results: EmitResult[];
  legacyKeys: string[];
};

/** Legacy domain:category keys this chat classification would produce. */
export function legacyKeysFromClassified(
  classified: ClassifiedUserSignals,
  emotionalState?: EmotionalState | null,
): string[] {
  const keys: string[] = [];
  for (const s of classified.struggles) {
    keys.push(`${struggleToDomain(s)}:${s}`);
  }
  for (const q of classified.questions) {
    keys.push(`conversation:${q}`);
  }
  for (const e of classified.emotions) {
    keys.push(`emotional:${e}`);
  }
  if (emotionalState) {
    for (const item of emotionalStateToBus(emotionalState, "chat")) {
      keys.push(`${item.domain}:${item.category}`);
    }
  }
  return [...new Set(keys)];
}

/**
 * Shadow bus mirror for chat — runs only when UNIFIED_SIGNAL_BUS is enabled.
 * Does not replace ingestClassifiedUserSignals.
 */
export function classifyAndEmitChatSignals(
  classified: ClassifiedUserSignals,
  opts: { source?: string; emotionalState?: EmotionalState | null } = {},
): ChatBusEmitSummary {
  const source = opts.source ?? "chat";
  const emitted: CompanionSignal[] = [];
  const results: EmitResult[] = [];

  if (!isUnifiedSignalBusEnabled()) {
    return {
      emitted,
      results,
      legacyKeys: legacyKeysFromClassified(classified, opts.emotionalState),
    };
  }

  for (const s of classified.struggles) {
    const domain = struggleToDomain(s);
    const result = emitCompanionSignal({
      domain,
      category: s,
      source,
      emitter: CHAT_EMITTER,
      valence: s === "overwhelm" ? "negative" : "neutral",
      action: "observed",
    });
    results.push(result);
    if (result.ok && !result.deduped) emitted.push(result.signal);
  }

  for (const q of classified.questions) {
    const result = emitCompanionSignal({
      domain: "conversation",
      category: q,
      source,
      emitter: CHAT_EMITTER,
      valence: q === "im_overwhelmed" ? "negative" : "neutral",
      action: "observed",
    });
    results.push(result);
    if (result.ok && !result.deduped) emitted.push(result.signal);
  }

  for (const e of classified.emotions) {
    const result = emitCompanionSignal({
      domain: "emotional",
      category: e,
      source,
      emitter: CHAT_EMITTER,
      valence: emotionValence(e),
      action: "observed",
    });
    results.push(result);
    if (result.ok && !result.deduped) emitted.push(result.signal);
  }

  if (opts.emotionalState) {
    for (const item of emotionalStateToBus(opts.emotionalState, source)) {
      if (!lookupRegistryEntry(item.domain, item.category)) continue;
      const result = emitCompanionSignal({
        domain: item.domain,
        category: item.category,
        source,
        emitter: CHAT_EMITTER,
        valence: item.valence,
        action: "observed",
      });
      results.push(result);
      if (result.ok && !result.deduped) emitted.push(result.signal);
    }
  }

  return {
    emitted,
    results,
    legacyKeys: legacyKeysFromClassified(classified, opts.emotionalState),
  };
}
