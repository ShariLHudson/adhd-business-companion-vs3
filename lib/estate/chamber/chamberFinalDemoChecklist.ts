/**
 * Chamber of Momentum™ — final demo checklist (Phase 9).
 * Priority-ordered readiness checks before demonstration.
 *
 * @see docs/protocols/CHAMBER_OF_MOMENTUM_FINAL_DEMO_CHECKLIST_AND_PRIORITY_FIX_ORDER_PHASE9.md
 */

import { SPARK_NOTE_DESTINATION_ROUTES } from "@/lib/sparkNote/sparkNoteDestinations";
import { workspaceAreaTitle } from "@/lib/workspaceMode";
import { ESTATE_ROOM_BG_BY_ROOM_ID } from "@/lib/estate/estateRoomAssets";
import {
  CHAMBER_OF_MOMENTUM_MEMBER_NAME,
  CHAMBER_OF_MOMENTUM_SECTION,
} from "../chamberOfMomentumIdentity";
import {
  CHAMBER_ENTRY_OPTIONS,
  CHAMBER_ENTRY_PROMPT,
  CHAMBER_WELCOME_TITLE,
  chamberMomentumIntentSection,
  classifyChamberMomentumIntent,
} from "../chamberOfMomentumRouting";
import {
  CHAMBER_OF_MOMENTUM_ROOM_BG,
  CHAMBER_OF_MOMENTUM_ROOM_META,
} from "./chamberOfMomentumRoomRegistry";
import { COMPANION_CHAMBER_DEMO_HREF } from "./chamberDemoMode";
import { verifyChamberDemoAssets } from "./seedChamberDemoData";

export type ChamberDemoCheckPriority = "must-fix" | "important" | "can-wait";

export type ChamberDemoCheckItem = {
  id: string;
  priority: ChamberDemoCheckPriority;
  label: string;
  passed: boolean;
  detail?: string;
};

export type ChamberFinalDemoChecklistResult = {
  readyForDemo: boolean;
  mustFix: ChamberDemoCheckItem[];
  important: ChamberDemoCheckItem[];
  canWait: ChamberDemoCheckItem[];
  demoHref: string;
};

function check(
  id: string,
  priority: ChamberDemoCheckPriority,
  label: string,
  passed: boolean,
  detail?: string,
): ChamberDemoCheckItem {
  return { id, priority, label, passed, detail };
}

function chamberMemberFacingTitle(section: string): string {
  return workspaceAreaTitle(section as Parameters<typeof workspaceAreaTitle>[0]);
}

/** Priority 1 — must pass before demo. */
function runMustFixChecks(): ChamberDemoCheckItem[] {
  const chamberSections = [
    CHAMBER_OF_MOMENTUM_SECTION,
    "chamber-project-entry",
    "momentum-institute",
    "momentum-builder",
  ] as const;

  const identityConsistent = chamberSections.every(
    (section) => chamberMemberFacingTitle(section) === CHAMBER_OF_MOMENTUM_MEMBER_NAME,
  );

  const roomBgMatches =
    CHAMBER_OF_MOMENTUM_ROOM_BG ===
      ESTATE_ROOM_BG_BY_ROOM_ID[CHAMBER_OF_MOMENTUM_SECTION] &&
    CHAMBER_OF_MOMENTUM_ROOM_BG.includes("spark-chamber-of-momentum-background");

  const sparkRoutesOk =
    SPARK_NOTE_DESTINATION_ROUTES.momentum.includes(CHAMBER_OF_MOMENTUM_SECTION) &&
    SPARK_NOTE_DESTINATION_ROUTES["momentum-project"].includes(
      CHAMBER_OF_MOMENTUM_SECTION,
    );

  const entryWelcomeOk =
    CHAMBER_WELCOME_TITLE.includes("Chamber of Momentum") &&
    CHAMBER_WELCOME_TITLE.toLowerCase().includes("welcome");

  const entryPromptOk = CHAMBER_ENTRY_PROMPT.includes("move forward");
  const entryChoicesOk = CHAMBER_ENTRY_OPTIONS.length === 5;

  const stuckRoutesToBuilder =
    chamberMomentumIntentSection("build") === "momentum-builder";
  const executeRoutesToProjectDoorway =
    chamberMomentumIntentSection("execute") === "chamber-project-entry";
  const stuckPhraseRoutes =
    classifyChamberMomentumIntent("I feel stuck") === "build";

  return [
    check(
      "identity-labels",
      "must-fix",
      "Chamber of Momentum™ has one clear member-facing name",
      identityConsistent,
      identityConsistent
        ? undefined
        : "Workspace titles must all read Chamber of Momentum™",
    ),
    check(
      "room-image-route",
      "must-fix",
      "Chamber room name, image, and route align",
      roomBgMatches,
      CHAMBER_OF_MOMENTUM_ROOM_META.background,
    ),
    check(
      "navigation-sections",
      "must-fix",
      "Chamber doorway and intent routes are wired",
      stuckRoutesToBuilder &&
        executeRoutesToProjectDoorway &&
        stuckPhraseRoutes,
    ),
    check(
      "spark-card-routing",
      "must-fix",
      "Spark Card momentum actions route to Chamber doorway",
      sparkRoutesOk,
    ),
    check(
      "entry-welcome",
      "must-fix",
      'Entry shows "Welcome to the Chamber of Momentum™"',
      entryWelcomeOk,
      CHAMBER_WELCOME_TITLE,
    ),
    check(
      "entry-question",
      "must-fix",
      'Entry asks "What would help you move forward today?"',
      entryPromptOk,
      CHAMBER_ENTRY_PROMPT,
    ),
    check(
      "entry-choices",
      "must-fix",
      "Entry offers five simple doorway choices",
      entryChoicesOk,
      `${CHAMBER_ENTRY_OPTIONS.length} choices`,
    ),
  ];
}

