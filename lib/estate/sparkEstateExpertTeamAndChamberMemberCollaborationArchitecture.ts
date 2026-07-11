/**
 * Spark Estate — expert team and chamber member collaboration architecture (Phase 33).
 * One trusted companion coordinates specialized intelligence behind the scenes.
 *
 * @see docs/protocols/SPARK_ESTATE_EXPERT_TEAM_AND_CHAMBER_MEMBER_COLLABORATION_ARCHITECTURE_PHASE33.md
 */

import type { AppSection } from "@/lib/companionUi";
import { verifySparkEstateAnalyticsAndLearningSystem } from "./sparkEstateAnalyticsAndLearningSystem";
import {
  SPARK_ESTATE_SHARI_TRAITS,
  verifySparkEstateConversationEngine,
} from "./sparkEstateConversationEngine";
import { assessSparkEstateProjectIntelligenceNeeds } from "./sparkEstateIntelligentProjectLifecycleEngine";
import {
  resolveSparkEstateIntelligenceRoute,
  verifySparkEstateIntelligenceRouting,
} from "./sparkEstateIntelligenceRoutingMap";
import {
  SPARK_ESTATE_ROOM_EXPERTISE,
  verifySparkEstateRoomIntelligenceArchitecture,
} from "./sparkEstateRoomIntelligenceArchitecture";

export const SPARK_ESTATE_EXPERT_COLLABORATION_PRINCIPLE =
  "One trusted companion — many specialized experts behind the scenes. The member does not manage the team; Spark coordinates it.";

export const SPARK_ESTATE_EXPERT_COLLABORATION_VISION =
  "The warmth of one companion, the capability of many experts, the organization of a team, and the simplicity of one experience.";

export const SPARK_ESTATE_EXPERT_COLLABORATION_SUCCESS_TEST =
  "I have a team helping me — not I have to manage a team.";

export const SPARK_ESTATE_EXPERT_TEAM_MODEL = [
  "The member explains what they need.",
  "Spark determines what expertise is needed.",
  "Spark determines when it is needed.",
  "Spark determines how much support is needed.",
] as const;

export const SPARK_ESTATE_PRIMARY_COMPANION_RESPONSIBILITIES = [
  "relationship",
  "communication",
  "guidance",
  "encouragement",
  "coordination",
] as const;

export const SPARK_ESTATE_CHAMBER_MEMBER_ROLE_FIELDS = [
  "identity",
  "expertise",
  "contribution",
  "boundaries",
] as const;

export const SPARK_ESTATE_EXPERT_ACTIVATION_QUESTION =
  "What expertise creates the most value right now?";

export const SPARK_ESTATE_EXPERT_HANDOFF_LANGUAGE_USE = [
  "I think bringing in some marketing strategy support would help us here.",
] as const;

export const SPARK_ESTATE_EXPERT_HANDOFF_LANGUAGE_AVOID = [
  "You need to switch assistants.",
] as const;

export const SPARK_ESTATE_EXPERT_MEMBER_EXPERIENCE_SHOULD = [
  "Spark is helping me.",
] as const;

export const SPARK_ESTATE_EXPERT_MEMBER_EXPERIENCE_AVOID = [
  "Five different assistants are talking.",
] as const;

export const SPARK_ESTATE_EXPERT_INTERNAL_COLLABORATION = {
  expertsProvide: [
    "recommendations",
    "frameworks",
    "questions",
    "drafts",
    "analysis",
  ],
  sparkDecides: ["what to present", "when to present it", "how to explain it"],
} as const;

export const SPARK_ESTATE_EXPERT_COLLABORATION_AVOID = [
  "competing personalities",
  "conflicting recommendations",
  "duplicate workflows",
  "expert overload",
] as const;

export const SPARK_ESTATE_CHAMBER_COORDINATED_WORKSPACE = {
  label: "Chamber of Momentum",
  bringsTogether: [
    "planning",
    "expertise",
    "progress tracking",
    "completion support",
  ],
  especiallyUsefulFor: [
    "larger projects",
    "complex decisions",
    "multi-step creations",
  ],
} as const;

