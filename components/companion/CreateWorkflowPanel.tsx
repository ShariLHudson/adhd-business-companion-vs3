"use client";

import { useState } from "react";
import {
  catalogTypesPickerLabel,
  dropdownItemsInCategory,
  sortedCreateCatalog,
  type CreateCatalogItem,
} from "@/lib/createCatalog";
import { CategoryPickerSelect } from "@/components/companion/CategoryPickerSelect";
import { NO_CATEGORY } from "@/lib/categoryRevealUx";
import type { CreationWorkspaceInput } from "@/lib/workspaceCreation";
import {
  advanceAfterDiscoveryAnswer,
  advanceAfterTypePick,
  advanceToDiscovery,
  buildBriefFromDiscovery,
  catalogCategory,
  discoveryQuestionsForState,
  readinessSummary,
  skipDiscoveryQuestion,
  type CreateWorkflowState,
} from "@/lib/createWorkflow";

export function CreateWorkflowPanel({
  workflow,
  typeLabel,
  onWorkflowChange,
  onTypeSelect,
  onRoutedItem,
  onBuildDraft,
  onBuildWithShari,
  building,
}: {
  workflow: CreateWorkflowState;
  typeLabel: string;
  onWorkflowChange: (next: CreateWorkflowState) => void;
  onTypeSelect: (label: string, categoryId: string) => void;
  onRoutedItem: (section: NonNullable<CreateCatalogItem["route"]>) => void;
  onBuildDraft: (brief: string) => void;
  onBuildWithShari?: (input: CreationWorkspaceInput) => void;
  building?: boolean;
}) {
  const [draftAnswer, setDraftAnswer] = useState("");

  if (workflow.step === "category") {
    const catalog = sortedCreateCatalog();
    const categoryOptions = catalog.map((c) => ({ value: c.id, label: c.label }));

    return (
      <div className="companion-fade-in">
        <p className="text-lg font-semibold text-[#1f1c19]">
          What would you like to create?
        </p>
        <div className="mt-4">
          <CategoryPickerSelect
            label="Category"
            value={NO_CATEGORY}
            onChange={(v) => {
              if (!v) return;
              onWorkflowChange({
                ...workflow,
                step: "type",
                categoryId: v,
                selectedTypeLabel: null,
              });
            }}
            options={categoryOptions}
            placeholder="Select a category…"
          />
        </div>
      </div>
    );
  }

  if (workflow.step === "type" && workflow.categoryId) {
    const cat = catalogCategory(workflow.categoryId);
    const items = dropdownItemsInCategory(workflow.categoryId);
    const typeOptions = items.map((item) => ({
      value: item.label,
      label: item.label,
    }));

    return (
      <div className="companion-fade-in">
        <button
          type="button"
          onClick={() =>
            onWorkflowChange({
              ...workflow,
              step: "category",
              categoryId: null,
              selectedTypeLabel: null,
            })
          }
          className="text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Category
        </button>
        <p className="mt-3 text-lg font-semibold text-[#1f1c19]">
          What would you like to create?
        </p>
        <div className="mt-4">
          <CategoryPickerSelect
            label={catalogTypesPickerLabel(workflow.categoryId)}
            value={workflow.selectedTypeLabel ?? NO_CATEGORY}
            onChange={(v) => {
              if (!v) return;
              onWorkflowChange(advanceAfterTypePick(v, workflow.categoryId));
            }}
            options={typeOptions}
            placeholder={`Select ${cat?.label.toLowerCase() ?? "a"} type…`}
          />
        </div>
      </div>
    );
  }

  if (workflow.step === "confirm" && workflow.selectedTypeLabel && workflow.categoryId) {
    const selected = workflow.selectedTypeLabel;
    const item = dropdownItemsInCategory(workflow.categoryId).find(
      (i) => i.label === selected,
    );
    const routed = Boolean(item?.route);

    return (
      <div className="companion-fade-in">
        <button
          type="button"
          onClick={() =>
            onWorkflowChange({
              ...workflow,
              step: "type",
              selectedTypeLabel: null,
            })
          }
          className="text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Change type
        </button>
        <p className="mt-3 text-lg font-semibold text-[#1f1c19]">
          Ready to create your {selected}?
        </p>
        <div className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              if (routed && item?.route) {
                onRoutedItem(item.route);
                return;
              }
              onTypeSelect(selected, workflow.categoryId!);
              onWorkflowChange(advanceToDiscovery(workflow));
            }}
            className="w-full rounded-xl bg-[#1e4f4f] px-6 py-3 text-base font-semibold text-white hover:bg-[#163a3a]"
          >
            {routed ? `Open ${selected}` : `Create ${selected}`}
          </button>
          {!routed && onBuildWithShari ? (
            <button
              type="button"
              onClick={() => {
                onTypeSelect(selected, workflow.categoryId!);
                onBuildWithShari({
                  itemType: selected,
                  title: selected,
                  brief: "",
                  stage: "discovery with Shari",
                  source: "generated",
                });
              }}
              className="w-full rounded-xl border border-[#1e4f4f]/35 bg-white px-6 py-3 text-base font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
            >
              💬 Work With Shari
            </button>
          ) : null}
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
              step: "confirm",
              discoveryIndex: 0,
              discoveryAnswers: {},
            })
          }
          className="text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Back
        </button>
        <p className="mt-2 text-sm font-medium text-[#1e4f4f]">{typeLabel}</p>
        <p className="mt-2 text-lg font-semibold text-[#1f1c19]">{question.prompt}</p>
        <p className="mt-1 text-sm text-[#6b635a]">
          <span className="font-medium text-[#4b463f]">Why I&apos;m asking:</span>{" "}
          {question.why}
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
      </div>
    );
  }

  return null;
}
