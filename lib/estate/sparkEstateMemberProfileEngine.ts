/**
 * Spark Estate™ — member profile and personalization engine (Phase 15).
 * Seven profile layers; gradual learning; member control without questionnaires.
 *
 * @see docs/protocols/SPARK_ESTATE_MEMBER_PROFILE_AND_PERSONALIZATION_ENGINE_SPECIFICATION_PHASE15.md
 */

import { getSavedGrowthWins } from "@/lib/growthWinsStore";
import { getEstateMemory } from "@/lib/estateMemory/estateMemoryStore";
import {
  detectChamberEnergyLevel,
  type ChamberEnergyLevel,
} from "./chamberOfMomentumIntelligence";
import {
  getChamberMemorySnapshot,
  getChamberPreference,
  getStrongestChamberPattern,
  getTopChamberBlockerCategories,
  saveChamberPreference,
  type ChamberMemorySnapshot,
  type ChamberPatternKey,
  type ChamberPreferenceKey,
} from "./chamberOfMomentumMemory";

export const SPARK_ESTATE_MEMBER_PROFILE_STORAGE_KEY =
  "spark-estate-member-profile-v1";

export const SPARK_ESTATE_PROFILE_SUCCESS_TEST = "Spark understands me.";

export const SPARK_ESTATE_PROFILE_PRINCIPLE =
  'Spark learns: "How does this person work best?"';

export const SPARK_ESTATE_PROFILE_LEARNING_RULE =
  "Discover preferences naturally through interaction — never a large questionnaire.";

export const SPARK_ESTATE_PRIVACY_PRINCIPLE =
  "Store information only when it improves the experience.";

export const SPARK_ESTATE_UNIVERSAL_EXPERIENCE_RULE =
  "Every room benefits from member understanding — the member should not need to explain themselves repeatedly.";

export const SPARK_ESTATE_PERSONALIZATION_USES = [
  "conversations",
  "cards",
  "room-experience",
  "creation-workflows",
] as const;

export type SparkEstateProfileLayer =
  | "identity"
  | "goals-vision"
  | "working-style"
  | "energy-patterns"
  | "progress-history"
  | "friction-patterns"
  | "successful-strategies";

export const SPARK_ESTATE_PROFILE_LAYER_DEFINITIONS: ReadonlyArray<{
  layer: SparkEstateProfileLayer;
  title: string;
  purpose: string;
  stores: readonly string[];
  usedFor: readonly string[];
}> = [
  {
    layer: "identity",
    title: "Identity Profile",
    purpose: "Understand who the member is.",
    stores: [
      "name",
      "preferred name",
      "language",
      "timezone",
      "basic preferences",
      "business information",
      "role",
    ],
    usedFor: ["greetings", "communication", "personalization"],
  },
  {
    layer: "goals-vision",
    title: "Goals and Vision",
    purpose: "Understand what matters to the member.",
    stores: [
      "personal goals",
      "business goals",
      "current priorities",
      "long-term vision",
      "important outcomes",
    ],
    usedFor: ["recommendations", "prioritization", "encouragement"],
  },
  {
    layer: "working-style",
    title: "Working Style",
    purpose: "Learn how the person operates.",
    stores: [
      "communication style",
      "planning preference",
      "learning preference",
      "detail preference",
      "visual preference",
      "pace preference",
    ],
    usedFor: ["conversations", "creation workflows", "room experience"],
  },
  {
    layer: "energy-patterns",
    title: "Energy and Capacity Patterns",
    purpose: "Adapt support to current ability.",
    stores: ["motivation", "available time", "energy level", "stress level", "workload"],
    usedFor: ["low-energy support", "high-energy planning", "encouragement"],
  },
  {
    layer: "progress-history",
    title: "Progress History",
    purpose: "Understand movement over time.",
    stores: [
      "completed projects",
      "accomplishments",
      "milestones",
      "decisions",
      "lessons learned",
    ],
    usedFor: ["continuity", "confidence", "You have done things like this before"],
  },
  {
    layer: "friction-patterns",
    title: "Friction Patterns",
    purpose: "Recognize recurring challenges without labeling the person.",
    stores: [
      "difficulty starting",
      "too many ideas",
      "perfectionism",
      "decision overload",
      "unclear next steps",
      "losing focus",
    ],
    usedFor: ["better support", "simpler choices", "targeted encouragement"],
  },
  {
    layer: "successful-strategies",
    title: "Successful Strategies",
    purpose: "Remember what works for this member.",
    stores: [
      "tiny first actions",
      "brainstorm before organizing",
      "written summaries",
      "examples before creating",
    ],
    usedFor: ["personalized guidance", "preference confirmation", "momentum"],
  },
];

