"use client";

import { useMemo, useState } from "react";
import {
  DECISION_TYPE_META,
  advanceDecisionCompass,
  buildDecisionMindMap,
  canAdvanceStep,
  computeDecisionResult,
  currentStep,
  emptyDecisionCompassState,
  optionLabels,
  setDecisionType,
  suggestDecisionType,
  type DecisionCompassState,
  type DecisionType,
  type MindMapNode,
} from "@/lib/decisionCompass";

function MindMapBranch({ node, depth = 0 }: { node: MindMapNode; depth?: number }) {
  const colors = ["#1e4f4f", "#a85c4a", "#4a6fa5", "#6b8e23"];
  const color = colors[depth % colors.length]!;
  return (
    <li className="mt-2">
      <div
        className="rounded-xl border px-3 py-2 text-sm"
        style={{
          borderColor: `${color}44`,
          backgroundColor: `${color}0d`,
          marginLeft: depth * 12,
        }}
      >
        {node.label}
      </div>
      {node.children && node.children.length > 0 ? (
        <ul className="list-none pl-0">
          {node.children.map((child) => (
            <MindMapBranch key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function DecisionCompassPanel({
  onClose,
  onStop,
}: {
  onClose?: () => void;
  onStop?: () => void;
}) {
  const [state, setState] = useState<DecisionCompassState>(
    emptyDecisionCompassState(),
  );
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [draft, setDraft] = useState("");

  const step = currentStep(state);
  const { a: labelA, b: labelB } = optionLabels(state.answers);
  const suggestedType = useMemo(
    () =>
      suggestDecisionType(
        state.answers.decision ?? "",
        optionA,
        optionB,
      ),
    [state.answers.decision, optionA, optionB],
  );
  const result = computeDecisionResult(state);
  const mindMap = buildDecisionMindMap(state);

  function patchAnswers(patch: Record<string, string>) {
    setState((s) => ({ ...s, answers: { ...s.answers, ...patch } }));
  }

  function goNext() {
    if (!step) return;
    let answersPatch: Record<string, string> = {};
    if (step.kind === "labeled-pair") {
      answersPatch = { options: `${optionA.trim()}\n---\n${optionB.trim()}` };
    } else if (step.kind === "text") {
      answersPatch = { [step.id]: draft };
      setDraft("");
    }
    setState((s) => {
      const merged = advanceDecisionCompass(
        { ...s, answers: { ...s.answers, ...answersPatch } },
        s.decisionType ? undefined : undefined,
      );
      return merged;
    });
  }

  function pickType(type: DecisionType) {
    setState((s) => {
      const withType = setDecisionType(s, type);
      return advanceDecisionCompass(withType);
    });
  }

  function pickAb(stepId: string, choice: "A" | "B") {
    setState((s) =>
      advanceDecisionCompass(s, { [stepId]: choice }),
    );
  }

  function pickTradeoff(stepId: string, choice: "A" | "B") {
    setState((s) =>
      advanceDecisionCompass(s, { [stepId]: choice }),
    );
  }

  if (state.complete && result) {
    return (
      <div className="companion-fade-in flex h-full flex-col px-4 py-6">
        <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
          Decision Compass
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-[#1f1c19]">
          {result.headline}
        </h2>
        <p className="mt-3 text-lg font-semibold text-[#1e4f4f]">
          {result.choice}
        </p>
        <p className="mt-2 text-base leading-relaxed text-[#6b635a]">
          {result.summary}
        </p>
        <p className="mt-4 text-sm text-[#6b635a]">
          This is a draft for momentum — not a final verdict. You can always
          revisit.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setState((s) => ({ ...s, showMap: !s.showMap }))}
            className="rounded-xl border border-[#d4cdc3] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f1c19] hover:border-[#1e4f4f]/40"
          >
            {state.showMap ? "Hide map" : "🗺️ Show Decision Map"}
          </button>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Done
            </button>
          ) : null}
        </div>

        {state.showMap ? (
          <div className="mt-6 rounded-2xl border border-[#d4cdc3] bg-white/80 p-4">
            <p className="text-sm font-semibold text-[#6b635a]">
              👁️ Your thinking at a glance
            </p>
            <ul className="mt-3 list-none pl-0">
              <MindMapBranch node={mindMap} />
            </ul>
          </div>
        ) : null}
      </div>
    );
  }

  if (!step) return null;

  const stepReady =
    step.kind === "labeled-pair"
      ? Boolean(optionA.trim() && optionB.trim())
      : step.kind === "type-pick"
        ? Boolean(state.decisionType)
        : step.kind === "pick-ab" || step.kind === "tradeoff"
          ? false
          : canAdvanceStep(step, {
              ...state.answers,
              [step.id]: draft,
            });

  return (
    <div className="companion-fade-in flex h-full min-h-0 flex-col px-4 py-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
            ADHD Decision Compass
          </p>
          <h2 className="text-xl font-semibold text-[#1f1c19]">
            {state.decisionType
              ? DECISION_TYPE_META[state.decisionType].title
              : "What are you deciding?"}
          </h2>
        </div>
        {onStop ? (
          <button
            type="button"
            onClick={onStop}
            className="shrink-0 rounded-lg border border-[#d4cdc3] px-3 py-1.5 text-sm font-semibold text-[#6b635a]"
          >
            Stop
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setState((s) => ({ ...s, showMap: !s.showMap }))}
          className="rounded-full border border-[#d4cdc3] bg-white px-3 py-1 text-xs font-semibold text-[#1e4f4f]"
        >
          {state.showMap ? "Hide map" : "🗺️ Decision Map"}
        </button>
      </div>

      {state.showMap && state.answers.decision ? (
        <div className="mt-3 max-h-40 overflow-y-auto rounded-xl border border-[#d4cdc3] bg-white/70 p-3">
          <ul className="list-none pl-0">
            <MindMapBranch node={mindMap} />
          </ul>
        </div>
      ) : null}

      <div className="mt-5 flex-1 overflow-y-auto">
        {step.kind === "text" ? (
          <>
            <label className="block text-base font-medium text-[#1f1c19]">
              {step.label}
            </label>
            <textarea
              value={draft || state.answers[step.id] || ""}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={step.placeholder}
              rows={"multiline" in step && step.multiline ? 3 : 2}
              className="mt-2 w-full resize-none rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-base outline-none focus:border-[#1e4f4f]"
            />
          </>
        ) : null}

        {step.kind === "labeled-pair" ? (
          <>
            <p className="text-base font-medium text-[#1f1c19]">
              Name your two options — plain language, no pros/cons yet.
            </p>
            <input
              value={optionA}
              onChange={(e) => setOptionA(e.target.value)}
              placeholder={step.labelA}
              className="mt-3 w-full rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-base outline-none focus:border-[#1e4f4f]"
            />
            <input
              value={optionB}
              onChange={(e) => setOptionB(e.target.value)}
              placeholder={step.labelB}
              className="mt-2 w-full rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-base outline-none focus:border-[#1e4f4f]"
            />
          </>
        ) : null}

        {step.kind === "type-pick" ? (
          <>
            <p className="text-base text-[#1f1c19]">
              What kind of decision is this?
            </p>
            <p className="mt-1 text-sm text-[#6b635a]">
              Suggested:{" "}
              <strong>{DECISION_TYPE_META[suggestedType].title}</strong> — pick
              what fits best.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {(
                ["action", "strategic", "emotional"] as DecisionType[]
              ).map((t) => {
                const meta = DECISION_TYPE_META[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => pickType(t)}
                    className={`rounded-xl border px-4 py-3 text-left ${
                      state.decisionType === t
                        ? "border-[#1e4f4f] bg-[#1e4f4f]/10"
                        : "border-[#d4cdc3] bg-white hover:border-[#1e4f4f]/40"
                    }`}
                  >
                    <span className="text-lg" aria-hidden="true">
                      {meta.emoji}
                    </span>{" "}
                    <span className="font-semibold text-[#1f1c19]">
                      {meta.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-[#6b635a]">
                      {meta.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {step.kind === "pick-ab" ? (
          <>
            <p className="text-base font-medium text-[#1f1c19]">{step.label}</p>
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => pickAb(step.id, "A")}
                className="rounded-xl border border-[#d4cdc3] bg-white px-4 py-3 text-left font-semibold hover:border-[#1e4f4f]/40"
              >
                A — {labelA}
              </button>
              <button
                type="button"
                onClick={() => pickAb(step.id, "B")}
                className="rounded-xl border border-[#d4cdc3] bg-white px-4 py-3 text-left font-semibold hover:border-[#1e4f4f]/40"
              >
                B — {labelB}
              </button>
            </div>
          </>
        ) : null}

        {step.kind === "tradeoff" ? (
          <>
            <p className="text-base font-medium text-[#1f1c19]">{step.label}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => pickTradeoff(step.id, "A")}
                className="flex-1 rounded-xl border border-[#d4cdc3] bg-white px-3 py-2.5 text-sm font-semibold"
              >
                {labelA}
              </button>
              <button
                type="button"
                onClick={() => pickTradeoff(step.id, "B")}
                className="flex-1 rounded-xl border border-[#d4cdc3] bg-white px-3 py-2.5 text-sm font-semibold"
              >
                {labelB}
              </button>
            </div>
          </>
        ) : null}
      </div>

      {step.kind !== "type-pick" &&
      step.kind !== "pick-ab" &&
      step.kind !== "tradeoff" ? (
        <button
          type="button"
          disabled={!stepReady}
          onClick={goNext}
          className="mt-4 w-full rounded-xl bg-[#1e4f4f] py-3 text-base font-semibold text-white disabled:bg-[#9aaba8]"
        >
          Continue
        </button>
      ) : null}
    </div>
  );
}
