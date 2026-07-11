import {
  buildSparkCardAskUserMessage,
  buildSparkCardChatContextBlock,
} from "./sparkCardChatContext";
import type { SparkNoteDailyCard } from "./types";

export type SparkCardAskCompanionRequest = {
  card: SparkNoteDailyCard;
  prompt: string;
  contextBlock: string;
};

let pendingRequest: SparkCardAskCompanionRequest | null = null;
const listeners = new Set<() => void>();

/** Open companion chat with Daily Spark context (Spark Estate bridge). */
export function requestSparkCardAskCompanion(
  card: SparkNoteDailyCard,
  prompt?: string,
): void {
  pendingRequest = {
    card,
    prompt: prompt ?? buildSparkCardAskUserMessage(card),
    contextBlock: buildSparkCardChatContextBlock(card),
  };
  for (const listener of listeners) listener();
}

export function consumeSparkCardAskCompanion(): SparkCardAskCompanionRequest | null {
  const request = pendingRequest;
  pendingRequest = null;
  return request;
}

export function subscribeSparkCardAskCompanion(
  listener: () => void,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
