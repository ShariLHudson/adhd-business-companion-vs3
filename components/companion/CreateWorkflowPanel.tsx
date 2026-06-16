"use client";

import { useState } from "react";
import type { CreateCatalogItem } from "@/lib/createCatalog";
import { CategoryPickerSelect } from "@/components/companion/CategoryPickerSelect";
import { NO_CATEGORY } from "@/lib/categoryRevealUx";
import type { CreationWorkspaceInput } from "@/lib/workspaceCreation";
import {
  PRIMARY_CREATE_ITEMS,
  OTHER_OPTION,
  resolveCreateItemRoute,
  subtypeOptionsForItem,
  subtypePickerLabel,
  effectiveSubtypeLabel,
} from "@/lib/createTypePickers";
import {
  advanceAfterCustomItem,
  advanceAfterCustomSubtype,
  advanceAfterDiscoveryAnswer,
  advanceAfterItemPick,
  advanceAfterSubtypePick,
  advanceToDiscovery,
  buildBriefFromWorkflow,
  categoryIdForType,
  discoveryQuestionsForState,
  readinessSummary,
  resolvedTypeLabel,
  shouldOfferDiscovery,
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
  onAddMoreDetail,
  building,
}: {
  workflow: CreateWorkflowState;
  typeLabel: string;
  onWorkflowChange: (next: CreateWorkflowState) => void;
  onTypeSelect: (label: string, categoryId: string) => void;
  onRoutedItem: (section: NonNullable<CreateCatalogItem["route"]>) => void;
  onBuildDraft: (brief: string) => void;
  onBuildWithShari?: (input: CreationWorkspaceInput) => void;
  onAddMoreDetail?: () => void;
  building?: boolean;
}) {
  const [draftAnswer, setDraftAnswer] = useState("");
  const [customItemText, setCustomItemText] = useState(
    workflow.customTypeLabel ?? "",
  );
  const [customSubtypeText, setCustomSubtypeText] = useState(
    workflow.customSubtype ?? "",
  );

  const resolvedType = resolvedTypeLabel(workflow) || typeLabel;
  const displayType = resolvedType || "item";

  function shariInput(wf: CreateWorkflowState): CreationWorkspaceInput {
    const selected = resolvedTypeLabel(wf) || displayType;
    const categoryId =
      wf.categoryId ?? categoryIdForType(selected) ?? "content";
    return {
      itemType: selected,
      title: selected,
      brief: buildBriefFromWorkflow(wf),
      stage: wf.step === "readiness" ? "ready to build" : "discovery with Shari",
      source: "generated",
      createWorkflow: wf,
    };
  }

  // ── Step 1: item type ─────────────────────────────────────────────────────
  if (workflow.step === "category") {
    const itemOptions = PRIMARY_CREATE_ITEMS.map((label) => ({
      value: label,
      label,
    }));
    const showingCustomItem = workflow.selectedTypeLabel === OTHER_OPTION;

    return (
      <div className="companion-fade-in">
        <p className="text-lg font-semibold text-[#1f1c19]">
          What would you like to create?
        </p>
        <div className="mt-4">
          <CategoryPickerSelect
            label="Item type"
            value={workflow.selectedTypeLabel ?? NO_CATEGORY}
            onChange={(v) => {
              if (!v) return;
              if (v === OTHER_OPTION) {
                onWorkflowChange(advanceAfterItemPick(v));
                return;
              }
              const route = resolveCreateItemRoute(v);
              if (route) {
                onRoutedItem(route);
                return;
              }
              const next = advanceAfterItemPick(v);
              onTypeSelect(v, next.categoryId ?? categoryIdForType(v) ?? "content");
              onWorkflowChange(next);
            }}
            options={itemOptions}
            placeholder="Select an item type…"
          />
        </div>
        {showingCustomItem ? (
          <div className="mt-4">
            <label className="text-sm font-semibold text-[#4b463f]">
              Tell me what you want to create.
            </label>
            <input
              type="text"
              value={customItemText}
              onChange={(e) => setCustomItemText(e.target.value)}
              placeholder="e.g. Case study, podcast outline, onboarding packet…"
              className="mt-2 w-full rounded-xl border border-[#c9bfb0] bg-white px-4 py-3 text-base outline-none focus:border-[#1e4f4f]"
              autoFocus
            />
            <button
              type="button"
              disabled={!customItemText.trim()}
              onClick={() => {
                const next = advanceAfterCustomItem(customItemText);
                onTypeSelect(
                  customItemText.trim(),
                  next.categoryId ?? "content",
                );
                onWorkflowChange(next);
              }}
              className="mt-3 rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  // ── Step 2: subtype ───────────────────────────────────────────────────────
  if (workflow.step === "type" && workflow.selectedTypeLabel) {
    const item = workflow.selectedTypeLabel;
    const subtypeOptions = subtypeOptionsForItem(item).map((label) => ({
      value: label,
      label,
    }));
    const showingCustomSubtype = workflow.selectedSubtype === OTHER_OPTION;

    return (
      <div className="companion-fade-in">
        <button
          type="button"
          onClick={() =>
            onWorkflowChange({
              ...workflow,
              step: "category",
              selectedTypeLabel: null,
              selectedSubtype: null,
              customTypeLabel: null,
              customSubtype: null,
            })
          }
          className="text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Change item
        </button>
        <p className="mt-3 text-sm font-medium text-[#1e4f4f]">{item}</p>
        <p className="mt-1 text-lg font-semibold text-[#1f1c19]">
          {subtypePickerLabel(item)}
        </p>
        <div className="mt-4">
          <CategoryPickerSelect
            label="Subtype"
            value={workflow.selectedSubtype ?? NO_CATEGORY}
            onChange={(v) => {
              if (!v) return;
              if (v === OTHER_OPTION) {
                onWorkflowChange(advanceAfterSubtypePick(workflow, v));
                return;
              }
              const categoryId =
                workflow.categoryId ?? categoryIdForType(item) ?? "content";
              onTypeSelect(item, categoryId);
              onWorkflowChange(
                advanceToDiscovery(advanceAfterSubtypePick(workflow, v), {
                  preserveAnswers: true,
                }),
              );
            }}
            options={subtypeOptions}
            placeholder="Select a subtype…"
          />
        </div>
        {showingCustomSubtype ? (
          <div className="mt-4">
            <label className="text-sm font-semibold text-[#4b463f]">
              Tell me more specifically.
            </label>
            <input
              type="text"
              value={customSubtypeText}
              onChange={(e) => setCustomSubtypeText(e.target.value)}
              placeholder={`What kind of ${item.toLowerCase()} is this?`}
              className="mt-2 w-full rounded-xl border border-[#c9bfb0] bg-white px-4 py-3 text-base outline-none focus:border-[#1e4f4f]"
              autoFocus
            />
            <button
              type="button"
              disabled={!customSubtypeText.trim()}
              onClick={() => {
                const categoryId =
                  workflow.categoryId ?? categoryIdForType(item) ?? "content";
                onTypeSelect(item, categoryId);
                onWorkflowChange(
                  advanceToDiscovery(
                    advanceAfterCustomSubtype(workflow, customSubtypeText),
                    { preserveAnswers: true },
                  ),
                );
              }}
              className="mt-3 rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  // ── Legacy confirm — only when discovery still needed ─────────────────────
  if (
    workflow.step === "confirm" &&
    workflow.selectedTypeLabel &&
    shouldOfferDiscovery(workflow)
  ) {
    const selected = resolvedTypeLabel(workflow) || workflow.selectedTypeLabel;
    return (
      <div className="companion-fade-in">
        <p className="text-lg font-semibold text-[#1f1c19]">
          Ready to shape your {selected}?
        </p>
        <button
          type="button"
          onClick={() => {
            const categoryId =
              workflow.categoryId ??
              categoryIdForType(selected) ??
              "content";
            onTypeSelect(selected, categoryId);
            onWorkflowChange(
              advanceToDiscovery(workflow, { preserveAnswers: true }),
            );
          }}
          className="mt-5 w-full rounded-xl border border-[#1e4f4f]/35 bg-white px-6 py-3 text-base font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
        >
          Answer a few questions
        </button>
      </div>
    );
  }

  if (workflow.step === "confirm" && !shouldOfferDiscovery(workflow)) {
    onWorkflowChange({ ...workflow, step: "readiness" });
    return null;
  }

  // ── Discovery ─────────────────────────────────────────────────────────────
  if (workflow.step === "discovery" && resolvedType) {
    const question = discoveryQuestionsForState(resolvedType, workflow);
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
              step: workflow.selectedSubtype ? "type" : "category",
              discoveryIndex: 0,
            })
          }
          className="text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Back
        </button>
        <p className="mt-2 text-sm font-medium text-[#1e4f4f]">{displayType}</p>
        {effectiveSubtypeLabel(workflow.selectedSubtype, workflow.customSubtype) ? (
          <p className="text-sm text-[#6b635a]">
            {effectiveSubtypeLabel(workflow.selectedSubtype, workflow.customSubtype)}
          </p>
        ) : null}
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
                resolvedType,
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
              const next = skipDiscoveryQuestion(
                workflow,
                resolvedType,
                question.id,
              );
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

  // ── Readiness ─────────────────────────────────────────────────────────────
  if (workflow.step === "readiness" && resolvedType) {
    const summary = readinessSummary(resolvedType, workflow.discoveryAnswers);
    const brief = buildBriefFromWorkflow(workflow);
    const subtype = effectiveSubtypeLabel(
      workflow.selectedSubtype,
      workflow.customSubtype,
    );

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
        <p className="mt-2 text-lg font-semibold text-[#1f1c19]">
          Ready to build your {displayType}
          {subtype ? ` (${subtype})` : ""}.
        </p>
        <p className="mt-1 text-sm text-[#6b635a]">
          I think I have enough information to build this. Would you like me to create the draft?
        </p>
        {summary.length > 0 ? (
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
        ) : null}
        <div className="mt-5 flex flex-col gap-3">
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
            className="w-full rounded-xl bg-[#1e4f4f] px-6 py-3 text-base font-semibold text-white hover:bg-[#163a3a] disabled:opacity-50"
          >
            {building ? `Building your ${displayType}…` : "Build Draft"}
          </button>
          <button
            type="button"
            disabled={building}
            onClick={() => {
              if (onAddMoreDetail) {
                onAddMoreDetail();
                return;
              }
              onWorkflowChange({
                ...workflow,
                step: "discovery",
                discoveryIndex: workflow.discoveryIndex,
              });
            }}
            className="w-full rounded-xl border border-[#1e4f4f]/35 bg-white px-6 py-3 text-base font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5] disabled:opacity-50"
          >
            Add More Detail
          </button>
          {onBuildWithShari ? (
            <button
              type="button"
              disabled={building}
              onClick={() => onBuildWithShari(shariInput(workflow))}
              className="w-full rounded-xl border border-[#1e4f4f]/35 bg-white px-6 py-3 text-base font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5] disabled:opacity-50"
            >
              💬 Work With Shari
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return null;
}
