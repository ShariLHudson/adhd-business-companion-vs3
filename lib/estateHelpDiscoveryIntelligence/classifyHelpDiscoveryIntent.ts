/**
 * Classify member help & discovery questions.
 */

import { matchObjectAlias } from "@/lib/estateObjectIntelligence/objectAliases";
import { classifyAudioIntent } from "@/lib/estateAudioExperienceFoundation";
import { matchFeatureHowToGuide } from "./featureHowTo";
import type { HelpDiscoveryRoute } from "./types";

const OBJECT_QUESTION_RE =
  /\b(?:what is (?:that|the)|what's (?:that|the)|who is|tell me about(?: the)?|can i (?:use|open)|tell me about (?:that|the))\b/i;

const FEATURE_HOW_TO_RE =
  /\b(?:how do i|how can i|how does (?:this|that) work|where (?:are|is) my settings|where do i find)\b/i;

const LOCATION_QUESTION_RE =
  /\b(?:where is (?:the )?|where can i|take me to|go to|show me the|visit the|head to|find me a place)\b/i;

const DISCOVERY_QUESTION_RE =
  /\b(?:what can i do|show me something new|show me something i haven'?t|what haven't i explored|something i haven'?t|what(?:'s| is) (?:there )?to do|what else (?:can|could) i)\b/i;

const CAPABILITY_OVERVIEW_RE =
  /\b(?:what can i do here|what is there to do here|how does this work|what can spark do|what does spark do)\b/i;

const EXPERIENCE_QUESTION_RE =
  /\b(?:i need inspiration|i want to relax|i want to learn|i need to focus|i need to think|i want somewhere)\b/i;

export type HelpDiscoveryClassification = {
  route: HelpDiscoveryRoute;
  matchedPhrase?: string;
};

export function classifyHelpDiscoveryIntent(
  query: string,
): HelpDiscoveryClassification | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  if (OBJECT_QUESTION_RE.test(trimmed) && matchObjectAlias(trimmed)) {
    return { route: "object", matchedPhrase: trimmed };
  }

  const howTo = matchFeatureHowToGuide(trimmed);
  if (howTo || FEATURE_HOW_TO_RE.test(trimmed)) {
    return {
      route: "feature_how_to",
      matchedPhrase: howTo?.matchedPhrase ?? trimmed,
    };
  }

  const audioIntent = classifyAudioIntent(trimmed);
  if (audioIntent?.kind) {
    return {
      route: "audio",
      matchedPhrase: audioIntent.matchedPhrase ?? trimmed,
    };
  }

  if (CAPABILITY_OVERVIEW_RE.test(trimmed)) {
    return { route: "capability_overview", matchedPhrase: trimmed };
  }

  if (DISCOVERY_QUESTION_RE.test(trimmed)) {
    return { route: "discovery", matchedPhrase: trimmed };
  }

  if (LOCATION_QUESTION_RE.test(trimmed)) {
    return { route: "location", matchedPhrase: trimmed };
  }

  if (EXPERIENCE_QUESTION_RE.test(trimmed)) {
    return { route: "experience", matchedPhrase: trimmed };
  }

  return null;
}