export const SPARK_ESTATE_EXPERT_MEMORY_KEY = "spark-estate-expert-collab-prefs-v1";

export type SparkEstateExpertIntelligenceId =
  | "momentum"
  | "marketing"
  | "content"
  | "project"
  | "research"
  | "data";

export type SparkEstateExpertTeamMember = {
  id: SparkEstateExpertIntelligenceId;
  label: string;
  identity: string;
  expertise: readonly string[];
  contribution: string;
  boundaries: readonly string[];
};

export const SPARK_ESTATE_EXPERT_TEAM_MEMBERS: readonly SparkEstateExpertTeamMember[] = [
  {
    id: "momentum",
    label: "Momentum Intelligence",
    identity: "Progress and forward movement partner.",
    expertise: ["clarity", "next steps", "overcoming blocks", "progress"],
    contribution: "Help the member see the next step and regain momentum.",
    boundaries: ["does not own full campaign strategy", "does not own deep research reports"],
  },
  {
    id: "marketing",
    label: "Marketing Intelligence",
    identity: "Audience and growth strategy partner.",
    expertise: ["audience", "messaging", "offers", "campaigns", "funnels"],
    contribution: "Shape audience, offer, and funnel strategy.",
    boundaries: ["does not own project milestone tracking", "does not replace Shari voice"],
  },
  {
    id: "content",
    label: "Content Intelligence",
    identity: "Writing and communication partner.",
    expertise: ["writing", "editing", "content planning", "communication"],
    contribution: "Draft and refine emails, copy, and content assets.",
    boundaries: ["does not own entrepreneurial curriculum depth", "does not own analytics dashboards"],
  },
  {
    id: "project",
    label: "Project Intelligence",
    identity: "Organization and completion partner.",
    expertise: ["organization", "milestones", "timelines", "completion"],
    contribution: "Structure milestones, timelines, and completion paths.",
    boundaries: ["does not own marketing funnel strategy alone", "does not replace companion relationship"],
  },
  {
    id: "research",
    label: "Research Intelligence",
    identity: "Understanding and analysis partner.",
    expertise: [
      "information gathering",
      "analysis",
      "comparisons",
      "learning",
    ],
    contribution: "Gather, compare, and summarize information before building.",
    boundaries: ["does not own execution task lists", "does not own marketing copy drafting"],
  },
  {
    id: "data",
    label: "Data Intelligence",
    identity: "Measurement and improvement partner.",
    expertise: ["measurement", "insights", "improvement"],
    contribution: "Surface patterns, friction, and improvement opportunities.",
    boundaries: ["does not replace human judgment", "does not create competing personalities"],
  },
] as const;

export type SparkEstateExpertCollaborationMemory = {
  helpfulExperts: SparkEstateExpertIntelligenceId[];
  collaborationStyle?: "guided" | "light-touch";
  updatedAt: string;
};

export type SparkEstateExpertTeamActivation = {
  activatedExperts: SparkEstateExpertIntelligenceId[];
  primaryExpert: SparkEstateExpertIntelligenceId;
  handoffSuggestion: string | null;
  smallestHelpfulTeam: boolean;
  memberExperience: string;
};

export type SparkEstateExpertCollaborationPlan = {
  request: string;
  activatedExperts: SparkEstateExpertTeamMember[];
  primaryCompanion: string;
  chamberRecommended: boolean;
  internalSupport: string[];
  presentationGuidance: string;
};

