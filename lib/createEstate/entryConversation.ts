/**
 * Conversational Create Entrance (2026-08-06) — pure logic for the opening
 * turn only. Replaces the Start Freely / Start With Guidance / Browse
 * Categories three-way choice with a single conversation.
 *
 * Scope, deliberately narrow: this module decides which topic-aware
 * acknowledgment line to show after the member's first message. It does
 * NOT classify a Build Type — resolveCreateBeginOutcome() (unchanged) still
 * makes that call, once, after the member elaborates. This is a second,
 * disposable classifier whose only job is picking the right one of four
 * authored acknowledgment lines; getting it "wrong" just shows a slightly
 * less specific (but still correct) response — resolveCreateBeginOutcome's
 * real classification is unaffected either way.
 *
 * Deliberately not reused from lib/estateBrain/discoveryRegistry.ts's
 * DISCOVERY_INTROS: the copy here is new, entrance-specific wording your
 * spec calls for verbatim, and discoveryRegistry.ts is shared with chat
 * routing (discoveryMode.ts) — this module has no import relationship to
 * it, so nothing about chat's discovery flow is touched.
 */

export type EntryConversationTopic = "sop" | "event" | "marketing" | "idea";

const SOP_RE = /\bsop\b|\bstandard operating procedure\b/i;
const EVENT_RE =
  /\bworkshop\b|\bevent\b|\bretreat\b|\bwebinar\b|\bconference\b|\bmasterclass\b/i;
const MARKETING_RE = /\bmarketing\b/i;

/**
 * Which authored acknowledgment line fits the member's opening message.
 * Order matters — SOP and Event both sometimes mention "clients"/"business,"
 * so the more specific match (SOP, then Event, then Marketing) wins before
 * falling through to the generic idea-exploration response.
 */
export function detectEntryTopic(text: string): EntryConversationTopic {
  const t = text.trim();
  if (SOP_RE.test(t)) return "sop";
  if (EVENT_RE.test(t)) return "event";
  if (MARKETING_RE.test(t)) return "marketing";
  return "idea";
}

/** Exact copy from the approved test-flow spec — one line per topic. */
export const ENTRY_ACKNOWLEDGMENTS: Record<EntryConversationTopic, string> = {
  sop:
    "I'd be happy to help. Before we start writing steps, let's understand what this process needs to accomplish.",
  event:
    "That sounds exciting. Before we think about schedules or materials, who is this workshop meant to help and what do you hope changes for them?",
  marketing:
    "I'd love to help. Before we create a marketing plan, let's understand what you're hoping marketing will accomplish.",
  idea: "Perfect. Those are often the ideas worth exploring. Tell me what you're imagining.",
};

export type EntryAcknowledgment = {
  topic: EntryConversationTopic;
  message: string;
};

/** The single acknowledgment turn — called once, after the member's opening message. */
export function acknowledgeEntryText(text: string): EntryAcknowledgment {
  const topic = detectEntryTopic(text);
  return { topic, message: ENTRY_ACKNOWLEDGMENTS[topic] };
}

/**
 * Combines the opening message and the member's elaboration into one string
 * for resolveCreateBeginOutcome() — more signal than either turn alone,
 * without inventing a second classifier for the real Build Type decision.
 */
export function combineEntryConversationText(
  opening: string,
  elaboration: string,
): string {
  return [opening.trim(), elaboration.trim()].filter(Boolean).join(" ").trim();
}

/**
 * Screen 1 → Screen 2 stage. Deliberately just two stages — "one helpful
 * question → one useful insight → next step," never a multi-turn interview.
 * "acknowledged" is the terminal stage; the caller hands the combined text
 * to the existing confirm pipeline from there.
 */
export type EntryConversationStage = "opening" | "acknowledged";
