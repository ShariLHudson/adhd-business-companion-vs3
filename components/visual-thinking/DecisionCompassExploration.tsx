"use client";

import { useMemo, useState } from "react";
import type { PersistedDecisionCompassSession } from "@/lib/decisionCompassSessionStore";
import { DecisionCompassSaveModal } from "@/components/companion/DecisionCompassSaveModal";
import {
  buildDecisionActionPlan,
  buildDecisionExplorationState,
  buildDecisionSaveBody,
  CONFIDENCE_META,
  generateExplorationQuestions,
  mergeExplorationIntoSession,
  saveDecisionToSavedWork,
  type ExploredQuestion,
} from "@/lib/decisionCompassExploration";
import { saveDecisionCompassSession } from "@/lib/decisionCompassSessionStore";
import {
  googleReceiptForKind,
  isGoogleCreateSuccess,
  saveReceipt,
} from "@/lib/saveExportTrust";

export function DecisionCompassExploration({
  session,
  onSessionChange,
  onExportPdf,
  onExportPng,
  onPrint,
  projectId = null,
  projectName = null,
}: {
  session: PersistedDecisionCompassSession | null;
  onSessionChange?: (next: PersistedDecisionCompassSession) => void;
  onExportPdf?: () => void;
  onExportPng?: () => void;
  onPrint?: () => void;
  projectId?: string | null;
  projectName?: string | null;
}) {
  const exploration = useMemo(
    () => (session ? buildDecisionExplorationState(session) : null),
    [session],
  );
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({});
  const [pendingQuestions, setPendingQuestions] = useState<ExploredQuestion[]>(
    [],
  );
  const [receipt, setReceipt] = useState<string | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  if (!session?.recommendation || !exploration) return null;

  const resolvedSession = session;
  const resolvedExploration = exploration;

  const conf = CONFIDENCE_META[resolvedExploration.confidence];

  function persist(next: PersistedDecisionCompassSession) {
    saveDecisionCompassSession(next);
    onSessionChange?.(next);
  }

  function showReceipt(msg: string) {
    setReceipt(msg);
    window.setTimeout(() => setReceipt(null), 4000);
  }

  function handleContinueExploring() {
    const fresh = generateExplorationQuestions(
      resolvedSession,
      resolvedExploration.exploredQuestions,
    );
    setPendingQuestions(fresh);
  }

  function saveAnswer(q: ExploredQuestion) {
    const answer = draftAnswers[q.id]?.trim();
    if (!answer) return;
    const updated: ExploredQuestion = {
      ...q,
      answer,
      exploredAt: new Date().toISOString(),
    };
    const next = mergeExplorationIntoSession(resolvedSession, {
      exploredQuestions: [...resolvedExploration.exploredQuestions, updated],
    });
    persist(next);
    setPendingQuestions((prev) => prev.filter((p) => p.id !== q.id));
    setDraftAnswers((prev) => {
      const copy = { ...prev };
      delete copy[q.id];
      return copy;
    });
    showReceipt("Your resolvedExploration answer is saved with this decision.");
  }

  function handleCreateActionPlan() {
    const plan = buildDecisionActionPlan(resolvedSession);
    if (!plan) return;
    const next = mergeExplorationIntoSession(resolvedSession, { actionPlan: plan });
    persist(next);
    showReceipt("Action plan created — you can export it or add it to a project.");
  }

  function handleSaveToSavedWork() {
    const { location } = saveDecisionToSavedWork(resolvedSession, projectId, projectName);
    showReceipt(`${saveReceipt("saved-work")} Find it in ${location}.`);
  }

  function handleSaveToProject() {
    setSaveModalOpen(true);
  }

  async function handleGoogleDoc() {
    try {
      const res = await fetch("/api/google/create-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: resolvedSession.decision?.slice(0, 80) || "Decision Compass",
          content: buildDecisionSaveBody(resolvedSession),
          kind: "doc",
        }),
      });
      const j = (await res.json()) as { url?: string; id?: string; error?: string };
      if (!isGoogleCreateSuccess(res.status, j)) {
        showReceipt(saveReceipt("google-fail"));
        return;
      }
      showReceipt(googleReceiptForKind("doc", j.url));
    } catch {
      showReceipt(saveReceipt("google-fail"));
    }
  }

  return (
    <div
      className="border-t border-[#e7dfd4] bg-[#faf7f2]/80 px-4 py-5"
      data-testid="decision-compass-resolvedExploration"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-[#1e4f4f]">
        Continue Exploring
      </p>
      <p className="mt-1 text-sm text-[#6b635a]">
        The Compass leans — it does not decide for you. Explore until you feel
        ready.
      </p>

      {receipt ? (
        <p className="mt-2 text-sm font-semibold text-[#1e4f4f]">{receipt}</p>
      ) : null}

      <div className="mt-3 rounded-xl border border-[#c9dfd8] bg-white px-3 py-2">
        <p className="text-sm font-bold text-[#1e4f4f]">
          {conf.emoji} Decision Confidence: {conf.label}
        </p>
        <p className="text-xs text-[#6b635a]">{conf.description}</p>
      </div>

      {resolvedExploration.whatCouldChange.length > 0 ? (
        <div className="mt-3 rounded-xl border border-[#d4cdc3] bg-white/80 p-3">
          <p className="text-sm font-bold text-[#1e4f4f]">
            What Could Change This Recommendation?
          </p>
          <ul className="mt-2 list-none space-y-1 pl-0">
            {resolvedExploration.whatCouldChange.map((item) => (
              <li key={item} className="text-sm text-[#2d2926]">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {resolvedExploration.alternativePaths ? (
        <div className="mt-3 rounded-xl border border-[#d4cdc3] bg-white/80 p-3">
          <p className="text-sm font-bold text-[#1e4f4f]">
            🔀 Alternative Paths
          </p>
          <p className="mt-1 text-xs font-semibold text-[#6b635a]">
            Primary: {resolvedExploration.alternativePaths.primary}
          </p>
          <p className="mt-2 text-xs font-bold uppercase text-[#6b635a]">
            Alternatives
          </p>
          <ul className="mt-1 list-none space-y-1 pl-0">
            {resolvedExploration.alternativePaths.alternatives.map((p) => (
              <li key={p} className="text-sm text-[#2d2926]">
                • {p}
              </li>
            ))}
          </ul>
          {resolvedExploration.alternativePaths.experimental.length > 0 ? (
            <>
              <p className="mt-2 text-xs font-bold uppercase text-[#6b635a]">
                Experiments
              </p>
              <ul className="mt-1 list-none space-y-1 pl-0">
                {resolvedExploration.alternativePaths.experimental.map((p) => (
                  <li key={p} className="text-sm text-[#2d2926]">
                    • {p}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleContinueExploring}
          data-decision-action="continue-exploring"
          className="rounded-lg bg-[#1e4f4f] px-3 py-2 text-sm font-semibold text-white"
        >
          Continue Exploring
        </button>
        <button
          type="button"
          onClick={handleCreateActionPlan}
          data-decision-action="create-action-plan"
          className="rounded-lg border border-[#1e4f4f]/40 bg-white px-3 py-2 text-sm font-semibold text-[#1e4f4f]"
        >
          Create Action Plan
        </button>
      </div>

      {resolvedExploration.actionPlan ? (
        <div className="mt-3 rounded-xl border border-[#fcd34d] bg-[#fffbeb] p-3">
          <p className="text-sm font-bold text-[#92400e]">Action Plan</p>
          <p className="text-xs text-[#92400e]">
            {resolvedExploration.actionPlan.recommendedChoice}
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[#78350f]">
            {resolvedExploration.actionPlan.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
      ) : null}

      {pendingQuestions.length > 0 ? (
        <div className="mt-3 space-y-3">
          {pendingQuestions.map((q) => (
            <div
              key={q.id}
              className="rounded-xl border border-[#c9dfd8] bg-white p-3"
            >
              <p className="text-sm font-semibold text-[#1f1c19]">
                {q.question}
              </p>
              <textarea
                value={draftAnswers[q.id] ?? ""}
                onChange={(e) =>
                  setDraftAnswers((prev) => ({
                    ...prev,
                    [q.id]: e.target.value,
                  }))
                }
                placeholder="Your thoughts…"
                className="mt-2 min-h-[60px] w-full resize-none rounded-lg border border-[#c9bfb0] px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() => saveAnswer(q)}
                disabled={!draftAnswers[q.id]?.trim()}
                className="mt-2 rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                Save answer
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {resolvedExploration.exploredQuestions.length > 0 ? (
        <div className="mt-3 rounded-xl border border-[#d4cdc3] bg-white/60 p-3">
          <p className="text-sm font-bold text-[#1e4f4f]">
            Questions You Explored
          </p>
          {resolvedExploration.exploredQuestions.map((q) => (
            <div key={q.id} className="mt-2 text-sm text-[#2d2926]">
              <p className="font-semibold">{q.question}</p>
              {q.answer ? (
                <p className="mt-0.5 text-[#6b635a]">{q.answer}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4 border-t border-[#e7dfd4] pt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
          Save Decision
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSaveToSavedWork}
            className="rounded-lg border border-[#1e4f4f]/30 px-2.5 py-1.5 text-xs font-semibold text-[#1e4f4f]"
          >
            Save to Saved Work
          </button>
          <button
            type="button"
            onClick={handleSaveToProject}
            data-decision-action="save-project"
            className="rounded-lg border border-[#1e4f4f]/30 px-2.5 py-1.5 text-xs font-semibold text-[#1e4f4f]"
          >
            Save to Project
          </button>
          <button
            type="button"
            onClick={() => void handleGoogleDoc()}
            data-decision-action="export"
            className="rounded-lg border border-[#1e4f4f]/30 px-2.5 py-1.5 text-xs font-semibold text-[#1e4f4f]"
          >
            Google Doc
          </button>
          {onExportPdf ? (
            <button
              type="button"
              onClick={() => {
                onExportPdf();
                showReceipt(saveReceipt("download-pdf"));
              }}
              className="rounded-lg border border-[#1e4f4f]/30 px-2.5 py-1.5 text-xs font-semibold text-[#1e4f4f]"
            >
              Download PDF
            </button>
          ) : null}
          {onExportPng ? (
            <button
              type="button"
              onClick={() => {
                onExportPng();
                showReceipt(saveReceipt("download-png"));
              }}
              className="rounded-lg border border-[#1e4f4f]/30 px-2.5 py-1.5 text-xs font-semibold text-[#1e4f4f]"
            >
              Download PNG
            </button>
          ) : null}
          {onPrint ? (
            <button
              type="button"
              onClick={() => {
                onPrint();
                showReceipt(saveReceipt("print"));
              }}
              className="rounded-lg border border-[#1e4f4f]/30 px-2.5 py-1.5 text-xs font-semibold text-[#1e4f4f]"
            >
              Print
            </button>
          ) : null}
        </div>
      </div>

      <DecisionCompassSaveModal
        open={saveModalOpen}
        session={resolvedSession}
        onClose={() => setSaveModalOpen(false)}
        onReceipt={showReceipt}
      />
    </div>
  );
}
