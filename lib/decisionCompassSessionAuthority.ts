/**
 * Trust Sprint #2 — Phase 2: Decision Compass shared session authority.
 * Single source of truth for chat + panel.
 */

import {
  advanceDecisionCompass,
  allStepsForState,
  currentStep,
  optionLabels,
  personalizeStepLabel,
  stateFromDecisionCompassPrefill,
  type DecisionCompassPrefill,
  type DecisionCompassState,
  type DecisionCompassStep,
  type DecisionResult,
  type DecisionType,
} from "./decisionCompass";
import {
  loadDecisionCompassSession,
  panelStateFromSnapshot,
  saveDecisionCompassSession,
  snapshotFromPanelState,
  type PersistedDecisionCompassSession,
} from "./decisionCompassSessionStore";
import { extractDecisionCompassPrefill } from "./decisionCompassRouting";
import {
  companionLeanLine,
  CONFIDENCE_META,
  computeDecisionConfidence,
} from "./decisionCompassExploration";
import { reportSummaryForChat } from "./decisionRecommendationReport";

/** Future visual map layer — derived from answers, no UI yet. */
export type DecisionVisualThinkingSnapshot = {
  decision: string;
  optionA: string;
  optionB: string;
  branches: { id: string; side: "a" | "b" | "root"; label: string }[];
  concerns: string[];
  motivations: string[];
  tradeoffs: { dimension: string; choice: "A" | "B" }[];
  recommendation: DecisionResult | null;
};

export type DecisionCompassSessionAuthority = PersistedDecisionCompassSession & {
  visualThinking: DecisionVisualThinkingSnapshot;
  updatedAt: string;
};

function newSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `dc-${Date.now()}`;
}

export function buildVisualThinkingSnapshot(
  session: PersistedDecisionCompassSession,
): DecisionVisualThinkingSnapshot {
  const { a, b } = optionLabels(session.answers);
  const branches: DecisionVisualThinkingSnapshot["branches"] = [
    { id: "root", side: "root", label: session.decision || "Decision" },
    { id: "opt-a", side: "a", label: session.optionA || a },
    { id: "opt-b", side: "b", label: session.optionB || b },
  ];
  const concerns: string[] = [];
  const motivations: string[] = [];
  const tradeoffs: DecisionVisualThinkingSnapshot["tradeoffs"] = [];

  for (const [key, val] of Object.entries(session.answers)) {
    if (!val?.trim()) continue;
    if (key.startsWith("concern-")) concerns.push(val.trim());
    if (key.startsWith("why-") || key.startsWith("hope-")) motivations.push(val.trim());
    if (
      ["freedom", "growth", "stress", "alignment", "momentum", "clearer", "values", "relief", "future-me"].includes(
        key,
      ) &&
      (val === "A" || val === "B")
    ) {
      tradeoffs.push({ dimension: key, choice: val });
    }
  }

  return {
    decision: session.decision,
    optionA: session.optionA || a,
    optionB: session.optionB || b,
    branches,
    concerns,
    motivations,
    tradeoffs,
    recommendation: session.recommendation,
  };
}

export function enrichAuthority(
  snapshot: PersistedDecisionCompassSession,
): DecisionCompassSessionAuthority {
  return {
    ...snapshot,
    updatedAt: snapshot.lastTouchedAt,
    visualThinking: buildVisualThinkingSnapshot(snapshot),
  };
}

export function createDecisionCompassAuthority(
  prefill?: DecisionCompassPrefill | null,
  restored?: PersistedDecisionCompassSession | null,
): DecisionCompassSessionAuthority {
  if (restored) return enrichAuthority(restored);
  const seeded = stateFromDecisionCompassPrefill(prefill);
  const snapshot = snapshotFromPanelState(
    seeded.state,
    seeded.optionA,
    seeded.optionB,
    seeded.draft,
    newSessionId(),
  );
  return enrichAuthority(snapshot);
}

export function loadDecisionCompassAuthority(): DecisionCompassSessionAuthority | null {
  const snap = loadDecisionCompassSession();
  return snap ? enrichAuthority(snap) : null;
}

export function saveDecisionCompassAuthority(
  authority: DecisionCompassSessionAuthority,
): void {
  saveDecisionCompassSession(snapshotFromAuthority(authority));
}