const EXPERT_KEYWORD_PATTERNS: Record<SparkEstateExpertIntelligenceId, RegExp> = {
  momentum: /\b(?:stuck|next step|progress|momentum|block|clarity|move forward)\b/i,
  marketing: /\b(?:funnel|marketing|messaging|campaign|offer|audience)\b/i,
  content: /\b(?:email|copy|blog|content|write|newsletter|communication)\b/i,
  project: /\b(?:milestone|project|plan|task|timeline|organize|completion|workshop)\b/i,
  research: /\b(?:research|analyze|compare|learn|understand|study|information)\b/i,
  data: /\b(?:measure|metric|analytics|insight|improvement|retention|data)\b/i,
};

let expertCollaborationMemoryFallback: SparkEstateExpertCollaborationMemory | null = null;

function readExpertCollaborationMemory(): SparkEstateExpertCollaborationMemory | null {
  if (typeof window === "undefined") return expertCollaborationMemoryFallback;
  try {
    const raw = localStorage.getItem(SPARK_ESTATE_EXPERT_MEMORY_KEY);
    if (!raw) return expertCollaborationMemoryFallback;
    const parsed = JSON.parse(raw) as SparkEstateExpertCollaborationMemory;
    if (!parsed || typeof parsed.updatedAt !== "string") {
      return expertCollaborationMemoryFallback;
    }
    return parsed;
  } catch {
    return expertCollaborationMemoryFallback;
  }
}

function writeExpertCollaborationMemory(
  memory: Omit<SparkEstateExpertCollaborationMemory, "updatedAt">,
): SparkEstateExpertCollaborationMemory {
  const next: SparkEstateExpertCollaborationMemory = {
    ...memory,
    updatedAt: new Date().toISOString(),
  };
  expertCollaborationMemoryFallback = next;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SPARK_ESTATE_EXPERT_MEMORY_KEY, JSON.stringify(next));
    } catch {
      /* quota */
    }
  }
  return next;
}

export function recordSparkEstateExpertCollaborationPreference(input: {
  helpfulExperts: SparkEstateExpertIntelligenceId[];
  collaborationStyle?: "guided" | "light-touch";
}): SparkEstateExpertCollaborationMemory {
  return writeExpertCollaborationMemory({
    helpfulExperts: [...new Set(input.helpfulExperts)],
    collaborationStyle: input.collaborationStyle,
  });
}

export function getSparkEstateExpertCollaborationMemory(): SparkEstateExpertCollaborationMemory | null {
  return readExpertCollaborationMemory();
}

function expertMember(id: SparkEstateExpertIntelligenceId): SparkEstateExpertTeamMember {
  const member = SPARK_ESTATE_EXPERT_TEAM_MEMBERS.find((entry) => entry.id === id);
  if (!member) {
    throw new Error(`Unknown expert intelligence: ${id}`);
  }
  return member;
}

function scoreExperts(text: string): Map<SparkEstateExpertIntelligenceId, number> {
  const scores = new Map<SparkEstateExpertIntelligenceId, number>();
  for (const member of SPARK_ESTATE_EXPERT_TEAM_MEMBERS) {
    if (EXPERT_KEYWORD_PATTERNS[member.id].test(text)) {
      scores.set(member.id, (scores.get(member.id) ?? 0) + 1);
    }
    for (const term of member.expertise) {
      if (text.toLowerCase().includes(term.toLowerCase())) {
        scores.set(member.id, (scores.get(member.id) ?? 0) + 1);
      }
    }
  }
  return scores;
}

