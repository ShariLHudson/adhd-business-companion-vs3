"use client";

import {
  BUSINESS_CANVAS_CHANGE_EXAMPLES,
  BUSINESS_CANVAS_CHANGE_QUESTION,
} from "@/lib/visualFocus/businessCanvas/copy";
import {
  followUpQuestionsForChange,
  hasEnoughChangeDetail,
} from "@/lib/visualFocus/businessCanvas/changeExploration";
import type {
  BusinessCanvasChangeExploration,
  BusinessCanvasWorkflowStage,
} from "@/lib/visualFocus/businessCanvas/workflowTypes";

export function BusinessCanvasChangePanel({
  workflow,
  change,
  onChange,
  onAnalyzeImpact,
}: {
  workflow: BusinessCanvasWorkflowStage;
  change: BusinessCanvasChangeExploration;
  onChange: (
    next: BusinessCanvasChangeExploration,
    stage: BusinessCanvasWorkflowStage,
  ) => void;
  onAnalyzeImpact: () => void;
}) {
  if (workflow === "buildCurrentCanvas") return null;

  const description = change.description;
  const answers = change.followUpAnswers;
  const questions = description.trim() ? followUpQuestionsForChange(description) : [];
  const showFollowUps =
    workflow === "clarifyChange" ||
    workflow === "generatedImpact" ||
    (workflow === "exploreChange" && description.trim().length > 0);
  const enough = hasEnoughChangeDetail(description, answers);
  const showChangeInput =
    workflow === "generatedCurrentCanvas" ||
    workflow === "exploreChange" ||
    workflow === "clarifyChange" ||
    workflow === "generatedImpact";

  function updateDescription(value: string) {
    const resetting = workflow === "generatedImpact";
    let stage: BusinessCanvasWorkflowStage;
    if (value.trim().length === 0) {
      stage = "generatedCurrentCanvas";
    } else if (resetting || workflow === "clarifyChange") {
      stage = "clarifyChange";
    } else {
      stage = "exploreChange";
    }
    onChange(
      {
        description: value,
        followUpAnswers: resetting ? {} : answers,
      },
      stage,
    );
  }

  function updateAnswer(id: string, value: string) {
    onChange(
      {
        description,
        followUpAnswers: { ...answers, [id]: value },
      },
      workflow === "generatedImpact" ? "clarifyChange" : "clarifyChange",
    );
  }

  function startClarify() {
    if (!description.trim()) return;
    onChange(change, "clarifyChange");
  }

  function applyExample(example: string) {
    onChange(
      { description: example, followUpAnswers: {} },
      "clarifyChange",
    );
  }

  return (
    <section
      className="rounded-2xl border border-[#e7dfd4] bg-[#faf7f2] p-5"
      data-testid="business-canvas-change-panel"
      data-workflow={workflow}
    >
      <h2 className="text-base font-semibold text-[#1f1c19]">
        {BUSINESS_CANVAS_CHANGE_QUESTION}
      </h2>
      <p className="mt-1 text-sm text-[#6b635a]">
        Your current canvas is the baseline. Describe one change to explore what might
        shift.
      </p>

      {showChangeInput ? (
        <div className="mt-4">
          <textarea
            value={description}
            onChange={(e) => updateDescription(e.target.value)}
            rows={2}
            placeholder="e.g. Add a membership, raise prices, change audience…"
            className="w-full resize-none rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-sm text-[#1f1c19] focus:border-[#1e4f4f] focus:outline-none"
            data-testid="business-canvas-change-input"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {BUSINESS_CANVAS_CHANGE_EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => applyExample(ex)}
                className="rounded-full bg-white px-2.5 py-0.5 text-xs text-[#1e4f4f] ring-1 ring-[#e7dfd4] hover:bg-[#1e4f4f]/5"
              >
                {ex}
              </button>
            ))}
          </div>
          {workflow === "exploreChange" && description.trim() ? (
            <button
              type="button"
              onClick={startClarify}
              className="mt-3 text-sm font-semibold text-[#1e4f4f] hover:underline"
              data-testid="business-canvas-change-continue"
            >
              Continue to follow-up questions →
            </button>
          ) : null}
        </div>
      ) : null}

      {showFollowUps && questions.length > 0 ? (
        <div className="mt-5 space-y-3" data-testid="business-canvas-follow-ups">
          <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            A few details so the analysis is useful
          </p>
          {questions.map((q) => (
            <label key={q.id} className="block">
              <span className="text-sm font-medium text-[#2f261f]">{q.question}</span>
              <input
                value={answers[q.id] ?? ""}
                onChange={(e) => updateAnswer(q.id, e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#e7dfd4] bg-white px-3 py-2 text-sm focus:border-[#1e4f4f] focus:outline-none"
                data-testid={`business-canvas-follow-up-${q.id}`}
              />
            </label>
          ))}
        </div>
      ) : null}

      {enough && workflow !== "generatedImpact" ? (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={onAnalyzeImpact}
            className="rounded-full bg-[#1e4f4f] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-[#163b3b]"
            data-testid="business-canvas-analyze-impact"
          >
            Analyze likely impact
          </button>
        </div>
      ) : null}

      {workflow === "generatedImpact" ? (
        <p className="mt-4 text-sm font-semibold text-[#1e4f4f]">
          Impact analysis is in the intelligence panel →
        </p>
      ) : showFollowUps && !enough ? (
        <p className="mt-4 text-xs text-[#9a8f82]">
          Answer at least 3 follow-up questions to run impact analysis.
        </p>
      ) : null}
    </section>
  );
}
