import { catalogEntryForStyle } from "./types";
import { getSupportStylePreference } from "./prefs";
import {
  detectSupportStyleTemporaryOverride,
  resolveEffectiveSupportStyleId,
} from "./temporaryOverride";
import type {
  SupportStyleCustomSettings,
  SupportStyleId,
  SupportStylePreference,
} from "./types";

function customSettingsPrompt(custom?: SupportStyleCustomSettings): string {
  if (!custom) return "";
  const lines: string[] = ["Custom Support Style details:"];
  if (custom.overwhelmedStart) {
    lines.push(`- When overwhelmed, start with: ${custom.overwhelmedStart}`);
  }
  if (custom.stuckHelp?.length) {
    lines.push(`- When stuck, help by: ${custom.stuckHelp.join(", ")}`);
  }
  if (custom.discouragedHelp?.length) {
    lines.push(`- When discouraged: ${custom.discouragedHelp.join(", ")}`);
  }
  if (custom.choiceCount) {
    lines.push(`- Choice count preference: ${custom.choiceCount}`);
  }
  if (custom.encouragementLevel) {
    lines.push(`- Encouragement: ${custom.encouragementLevel}`);
  }
  return lines.join("\n");
}

const STYLE_PROMPT: Record<SupportStyleId, string> = {
  "gentle-first": [
    "SUPPORT STYLE — GENTLE FIRST (what to do first when they need help):",
    "Acknowledge how they feel and reduce pressure before suggesting action.",
    "One warm reflection, then at most one small next move — permission first.",
    "Never rush solutions or dump a plan.",
  ].join("\n"),
  "practical-first": [
    "SUPPORT STYLE — PRACTICAL FIRST:",
    "Lead with a clear, useful next step quickly. Light reassurance only if needed.",
    "Prefer concrete action over extended processing — unless they ask to talk.",
  ].join("\n"),
  "talk-it-through": [
    "SUPPORT STYLE — TALK IT THROUGH:",
    "Help them understand what is happening before solutions.",
    "One clarifying question that names likely frictions. Do not jump to a full plan.",
  ].join("\n"),
  "step-by-step": [
    "SUPPORT STYLE — GUIDE ME STEP BY STEP:",
    "Ask one question at a time. Lead through the next small action only.",
    "Never present a full plan or several questions in one turn.",
  ].join("\n"),
  "give-me-choices": [
    "SUPPORT STYLE — GIVE ME CHOICES:",
    "Offer 2–3 clear numbered options for the kind of help they want.",
    "Do not invent a long menu. Wait for their choice before proceeding.",
  ].join("\n"),
  adaptive: [
    "SUPPORT STYLE — ADAPT TO THE SITUATION:",
    "Match the simplest helpful support to what they said (overload → unload; stuck → one step; deciding → choices).",
    "Briefly explain why when it helps: “You sound mentally overloaded, so…”",
    "Never ignore their saved preferences, current intent, or a direct request.",
  ].join("\n"),
  custom: [
    "SUPPORT STYLE — CUSTOM (member-built):",
    "Follow their custom support choices below when they need help.",
    "Still honor direct requests and current intent first.",
  ].join("\n"),
};

/**
 * Prompt block for response generation — Support Style is HOW Spark helps,
 * not Conversation Style (wording) and not Planning Preferences (plan structure).
 */
export function buildSupportStylePromptBlock(
  preference?: SupportStylePreference,
  userTextForOverride?: string,
): string {
  const prefs = preference ?? getSupportStylePreference();
  const override = userTextForOverride
    ? detectSupportStyleTemporaryOverride(userTextForOverride)
    : null;
  const styleId = resolveEffectiveSupportStyleId(prefs.styleId, override);
  const entry = catalogEntryForStyle(styleId);

  const parts = [
    "SUPPORT STYLE (separate from Conversation Style and Planning Preferences):",
    "Conversation Style = how Shari talks. Support Style = what Spark does first when they need help.",
    "Planning Preferences = how plans are structured. Pattern Awareness = strategies that helped before.",
    "PRIORITY: Safety/truth → current intent/corrections → current need → Support Style → Conversation Style → Planning → destination.",
    "Never override a direct request (e.g. “skip reassurance and tell me what to do”).",
    "Temporary asks change this turn only — do not rewrite their saved Support Style unless they ask to save it.",
    STYLE_PROMPT[styleId],
    `Active Support Style: ${entry.label}.`,
  ];

  if (override) {
    parts.push(
      `TEMPORARY OVERRIDE THIS TURN: ${override.reason} Effective style: ${styleId}. Saved preference remains ${prefs.styleId}.`,
    );
  } else if (prefs.useMostOfTheTime) {
    parts.push(
      "Use this Support Style most of the time unless they ask for something different right now.",
    );
  }

  if (styleId === "custom") {
    const custom = customSettingsPrompt(prefs.customSettings);
    if (custom) parts.push(custom);
  }

  return parts.join("\n");
}

/** Compact hint for governor / intent merge paths. */
export function supportStyleHintForChat(userText?: string): string {
  return buildSupportStylePromptBlock(undefined, userText);
}

/** Preview text for Settings — does not save. */
export function previewSupportStyleResponse(styleId: SupportStyleId): string {
  return catalogEntryForStyle(styleId).preview;
}
