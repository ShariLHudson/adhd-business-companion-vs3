/**
 * Shari Voice Layer — final expression of every member-facing reply.
 *
 * Conversation Decision decides WHAT help is needed.
 * This layer decides HOW that help is said.
 *
 * Not a router. Not a second chatbot. Extends the Phase A decision spine.
 *
 * Platform settings (do not invent duplicates):
 * - Conversation Style → Prefs.aiTone (gentle | balanced | direct | playful | strategic | motivational)
 * - Help Mode → Prefs.helpMode (step-by-step | ask-first | direct | concise | navigate)
 * - Support Style → getActiveSupportStyleId()
 */

import type { AiTone, HelpMode } from "@/lib/companionStore";
import { getPrefs } from "@/lib/companionStore";
import {
  buildMemberTonePreferenceBlocks,
  type MemberTonePreferenceInput,
} from "@/lib/companionTonePreferences";
import { enforceHumanConversation } from "@/lib/humanConversation";
import { getActiveSupportStyleId } from "@/lib/supportStyle";
import { supportStyleIdFromLegacy } from "@/lib/supportStyle/legacyBridge";
import type { OverwhelmNeedKind } from "@/lib/conversation/overwhelmNeedClassifier";
import { annotateTurnDecision, getActiveTurnDecision } from "./turnDecisionStore";

export type ShariVoiceProfile = {
  aiTone: AiTone;
  helpMode: HelpMode;
  /** Canonical Support Style id when available. */
  supportStyleId: string;
  /** Legacy Prefs.supportStyle mirror. */
  supportStyleLegacy: MemberTonePreferenceInput["supportStyle"];
  source: "persistent" | "defaults" | "request_override";
};

export type ShariVoiceRuntimeMetadata = {
  activeVoiceProfile: "shari_core";
  selectedStyle: AiTone;
  selectedTone: AiTone;
  responseLengthPreference: HelpMode;
  supportStyleId: string;
  conversationCondition: string;
  contentPlanOwner: string | null;
  finalResponseOwner: string | null;
  cannedBypassAttempted: boolean;
  bypassReason: string | null;
  settingsSource: ShariVoiceProfile["source"];
  voiceLayerApplied: boolean;
};

export type ApplyShariVoiceInput = {
  text: string;
  userText?: string;
  emotionalCondition?: OverwhelmNeedKind | "none" | string;
  contentPlanOwner?: string | null;
  finalResponseOwner?: string | null;
  /** Fixed legal / safety / system-required copy may skip delivery shaping. */
  bypassVoiceLayer?: boolean;
  bypassReason?: "legal" | "safety" | "system_required";
  /** Request-body overrides (API) — otherwise load from persistent prefs. */
  profileOverride?: Partial<MemberTonePreferenceInput> & {
    supportStyleId?: string;
  };
  gentle?: boolean;
};

export type ApplyShariVoiceResult = {
  text: string;
  profile: ShariVoiceProfile;
  metadata: ShariVoiceRuntimeMetadata;
};

const AI_TONES: readonly AiTone[] = [
  "gentle",
  "balanced",
  "direct",
  "playful",
  "strategic",
  "motivational",
];

const HELP_MODES: readonly HelpMode[] = [
  "step-by-step",
  "ask-first",
  "direct",
  "concise",
  "navigate",
];

const SOFT_OPENER_RE =
  /^(?:i hear you[.!]?|that sounds (?:really )?(?:hard|heavy|tough)[.!]?|i'?m sorry you'?re dealing with that[.!]?|thanks for telling me[.!]?)\s*/i;