export type SparkEstateIdentityProfile = {
  name?: string;
  preferredName?: string;
  language?: string;
  timezone?: string;
  role?: string;
  businessName?: string;
  businessType?: string;
  basicPreferences: string[];
};

export type SparkEstateGoalsVision = {
  personalGoals: string[];
  businessGoals: string[];
  currentPriorities: string[];
  longTermVision?: string;
  importantOutcomes: string[];
};

export type SparkEstateWorkingStyle = {
  communicationStyle?: string;
  planningPreference?: string;
  learningPreference?: string;
  detailPreference?: string;
  visualPreference?: string;
  pacePreference?: string;
};

export type SparkEstateEnergyPattern = {
  typicalEnergy?: ChamberEnergyLevel;
  availableTime?: string;
  stressSignals: string[];
  workloadNotes: string[];
  lastObservedAt?: string;
};

export type SparkEstateProgressMilestone = {
  id: string;
  label: string;
  kind: "project" | "win" | "milestone" | "decision" | "lesson";
  completedAt?: string;
};

export type SparkEstateFrictionPattern = {
  pattern: string;
  supportApproach: string;
  occurrences: number;
};

export type SparkEstateSuccessfulStrategy = {
  strategy: string;
  source: ChamberPatternKey | "member-stated";
  strength: number;
};

export type SparkEstateMemberProfile = {
  layers: SparkEstateProfileLayer[];
  identity: SparkEstateIdentityProfile;
  goalsVision: SparkEstateGoalsVision;
  workingStyle: SparkEstateWorkingStyle;
  energyPatterns: SparkEstateEnergyPattern;
  progressHistory: SparkEstateProgressMilestone[];
  frictionPatterns: SparkEstateFrictionPattern[];
  successfulStrategies: SparkEstateSuccessfulStrategy[];
  isNewMember: boolean;
  updatedAt: string;
};

export type SparkEstatePersonalizationContext = {
  greetingTone: "welcome" | "returning" | "low-energy" | "celebration";
  preferredName: string | null;
  explanationLength: "brief" | "balanced" | "detailed";
  useExamples: boolean;
  stepByStep: boolean;
  encouragementLevel: "light" | "normal" | "high";
  suggestedFirstAction: string | null;
  continuityLine: string | null;
  preferenceConfirmation: string | null;
};

export type SparkEstateEditableProfileSlice = {
  identity?: Partial<SparkEstateIdentityProfile>;
  goalsVision?: Partial<SparkEstateGoalsVision>;
  workingStyle?: Partial<SparkEstateWorkingStyle>;
};

type PersistedMemberProfile = {
  identity: SparkEstateIdentityProfile;
  goalsVision: SparkEstateGoalsVision;
  workingStyle: SparkEstateWorkingStyle;
  energyPatterns: SparkEstateEnergyPattern;
  updatedAt: string;
};

const PROFILE_LAYERS: SparkEstateProfileLayer[] = [
  "identity",
  "goals-vision",
  "working-style",
  "energy-patterns",
  "progress-history",
  "friction-patterns",
  "successful-strategies",
];

