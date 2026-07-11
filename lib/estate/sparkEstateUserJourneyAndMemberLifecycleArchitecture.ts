/**
 * Spark Estate — user journey and member lifecycle architecture (Phase 20).
 * The complete relationship between Spark and a member over time.
 *
 * @see docs/protocols/SPARK_ESTATE_USER_JOURNEY_AND_MEMBER_LIFECYCLE_ARCHITECTURE_PHASE20.md
 */

import { SPARK_ESTATE_CREATION_STEPS } from "@/lib/universalCreation/sparkEstateCreationJourney";
import { verifySparkEstateCreationJourney } from "@/lib/universalCreation/sparkEstateCreationJourney";
import { verifySparkEstateDailyCompanionExperience } from "./sparkEstateDailyCompanionExperience";
import {
  getSparkEstateMemberProfile,
  type SparkEstateMemberProfile,
} from "./sparkEstateMemberProfileEngine";
import {
  shouldApplySparkEstateOnboarding,
  verifySparkEstateOnboardingAndFirst7Days,
} from "./sparkEstateOnboardingAndFirst7DaysExperience";
import { SPARK_ESTATE_DAILY_SESSION_KEY } from "./sparkEstateDailyCompanionExperience";

export const SPARK_ESTATE_LIFECYCLE_PRINCIPLE =
  "The member journey is Discover → Connect → Create → Progress → Grow → Return — not sign up, use features, leave.";

export const SPARK_ESTATE_LIFECYCLE_VISION =
  "A companion that learns the member, remembers progress, and helps people continue moving forward.";

export const SPARK_ESTATE_LIFECYCLE_JOURNEY_HEADLINE =
  "Discover → Connect → Create → Progress → Grow → Return";

export const SPARK_ESTATE_MEMBER_LIFECYCLE_STAGES = [
  {
    id: "discovery",
    stage: 1,
    title: "Discovery",
    goal: "Help someone understand why Spark Estate may help them.",
    communicates: [
      "who it is for",
      "what problems it helps solve",
      "how it reduces friction",
      "how it helps ideas become action",
    ],
    avoid: ["feature overload", "complicated explanations", "technical language"],
    implementation: "welcome-home, estate arrival, Spark Estate guide",
  },
  {
    id: "onboarding",
    stage: 2,
    title: "Onboarding",
    goal: "Understand the member enough to personalize — learn naturally, not via long questionnaires.",
    gathers: [
      "name",
      "goals",
      "interests",
      "business information",
      "preferred support style",
      "current challenges",
    ],
    implementation: "lib/estate/sparkEstateOnboardingAndFirst7DaysExperience.ts",
  },
  {
    id: "first-experience",
    stage: 3,
    title: "First Experience",
    goal: 'Create an immediate feeling of value — "I already feel helped."',
    examples: [
      "capture an idea",
      "clarify a problem",
      "create a small plan",
      "complete a first action",
    ],
    implementation: "first-success onboarding stage, chamber entry, brain dump",
  },
  {
    id: "daily-companion",
    stage: 4,
    title: "Daily Companion Experience",
    goal: "Give the member a reason to return with adapted cards and next steps.",
    experiences: [
      "Spark Card",
      "Momentum Card",
      "progress reminder",
      "encouragement",
      "next step",
    ],
    adaptsTo: ["current goals", "recent activity", "energy", "priorities"],
    implementation: "lib/estate/sparkEstateDailyCompanionExperience.ts",
  },
  {
    id: "creation-journey",
    stage: 5,
    title: "Creation Journey",
    goal: "Use the universal creation process whenever the member creates something.",
    steps: SPARK_ESTATE_CREATION_STEPS.map((step) => step.id),
    implementation: "lib/universalCreation/sparkEstateCreationJourney.ts",
  },
  {
    id: "progress-relationship",
    stage: 6,
    title: "Progress Relationship",
    goal: 'Help members notice movement — "I am making progress."',
    tracks: ["completed work", "milestones", "wins", "lessons learned"],
    implementation:
      "chamber memory, growth wins, member profile progress history, completion system",
  },
  {
    id: "returning-member",
    stage: 7,
    title: "Returning Member Experience",
    goal: "Do not restart — use memory and continuity.",
    examples: [
      "Welcome back. You were working on your workshop.",
      "You completed your first milestone. Would you like to continue?",
    ],
    implementation:
      "daily companion continuity, estate memory, formatSparkEstateReturnToWorkLine",
  },
  {
    id: "growth-over-time",
    stage: 8,
    title: "Growth Over Time",
    goal: "Spark becomes better at suggesting, organizing, recommending, and adapting.",
    improves: [
      "suggesting next steps",
      "organizing information",
      "recommending resources",
      "adapting communication",
    ],
    implementation: "lib/estate/sparkEstateMemberProfileEngine.ts",
  },
] as const;

