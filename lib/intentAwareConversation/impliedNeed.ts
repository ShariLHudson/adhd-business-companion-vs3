/**
 * IMPLIED_NEED — between relationship chat and direct commands.
 * A thoughtful host notices the need and offers natural choices — never auto-routes.
 *
 * @see docs/estate/INTENT_AWARE_CONVERSATION_FRAMEWORK.md
 */

import { getCanonicalEstatePlaceById } from "@/lib/estate/canonicalEstateRegistry";
import {
  matchImpliedEstatePlace,
  type ImpliedEstatePlaceMatch,
} from "@/lib/estate/impliedEstatePlaceMatch";
import { isRelationshipConversation } from "./routingGate";
import type { ImpliedNeedSession } from "./impliedNeedSession";

export type ImpliedNeedPath =
  | "real_world_break"
  | "estate_place"
  | "stay_here"
  | "short_reset";

export type ImpliedNeedChoice = {
  id: string;
  label: string;
  path: ImpliedNeedPath;
  placeId?: string;
};

export type ImpliedNeedEvaluation = {
  intentCategory: "IMPLIED_NEED";
  matchKey: string;
  primaryPlaceId: string | null;
  placeLabel: string | null;
  suggestedPaths: ImpliedNeedPath[];
  choices: ImpliedNeedChoice[];
  responseLine: string;
  responseHint: string;
};

export type ImpliedNeedContinuationResult =
  | { kind: "real_world_break"; reply: string }
  | { kind: "stay_here"; reply: string }
  | { kind: "short_reset"; reply: string }
  | { kind: "estate_place"; placeId: string; reply: string }
  | { kind: "unrecognized"; reply: string | null };

const DIRECT_COMMAND_RE =
  /\b(?:take me|go to|bring me|show me|open (?:the )?|visit (?:the )?|head to)\b/i;

const EXPLICIT_TASK_RE =
  /\b(?:help me (?:write|create|draft|build|plan)|write a|create a|draft a)\b/i;

