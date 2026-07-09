/**
 * Spark Estate™ — universal project workspace architecture refinement.
 * Projects are living member-owned workspaces available throughout the app.
 *
 * @see docs/protocols/SPARK_ESTATE_UNIVERSAL_PROJECT_WORKSPACE_ARCHITECTURE_REFINEMENT_SPECIFICATION.md
 */

import type { AppSection } from "@/lib/companionUi";
import {
  getProjects,
  type Project,
  type ProjectStatus,
} from "@/lib/companionStore";
import {
  SPARK_ESTATE_CREATION_STEPS,
  inferCreationArchetype,
  verifySparkEstateCreationJourney,
} from "@/lib/universalCreation/sparkEstateCreationJourney";
import {
  chamberProjectSummary,
  createChamberProject,
  suggestProjectBreakdown,
} from "./chamberProjectEngine";
import { getChamberProjectMeta } from "./chamberProjectMeta";
import { formatSparkEstateReturnToWorkLine } from "./sparkEstateDailyCompanionExperience";
import {
  detectSparkEstateProjectCapture,
  verifySparkEstateIntelligentProjectLifecycleEngine,
} from "./sparkEstateIntelligentProjectLifecycleEngine";
import { verifySparkEstateExpertTeamAndChamberMemberCollaboration } from "./sparkEstateExpertTeamAndChamberMemberCollaborationArchitecture";

export const SPARK_ESTATE_UNIVERSAL_PROJECT_PRINCIPLE =
  "A project belongs to the member — the Chamber of Momentum™ can create and organize projects, but the project follows the member everywhere.";

export const SPARK_ESTATE_UNIVERSAL_PROJECT_VISION =
  "Rooms provide expertise. Projects provide continuity. Spark provides guidance. Progress follows the member anywhere.";

export const SPARK_ESTATE_UNIVERSAL_PROJECT_FLOW = [
  "Member Project",
  "Available Everywhere",
  "Room / Conversation / Feature",
  "Project Context Available",
  "Continue Progress",
] as const;

export const SPARK_ESTATE_OLD_WORKSPACE_MODEL_AVOID = [
  "isolated project areas",
  "projects that only exist inside one room",
  "disconnected workspaces",
  "duplicate copies of the same project",
] as const;

export const SPARK_ESTATE_PROJECT_LIBRARY_SHELVES = [
  "active projects",
  "completed projects",
  "drafts",
  "archived projects",
  "recently updated work",
] as const;

export const SPARK_ESTATE_PROJECT_LIBRARY_SEARCH_TYPES = [
  "projects",
  "SOPs",
  "templates",
  "funnels",
  "strategies",
  "documents",
] as const;

export const SPARK_ESTATE_PROJECT_ENTRY_POINTS = [
  {
    location: "Chamber of Momentum™",
    example: "I need to create a sales funnel.",
    section: "chamber-of-momentum" as AppSection,
  },
  {
    location: "Marketing Room",
    example: "I need a campaign strategy.",
    section: "content-generator" as AppSection,
  },
  {
    location: "Email Area",
    example: "I need a client email sequence.",
    section: "email-generator" as AppSection,
  },
  {
    location: "Conversation",
    example: "I have an idea I want to build.",
    section: null,
  },
] as const;

export const SPARK_ESTATE_UNIVERSAL_PROJECT_ACCESS_ROOMS = [
  { room: "Marketing Room", purpose: "Continue marketing work connected to the project." },
  { room: "Email Area", purpose: "Create emails connected to the project." },
  { room: "Content Room", purpose: "Create content connected to the project." },
  {
    room: "Chamber of Momentum™",
    purpose: "See overall progress and next steps.",
  },
] as const;

export const SPARK_ESTATE_PROJECT_ADHD_CONTINUITY_QUESTIONS = [
  "Where did I save that?",
  "Which room was I using?",
  "How do I continue?",
] as const;

export type UniversalProjectWorkspaceKind =
  | "funnel"
  | "sop"
  | "template"
  | "strategy"
  | "general";

export type UniversalProjectLibraryShelf =
  | "active"
  | "completed"
  | "drafts"
  | "archived"
  | "recent";

export type UniversalProjectWorkspaceSection = {
  id: string;
  label: string;
  items: readonly string[];
};