/** Priority 2 — improve demo quality; session-based OK. */
function runImportantChecks(includeDemoAssets: boolean): ChamberDemoCheckItem[] {
  const demoAssets = includeDemoAssets ? verifyChamberDemoAssets() : null;

  return [
    check(
      "demo-assets",
      "important",
      "Demo project, wins, evidence, and momentum path exist",
      includeDemoAssets ? (demoAssets?.ok ?? false) : true,
      demoAssets?.missing.join(", "),
    ),
    check(
      "stuck-choice-label",
      "important",
      '"I feel stuck" appears as a doorway choice',
      CHAMBER_ENTRY_OPTIONS.some((option) => option.label === "I feel stuck"),
    ),
    check(
      "project-choice-label",
      "important",
      '"I want to work on a project" opens project doorway',
      CHAMBER_ENTRY_OPTIONS.some((option) => option.id === "execute"),
    ),
    check(
      "learn-choice-label",
      "important",
      '"I want to learn" routes to institute',
      chamberMomentumIntentSection("learn") === "momentum-institute",
    ),
  ];
}

/** Priority 3 — documented deferrals (always pass; not demo blockers). */
function runCanWaitChecks(): ChamberDemoCheckItem[] {
  return [
    check(
      "advanced-analytics",
      "can-wait",
      "Advanced analytics",
      true,
      "Deferred post-demo",
    ),
    check(
      "database-migration",
      "can-wait",
      "Full database migration",
      true,
      "Deferred post-demo",
    ),
    check(
      "deep-ai-memory",
      "can-wait",
      "Deeper AI memory",
      true,
      "Deferred post-demo",
    ),
    check(
      "full-knowledge-library",
      "can-wait",
      "Complete Knowledge Card library",
      true,
      "Deferred post-demo",
    ),
  ];
}

export function runChamberFinalDemoChecklist(options?: {
  requireDemoAssets?: boolean;
}): ChamberFinalDemoChecklistResult {
  const mustFix = runMustFixChecks();
  const important = runImportantChecks(options?.requireDemoAssets ?? false);
  const canWait = runCanWaitChecks();
  const mustFixPassed = mustFix.every((item) => item.passed);
  const importantPassed = important.every((item) => item.passed);

  return {
    readyForDemo: mustFixPassed && importantPassed,
    mustFix,
    important,
    canWait,
    demoHref: COMPANION_CHAMBER_DEMO_HREF,
  };
}

/** Scripted demo flow steps from Phase 9 — routing verification. */
export function verifyChamberDemoFlowSteps(): ChamberDemoCheckItem[] {
  return [
    check(
      "flow-stuck",
      "must-fix",
      'Step 4: "I feel stuck" opens Momentum Builder',
      chamberMomentumIntentSection("build") === "momentum-builder",
    ),
    check(
      "flow-project",
      "must-fix",
      'Step 5: "I want to work on a project" opens project experience',
      chamberMomentumIntentSection("execute") === "chamber-project-entry",
    ),
    check(
      "flow-learn",
      "important",
      'Step 3 alt: "I want to learn" opens institute',
      chamberMomentumIntentSection("learn") === "momentum-institute",
    ),
  ];
}

export function formatChamberDemoChecklistReport(
  result: ChamberFinalDemoChecklistResult,
): string {
  const lines: string[] = [
    `Chamber of Momentum™ demo readiness: ${result.readyForDemo ? "READY" : "NOT READY"}`,
    `Demo URL: ${result.demoHref}`,
    "",
    "Priority 1 — Must fix before demo:",
  ];

  for (const item of result.mustFix) {
    lines.push(`  ${item.passed ? "✓" : "✗"} ${item.label}${item.detail ? ` — ${item.detail}` : ""}`);
  }

  lines.push("", "Priority 2 — Important:");
  for (const item of result.important) {
    lines.push(`  ${item.passed ? "✓" : "✗"} ${item.label}${item.detail ? ` — ${item.detail}` : ""}`);
  }

  return lines.join("\n");
}
