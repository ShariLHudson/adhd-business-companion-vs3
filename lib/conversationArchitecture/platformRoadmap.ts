/**
 * Package 214 — Spark Estate Platform Implementation Roadmap.
 * Master implementation tracker (status separate from architecture ownership).
 */

export type RoadmapTrackStatus = "not_started" | "partial" | "complete" | "blocked";

/** Ten dimensions every experience must track. */
export type ExperienceTrackDimension =
  | "architectureComplete"
  | "uiComplete"
  | "runtimeComplete"
  | "cieIntegrated"
  | "validationActive"
  | "hcvActive"
  | "goldStandardIntegration"
  | "regressionTested"
  | "authenticatedTested"
  | "productionReady";

export const EXPERIENCE_TRACK_DIMENSIONS: readonly ExperienceTrackDimension[] = [
  "architectureComplete",
  "uiComplete",
  "runtimeComplete",
  "cieIntegrated",
  "validationActive",
  "hcvActive",
  "goldStandardIntegration",
  "regressionTested",
  "authenticatedTested",
  "productionReady",
] as const;

export type ExperienceImplementationTrack = {
  experienceId: string;
  label: string;
  tracks: Record<ExperienceTrackDimension, RoadmapTrackStatus>;
  notes: string;
};

export type PlatformPriorityId =
  | "stabilize-cie"
  | "welcome-home"
  | "talk-it-out"
  | "create"
  | "shari-global"
  | "chamber"
  | "board"
  | "remaining-experiences"
  | "ghost-code"
  | "production-certification";

export type PlatformPriority = {
  order: number;
  id: PlatformPriorityId;
  label: string;
  status: RoadmapTrackStatus;
  evidence: string;
};

/**
 * Priority order from package 214.
 * Priority 1 (stabilize CIE) marked complete after commit f0a36e7c.
 */
export const PLATFORM_PRIORITIES: readonly PlatformPriority[] = [
  {
    order: 1,
    id: "stabilize-cie",
    label: "Stabilize CIE",
    status: "complete",
    evidence:
      "Committed + pushed f0a36e7c on deploy/companion-app-v3 (CIE + Talk It Out slice)",
  },
  {
    order: 2,
    id: "welcome-home",
    label: "Complete Welcome Home",
    status: "partial",
    evidence: "Welcome Living Room exists; not fully on CIE/HCV certification path",
  },
  {
    order: 3,
    id: "talk-it-out",
    label: "Complete Talk It Out",
    status: "partial",
    evidence:
      "CIE+HCV wired + unit/multi-turn green; authenticated preview still open",
  },
  {
    order: 4,
    id: "create",
    label: "Complete Create",
    status: "partial",
    evidence: "Local HCV polish may exist; CIE not primary orchestrator",
  },
  {
    order: 5,
    id: "shari-global",
    label: "Complete Shari Global",
    status: "not_started",
    evidence: "companion-chat LLM bypasses CIE",
  },
  {
    order: 6,
    id: "chamber",
    label: "Roll out CIE to Chamber",
    status: "not_started",
    evidence: "Persona path bypasses CIE",
  },
  {
    order: 7,
    id: "board",
    label: "Roll out CIE to Board",
    status: "not_started",
    evidence: "Templated deliberation bypasses CIE",
  },
  {
    order: 8,
    id: "remaining-experiences",
    label: "Finish remaining platform experiences",
    status: "not_started",
    evidence: "Projects, onboarding, Business Estate guidance, etc.",
  },
  {
    order: 9,
    id: "ghost-code",
    label: "Remove ghost code",
    status: "partial",
    evidence: "Ghost report exists; dual processConversationTurn + legacy prompts remain",
  },
  {
    order: 10,
    id: "production-certification",
    label: "Production certification",
    status: "blocked",
    evidence: "Do not deploy until priorities 2–9 clear release gates",
  },
] as const;

function tracks(
  partial: Partial<Record<ExperienceTrackDimension, RoadmapTrackStatus>>,
): Record<ExperienceTrackDimension, RoadmapTrackStatus> {
  const base = Object.fromEntries(
    EXPERIENCE_TRACK_DIMENSIONS.map((d) => [d, "not_started" as RoadmapTrackStatus]),
  ) as Record<ExperienceTrackDimension, RoadmapTrackStatus>;
  return { ...base, ...partial };
}

