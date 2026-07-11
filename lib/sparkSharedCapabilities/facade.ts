/**
 * Companion Capability Facade — Estate 139.
 * One Spark companion. Capabilities stay hidden. No GPTs.
 */

import { composeSharedCapabilities } from "./compose";
import { getSharedCapability, listSharedCapabilities } from "./catalog";
import type {
  ComposeSharedCapabilitiesInput,
  SharedCapabilityComposition,
  SharedCapabilityId,
} from "./types";

export type CompanionCapabilityFacadeResult = {
  /** Always true — skills never surface as products */
  oneCompanion: true;
  composition: SharedCapabilityComposition | null;
  /** Safe line for Spark to say (or null if no activation) */
  speak: string | null;
  /** Prompt hint for model / coach layer */
  promptHint: string | null;
  /** Soft adapter — only if member may optionally open a surface */
  softAdapter: SharedCapabilityComposition["optionalAdapter"];
  /** Names that must never appear in member-facing copy */
  neverSay: string[];
};

/**
 * Primary entry for conversation / coach layers.
 */
export function resolveCompanionCapabilityHelp(
  input: ComposeSharedCapabilitiesInput,
): CompanionCapabilityFacadeResult {
  const composition = composeSharedCapabilities(input);
  if (!composition) {
    return {
      oneCompanion: true,
      composition: null,
      speak: null,
      promptHint: null,
      softAdapter: null,
      neverSay: ["GPT", "custom GPT"],
    };
  }

  return {
    oneCompanion: true,
    composition,
    speak: composition.companionOfferLine,
    promptHint: composition.companionPromptHint,
    softAdapter: composition.optionalAdapter,
    neverSay: composition.forbiddenExposures,
  };
}

/**
 * Guard: reject any attempt to expose a capability as a GPT/product.
 */
export function assertNeverExposeAsGpt(memberFacingText: string): boolean {
  const lower = memberFacingText.toLowerCase();
  if (/\bgpt\b/i.test(memberFacingText)) return false;
  for (const cap of listSharedCapabilities()) {
    for (const banned of cap.neverExposeAs) {
      if (lower.includes(banned.toLowerCase())) return false;
    }
  }
  return true;
}

/**
 * Member-safe label for internal id (never a GPT name).
 */
export function companionLabelForCapability(
  id: SharedCapabilityId,
): string {
  return getSharedCapability(id).companionLine;
}

/**
 * Soft adapter confirmation copy — companion voice, not product launch.
 */
export function softAdapterOfferLine(
  adapter: SharedCapabilityComposition["optionalAdapter"],
): string | null {
  switch (adapter) {
    case "decision_compass":
      return "Want to stay in chat, or open Decision Compass beside us? I'll stay with you either way.";
    case "create_workspace":
      return "Want to draft here in chat, or open Create beside us? I'll stay with you either way.";
    case "clear_my_mind":
      return "Want to sort this here, or open Clear My Mind beside us?";
    case "plan_my_day":
      return "Want a quick plan here, or open Plan My Day beside us?";
    case "evidence_vault":
      return "Would you like to preserve this in your Evidence Vault?";
    case "celebration_garden":
      return "Would you like a quiet moment in the Celebration Garden?";
    case "celebration_room":
      return "Would you like to celebrate this in the Celebration Room?";
    case "journal":
      return "Want to reflect here, or open your Journal Gazebo?";
    default:
      return null;
  }
}