const EXAGGERATED_PRAISE_RE =
  /\b(?:you(?:'re| are) (?:amazing|incredible|a superstar|crushing it)|so proud of you[!]*)\b/gi;

const REPETITIVE_SMALL_STEP_RE =
  /\b(?:what(?:'s| is) one small step(?: you can take)?[?.!]*)/gi;

function isAiTone(value: unknown): value is AiTone {
  return typeof value === "string" && (AI_TONES as readonly string[]).includes(value);
}

function isHelpMode(value: unknown): value is HelpMode {
  return typeof value === "string" && (HELP_MODES as readonly string[]).includes(value);
}

function sentenceSplit(text: string): string[] {
  return text
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function joinSentences(parts: string[]): string {
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Load the active voice profile from persistent prefs (client) or defaults.
 * API routes should pass profileOverride from the request body.
 */
export function loadShariVoiceProfile(
  override?: ApplyShariVoiceInput["profileOverride"],
): ShariVoiceProfile {
  try {
    if (override && (override.aiTone || override.helpMode || override.supportStyle || override.supportStyleId)) {
      const prefs = typeof window !== "undefined" ? getPrefs() : null;
      const aiTone = isAiTone(override.aiTone)
        ? override.aiTone
        : isAiTone(prefs?.aiTone)
          ? prefs!.aiTone
          : "balanced";
      const helpMode = isHelpMode(override.helpMode)
        ? override.helpMode
        : isHelpMode(prefs?.helpMode)
          ? prefs!.helpMode
          : "ask-first";
      const supportStyleLegacy =
        override.supportStyle ?? prefs?.supportStyle ?? "balanced";
      const supportStyleId =
        override.supportStyleId ??
        (typeof window !== "undefined"
          ? getActiveSupportStyleId()
          : supportStyleIdFromLegacy(supportStyleLegacy));
      return {
        aiTone,
        helpMode,
        supportStyleId,
        supportStyleLegacy,
        source: "request_override",
      };
    }

    if (typeof window !== "undefined") {
      const prefs = getPrefs();
      return {
        aiTone: isAiTone(prefs.aiTone) ? prefs.aiTone : "balanced",
        helpMode: isHelpMode(prefs.helpMode) ? prefs.helpMode : "ask-first",
        supportStyleId: getActiveSupportStyleId(),
        supportStyleLegacy: prefs.supportStyle ?? "balanced",
        source: "persistent",
      };
    }
  } catch {
    // Fall through to defaults — never block the reply.
  }

  return {
    aiTone: "balanced",
    helpMode: "ask-first",
    supportStyleId: "adaptive",
    supportStyleLegacy: "balanced",
    source: "defaults",
  };
}

/**
 * Prompt blocks for the LLM path — always include selected settings.
 * Adds emotional adaptation so Direct + overwhelmed stays clear and gentle.
 */
export function buildShariVoicePromptBlocks(input: {
  profile?: ShariVoiceProfile;
  emotionalCondition?: string;
}): string[] {
  const profile = input.profile ?? loadShariVoiceProfile();
  const blocks = buildMemberTonePreferenceBlocks({
    aiTone: profile.aiTone,
    helpMode: profile.helpMode,
    supportStyle: profile.supportStyleLegacy,
  });

  blocks.push(
    [
      "SHARI VOICE LAYER (final expression — binding):",
      "You are the final wording authority for this reply. Routers and Directors contribute facts — you write like Shari.",
      "Warm, natural, human, conversational, practical, supportive, nonjudgmental.",
      "Calm without clinical. Helpful without scripted. Confident without bossy. Light humor only when it fits.",
      "Avoid: repetitive acknowledgments, canned coaching, menu language, forced reflection, feature promotion,",
      "therapy-speak, repeated “one small step” prompts, repeated destination offers, identical openers every turn.",
      "When supporting action under avoidance or hesitation, you may connect the step to emotional payoff",
      "(relief, lightness, Future You) — only when natural; never automatic; never the same wording twice.",
    ].join("\n"),
  );

  const emotional = input.emotionalCondition ?? "none";
  if (emotional && emotional !== "none") {
    blocks.push(buildEmotionalAdaptationBlock(profile, emotional));
  }

  return blocks;
}

function buildEmotionalAdaptationBlock(
  profile: ShariVoiceProfile,
  emotional: string,
): string {
  const lines = [
    `HUMAN ADAPTATION — Conversation Style (${profile.aiTone}) × condition (${emotional}):`,
  ];
  if (
    emotional === "cognitive_overload" ||
    emotional === "task_breakdown" ||
    /overwhelm/i.test(emotional)
  ) {
    if (profile.aiTone === "direct") {
      lines.push(
        "Direct + overwhelm → clear and gentle, never harsh. One next move. No scenic menus.",
      );
    } else if (profile.aiTone === "gentle" || profile.aiTone === "motivational") {
      lines.push(
        "Warm + overwhelm → brief comfort, then practical help. No wall of text. No breathing auto-launch.",
      );
    } else {
      lines.push(
        "Overwhelm → shorter, organized, limited options. Emotion adapts delivery — never replaces the primary task.",
      );
    }
    if (profile.helpMode === "concise") {
      lines.push("Concise + emotional load → short but not dismissive. One acknowledgment, one help.");
    }
  }
  if (profile.helpMode === "concise") {
    lines.push("Keep this reply short: prefer 1–3 short sentences unless they asked for detail.");
  }
  if (profile.aiTone === "direct" || profile.helpMode === "direct") {
    lines.push("Lead with substance. Skip soft padding that delays help.");
  }
  if (profile.aiTone === "motivational") {
    lines.push("Encourage capability without exaggerated praise.");
  }
  return lines.join("\n");
}

/**
 * Delivery shaping for deterministic (local) replies — style-aware, not a rewrite engine.
 */
function shapeDeliveryForStyle(
  text: string,
  profile: ShariVoiceProfile,
  emotional: string,
): string {
  let out = text.trim();
  if (!out) return out;

  const overwhelmed =
    emotional === "cognitive_overload" ||
    emotional === "task_breakdown" ||
    /overwhelm/i.test(emotional);

  // Never keep exaggerated praise — Encouraging/Motivational must stay practical.
  out = out.replace(EXAGGERATED_PRAISE_RE, "").replace(/\s{2,}/g, " ").trim();

  // Reduce canned "one small step" when style is direct/concise.
  if (
    profile.aiTone === "direct" ||
    profile.helpMode === "direct" ||
    profile.helpMode === "concise"
  ) {
    out = out.replace(REPETITIVE_SMALL_STEP_RE, "").replace(/\s{2,}/g, " ").trim();
  }

  // Direct: drop soft openers unless overwhelmed (Human Adaptation Rule).
  if (
    (profile.aiTone === "direct" || profile.helpMode === "direct") &&
    !overwhelmed
  ) {
    out = out.replace(SOFT_OPENER_RE, "").trim();
  }

  // Concise: keep at most 2 sentences for local replies.
  if (profile.helpMode === "concise") {
    const parts = sentenceSplit(out);
    if (parts.length > 2) {
      out = joinSentences(parts.slice(0, 2));
    }
    if (out.length > 320) {
      out = `${out.slice(0, 300).replace(/\s+\S*$/, "").trim()}…`;
    }
  }

  // Gentle + overload: never strip to a curt fragment.
  if (profile.aiTone === "gentle" && overwhelmed && out.length < 12) {
    return text.trim();
  }

  return out || text.trim();
}

/**
 * Apply the Shari Voice Layer to one final member-facing string.
 * Failures never block — returns original text with metadata.
 */
export function applyShariVoiceLayer(
  input: ApplyShariVoiceInput,
): ApplyShariVoiceResult {
  const profile = loadShariVoiceProfile(input.profileOverride);
  const turn = getActiveTurnDecision();
  const emotional =
    input.emotionalCondition ?? turn?.emotionalCondition ?? "none";
  const contentPlanOwner = input.contentPlanOwner ?? turn?.finalResponseOwner ?? null;
  const finalResponseOwner =
    input.finalResponseOwner ?? turn?.finalResponseOwner ?? contentPlanOwner;

  const metadata: ShariVoiceRuntimeMetadata = {
    activeVoiceProfile: "shari_core",
    selectedStyle: profile.aiTone,
    selectedTone: profile.aiTone,
    responseLengthPreference: profile.helpMode,
    supportStyleId: profile.supportStyleId,
    conversationCondition: String(emotional),
    contentPlanOwner,
    finalResponseOwner,
    cannedBypassAttempted: Boolean(input.bypassVoiceLayer),
    bypassReason: input.bypassReason ?? null,
    settingsSource: profile.source,
    voiceLayerApplied: false,
  };

  try {
    if (input.bypassVoiceLayer) {
      annotateVoiceOnTurn(metadata);
      return { text: input.text, profile, metadata };
    }

    const shaped = shapeDeliveryForStyle(input.text, profile, String(emotional));
    const gentleDefault =
      profile.aiTone === "gentle" ||
      String(emotional).includes("overwhelm") ||
      emotional === "cognitive_overload" ||
      emotional === "task_breakdown";
    const enforced = enforceHumanConversation({
      response: shaped,
      userText: input.userText,
      gentle: input.gentle ?? gentleDefault,
      seed: (input.userText?.length ?? shaped.length) + profile.aiTone.length,
    });

    metadata.voiceLayerApplied = true;
    annotateVoiceOnTurn(metadata);
    return { text: enforced.message, profile, metadata };
  } catch {
    annotateVoiceOnTurn(metadata);
    return { text: input.text, profile, metadata };
  }
}

function annotateVoiceOnTurn(metadata: ShariVoiceRuntimeMetadata): void {
  try {
    annotateTurnDecision({
      finalResponseOwner: metadata.finalResponseOwner ?? undefined,
      actionExecuted: metadata.voiceLayerApplied
        ? "shari_voice_layer"
        : metadata.cannedBypassAttempted
          ? "voice_bypass"
          : undefined,
      bypassDetected: metadata.cannedBypassAttempted
        ? `voice_bypass:${metadata.bypassReason ?? "unknown"}`
        : null,
    });
    if (typeof window !== "undefined") {
      const w = window as Window & {
        __sparkShariVoiceLog?: ShariVoiceRuntimeMetadata[];
      };
      const log = w.__sparkShariVoiceLog ?? [];
      log.push(metadata);
      w.__sparkShariVoiceLog = log.slice(-50);
    }
  } catch {
    // Logging must never block.
  }
}

/** Distinctness helper for regression tests — same seed text, different styles. */
export function previewStyledReply(
  seedText: string,
  prefs: MemberTonePreferenceInput,
  emotionalCondition: string = "none",
): string {
  return applyShariVoiceLayer({
    text: seedText,
    emotionalCondition,
    profileOverride: {
      aiTone: prefs.aiTone,
      helpMode: prefs.helpMode,
      supportStyle: prefs.supportStyle,
      supportStyleId: supportStyleIdFromLegacy(prefs.supportStyle),
    },
    finalResponseOwner: "test_preview",
  }).text;
}