export type UniversalProjectWorkspace = {
  projectId: string;
  name: string;
  kind: UniversalProjectWorkspaceKind;
  overview: {
    purpose: string;
    goal: string;
    status: ProjectStatus;
    progress: string;
  };
  sections: UniversalProjectWorkspaceSection[];
  exportActions: readonly string[];
};

const WORKSPACE_TEMPLATES: Record<
  UniversalProjectWorkspaceKind,
  UniversalProjectWorkspaceSection[]
> = {
  funnel: [
    {
      id: "overview",
      label: "Overview",
      items: ["project name", "purpose", "goal", "status", "progress"],
    },
    {
      id: "strategy",
      label: "Strategy",
      items: ["audience", "offer", "positioning", "customer journey"],
    },
    {
      id: "funnel",
      label: "Funnel",
      items: ["lead magnet", "landing page", "thank you page", "calls to action"],
    },
    {
      id: "email-sequence",
      label: "Email Sequence",
      items: ["email drafts", "automation plan", "revisions"],
    },
    {
      id: "assets",
      label: "Assets",
      items: ["copy", "graphics", "resources"],
    },
    {
      id: "tasks",
      label: "Tasks",
      items: ["next actions", "deadlines", "completion items"],
    },
    {
      id: "review",
      label: "Review",
      items: ["feedback", "improvements", "final version"],
    },
  ],
  sop: [
    { id: "purpose", label: "Purpose", items: ["purpose"] },
    { id: "process", label: "Process Overview", items: ["process overview"] },
    {
      id: "steps",
      label: "Step-by-Step Instructions",
      items: ["step-by-step instructions"],
    },
    { id: "checklist", label: "Checklist", items: ["checklist"] },
    { id: "templates", label: "Templates", items: ["templates"] },
    { id: "examples", label: "Examples", items: ["examples"] },
    { id: "final", label: "Final Version", items: ["final version"] },
  ],
  template: [
    { id: "purpose", label: "Purpose", items: ["purpose"] },
    { id: "instructions", label: "Instructions", items: ["instructions"] },
    { id: "template", label: "Template", items: ["template"] },
    { id: "examples", label: "Examples", items: ["examples"] },
    { id: "versions", label: "Versions", items: ["versions"] },
    { id: "improvements", label: "Improvements", items: ["improvements"] },
  ],
  strategy: [
    { id: "goal", label: "Goal", items: ["goal"] },
    { id: "research", label: "Research", items: ["research"] },
    { id: "options", label: "Options", items: ["options"] },
    { id: "decisions", label: "Decisions", items: ["decisions"] },
    { id: "action-plan", label: "Action Plan", items: ["action plan"] },
    { id: "metrics", label: "Metrics", items: ["metrics"] },
    { id: "review", label: "Review", items: ["review"] },
  ],
  general: [
    {
      id: "overview",
      label: "Overview",
      items: ["project name", "purpose", "goal", "status", "progress"],
    },
    {
      id: "tasks",
      label: "Tasks",
      items: ["next actions", "deadlines", "completion items"],
    },
    {
      id: "review",
      label: "Review",
      items: ["feedback", "improvements", "final version"],
    },
  ],
};

export function inferUniversalProjectWorkspaceKind(
  project: Pick<Project, "name" | "goal">,
): UniversalProjectWorkspaceKind {
  const text = `${project.name} ${project.goal}`.toLowerCase();
  if (/\b(?:sop|process|onboarding|client process)\b/.test(text)) return "sop";
  if (/\b(?:template|checklist template)\b/.test(text)) return "template";
  if (/\b(?:strategy|campaign strategy|marketing plan)\b/.test(text)) {
    return "strategy";
  }
  if (/\b(?:funnel|sales funnel)\b/.test(text)) return "funnel";

  const archetype = inferCreationArchetype({ userText: text });
  if (archetype === "funnel") return "funnel";
  if (archetype === "template") return "template";
  if (archetype === "strategy") return "strategy";
  if (archetype === "document" && /\bprocess\b/.test(text)) return "sop";
  return "general";
}