export function snapshotFromAuthority(
  authority: DecisionCompassSessionAuthority,
): PersistedDecisionCompassSession {
  const { visualThinking: _vt, updatedAt, ...snap } = authority;
  return {
    ...snap,
    lastTouchedAt: updatedAt ?? authority.lastTouchedAt,
  };
}

export function authorityFromPanel(
  state: DecisionCompassState,
  optionA: string,
  optionB: string,
  draft: string,
  sessionId?: string,
): DecisionCompassSessionAuthority {
  const snapshot = snapshotFromPanelState(state, optionA, optionB, draft, sessionId);
  return enrichAuthority({
    ...snapshot,
    lastTouchedAt: new Date().toISOString(),
  });
}

export function isCompassFieldAnswered(
  authority: DecisionCompassSessionAuthority,
  fieldId: string,
): boolean {
  if (fieldId === "decision") {
    return Boolean(authority.decision?.trim() || authority.answers.decision?.trim());
  }
  if (fieldId === "options") {
    return Boolean(authority.optionA?.trim() && authority.optionB?.trim());
  }
  if (fieldId === "decision-type") {
    return Boolean(authority.decisionType);
  }
  if (authority.completedSteps.includes(fieldId)) return true;
  const val = authority.answers[fieldId];
  return val === "A" || val === "B" || Boolean(val?.trim());
}

export function shouldChatAskCompassStep(
  authority: DecisionCompassSessionAuthority,
  step: DecisionCompassStep | null,
): boolean {
  if (!step) return false;
  return !isCompassFieldAnswered(authority, step.id);
}

export function unansweredCompassStepIds(
  authority: DecisionCompassSessionAuthority,
): string[] {
  const panel = panelStateFromSnapshot(authority);
  const steps = allStepsForState(panel.state);
  return steps
    .filter((s) => !isCompassFieldAnswered(authority, s.id))
    .map((s) => s.id);
}

export function formatCapturedCompassAnswers(
  authority: DecisionCompassSessionAuthority,
): string[] {
  const lines: string[] = [];
  const { a, b } = optionLabels(authority.answers);

  if (authority.decision?.trim()) {
    lines.push(`Decision: ${authority.decision.trim()}`);
  }
  if (authority.optionA?.trim() || a !== "Option A") {
    lines.push(`Option A (${authority.optionA || a})`);
  }
  if (authority.optionB?.trim() || b !== "Option B") {
    lines.push(`Option B (${authority.optionB || b})`);
  }

  const skip = new Set(["decision", "options"]);
  for (const [key, val] of Object.entries(authority.answers)) {
    if (!val?.trim() || skip.has(key)) continue;
    if (val === "A" || val === "B") {
      const label = val === "A" ? authority.optionA || a : authority.optionB || b;
      lines.push(`${key}: leans ${label}`);
    } else {
      lines.push(`${key}: ${val.trim().slice(0, 120)}`);
    }
  }

  if (authority.visualThinking.concerns.length) {
    lines.push(
      `Concerns on canvas: ${authority.visualThinking.concerns.slice(0, 4).join("; ")}`,
    );
  }
  if (authority.visualThinking.motivations.length) {
    lines.push(
      `Motivations on canvas: ${authority.visualThinking.motivations.slice(0, 4).join("; ")}`,
    );
  }

  return lines;
}