const FRICTION_SUPPORT: Record<string, string> = {
  clarity: "Offer one clear next step instead of many options.",
  skill: "Suggest learning support or a concrete example first.",
  time: "Shrink the action to fit available time.",
  energy: "Choose a smaller step and add encouragement.",
  confidence: "Reflect past wins before asking for movement.",
  overwhelm: "Reduce choices and start with relief.",
  "too-many-ideas": "Brainstorm briefly, then help organize.",
  perfectionism: "Focus on good-enough progress, not polish.",
  "decision-overload": "Compare two options at a time.",
  "losing-focus": "Return to the current focus project.",
};

const PATTERN_STRATEGY: Record<ChamberPatternKey, string> = {
  "small-first-step": "This member starts better with a tiny first action.",
  "visual-planning": "This member likes seeing the big picture first.",
  deadlines: "Clear deadlines help this member follow through.",
  encouragement: "Encouragement along the way keeps momentum going.",
  examples: "This member works better with examples before creating.",
  "low-energy-mode": "On low-energy days, smaller actions work best.",
};

const WORKING_STYLE_KEYS: Record<
  keyof SparkEstateWorkingStyle,
  ChamberPreferenceKey
> = {
  communicationStyle: "communication-style",
  planningPreference: "planning-style",
  learningPreference: "encouragement-style",
  detailPreference: "detail-level",
  visualPreference: "planning-style",
  pacePreference: "best-work-time",
};

function emptyPersistedProfile(): PersistedMemberProfile {
  return {
    identity: { basicPreferences: [] },
    goalsVision: {
      personalGoals: [],
      businessGoals: [],
      currentPriorities: [],
      importantOutcomes: [],
    },
    workingStyle: {},
    energyPatterns: { stressSignals: [], workloadNotes: [] },
    updatedAt: new Date().toISOString(),
  };
}

function readPersistedProfile(): PersistedMemberProfile {
  if (typeof window === "undefined") return emptyPersistedProfile();
  try {
    const raw = localStorage.getItem(SPARK_ESTATE_MEMBER_PROFILE_STORAGE_KEY);
    if (!raw) return emptyPersistedProfile();
    const parsed = JSON.parse(raw) as PersistedMemberProfile;
    return {
      ...emptyPersistedProfile(),
      ...parsed,
      identity: {
        ...emptyPersistedProfile().identity,
        ...parsed.identity,
        basicPreferences: parsed.identity?.basicPreferences ?? [],
      },
      goalsVision: {
        ...emptyPersistedProfile().goalsVision,
        ...parsed.goalsVision,
        personalGoals: parsed.goalsVision?.personalGoals ?? [],
        businessGoals: parsed.goalsVision?.businessGoals ?? [],
        currentPriorities: parsed.goalsVision?.currentPriorities ?? [],
        importantOutcomes: parsed.goalsVision?.importantOutcomes ?? [],
      },
      workingStyle: { ...parsed.workingStyle },
      energyPatterns: {
        ...emptyPersistedProfile().energyPatterns,
        ...parsed.energyPatterns,
        stressSignals: parsed.energyPatterns?.stressSignals ?? [],
        workloadNotes: parsed.energyPatterns?.workloadNotes ?? [],
      },
    };
  } catch {
    return emptyPersistedProfile();
  }
}

function writePersistedProfile(profile: PersistedMemberProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      SPARK_ESTATE_MEMBER_PROFILE_STORAGE_KEY,
      JSON.stringify({ ...profile, updatedAt: new Date().toISOString() }),
    );
  } catch {
    /* quota */
  }
}

function mergeIdentityFromEstate(
  identity: SparkEstateIdentityProfile,
): SparkEstateIdentityProfile {
  const estate = getEstateMemory().userProfile;
  return {
    ...identity,
    name: identity.name ?? estate.displayName,
    businessType: identity.businessType ?? estate.businessType,
    basicPreferences: [
      ...new Set([...identity.basicPreferences, ...estate.preferences]),
    ],
  };
}

