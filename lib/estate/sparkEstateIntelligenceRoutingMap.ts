/**
 * Spark Estate™ — intelligence routing map (Phase 14).
 * One companion, many specialized intelligences — right support at the right moment.
 *
 * @see docs/protocols/SPARK_ESTATE_INTELLIGENCE_ROUTING_MAP_SPECIFICATION_PHASE14.md
 */

import type { AppSection } from "@/lib/companionUi";
import {
  detectUniversalDocumentType,
  shouldEnterUniversalCreation,
} from "@/lib/universalCreation/orchestrator";
import { isSimpleCreateRequest } from "@/lib/universalCreation/createFastPath";
import {
  assessChamberMomentum,
  detectChamberEnergyLevel,
  type ChamberEnergyLevel,
} from "./chamberOfMomentumIntelligence";
import {
  getChamberMemorySnapshot,
  type ChamberMemorySnapshot,
} from "./chamberOfMomentumMemory";
import {
  buildSparkEstatePersonalizationContext,
  observeSparkEstateEnergyFromText,
} from "./sparkEstateMemberProfileEngine";
import {
  selectPrimarySparkEstateCard,
  type SparkEstateCardKind,
} from "./sparkEstateCardEcosystem";
import {
  selectChamberJourneySupport,
  type ChamberJourneySelection,
  type ChamberMemberNeed,
} from "./chamber/chamberMemberJourney";

export const SPARK_ESTATE_ROUTING_SESSION_KEY = "spark-estate-intelligence-route-v1";

export const SPARK_ESTATE_ROUTING_PRINCIPLE =
  "One companion. Many specialized intelligences.";

export const SPARK_ESTATE_ROUTING_PRIORITIES = [
  "immediate need",
  "current state",
  "existing context",
] as const;

export const SPARK_ESTATE_ROUTING_FACTORS = [
  "user intent",
  "current goal",
  "emotional state",
  "energy level",
  "previous history",
  "current projects",
  "preferences",
] as const;

export const SPARK_ESTATE_ROOM_INDEPENDENCE_RULE =
  "Routing logic applies in any room — expertise follows need, not current location.";

export const SPARK_ESTATE_LANGUAGE_ROUTING_RULE =
  "Routing works regardless of language; the experience stays consistent.";

export type SparkEstateImmediateNeed =
  | "clear-mind"
  | "move-forward"
  | "learn"
  | "create"
  | "execute"
  | "decide"
  | "review";

export type SparkEstateMemberState =
  | "overwhelmed"
  | "stuck"
  | "energized"
  | "curious"
  | "uncertain"
  | "ready-to-act";

export type { SparkEstateCardKind } from "./sparkEstateCardEcosystem";

export type SparkEstateIntelligenceRoute = {
  need: SparkEstateImmediateNeed;
  intelligence: string;
  section: AppSection | null;
  memberQuestion: string | null;
  useUniversalCreationJourney: boolean;
  recommendedCard: SparkEstateCardKind | null;
  energy: ChamberEnergyLevel;
  memberState: SparkEstateMemberState | null;
  source: "text" | "context" | "clarify";
  chamberSelection: ChamberJourneySelection | null;
};

export const SPARK_ESTATE_CLARIFY_QUESTION =
  "What are you working on right now?";

export const SPARK_ESTATE_ROUTING_SUCCESS_TEST =
  "Spark understands what I need.";

