// Companion Intelligence Layer — multi-message understanding, discovery, invisible advisors.

import type { EmotionalObstacle, EmotionalState } from "./companionEmotions";
import {
  classifyUserMessage,
  hasClearEmotionalSignal,
  isContentBrainstorming,
  isOrdinaryTaskLanguage,
  isPracticalTaskFriction,
  shouldSuppressEmotionalTools,
} from "./messageClassification";
import type { AppSection } from "./companionUi";
import { hasConcreteWorkspaceTarget } from "./workspaceMode";

export type ChatTurn = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type DiscoveryPhase =
  | "none"
  | "issue"
  | "factors"
  | "advisor"
  | "ready";

export type ProblemType =
  | "overwhelm"
  | "boredom"
  | "low_energy"
  | "decision_fatigue"
  | "organization"
  | "marketing"
  | "business_growth"
  | "content_creation"
  | "avoidance"
  | "perfectionism"
  | "anxiety"
  | "unclear";

export type AdvisorType =
  | "adhd_coach"
  | "organization_advisor"
  | "business_strategist"
  | "marketing_strategist"
  | "content_creator"
  | "wellness_guide"
  | "deep_dive_companion"
  | "general_companion";

export type RecurringTopic = {
  id: string;
  label: string;
  mentionCount: number;
};

export type CompanionIntelligenceInput = {
  messages: ChatTurn[];
  text: string;
  lastAssistantText: string;
  state: EmotionalState;
  obstacle: EmotionalObstacle | null;
  somatic: boolean;
  askingHow: boolean;
  workspaceOpen?: boolean;
};

export type CompanionIntelligence = {
  discoveryPhase: DiscoveryPhase;
  shouldDeferTools: boolean;
  problemType: ProblemType;
  advisor: AdvisorType;
  recurringTopics: RecurringTopic[];
  threadConnection: string | null;
};

