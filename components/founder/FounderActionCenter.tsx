"use client";

import { useMemo, useState } from "react";

import {
  generateCursorPrompt,
  promptTitleForInput,
} from "@/lib/founderWorkspace/cursorPromptGenerator";
import { saveCursorPrompt } from "@/lib/founderWorkspace/cursorPromptStore";
import type { FounderRecommendedTask } from "@/lib/founderWorkspace/actionCenter";

const btn =
  "rounded-lg border border-[#d4cdc3] bg-white px-3 py-1.5 text-xs font-semibold text-[#2d2926] shadow-sm hover:bg-[#f5f0e8] disabled:opacity-50";

const btnPrimary =
  "rounded-lg bg-[#e0795a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c9684d]";

const btnTeal =
  "rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#163a3a]";

function levelBadge(label: string, value: string): string {
  if (value === "high") return `${label}: high`;
  if (value === "low") return `${label}: low`;
  return `${label}: medium`;
}

export type FounderActionCenterHandlers = {
  onStartWorking: () => void;
  onCaptureInsight: () => void;
  onTestThisIdea: () => void;
  onReportProblem: () => void;
  onDone: () => void;
  onNotNow: () => void;
  onPark: () => void;
  onNeedsResearch: () => void;
  onResearchThis: () => void;
};

type FounderActionCenterProps = {
  task: FounderRecommendedTask;
  handlers: FounderActionCenterHandlers;
};

export function FounderActionCenter({
  task,
  handlers,
}: FounderActionCenterProps) {
  const [promptText, setPromptText] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const canGeneratePrompt = Boolean(task.cursorContext);
  const promptTitle = useMemo(() => {
    if (!task.cursorContext) return "Cursor prompt";
    return promptTitleForInput(task.cursorContext);
  }, [task.cursorContext]);

  function flash(msg: string) {
    setFeedback(msg);
    window.setTimeout(() => setFeedback(null), 2200);
  }

  function handleGeneratePrompt() {
    if (!task.cursorContext) return;
    const text = generateCursorPrompt(task.cursorContext);
    setPromptText(text);
    flash("Prompt generated.");
  }

  async function handleCopyPrompt() {
    const text =
      promptText ??
      (task.cursorContext ? generateCursorPrompt(task.cursorContext) : "");
    if (!text) return;
    if (!promptText) setPromptText(text);
    try {
      await navigator.clipboard.writeText(text);
      flash("Copied to clipboard.");
    } catch {
      window.alert("Could not copy — select and copy manually.");
    }
  }

  function handleSavePrompt() {
    const text =
      promptText ??
      (task.cursorContext ? generateCursorPrompt(task.cursorContext) : "");
    if (!text || !task.cursorContext) return;
    if (!promptText) setPromptText(text);
    saveCursorPrompt({
      title: promptTitle,
      kind: task.cursorContext.kind,
      body: text,
    });
    flash("Prompt saved.");
  }

  return (
    <section className="rounded-xl border-2 border-[#1e4f4f]/30 bg-white p-4 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
          Action Center
        </p>
        {feedback ? (
          <span className="text-xs font-medium text-[#1e4f4f]">{feedback}</span>
        ) : null}
      </div>

      <div className="mt-4 rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-4">
        <p className="text-[10px] font-bold uppercase text-[#6b635a]">
          Recommended Task
        </p>
        <p className="mt-1 text-base font-semibold text-[#1f1c19]">
          {task.title}
        </p>
        <p className="mt-1 text-sm text-[#6b635a]">{task.reason}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium">
          <span className="rounded-full bg-[#1e4f4f]/10 px-2 py-0.5 text-[#1e4f4f]">
            {levelBadge("Impact", task.impact)}
          </span>
          <span className="rounded-full bg-[#e8c547]/25 px-2 py-0.5 text-[#7a5c00]">
            {levelBadge("Effort", task.effort)}
          </span>
          <span className="rounded-full bg-[#ebe4d9] px-2 py-0.5 text-[#6b635a]">
            Status: {task.status}
          </span>
        </div>
        <button
          type="button"
          onClick={handlers.onStartWorking}
          className={`${btnPrimary} mt-4`}
        >
          Start Working
        </button>
      </div>

      <div className="mt-4">
        <p className="text-[10px] font-bold uppercase text-[#6b635a]">
          Create Cursor Prompt
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGeneratePrompt}
            disabled={!canGeneratePrompt}
            className={btnTeal}
          >
            Generate Prompt
          </button>
          <button
            type="button"
            onClick={() => void handleCopyPrompt()}
            disabled={!canGeneratePrompt}
            className={btn}
          >
            Copy Prompt
          </button>
          <button
            type="button"
            onClick={handleSavePrompt}
            disabled={!canGeneratePrompt}
            className={btn}
          >
            Save Prompt
          </button>
        </div>
        {!canGeneratePrompt ? (
          <p className="mt-2 text-xs text-[#6b635a]">
            Link a project, issue, or experiment to auto-generate a prompt.
          </p>
        ) : null}
        {promptText ? (
          <pre className="mt-3 max-h-40 overflow-y-auto rounded-lg border border-[#d4cdc3] bg-[#f5f0e8] p-3 text-[11px] whitespace-pre-wrap text-[#2d2926]">
            {promptText}
          </pre>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-[10px] font-bold uppercase text-[#6b635a]">
            Create Founder Note
          </p>
          <button
            type="button"
            onClick={handlers.onCaptureInsight}
            className={`${btn} mt-2 w-full`}
          >
            Capture Insight
          </button>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-[#6b635a]">
            Create Experiment
          </p>
          <button
            type="button"
            onClick={handlers.onTestThisIdea}
            className={`${btn} mt-2 w-full`}
          >
            Test This Idea
          </button>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-[#6b635a]">
            Create Issue
          </p>
          <button
            type="button"
            onClick={handlers.onReportProblem}
            className={`${btn} mt-2 w-full`}
          >
            Report Problem
          </button>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[10px] font-bold uppercase text-[#6b635a]">
          Move Forward
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={handlers.onDone} className={btnTeal}>
            Done
          </button>
          <button type="button" onClick={handlers.onNotNow} className={btn}>
            Not Now
          </button>
          <button type="button" onClick={handlers.onPark} className={btn}>
            Park
          </button>
          <button
            type="button"
            onClick={handlers.onNeedsResearch}
            className={btn}
          >
            Needs More Research
          </button>
        </div>
      </div>

      <div className="mt-4 border-t border-[#ebe4d9] pt-4">
        <button
          type="button"
          onClick={handlers.onResearchThis}
          className="rounded-lg border border-[#1e4f4f]/30 bg-[#1e4f4f]/8 px-4 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/12"
        >
          Research This
        </button>
        <p className="mt-1 text-xs text-[#6b635a]">
          Generates research questions and saves them to Notes.
        </p>
      </div>
    </section>
  );
}
