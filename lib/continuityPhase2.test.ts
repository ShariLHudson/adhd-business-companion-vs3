import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  advanceDecisionCompass,
  emptyDecisionCompassState,
  setDecisionType,
} from "./decisionCompass";
import {
  clearDecisionCompassSession,
  loadDecisionCompassSession,
  panelStateFromSnapshot,
  saveDecisionCompassSession,
  snapshotFromPanelState,
} from "./decisionCompassSessionStore";
import {
  bootstrapStrategyApplySession,
  processStrategyApplyTurn,
} from "./strategyApplyCoach";
import {
  clearStrategyApplySession,
  loadStrategyApplySession,
  saveStrategyApplySession,
  toStrategyApplySession,
} from "./strategyApplySessionStore";
import {
  clearProjectContinuity,
  loadProjectContinuity,
  saveProjectContinuity,
} from "./projectContinuityStore";
import { buildContinuityManifest } from "./continuityManifest";
import { findLatestHomeResumeItem } from "./homeResumeItem";
import { resumeReceiptForContinuityType } from "./continuityRecovery";

function stubStorage() {
  const localMem = new Map<string, string>();
  const localStorage = {
    getItem: (k: string) => localMem.get(k) ?? null,
    setItem: (k: string, v: string) => localMem.set(k, v),
    removeItem: (k: string) => localMem.delete(k),
    clear: () => localMem.clear(),
  };
  vi.stubGlobal("localStorage", localStorage);
  vi.stubGlobal("window", { localStorage });
  return localStorage;
}

describe("Decision Compass continuity", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    stubStorage();
  });

  it("survives refresh (persist + reload)", () => {
    let state = emptyDecisionCompassState();
    state = {
      ...state,
      stepIndex: 1,
      answers: { decision: "Should I launch now?" },
    };
    const snap = snapshotFromPanelState(state, "Launch", "Wait", "Launch");
    saveDecisionCompassSession(snap);

    const loaded = loadDecisionCompassSession();
    expect(loaded?.decision).toBe("Should I launch now?");
    expect(loaded?.optionA).toBe("Launch");
    expect(loaded?.currentStepId).toBe("options");

    const restored = panelStateFromSnapshot(loaded!);
    expect(restored.state.answers.decision).toBe("Should I launch now?");
    expect(restored.optionA).toBe("Launch");
  });

  it("appears in Home Resume when in progress", () => {
    let state = emptyDecisionCompassState();
    state = {
      ...state,
      stepIndex: 2,
      answers: {
        decision: "Hire or wait?",
        options: "Hire\n---\nWait",
      },
    };
    saveDecisionCompassSession(
      snapshotFromPanelState(state, "Hire", "Wait", ""),
    );

    const manifest = buildContinuityManifest();
    expect(manifest.items.some((i) => i.type === "decision-compass")).toBe(
      true,
    );

    const home = findLatestHomeResumeItem();
    expect(home?.kind).toBe("decision-compass");
    expect(home?.title).toMatch(/Hire or wait/i);
  });

  it("keeps completed sessions when a recommendation exists", () => {
    let state = emptyDecisionCompassState();
    state = setDecisionType(state, "action");
    state = advanceDecisionCompass(state);
    state = { ...state, complete: true };
    saveDecisionCompassSession(
      snapshotFromPanelState(state, "A", "B", ""),
    );
    const loaded = loadDecisionCompassSession();
    expect(loaded).not.toBeNull();
    expect(loaded?.recommendation).toBeTruthy();
    expect(loaded?.complete).toBe(true);
    clearDecisionCompassSession();
  });
});

describe("Strategy Apply continuity", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    stubStorage();
  });

  it("survives refresh at the same question with prior answers", () => {
    const boot = bootstrapStrategyApplySession("ugly-first-draft", {
      activeProjectName: "Launch",
    });
    expect(boot).not.toBeNull();
    const turn = processStrategyApplyTurn(boot!.session, "My cluttered list");
    saveStrategyApplySession(turn.session);

    const loaded = loadStrategyApplySession();
    expect(loaded?.strategyId).toBe("ugly-first-draft");
    expect(loaded?.questionIndex).toBe(turn.session.questionIndex);
    expect(loaded?.answers).toEqual(turn.session.answers);

    const restored = toStrategyApplySession(loaded!);
    expect(restored.questionIndex).toBe(turn.session.questionIndex);
    expect(restored.answers).toEqual(turn.session.answers);
  });

  it("appears in Home Resume after answering a question", () => {
    const boot = bootstrapStrategyApplySession("ugly-first-draft");
    expect(boot).not.toBeNull();
    const turn = processStrategyApplyTurn(boot!.session, "My cluttered list");
    saveStrategyApplySession(turn.session);

    const manifest = buildContinuityManifest();
    expect(manifest.items.some((i) => i.type === "strategy-apply")).toBe(
      true,
    );

    const home = findLatestHomeResumeItem();
    expect(home?.kind).toBe("strategy");
  });

  it("clears on explicit clear", () => {
    const boot = bootstrapStrategyApplySession("ugly-first-draft");
    saveStrategyApplySession(boot!.session);
    clearStrategyApplySession();
    expect(loadStrategyApplySession()).toBeNull();
  });
});

describe("Project continuity", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    stubStorage();
  });

  it("persists selected project across reload", () => {
    saveProjectContinuity({
      projectContinueId: "p-marketing",
      projectName: "Marketing Project",
      view: "detail",
      workspacePanelOpen: true,
    });

    const loaded = loadProjectContinuity();
    expect(loaded?.projectContinueId).toBe("p-marketing");
    expect(loaded?.projectName).toBe("Marketing Project");
    expect(loaded?.view).toBe("detail");

    clearProjectContinuity();
    expect(loadProjectContinuity()).toBeNull();
  });
});

describe("Continuity Manifest phase 2 types", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    stubStorage();
  });

  it("includes decision compass and strategy apply session types", () => {
    let state = emptyDecisionCompassState();
    state = {
      ...state,
      stepIndex: 1,
      answers: { decision: "Pick a path" },
    };
    saveDecisionCompassSession(snapshotFromPanelState(state, "", "", "Pick a path"));

    const boot = bootstrapStrategyApplySession("ugly-first-draft");
    saveStrategyApplySession(boot!.session);

    const types = buildContinuityManifest().items.map((i) => i.type);
    expect(types).toContain("decision-compass");
    expect(types).toContain("strategy-apply");
  });
});

describe("Resume receipts", () => {
  it("returns friendly one-line welcome messages", () => {
    expect(resumeReceiptForContinuityType("decision-compass")).toMatch(
      /Decision Compass/i,
    );
    expect(
      resumeReceiptForContinuityType("strategy-apply", "Brain Parking Lot"),
    ).toMatch(/Strategy Apply/i);
    expect(
      resumeReceiptForContinuityType("project", "Marketing Project"),
    ).toMatch(/Marketing Project/);
  });
});
