/**
 * What Spark may remember — and what it must never store.
 */

import type {
  MemoryKey,
  MemoryProvenance,
  MemoryType,
  MemoryWriteProposal,
} from "./types";

const REMEMBERABLE_KEYS = new Set<MemoryKey>([
  "business_name",
  "industry",
  "offers",
  "products",
  "audience",
  "goals",
  "brand_voice",
  "active_projects",
  "previous_decisions",
  "preferred_tone",
  "preferred_response_length",
  "learning_style",
  "recurring_challenges",
  "wins",
  "milestones",
  "preferred_rooms",
  "favorite_workflows",
  "recent_context",
]);

const KEY_TO_TYPE: Partial<Record<MemoryKey, MemoryType>> = {
  business_name: "long_term_business",
  industry: "long_term_business",
  offers: "long_term_business",
  products: "long_term_business",
  audience: "long_term_business",
  goals: "goal",
  brand_voice: "long_term_business",
  active_projects: "project",
  previous_decisions: "long_term_business",
  preferred_tone: "communication_preference",
  preferred_response_length: "communication_preference",
  learning_style: "learning",
  recurring_challenges: "long_term_business",
  wins: "long_term_business",
  milestones: "goal",
  preferred_rooms: "estate",
  favorite_workflows: "estate",
  recent_context: "short_term_conversation",
  emotional_context_session: "short_term_conversation",
};

const BLOCK_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /\b(maybe|probably|might|i guess|i think)\b/i, reason: "speculation" },
  { pattern: /\b(just thinking|random thought|off the top)\b/i, reason: "temporary_thought" },
  { pattern: /\b(ssn|social security|password|credit card)\b/i, reason: "sensitive_detail" },
  {
    pattern: /\b(i'm (so )?(sad|depressed|anxious|angry) today)\b/i,
    reason: "one_time_emotional_state",
  },
];

const INFERENCE_PATTERNS = [
  /\b(you seem|you must be|you're clearly|i bet you)\b/i,
  /\b(obviously|definitely|always|never)\b/i,
];

export function memoryTypeForKey(key: MemoryKey): MemoryType {
  return KEY_TO_TYPE[key] ?? "long_term_business";
}

export function isRememberableKey(key: string): key is MemoryKey {
  return REMEMBERABLE_KEYS.has(key as MemoryKey);
}

export function evaluateWriteCandidate(input: {
  userId: string;
  key: string;
  value: unknown;
  sourceText: string;
  provenance: MemoryProvenance;
  explicitConsent?: boolean;
}): Pick<
  MemoryWriteProposal,
  "blocked" | "blockReason" | "requiresConfirmation" | "memoryType" | "promptText"
> {
  const { key, value, sourceText, provenance, explicitConsent } = input;

  if (!isRememberableKey(key)) {
    return {
      memoryType: "long_term_business",
      blocked: true,
      blockReason: "unsupported_key",
      requiresConfirmation: false,
    };
  }

  for (const { pattern, reason } of BLOCK_PATTERNS) {
    if (pattern.test(sourceText)) {
      return {
        memoryType: memoryTypeForKey(key),
        blocked: true,
        blockReason: reason,
        requiresConfirmation: false,
      };
    }
  }

  if (provenance === "observed" && INFERENCE_PATTERNS.some((p) => p.test(sourceText))) {
    return {
      memoryType: memoryTypeForKey(key),
      blocked: true,
      blockReason: "unsupported_assumption",
      requiresConfirmation: false,
    };
  }

  const strValue = String(value ?? "").trim();
  if (!strValue) {
    return {
      memoryType: memoryTypeForKey(key),
      blocked: true,
      blockReason: "empty_value",
      requiresConfirmation: false,
    };
  }

  const requiresConfirmation =
    !explicitConsent &&
    (provenance === "observed" ||
      provenance === "imported" ||
      ["audience", "goals", "brand_voice", "previous_decisions"].includes(key));

  const promptText = requiresConfirmation
    ? `Would you like me to remember your ${key.replace(/_/g, " ")} as "${strValue}"?`
    : undefined;

  return {
    memoryType: memoryTypeForKey(key),
    blocked: false,
    requiresConfirmation,
    promptText,
  };
}

export function extractFactsFromMessage(message: string): Array<{
  key: MemoryKey;
  value: string;
  provenance: MemoryProvenance;
}> {
  const facts: Array<{ key: MemoryKey; value: string; provenance: MemoryProvenance }> = [];

  const patterns: Array<{ key: MemoryKey; regex: RegExp }> = [
    {
      key: "business_name",
      regex: /(?:my business (?:is|called)|we(?:'re| are) called)\s+([^.!?\n,]+)/i,
    },
    {
      key: "industry",
      regex: /(?:i(?:'m| am) in|we(?:'re| are) in) the\s+([^.!?\n]+?)\s+(?:industry|space|market)/i,
    },
    {
      key: "audience",
      regex: /(?:my (?:target )?audience is|i serve)\s+([^.!?\n]+)/i,
    },
    {
      key: "preferred_tone",
      regex: /(?:prefer|like)\s+(?:a\s+)?(warm|direct|casual|professional|friendly)\s+tone/i,
    },
    {
      key: "preferred_response_length",
      regex: /(?:keep (?:it )?|prefer )\s*(short|brief|concise|detailed|long)\s+(?:answers|responses)/i,
    },
    {
      key: "learning_style",
      regex: /i learn best (?:by|through|when)\s+([^.!?\n]+)/i,
    },
    {
      key: "brand_voice",
      regex: /(?:our )?brand voice is\s+([^.!?\n]+)/i,
    },
    {
      key: "goals",
      regex: /(?:my goal is|i want to)\s+([^.!?\n]+)/i,
    },
  ];

  for (const { key, regex } of patterns) {
    const match = message.match(regex);
    if (match?.[1]) {
      facts.push({
        key,
        value: match[1].trim(),
        provenance: "member_stated",
      });
    }
  }

  if (/\bremember (?:that|this)\b/i.test(message)) {
    const rememberMatch = message.match(/remember (?:that|this)[:\s]+([^.!?\n]+)/i);
    if (rememberMatch?.[1]) {
      facts.push({
        key: "recent_context",
        value: rememberMatch[1].trim(),
        provenance: "member_stated",
      });
    }
  }

  return facts;
}
