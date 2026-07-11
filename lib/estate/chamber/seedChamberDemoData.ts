/**
 * Chamber of Momentum — idempotent demo data seed (Phase 8).
 */

import {
  getProjects,
  logMomentum,
  saveProject,
  saveProjectItem,
} from "@/lib/companionStore";
import { getEvidenceEntries, createEvidenceEntry } from "@/lib/evidenceBankStore";
import { createSavedGrowthWin, getSavedGrowthWins } from "@/lib/growthWinsStore";
import {
  readMomentumPathMilestones,
  recordMomentumPathMilestone,
} from "@/lib/momentumBuilderRoom/momentumPathHooks";
import { seedProjectChunks } from "@/lib/projects/seedProjectChunks";
import {
  recordChamberPatternObservation,
  saveChamberPreference,
} from "../chamberOfMomentumMemory";
import { saveChamberProjectMeta } from "../chamberProjectMeta";
import {
  CHAMBER_DEMO_EVIDENCE,
  CHAMBER_DEMO_MOMENTUM_PATH,
  CHAMBER_DEMO_PROGRESS_WINS,
  CHAMBER_DEMO_WEBSITE_PROJECT,
  CHAMBER_DEMO_WORKSHOP_IDEA,
} from "./chamberDemoContent";

export const CHAMBER_DEMO_MARKER_KEY = "chamber-demo-prepared-v1";

export type ChamberDemoMarker = {
  websiteProjectId: string;
  ideaEvidenceId?: string;
  preparedAt: string;
};

function readMarker(): ChamberDemoMarker | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHAMBER_DEMO_MARKER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ChamberDemoMarker;
  } catch {
    return null;
  }
}

function writeMarker(marker: ChamberDemoMarker): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHAMBER_DEMO_MARKER_KEY, JSON.stringify(marker));
  } catch {
    /* quota */
  }
}

export function isChamberDemoPrepared(): boolean {
  const marker = readMarker();
  if (!marker?.websiteProjectId) return false;
  return getProjects().some((project) => project.id === marker.websiteProjectId);
}

export function getChamberDemoMarker(): ChamberDemoMarker | null {
  if (!isChamberDemoPrepared()) return null;
  return readMarker();
}

export function verifyChamberDemoAssets(): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  const marker = getChamberDemoMarker();
  if (!marker) {
    missing.push("demo marker");
  } else {
    const project = getProjects().find((entry) => entry.id === marker.websiteProjectId);
    if (!project) missing.push("example project");
    else if (!project.nextAction.trim()) missing.push("example next action");
  }
  if (getSavedGrowthWins().length === 0) missing.push("example win");
  if (getEvidenceEntries().length === 0) missing.push("example evidence");
  if (readMomentumPathMilestones().length === 0) missing.push("example momentum path");
  return { ok: missing.length === 0, missing };
}

/** Seed believable demo content once — safe to call on every demo entry. */
export function ensureChamberDemoDataSeeded(): boolean {
  if (typeof window === "undefined") return false;
  if (isChamberDemoPrepared()) return false;

  const now = new Date().toISOString();
  const projects = saveProject({
    name: CHAMBER_DEMO_WEBSITE_PROJECT.name,
    goal: CHAMBER_DEMO_WEBSITE_PROJECT.goal,
    goals: [CHAMBER_DEMO_WEBSITE_PROJECT.goal],
    nextAction: CHAMBER_DEMO_WEBSITE_PROJECT.nextAction,
    status: "active-focus",
    horizon: "now",
  });
  const websiteProject = projects[0]!;

  seedProjectChunks(websiteProject.id, [
    ...CHAMBER_DEMO_WEBSITE_PROJECT.milestones,
  ]);

  saveChamberProjectMeta({
    projectId: websiteProject.id,
    momentumState: "active",
    desiredOutcome: CHAMBER_DEMO_WEBSITE_PROJECT.goal,
    whyItMatters: "So clients understand my services quickly.",
    currentStateNote: "Outline is done — homepage copy is next.",
  });

  saveProject({
    name: "Coaching program refresh",
    goal: "Clarify the offer and pricing for the next launch.",
    nextAction: "List three outcomes clients want most",
    status: "in-progress",
    horizon: "soon",
  });

  for (const [index, label] of CHAMBER_DEMO_PROGRESS_WINS.entries()) {
    const ts = new Date(Date.now() - (index + 2) * 86400000).toISOString();
    createSavedGrowthWin({
      whatHappened: label,
      ts,
      icon: index === 0 ? "✅" : "🚀",
      sourceId: websiteProject.id,
      attachments: [],
    });
    logMomentum("complete", label);
  }

  for (const entry of CHAMBER_DEMO_EVIDENCE) {
    createEvidenceEntry({
      category: "Moved Forward",
      whatHappened: entry.whatHappened,
      whatImproved: "Confidence and clarity",
      whatMovedForward: CHAMBER_DEMO_WEBSITE_PROJECT.goal,
      whatProblemSolved: "",
      whoBenefited: "Me and my clients",
      whyItMattered: "Proof that progress is real.",
      whatThisProves: entry.whatThisProves,
      attachments: [],
      originatedFromKind: "project",
      originatedFromId: websiteProject.id,
    });
  }

  const ideaEvidence = createEvidenceEntry({
    category: "Business Growth",
    whatHappened: CHAMBER_DEMO_WORKSHOP_IDEA,
    whatImproved: "Captured without losing focus on current work",
    whatMovedForward: "Future offer exploration",
    whatProblemSolved: "",
    whoBenefited: "Future clients",
    whyItMattered: "Ideas are safe here until I am ready.",
    whatThisProves: "I can capture ideas without derailing momentum.",
    attachments: [],
    originatedFromKind: "thought",
  });

  recordMomentumPathMilestone({
    id: "chamber-demo-first-step",
    milestoneKind: "first_step_taken",
    label: CHAMBER_DEMO_MOMENTUM_PATH.firstStep,
    recordedAt: now,
    todaysPathId: websiteProject.id,
  });
  recordMomentumPathMilestone({
    id: "chamber-demo-easy-win",
    milestoneKind: "easy_win_completed",
    label: CHAMBER_DEMO_MOMENTUM_PATH.easyWin,
    recordedAt: now,
  });
  recordMomentumPathMilestone({
    id: "chamber-demo-focus-session",
    milestoneKind: "focus_session_honored",
    label: CHAMBER_DEMO_MOMENTUM_PATH.focusSession,
    recordedAt: now,
  });
  recordMomentumPathMilestone({
    id: "chamber-demo-roadblock",
    milestoneKind: "roadblock_named",
    label: CHAMBER_DEMO_MOMENTUM_PATH.roadblock,
    recordedAt: now,
  });

  recordChamberPatternObservation(
    "small-first-step",
    CHAMBER_DEMO_MOMENTUM_PATH.firstStep,
  );
  recordChamberPatternObservation("small-first-step");
  recordChamberPatternObservation("encouragement");
  saveChamberPreference("planning-style", "small steps first");

  saveProjectItem({
    projectId: websiteProject.id,
    kind: "task",
    title: "Draft homepage headline options",
    parentId: undefined,
  });

  writeMarker({
    websiteProjectId: websiteProject.id,
    ideaEvidenceId: ideaEvidence.id,
    preparedAt: now,
  });

  return true;
}
