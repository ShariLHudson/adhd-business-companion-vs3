/**
 * Companion delivery contract — ADR-012 Phase 4.
 *
 * ONE typed shape every chat surface sends, and ONE normalized shape the
 * server assembles model-facing prompt text from.
 *
 * The rule this file exists to enforce: **clients send raw canonical
 * preferences and context only — never pre-assembled prompt text.** Before
 * Phase 4 the client built a Support Style block and the server independently
 * rebuilt a second one from a different (lossy) input, so a single prompt
 * could contradict itself about the member's own settings.
 *
 * @see docs/adr/ADR-012-unify-shari-guidance-settings.md
 */

import type { AiTone, HelpMode, SupportStyle } from "@/lib/companionStore";
import {
  legacySupportStyleFromId,
  supportStyleIdFromLegacy,
} from "@/lib/supportStyle/legacyBridge";
import { normalizeSupportStylePreference } from "@/lib/supportStyle/prefs";
import {
  SUPPORT_STYLE_CATALOG,
  type SupportStyleCustomSettings,
  type SupportStyleId,
} from "@/lib/supportStyle/types";

export const AI_TONE_VALUES: readonly AiTone[] = [
  "gentle",
  "balanced",
  "direct",
  "playful",
  "strategic",
  "motivational",
];

export const HELP_MODE_VALUES: readonly HelpMode[] = [
  "step-by-step",
  "ask-first",
  "direct",
  "concise",
  "navigate",
];

export function isAiTone(value: unknown): value is AiTone {
  return (
    typeof value === "string" && (AI_TONE_VALUES as readonly string[]).includes(value)
  );
}

export function isHelpMode(value: unknown): value is HelpMode {
  return (
    typeof value === "string" &&
    (HELP_MODE_VALUES as readonly string[]).includes(value)
  );
}

export function isSupportStyleId(value: unknown): value is SupportStyleId {
  return (
    typeof value === "string" &&
    SUPPORT_STYLE_CATALOG.some((entry) => entry.id === value)
  );
}

/**
 * What a chat surface puts on the wire. Raw preferences only — every field is
 * a stored member choice or turn context, never assembled prompt copy.
 */
export type CompanionDeliveryRequest = {
  aiTone?: AiTone | string | null;
  helpMode?: HelpMode | string | null;
  /** Canonical Support Style id — what every surface is expected to send. */
  supportStyleId?: SupportStyleId | string | null;
  /**
   * Legacy `Prefs.supportStyle` mirror. Accepted only as a fallback for older
   * clients; it cannot express `step-by-step`, `give-me-choices`, or `custom`.
   */
  supportStyle?: SupportStyle | string | null;
  /** "Use this Support Style most of the time" — member's real checkbox. */
  useMostOfTheTime?: boolean | null;
  /** Member-built Support Style details, when styleId is `custom`. */
  customSettings?: SupportStyleCustomSettings | null;
};

/** Normalized, server-side truth for one turn's delivery assembly. */
export type ResolvedDeliveryPreferences = {
  aiTone: AiTone;
  helpMode: HelpMode;
  supportStyleId: SupportStyleId;
  /** Kept for legacy readers (routing, voice layer) — derived, never trusted. */
  supportStyleLegacy: SupportStyle;
  useMostOfTheTime: boolean;
  customSettings?: SupportStyleCustomSettings;
  /**
   * Latest user message this turn. The server — not the client — reads this
   * to detect a temporary Support Style override, so exactly one component
   * decides the effective style.
   */
  latestUserText: string;
  /** True when the surface sent the canonical id rather than a legacy mirror. */
  sentCanonicalSupportStyleId: boolean;
  /**
   * Legacy `supportStyle: "listen"` with no canonical id — an older saved
   * selection that meant listen-only support, and the only way that intent can
   * be expressed. When a canonical id IS sent it wins: the legacy mirror maps
   * "listen" and "talk-it-through" onto each other, so honoring both would
   * impose a no-advice constraint on Talk It Through members.
   */
  legacyListenOnly: boolean;
};

/**
 * Resolve one turn's delivery preferences from a raw request body.
 *
 * Canonical id wins. The legacy mirror is only consulted when no canonical id
 * arrived — and `supportStyleIdFromLegacy` also accepts canonical strings, so
 * pre-Phase-4 clients that sent a canonical id in the legacy-named field keep
 * working unchanged.
 */
export function resolveCompanionDeliveryPreferences(
  input: CompanionDeliveryRequest & { latestUserText?: string | null } = {},
): ResolvedDeliveryPreferences {
  const sentCanonicalSupportStyleId = isSupportStyleId(input.supportStyleId);
  const styleId = sentCanonicalSupportStyleId
    ? (input.supportStyleId as SupportStyleId)
    : supportStyleIdFromLegacy(input.supportStyle ?? undefined);

  const preference = normalizeSupportStylePreference({
    styleId,
    useMostOfTheTime:
      typeof input.useMostOfTheTime === "boolean"
        ? input.useMostOfTheTime
        : undefined,
    customSettings: input.customSettings ?? undefined,
  });

  return {
    aiTone: isAiTone(input.aiTone) ? input.aiTone : "balanced",
    helpMode: isHelpMode(input.helpMode) ? input.helpMode : "ask-first",
    supportStyleId: preference.styleId,
    supportStyleLegacy: legacySupportStyleFromId(preference.styleId),
    useMostOfTheTime: preference.useMostOfTheTime,
    customSettings: preference.customSettings,
    latestUserText: (input.latestUserText ?? "").trim(),
    sentCanonicalSupportStyleId,
    legacyListenOnly: !sentCanonicalSupportStyleId && input.supportStyle === "listen",
  };
}
