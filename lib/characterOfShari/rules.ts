import type { ShariIsNotRole } from "./traits";

/**
 * Copy that puts Shari in the wrong role — out of character.
 */

export const CHARACTER_ROLE_PATTERNS: Record<ShariIsNotRole, readonly RegExp[]> = {
  therapist: [
    /\bhow does that make you feel\b/i,
    /\bprocessing (?:this|that|your)\b/i,
    /\bcoping strateg/i,
    /\binner child\b/i,
    /\btherapeutic\b/i,
  ],
  motivational_speaker: [
    /\byour journey\b/i,
    /\bunlock your (?:potential|power)\b/i,
    /\byou are enough\b/i,
    /\bstep into your power\b/i,
    /\bmanifest\b/i,
  ],
  business_guru: [
    /\bscale to (?:six|seven|eight) figures\b/i,
    /\b10x your\b/i,
    /\bhustle(?:r|ing)?\b/i,
    /\bgrind(?:ing)?\b/i,
    /\bcrush(?:ing)? (?:it|your)\b/i,
    /\bguru\b/i,
  ],
  life_coach: [
    /\baccountability partner\b/i,
    /\baction steps?\b/i,
    /\bhomework for you\b/i,
    /\blife coach\b/i,
    /\bcoaching session\b/i,
  ],
  lecturer: [
    /\byou need to understand\b/i,
    /\blet me explain\b/i,
    /\bthe reason is\b/i,
    /\bhere'?s what you should know\b/i,
    /\blesson (?:here|today)\b/i,
  ],
  cheerleader: [
    /\blet'?s go!\b/i,
    /\byou'?ve got this!\b/i,
    /\bwoo!?\b/i,
    /\bamazing job!\b/i,
    /\bso proud of you!\b/i,
  ],
  productivity_expert: [
    /\boptimiz(e|ing) your (?:workflow|life|day)\b/i,
    /\befficiency hack\b/i,
    /\btime management (?:tip|system)\b/i,
    /\bproductivity (?:hack|system|expert)\b/i,
    /\bbatch your\b/i,
  ],
  customer_service: [
    /\bhow may I assist\b/i,
    /\bhow can I assist\b/i,
    /\bi'?m here to help\b/i,
    /\bthank you for (?:contacting|reaching|using)\b/i,
    /\bvalued (?:customer|user|member)\b/i,
    /\bis there anything else\b/i,
  ],
  ai_assistant: [
    /\bas an ai\b/i,
    /\bi'?m an ai\b/i,
    /\blanguage model\b/i,
    /\bi'?m (?:just )?a (?:bot|assistant)\b/i,
    /\bmy training\b/i,
  ],
};

export const CHARACTER_PERFORMATIVE_PATTERNS = [
  /\bi am (?:so )?excited to\b/i,
  /\bit would be my (?:pleasure|honor)\b/i,
  /\bi'?ve prepared (?:this )?especially for you\b/i,
  /\bspecially curated\b/i,
  /\bpersonalized (?:just )?for you\b/i,
] as const;

export function violatesCharacterRole(text: string): ShariIsNotRole | null {
  for (const role of Object.keys(CHARACTER_ROLE_PATTERNS) as ShariIsNotRole[]) {
    if (CHARACTER_ROLE_PATTERNS[role].some((pattern) => pattern.test(text))) {
      return role;
    }
  }
  return null;
}

export function violatesCharacterVoice(text: string): boolean {
  return (
    violatesCharacterRole(text) !== null ||
    CHARACTER_PERFORMATIVE_PATTERNS.some((pattern) => pattern.test(text))
  );
}
