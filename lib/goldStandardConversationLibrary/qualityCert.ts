import type { GoldStandardConversation, GscQualityCert } from "./types";

/** Verify every checklist field is true. */
export function isFullyCertified(quality: GscQualityCert): boolean {
  return Object.values(quality).every(Boolean);
}

export function certifyConversation(
  entry: GoldStandardConversation,
): { passed: boolean; failures: string[] } {
  const failures: string[] = [];
  if (!entry.topicAnchor.trim()) failures.push("missing_topic_anchor");
  if (entry.turns.length < 2) failures.push("too_few_turns");

  const firstAssistant = entry.turns.find((t) => t.role === "assistant");
  if (!firstAssistant?.content.trim()) {
    failures.push("missing_first_assistant_turn");
  } else {
    const t = firstAssistant.content.toLowerCase();
    // Repair/correction demos may intentionally open with a weak turn
    const demoWeakOpen =
      entry.category === "repairs" ||
      /REPAIR|CORRECTION/i.test(entry.id) ||
      firstAssistant.move === "other";
    if (
      !demoWeakOpen &&
      /take your time|quieter question underneath|what matters most\?|tell me more\.?$|around does/.test(
        t,
      )
    ) {
      failures.push("blocked_opening_pattern");
    }
  }

  for (const alt of entry.blockedAlternatives) {
    for (const turn of entry.turns) {
      // Skip intentional demo weak turns in repair examples
      if (turn.move === "other") continue;
      if (
        turn.role === "assistant" &&
        turn.content.trim().toLowerCase() === alt.text.trim().toLowerCase()
      ) {
        failures.push(`uses_blocked_alternative:${alt.text.slice(0, 40)}`);
      }
    }
  }

  if (!isFullyCertified(entry.quality)) {
    failures.push("quality_checklist_incomplete");
  }

  // One question max per assistant turn (soft — allow closing choice)
  for (const turn of entry.turns) {
    if (turn.role !== "assistant") continue;
    const qs = (turn.content.match(/\?/g) ?? []).length;
    if (qs > 2) failures.push("multi_question_turn");
  }

  return { passed: failures.length === 0, failures };
}