export function decisionCompassChatAwarenessHint(
  authority: DecisionCompassSessionAuthority | null,
): string | undefined {
  if (!authority) return undefined;
  const captured = formatCapturedCompassAnswers(authority);
  const panel = panelStateFromSnapshot(authority);
  const step = currentStep(panel.state);
  const { a: labelA, b: labelB } = optionLabels(authority.answers);
  const stepLabel =
    step && "label" in step && step.label
      ? personalizeStepLabel(step.label, labelA, labelB)
      : step?.kind === "type-pick"
        ? "Choose decision type (action, strategic, or emotional)"
        : step?.kind === "labeled-pair"
          ? "Name your two options"
          : null;

  const lines = [
    "DECISION COMPASS VISUAL AWARENESS (mandatory):",
    "You share the same session as the visual canvas beside the user.",
    "Assume you can see everything captured below — reference it directly.",
    'NEVER ask: "What do you see?" / "Tell me what\'s on the screen." / "What option are you considering?" when data exists below.',
    "Speak as one trusted companion — do NOT mention agents, advisors, board members, or internal roles.",
    captured.length
      ? `VISIBLE ON CANVAS:\n${captured.map((l) => `- ${l}`).join("\n")}`
      : "Canvas is still sparse — only ask for missing essentials.",
    stepLabel && !isCompassFieldAnswered(authority, step!.id)
      ? `ONLY ask about this if still unanswered: ${stepLabel}`
      : "All current step fields appear captured — reflect and coach, do not re-ask.",
  ];

  if (authority.recommendation) {
    const vt = authority.visualThinking;
    lines.push(companionLeanLine(authority));
    const conf = computeDecisionConfidence(authority);
    lines.push(
      `Confidence: ${CONFIDENCE_META[conf].emoji} ${CONFIDENCE_META[conf].label} — ${CONFIDENCE_META[conf].description}`,
    );
    if (vt.concerns[0]) {
      lines.push(`The biggest concern visible: ${vt.concerns[0]}`);
    }
    if (authority.exploration?.exploredQuestions.length) {
      lines.push(
        `User explored ${authority.exploration.exploredQuestions.length} deeper question(s) — reference their answers, do not re-ask.`,
      );
    }
    if (authority.exploration?.actionPlan) {
      lines.push(
        `Action plan exists (${authority.exploration.actionPlan.steps.length} steps) — help execute, do not replace.`,
      );
    }
  }

  const reportBlock = reportSummaryForChat(authority);
  if (reportBlock) lines.push(reportBlock);

  return lines.join("\n");
}

export function decisionCompassWorkspaceHint(
  authority: DecisionCompassSessionAuthority | null,
): string | undefined {
  if (!authority) return undefined;
  const panel = panelStateFromSnapshot(authority);
  const step = currentStep(panel.state);
  const { a, b } = optionLabels(authority.answers);
  const unanswered = unansweredCompassStepIds(authority);
  const lines = [
    "DECISION COMPASS SHARED SESSION (chat + panel are one decision):",
    authority.decision
      ? `Decision: ${authority.decision}`
      : "Decision: not captured yet",
    authority.optionA || a !== "Option A"
      ? `Option A: ${authority.optionA || a}`
      : null,
    authority.optionB || b !== "Option B"
      ? `Option B: ${authority.optionB || b}`
      : null,
    authority.decisionType
      ? `Decision type: ${authority.decisionType}`
      : "Decision type: not chosen yet",
    step ? `Current step id: ${step.id}` : null,
    authority.currentStepId
      ? `Panel step: ${authority.currentStepId}`
      : null,
    unanswered.length
      ? `Unanswered steps: ${unanswered.join(", ")}`
      : "All steps answered",
    authority.recommendation
      ? `Compass lean: ${authority.recommendation.choice} (${authority.recommendation.headline}) — companion-first, not a verdict`
      : "Compass lean: pending",
    "Do NOT ask for information already captured above. Continue from the current step.",
    decisionCompassChatAwarenessHint(authority),
  ].filter(Boolean);
  return lines.filter(Boolean).join("\n");
}

export function decisionCompassResumeOpener(
  authority: DecisionCompassSessionAuthority,
): string {
  const parts = ["Welcome back. We reopened your Decision Compass."];
  if (authority.decision?.trim()) {
    parts.push(`You're deciding: **${authority.decision.trim()}**`);
  }
  if (authority.optionA?.trim() && authority.optionB?.trim()) {
    parts.push(
      `Options: **${authority.optionA.trim()}** or **${authority.optionB.trim()}**`,
    );
  }
  return parts.join(" ");
}

export function decisionCompassFreshOpener(
  prefill?: DecisionCompassPrefill | null,
): string {
  if (prefill?.optionA && prefill?.optionB) {
    return `Let's work through this together — **${prefill.optionA}** or **${prefill.optionB}**?`;
  }
  if (prefill?.decision?.trim()) {
    return `Let's map out: **${prefill.decision.trim()}**`;
  }
  return "What decision are you working through?";
}

function parseOrOptions(text: string): { a: string; b: string } | null {
  const prefill = extractDecisionCompassPrefill(text);
  if (prefill.optionA && prefill.optionB) {
    return { a: prefill.optionA, b: prefill.optionB };
  }
  const orMatch = text.match(/^(.+?)\s+or\s+(.+?)[.?!]?$/i);
  if (!orMatch) return null;
  const a = orMatch[1]!.trim();
  const b = orMatch[2]!.trim();
  if (a.length < 2 || b.length < 2 || a.length > 80 || b.length > 80) return null;
  return { a, b };
}

