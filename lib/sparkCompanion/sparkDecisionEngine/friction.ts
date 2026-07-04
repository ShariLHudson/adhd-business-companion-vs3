import type {
  SparkDecisionFrictionType,
  SparkPrimaryIntent,
} from "./types";

const KNOWLEDGE_RE =
  /\b(?:don'?t know how|never done this|how do i|what(?:'s| is) the process|need to learn)\b/i;

const CLARITY_RE =
  /\b(?:don'?t know where to start|unclear|confused|no idea where|where do i begin)\b/i;

const PRIORITIZATION_RE =
  /\b(?:too many (?:choices|options|things)|can'?t prioritize|everything at once|competing priorities)\b/i;

const CONFIDENCE_RE =
  /\b(?:don'?t think i can|not good enough|can'?t do this|impostor|imposter|self[- ]doubt)\b/i;

const EMOTIONAL_WEIGHT_RE =
  /\b(?:afraid|scared|anxious|worried|dreading|embarrassed|ashamed|grief)\b/i;

const CAPACITY_RE =
  /\b(?:exhausted|burned out|burnt out|no energy|mentally tired|drained|need rest)\b/i;

const MEMORY_RE =
  /\b(?:keep forgetting|forget everything|lose track|can'?t remember|brain won'?t hold)\b/i;

const MOMENTUM_RE =
  /\b(?:keep stopping|never finish|start and stop|lost momentum|abandoned|keep quitting)\b/i;

export const FRICTION_RESPONSES: Readonly<
  Record<
    SparkDecisionFrictionType,
    { response: string; removeBeforeAdd: string }
  >
> = {
  knowledge: {
    response: "Teach clearly — simple, practical, actionable.",
    removeBeforeAdd: "Do not add more tasks before teaching.",
  },
  clarity: {
    response: "Guide — find the first obvious step.",
    removeBeforeAdd: "Reduce ambiguity before adding options.",
  },
  prioritization: {
    response: "Reduce options — one or two meaningful choices.",
    removeBeforeAdd: "Never add more choices when already overwhelmed.",
  },
  confidence: {
    response: "Encourage with evidence — never empty reassurance.",
    removeBeforeAdd: "Restore belief before pushing forward.",
  },
  emotional_weight: {
    response: "Support — listen, normalize, then gentle movement.",
    removeBeforeAdd: "Remove shame before solving.",
  },
  capacity: {
    response: "Reduce pressure — offer restoration, permission to rest.",
    removeBeforeAdd: "Do not add work when capacity is depleted.",
  },
  memory: {
    response: "Use memory quietly — remember so they don't have to.",
    removeBeforeAdd: "Never ask them to recall what Spark can hold.",
  },
  momentum: {
    response: "Restart gently — smallest step, protect what exists.",
    removeBeforeAdd: "Never guilt about stopped progress.",
  },
  none: {
    response: "Proceed with intent — no major friction detected.",
    removeBeforeAdd: "Protect momentum; stay focused.",
  },
};

export function identifySparkFriction(input: {
  userText: string;
  overwhelmed?: boolean;
  intent: SparkPrimaryIntent;
}): SparkDecisionFrictionType {
  const text = input.userText.trim();
  if (!text) return "none";

  if (input.overwhelmed || CAPACITY_RE.test(text)) return "capacity";
  if (EMOTIONAL_WEIGHT_RE.test(text)) return "emotional_weight";
  if (MEMORY_RE.test(text)) return "memory";
  if (MOMENTUM_RE.test(text)) return "momentum";
  if (PRIORITIZATION_RE.test(text)) return "prioritization";
  if (CONFIDENCE_RE.test(text)) return "confidence";
  if (CLARITY_RE.test(text)) return "clarity";
  if (KNOWLEDGE_RE.test(text)) return "knowledge";

  if (input.intent === "SUPPORT") return "emotional_weight";
  if (input.intent === "LEARN") return "knowledge";
  if (input.intent === "THINK") return "clarity";

  return "none";
}
