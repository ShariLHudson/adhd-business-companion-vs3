"use client";

import { useEffect, useState } from "react";
import { CreateCatalogPicker } from "@/components/companion/CreateCatalogPicker";
import { CreateDraftResumeList } from "@/components/companion/CreateDraftResumeList";
import { CreateEstateRoomShell } from "@/components/companion/CreateEstateRoomShell";
import { CreateWorkspaceResumeList } from "@/components/companion/CreateWorkspaceResumeList";
import { AppBackButton } from "@/components/companion/AppBackButton";
import { UniversalBlueprintInterface } from "@/components/companion/universalBlueprint";
import {
  CREATE_ESTATE_ACTIVE_CHOICE_HEADING,
  CREATE_ESTATE_BEGIN_LABEL,
  CREATE_ESTATE_COMPOSER_PLACEHOLDER,
  CREATE_ESTATE_CONTINUE_EMPTY,
  CREATE_ESTATE_CONTINUE_HEADING,
  CREATE_ESTATE_DRAFTS_HEADING,
  CREATE_ESTATE_EXPLANATION,
  CREATE_ESTATE_PICKER_HEADING,
  CREATE_ESTATE_START_NEW_LABEL,
  CREATE_ESTATE_WINDOW_TITLE,
  CREATE_VS_PROJECTS_CUE,
  createEstateContinueCurrentLabel,
} from "@/lib/createEstate/copy";
import type { ActiveCreationWorkspaceSummary } from "@/lib/createEstate/listActiveCreationWorkspaces";
import { listActiveCreationWorkspaces } from "@/lib/createEstate/listActiveCreationWorkspaces";
import {
  resolveCreateBeginOutcome,
  type CreateBeginOutcome,
} from "@/lib/createEstate/resolveCreateBeginOutcome";
import {
  CREATE_BEGIN_PROGRESS_MESSAGE,
} from "@/lib/primaryActionFeedback";
import {
  CREATE_BACK_TO_FOCUS_DESTINATION,
  CREATE_GUIDED_SUPPORT_LINE,
} from "@/lib/createGuidedConversation189";
import type { CreateCatalogItem } from "@/lib/createCatalog";
import { EVENT_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema";
import { launchFromCreate } from "@/lib/universalWorkEngine";
import { useDismissibleWindow } from "@/lib/windowDismiss";

type Props = {
  onBack: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
  /**
   * P0 — Begin must open workspace or show clarify.
   * Parent executes the open path; panel always shows feedback.
   */
  onBeginCreate: (
    outcome: Extract<CreateBeginOutcome, { kind: "open" }>,
  ) => void | Promise<void>;
  /** Optional browse — catalog type opens workflow. */
  onSelectCreationType: (item: CreateCatalogItem) => void;
  /** Resume an active Creation Workspace — may return verified ok flag (074). */
  onResumeCreationWorkspace: (
    workspace: ActiveCreationWorkspaceSummary,
  ) => void | { ok: boolean; acknowledgment?: string };
  /**
   * Explicit force-new — new Workspace ID; does not resume or duplicate current work.
   */
  onStartSomethingNew: () => void | Promise<void>;
  onOpenSavedDraft: (id: string) => void;
  onRenameDraft: (id: string, title: string) => void;
  onDuplicateDraft: (id: string) => void;
  onDeleteDraft: (id: string) => void;
  /** Sprint 2 — restore Workspace after refresh / return */
  onRestoreContinuity?: () => void;
};

/**
 * Welcome Home → My Work → Create (056)
 * Conversational entry primary · categories optional · workspaces to continue.
 */
export function CreateEstateEntrancePanel({
  onBack,
  registerBack,
  onBeginCreate,
  onSelectCreationType,
  onResumeCreationWorkspace,
  onStartSomethingNew,
  onOpenSavedDraft,
  onRenameDraft,
  onDuplicateDraft,
  onDeleteDraft,
  onRestoreContinuity,
}: Props) {
  const [prompt, setPrompt] = useState("");
  const [activeWorkspaces, setActiveWorkspaces] = useState<
    ActiveCreationWorkspaceSummary[]
  >([]);
  const [beginBusy, setBeginBusy] = useState(false);
  const [startNewBusy, setStartNewBusy] = useState(false);
  const [beginFeedback, setBeginFeedback] = useState<string | null>(null);
  const [beginFeedbackKind, setBeginFeedbackKind] = useState<
    "clarify" | "error" | "progress" | null
  >(null);
  const [blueprintPathOpen, setBlueprintPathOpen] = useState(false);
  const [blueprintWorkAck, setBlueprintWorkAck] = useState<string | null>(null);

  useDismissibleWindow({
    open: true,
    onClose: onBack,
    closeOnEscape: true,
  });

  useEffect(() => {
    if (!registerBack) return;
    registerBack(() => false);
    return () => registerBack(null);
  }, [registerBack]);

  useEffect(() => {
    setActiveWorkspaces(listActiveCreationWorkspaces());
  }, []);

  const hasWorkspaces = activeWorkspaces.length > 0;
  const mostRecent = activeWorkspaces[0] ?? null;

  useEffect(() => {
    onRestoreContinuity?.();
    // Once on entrance mount — restore after refresh / return
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only
  }, []);

  function submitPrompt() {
    // P0 — every Begin click produces visible feedback (never silent)
    setBeginBusy(true);
    setBeginFeedback(CREATE_BEGIN_PROGRESS_MESSAGE);
    setBeginFeedbackKind("progress");

    const outcome = resolveCreateBeginOutcome(prompt);

    if (outcome.kind === "clarify") {
      setBeginFeedback(outcome.message);
      setBeginFeedbackKind("clarify");
      setBeginBusy(false);
      return;
    }

    if (outcome.kind === "error") {
      setBeginFeedback(outcome.message);
      setBeginFeedbackKind("error");
      setBeginBusy(false);
      return;
    }

    // 103 — Event-domain Begin also resolves through Anywhere-Origin (no private path)
    if (outcome.isEventDomain) {
      const anywhere = launchFromCreate({
        originalUserMessage: outcome.text,
        candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
      });
      if (anywhere.decision === "clarify") {
        setBeginFeedback(anywhere.reply);
        setBeginFeedbackKind("clarify");
        setBeginBusy(false);
        return;
      }
      if (anywhere.decision === "continue_existing" && anywhere.reply) {
        setBlueprintWorkAck(anywhere.reply);
      }
    }

    void (async () => {
      try {
        setBeginFeedback("Saving your workspace securely…");
        setBeginFeedbackKind("progress");
        await Promise.resolve(onBeginCreate(outcome));
        // Success transitions away to workspace; keep brief progress if still mounted
        setBeginFeedback(null);
        setBeginFeedbackKind(null);
      } catch {
        setBeginFeedback(
          "I couldn't save that creation yet. Your words are still here — Retry, or pick a type below.",
        );
        setBeginFeedbackKind("error");
      } finally {
        setBeginBusy(false);
      }
    })();
  }

  return (
    <CreateEstateRoomShell onOutsideDismiss={onBack}>
      <div
        className="plan-day-morning-note flex flex-col gap-3 pb-16"
        data-testid="create-estate-entrance"
      >
        <AppBackButton
          destination={CREATE_BACK_TO_FOCUS_DESTINATION}
          onBack={onBack}
          size="compact"
        />

        <h1
          className="plan-day-morning-note__title mt-2"
          data-testid="create-estate-title"
        >
          {CREATE_ESTATE_WINDOW_TITLE}
        </h1>

        <p
          className="mt-1 max-w-xl text-base leading-relaxed text-[#4b463f]"
          data-testid="create-estate-explanation"
        >
          {CREATE_GUIDED_SUPPORT_LINE}
        </p>
        <p
          className="max-w-xl text-sm leading-relaxed text-[#6b635a]"
          data-testid="create-vs-projects-cue"
        >
          {CREATE_VS_PROJECTS_CUE}
        </p>
        <p className="sr-only" data-testid="create-estate-legacy-explanation">
          {CREATE_ESTATE_EXPLANATION}
        </p>

        {mostRecent ? (
          <section
            className="mt-4 flex max-w-2xl flex-col gap-3 rounded-2xl border border-[#e7dfd4] bg-white/80 px-4 py-4"
            data-testid="create-estate-active-choice"
            aria-labelledby="create-estate-active-choice-heading"
          >
            <h2
              id="create-estate-active-choice-heading"
              className="text-lg font-semibold text-[#1f1c19]"
            >
              {CREATE_ESTATE_ACTIVE_CHOICE_HEADING}
            </h2>
            <p className="text-sm leading-relaxed text-[#6b635a]">
              You already have work in motion. Continue it, or start a separate
              new creation.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => onResumeCreationWorkspace(mostRecent)}
                className="rounded-xl bg-[#3d3429] px-5 py-3 text-base font-semibold text-[#f7f2ea] transition hover:bg-[#2c241c]"
                data-testid="create-estate-continue-current"
              >
                {createEstateContinueCurrentLabel(mostRecent.title)}
              </button>
              <button
                type="button"
                disabled={startNewBusy || beginBusy}
                aria-busy={startNewBusy}
                onClick={() => {
                  setStartNewBusy(true);
                  void (async () => {
                    try {
                      await Promise.resolve(onStartSomethingNew());
                    } finally {
                      setStartNewBusy(false);
                    }
                  })();
                }}
                className="rounded-xl border border-[#cfc6b8] bg-[#faf7f2] px-5 py-3 text-base font-semibold text-[#3d3429] transition hover:bg-[#f3ebe0] disabled:opacity-70"
                data-testid="create-estate-start-new"
              >
                {startNewBusy ? "Starting…" : CREATE_ESTATE_START_NEW_LABEL}
              </button>
            </div>
          </section>
        ) : null}

        <section
          className="mt-4 flex flex-col gap-3"
          data-testid="create-estate-composer"
          aria-labelledby="create-estate-composer-heading"
        >
          <h2 id="create-estate-composer-heading" className="sr-only">
            What do you want to create?
          </h2>
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (beginFeedbackKind === "clarify" || beginFeedbackKind === "error") {
                setBeginFeedback(null);
                setBeginFeedbackKind(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!beginBusy) submitPrompt();
              }
            }}
            rows={4}
            placeholder={CREATE_ESTATE_COMPOSER_PLACEHOLDER}
            className="w-full max-w-2xl resize-y rounded-2xl border border-[#cfc6b8] bg-white/95 px-4 py-4 text-lg leading-relaxed text-[#1f1c19] shadow-sm placeholder:text-[#9a8f82] focus:border-[#8a7a68] focus:outline-none focus:ring-2 focus:ring-[#c4b8a8]/60"
            data-testid="create-estate-nl-input"
            aria-label={CREATE_ESTATE_COMPOSER_PLACEHOLDER}
            disabled={beginBusy}
          />
          <div className="flex flex-col items-start gap-2">
            <button
              type="button"
              onClick={submitPrompt}
              disabled={beginBusy}
              aria-busy={beginBusy}
              className="rounded-xl bg-[#3d3429] px-6 py-3 text-base font-semibold text-[#f7f2ea] transition enabled:hover:bg-[#2c241c] disabled:cursor-wait disabled:opacity-70"
              data-testid="create-estate-begin"
              data-primary-action="begin"
            >
              {beginBusy ? "Beginning…" : CREATE_ESTATE_BEGIN_LABEL}
            </button>
            {beginFeedback ? (
              <p
                role="status"
                aria-live="polite"
                className={
                  beginFeedbackKind === "error"
                    ? "max-w-2xl text-base leading-relaxed text-[#8b3a2b]"
                    : beginFeedbackKind === "progress"
                      ? "max-w-2xl text-base leading-relaxed text-[#6b635a]"
                      : "max-w-2xl rounded-xl border border-[#d4cdc3] bg-[#faf7f2] px-4 py-3 text-base leading-relaxed text-[#1f1c19]"
                }
                data-testid="create-estate-begin-feedback"
                data-begin-feedback={beginFeedbackKind ?? "none"}
              >
                {beginFeedback}
              </p>
            ) : null}
          </div>
        </section>

        <section
          className="mt-6"
          data-testid="create-estate-continue"
          aria-labelledby="create-estate-continue-heading"
        >
          <h2
            id="create-estate-continue-heading"
            className="text-lg font-semibold text-[#1f1c19]"
          >
            {CREATE_ESTATE_CONTINUE_HEADING}
          </h2>
          <div className="mt-3">
            <CreateWorkspaceResumeList onResume={onResumeCreationWorkspace} />
          </div>
          {!hasWorkspaces ? (
            <p
              className="mt-3 text-sm text-[#6b635a]"
              data-testid="create-estate-continue-empty"
            >
              {CREATE_ESTATE_CONTINUE_EMPTY}
            </p>
          ) : null}
          {/* P0-006 — one resume story; drafts only when no Creation Workspaces */}
          {!hasWorkspaces ? (
            <details
              className="mt-5 max-w-2xl rounded-xl border border-[#e7dfd4] bg-white/50 px-3 py-2"
              data-testid="create-estate-drafts"
            >
              <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide text-[#9a8f82]">
                {CREATE_ESTATE_DRAFTS_HEADING}
              </summary>
              <div className="mt-2">
                <CreateDraftResumeList
                  onOpen={onOpenSavedDraft}
                  onRename={onRenameDraft}
                  onDuplicate={onDuplicateDraft}
                  onDelete={onDeleteDraft}
                />
              </div>
            </details>
          ) : null}
        </section>

        <details
          className="mt-6 max-w-2xl rounded-2xl border border-[#e7dfd4] bg-white/70 px-4 py-3"
          data-testid="create-estate-blueprint-paths"
          open={blueprintPathOpen}
          onToggle={(e) =>
            setBlueprintPathOpen((e.target as HTMLDetailsElement).open)
          }
        >
          <summary className="cursor-pointer text-lg font-semibold text-[#1f1c19]">
            Start with a Blueprint
          </summary>
          <p className="mt-2 text-sm text-[#6b635a]">
            Scratch, Blueprint, or previous work — one calm path at a time. Event
            Blueprints appear from the shared registry.
          </p>
          <div className="mt-3">
            <UniversalBlueprintInterface
              workTypeId={EVENT_PLAN_WORK_TYPE_ID}
              onStartFromScratch={() => {
                setBlueprintPathOpen(false);
                setPrompt("I want to plan an event from scratch");
                setBeginFeedback(
                  "Describe your event above, then press Begin — no Blueprint required.",
                );
                setBeginFeedbackKind("clarify");
              }}
              onWorkReady={(state) => {
                setBlueprintWorkAck(
                  `Started ${state.blueprintId} as ${state.workId}. Depth can change anytime without starting over.`,
                );
              }}
            />
          </div>
          {blueprintWorkAck ? (
            <p
              className="mt-3 text-sm text-[#1e4f4f]"
              data-testid="create-estate-blueprint-work-ack"
              role="status"
            >
              {blueprintWorkAck}
            </p>
          ) : null}
        </details>

        <details
          className="mt-6 max-w-2xl rounded-2xl border border-[#e7dfd4] bg-white/70 px-4 py-3"
          data-testid="create-estate-picker"
        >
          <summary
            id="create-estate-picker-heading"
            className="cursor-pointer text-lg font-semibold text-[#1f1c19]"
          >
            {CREATE_ESTATE_PICKER_HEADING}
          </summary>
          <p className="mt-2 text-sm text-[#6b635a]">
            Optional — explore types if you prefer browsing. You can always
            describe what you want above instead.
          </p>
          <div className="mt-3">
            <CreateCatalogPicker onSelect={onSelectCreationType} />
          </div>
        </details>
      </div>
    </CreateEstateRoomShell>
  );
}