const CLEAR_MIND_RE =
  /\b(?:too much in my head|everything in my head|clear my mind|brain dump|mind is everywhere|can'?t get it out of my head|need to sort my thoughts)\b/i;

const MOVE_FORWARD_RE =
  /\b(?:i'?m stuck|feel(?:ing)? stuck|\bstuck\b|need help getting started|don'?t know where to start|move forward|get unstuck|help me start)\b/i;

const LEARN_RE =
  /\b(?:how do i|teach me|i need to understand|help me learn|want to learn|need information|explain how)\b/i;

const EXECUTE_RE =
  /\b(?:help me finish|finish (?:this|my)|need tasks|work on (?:this|my) project|complete (?:this|my) project|ready to execute)\b/i;

const DECIDE_RE =
  /\b(?:two choices|which (?:one|option)|what should i do|can'?t decide|decide between|help me choose)\b/i;

const CREATE_RE =
  /\b(?:help me (?:write|create|build|draft)|create a|build a|write an?|design a|draft a)\b/i;

const VAGUE_HELP_RE =
  /\b(?:help with my business|need help with (?:my )?business|help me with my business)\b/i;

const PRIMARY_ROUTES: Record<
  SparkEstateImmediateNeed,
  { intelligence: string; defaultSection: AppSection; purpose: string }
> = {
  "clear-mind": {
    intelligence: "Clear My Mind",
    defaultSection: "brain-dump",
    purpose: "Sort thoughts, then choose idea, decision, project, or next action.",
  },
  "move-forward": {
    intelligence: "Momentum Builder™",
    defaultSection: "momentum-builder",
    purpose: "Chamber of Momentum™ support to find the next step.",
  },
  learn: {
    intelligence: "Momentum Institute™",
    defaultSection: "momentum-institute",
    purpose: "Knowledge and skill development.",
  },
  create: {
    intelligence: "Universal Creation Journey",
    defaultSection: "content-generator",
    purpose: "Expert room + shared creation journey.",
  },
  execute: {
    intelligence: "Goals & Projects™",
    defaultSection: "chamber-project-entry",
    purpose: "Tasks, milestones, and project progress.",
  },
  decide: {
    intelligence: "Decision Intelligence",
    defaultSection: "decision-compass",
    purpose: "Evaluate options and choose a direction.",
  },
  review: {
    intelligence: "Progress Review",
    defaultSection: "evidence-bank",
    purpose: "Review wins, lessons, and progress.",
  },
};

export const SPARK_ESTATE_PRIMARY_ROUTES = PRIMARY_ROUTES;

const NEED_MAP: Record<ChamberMemberNeed, SparkEstateImmediateNeed> = {
  clarity: "move-forward",
  planning: "move-forward",
  learning: "learn",
  execution: "execute",
  review: "review",
  decision: "decide",
};

function detectImmediateNeed(text: string): SparkEstateImmediateNeed | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (CLEAR_MIND_RE.test(trimmed)) return "clear-mind";
  if (DECIDE_RE.test(trimmed)) return "decide";
  if (EXECUTE_RE.test(trimmed)) return "execute";
  if (LEARN_RE.test(trimmed)) return "learn";
  if (MOVE_FORWARD_RE.test(trimmed)) return "move-forward";
  if (
    shouldEnterUniversalCreation(trimmed) ||
    isSimpleCreateRequest(trimmed) ||
    CREATE_RE.test(trimmed) ||
    detectUniversalDocumentType(trimmed)
  ) {
    return "create";
  }
  return null;
}

function inferMemberState(
  text: string,
  assessment: ReturnType<typeof assessChamberMomentum>,
): SparkEstateMemberState | null {
  if (!text.trim() && !assessment) return null;
  if (assessment?.state === "overwhelmed") return "overwhelmed";
  if (assessment?.state === "stuck") return "stuck";
  if (assessment?.state === "wants-to-learn") return "curious";
  if (assessment?.state === "ready-to-execute") return "ready-to-act";
  if (/\buncertain|not sure|don'?t know\b/i.test(text)) return "uncertain";
  if (detectChamberEnergyLevel(text) === "high") return "energized";
  return null;
}

function routeFromChamberSelection(
  selection: ChamberJourneySelection,
  energy: ChamberEnergyLevel,
  memberState: SparkEstateMemberState | null,
  recommendedCard: SparkEstateCardKind | null,
): SparkEstateIntelligenceRoute {
  const need = NEED_MAP[selection.need];
  const primary = PRIMARY_ROUTES[need];
  return {
    need,
    intelligence: selection.target.kind.replace(/-/g, " "),
    section: selection.target.section,
    memberQuestion: selection.memberQuestion,
    useUniversalCreationJourney: false,
    recommendedCard,
    energy,
    memberState,
    source: selection.source === "context" ? "context" : "text",
    chamberSelection: selection,
  };
}

function routeFromNeed(
  need: SparkEstateImmediateNeed,
  input: {
    text: string;
    energy: ChamberEnergyLevel;
    memberState: SparkEstateMemberState | null;
    recommendedCard: SparkEstateCardKind | null;
    memberQuestion?: string | null;
    sectionOverride?: AppSection;
    chamberSelection?: ChamberJourneySelection | null;
  },
): SparkEstateIntelligenceRoute {
  const primary = PRIMARY_ROUTES[need];
  let section = input.sectionOverride ?? primary.defaultSection;

  if (need === "move-forward" && input.energy === "low") {
    section = "brain-dump";
  }

  return {
    need,
    intelligence: primary.intelligence,
    section,
    memberQuestion: input.memberQuestion ?? null,
    useUniversalCreationJourney: need === "create",
    recommendedCard: input.recommendedCard,
    energy: input.energy,
    memberState: input.memberState,
    source: "text",
    chamberSelection: input.chamberSelection ?? null,
  };
}

export function selectSparkEstateCard(input?: {
  text?: string;
  snapshot?: ChamberMemorySnapshot;
  section?: AppSection;
}): SparkEstateCardKind | null {
  return selectPrimarySparkEstateCard(input);
}

export function resolveSparkEstateIntelligenceRoute(input?: {
  text?: string;
  currentSection?: AppSection;
  snapshot?: ChamberMemorySnapshot;
}): SparkEstateIntelligenceRoute | null {
  const text = input?.text?.trim() ?? "";
  const snapshot = input?.snapshot ?? getChamberMemorySnapshot();
  if (text) observeSparkEstateEnergyFromText(text);
  const profileEnergy = buildSparkEstatePersonalizationContext({
    text,
    snapshot,
  });
  const energy = text
    ? detectChamberEnergyLevel(text)
    : profileEnergy.greetingTone === "low-energy"
      ? "low"
      : "normal";
  const assessment = text ? assessChamberMomentum(text) : null;
  const memberState = inferMemberState(text, assessment);
  const recommendedCard = selectSparkEstateCard({
    text,
    snapshot,
    section: input?.currentSection,
  });

  if (VAGUE_HELP_RE.test(text)) {
    return {
      need: "move-forward",
      intelligence: PRIMARY_ROUTES["move-forward"].intelligence,
      section: null,
      memberQuestion: SPARK_ESTATE_CLARIFY_QUESTION,
      useUniversalCreationJourney: false,
      recommendedCard,
      energy,
      memberState: "uncertain",
      source: "clarify",
      chamberSelection: null,
    };
  }

  const immediate = detectImmediateNeed(text);
  if (immediate) {
    const chamberSelection =
      immediate === "create" || immediate === "clear-mind"
        ? null
        : selectChamberJourneySupport({ text, snapshot });
    if (chamberSelection) {
      return routeFromChamberSelection(
        chamberSelection,
        energy,
        memberState,
        recommendedCard,
      );
    }
    return routeFromNeed(immediate, {
      text,
      energy,
      memberState,
      recommendedCard,
      chamberSelection,
    });
  }

  const contextual = selectChamberJourneySupport({ snapshot });
  if (contextual) {
    return routeFromChamberSelection(
      contextual,
      energy,
      memberState,
      recommendedCard,
    );
  }

  return null;
}

export function sparkEstateIntelligenceRoutingHint(): string {
  return (
    "SPARK ESTATE INTELLIGENCE ROUTING: Understand first — never ask which room. " +
    "Route by immediate need, member state, energy, and context. " +
    SPARK_ESTATE_ROUTING_PRINCIPLE
  );
}

export function buildSparkEstateIntelligenceRoutingCompanionHint(input?: {
  text?: string;
  currentSection?: AppSection;
}): string | null {
  const text = input?.text?.trim() ?? "";
  if (!text) return null;

  const route = resolveSparkEstateIntelligenceRoute({
    text,
    currentSection: input?.currentSection,
  });
  if (!route) return null;

  const lines = [sparkEstateIntelligenceRoutingHint()];

  if (route.source === "clarify" && route.memberQuestion) {
    lines.push(
      `Ask first: "${route.memberQuestion}" — never ask which room.`,
    );
  } else {
    const destination = route.section ? ` (${route.section})` : "";
    lines.push(`Route ${route.need} via ${route.intelligence}${destination}.`);
  }

  if (route.useUniversalCreationJourney) {
    lines.push("Use Universal Creation Journey — Understand through Remember.");
  }
  if (route.energy === "low") {
    lines.push("Low energy — prefer smaller actions, encouragement, and simple choices.");
  }
  if (route.recommendedCard) {
    lines.push(`Suggested card: ${route.recommendedCard}.`);
  }

  return lines.join(" ");
}

export function formatSparkEstateIntelligenceRoutingReport(
  verification: ReturnType<typeof verifySparkEstateIntelligenceRouting> = verifySparkEstateIntelligenceRouting(),
): string {
  const lines: string[] = [
    `Spark Estate™ intelligence routing: ${verification.routesResolve ? "ALIGNED" : "GAPS"}`,
    SPARK_ESTATE_ROUTING_PRINCIPLE,
    SPARK_ESTATE_ROUTING_SUCCESS_TEST,
    "",
    "Routing priorities:",
    ...SPARK_ESTATE_ROUTING_PRIORITIES.map((priority) => `  • ${priority}`),
    "",
    "Routing factors:",
    ...SPARK_ESTATE_ROUTING_FACTORS.map((factor) => `  • ${factor}`),
    "",
    "Primary paths:",
  ];

  for (const need of verification.primaryPaths) {
    const route = SPARK_ESTATE_PRIMARY_ROUTES[need];
    lines.push(
      `  ${need} → ${route.intelligence} (${route.defaultSection})`,
      `    ${route.purpose}`,
    );
  }

  lines.push(
    "",
    SPARK_ESTATE_ROOM_INDEPENDENCE_RULE,
    SPARK_ESTATE_LANGUAGE_ROUTING_RULE,
    "",
    "Integration checks:",
    `  Routes resolve: ${verification.routesResolve ? "pass" : "fail"}`,
    `  Clarify before room: ${verification.clarifyBeforeRoom ? "pass" : "fail"}`,
    `  Energy adaptation: ${verification.energyAdaptation ? "pass" : "fail"}`,
    `  Room independence: ${verification.roomIndependence ? "pass" : "fail"}`,
    `  Card kinds: ${verification.cardKinds.join(", ")}`,
  );

  return lines.join("\n");
}

export function verifySparkEstateIntelligenceRouting(): {
  primaryPaths: SparkEstateImmediateNeed[];
  cardKinds: SparkEstateCardKind[];
  routesResolve: boolean;
  clarifyBeforeRoom: boolean;
  energyAdaptation: boolean;
  roomIndependence: boolean;
} {
  const samples: Array<{ text: string; need: SparkEstateImmediateNeed }> = [
    { text: "I have too much in my head", need: "clear-mind" },
    { text: "I'm stuck on my website", need: "move-forward" },
    { text: "Teach me marketing", need: "learn" },
    { text: "Help me write an email", need: "create" },
    { text: "Help me finish my project", need: "execute" },
    { text: "I have two choices", need: "decide" },
  ];

  const routesResolve = samples.every((sample) => {
    const route = resolveSparkEstateIntelligenceRoute({ text: sample.text });
    return route?.need === sample.need;
  });

  const clarifyRoute = resolveSparkEstateIntelligenceRoute({
    text: "I need help with my business",
  });
  const clarifyBeforeRoom =
    clarifyRoute?.source === "clarify" &&
    clarifyRoute.memberQuestion === SPARK_ESTATE_CLARIFY_QUESTION &&
    clarifyRoute.section === null;

  const lowEnergyRoute = resolveSparkEstateIntelligenceRoute({
    text: "I'm tired and stuck",
  });
  const energyAdaptation =
    lowEnergyRoute?.energy === "low" && lowEnergyRoute.section === "brain-dump";

  const roomRoute = resolveSparkEstateIntelligenceRoute({
    text: "I don't know where to start",
    currentSection: "content-generator",
  });
  const roomIndependence =
    roomRoute?.need === "move-forward" &&
    /momentum/i.test(roomRoute.intelligence);

  return {
    primaryPaths: Object.keys(PRIMARY_ROUTES) as SparkEstateImmediateNeed[],
    cardKinds: ["momentum-card", "spark-card", "knowledge-card", "project-card", "reflection-card", "win-card"],
    routesResolve,
    clarifyBeforeRoom,
    energyAdaptation,
    roomIndependence,
  };
}

export function stageSparkEstateIntelligenceRoute(
  route: SparkEstateIntelligenceRoute,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      SPARK_ESTATE_ROUTING_SESSION_KEY,
      JSON.stringify(route),
    );
  } catch {
    /* quota */
  }
}

export function consumeSparkEstateIntelligenceRoute(): SparkEstateIntelligenceRoute | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SPARK_ESTATE_ROUTING_SESSION_KEY);
    sessionStorage.removeItem(SPARK_ESTATE_ROUTING_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SparkEstateIntelligenceRoute;
  } catch {
    return null;
  }
}
