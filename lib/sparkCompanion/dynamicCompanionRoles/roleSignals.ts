import { detectMemberEmotionalSignals } from "@/lib/conversation/emotionalFirstResponseSequence";
import { isFrictionFirstTurn } from "@/lib/sparkCompanion/frictionFirst/struggleSignals";
import type { CompanionRole } from "./types";

/** Clear actionable create/accomplish requests */
export const CREATE_DO_RE =
  /\b(?:help me (?:create|write|draft|build|make|plan|research|design)|write (?:a|an|my)|create (?:a|an|my)|draft (?:a|an|my)|build (?:a|an|my)|make (?:a|an|my)|research (?:my|the|competitors|market)|help me price|course outline|marketing plan|linkedin post|proposal|newsletter|email to|sop\b)\b/i;

export const THINK_DECIDE_RE =
  /\b(?:help me (?:think|decide|choose)|think (?:this|it|through)|can'?t decide|don'?t know which|stuck between|torn between|which (?:direction|option|one|path|idea)|three (?:ideas|options|business)|should i (?:hire|launch|pivot|choose)|what direction|compare (?:these|my) options)\b/i;

/** Teach, explain, explore — not build, not decide */
export const DISCOVER_LEARN_RE =
  /\b(?:teach me (?:about)?|tell me about|learn about|how does (?:a|an|the|my)?|how do (?:a|an|the|my)?|what is (?:a|an|the|my)?|what are (?:the|my)?|explain (?:a|an|the|my|what|how)?|describe (?:a|an|the|my)?|show me everything|what (?:visual thinking )?models|what can (?:spark|the estate|you) do|what does (?:spark|the estate)|discover (?:what|how)|walk me through (?:how|what|the))\b/i;

export const ESTATE_DISCOVERY_RE =
  /\b(?:show me (?:everything )?(?:the )?estate|what (?:can|does) (?:the )?estate|estate (?:can|do|offer|have))\b/i;

export const SUPPORT_RESTORE_RE =
  /\b(?:overwhelm(?:ed)?|ashamed|exhausted|can'?t make myself|keep avoiding|avoiding (?:it|this)|everything feels too big|don'?t know what'?s wrong|i just can'?t|can'?t get anything done|wasted another day|harder than i expected|afraid i'?ll do it wrong|feel like a failure|discouraged|hopeless|need support|feel supported)\b/i;

export const ROLE_SWITCH_TO_SUPPORT_RE =
  /\b(?:harder than i expected|avoiding (?:it|this)|afraid i'?ll|can'?t make myself|this is overwhelming|too much|i'?m stuck on this)\b/i;

export const ROLE_SWITCH_TO_CREATE_RE =
  /\b(?:ok(?:ay)? let'?s (?:try|do|build|write)|ready to (?:try|start|work)|let'?s (?:build|write|create)|back to (?:the|my) (?:sop|draft|plan))\b/i;

export const EXPLICIT_SUPPORT_ASK_RE =
  /\b(?:just need (?:someone|support)|need to talk|help me feel|feel understood|not ready to work)\b/i;

export function hasSupportSignals(
  text: string,
  overwhelmed?: boolean,
): boolean {
  if (overwhelmed) return true;
  if (SUPPORT_RESTORE_RE.test(text)) return true;
  if (isFrictionFirstTurn(text)) return true;
  const signals = detectMemberEmotionalSignals(text);
  return (
    signals.includes("shame") ||
    signals.includes("overwhelm") ||
    signals.includes("avoidance") ||
    signals.includes("discouragement") ||
    signals.includes("exhaustion") ||
    signals.includes("grief")
  );
}

export function hasCreateSignals(text: string): boolean {
  return CREATE_DO_RE.test(text.trim());
}

export function hasThinkSignals(text: string): boolean {
  return THINK_DECIDE_RE.test(text.trim());
}

export function hasDiscoverSignals(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (ESTATE_DISCOVERY_RE.test(t)) return true;
  if (DISCOVER_LEARN_RE.test(t)) return true;
  if (
    /^\s*(?:what is|what are|how does|how do|explain|describe|tell me about)\b/i.test(
      t,
    )
  ) {
    return !hasCreateSignals(t);
  }
  return false;
}

export function detectRoleSwitch(
  text: string,
  previousRole: CompanionRole | null | undefined,
): CompanionRole | null {
  if (!previousRole) return null;
  if (ROLE_SWITCH_TO_SUPPORT_RE.test(text)) {
    if (previousRole === "create_do" || previousRole === "think_decide") {
      return "support_restore";
    }
  }
  if (ROLE_SWITCH_TO_CREATE_RE.test(text) && previousRole === "support_restore") {
    return "create_do";
  }
  if (hasThinkSignals(text) && previousRole === "create_do") {
    if (ROLE_SWITCH_TO_SUPPORT_RE.test(text)) return null;
    if (/\bharder than|not sure|stuck\b/i.test(text)) return "think_decide";
  }
  return null;
}
