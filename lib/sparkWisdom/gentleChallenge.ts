/**
 * Spec 124 — Gentle Challenge
 */

import type { GentleChallengeCue } from "./types";

const PREMATURE_SEQUENCE: readonly {
  pattern: RegExp;
  assumption: string;
  alternative: string;
}[] = [
  {
    pattern: /\b(website|landing page|homepage)\s+first\b/i,
    assumption: "Website must come before audience clarity",
    alternative:
      "Understanding your audience first might make the website much easier.",
  },
  {
    pattern: /\b(logo|branding)\s+first\b/i,
    assumption: "Brand polish must come before offer clarity",
    alternative:
      "A clear offer often makes brand decisions simpler — not the other way around.",
  },
  {
    pattern: /\b(course|membership)\s+first\b/i,
    assumption: "A big offer must come before proving demand",
    alternative:
      "A smaller proof of concept might tell you more than building the full thing.",
  },
  {
    pattern: /\b(sop|process doc)\s+first\b/i,
    assumption: "Documentation before the work is stable",
    alternative:
      "Running it yourself a few times might show what actually needs documenting.",
  },
  {
    pattern:
      /\b(should\s+)?(stop|quit|give up|walk away)\s+(working on|developing|building|on)\b/i,
    assumption: "Walking away is the only relief available right now",
    alternative:
      "Sometimes the urge to quit is exhaustion talking — not the whole truth about what you're building.",
  },
  {
    pattern: /\bgo back to\s+(making|doing)\b/i,
    assumption: "The old path was simpler, so it must be the better choice",
    alternative:
      "Crafts may be calling — and that might be worth honoring — but deciding in the hardest moment can borrow trouble from tomorrow.",
  },
];

export function recommendGentleChallenge(
  message: string,
): GentleChallengeCue | null {
  for (const entry of PREMATURE_SEQUENCE) {
    if (!entry.pattern.test(message)) continue;
    return {
      assumption: entry.assumption,
      permissionPhrase: "Can I offer another perspective?",
      alternativePerspective: entry.alternative,
    };
  }
  return null;
}
