"use client";

import { useState, type ReactNode } from "react";
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
import { VoiceAnswerField } from "@/components/companion/VoiceAnswerField";
import {
  advanceAfterCustomItem,
  advanceAfterCustomSubtype,
  advanceAfterDiscoveryAnswer,
  advanceAfterItemPick,
  advanceAfterSubtypePick,
  advanceFromTemplate,
  advanceToDiscovery,
  buildBriefFromWorkflow,
  categoryIdForType,
  discoveryQuestionProgress,
  discoveryQuestionsForState,
  readinessSummary,
  resolvedTypeLabel,
  shouldOfferDiscovery,
  skipDiscoveryQuestion,
  type CreateWorkflowState,
  type DiscoveryQuestion,
} from "@/lib/createWorkflow";
import { enterAddDetailStep } from "@/lib/createBuild";
import { buildFullCreateBrief } from "@/lib/createTemplates";
import { CreateTemplatePanel } from "@/components/companion/CreateTemplatePanel";
import { CreateAddDetailPanel } from "@/components/companion/CreateAddDetailPanel";

const btnPrimary =
  "w-full rounded-xl bg-[#1e4f4f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:cursor-not-allowed disabled:opacity-40";
const btnSecondary =
  "w-full rounded-xl border border-[#1e4f4f]/30 bg-white px-5 py-3 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5] disabled:opacity-40";

function questionHint(question: DiscoveryQuestion): string {
  if (question.placeholder?.toLowerCase().includes("sentence")) {
    return question.placeholder;
  }
  return "One sentence is enough.";
}

function CreateContextHeader({
  itemLabel,
  subtypeLabel,
}: {
  itemLabel: string;
  subtypeLabel?: string | null;
}) {
  return (
    <div className="mb-4 space-y-0.5 text-sm">
      <p className="text-[#6b635a]">
        Creating:{" "}
        <span className="font-semibold text-[#1f1c19]">{itemLabel}</span>
      </p>
      {subtypeLabel ? (
        <p className="text-[#6b635a]">
          Type:{" "}
          <span className="font-semibold text-[#1f1c19]">{subtypeLabel}</span>
        </p>
      ) : null}
    </div>
  );
}

