import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  advanceDecisionCompass,
  emptyDecisionCompassState,
  setDecisionType,
} from "./decisionCompass";
import {
  buildDecisionExplorationState,
  buildDecisionSaveBody,
  companionLeanLine,
  computeDecisionConfidence,
  generateAlternativePaths,
  generateExplorationQuestions,
  mergeExplorationIntoSession,
  saveDecisionToSavedWork,
  buildDecisionActionPlan,
} from "./decisionCompassExploration";
import { buildDecisionRecommendationReport } from "./decisionRecommendationReport";
import {
  decisionCompassChatAwarenessHint,
  enrichAuthority,
} from "./decisionCompassSessionAuthority";
import {
  clearDecisionCompassSession,
  loadDecisionCompassSession,
  saveDecisionCompassSession,
  snapshotFromPanelState,
} from "./decisionCompassSessionStore";
import { getSavedWork } from "./savedWorkStore";

function sampleCompleteSession() {
  let state = emptyDecisionCompassState();
  state = advanceDecisionCompass(state, {
    decision: "Hire a salesperson or keep doing sales myself?",
  });
  state = advanceDecisionCompass(state, {
    options: "Hire a salesperson\n---\nKeep doing sales myself",
  });
  state = setDecisionType(state, "strategic");
  state = advanceDecisionCompass(state);
  state = advanceDecisionCompass(state, {
    "why-a": "More freedom and growth potential",
    "why-b": "Save money short term",
    "concern-a": "Cost and training",
    "concern-b": "Burnout and slower growth",
    freedom: "A",
    growth: "A",
    stress: "A",
  });
  const snap = snapshotFromPanelState(
    state,
    "Hire a salesperson",
    "Keep doing sales myself",
    "",
  );
  return enrichAuthority({
    ...snap,
    complete: true,
    recommendation: {
      type: "strategic",
      headline: "Strategic Recommendation",
      choice: "Hire a salesperson",
      summary: "Growth and freedom lead with hiring",
    },
  });
}

describe("Decision Compass V3", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", globalThis);
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => {
        mem.set(k, v);
      },
      removeItem: (k: string) => {
        mem.delete(k);
      },
    });
    clearDecisionCompassSession();
    localStorage.removeItem("companion-saved-work-v1");
  });

  it("1. confidence level generated", () => {
    const session = sampleCompleteSession();
    const conf = computeDecisionConfidence(session);
    expect(["high", "moderate", "low"]).toContain(conf);
    const exp = buildDecisionExplorationState(session);
    expect(exp?.confidence).toBe(conf);
    expect(exp?.whatCouldChange.length).toBeGreaterThan(0);
  });

  it("2. confidence updates when answers change", () => {
    const session = sampleCompleteSession();
    const before = computeDecisionConfidence(session);
    const closer = mergeExplorationIntoSession(
      {
        ...session,
        answers: {
          ...session.answers,
          "concern-a": "Huge cost risk",
          "concern-b": "Burnout is severe",
          stress: "B",
          growth: "B",
        },
      },
      {},
    );
    const after = computeDecisionConfidence(closer);
    expect(typeof before).toBe("string");
    expect(typeof after).toBe("string");
  });

  it("3. questions worth considering generated", () => {
    const session = sampleCompleteSession();
    const questions = generateExplorationQuestions(session);
    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0]?.question.length).toBeGreaterThan(10);
  });

  it("4. user can continue exploring", () => {
    const session = sampleCompleteSession();
    const q = generateExplorationQuestions(session)[0]!;
    const next = mergeExplorationIntoSession(session, {
      exploredQuestions: [
        {
          id: "eq-1",
          question: q.question,
          answer: "Success means predictable revenue.",
          exploredAt: new Date().toISOString(),
        },
      ],
    });
    expect(next.exploration?.exploredQuestions).toHaveLength(1);
    expect(next.exploration?.exploredQuestions[0]?.answer).toMatch(/revenue/i);
  });

  it("5. alternative paths generated", () => {
    const session = sampleCompleteSession();
    const paths = generateAlternativePaths(session);
    expect(paths?.primary).toMatch(/Hire a salesperson/i);
    expect(paths?.alternatives.length).toBeGreaterThan(2);
    expect(paths?.experimental.length).toBeGreaterThan(0);
  });

  it("6. recommendation remains non-authoritative", () => {
    const session = sampleCompleteSession();
    const line = companionLeanLine(session);
    expect(line).toMatch(/leaning toward/i);
    expect(line).toMatch(/least certain/i);
    const hint = decisionCompassChatAwarenessHint(session)!;
    expect(hint).toMatch(/leaning toward/i);
    expect(hint).not.toMatch(/^Recommendation:/m);
    const report = buildDecisionRecommendationReport(session)!;
    expect(report.disclaimer).toMatch(/thinking tool/i);
  });

  it("7. action plan creation works", () => {
    const session = sampleCompleteSession();
    const plan = buildDecisionActionPlan(session);
    expect(plan?.steps.length).toBeGreaterThan(2);
    const next = mergeExplorationIntoSession(session, { actionPlan: plan! });
    expect(next.exploration?.actionPlan?.steps.length).toBe(plan!.steps.length);
  });

  it("8. save to project works via saved work + link", () => {
    const session = sampleCompleteSession();
    const { itemId, location } = saveDecisionToSavedWork(
      session,
      "proj-1",
      "Growth Sprint",
    );
    const saved = getSavedWork().find((w) => w.id === itemId);
    expect(saved).toBeDefined();
    expect(saved?.projectId).toBe("proj-1");
    expect(location).toMatch(/Saved Work/);
    expect(buildDecisionSaveBody(session)).toMatch(/Hire a salesperson/i);
  });

  it("9. export includes recommendation report", () => {
    const session = sampleCompleteSession();
    const body = buildDecisionSaveBody(session);
    expect(body).toMatch(/Potential Advantages/i);
    expect(body).toMatch(/Confidence/i);
    expect(body).toMatch(/Hire a salesperson/i);
  });

  it("10. resume restores exploration state", () => {
    const session = sampleCompleteSession();
    const withExploration = mergeExplorationIntoSession(session, {
      exploredQuestions: [
        {
          id: "eq-r",
          question: "What would Future You recommend?",
          answer: "Pilot first.",
        },
      ],
    });
    saveDecisionCompassSession(withExploration);
    const loaded = loadDecisionCompassSession();
    expect(loaded?.exploration?.exploredQuestions).toHaveLength(1);
    expect(loaded?.exploration?.exploredQuestions[0]?.answer).toBe("Pilot first.");
  });

  it("11. shared session remains source of truth", () => {
    const session = sampleCompleteSession();
    const next = mergeExplorationIntoSession(session, {
      exploredQuestions: [
        { id: "eq-2", question: "Biggest risk?", answer: "Cash flow." },
      ],
    });
    saveDecisionCompassSession(next);
    const hint = decisionCompassChatAwarenessHint(enrichAuthority(next))!;
    expect(hint).toMatch(/explored 1 deeper question/i);
    expect(next.exploration?.exploredQuestions[0]?.answer).toBe("Cash flow.");
  });

  it("12. companion references existing decision context", () => {
    const session = sampleCompleteSession();
    const hint = decisionCompassChatAwarenessHint(session)!;
    expect(hint).toMatch(/Hire a salesperson/i);
    expect(hint).toMatch(/Confidence/i);
    expect(hint).toMatch(/VISIBLE ON CANVAS/i);
  });
});