export function resolveSparkEstateExpertTeamActivation(
  text: string,
): SparkEstateExpertTeamActivation {
  const normalized = text.trim();
  const memory = readExpertCollaborationMemory();

  if (/\bsales funnel\b/i.test(normalized)) {
    const activatedExperts: SparkEstateExpertIntelligenceId[] = [
      "marketing",
      "content",
      "project",
      "momentum",
    ];
    return {
      activatedExperts,
      primaryExpert: "marketing",
      handoffSuggestion: buildSparkEstateExpertHandoffLanguage("marketing"),
      smallestHelpfulTeam: activatedExperts.length <= 4,
      memberExperience: SPARK_ESTATE_EXPERT_MEMBER_EXPERIENCE_SHOULD[0],
    };
  }

  const scores = scoreExperts(normalized);
  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  const route = resolveSparkEstateIntelligenceRoute({ text: normalized });

  let activatedExperts = ranked
    .filter(([, score]) => score > 0)
    .map(([id]) => id);

  if (activatedExperts.length === 0) {
    if (route?.need === "move-forward" || route?.need === "execute") {
      activatedExperts = ["momentum"];
    } else if (route?.need === "learn") {
      activatedExperts = ["research"];
    } else if (route?.need === "create") {
      activatedExperts = ["content"];
    } else {
      activatedExperts = ["momentum"];
    }
  }

  const isComplex =
    /\b(?:funnel|workshop|campaign|project|multi-?step)\b/i.test(normalized) ||
    activatedExperts.length > 2;
  const maxExperts = isComplex ? 4 : 2;
  activatedExperts = activatedExperts.slice(0, maxExperts);

  if (
    memory?.helpfulExperts.length &&
    activatedExperts.length < maxExperts
  ) {
    for (const expert of memory.helpfulExperts) {
      if (!activatedExperts.includes(expert)) {
        activatedExperts.push(expert);
      }
      if (activatedExperts.length >= maxExperts) break;
    }
  }

  const primaryExpert = activatedExperts[0] ?? "momentum";
  const handoffExpert = activatedExperts.find((id) => id !== primaryExpert) ?? null;

  return {
    activatedExperts,
    primaryExpert,
    handoffSuggestion: handoffExpert
      ? buildSparkEstateExpertHandoffLanguage(handoffExpert)
      : null,
    smallestHelpfulTeam: activatedExperts.length <= maxExperts,
    memberExperience: SPARK_ESTATE_EXPERT_MEMBER_EXPERIENCE_SHOULD[0],
  };
}

export function buildSparkEstateExpertHandoffLanguage(
  expertId: SparkEstateExpertIntelligenceId,
): string {
  const member = expertMember(expertId);
  const focus = member.expertise[0] ?? "specialized";
  return `I think bringing in some ${focus} support would help us here.`;
}

export function buildSparkEstateExpertCollaborationPlan(input: {
  text: string;
  currentSection?: AppSection;
}): SparkEstateExpertCollaborationPlan {
  const text = input.text.trim();
  const activation = resolveSparkEstateExpertTeamActivation(text);
  const lifecycleNeeds = assessSparkEstateProjectIntelligenceNeeds(text);
  const chamberRecommended =
    activation.activatedExperts.length >= 3 ||
    /\b(?:workshop|funnel|larger project|complex decision)\b/i.test(text);

  return {
    request: text,
    activatedExperts: activation.activatedExperts.map((id) => expertMember(id)),
    primaryCompanion: "Shari voice — one consistent companion coordinates the team.",
    chamberRecommended,
    internalSupport: lifecycleNeeds,
    presentationGuidance:
      `${SPARK_ESTATE_EXPERT_INTERNAL_COLLABORATION.sparkDecides.join(", ")} — ` +
      `present as "${SPARK_ESTATE_EXPERT_MEMBER_EXPERIENCE_SHOULD[0]}"`,
  };
}

