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
  userFacingCreateTypeLabel,
} from "@/lib/createTypePickers";
import { VoiceAnswerField } from "@/components/companion/VoiceAnswerField";
import {
  advanceAfterCustomItem,
  advanceAfterDiscoveryAnswer,
  advanceAfterItemPick,
  buildBriefFromWorkflow,
  categoryIdForType,
  discoveryQuestionsForState,
  readinessSummary,
  resolvedTypeLabel,
  normalizeSimplifiedCreateWorkflow,
  discoveryComplete,
  type CreateWorkflowState,
  type DiscoveryQuestion,
} from "@/lib/createWorkflow";
import { enterAddDetailStep } from "@/lib/createBuild";
import { buildFullCreateBrief } from "@/lib/createTemplates";
import { CreateAddDetailPanel } from "@/components/companion/CreateAddDetailPanel";
import { CreateInspirationLayer } from "@/components/companion/CreateInspirationLayer";
import { WorkspaceStepCard } from "@/components/companion/WorkspaceStepCard";

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

function CreateContextHeader({ itemLabel }: { itemLabel: string }) {
  return (
    <div className="mb-4 text-sm text-[#6b635a]">
      Creating:{" "}
      <span className="font-semibold text-[#1f1c19]">{itemLabel}</span>
    </div>
  );
}

