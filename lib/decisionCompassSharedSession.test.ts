import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  advanceDecisionCompass,
  emptyDecisionCompassState,
  setDecisionType,
} from "./decisionCompass";
import {
  applyUserChatToAuthority,
  createDecisionCompassAuthority,
  decisionCompassOpensBesideChat,
  decisionCompassResumeOpener,
  decisionCompassWorkspaceHint,
  enrichAuthority,
  isCompassFieldAnswered,
  loadDecisionCompassAuthority,
  saveDecisionCompassAuthority,
  shouldChatAskCompassStep,
} from "./decisionCompassSessionAuthority";
import {
  clearDecisionCompassSession,
  panelStateFromSnapshot,
  snapshotFromPanelState,
} from "./decisionCompassSessionStore";
import { currentStep } from "./decisionCompass";
import {
  freshWorkspaceChatMessages,
  isPurityScopedSection,
  resolveWorkspaceOpener,
} from "./workspaceChatPurity";
import { WORKSPACE_SECTIONS } from "./workspaceMode";

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
}

describe("decisionCompass shared session", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    stubStorage();
    clearDecisionCompassSession();
  });

  it("Decision Compass opens beside chat", () => {
    expect(WORKSPACE_SECTIONS).toContain("decision-compass");
    expect(isPurityScopedSection("decision-compass")).toBe(true);
    expect(decisionCompassOpensBesideChat()).toEqual({
      section: "decision-compass",
      layout: "split",
    });
  });

  it("conversation purity preserved for decision compass", () => {
    const prior = [{ role: "user" as const, content: "Help me write a blog post" }];
    expect(prior.some((m) => m.content.includes("blog"))).toBe(true);
    const opener = resolveWorkspaceOpener("decision-compass");
    const scoped = freshWorkspaceChatMessages(opener);
    expect(scoped.some((m) => m.content.includes("blog"))).toBe(false);
    expect(scoped).toHaveLength(1);
  });

  it("authority holds decision, options, step, and recommendation fields", () => {
    let state = emptyDecisionCompassState();
    state = advanceDecisionCompass(state, { decision: "Hire or wait?" });
    state = advanceDecisionCompass(state, {
      options: "Hire a VA\n---\nKeep doing it myself",
    });
    state = setDecisionType(state, "strategic");
    state = advanceDecisionCompass(state);
    const authority = enrichAuthority(
      snapshotFromPanelState(
        state,
        "Hire a VA",
        "Keep doing it myself",
        "",
        "sess-1",
      ),
    );
    expect(authority.decision).toBe("Hire or wait?");
    expect(authority.optionA).toBe("Hire a VA");
    expect(authority.optionB).toBe("Keep doing it myself");
    expect(authority.decisionType).toBe("strategic");
    expect(authority.visualThinking.branches.length).toBeGreaterThanOrEqual(3);
  });

  it("chat answer updates shared authority — options from or phrase", () => {
    const authority = createDecisionCompassAuthority({
      decision: "What should I do about help?",
    });
    const panel = panelStateFromSnapshot(authority);
    expect(currentStep(panel.state)?.id).toBe("options");

    const result = applyUserChatToAuthority(
      authority,
      "Hire a VA or continue doing it myself",
    );
    expect(result.changed).toBe(true);
    expect(result.authority.optionA).toMatch(/hire a va/i);
    expect(result.authority.optionB).toMatch(/continue/i);
    expect(isCompassFieldAnswered(result.authority, "options")).toBe(true);
  });

  it("panel snapshot updates authority fields", () => {
    const authority = createDecisionCompassAuthority();
    let state = panelStateFromSnapshot(authority).state;
    state = advanceDecisionCompass(state, { decision: "Launch now?" });
    const updated = enrichAuthority(
      snapshotFromPanelState(state, "", "", "", authority.sessionId),
    );
    expect(updated.decision).toBe("Launch now?");
    expect(updated.updatedAt).toBeTruthy();
  });

  it("chat workspace hint sees current decision and options", () => {
    const authority = createDecisionCompassAuthority({
      decision: "Hire or DIY?",
      optionA: "Hire a VA",
      optionB: "Do it myself",
    });
    const hint = decisionCompassWorkspaceHint(authority)!;
    expect(hint).toMatch(/Hire or DIY/i);
    expect(hint).toMatch(/Option A/i);
    expect(hint).toMatch(/Option B/i);
    expect(hint).toMatch(/SHARED SESSION/i);
  });

  it("chat workspace hint sees current step", () => {
    const authority = createDecisionCompassAuthority({
      decision: "Pick a path",
      optionA: "A",
      optionB: "B",
    });
    const hint = decisionCompassWorkspaceHint(authority)!;
    expect(hint).toMatch(/Current step|Panel step/i);
  });

  it("does not ask duplicate questions when field already answered", () => {
    const authority = createDecisionCompassAuthority({
      decision: "Already decided",
      optionA: "One",
      optionB: "Two",
    });
    const panel = panelStateFromSnapshot(authority);
    const step = currentStep(panel.state);
    expect(shouldChatAskCompassStep(authority, step)).toBe(true);
    expect(isCompassFieldAnswered(authority, "decision")).toBe(true);
    expect(isCompassFieldAnswered(authority, "options")).toBe(true);
    const hint = decisionCompassWorkspaceHint(authority)!;
    expect(hint).toMatch(/Do NOT ask/i);
  });

  it("resume restores session state from storage", () => {
    const authority = createDecisionCompassAuthority({
      decision: "Membership or course?",
      optionA: "Membership",
      optionB: "Course",
    });
    saveDecisionCompassAuthority(authority);
    const loaded = loadDecisionCompassAuthority();
    expect(loaded?.decision).toBe("Membership or course?");
    expect(loaded?.optionA).toBe("Membership");
  });

  it("resume opener includes decision context", () => {
    const authority = createDecisionCompassAuthority({
      decision: "Hire help?",
      optionA: "Yes",
      optionB: "No",
    });
    const opener = decisionCompassResumeOpener(authority);
    expect(opener).toMatch(/Welcome back/i);
    expect(opener).toMatch(/Hire help/i);
  });

  it("recommendation survives refresh via persistence", () => {
    let state = emptyDecisionCompassState();
    state = advanceDecisionCompass(state, { decision: "A or B?" });
    state = advanceDecisionCompass(state, { options: "A\n---\nB" });
    state = setDecisionType(state, "action");
    state = advanceDecisionCompass(state);
    state = advanceDecisionCompass(state, { "first-hour-a": "x" });
    state = advanceDecisionCompass(state, { "first-hour-b": "y" });
    state = advanceDecisionCompass(state, { clearer: "A" });
    state = advanceDecisionCompass(state, { momentum: "A" });
    const authority = enrichAuthority(
      snapshotFromPanelState(state, "A", "B", "", "rec-1"),
    );
    expect(authority.recommendation?.choice).toBe("A");
    saveDecisionCompassAuthority(authority);
    const loaded = loadDecisionCompassAuthority();
    expect(loaded?.recommendation?.choice).toBe("A");
    expect(loaded?.complete).toBe(true);
  });

  it("visual thinking snapshot prepares branches and tradeoffs", () => {
    const authority = createDecisionCompassAuthority({
      decision: "Grow or pause?",
      optionA: "Grow",
      optionB: "Pause",
    });
    expect(authority.visualThinking.decision).toBe("Grow or pause?");
    expect(authority.visualThinking.branches.some((b) => b.side === "a")).toBe(
      true,
    );
  });
});
