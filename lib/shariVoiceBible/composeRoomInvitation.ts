import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import { placeById } from "@/lib/companionUniverse/libraries/placeLibrary";
import type { RealityEmotionalTone } from "@/lib/arrivalExperience/types";
import type { GreetingIntelligenceInput } from "@/lib/greetingIntelligence/types";
import { interpolateVoiceTemplate } from "./interpolate";
import { resolveVoiceContext } from "./resolveVoiceContext";
import { selectVoiceLine } from "./selectVoiceLine";
import type { ShariEmotionalTag, ShariVoiceContext } from "./types";

function emotionalTagFromTone(tone: RealityEmotionalTone): ShariEmotionalTag {
  switch (tone) {
    case "flooded":
      return "overwhelmed";
    case "grief":
      return "grief";
    case "heavy":
      return "discouraged";
    case "low":
      return "exhausted";
    case "spark":
    case "celebration":
      return "excited";
    default:
      return "neutral";
  }
}

function roomCategory(placeId: CompanionPlaceId): ShariVoiceContext["visitCategory"] {
  switch (placeId) {
    case "planning-table":
      return "from_planning_table";
    case "window-seat":
      return "from_clear_my_mind";
    case "creative-studio":
      return "from_creative_studio";
    case "reading-nook":
      return "from_reading_nook";
    default:
      return null;
  }
}

export function composeRoomInvitation(input: {
  placeId: CompanionPlaceId;
  tone: RealityEmotionalTone;
  voiceContext: GreetingIntelligenceInput;
  fromContinue?: boolean;
}): { line: string; buttonLabel: string; walkingLine: string } {
  const ctx = resolveVoiceContext(input.voiceContext);
  const tag = emotionalTagFromTone(input.tone);
  const placeName = placeById(input.placeId).name;
  const vars = { place: placeName, topic: "" };

  if (input.fromContinue) {
    const cont =
      selectVoiceLine("invitation", ctx, {
        tag: "continue_thread",
        salt: "continue-invite",
      })?.text ?? "We could keep going on that — only if it still feels right.";
    return {
      line: cont,
      buttonLabel: invitationButton(input.tone, input.placeId),
      walkingLine: composeWalkingLine(input.placeId, ctx),
    };
  }

  if (input.placeId === "living-room") {
    const stay =
      selectVoiceLine("invitation", { ...ctx, lastRoom: "living-room" }, {
        category: "quiet",
        salt: "stay-living-room",
      })?.text ?? "We can stay right here and talk.";
    return {
      line: stay,
      buttonLabel: "Stay here",
      walkingLine: "Stay here with me.",
    };
  }

  const category = roomCategory(input.placeId);
  let line =
    selectVoiceLine(
      "invitation",
      { ...ctx, emotionalTag: tag, lastRoom: input.placeId },
      { category: category ?? undefined, salt: `invite-${input.placeId}-${tag}` },
    )?.text ?? null;

  if (!line && (input.tone === "low" || input.tone === "heavy")) {
    const gentle = selectVoiceLine("invitation", { ...ctx, emotionalTag: tag }, {
      tag: "gentle_place",
      salt: `gentle-${input.placeId}`,
    });
    line = gentle
      ? interpolateVoiceTemplate(gentle.text, vars)
      : `We could sit at the ${placeName} — gently, if that sounds right.`;
  }

  if (!line) {
    const generic = selectVoiceLine("invitation", ctx, {
      tag: "generic_place",
      salt: `generic-${input.placeId}`,
    });
    line = generic
      ? interpolateVoiceTemplate(generic.text, vars)
      : `There's a spot in the house that might fit — the ${placeName}.`;
  }

  return {
    line,
    buttonLabel: invitationButton(input.tone, input.placeId),
    walkingLine: composeWalkingLine(input.placeId, ctx),
  };
}

function invitationButton(
  tone: RealityEmotionalTone,
  placeId: CompanionPlaceId,
): string {
  if (tone === "flooded" || tone === "grief" || tone === "heavy") {
    return "Yes, gently";
  }
  if (placeId === "living-room") return "Stay here";
  return "Show me";
}

export function composeWalkingLine(
  placeId: CompanionPlaceId,
  ctx: ShariVoiceContext,
): string {
  const line = selectVoiceLine(
    "walking",
    { ...ctx, lastRoom: placeId },
    { salt: `walk-${placeId}` },
  )?.text;
  if (line) return line;
  if (placeId === "living-room") return "Stay here with me.";
  return "This way.";
}