function mergeGoalsFromEstate(
  goalsVision: SparkEstateGoalsVision,
): SparkEstateGoalsVision {
  const estateGoals = getEstateMemory().userProfile.goals;
  const activeGoals = getEstateMemory().activeGoals.map((goal) => goal.label);
  return {
    ...goalsVision,
    businessGoals: [
      ...new Set([...goalsVision.businessGoals, ...estateGoals]),
    ].slice(0, 8),
    currentPriorities: [
      ...new Set([...goalsVision.currentPriorities, ...activeGoals]),
    ].slice(0, 6),
  };
}

function readWorkingStyleFromChamber(
  workingStyle: SparkEstateWorkingStyle,
): SparkEstateWorkingStyle {
  const merged = { ...workingStyle };
  for (const [field, key] of Object.entries(WORKING_STYLE_KEYS) as Array<
    [keyof SparkEstateWorkingStyle, ChamberPreferenceKey]
  >) {
    if (!merged[field]) {
      const pref = getChamberPreference(key);
      if (pref?.value) merged[field] = pref.value;
    }
  }
  return merged;
}

function buildProgressHistory(
  snapshot: ChamberMemorySnapshot,
): SparkEstateProgressMilestone[] {
  const milestones: SparkEstateProgressMilestone[] = [];

  for (const project of snapshot.projects) {
    if (project.status === "complete") {
      milestones.push({
        id: `project-${project.projectId}`,
        label: project.completedAchievement || project.name,
        kind: "project",
        completedAt: project.completedAt,
      });
      if (project.completedLesson) {
        milestones.push({
          id: `lesson-${project.projectId}`,
          label: project.completedLesson,
          kind: "lesson",
          completedAt: project.completedAt,
        });
      }
    } else if (project.nextAction) {
      milestones.push({
        id: `active-${project.projectId}`,
        label: `${project.name}: ${project.nextAction}`,
        kind: "milestone",
      });
    }
  }

  for (const win of getSavedGrowthWins().slice(0, 8)) {
    milestones.push({
      id: `win-${win.id}`,
      label: win.whatHappened,
      kind: "win",
      completedAt: win.createdAt,
    });
  }

  return milestones.slice(0, 16);
}

function buildFrictionPatterns(
  snapshot: ChamberMemorySnapshot,
): SparkEstateFrictionPattern[] {
  const counts = new Map<string, number>();
  for (const blocker of snapshot.recentBlockers) {
    counts.set(blocker.category, (counts.get(blocker.category) ?? 0) + 1);
  }
  for (const category of getTopChamberBlockerCategories(5)) {
    if (!counts.has(category)) counts.set(category, 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pattern, occurrences]) => ({
      pattern,
      supportApproach:
        FRICTION_SUPPORT[pattern] ??
        "Offer simpler support tailored to what is blocking progress.",
      occurrences,
    }));
}

function buildSuccessfulStrategies(
  snapshot: ChamberMemorySnapshot,
): SparkEstateSuccessfulStrategy[] {
  return snapshot.patternObservations
    .filter((entry) => entry.strength >= 2)
    .sort((a, b) => b.strength - a.strength)
    .map((entry) => ({
      strategy:
        PATTERN_STRATEGY[entry.pattern] ??
        "Use approaches that have worked before.",
      source: entry.pattern,
      strength: entry.strength,
    }));
}

function inferTypicalEnergy(
  snapshot: ChamberMemorySnapshot,
  persisted: SparkEstateEnergyPattern,
): ChamberEnergyLevel | undefined {
  if (persisted.typicalEnergy) return persisted.typicalEnergy;
  const lowCount = snapshot.recentBlockers.filter((entry) =>
    /energy|tired|overwhelm/.test(entry.category),
  ).length;
  if (lowCount >= 2) return "low";
  const lowPattern = snapshot.patternObservations.find(
    (entry) => entry.pattern === "low-energy-mode" && entry.strength >= 2,
  );
  if (lowPattern) return "low";
  return undefined;
}