export type SparkEstateMemberLifecycleStageId =
  (typeof SPARK_ESTATE_MEMBER_LIFECYCLE_STAGES)[number]["id"];

export const SPARK_ESTATE_MEMBER_TRUST_RULES = [
  "Be transparent.",
  "Respect privacy.",
  "Allow editing member information.",
  "Avoid feeling intrusive.",
] as const;

export const SPARK_ESTATE_RE_ENGAGEMENT_WELCOME =
  "Welcome back. Let's see where you would like to start.";

export const SPARK_ESTATE_RE_ENGAGEMENT_AVOID = ["You are behind."];

export const SPARK_ESTATE_LIFECYCLE_LANGUAGE_RULES = [
  "The entire lifecycle supports translated interface text.",
  "Cards and conversations preserve personality and meaning across locales.",
  "Lifecycle stage behavior stays consistent regardless of language.",
] as const;

export const SPARK_ESTATE_LIFECYCLE_SUCCESS_MEASURES = [
  { id: "engagement", label: "Engagement", signal: "Member returns." },
  { id: "progress", label: "Progress", signal: "Member completes things." },
  {
    id: "confidence",
    label: "Confidence",
    signal: "Member recognizes capability.",
  },
  { id: "value", label: "Value", signal: "Member feels Spark helps them." },
] as const;

const RETURNING_ABSENCE_MS = 1000 * 60 * 60 * 24 * 3;

const STAGE_BY_ID = new Map(
  SPARK_ESTATE_MEMBER_LIFECYCLE_STAGES.map((stage) => [stage.id, stage]),
);