const EMOTIONAL_DISCOVERY_TRIGGER_RE =
  /\b(overwhelm|overwhelmed|bored|boring|unmotivated|not motivated|no motivation|can'?t get motivated|low energy|no energy|can'?t focus|cannot focus|too many (?:things|choices)|avoiding|procrastinat|frozen|can'?t start|exhausted|drained|frustrated|anxious|stressed|worried|frazzled)\b/i;

function matchesEmotionalDiscoveryTrigger(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (shouldSuppressEmotionalTools(t)) return false;
  if (isOrdinaryTaskLanguage(t) || isPracticalTaskFriction(t)) return false;
  if (isContentBrainstorming(t) && !hasClearEmotionalSignal(t)) return false;
  if (EMOTIONAL_DISCOVERY_TRIGGER_RE.test(t)) return true;
  if (/\b(stuck|frozen)\b/i.test(t) && hasClearEmotionalSignal(t)) return true;
  if (/\bdon'?t know what to do\b/i.test(t) && hasClearEmotionalSignal(t)) {
    return true;
  }
  return false;
}

const DISCOVERY_ISSUE_Q_RE =
  /\b(is the (?:problem|issue)|what feels|does (?:the )?work feel|too big|pointless|low on energy|which feels|is it more|or are you|what kind of|what'?s making|weighing on you most|help me understand|what'?s going on)\b/i;

const DISCOVERY_FACTORS_Q_RE =
  /\b(contributing|what else|making it harder|getting in the way|factors|besides that|anything else|what'?s underneath|root of|keeping it)\b/i;

const DISCOVERY_PATHS_RE =
  /\b(we could|one (?:path|option)|another (?:path|option)|two paths|three paths|or we could|lower the bar|tiny action|smallest step|which (?:of these|feels|path))\b/i;

const READY_FOR_TOOL_RE =
  /\b(let'?s do (?:it|that)|start (?:the )?timer|clear my mind|brain dump|spin the wheel|yes,?(?: let'?s)?|ready to start|i'?m ready|help me (?:draft|write|do))\b/i;

const TOPIC_PATTERNS: { id: string; label: string; re: RegExp }[] = [
  {
    id: "inbox",
    label: "inbox",
    re: /\b(inbox|keeping it cleared|clearing my inbox|cleared my inbox)\b/i,
  },
  { id: "email", label: "email", re: /\bemails?\b/i },
  {
    id: "energy",
    label: "low energy",
    re: /\b(low energy|exhausted|tired|can'?t get started|no energy|drained)\b/i,
  },
  { id: "marketing", label: "marketing", re: /\b(marketing|launch|promot|campaign)\b/i },
  {
    id: "content",
    label: "content",
    re: /\b(content|post|linkedin|social|write|draft)\b/i,
  },
  {
    id: "organization",
    label: "organization",
    re: /\b(organiz|clutter|sort|pile|clear|messy|behind on)\b/i,
  },
  {
    id: "avoidance",
    label: "avoidance",
    re: /\b(avoid|procrastinat|putting off|can'?t make myself)\b/i,
  },
];

const ADVISOR_FOR_PROBLEM: Record<ProblemType, AdvisorType> = {
  overwhelm: "adhd_coach",
  boredom: "adhd_coach",
  low_energy: "wellness_guide",
  decision_fatigue: "adhd_coach",
  organization: "organization_advisor",
  marketing: "marketing_strategist",
  business_growth: "business_strategist",
  content_creation: "content_creator",
  avoidance: "adhd_coach",
  perfectionism: "adhd_coach",
  anxiety: "wellness_guide",
  unclear: "general_companion",
};

const ADVISOR_VOICE: Record<AdvisorType, string> = {
  adhd_coach:
    "ADHD Coach (invisible): normalize executive-function friction; one small step; no shame or hustle.",
  organization_advisor:
    "Organization Advisor (invisible): sort, capture, prioritize; reduce visible pile before optimizing.",
  business_strategist:
    "Business Strategist (invisible): clarify goals, tradeoffs, and next business move — not therapy.",
  marketing_strategist:
    "Marketing Strategist (invisible): audience, message, channel — practical growth thinking.",
  content_creator:
    "Content Creator (invisible): shape ideas into drafts; route to Create when they want output.",
  wellness_guide:
    "Wellness Guide (invisible): energy, capacity, pacing — not medical advice; suggest rest or smaller scope.",
  deep_dive_companion:
    "Deep Dive Companion (invisible): slow exploratory conversation; stay in chat until clarity emerges.",
  general_companion:
    "Companion (invisible): warm, curious, one question at a time — understand before solving.",
};

export function analyzeRecurringTopics(userMessages: string[]): RecurringTopic[] {
  const counts = new Map<string, RecurringTopic>();
  for (const msg of userMessages) {
    const seen = new Set<string>();
    for (const { id, label, re } of TOPIC_PATTERNS) {
      if (re.test(msg) && !seen.has(id)) {
        seen.add(id);
        const prev = counts.get(id);
        counts.set(id, {
          id,
          label,
          mentionCount: (prev?.mentionCount ?? 0) + 1,
        });
      }
    }
  }
  return [...counts.values()]
    .filter((t) => t.mentionCount >= 1)
    .sort((a, b) => b.mentionCount - a.mentionCount);
}

export function buildThreadConnection(topics: RecurringTopic[]): string | null {
  const recurring = topics.filter((t) => t.mentionCount >= 2);
  if (!recurring.length) return null;
  const top = recurring[0]!;
  if (top.id === "inbox") {
    return `Thread: user mentioned their inbox ${top.mentionCount} times. Connect explicitly — e.g. "You've mentioned your inbox a couple of times — is clearing it one of the things on your mind right now?"`;
  }
  if (top.id === "energy") {
    return `Thread: low energy came up ${top.mentionCount} times. Link to other topics they raised — don't treat this message in isolation.`;
  }
  return `Thread: "${top.label}" appeared ${top.mentionCount} times across messages. Reference the pattern before suggesting solutions.`;
}

function discoveryDepth(messages: ChatTurn[]): number {
  let depth = 0;
  for (const m of messages) {
    if (m.role !== "assistant") continue;
    if (DISCOVERY_ISSUE_Q_RE.test(m.content)) depth = Math.max(depth, 1);
    if (DISCOVERY_FACTORS_Q_RE.test(m.content)) depth = Math.max(depth, 2);
    if (DISCOVERY_PATHS_RE.test(m.content)) depth = Math.max(depth, 3);
  }
  return depth;
}

function inDiscoveryThread(messages: ChatTurn[]): boolean {
  const userTexts = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content);
  if (userTexts.some((t) => matchesEmotionalDiscoveryTrigger(t))) return true;
  return messages.some(
    (m) =>
      m.role === "assistant" &&
      (DISCOVERY_ISSUE_Q_RE.test(m.content) ||
        DISCOVERY_FACTORS_Q_RE.test(m.content) ||
        DISCOVERY_PATHS_RE.test(m.content)),
  );
}

export function getDiscoveryPhase(
  input: CompanionIntelligenceInput,
): DiscoveryPhase {
  if (input.askingHow) return "none";
  if (shouldSuppressEmotionalTools(input.text)) return "none";
  if (hasConcreteWorkspaceTarget(input.text)) return "none";
  if (classifyUserMessage(input.text) === "practical_task") return "none";
  if (READY_FOR_TOOL_RE.test(input.text.trim())) return "ready";
  if (!inDiscoveryThread(input.messages)) return "none";

  const depth = discoveryDepth(input.messages);
  if (depth >= 3) return "ready";
  if (depth === 2) return "advisor";
  if (depth === 1) return "factors";
  return "issue";
}

export function classifyProblem(
  userMessages: string[],
  state: EmotionalState,
  obstacle: EmotionalObstacle | null,
): ProblemType {
  const combined = userMessages.join(" ").toLowerCase();
  const latest = userMessages[userMessages.length - 1] ?? "";

  if (/\b(inbox|organiz|clutter|sort|pile|messy|behind on)\b/.test(combined)) {
    return "organization";
  }
  if (obstacle === "overwhelm" || /\boverwhelm/.test(combined)) {
    return "overwhelm";
  }
  if (obstacle === "decision_conflict" || /\b(can'?t decide|too many choices)\b/.test(combined)) {
    return "decision_fatigue";
  }
  if (obstacle === "perfectionism" || /\bperfect/.test(combined)) {
    return "perfectionism";
  }
  if (obstacle === "activation_barrier" || /\bavoid|procrastinat/.test(combined)) {
    return "avoidance";
  }
  if (/\b(bored|unmotivated|no motivation)\b/.test(combined)) return "boredom";
  if (/\b(low energy|exhausted|drained|can'?t get started)\b/.test(combined)) {
    return "low_energy";
  }
  if (
    !shouldSuppressEmotionalTools(latest) &&
    /\b(anxious|stressed|worried|frustrated)\b/.test(combined)
  ) {
    return "anxiety";
  }
  if (/\b(marketing|launch|campaign|promot)\b/.test(combined)) return "marketing";
  if (/\b(grow|revenue|sales|clients|customers)\b/.test(combined)) {
    return "business_growth";
  }
  if (/\b(write|post|content|draft|linkedin|email)\b/.test(combined)) {
    return "content_creation";
  }
  if (state === "stuck") return "avoidance";
  if (state === "overwhelmed") return "overwhelm";
  return "unclear";
}

export function selectAdvisor(problem: ProblemType): AdvisorType {
  return ADVISOR_FOR_PROBLEM[problem];
}

export function buildCompanionIntelligence(
  input: CompanionIntelligenceInput,
): CompanionIntelligence {
  const userMessages = input.messages
    .filter((m) => m.role === "user")
    .map((m) => m.content);
  const recurringTopics = analyzeRecurringTopics(userMessages);
  const problemType = classifyProblem(
    userMessages,
    input.state,
    input.obstacle,
  );
  const discoveryPhase = getDiscoveryPhase(input);
  const shouldDeferTools =
    discoveryPhase !== "none" &&
    discoveryPhase !== "ready" &&
    !input.workspaceOpen;

  return {
    discoveryPhase,
    shouldDeferTools,
    problemType,
    advisor: selectAdvisor(problemType),
    recurringTopics,
    threadConnection: buildThreadConnection(recurringTopics),
  };
}

function discoveryHint(phase: DiscoveryPhase, userText: string): string | undefined {
  if (phase === "none" || phase === "ready") return undefined;

  const base =
    "DISCOVERY MODE (ACTIVE — conversation first, no tool buttons): " +
    "The user is always talking to Shari. Tools support the conversation — never hand off to software. ";

  if (phase === "issue") {
    return (
      `${base}Question 1 — understand the issue. User said: "${userText.slice(0, 80)}". ` +
      `Validate briefly. Ask ONE clarifying question about what kind of problem this is. No tools. No solutions yet.`
    );
  }
  if (phase === "factors") {
    return (
      `${base}Question 2 — contributing factors. They answered your first question. ` +
      `Ask ONE question about what else is making this hard (energy, environment, emotional load, avoidance, pressure). No tools yet.`
    );
  }
  return (
    `${base}Question 3 — paths before tools. Offer 2–3 possible paths in plain language. ` +
    `Ask which fits. Only mention a tool if one path clearly maps and they seem ready — never lead with a timer.`
  );
}

/** Full intelligence block for the chat API — thread, advisor, discovery, boundaries reminder. */
export function intelligenceHintForChat(
  intel: CompanionIntelligence,
  userText: string,
): string | undefined {
  const parts: string[] = [
    "COMPANION INTELLIGENCE: Understand before suggesting. Connect this message to the thread. One Shari — advisor routing is invisible.",
  ];

  if (intel.threadConnection) {
    parts.push(intel.threadConnection);
  }

  if (intel.recurringTopics.length) {
    const list = intel.recurringTopics
      .slice(0, 4)
      .map((t) => `${t.label} (${t.mentionCount}×)`)
      .join(", ");
    parts.push(`Recurring themes this conversation: ${list}.`);
  }

  parts.push(
    `Likely problem: ${intel.problemType.replace(/_/g, " ")}. ${ADVISOR_VOICE[intel.advisor]}`,
  );

  const discovery = discoveryHint(intel.discoveryPhase, userText);
  if (discovery) parts.push(discovery);

  if (intel.shouldDeferTools) {
    parts.push(
      "TOOL GATE: Do NOT suggest or open tools this turn. Stay in conversation.",
    );
  } else if (intel.discoveryPhase === "ready") {
    parts.push(
      "Discovery complete — if a tool genuinely helps, offer ONE path and bridge to assisted action when they agree.",
    );
  }

  return parts.join("\n");
}

/** Context-based tool gate — not keyword triggers alone. */
export function shouldDeferToolsFromIntelligence(
  intel: CompanionIntelligence,
): boolean {
  return intel.shouldDeferTools;
}

/** Map problem + readiness to a workspace when discovery is complete. */
export function suggestWorkspaceForProblem(
  problem: ProblemType,
  userText: string,
): AppSection | null {
  if (hasConcreteWorkspaceTarget(userText)) {
    const target = userText.toLowerCase();
    if (/\b(email|newsletter)\b/.test(target)) return "content-generator";
    if (/\b(post|linkedin|content)\b/.test(target)) return "content-generator";
    if (/\b(plan|marketing)\b/.test(target)) return "content-generator";
    if (/\b(workshop|project)\b/.test(target)) return "projects";
  }
  if (problem === "organization") return "brain-dump";
  if (problem === "content_creation") return "content-generator";
  if (problem === "marketing" || problem === "business_growth") return "projects";
  return null;
}