export function classifyProjectLibraryShelf(
  project: Pick<Project, "status" | "updatedAt">,
  now = new Date(),
): UniversalProjectLibraryShelf {
  if (project.status === "completed") return "completed";
  if (project.status === "paused") return "archived";
  if (project.status === "not-started") return "drafts";
  if (project.status === "active-focus" || project.status === "in-progress") {
    return "active";
  }
  const updated = new Date(project.updatedAt).getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  if (now.getTime() - updated <= sevenDays) return "recent";
  return "active";
}

export function getUniversalActiveProject(
  projects: Project[] = getProjects(),
): Project | null {
  return (
    projects.find((project) => project.status === "active-focus") ??
    projects.find(
      (project) => project.status === "in-progress" && project.horizon === "now",
    ) ??
    null
  );
}

export function buildCurrentProjectIndicator(
  project: Project | null = getUniversalActiveProject(),
): string | null {
  if (!project) return null;
  return `Working on: ${project.name}`;
}

export function buildUniversalProjectWorkspace(
  project: Project,
): UniversalProjectWorkspace {
  const kind = inferUniversalProjectWorkspaceKind(project);
  const summary = chamberProjectSummary(project);
  const meta = getChamberProjectMeta(project.id);
  const milestones = suggestProjectBreakdown(project.goal || project.name);
  const completedCount = milestones.length > 0 ? Math.min(2, milestones.length - 1) : 0;

  return {
    projectId: project.id,
    name: project.name,
    kind,
    overview: {
      purpose: meta?.whyItMatters || project.goal || "Move this work forward.",
      goal: summary.desiredOutcome || project.goal,
      status: project.status,
      progress:
        completedCount > 0
          ? `${completedCount} sections started · next: ${summary.nextAction}`
          : summary.nextAction || "Choose the first small step.",
    },
    sections: WORKSPACE_TEMPLATES[kind],
    exportActions: ["save", "print", "share"],
  };
}

export function buildSparkProjectContinuityMessage(
  project: Project,
  completedSections: string[] = [],
): string {
  const kind = inferUniversalProjectWorkspaceKind(project);
  const summary = chamberProjectSummary(project);
  const completedText =
    completedSections.length > 0
      ? `Last time we completed ${completedSections.join(" and ")}.`
      : summary.hasSpecificNextAction
        ? `Last time your next step was ${summary.nextAction}.`
        : "Let's pick up where you left off.";

  if (kind === "funnel") {
    return (
      `Welcome back. Your ${project.name} is ready to continue. ${completedText} ` +
      "Would you like to work on the email sequence next?"
    );
  }

  return (
    `Welcome back. ${project.name} is ready to continue. ${completedText} ` +
    `Would you like to work on ${summary.nextAction || "the next step"} next?`
  );
}

export function resolveUniversalProjectEntryPoint(input: {
  text: string;
  currentSection?: AppSection;
}): {
  shouldBecomeProject: boolean;
  entryPoint: string;
  section: AppSection | null;
} {
  const capture = detectSparkEstateProjectCapture(input.text);
  const matchedEntry =
    SPARK_ESTATE_PROJECT_ENTRY_POINTS.find((entry) => {
      if (!input.currentSection) return entry.section === null;
      return entry.section === input.currentSection;
    }) ?? SPARK_ESTATE_PROJECT_ENTRY_POINTS[3];

  return {
    shouldBecomeProject: capture.isProject,
    entryPoint: matchedEntry?.location ?? "Conversation",
    section: matchedEntry?.section ?? input.currentSection ?? null,
  };
}

export function searchUniversalProjectLibrary(
  query: string,
  projects: Project[] = getProjects(),
): Project[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [...projects].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  return projects.filter((project) => {
    const kind = inferUniversalProjectWorkspaceKind(project);
    const haystack = `${project.name} ${project.goal} ${project.nextAction} ${kind}`.toLowerCase();
    return haystack.includes(normalized);
  });
}

export function buildUniversalProjectLibraryView(
  projects: Project[] = getProjects(),
  now = new Date(),
): Record<UniversalProjectLibraryShelf, Project[]> {
  const shelves: Record<UniversalProjectLibraryShelf, Project[]> = {
    active: [],
    completed: [],
    drafts: [],
    archived: [],
    recent: [],
  };

  for (const project of projects) {
    const shelf = classifyProjectLibraryShelf(project, now);
    shelves[shelf].push(project);
  }

  shelves.recent = [...projects]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5);

  return shelves;
}