function readLastVisitMs(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SPARK_ESTATE_DAILY_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as { lastVisitAt?: string };
    if (!session.lastVisitAt) return null;
    const parsed = Date.parse(session.lastVisitAt);
    return Number.isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

export function isSparkEstateMemberReturningAfterAbsence(
  now = Date.now(),
  lastVisitMs: number | null = readLastVisitMs(),
): boolean {
  if (lastVisitMs == null) return false;
  return now - lastVisitMs > RETURNING_ABSENCE_MS;
}

export function getSparkEstateMemberLifecycleStage(
  stageId: SparkEstateMemberLifecycleStageId,
) {
  return STAGE_BY_ID.get(stageId) ?? SPARK_ESTATE_MEMBER_LIFECYCLE_STAGES[0];
}

export function resolveSparkEstateMemberLifecycleStage(input?: {
  profile?: SparkEstateMemberProfile;
  now?: Date;
  lastVisitMs?: number | null;
}): SparkEstateMemberLifecycleStageId {
  const profile = input?.profile ?? getSparkEstateMemberProfile();
  const now = input?.now ?? new Date();
  const lastVisitMs =
    input?.lastVisitMs !== undefined ? input.lastVisitMs : readLastVisitMs();
  const hasIdentity = Boolean(
    profile.identity.preferredName || profile.identity.name,
  );

  if (!hasIdentity && profile.progressHistory.length === 0) {
    return "discovery";
  }

  if (profile.isNewMember && shouldApplySparkEstateOnboarding({ profile, now })) {
    return "onboarding";
  }

  if (profile.isNewMember && profile.progressHistory.length === 0) {
    return "first-experience";
  }

  if (
    !profile.isNewMember &&
    isSparkEstateMemberReturningAfterAbsence(now.getTime(), lastVisitMs)
  ) {
    return "returning-member";
  }

  if (
    profile.successfulStrategies.length >= 2 &&
    profile.progressHistory.length >= 3 &&
    !profile.isNewMember
  ) {
    return "growth-over-time";
  }

  if (
    profile.progressHistory.length > 0 ||
    profile.successfulStrategies.length > 0 ||
    profile.frictionPatterns.length > 0
  ) {
    return "progress-relationship";
  }

  return "daily-companion";
}

export type SparkEstateMemberLifecycleContext = {
  stage: SparkEstateMemberLifecycleStageId;
  stageDefinition: (typeof SPARK_ESTATE_MEMBER_LIFECYCLE_STAGES)[number];
  welcomeLine: string;
  trustRules: readonly string[];
  successMeasures: typeof SPARK_ESTATE_LIFECYCLE_SUCCESS_MEASURES;
};

export function buildSparkEstateMemberLifecycleContext(input?: {
  profile?: SparkEstateMemberProfile;
  projectName?: string;
  now?: Date;
}): SparkEstateMemberLifecycleContext {
  const profile = input?.profile ?? getSparkEstateMemberProfile();
  const stage = resolveSparkEstateMemberLifecycleStage({
    profile,
    now: input?.now,
  });
  const stageDefinition = getSparkEstateMemberLifecycleStage(stage);
  const welcomeLine = formatSparkEstateLifecycleWelcome({
    stage,
    profile,
    projectName: input?.projectName,
  });

  return {
    stage,
    stageDefinition,
    welcomeLine,
    trustRules: SPARK_ESTATE_MEMBER_TRUST_RULES,
    successMeasures: SPARK_ESTATE_LIFECYCLE_SUCCESS_MEASURES,
  };
}

export function formatSparkEstateLifecycleWelcome(input: {
  stage: SparkEstateMemberLifecycleStageId;
  profile?: SparkEstateMemberProfile;
  projectName?: string;
}): string {
  const profile = input.profile ?? getSparkEstateMemberProfile();
  const name = profile.identity.preferredName || profile.identity.name;
  const project = input.projectName?.trim();

  switch (input.stage) {
    case "discovery":
      return "Welcome. Spark Estate helps turn ideas into action — one gentle step at a time.";
    case "onboarding":
      return name
        ? `Welcome, ${name}. Let's get to know what would help you most.`
        : "Welcome. Let's get to know what would help you most.";
    case "first-experience":
      return "Let's find one small win you can feel good about today.";
    case "returning-member":
      if (project) {
        return `Welcome back. You were working on ${project}. Would you like to continue?`;
      }
      return SPARK_ESTATE_RE_ENGAGEMENT_WELCOME;
    case "progress-relationship":
      return "You're building momentum — let's notice what you've moved forward on.";
    case "growth-over-time":
      return name
        ? `${name}, I'm learning what helps you — let's pick up from where you are.`
        : "I'm learning what helps you — let's pick up from where you are.";
    case "creation-journey":
      return "Let's create something useful together — one step at a time.";
    case "daily-companion":
    default:
      return name
        ? `What would help you most today, ${name}?`
        : "What would help you most today?";
  }
}

export function sparkEstateMemberLifecycleCompanionHint(input?: {
  profile?: SparkEstateMemberProfile;
  text?: string;
}): string | null {
  const context = buildSparkEstateMemberLifecycleContext({
    profile: input?.profile,
  });

  if (input?.text?.trim()) {
    const lower = input.text.toLowerCase();
    if (
      /welcome back|returning|been away|haven't been here|back after|while away|away for/.test(
        lower,
      )
    ) {
      return (
        `SPARK ESTATE LIFECYCLE: ${SPARK_ESTATE_RE_ENGAGEMENT_WELCOME} ` +
        `Never say "${SPARK_ESTATE_RE_ENGAGEMENT_AVOID[0]}". Use memory and continuity.`
      );
    }
  }

  return (
    `SPARK ESTATE LIFECYCLE (${context.stageDefinition.title}): ${context.stageDefinition.goal} ` +
    `Welcome: "${context.welcomeLine}" ` +
    `${SPARK_ESTATE_LIFECYCLE_PRINCIPLE}`
  );
}