export function assessSparkEstateExpertCollaborationCompliance(): {
  principleReady: boolean;
  expertTeamReady: boolean;
  companionRoleReady: boolean;
  chamberMemberRolesReady: boolean;
  activationRulesReady: boolean;
  handoffLanguageReady: boolean;
  chamberWorkspaceReady: boolean;
  avoidListReady: boolean;
  conversationBridgeReady: boolean;
  roomIntelligenceBridgeReady: boolean;
  routingBridgeReady: boolean;
  projectLifecycleBridgeReady: boolean;
  analyticsBridgeReady: boolean;
} {
  const conversation = verifySparkEstateConversationEngine();
  const rooms = verifySparkEstateRoomIntelligenceArchitecture();
  const routing = verifySparkEstateIntelligenceRouting();
  const analytics = verifySparkEstateAnalyticsAndLearningSystem();
  const funnelActivation = resolveSparkEstateExpertTeamActivation(
    "I need to create a sales funnel.",
  );

  return {
    principleReady: SPARK_ESTATE_EXPERT_COLLABORATION_PRINCIPLE.includes(
      "Spark coordinates",
    ),
    expertTeamReady: SPARK_ESTATE_EXPERT_TEAM_MEMBERS.length === 6,
    companionRoleReady:
      SPARK_ESTATE_PRIMARY_COMPANION_RESPONSIBILITIES.length === 5 &&
      conversation.voiceConsistent,
    chamberMemberRolesReady: SPARK_ESTATE_CHAMBER_MEMBER_ROLE_FIELDS.length === 4,
    activationRulesReady: Boolean(SPARK_ESTATE_EXPERT_ACTIVATION_QUESTION),
    handoffLanguageReady:
      SPARK_ESTATE_EXPERT_HANDOFF_LANGUAGE_USE.length === 1 &&
      SPARK_ESTATE_EXPERT_HANDOFF_LANGUAGE_AVOID.length === 1,
    chamberWorkspaceReady:
      SPARK_ESTATE_CHAMBER_COORDINATED_WORKSPACE.bringsTogether.length === 4,
    avoidListReady: SPARK_ESTATE_EXPERT_COLLABORATION_AVOID.length === 4,
    conversationBridgeReady:
      conversation.traits.length === SPARK_ESTATE_SHARI_TRAITS.length,
    roomIntelligenceBridgeReady: rooms.expertiseGroups === 6,
    routingBridgeReady: routing.routesResolve,
    projectLifecycleBridgeReady:
      funnelActivation.activatedExperts.length === 4 &&
      assessSparkEstateProjectIntelligenceNeeds("I need to create a sales funnel.")
        .length === 4,
    analyticsBridgeReady: analytics.analyticsReady,
  };
}

export function verifySparkEstateExpertTeamAndChamberMemberCollaboration(): {
  experts: number;
  collaborationReady: boolean;
  smallestTeamReady: boolean;
  successTestReady: boolean;
} {
  const savedMemory = expertCollaborationMemoryFallback;
  expertCollaborationMemoryFallback = null;
  try {
    const funnel = resolveSparkEstateExpertTeamActivation(
      "I need to create a sales funnel.",
    );
    const simple = resolveSparkEstateExpertTeamActivation("I'm stuck on my next step.");
    const compliance = assessSparkEstateExpertCollaborationCompliance();

    return {
      experts: SPARK_ESTATE_EXPERT_TEAM_MEMBERS.length,
      collaborationReady:
        Object.values(compliance).every(Boolean) &&
        funnel.activatedExperts.length === 4,
      smallestTeamReady:
        simple.activatedExperts.length <= 2 && simple.smallestHelpfulTeam,
      successTestReady: SPARK_ESTATE_EXPERT_COLLABORATION_SUCCESS_TEST.includes(
        "team helping me",
      ),
    };
  } finally {
    expertCollaborationMemoryFallback = savedMemory;
  }
}

export function sparkEstateExpertCollaborationCompanionHint(input?: {
  text?: string;
}): string | null {
  const text = input?.text?.trim() ?? "";
  if (
    !text ||
    !/(?:expert|team|collaborat|sales funnel|marketing support|bring in|specialized|chamber)/i.test(
      text,
    )
  ) {
    return null;
  }

  const plan = buildSparkEstateExpertCollaborationPlan({ text });
  const experts = plan.activatedExperts.map((member) => member.label).join(", ");
  return (
    `SPARK ESTATE EXPERT TEAM: ${SPARK_ESTATE_EXPERT_COLLABORATION_PRINCIPLE} ` +
    `Activate smallest helpful team: ${experts || "momentum support"}. ` +
    `${SPARK_ESTATE_EXPERT_ACTIVATION_QUESTION} ` +
    `Present as one companion — never ${SPARK_ESTATE_EXPERT_HANDOFF_LANGUAGE_AVOID[0].toLowerCase()}`
  );
}