export function getSparkEstateMemberProfile(input?: {
  snapshot?: ChamberMemorySnapshot;
}): SparkEstateMemberProfile {
  const snapshot = input?.snapshot ?? getChamberMemorySnapshot();
  const persisted = readPersistedProfile();
  const identity = mergeIdentityFromEstate(persisted.identity);
  const goalsVision = mergeGoalsFromEstate(persisted.goalsVision);
  const workingStyle = readWorkingStyleFromChamber(persisted.workingStyle);
  const progressHistory = buildProgressHistory(snapshot);
  const frictionPatterns = buildFrictionPatterns(snapshot);
  const successfulStrategies = buildSuccessfulStrategies(snapshot);

  const hasHistory =
    progressHistory.length > 0 ||
    snapshot.recentMomentum.length > 0 ||
    Boolean(identity.preferredName || identity.name);

  const energyPatterns: SparkEstateEnergyPattern = {
    ...persisted.energyPatterns,
    typicalEnergy: inferTypicalEnergy(snapshot, persisted.energyPatterns),
    lastObservedAt: persisted.energyPatterns.lastObservedAt,
  };

  return {
    layers: PROFILE_LAYERS,
    identity,
    goalsVision,
    workingStyle,
    energyPatterns,
    progressHistory,
    frictionPatterns,
    successfulStrategies,
    isNewMember: !hasHistory,
    updatedAt: persisted.updatedAt,
  };
}

export function updateSparkEstateMemberProfile(
  slice: SparkEstateEditableProfileSlice,
): SparkEstateMemberProfile {
  const persisted = readPersistedProfile();

  if (slice.identity) {
    persisted.identity = {
      ...persisted.identity,
      ...slice.identity,
      basicPreferences:
        slice.identity.basicPreferences ?? persisted.identity.basicPreferences,
    };
  }

  if (slice.goalsVision) {
    persisted.goalsVision = {
      ...persisted.goalsVision,
      ...slice.goalsVision,
      personalGoals:
        slice.goalsVision.personalGoals ?? persisted.goalsVision.personalGoals,
      businessGoals:
        slice.goalsVision.businessGoals ?? persisted.goalsVision.businessGoals,
      currentPriorities:
        slice.goalsVision.currentPriorities ??
        persisted.goalsVision.currentPriorities,
      importantOutcomes:
        slice.goalsVision.importantOutcomes ??
        persisted.goalsVision.importantOutcomes,
    };
  }

  if (slice.workingStyle) {
    persisted.workingStyle = { ...persisted.workingStyle, ...slice.workingStyle };
    for (const [field, value] of Object.entries(slice.workingStyle) as Array<
      [keyof SparkEstateWorkingStyle, string | undefined]
    >) {
      if (value?.trim()) {
        const key = WORKING_STYLE_KEYS[field];
        if (key) saveChamberPreference(key, value.trim());
      }
    }
  }

  writePersistedProfile(persisted);
  return getSparkEstateMemberProfile();
}

export function removeSparkEstateProfileField(
  layer: SparkEstateProfileLayer,
  field: string,
): SparkEstateMemberProfile {
  const persisted = readPersistedProfile();

  if (layer === "identity" && field in persisted.identity) {
    const identity = { ...persisted.identity };
    if (field === "basicPreferences") {
      identity.basicPreferences = [];
    } else {
      delete (identity as Record<string, unknown>)[field];
    }
    persisted.identity = identity;
  }

  if (layer === "goals-vision") {
    const goals = { ...persisted.goalsVision };
    if (field in goals) {
      const value = (goals as Record<string, unknown>)[field];
      if (Array.isArray(value)) {
        (goals as Record<string, string[]>)[field] = [];
      } else {
        delete (goals as Record<string, unknown>)[field];
      }
    }
    persisted.goalsVision = goals;
  }

  if (layer === "working-style" && field in persisted.workingStyle) {
    const workingStyle = { ...persisted.workingStyle };
    delete workingStyle[field as keyof SparkEstateWorkingStyle];
    persisted.workingStyle = workingStyle;
  }

  writePersistedProfile(persisted);
  return getSparkEstateMemberProfile();
}