function CreateShariHelp({
  onBuildWithShari,
  disabled,
}: {
  onBuildWithShari: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-6 border-t border-[#e7dfd4] pt-4 text-center">
      <p className="text-sm text-[#6b635a]">Need help?</p>
      <button
        type="button"
        disabled={disabled}
        onClick={onBuildWithShari}
        className="mt-2 rounded-xl border border-[#1e4f4f]/25 bg-white px-5 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/5 disabled:opacity-40"
      >
        Work With Shari
      </button>
    </div>
  );
}

function QuestionCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#e7dfd4] bg-white p-5 shadow-sm">
      {children}
    </div>
  );
}

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
  buildError,
  onClearBuildError,
  onChangeTemplate,
}: {
  workflow: CreateWorkflowState;
  typeLabel: string;
  onWorkflowChange: (next: CreateWorkflowState) => void;
  onTypeSelect: (label: string, categoryId: string) => void;
  onRoutedItem: (section: NonNullable<CreateCatalogItem["route"]>) => void;
  onBuildDraft: (brief: string) => void | Promise<boolean>;
  onBuildWithShari?: (input: CreationWorkspaceInput) => void;
  onAddMoreDetail?: () => void;
  building?: boolean;
  buildError?: boolean;
  onClearBuildError?: () => void;
  onChangeTemplate?: () => void;
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
  const itemLabel =
    workflow.selectedTypeLabel === OTHER_OPTION
      ? workflow.customTypeLabel?.trim() || "Custom item"
      : workflow.selectedTypeLabel ?? displayType;
  const subtypeLabel = effectiveSubtypeLabel(
    workflow.selectedSubtype,
    workflow.customSubtype,
  );

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
      <div className="companion-fade-in mx-auto max-w-lg">
        <QuestionCard>
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
                onTypeSelect(
                  v,
                  next.categoryId ?? categoryIdForType(v) ?? "content",
                );
                onWorkflowChange(next);
              }}
              options={itemOptions}
              placeholder="Select an item type…"
            />
          </div>
          {showingCustomItem ? (
            <div className="mt-4">
              <p className="text-base font-semibold text-[#1f1c19]">
                Tell me what you want to create.
              </p>
              <VoiceAnswerField
                value={customItemText}
                onChange={setCustomItemText}
                multiline={false}
                compact
                placeholder="e.g. Case study, podcast outline…"
                autoFocus
                micTitle="Tell me what you want to create"
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
                className={`mt-4 ${btnPrimary}`}
              >
                Continue
              </button>
            </div>
          ) : null}
        </QuestionCard>
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
      <div className="companion-fade-in mx-auto max-w-lg">
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
          className="mb-3 text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Change item
        </button>
        <CreateContextHeader itemLabel={item} />
        <QuestionCard>
          <p className="text-lg font-semibold text-[#1f1c19]">
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
                  advanceFromTemplate(advanceAfterSubtypePick(workflow, v)),
                );
              }}
              options={subtypeOptions}
              placeholder="Select a subtype…"
            />
          </div>
          {showingCustomSubtype ? (
            <div className="mt-4">
              <p className="text-base font-semibold text-[#1f1c19]">
                Tell me more specifically.
              </p>
              <VoiceAnswerField
                value={customSubtypeText}
                onChange={setCustomSubtypeText}
                multiline={false}
                compact
                placeholder={`What kind of ${item.toLowerCase()} is this?`}
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
                    advanceFromTemplate(
                      advanceAfterCustomSubtype(workflow, customSubtypeText),
                    ),
                  );
                }}
                className={`mt-4 ${btnPrimary}`}
              >
                Continue
              </button>
            </div>
          ) : null}
        </QuestionCard>
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
      <div className="companion-fade-in mx-auto max-w-lg">
        <CreateContextHeader itemLabel={selected} subtypeLabel={subtypeLabel} />
        <QuestionCard>
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
              onWorkflowChange(advanceFromTemplate(workflow));
            }}
            className={`mt-4 ${btnPrimary}`}
          >
            Continue
          </button>
        </QuestionCard>
      </div>
    );
  }

  if (workflow.step === "confirm" && !shouldOfferDiscovery(workflow)) {
    onWorkflowChange({ ...workflow, step: "template" });
    return null;
  }

  // ── Template selection / edit ─────────────────────────────────────────────
  if (workflow.step === "template" && resolvedType) {
    return (
      <div className="companion-fade-in mx-auto max-w-lg">
        <button
          type="button"
          onClick={() =>
            onWorkflowChange({
              ...workflow,
              step: workflow.selectedSubtype ? "type" : "category",
            })
          }
          className="mb-3 text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Back
        </button>
        <CreateContextHeader itemLabel={itemLabel} subtypeLabel={subtypeLabel} />
        <QuestionCard>
          <p className="text-lg font-semibold text-[#1f1c19]">
            Choose how to structure your {displayType.toLowerCase()}
          </p>
          <p className="mt-1 text-sm text-[#6b635a]">
            Pick a template, edit sections, or create without one.
          </p>
          <CreateTemplatePanel workflow={workflow} onWorkflowChange={onWorkflowChange} />
          <button
            type="button"
            onClick={() => onWorkflowChange(advanceFromTemplate(workflow))}
            className={`mt-5 ${btnPrimary}`}
          >
            Continue
          </button>
        </QuestionCard>
      </div>
    );
  }

  // ── Discovery — one question at a time ────────────────────────────────────
  if (workflow.step === "discovery" && resolvedType) {
    const question = discoveryQuestionsForState(resolvedType, workflow);
    if (!question) {
      onWorkflowChange({ ...workflow, step: "readiness" });
      return null;
    }
    const { current, total } = discoveryQuestionProgress(resolvedType, workflow);

    return (
      <div className="companion-fade-in mx-auto max-w-lg">
        <button
          type="button"
          onClick={() =>
            onWorkflowChange({
              ...workflow,
              step: workflow.selectedSubtype ? "template" : "category",
              discoveryIndex: 0,
            })
          }
          className="mb-3 text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Back
        </button>
        <CreateContextHeader itemLabel={itemLabel} subtypeLabel={subtypeLabel} />
        <QuestionCard>
          <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
            Question {current} of {total}
          </p>
          <p className="mt-2 text-lg font-semibold text-[#1f1c19]">
            {question.prompt}
          </p>
          <p className="mt-1 text-sm text-[#6b635a]">{questionHint(question)}</p>
          <VoiceAnswerField
            value={draftAnswer}
            onChange={setDraftAnswer}
            placeholder={question.placeholder ?? "Your answer…"}
            autoFocus
            compact
            multiline={false}
            className="mt-4"
            micTitle={`Answer: ${question.prompt}`}
          />
          <div className="mt-4 flex flex-col gap-2">
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
              className={btnPrimary}
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
              className="text-sm font-semibold text-[#9a8f82] hover:text-[#6b635a]"
            >
              Skip this question
            </button>
          </div>
        </QuestionCard>
        {onBuildWithShari ? (
          <CreateShariHelp
            disabled={building}
            onBuildWithShari={() => onBuildWithShari(shariInput(workflow))}
          />
        ) : null}
      </div>
    );
  }

  // ── Add more detail (after readiness — does not restart discovery) ─────────
  if (workflow.step === "add-detail" && resolvedType) {
    return (
      <div className="companion-fade-in mx-auto max-w-lg">
        <CreateContextHeader itemLabel={itemLabel} subtypeLabel={subtypeLabel} />
        <CreateAddDetailPanel
          workflow={workflow}
          onWorkflowChange={onWorkflowChange}
          onBack={() =>
            onWorkflowChange({ ...workflow, step: "readiness", draftStatus: "idle" })
          }
        />
      </div>
    );
  }

  // ── Readiness ─────────────────────────────────────────────────────────────
  if (workflow.step === "readiness" && resolvedType) {
    const brief = buildFullCreateBrief(workflow);
    const summary = readinessSummary(resolvedType, workflow.discoveryAnswers);

    return (
      <div className="companion-fade-in mx-auto max-w-lg">
        <CreateContextHeader itemLabel={itemLabel} subtypeLabel={subtypeLabel} />
        <QuestionCard>
          <p className="text-lg font-semibold text-[#1f1c19]">
            Ready to create your {displayType}.
          </p>
          <p className="mt-1 text-sm text-[#6b635a]">
            I have enough to draft this — review below, then create when you&apos;re ready.
          </p>
          <CreateTemplatePanel
            workflow={workflow}
            onWorkflowChange={onWorkflowChange}
            compact
          />
          {buildError ? (
            <div className="mt-4 rounded-xl border border-[#e8c4c4] bg-[#fdf5f5] px-3 py-3 text-sm text-[#6b3a3a]">
              <p className="font-semibold">Something went wrong creating your draft.</p>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={building}
                  onClick={() => {
                    onClearBuildError?.();
                    void onBuildDraft(brief);
                  }}
                  className={btnPrimary}
                >
                  Try Again
                </button>
                <button
                  type="button"
                  disabled={building}
                  onClick={() => {
                    onClearBuildError?.();
                    onWorkflowChange(enterAddDetailStep(workflow));
                  }}
                  className={btnSecondary}
                >
                  Add More Detail
                </button>
                <button
                  type="button"
                  disabled={building}
                  onClick={() => {
                    onClearBuildError?.();
                    onChangeTemplate?.();
                    onWorkflowChange({ ...workflow, step: "template", draftStatus: "idle" });
                  }}
                  className={btnSecondary}
                >
                  Change Template
                </button>
              </div>
            </div>
          ) : null}
          {summary.length > 0 ? (
            <details className="mt-4 rounded-xl border border-[#e7dfd4] bg-[#faf7f2] px-3 py-2">
              <summary className="cursor-pointer text-sm font-semibold text-[#6b635a]">
                Review what you shared ({summary.length})
              </summary>
              <ul className="mt-2 space-y-2 text-sm text-[#4b463f]">
                {summary.map((row) => (
                  <li key={row.label}>
                    <span className="font-semibold text-[#1f1c19]">
                      {row.label}
                    </span>
                    <br />
                    {row.value}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              disabled={building}
              onClick={() => void onBuildDraft(brief)}
              className={btnPrimary}
            >
              {building ? `Creating your ${displayType}…` : "Create Draft"}
            </button>
            <button
              type="button"
              disabled={building}
              onClick={() => {
                if (onAddMoreDetail) {
                  onAddMoreDetail();
                  return;
                }
                onWorkflowChange(enterAddDetailStep(workflow));
              }}
              className={btnSecondary}
            >
              Add More Detail
            </button>
            {onBuildWithShari ? (
              <button
                type="button"
                disabled={building}
                onClick={() => onBuildWithShari(shariInput(workflow))}
                className={btnSecondary}
              >
                Work With Shari
              </button>
            ) : null}
          </div>
        </QuestionCard>
      </div>
    );
  }

  return null;
}
