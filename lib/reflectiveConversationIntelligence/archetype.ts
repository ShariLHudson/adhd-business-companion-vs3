/**
 * Conversation archetype classifier — shapes which questions are appropriate.
 */

import type { RciConversationArchetype, RciMessage } from "./types";

export function classifyConversationArchetype(
  userText: string,
  messages: readonly RciMessage[] = [],
): RciConversationArchetype {
  const t = userText.toLowerCase();
  const history = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ")
    .toLowerCase();
  const blob = `${history} ${t}`;

  if (
    /\b(?:overwhelmed|overwhelm|too much|can't keep up|spinning|scattered)\b/.test(
      blob,
    )
  ) {
    return "overwhelm";
  }
  if (
    /\b(?:afraid|fear|avoid(?:ing)?|putting off|procrastinat\w*|scared to)\b/.test(
      blob,
    )
  ) {
    return "fear-avoidance";
  }
  if (
    /\b(?:client|partner|relationship|conversation with|let .+ go|team member)\b/.test(
      blob,
    ) &&
    /\b(?:hard|difficult|awkward|hurt|boundary|say no)\b/.test(blob)
  ) {
    return "relationship";
  }
  if (
    /\b(?:creat(?:e|ive)|ideas?|writer'?s block|blank page|inspired|campaign)\b/.test(
      blob,
    ) &&
    /\b(?:stuck|block|nothing|can't think|no ideas)\b/.test(blob)
  ) {
    return "creative-block";
  }
  if (
    /\b(?:imposter|not good enough|confidence|who am i|identity|compare)\b/.test(
      blob,
    )
  ) {
    return "identity-confidence";
  }
  if (
    /\b(?:after the|looking back|went well|didn't go|debrief|happened yesterday)\b/.test(
      blob,
    )
  ) {
    return "reflection-after-event";
  }
  if (
    /\b(?:opportunit|collaborate|partnership|should i (?:take|join|say yes))\b/.test(
      blob,
    )
  ) {
    return "opportunity-evaluation";
  }
  if (
    /\b(?:plan|planning|schedule|this week|priorit|roadmap|calendar)\b/.test(
      blob,
    )
  ) {
    return "planning";
  }
  if (
    /\b(?:decid|decision|choose|choice|whether|option|pros|cons|trade-?off)\b/.test(
      blob,
    )
  ) {
    return "business-decision";
  }
  // Hire / should-I framing is a business decision even without "decide"
  if (
    /\b(?:hir(?:e|ing)|outsourc|bring (?:someone|a person) (?:in|on))\b/.test(
      blob,
    ) ||
    /\bshould i\b/.test(blob)
  ) {
    return "business-decision";
  }
  return "other";
}
