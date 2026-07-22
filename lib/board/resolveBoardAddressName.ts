/**
 * Resolve the member's address name for Board of Directors responses.
 * Preferred → first name → display name → null (use "your question" / "your decision").
 * Never returns email, user IDs, or the literal word "user".
 */

import { getPrefs } from "@/lib/companionStore";
import { significantNameTokens } from "@/lib/userProfileDisplay";

export type BoardAddressNameSource = {
  preferredName?: string | null;
  /** Legal / full display name */
  name?: string | null;
};

const FORBIDDEN_LITERALS = new Set([
  "undefined",
  "null",
  "user",
  "[name]",
  "name",
]);

function isUsablePersonName(value: string): boolean {
  const t = value.trim();
  if (!t) return false;
  if (FORBIDDEN_LITERALS.has(t.toLowerCase())) return false;
  if (t.includes("@")) return false;
  // Internal IDs / UUIDs — not a person name
  if (/^[0-9a-f]{8}-[0-9a-f-]{4,}$/i.test(t)) return false;
  if (/^(usr|user|uid|id)[_-]/i.test(t) && !/\s/.test(t)) return false;
  return true;
}

/**
 * Current user's name for Board Directors to address.
 * Returns null when no safe name is available (callers use "your question").
 */
export function resolveBoardAddressName(
  overrides?: BoardAddressNameSource,
): string | null {
  const prefs = getPrefs();
  const preferred = (
    overrides?.preferredName ??
    prefs.preferredName ??
    ""
  ).trim();
  if (isUsablePersonName(preferred)) return preferred;

  const legal = (overrides?.name ?? prefs.name ?? "").trim();
  if (!isUsablePersonName(legal)) return null;

  const tokens = significantNameTokens(legal);
  if (tokens[0] && isUsablePersonName(tokens[0])) return tokens[0];
  return legal;
}

export type BoardMatterKind = "question" | "decision" | "options";

export function boardPossessiveMatter(
  addressName: string | null | undefined,
  kind: BoardMatterKind,
): string {
  const name = addressName?.trim();
  if (!name) {
    if (kind === "question") return "your question";
    if (kind === "options") return "your options";
    return "your decision";
  }
  return `${name}'s ${kind}`;
}

/**
 * Instruction for Board-member prompts (templated or LLM).
 * Pass the resolved preferred name; never invent one.
 */
export function boardMemberAddressPromptInstruction(
  addressName: string | null | undefined,
): string {
  const name = addressName?.trim() || "";
  const questionRef = name ? `${name}'s question` : "your question";
  const decisionRef = name ? `${name}'s decision` : "your decision";
  const addressLine = name
    ? `Address the person naturally by the provided preferred name "${name}" near the beginning of your response.`
    : `If no name is available, use "your question" or "your decision."`;

  return [
    addressLine,
    `When appropriate, refer to the matter as "${questionRef}" or "${decisionRef}."`,
    `Never use placeholders or the literal word "user" in the visible response.`,
    `Do not repeat the name excessively.`,
  ].join("\n");
}

export type BoardPersonalizationOptions = {
  /**
   * Override resolved address name.
   * Pass `null` to force fallback wording; omit to read the profile.
   */
  addressName?: string | null;
};

/** Resolve address name for builders — supports test overrides. */
export function resolveAddressNameForBoard(
  options?: BoardPersonalizationOptions,
): string | null {
  if (options && Object.prototype.hasOwnProperty.call(options, "addressName")) {
    const override = options.addressName;
    if (override == null) return null;
    const trimmed = override.trim();
    return isUsablePersonName(trimmed) ? trimmed : null;
  }
  return resolveBoardAddressName();
}