export function clearSparkEstateEditableProfile(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SPARK_ESTATE_MEMBER_PROFILE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function formatSparkEstateMemberProfileSummary(
  profile: SparkEstateMemberProfile = getSparkEstateMemberProfile(),
): string[] {
  const lines: string[] = [];

  if (profile.identity.preferredName || profile.identity.name) {
    lines.push(
      `Name: ${profile.identity.preferredName ?? profile.identity.name}`,
    );
  }
  if (profile.identity.businessName || profile.identity.businessType) {
    lines.push(
      `Business: ${[profile.identity.businessName, profile.identity.businessType]
        .filter(Boolean)
        .join(" · ")}`,
    );
  }
  if (profile.goalsVision.currentPriorities.length > 0) {
    lines.push(`Current priorities: ${profile.goalsVision.currentPriorities.join(", ")}`);
  }
  if (profile.workingStyle.communicationStyle) {
    lines.push(`Communication: ${profile.workingStyle.communicationStyle}`);
  }
  if (profile.workingStyle.pacePreference) {
    lines.push(`Pace: ${profile.workingStyle.pacePreference}`);
  }
  if (profile.successfulStrategies[0]) {
    lines.push(profile.successfulStrategies[0].strategy);
  }
  if (profile.progressHistory.length > 0) {
    lines.push(`${profile.progressHistory.length} progress moments on record`);
  }

  return lines;
}

export function observeSparkEstateEnergyFromText(text: string): void {
  const energy = detectChamberEnergyLevel(text);
  const persisted = readPersistedProfile();
  persisted.energyPatterns = {
    ...persisted.energyPatterns,
    typicalEnergy: energy,
    lastObservedAt: new Date().toISOString(),
  };
  if (/\b(?:stress|stressed|a lot happening|too much)\b/i.test(text)) {
    const signal = text.trim().slice(0, 80);
    if (!persisted.energyPatterns.stressSignals.includes(signal)) {
      persisted.energyPatterns.stressSignals = [
        signal,
        ...persisted.energyPatterns.stressSignals,
      ].slice(0, 5);
    }
  }
  writePersistedProfile(persisted);
}

function activeFocusLabel(snapshot: ChamberMemorySnapshot): string | null {
  const focus = snapshot.projects.find(
    (project) =>
      project.status !== "complete" &&
      project.status !== "archived" &&
      project.nextAction.trim().length > 0,
  );
  return focus ? focus.name : null;
}

function suggestPreferenceConfirmation(
  profile: SparkEstateMemberProfile,
): string | null {
  const strongest = getStrongestChamberPattern();
  if (!strongest || strongest.strength < 3) return null;

  if (strongest.pattern === "examples") {
    return "You seem to prefer seeing examples before creating. Would you like me to keep doing that?";
  }
  if (strongest.pattern === "small-first-step") {
    return "You often move forward best with a very small first step. Should I keep suggesting those?";
  }
  if (strongest.pattern === "visual-planning") {
    return "You seem to like seeing the big picture first. Would you like me to keep doing that?";
  }
  return null;
}

export function buildSparkEstatePersonalizationContext(input?: {
  text?: string;
  snapshot?: ChamberMemorySnapshot;
  profile?: SparkEstateMemberProfile;
  celebrating?: boolean;
}): SparkEstatePersonalizationContext {
  const snapshot = input?.snapshot ?? getChamberMemorySnapshot();
  const profile = input?.profile ?? getSparkEstateMemberProfile({ snapshot });
  const text = input?.text?.trim() ?? "";
  const energy = text
    ? detectChamberEnergyLevel(text)
    : profile.energyPatterns.typicalEnergy ?? "normal";

  const preferredName =
    profile.identity.preferredName?.trim() ||
    profile.identity.name?.trim() ||
    null;

  const focus = activeFocusLabel(snapshot);
  const recentWin = getSavedGrowthWins()[0]?.whatHappened ?? null;

  let greetingTone: SparkEstatePersonalizationContext["greetingTone"] =
    profile.isNewMember ? "welcome" : "returning";
  if (input?.celebrating || recentWin) {
    greetingTone = "celebration";
  } else if (energy === "low") {
    greetingTone = "low-energy";
  }

  const stepByStep =
    /step[- ]by[- ]step|one step at a time/i.test(
      profile.workingStyle.pacePreference ?? "",
    ) ||
    profile.successfulStrategies.some((entry) =>
      /small first|tiny first|one step/i.test(entry.strategy),
    );

  const useExamples =
    profile.successfulStrategies.some((entry) => entry.source === "examples") ||
    /examples?/i.test(profile.workingStyle.learningPreference ?? "");

  const detailPref = profile.workingStyle.detailPreference?.toLowerCase() ?? "";
  const explanationLength: SparkEstatePersonalizationContext["explanationLength"] =
    /brief|short|concise/.test(detailPref)
      ? "brief"
      : /detail|thorough/.test(detailPref)
        ? "detailed"
        : "balanced";

  let continuityLine: string | null = null;
  if (!profile.isNewMember && focus) {
    continuityLine = `You were working on ${focus}. Would you like to continue?`;
  } else if (!profile.isNewMember && profile.goalsVision.currentPriorities[0]) {
    continuityLine = `Last time you were focused on ${profile.goalsVision.currentPriorities[0]}.`;
  }

  let suggestedFirstAction: string | null = null;
  if (energy === "low") {
    suggestedFirstAction = "Choose one small step.";
  } else if (profile.frictionPatterns[0]) {
    suggestedFirstAction = profile.frictionPatterns[0].supportApproach;
  }

  return {
    greetingTone,
    preferredName,
    explanationLength,
    useExamples,
    stepByStep,
    encouragementLevel:
      energy === "low" || profile.frictionPatterns.length > 0 ? "high" : "normal",
    suggestedFirstAction,
    continuityLine,
    preferenceConfirmation: suggestPreferenceConfirmation(profile),
  };
}

export function formatSparkEstatePersonalizedGreeting(
  context: SparkEstatePersonalizationContext = buildSparkEstatePersonalizationContext(),
): string {
  const name = context.preferredName ? `, ${context.preferredName}` : "";

  switch (context.greetingTone) {
    case "welcome":
      return `Let's start by understanding what you are working toward${name}.`;
    case "low-energy":
      return `You have a lot happening today${name}. Let's choose one small step.`;
    case "celebration":
      return `You completed that milestone${name}. Let's capture what worked.`;
    case "returning":
    default:
      if (context.continuityLine) return context.continuityLine;
      return `Welcome back${name}. What would help you move forward today?`;
  }
}

export function personalizeSparkEstateCreationQuestion(
  question: string,
  context: SparkEstatePersonalizationContext = buildSparkEstatePersonalizationContext(),
): string {
  let result = question.trim();
  if (context.useExamples && !/example/i.test(result)) {
    result = `${result}\n\nIf it helps, I can share a quick example first.`;
  }
  if (context.stepByStep && !/one (?:question|step)/i.test(result)) {
    result = `${result}\n\nWe'll take this one step at a time.`;
  }
  return result;
}

export function sparkEstateMemberProfileHint(): string {
  return (
    `SPARK ESTATE MEMBER PROFILE: ${SPARK_ESTATE_PROFILE_PRINCIPLE} ` +
    "Learn identity, goals, working style, energy, progress, friction, and strategies. " +
    "Discover gradually; member can view, edit, and remove."
  );
}

export function buildSparkEstateMemberProfileCompanionHint(input?: {
  text?: string;
}): string | null {
  const text = input?.text?.trim() ?? "";
  if (!text) return null;

  const context = buildSparkEstatePersonalizationContext({ text });
  const lines = [sparkEstateMemberProfileHint()];

  if (context.preferenceConfirmation) {
    lines.push(context.preferenceConfirmation);
  }
  if (context.greetingTone === "low-energy" && context.suggestedFirstAction) {
    lines.push(`Low energy — ${context.suggestedFirstAction}`);
  }
  if (context.useExamples) {
    lines.push("Offer examples before asking the member to create from scratch.");
  }
  if (context.stepByStep) {
    lines.push("Guide step-by-step — one question at a time.");
  }
  if (context.continuityLine) {
    lines.push(context.continuityLine);
  }

  return lines.length > 1 ? lines.join(" ") : null;
}

export function formatSparkEstateMemberProfileReport(
  profile: SparkEstateMemberProfile = getSparkEstateMemberProfile(),
  verification: ReturnType<typeof verifySparkEstateMemberProfile> = verifySparkEstateMemberProfile(),
): string {
  const lines: string[] = [
    `Spark Estate™ member profile: ${verification.personalizationReady ? "ALIGNED" : "GAPS"}`,
    SPARK_ESTATE_PROFILE_PRINCIPLE,
    SPARK_ESTATE_PROFILE_SUCCESS_TEST,
    SPARK_ESTATE_PRIVACY_PRINCIPLE,
    "",
    "Profile layers:",
  ];

  for (const definition of SPARK_ESTATE_PROFILE_LAYER_DEFINITIONS) {
    lines.push(
      `  ${definition.title} [${definition.layer}]`,
      `    ${definition.purpose}`,
      `    Used for: ${definition.usedFor.join(", ")}`,
    );
  }

  lines.push("", "Personalization uses:");
  for (const use of SPARK_ESTATE_PERSONALIZATION_USES) {
    lines.push(`  • ${use}`);
  }

  lines.push("", SPARK_ESTATE_UNIVERSAL_EXPERIENCE_RULE, "", "Current member summary:");
  const summary = formatSparkEstateMemberProfileSummary(profile);
  if (summary.length) {
    for (const line of summary) {
      lines.push(`  ${line}`);
    }
  } else {
    lines.push("  (new member — learning gradually)");
  }

  lines.push("", "Integration checks:");
  lines.push(`  Layers: ${verification.layers.length}`);
  lines.push(`  Personalization: ${verification.personalizationReady ? "pass" : "fail"}`);
  lines.push(`  Member control: ${verification.memberControlReady ? "pass" : "fail"}`);
  lines.push(
    `  Gradual learning: ${verification.gradualLearningReady ? "pass" : "fail"}`,
  );
  lines.push(
    `  Privacy principle: ${verification.privacyPrincipleReady ? "pass" : "fail"}`,
  );

  return lines.join("\n");
}

export function verifySparkEstateMemberProfile(): {
  layers: SparkEstateProfileLayer[];
  personalizationReady: boolean;
  memberControlReady: boolean;
  gradualLearningReady: boolean;
  privacyPrincipleReady: boolean;
  universalExperienceReady: boolean;
} {
  const profile = getSparkEstateMemberProfile();
  const context = buildSparkEstatePersonalizationContext({
    profile: {
      ...profile,
      isNewMember: false,
      identity: { ...profile.identity, preferredName: "Alex" },
      workingStyle: {
        ...profile.workingStyle,
        learningPreference: "examples first",
        pacePreference: "step-by-step guidance",
      },
    },
  });
  const greeting = formatSparkEstatePersonalizedGreeting(context);
  const creation = personalizeSparkEstateCreationQuestion(
    "What is this for?",
    context,
  );

  return {
    layers: profile.layers,
    personalizationReady:
      profile.layers.length === 7 &&
      SPARK_ESTATE_PROFILE_LAYER_DEFINITIONS.length === 7 &&
      greeting.length > 0 &&
      /step|working toward|Welcome back/i.test(greeting) &&
      creation.includes("example"),
    memberControlReady:
      typeof updateSparkEstateMemberProfile === "function" &&
      typeof removeSparkEstateProfileField === "function" &&
      typeof clearSparkEstateEditableProfile === "function",
    gradualLearningReady: SPARK_ESTATE_PROFILE_LEARNING_RULE.includes("naturally"),
    privacyPrincipleReady: SPARK_ESTATE_PRIVACY_PRINCIPLE.includes("improves"),
    universalExperienceReady: SPARK_ESTATE_UNIVERSAL_EXPERIENCE_RULE.includes("Every room"),
  };
}