/** Work / coaching focus — discovery flow, not IMPLIED_NEED host pause */
const FOCUS_COACHING_EXCLUDE_RE =
  /\b(?:need to focus|help me focus|help me concentrate|can'?t focus|trouble focus|stay focused|hard to focus)\b/i;

const IMPLIED_NEED_OPENER_RE =
  /\b(?:i need|i could use|i want|i'?m feeling|i feel)\b/i;

type NeedProfile = {
  matchKey: string;
  placeId: string | null;
  leadIn: string;
  realWorldLabel: string;
  estateLabel?: string;
  includeShortReset?: boolean;
};

const PROFILE_BY_MATCH_KEY: Readonly<Record<string, Partial<NeedProfile>>> = {
  "coffee-need": {
    leadIn:
      "That sounds like a good idea. Would you like to actually take a few minutes and grab one, or would you like me to take you to the Coffee House here at the Estate?",
    realWorldLabel: "I'll go get coffee",
    estateLabel: "Take me to the Coffee House",
  },
  "tea-need": {
    leadIn:
      "A cup of tea can be a lovely pause. Would you like to step away for one, or shall we visit the Tea Room here at the Estate?",
    realWorldLabel: "I'll go make tea",
    estateLabel: "Take me to the Tea Room",
  },
  "fresh-air": {
    leadIn:
      "Fresh air can change everything. Would you like to step outside for a few minutes, or walk with me through the Estate Gardens?",
    realWorldLabel: "I'll step outside",
    estateLabel: "Take me to the Estate Gardens",
  },
  "clear-head": {
    leadIn:
      "When your head feels full, a pause helps. We could visit Clear My Mind, take a real-world break, or just sit here together.",
    realWorldLabel: "I'll take a real break",
    estateLabel: "Take me to Clear My Mind",
    includeShortReset: true,
  },
  overwhelmed: {
    leadIn:
      "That sounds like a lot. We could visit Clear My Mind, take a few minutes away from the screen, or just sit here — no fixing required.",
    realWorldLabel: "I'll step away for a bit",
    estateLabel: "Take me to Clear My Mind",
  },
  "need-minute": {
    leadIn:
      "A minute can be enough. Would you like to step away, find a quiet corner here at the Estate, or just sit with me?",
    realWorldLabel: "I'll take a minute away",
    estateLabel: "Take me somewhere quiet",
    placeId: "peaceful-places",
  },
  "need-break": {
    leadIn:
      "You deserve a breather. Would you like a real-world break, a peaceful place here at the Estate, or to stay right here with me?",
    realWorldLabel: "I'll take a break",
    estateLabel: "Take me somewhere peaceful",
    placeId: "peaceful-places",
  },
  "need-calming": {
    leadIn:
      "Something calming sounds right. We could visit a peaceful place here, take a few minutes away, or just sit together.",
    realWorldLabel: "I'll step away for a bit",
    estateLabel: "Take me somewhere calming",
    placeId: "peaceful-places",
    includeShortReset: true,
  },
  "need-quiet": {
    leadIn:
      "Quiet can help. Would you like the Reading Nook here at the Estate, a few minutes away from work, or to stay here with me?",
    realWorldLabel: "I'll find quiet away from the screen",
    estateLabel: "Take me to the Reading Nook",
    placeId: "reading-nook",
  },
  "rest-relax": {
    leadIn:
      "Rest sounds wise. We could visit the Lakeside Hammock, take a real break, or just sit here together.",
    realWorldLabel: "I'll rest away from the screen",
    estateLabel: "Take me to the Lakeside Hammock",
  },
};

const EXTRA_IMPLIED_PATTERNS: ReadonlyArray<{
  pattern: RegExp;
  matchKey: string;
  placeId: string;
}> = [
  { pattern: /\bi need a minute\b/i, matchKey: "need-minute", placeId: "peaceful-places" },
  { pattern: /\bi need (?:a )?break\b/i, matchKey: "need-break", placeId: "peaceful-places" },
  {
    pattern: /\bi need something calming\b/i,
    matchKey: "need-calming",
    placeId: "peaceful-places",
  },
  {
    pattern: /\bi need to sit somewhere quiet\b/i,
    matchKey: "need-quiet",
    placeId: "reading-nook",
  },
  {
    pattern: /\bi need fresh air\b/i,
    matchKey: "fresh-air",
    placeId: "estate-gardens",
  },
];

function placeLabel(placeId: string | null): string | null {
  if (!placeId) return null;
  return getCanonicalEstatePlaceById(placeId)?.officialName ?? null;
}

function resolveMatch(text: string): ImpliedEstatePlaceMatch | null {
  const estateMatch = matchImpliedEstatePlace(text);
  if (estateMatch) return estateMatch;

  for (const row of EXTRA_IMPLIED_PATTERNS) {
    if (!row.pattern.test(text)) continue;
    if (!getCanonicalEstatePlaceById(row.placeId)) continue;
    return {
      placeId: row.placeId,
      confidence: 0.72,
      matchKey: row.matchKey,
      reason: `implied-need:${row.matchKey}`,
    };
  }
  return null;
}

function buildChoices(match: ImpliedEstatePlaceMatch): ImpliedNeedChoice[] {
  const profile = PROFILE_BY_MATCH_KEY[match.matchKey];
  const placeId = match.placeId;
  const label = placeLabel(placeId);
  const estateChoiceLabel =
    profile?.estateLabel ??
    (label ? `Take me to ${label}` : "Take me to a peaceful place");

  const choices: ImpliedNeedChoice[] = [
    {
      id: "real-world",
      label: profile?.realWorldLabel ?? "I'll step away for a bit",
      path: "real_world_break",
    },
    {
      id: "estate-place",
      label: estateChoiceLabel,
      path: "estate_place",
      placeId,
    },
    {
      id: "stay-here",
      label: "Just sit with me a minute",
      path: "stay_here",
    },
  ];

  if (profile?.includeShortReset) {
    return [
      choices[0]!,
      choices[1]!,
      {
        id: "short-reset",
        label: "Help me take a slow breath",
        path: "short_reset",
      },
    ];
  }

  return choices;
}

function buildLeadIn(match: ImpliedEstatePlaceMatch): string {
  const profile = PROFILE_BY_MATCH_KEY[match.matchKey];
  if (profile?.leadIn) return profile.leadIn;

  const label = placeLabel(match.placeId);
  if (label) {
    return `${label} might be just right. Would you like a real-world break, to visit here at the Estate, or to stay here with me?`;
  }
  return "I hear you. Would you like a real-world break, a peaceful place here at the Estate, or to stay here with me?";
}

function formatChoicesMenu(choices: ImpliedNeedChoice[]): string {
  return choices.map((choice, index) => `${index + 1}. ${choice.label}`).join("\n");
}

export function formatImpliedNeedReply(evaluation: ImpliedNeedEvaluation): string {
  return `${evaluation.responseLine}\n\n${formatChoicesMenu(evaluation.choices)}`;
}

export function isImpliedNeedOfferMessage(text: string): boolean {
  return /^\s*1\.\s+.+\n\s*2\.\s+.+\n\s*3\./m.test(text);
}

export function evaluateImpliedNeed(text: string): ImpliedNeedEvaluation | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 140) return null;
  if (isRelationshipConversation(trimmed)) return null;
  if (DIRECT_COMMAND_RE.test(trimmed)) return null;
  if (EXPLICIT_TASK_RE.test(trimmed)) return null;
  if (FOCUS_COACHING_EXCLUDE_RE.test(trimmed)) return null;
  if (!IMPLIED_NEED_OPENER_RE.test(trimmed)) return null;

  const match = resolveMatch(trimmed);
  if (!match) return null;

  const choices = buildChoices(match);
  const suggestedPaths = [...new Set(choices.map((c) => c.path))];
  const responseLine = buildLeadIn(match);

  return {
    intentCategory: "IMPLIED_NEED",
    matchKey: match.matchKey,
    primaryPlaceId: match.placeId,
    placeLabel: placeLabel(match.placeId),
    suggestedPaths,
    choices,
    responseLine,
    responseHint: [
      "IMPLIED_NEED (mandatory):",
      "Member expressed a need — NOT a direct command.",
      "Offer thoughtful choices. Do NOT auto-navigate or open a workspace.",
      `Suggested paths: ${suggestedPaths.join(", ")}`,
      "Warm host tone — notice the need, invite choice, no pressure.",
    ].join("\n"),
  };
}

