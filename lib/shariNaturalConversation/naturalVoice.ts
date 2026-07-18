/**
 * Package 208 — Shari natural voice returns (no coaching shells).
 * Package 209 — never echo malformed topic dumps into member-facing text.
 */

function softTopic(topic: string): string {
  return topic.trim().replace(/\.$/, "");
}

function isMalformedTopic(topic: string): boolean {
  const t = topic.toLowerCase();
  return (
    /\bplatform need\b/.test(t) ||
    /\bneed$/.test(t) ||
    (/\b(?:designing|building)\b/.test(t) &&
      /\bplatform\b/.test(t) &&
      !/\bhir|market\b/.test(t))
  );
}

function humanTopicLabel(topic: string): string {
  const t = softTopic(topic);
  if (!t || isMalformedTopic(t)) {
    return "hiring marketing help";
  }
  return t;
}

/**
 * Natural return to the active topic — never "Let's stay with…".
 */
export function buildNaturalTopicReturn(input: {
  topic: string;
  mode?: "continue" | "correction" | "clarification" | "background";
  focus?: string | null;
}): string {
  const raw = softTopic(input.topic) || "this decision";
  const topic = humanTopicLabel(raw);
  const hire =
    /\bhir|market|sales|assistant|bookkeep/i.test(topic) ||
    isMalformedTopic(raw);
  const mode = input.mode ?? "continue";

  if (mode === "correction") {
    if (hire) {
      return `You're right — I was looking at the wrong thing. You're wondering whether ${topic} makes sense. What is making you consider it now?`;
    }
    return `You're right — I was looking at the wrong thing. The question is still ${topic}. What feels murkiest about it?`;
  }

  if (mode === "clarification") {
    if (hire) {
      return `I did not explain that clearly. You are deciding whether ${topic} makes sense. What is making you consider it now?`;
    }
    return `I did not explain that clearly. You are working with ${topic}. What feels unfinished about it?`;
  }

  if (mode === "background" && hire) {
    return `So the platform itself isn't really the question. You're wondering whether bringing in marketing help would give people a reason to discover it. What would make that feel worth trying?`;
  }

  if (input.focus && /cost|money|budget/i.test(input.focus)) {
    if (hire) {
      return `Cost is sitting right next to the hiring question. What result would make the spend feel justified?`;
    }
    return `Cost is front and center with ${topic}. What would make the spend feel justified?`;
  }

  if (hire) {
    return `You're still deciding whether ${topic} makes sense. What is making you consider it now?`;
  }

  return `You're still sitting with ${topic}. What feels murkiest about it right now?`;
}

/** Package 208 Rule 6 — would a thoughtful friend say this? */
export function passesFriendTest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (t.length > 700) return false;
  if ((t.match(/\?/g) ?? []).length >= 3) return false;
  return true;
}