/** Per-experience implementation tracker (not architecture ownership). */
export const EXPERIENCE_IMPLEMENTATION_TRACKS: readonly ExperienceImplementationTrack[] =
  [
    {
      experienceId: "welcome-home",
      label: "Welcome Home",
      tracks: tracks({
        architectureComplete: "partial",
        uiComplete: "partial",
        runtimeComplete: "partial",
        cieIntegrated: "not_started",
        validationActive: "not_started",
        hcvActive: "not_started",
        goldStandardIntegration: "not_started",
        regressionTested: "partial",
        authenticatedTested: "not_started",
        productionReady: "not_started",
      }),
      notes: "Arrival / Welcome Living Room — next after CIE stabilize",
    },
    {
      experienceId: "talk-it-out",
      label: "Talk It Out",
      tracks: tracks({
        architectureComplete: "complete",
        uiComplete: "complete",
        runtimeComplete: "complete",
        cieIntegrated: "complete",
        validationActive: "complete",
        hcvActive: "complete",
        goldStandardIntegration: "complete",
        regressionTested: "complete",
        authenticatedTested: "not_started",
        productionReady: "not_started",
      }),
      notes: "Strongest CIE surface; blocked on auth preview + production cert",
    },
    {
      experienceId: "create",
      label: "Create",
      tracks: tracks({
        architectureComplete: "partial",
        uiComplete: "partial",
        runtimeComplete: "partial",
        cieIntegrated: "not_started",
        validationActive: "partial",
        hcvActive: "partial",
        goldStandardIntegration: "not_started",
        regressionTested: "partial",
        authenticatedTested: "not_started",
        productionReady: "not_started",
      }),
      notes: "HCV may be local; CIE processTurn not primary",
    },
    {
      experienceId: "general-chat",
      label: "Shari Global",
      tracks: tracks({
        architectureComplete: "partial",
        uiComplete: "complete",
        runtimeComplete: "partial",
        cieIntegrated: "not_started",
        validationActive: "not_started",
        hcvActive: "not_started",
        goldStandardIntegration: "not_started",
        regressionTested: "partial",
        authenticatedTested: "not_started",
        productionReady: "not_started",
      }),
      notes: "LLM companion-chat bypass",
    },
    {
      experienceId: "chamber",
      label: "Chamber of Momentum",
      tracks: tracks({
        architectureComplete: "partial",
        uiComplete: "complete",
        runtimeComplete: "partial",
        cieIntegrated: "not_started",
        validationActive: "not_started",
        hcvActive: "not_started",
        goldStandardIntegration: "not_started",
        regressionTested: "partial",
        authenticatedTested: "not_started",
        productionReady: "not_started",
      }),
      notes: "Persona path — CIE rollout pending",
    },
    {
      experienceId: "board",
      label: "Round Table Board",
      tracks: tracks({
        architectureComplete: "partial",
        uiComplete: "partial",
        runtimeComplete: "partial",
        cieIntegrated: "not_started",
        validationActive: "not_started",
        hcvActive: "not_started",
        goldStandardIntegration: "not_started",
        regressionTested: "partial",
        authenticatedTested: "not_started",
        productionReady: "not_started",
      }),
      notes: "Templated deliberation — CIE rollout pending",
    },
    {
      experienceId: "projects",
      label: "Projects",
      tracks: tracks({
        architectureComplete: "partial",
        uiComplete: "partial",
        runtimeComplete: "partial",
        cieIntegrated: "not_started",
        validationActive: "not_started",
        hcvActive: "not_started",
        goldStandardIntegration: "not_started",
        regressionTested: "partial",
        authenticatedTested: "not_started",
        productionReady: "not_started",
      }),
      notes: "Remaining platform experiences bucket",
    },
  ];

export type PlatformRoadmapSnapshot = {
  objectives: readonly string[];
  priorities: readonly PlatformPriority[];
  nextPriority: PlatformPriority | null;
  experiences: readonly ExperienceImplementationTrack[];
  productionReady: boolean;
  cieStabilized: boolean;
};

export const PLATFORM_ROADMAP_OBJECTIVES = [
  "Complete platform integration.",
  "Migrate every experience onto the shared Conversation Intelligence Engine.",
  "Eliminate legacy conversation systems.",
  "Track implementation status separately from architecture.",
  "Drive authenticated testing and production readiness.",
] as const;

export function getNextPlatformPriority(): PlatformPriority | null {
  return (
    PLATFORM_PRIORITIES.find(
      (p) => p.status !== "complete" && p.status !== "blocked",
    ) ??
    PLATFORM_PRIORITIES.find((p) => p.status === "blocked") ??
    null
  );
}

export function isExperienceProductionReady(
  experienceId: string,
): boolean {
  const row = EXPERIENCE_IMPLEMENTATION_TRACKS.find(
    (e) => e.experienceId === experienceId,
  );
  if (!row) return false;
  return EXPERIENCE_TRACK_DIMENSIONS.every(
    (d) => row.tracks[d] === "complete",
  );
}

export function getPlatformRoadmapSnapshot(): PlatformRoadmapSnapshot {
  const cie = PLATFORM_PRIORITIES.find((p) => p.id === "stabilize-cie");
  const prod = PLATFORM_PRIORITIES.find(
    (p) => p.id === "production-certification",
  );
  return {
    objectives: PLATFORM_ROADMAP_OBJECTIVES,
    priorities: PLATFORM_PRIORITIES,
    nextPriority: getNextPlatformPriority(),
    experiences: EXPERIENCE_IMPLEMENTATION_TRACKS,
    productionReady: prod?.status === "complete",
    cieStabilized: cie?.status === "complete",
  };
}
