import type { GreetingIntelligenceInput } from "@/lib/greetingIntelligence/types";
import type { RealityEmotionalTone } from "@/lib/arrivalExperience/types";
import { passesCharacterFilter } from "@/lib/characterOfShari";
import { resolveVoiceContext } from "@/lib/shariVoiceBible/resolveVoiceContext";
import { selectVoiceLine } from "@/lib/shariVoiceBible/selectVoiceLine";
import { lifeMomentTag } from "./catalog";
import { violatesLifeMomentVoice } from "./rules";
import {
  resolveLifeMomentCategory,
  shouldOfferLifeMoment,
} from "./resolveCategory";

/**
 * Compose a Life Moment — Shari sharing her experience, not giving advice.
 */
export function composeLifeMoment(input: {
  voiceContext: GreetingIntelligenceInput;
  tone: RealityEmotionalTone;
  rawNote?: string;
  continuity?: boolean;
}): string | null {
  const ctx = resolveVoiceContext(input.voiceContext);

  if (
    !shouldOfferLifeMoment({
      tone: input.tone,
      rawNote: input.rawNote,
      sessionVisitIndex: ctx.sessionVisitIndex,
      isFirstMeeting: ctx.isFirstMeeting,
      continuity: input.continuity,
    })
  ) {
    return null;
  }

  const category = resolveLifeMomentCategory(input.tone, input.rawNote);
  if (!category) return null;

  const pick = selectVoiceLine("observation", ctx, {
    tag: lifeMomentTag(category),
    salt: `life-moment-${category}`,
    record: true,
  });

  const text = pick?.text;
  if (!text || violatesLifeMomentVoice(text)) return null;
  if (!passesCharacterFilter(text, { kind: "spoken_line" })) return null;

  return text;
}
