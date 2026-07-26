/**
 * Audience context builder — turns an AudienceSelection into prompt-ready
 * context. The hard rule: several audiences are NEVER flattened into one
 * imaginary person. Each avatar becomes its own labeled block, and the chosen
 * output strategy is stated explicitly so the model (and the member) know which
 * approach is being taken.
 *
 * Pure/testable: takes `avatars` as input, reads no storage.
 */

import { avatarBehaviorGuidance, type IdealClientAvatar } from "@/lib/companionStore";
import {
  resolveSelectedAvatars,
  type AudienceSelection,
  type MultiAvatarOutputMode,
} from "@/lib/audienceSelection";

export type AudienceContext = {
  /** How many audiences actually feed generation. */
  audienceCount: number;
  /** The strategy applied: none / single / one of the multi output modes. */
  strategy: MultiAvatarOutputMode | "single" | "none";
  /** Prompt-ready context text. */
  text: string;
  /** Ids of the avatars used, in order. */
  usedAvatarIds: string[];
};

const STRATEGY_DIRECTIVE: Record<MultiAvatarOutputMode, string> = {
  shared:
    "STRATEGY — ONE SHARED VERSION: Create a single result that genuinely works for ALL of the distinct audiences below. Do NOT merge them into one imaginary person — speak to their shared needs and explicitly name where their needs differ.",
  separate:
    "STRATEGY — SEPARATE VERSIONS: Create a distinct, clearly-labeled result for EACH audience below, each true to that specific audience.",
  tailored:
    "STRATEGY — SHARED FOUNDATION + TAILORED VARIATIONS: Create one shared foundation, then a tailored variation per audience below, noting what changes for each.",
  compare:
    "STRATEGY — COMPARE FIRST: Before creating anything, compare the audiences below — shared needs, key differences, and tensions — then recommend how to proceed.",
};

function renderAvatarBlock(a: IdealClientAvatar, label: string): string {
  const lines = [
    `${label}: ${a.name?.trim() || "Unnamed client"}`,
    a.tagline?.trim() ? `Tagline: ${a.tagline.trim()}` : "",
    a.who?.trim() ? `Who they are: ${a.who.trim()}` : "",
    a.painPoints?.trim() ? `Struggles: ${a.painPoints.trim()}` : "",
    a.goals?.trim() ? `Goals: ${a.goals.trim()}` : "",
    a.currentBehavior?.trim() ? `What holds them back: ${a.currentBehavior.trim()}` : "",
    a.motivations?.trim() ? `Motivations: ${a.motivations.trim()}` : "",
    a.objections?.trim() ? `Objections: ${a.objections.trim()}` : "",
    a.triggers?.trim() ? `Decision triggers: ${a.triggers.trim()}` : "",
    a.contentPrefs?.trim() ? `Content preferences: ${a.contentPrefs.trim()}` : "",
    a.solution?.trim() ? `How the founder helps them: ${a.solution.trim()}` : "",
  ];
  const guidance = avatarBehaviorGuidance(a);
  if (guidance) lines.push(`How to speak to them: ${guidance}`);
  return lines.filter(Boolean).join("\n");
}

export function buildAudienceContext(
  selection: AudienceSelection,
  avatars: IdealClientAvatar[],
): AudienceContext {
  const used = resolveSelectedAvatars(selection, avatars);

  if (used.length === 0) {
    return {
      audienceCount: 0,
      strategy: "none",
      text: "AUDIENCE: No specific audience selected. Use general business context and the member's request. Do not invent an audience.",
      usedAvatarIds: [],
    };
  }

  if (used.length === 1) {
    const a = used[0]!;
    return {
      audienceCount: 1,
      strategy: "single",
      text: `PRIMARY AUDIENCE — write for this one audience:\n${renderAvatarBlock(a, "AUDIENCE")}`,
      usedAvatarIds: [a.id],
    };
  }

  const mode = selection.multiAvatarOutputMode;
  const blocks = used.map((a, i) => renderAvatarBlock(a, `AUDIENCE ${i + 1}`));
  const text = [
    `MULTIPLE DISTINCT AUDIENCES (${used.length}). Each is a separate, real audience — never blend them into a single imaginary person.`,
    STRATEGY_DIRECTIVE[mode],
    "",
    blocks.join("\n\n"),
  ].join("\n");

  return {
    audienceCount: used.length,
    strategy: mode,
    text,
    usedAvatarIds: used.map((a) => a.id),
  };
}