function QuestionCard({
  sectionLabel,
  title,
  children,
  footer,
}: {
  sectionLabel?: string;
  title?: string;
  children: ReactNode;
  footer?: string;
}) {
  return (
    <WorkspaceStepCard
      sectionLabel={sectionLabel ?? "Create"}
      title={title}
      showCreateTooltip={sectionLabel === "Create" || !sectionLabel}
      footer={footer}
    >
      {children}
    </WorkspaceStepCard>
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
  buildErrorMessage,
  onClearBuildError,
  companionDriven = false,
  onOpenSavedWork,
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
  buildErrorMessage?: string | null;
  onClearBuildError?: () => void;
  /** Chat owns discovery — panel only shows the type picker. */
  companionDriven?: boolean;
  onOpenSavedWork?: (savedWorkId: string) => void;
}) {
  const [draftAnswer, setDraftAnswer] = useState("");
  const [customItemText, setCustomItemText] = useState(
    workflow.customTypeLabel ?? "",
  );

  const normalizedWorkflow = normalizeSimplifiedCreateWorkflow(workflow);
  if (normalizedWorkflow.step !== workflow.step) {
    onWorkflowChange(normalizedWorkflow);
    return null;
  }

  const resolvedType = resolvedTypeLabel(normalizedWorkflow) || typeLabel;
  const displayType = resolvedType || "item";
  const itemLabel =
    normalizedWorkflow.selectedTypeLabel === OTHER_OPTION
      ? normalizedWorkflow.customTypeLabel?.trim() || "Custom item"
      : userFacingCreateTypeLabel(normalizedWorkflow.selectedTypeLabel) ??
        normalizedWorkflow.selectedTypeLabel ??
        userFacingCreateTypeLabel(displayType) ??
        displayType;

  function shariInput(wf: CreateWorkflowState): CreationWorkspaceInput {
    const selected = resolvedTypeLabel(wf) || displayType;
    return {
      itemType: selected,
      title: selected,
      brief: buildBriefFromWorkflow(wf),
      stage: wf.step === "readiness" ? "ready to build" : "discovery with Shari",
      source: "generated",
      createWorkflow: wf,
    };
  }

  function openShariForWorkflow(wf: CreateWorkflowState) {
    onBuildWithShari?.(shariInput(wf));
  }

  function pickOutcome(label: string) {
    if (label === OTHER_OPTION) {
      onWorkflowChange(advanceAfterItemPick(label));
      return;
    }
    const route = resolveCreateItemRoute(label);
    if (route) {
      onRoutedItem(route);
      return;
    }
    const next = advanceAfterItemPick(label);
    onTypeSelect(label, next.categoryId ?? categoryIdForType(label) ?? "content");
    onWorkflowChange(next);
    if (onBuildWithShari) {
      openShariForWorkflow(next);
    }
  }

  if (companionDriven && normalizedWorkflow.step !== "category") {
    return null;
  }

  // ── Step 1: outcome ───────────────────────────────────────────────────────
  if (normalizedWorkflow.step === "category") {
    const itemOptions = PRIMARY_CREATE_ITEMS.map((label) => ({
      value: label,
      label: userFacingCreateTypeLabel(label) ?? label,
    }));
    const showingCustomItem = normalizedWorkflow.selectedTypeLabel === OTHER_OPTION;

    return (
      <div className="companion-fade-in flex flex-1 flex-col justify-center px-4 py-6">
        <QuestionCard
          title="What would you like to create?"
          footer="You can also tell Shari in chat."
        >
          <CreateInspirationLayer
            onPick={(item) => {
              if (item.createType) pickOutcome(item.createType);
            }}
            onOpenSavedWork={onOpenSavedWork}
          />
          <CategoryPickerSelect
              label="Content type"
              hideLabel
              value={normalizedWorkflow.selectedTypeLabel ?? NO_CATEGORY}
              onChange={(v) => {
                if (!v) return;
                pickOutcome(v);
              }}
              options={itemOptions}
              placeholder="Social Media Post, Email, Newsletter…"
            />
          {showingCustomItem ? (
            <div className="mt-4">
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
                  if (onBuildWithShari) {
                    openShariForWorkflow(next);
                  }
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

  // ── Discovery — panel-only path (no companion chat) ─────────────────────────
  if (normalizedWorkflow.step === "discovery" && resolvedType) {
    const question = discoveryQuestionsForState(resolvedType, normalizedWorkflow);
    if (!question) {
      if (discoveryComplete(resolvedType, normalizedWorkflow)) {
        onWorkflowChange({ ...normalizedWorkflow, step: "readiness" });
      }
      return null;
    }

    return (
      <div className="companion-fade-in mx-auto max-w-lg">
        <button
          type="button"
          onClick={() =>
            onWorkflowChange({
              ...normalizedWorkflow,
              step: "category",
              discoveryIndex: 0,
            })
          }
          className="mb-3 text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Change item
        </button>
        <CreateContextHeader itemLabel={itemLabel} />
        <QuestionCard title={question.prompt} footer={questionHint(question)}>
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
          <button
            type="button"
            disabled={!draftAnswer.trim()}
            onClick={() => {
              const next = advanceAfterDiscoveryAnswer(
                normalizedWorkflow,
                resolvedType,
                question.id,
                draftAnswer.trim(),
              );
              setDraftAnswer("");
              onWorkflowChange(next);
            }}
            className={`mt-4 ${btnPrimary}`}
          >
            Continue
          </button>
        </QuestionCard>
      </div>
    );
  }

  // ── Add more detail (after readiness — does not restart discovery) ─────────
  if (normalizedWorkflow.step === "add-detail" && resolvedType) {
    return (
      <div className="companion-fade-in mx-auto max-w-lg">
        <CreateContextHeader itemLabel={itemLabel} />
        <CreateAddDetailPanel
          workflow={normalizedWorkflow}
          onWorkflowChange={onWorkflowChange}
          onBack={() =>
            onWorkflowChange({
              ...normalizedWorkflow,
              step: "readiness",
              draftStatus: "idle",
            })
          }
        />
      </div>
    );
  }

  // ── Readiness ─────────────────────────────────────────────────────────────
  if (normalizedWorkflow.step === "readiness" && resolvedType) {
    const brief = buildFullCreateBrief(normalizedWorkflow);
    const summary = readinessSummary(
      resolvedType,
      normalizedWorkflow.discoveryAnswers,
    );

    return (
      <div className="companion-fade-in mx-auto max-w-lg">
        <CreateContextHeader itemLabel={itemLabel} />
        <QuestionCard>
          <p className="text-lg font-semibold text-[#1f1c19]">
            Ready to build your {userFacingCreateTypeLabel(displayType) ?? displayType}.
          </p>
          <p className="mt-1 text-sm text-[#6b635a]">
            Shari has enough for a first draft — you can refine after.
          </p>
          {buildError ? (
            <div className="mt-4 rounded-xl border border-[#e8c4c4] bg-[#fdf5f5] px-3 py-3 text-sm text-[#6b3a3a]">
              <p className="font-semibold">
                {buildErrorMessage ??
                  "Something went wrong creating your draft."}
              </p>
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
                    onWorkflowChange(enterAddDetailStep(normalizedWorkflow));
                  }}
                  className={btnSecondary}
                >
                  Add More Detail
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
                onWorkflowChange(enterAddDetailStep(normalizedWorkflow));
              }}
              className={btnSecondary}
            >
              Add More Detail
            </button>
          </div>
        </QuestionCard>
      </div>
    );
  }

  return null;
}