function choiceMatchesInput(choice: ImpliedNeedChoice, text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  if (choice.label.toLowerCase() === t) return true;
  if (choice.label.toLowerCase().includes(t) && t.length >= 8) return true;
  if (/\b(?:the )?coffee house\b/i.test(t) && choice.path === "estate_place") return true;
  if (/\b(?:go get|grab).{0,12}coffee\b/i.test(t) && choice.path === "real_world_break") {
    return true;
  }
  if (/\b(?:sit with me|stay here|just sit)\b/i.test(t) && choice.path === "stay_here") {
    return true;
  }
  if (/\b(?:step away|take a break|get coffee|fresh air)\b/i.test(t)) {
    if (choice.path === "real_world_break") return true;
  }
  if (/\b(?:slow breath|breathe|calm me)\b/i.test(t) && choice.path === "short_reset") {
    return true;
  }
  return false;
}

export function resolveImpliedNeedContinuation(
  userText: string,
  session: ImpliedNeedSession | null,
): ImpliedNeedContinuationResult | null {
  if (!session?.choices.length) return null;
  const text = userText.trim();
  if (!text) return null;

  const numbered = text.match(/^([1-3])\b/);
  if (numbered) {
    const choice = session.choices[Number(numbered[1]) - 1];
    if (choice) {
      return continuationForChoice(choice);
    }
  }

  for (const choice of session.choices) {
    if (choiceMatchesInput(choice, text)) {
      return continuationForChoice(choice);
    }
  }

  if (/^(?:yes|yep|sure|okay|ok)\.?$/i.test(text)) {
    return { kind: "unrecognized", reply: "Which feels right — 1, 2, or 3?" };
  }

  return null;
}

function continuationForChoice(choice: ImpliedNeedChoice): ImpliedNeedContinuationResult {
  switch (choice.path) {
    case "real_world_break":
      return {
        kind: "real_world_break",
        reply:
          "That sounds lovely. Take your time — I'll be right here when you're back.",
      };
    case "stay_here":
      return {
        kind: "stay_here",
        reply: "Of course. We can just sit here together. No rush.",
      };
    case "short_reset":
      return {
        kind: "short_reset",
        reply:
          "Let's take one slow breath together. In… and out. I'm here — no agenda.",
      };
    case "estate_place":
      return {
        kind: "estate_place",
        placeId: choice.placeId ?? "peaceful-places",
        reply: choice.placeId
          ? `${placeLabel(choice.placeId) ?? "This place"} sounds perfect right now.`
          : "Let's head somewhere peaceful.",
      };
    default: {
      const _exhaustive: never = choice.path;
      return _exhaustive;
    }
  }
}

export function impliedNeedDiagnosticLabel(
  evaluation: ImpliedNeedEvaluation | null,
): string | null {
  if (!evaluation) return null;
  return `IMPLIED_NEED:${evaluation.matchKey}:${evaluation.suggestedPaths.join("+")}`;
}
