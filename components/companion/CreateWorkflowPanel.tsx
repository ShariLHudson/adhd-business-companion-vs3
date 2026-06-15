"use client";

import { useState } from "react";
import { CREATE_CATALOG } from "@/lib/createCatalog";
import {
  advanceAfterDiscoveryAnswer,
  advanceAfterTypePick,
  buildBriefFromDiscovery,
  catalogCategory,
  creatableItemsInCategory,
  discoveryQuestionsForState,
  readinessSummary,
  skipDiscoveryQuestion,
  type CreateWorkflowState,
  workflowStepLabel,
} from "@/lib/createWorkflow";
import type { CreateCatalogItem } from "@/lib/createCatalog";

const progressSteps = ["category", "type", "discovery", "readiness"] as const;

function StepProgress({ step }: { step: CreateWorkflowState["step"] }) {
  const idx = progressSteps.indexOf(step as (typeof progressSteps)[number]);
  if (idx < 0) return null;
  return (
    <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
      {workflowStepLabel(progressSteps[idx])} · step {idx + 1} of {progressSteps.length}
    </p>
  );
}

export function CreateWorkflowPanel({
  workflow,
  typeLabel,
  onWorkflowChange,
  onTypeSelect,
  onRoutedItem,
  onBuildDraft,
  building,
}: {
  workflow: CreateWorkflowState;
  typeLabel: string;
  onWorkflowChange: (next: CreateWorkflowState) => void;
  onTypeSelect: (label: string, categoryId: string) => void;
  onRoutedItem: (section: NonNullable<CreateCatalogItem["route"]>) => void;
  onBuildDraft: (brief: string) => void;
  building?: boolean;
}) {
  const [draftAnswer, setDraftAnswer] = useState("");

  if (workflow.step === "category") {
    return (
      <div className="companion-fade-in">
        <StepProgress step="category" />
        <p className="mt-2 text-lg font-semibold text-[#1f1c19]">What kind of thing are you creating?</p>
        <p className="mt-1 text-sm text-[#6b635a]">
          Pick a category — we&apos;ll narrow from there. One step at a time.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {CREATE_CATALOG.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                onWorkflowChange({
                  ...workflow,
                  step: "type",
                  categoryId: cat.id,
                })
              }
              className="flex items-center gap-3 rounded-xl border border-[#d4cdc3] bg-white/85 px-4 py-3 text-left hover:border-[#1e4f4f]/40"
            >
              <span className="text-xl">{cat.items[0]?.emoji ?? "✨"}</span>
              <span>
                <span className="block font-semibold text-[#1f1c19]">{cat.label}</span>
                <span className="text-sm text-[#6b635a]">
                  {cat.items.filter((i) => !i.route).length} types
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (workflow.step === "type") {
    const cat = workflow.categoryId ? catalogCategory(workflow.categoryId) : null;
    const items = workflow.categoryId
      ? creatableItemsInCategory(workflow.categoryId)
      : [];
    return (
      <div className="companion-fade-in">
        <button
          type="button"
          onClick={() => onWorkflowChange({ ...workflow, step: "category", categoryId: null })}
          className="text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Category
        </button>
        <StepProgress step="type" />
        <p className="mt-2 text-lg font-semibold text-[#1f1c19]">
          {cat?.label ?? "Pick a type"}
        </p>
        <p className="mt-1 text-sm text-[#6b635a]">Which one fits best?</p>
        <div className="mt-4 flex flex-col gap-2">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                if (item.route) {
                  onRoutedItem(item.route);
                  return;
                }
                onTypeSelect(item.label, workflow.categoryId!);
                onWorkflowChange(advanceAfterTypePick(item.label, workflow.categoryId));
              }}
              className="flex items-center gap-3 rounded-xl border border-[#d4cdc3] bg-white/85 px-4 py-3 text-left hover:border-[#1e4f4f]/40"
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="font-semibold text-[#1f1c19]">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (workflow.step === "discovery" && typeLabel) {
    const question = discoveryQuestionsForState(typeLabel, workflow);
    if (!question) {
      onWorkflowChange({ ...workflow, step: "readiness" });
      return null;
    }
    return (
      <div className="companion-fade-in">
        <button
          type="button"
          onClick={() =>
            onWorkflowChange({
              ...workflow,
              step: "type",
              discoveryIndex: 0,
              discoveryAnswers: {},
            })
          }
          className="text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Change type
        </button>
        <StepProgress step="discovery" />
        <p className="mt-2 text-sm font-medium text-[#1e4f4f]">{typeLabel}</p>
        <p className="mt-2 text-lg font-semibold text-[#1f1c19]">{question.prompt}</p>
        <p className="mt-1 text-sm text-[#6b635a]">
          <span className="font-medium text-[#4b463f]">Why I&apos;m asking:</span> {question.why}
        </p>
        <textarea
          value={draftAnswer}
          onChange={(e) => setDraftAnswer(e.target.value)}
          placeholder={question.placeholder ?? "A sentence or two is enough."}
          className="mt-4 min-h-[120px] w-full resize-none rounded-xl border border-[#c9bfb0] bg-white px-4 py-3 text-base leading-relaxed outline-none focus:border-[#1e4f4f]"
          autoFocus
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!draftAnswer.trim()}
            onClick={() => {
              const next = advanceAfterDiscoveryAnswer(
                workflow,
                typeLabel,
                question.id,
                draftAnswer.trim(),
              );
              setDraftAnswer("");
              onWorkflowChange(next);
            }}
            className="rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:opacity-40"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={() => {
              const next = skipDiscoveryQuestion(workflow, typeLabel, question.id);
              setDraftAnswer("");
              onWorkflowChange(next);
            }}
            className="rounded-xl border border-[#c9bfb0] px-4 py-2.5 text-sm font-semibold text-[#6b635a]"
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

  if (workflow.step === "readiness" && typeLabel) {
    const summary = readinessSummary(typeLabel, workflow.discoveryAnswers);
    const brief = buildBriefFromDiscovery(typeLabel, workflow.discoveryAnswers);
    return (
      <div className="companion-fade-in">
        <button
          type="button"
          onClick={() =>
            onWorkflowChange({
              ...workflow,
              step: "discovery",
              discoveryIndex: 0,
            })
          }
          className="text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Edit answers
        </button>
        <StepProgress step="readiness" />
        <p className="mt-2 text-lg font-semibold text-[#1f1c19]">Ready to build your draft?</p>
        <p className="mt-1 text-sm text-[#6b635a]">
          I won&apos;t generate until you approve. Here&apos;s what I&apos;ll use:
        </p>
        {summary.length === 0 ? (
          <p className="mt-4 text-sm text-[#9a8f82]">
            No answers yet — you can still build a starter draft, or go back and add detail.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3 rounded-xl border border-[#d4cdc3] bg-white/90 p-4">
            {summary.map((row) => (
              <li key={row.label}>
                <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
                  {row.label}
                </p>
                <p className="mt-0.5 text-base text-[#1f1c19]">{row.value}</p>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          disabled={building}
          onClick={() => {
            onWorkflowChange({
              ...workflow,
              readinessConfirmed: true,
              buildApproved: true,
              step: "improve",
            });
            onBuildDraft(brief);
          }}
          className="mt-5 w-full rounded-xl bg-[#1e4f4f] px-6 py-3 text-base font-semibold text-white hover:bg-[#163a3a] disabled:opacity-50"
        >
          {building ? "Building your draft…" : "Build my draft"}
        </button>
        <p className="mt-2 text-center text-xs text-[#9a8f82]">
          You can improve it after — nothing is final yet.
        </p>
      </div>
    );
  }

  return null;
}