export function formatSparkEstateExpertCollaborationReport(
  verification: ReturnType<
    typeof verifySparkEstateExpertTeamAndChamberMemberCollaboration
  > = verifySparkEstateExpertTeamAndChamberMemberCollaboration(),
  compliance: ReturnType<typeof assessSparkEstateExpertCollaborationCompliance> = assessSparkEstateExpertCollaborationCompliance(),
): string {
  const funnel = buildSparkEstateExpertCollaborationPlan({
    text: "I need to create a sales funnel.",
  });

  const lines: string[] = [
    `Spark Estate expert collaboration: ${verification.collaborationReady ? "ALIGNED" : "GAPS"}`,
    SPARK_ESTATE_EXPERT_COLLABORATION_PRINCIPLE,
    SPARK_ESTATE_EXPERT_COLLABORATION_VISION,
    SPARK_ESTATE_EXPERT_COLLABORATION_SUCCESS_TEST,
    "",
    "Expert team members:",
  ];

  for (const member of SPARK_ESTATE_EXPERT_TEAM_MEMBERS) {
    lines.push(`  ${member.label}`);
    lines.push(`    Identity: ${member.identity}`);
    lines.push(`    Expertise: ${member.expertise.join(", ")}`);
    lines.push(`    Boundaries: ${member.boundaries.join("; ")}`);
  }

  lines.push("", "Primary companion responsibilities:");
  for (const responsibility of SPARK_ESTATE_PRIMARY_COMPANION_RESPONSIBILITIES) {
    lines.push(`  • ${responsibility}`);
  }

  lines.push("", "Sales funnel collaboration example:");
  lines.push(`  Experts: ${funnel.activatedExperts.map((member) => member.label).join(", ")}`);
  lines.push(`  Chamber recommended: ${funnel.chamberRecommended ? "yes" : "no"}`);

  lines.push("", "Handoff language:");
  lines.push(`  Use: ${SPARK_ESTATE_EXPERT_HANDOFF_LANGUAGE_USE[0]}`);
  lines.push(`  Avoid: ${SPARK_ESTATE_EXPERT_HANDOFF_LANGUAGE_AVOID[0]}`);

  lines.push("", "Chamber coordinated workspace:");
  lines.push(`  ${SPARK_ESTATE_CHAMBER_COORDINATED_WORKSPACE.label}`);
  lines.push(
    `  Brings together: ${SPARK_ESTATE_CHAMBER_COORDINATED_WORKSPACE.bringsTogether.join(", ")}`,
  );

  lines.push("", "Avoid:");
  for (const item of SPARK_ESTATE_EXPERT_COLLABORATION_AVOID) {
    lines.push(`  ✗ ${item}`);
  }

  lines.push("", "Room expertise bridge:");
  for (const roomId of Object.keys(SPARK_ESTATE_ROOM_EXPERTISE)) {
    lines.push(`  ${SPARK_ESTATE_ROOM_EXPERTISE[roomId as keyof typeof SPARK_ESTATE_ROOM_EXPERTISE].label}`);
  }

  lines.push("", "Compliance checks:");
  lines.push(`  Expert team: ${compliance.expertTeamReady ? "pass" : "fail"}`);
  lines.push(`  Conversation bridge: ${compliance.conversationBridgeReady ? "pass" : "fail"}`);
  lines.push(`  Routing bridge: ${compliance.routingBridgeReady ? "pass" : "fail"}`);
  lines.push(`  Project lifecycle bridge: ${compliance.projectLifecycleBridgeReady ? "pass" : "fail"}`);
  lines.push(`  Smallest helpful team: ${verification.smallestTeamReady ? "pass" : "fail"}`);

  return lines.join("\n");
}