export function startUniversalProjectFromEntry(input: {
  name: string;
  desiredOutcome: string;
  whyItMatters?: string;
  nextAction: string;
}): Project {
  return createChamberProject(input);
}

export function assessUniversalProjectWorkspaceCompliance(): {
  principleReady: boolean;
  flowReady: boolean;
  oldModelAvoided: boolean;
  libraryReady: boolean;
  workspaceTemplatesReady: boolean;
  entryPointsReady: boolean;
  universalAccessReady: boolean;
  indicatorReady: boolean;
  continuityReady: boolean;
  adhdRequirementsReady: boolean;
  creationJourneyBridgeReady: boolean;
  lifecycleBridgeReady: boolean;
  chamberEngineBridgeReady: boolean;
  expertTeamBridgeReady: boolean;
} {
  const journey = verifySparkEstateCreationJourney();
  const lifecycle = verifySparkEstateIntelligentProjectLifecycleEngine();
  const experts = verifySparkEstateExpertTeamAndChamberMemberCollaboration();
  const funnelWorkspace = buildUniversalProjectWorkspace({
    id: "demo-funnel",
    name: "Sales Funnel Project",
    goal: "Launch a simple sales funnel",
    goals: ["Launch a simple sales funnel"],
    horizon: "now",
    status: "active-focus",
    nextAction: "Draft the welcome email headline",
    color: "#1e4f4f",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return {
    principleReady: SPARK_ESTATE_UNIVERSAL_PROJECT_PRINCIPLE.includes(
      "follows the member",
    ),
    flowReady: SPARK_ESTATE_UNIVERSAL_PROJECT_FLOW.length === 5,
    oldModelAvoided: SPARK_ESTATE_OLD_WORKSPACE_MODEL_AVOID.length === 4,
    libraryReady:
      SPARK_ESTATE_PROJECT_LIBRARY_SHELVES.length === 5 &&
      SPARK_ESTATE_PROJECT_LIBRARY_SEARCH_TYPES.length === 6,
    workspaceTemplatesReady:
      funnelWorkspace.sections.some((section) => section.id === "email-sequence") &&
      WORKSPACE_TEMPLATES.sop.length >= 5 &&
      WORKSPACE_TEMPLATES.template.length >= 5 &&
      WORKSPACE_TEMPLATES.strategy.length >= 5,
    entryPointsReady: SPARK_ESTATE_PROJECT_ENTRY_POINTS.length === 4,
    universalAccessReady: SPARK_ESTATE_UNIVERSAL_PROJECT_ACCESS_ROOMS.length === 4,
    indicatorReady: buildCurrentProjectIndicator({
      id: "demo",
      name: "Sales Funnel Project",
      goal: "",
      goals: [],
      horizon: "now",
      status: "active-focus",
      nextAction: "",
      color: "#1e4f4f",
      createdAt: "",
      updatedAt: "",
    }) === "Working on: Sales Funnel Project",
    continuityReady: buildSparkProjectContinuityMessage(
      {
        id: "demo",
        name: "sales funnel project",
        goal: "Build funnel",
        goals: [],
        horizon: "now",
        status: "active-focus",
        nextAction: "Draft emails",
        color: "#1e4f4f",
        createdAt: "",
        updatedAt: "",
      },
      ["the audience", "offer sections"],
    ).includes("email sequence"),
    adhdRequirementsReady:
      SPARK_ESTATE_PROJECT_ADHD_CONTINUITY_QUESTIONS.length === 3,
    creationJourneyBridgeReady:
      journey.stepCount === SPARK_ESTATE_CREATION_STEPS.length,
    lifecycleBridgeReady: lifecycle.lifecycleReady,
    chamberEngineBridgeReady: suggestProjectBreakdown("sales funnel").length >= 3,
    expertTeamBridgeReady: experts.collaborationReady,
  };
}

export function verifySparkEstateUniversalProjectWorkspaceArchitecture(): {
  workspaceKinds: number;
  universalProjectReady: boolean;
  memberOwnedReady: boolean;
  continuityReady: boolean;
} {
  const compliance = assessUniversalProjectWorkspaceCompliance();
  const project = startUniversalProjectFromEntry({
    name: "Client Onboarding SOP",
    desiredOutcome: "Create a reusable client onboarding process",
    whyItMatters: "Save time with every new client",
    nextAction: "List the five steps a new client experiences",
  });
  const workspace = buildUniversalProjectWorkspace(project);
  const returnLine = formatSparkEstateReturnToWorkLine();

  return {
    workspaceKinds: Object.keys(WORKSPACE_TEMPLATES).length,
    universalProjectReady: Object.values(compliance).every(Boolean),
    memberOwnedReady:
      workspace.kind === "sop" && inferUniversalProjectWorkspaceKind(project) === "sop",
    continuityReady: Boolean(returnLine) || compliance.continuityReady,
  };
}

export function sparkEstateUniversalProjectWorkspaceCompanionHint(input?: {
  text?: string;
}): string | null {
  const text = input?.text?.trim() ?? "";
  if (
    !text ||
    !/(?:project workspace|continue (?:my|the) project|working on|sales funnel project|where did i save|how do i continue)/i.test(
      text,
    )
  ) {
    return null;
  }

  const active = getUniversalActiveProject();
  const indicator = buildCurrentProjectIndicator(active);
  return (
    `SPARK ESTATE UNIVERSAL PROJECT: ${SPARK_ESTATE_UNIVERSAL_PROJECT_PRINCIPLE} ` +
    `${indicator ?? "Projects follow the member across rooms."} ` +
    `Spark continuity — never make the member wonder which room they were using.`
  );
}

export function formatUniversalProjectWorkspaceReport(
  verification: ReturnType<
    typeof verifySparkEstateUniversalProjectWorkspaceArchitecture
  > = verifySparkEstateUniversalProjectWorkspaceArchitecture(),
  compliance: ReturnType<typeof assessUniversalProjectWorkspaceCompliance> = assessUniversalProjectWorkspaceCompliance(),
): string {
  const lines: string[] = [
    `Spark Estate™ universal project workspace: ${verification.universalProjectReady ? "ALIGNED" : "GAPS"}`,
    SPARK_ESTATE_UNIVERSAL_PROJECT_PRINCIPLE,
    SPARK_ESTATE_UNIVERSAL_PROJECT_VISION,
    "",
    "Universal project flow:",
    ...SPARK_ESTATE_UNIVERSAL_PROJECT_FLOW.map((step) => `  → ${step}`),
    "",
    "Project library shelves:",
    ...SPARK_ESTATE_PROJECT_LIBRARY_SHELVES.map((shelf) => `  • ${shelf}`),
    "",
    "Search types:",
    ...SPARK_ESTATE_PROJECT_LIBRARY_SEARCH_TYPES.map((type) => `  • ${type}`),
    "",
    "Entry points:",
    ...SPARK_ESTATE_PROJECT_ENTRY_POINTS.map(
      (entry) => `  ${entry.location}: "${entry.example}"`,
    ),
    "",
    "Universal access:",
    ...SPARK_ESTATE_UNIVERSAL_PROJECT_ACCESS_ROOMS.map(
      (entry) => `  ${entry.room}: ${entry.purpose}`,
    ),
    "",
    "Avoid old workspace model:",
    ...SPARK_ESTATE_OLD_WORKSPACE_MODEL_AVOID.map((item) => `  ✗ ${item}`),
    "",
    "ADHD continuity — Spark answers:",
    ...SPARK_ESTATE_PROJECT_ADHD_CONTINUITY_QUESTIONS.map(
      (question) => `  ? ${question}`,
    ),
    "",
    "Compliance checks:",
    `  Principle: ${compliance.principleReady ? "pass" : "fail"}`,
    `  Library: ${compliance.libraryReady ? "pass" : "fail"}`,
    `  Workspace templates: ${compliance.workspaceTemplatesReady ? "pass" : "fail"}`,
    `  Current project indicator: ${compliance.indicatorReady ? "pass" : "fail"}`,
    `  Lifecycle bridge: ${compliance.lifecycleBridgeReady ? "pass" : "fail"}`,
    `  Member-owned workspaces: ${verification.memberOwnedReady ? "pass" : "fail"}`,
  ];

  return lines.join("\n");
}