export function verifySparkEstateUserJourneyAndMemberLifecycle(): {
  stages: number;
  journeyHeadlineReady: boolean;
  trustRulesReady: boolean;
  reEngagementReady: boolean;
  successMeasuresReady: boolean;
  onboardingIntegrated: boolean;
  dailyCompanionIntegrated: boolean;
  creationJourneyIntegrated: boolean;
  lifecycleResolutionReady: boolean;
} {
  const onboarding = verifySparkEstateOnboardingAndFirst7Days();
  const daily = verifySparkEstateDailyCompanionExperience();
  const creation = verifySparkEstateCreationJourney();

  const sampleProfile: SparkEstateMemberProfile = {
    ...getSparkEstateMemberProfile(),
    identity: {
      ...getSparkEstateMemberProfile().identity,
      preferredName: "Alex",
      name: "Alex",
    },
    progressHistory: [],
    frictionPatterns: [],
    successfulStrategies: [],
    isNewMember: true,
  };
  const onboardingStage = resolveSparkEstateMemberLifecycleStage({
    profile: sampleProfile,
  });

  return {
    stages: SPARK_ESTATE_MEMBER_LIFECYCLE_STAGES.length,
    journeyHeadlineReady: SPARK_ESTATE_LIFECYCLE_JOURNEY_HEADLINE.includes(
      "Discover",
    ),
    trustRulesReady: SPARK_ESTATE_MEMBER_TRUST_RULES.length === 4,
    reEngagementReady:
      SPARK_ESTATE_RE_ENGAGEMENT_WELCOME.includes("Welcome back") &&
      SPARK_ESTATE_RE_ENGAGEMENT_AVOID.length === 1,
    successMeasuresReady: SPARK_ESTATE_LIFECYCLE_SUCCESS_MEASURES.length === 4,
    onboardingIntegrated: onboarding.firstWeekReady,
    dailyCompanionIntegrated: daily.arrivalReady,
    creationJourneyIntegrated: creation.stepCount === 8,
    lifecycleResolutionReady:
      onboardingStage === "onboarding" || onboardingStage === "first-experience",
  };
}

export function formatSparkEstateUserJourneyAndMemberLifecycleReport(
  verification: ReturnType<typeof verifySparkEstateUserJourneyAndMemberLifecycle> = verifySparkEstateUserJourneyAndMemberLifecycle(),
): string {
  const lines: string[] = [
    `Spark Estate member lifecycle: ${verification.lifecycleResolutionReady ? "ALIGNED" : "GAPS"}`,
    SPARK_ESTATE_LIFECYCLE_PRINCIPLE,
    SPARK_ESTATE_LIFECYCLE_VISION,
    SPARK_ESTATE_LIFECYCLE_JOURNEY_HEADLINE,
    "",
    "Lifecycle stages:",
  ];

  for (const stage of SPARK_ESTATE_MEMBER_LIFECYCLE_STAGES) {
    lines.push(`  ${stage.stage}. ${stage.title} — ${stage.goal}`);
  }

  lines.push("", "Member trust rules:");
  for (const rule of SPARK_ESTATE_MEMBER_TRUST_RULES) {
    lines.push(`  • ${rule}`);
  }

  lines.push("", "Re-engagement:");
  lines.push(`  Say: "${SPARK_ESTATE_RE_ENGAGEMENT_WELCOME}"`);
  lines.push(`  Avoid: "${SPARK_ESTATE_RE_ENGAGEMENT_AVOID[0]}"`);

  lines.push("", "Success measures:");
  for (const measure of SPARK_ESTATE_LIFECYCLE_SUCCESS_MEASURES) {
    lines.push(`  ${measure.label}: ${measure.signal}`);
  }

  lines.push("", "Integration checks:");
  lines.push(`  Stages: ${verification.stages}`);
  lines.push(`  Onboarding: ${verification.onboardingIntegrated ? "pass" : "fail"}`);
  lines.push(
    `  Daily companion: ${verification.dailyCompanionIntegrated ? "pass" : "fail"}`,
  );
  lines.push(
    `  Creation journey: ${verification.creationJourneyIntegrated ? "pass" : "fail"}`,
  );
  lines.push(
    `  Lifecycle resolution: ${verification.lifecycleResolutionReady ? "pass" : "fail"}`,
  );

  return lines.join("\n");
}