function pickAbFromText(
  text: string,
  labelA: string,
  labelB: string,
): "A" | "B" | null {
  const t = text.trim().toLowerCase();
  if (/^(?:a|option a|first|the first)\b/.test(t)) return "A";
  if (/^(?:b|option b|second|the second)\b/.test(t)) return "B";
  if (labelA && t.includes(labelA.toLowerCase().slice(0, 12))) return "A";
  if (labelB && t.includes(labelB.toLowerCase().slice(0, 12))) return "B";
  return null;
}

export type ApplyChatToCompassResult = {
  authority: DecisionCompassSessionAuthority;
  changed: boolean;
  fieldsUpdated: string[];
};

/** Apply a user chat line to the shared Decision Compass session. */
export function applyUserChatToAuthority(
  authority: DecisionCompassSessionAuthority,
  userText: string,
): ApplyChatToCompassResult {
  const text = userText.trim();
  if (!text || authority.complete) {
    return { authority, changed: false, fieldsUpdated: [] };
  }

  const panel = panelStateFromSnapshot(authority);
  let state = panel.state;
  let optionA = panel.optionA;
  let optionB = panel.optionB;
  let draft = panel.draft;
  const fieldsUpdated: string[] = [];
  const step = currentStep(state);
  if (!step) return { authority, changed: false, fieldsUpdated: [] };

  if (step.id === "decision" && !isCompassFieldAnswered(authority, "decision")) {
    const prefill = extractDecisionCompassPrefill(text);
    const decision = prefill.decision?.trim() || text;
    state = advanceDecisionCompass(state, { decision });
    fieldsUpdated.push("decision");
  } else if (
    (step.kind === "labeled-pair" || step.id === "options") &&
    !isCompassFieldAnswered(authority, "options")
  ) {
    const parsed = parseOrOptions(text);
    if (parsed) {
      optionA = parsed.a;
      optionB = parsed.b;
      state = advanceDecisionCompass(state, {
        options: `${optionA}\n---\n${optionB}`,
      });
      fieldsUpdated.push("options", "optionA", "optionB");
    }
  } else if (step.kind === "text" && !isCompassFieldAnswered(authority, step.id)) {
    if (text.length >= 2 && !text.endsWith("?")) {
      state = advanceDecisionCompass(state, { [step.id]: text });
      fieldsUpdated.push(step.id);
      draft = "";
    }
  } else if (
    (step.kind === "pick-ab" || step.kind === "tradeoff") &&
    !isCompassFieldAnswered(authority, step.id)
  ) {
    const labels = optionLabels(state.answers);
    const pick = pickAbFromText(text, labels.a, labels.b);
    if (pick) {
      state = advanceDecisionCompass(state, { [step.id]: pick });
      fieldsUpdated.push(step.id);
    }
  } else if (step.kind === "type-pick" && !authority.decisionType) {
    const lower = text.toLowerCase();
    let pick: DecisionType | null = null;
    if (/\bstrategic\b/.test(lower)) pick = "strategic";
    else if (/\bemotional\b/.test(lower)) pick = "emotional";
    else if (/\baction\b/.test(lower)) pick = "action";
    if (pick) {
      state = advanceDecisionCompass(state, { decisionType: pick });
      fieldsUpdated.push("decision-type");
    }
  }

  if (fieldsUpdated.length === 0) {
    return { authority, changed: false, fieldsUpdated: [] };
  }

  const next = authorityFromPanel(
    state,
    optionA,
    optionB,
    draft,
    authority.sessionId,
  );
  return { authority: next, changed: true, fieldsUpdated };
}

export const DECISION_COMPASS_SPLIT_SECTION = "decision-compass" as const;

export function decisionCompassOpensBesideChat(): {
  section: typeof DECISION_COMPASS_SPLIT_SECTION;
  layout: "split";
} {
  return { section: DECISION_COMPASS_SPLIT_SECTION, layout: "split" };
}

export function duplicateQuestionGuardHint(
  authority: DecisionCompassSessionAuthority | null,
): string | undefined {
  if (!authority) return undefined;
  const captured = formatCapturedCompassAnswers(authority);
  if (!captured.length) return undefined;
  return [
    "Already captured in Decision Compass (do NOT ask again):",
    ...captured.map((line) => `- ${line}`),
    'Do NOT ask "what do you see" or "what option are you considering" for the above.',
  ].join("\n");
}
