import type {
  ShariEmotionalTag,
  ShariRelationshipStage,
  ShariSeason,
  ShariTimeOfDay,
  ShariVoiceCategory,
  ShariVoiceKind,
  ShariVoiceLine,
} from "./types";
import type { CompanionPlaceId } from "@/lib/companionUniverse/types";

type LineMeta = {
  relationshipStages?: ShariRelationshipStage[];
  timeOfDay?: ShariTimeOfDay[];
  seasons?: ShariSeason[];
  emotionalTags?: ShariEmotionalTag[];
  rooms?: CompanionPlaceId[];
  frequencyWeight?: number;
  standsAlone?: boolean;
  cooldownVisits?: number;
  tags?: string[];
};

export function voiceLine(
  id: string,
  text: string,
  category: ShariVoiceCategory,
  kind: ShariVoiceKind,
  meta: LineMeta = {},
): ShariVoiceLine {
  return {
    id,
    text,
    category,
    kind,
    frequencyWeight: meta.frequencyWeight ?? 1,
    ...meta,
  };
}

export function voiceLines(
  category: ShariVoiceCategory,
  kind: ShariVoiceKind,
  lines: readonly string[],
  meta: LineMeta = {},
): ShariVoiceLine[] {
  return lines.map((text, index) =>
    voiceLine(`${category}-${kind}-${index + 1}`, text, category, kind, meta),
  );
}
