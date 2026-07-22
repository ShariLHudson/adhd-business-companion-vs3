"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CreateEstateRoomShell } from "@/components/companion/CreateEstateRoomShell";
import { CreateExploreIdeasPanel } from "@/components/companion/CreateExploreIdeasPanel";
import { CreateWorkspaceResumeList } from "@/components/companion/CreateWorkspaceResumeList";
import { AppBackButton } from "@/components/companion/AppBackButton";
import {
  CREATE_ESTATE_BEGIN_LABEL,
  CREATE_ESTATE_COMPOSER_PLACEHOLDER,
  CREATE_ESTATE_CONFIRM_CANCEL,
  CREATE_ESTATE_CONFIRM_OTHER,
  CREATE_ESTATE_CONTINUE_HEADING,
  CREATE_ESTATE_EXPLORE_IDEAS_HEADING,
  CREATE_ESTATE_EXPLORE_IDEAS_HINT,
  CREATE_ESTATE_START_NEW_HEADING,
  CREATE_ESTATE_START_NEW_LABEL,
  CREATE_ESTATE_WINDOW_TITLE,
} from "@/lib/createEstate/copy";
import {
  createConfirmPrimaryLabel,
} from "@/lib/createEstate/createIntentConfirmation";
import type { ActiveCreationWorkspaceSummary } from "@/lib/createEstate/listActiveCreationWorkspaces";
import { listActiveCreationWorkspaces } from "@/lib/createEstate/listActiveCreationWorkspaces";
import {
  resolveSuggestionContext,
} from "@/lib/createEstate/contextAwareSuggestions";
import {
  confirmCreateBeginToOpen,
  resolveCatalogCreateConfirm,
  resolveCreateBeginOutcome,
  switchCreateBeginConfirmType,
  type CreateBeginOutcome,
} from "@/lib/createEstate/resolveCreateBeginOutcome";
import { SPARK_CREATE_MORE_WAYS_MAX_DECISION_LAYERS } from "@/lib/sparkCreateIntentConstitution/types";
import { resolveCreateLauncherType } from "@/lib/createLauncherTypes";
import { listCreateDraftEntries } from "@/lib/createDraftLibrary";
import {
  CREATE_BEGIN_PROGRESS_MESSAGE,
} from "@/lib/primaryActionFeedback";
import {
  CREATE_GUIDED_SUPPORT_LINE,
  resolveCreateExitDestination,
} from "@/lib/createGuidedConversation189";
import type { CreateCatalogItem } from "@/lib/createCatalog";
import { EVENT_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema";
import { MARKETING_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/marketingPlanMap";
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
  /** Spec 129 — rename active Work; syncs registry + durable store. */
  onRenameWorkspace?: (id: string, title: string) => void | Promise<void>;
  onDuplicateDraft: (id: string) => void;
  onDeleteDraft: (id: string) => void;
  /** Sprint 2 — restore Workspace after refresh / return */
  onRestoreContinuity?: () => void;
  /** Optional origin hint for exit label (Welcome Home vs My Focus). */
  exitOriginHint?: string | null;
};

/**
 * Welcome Home → Create (056 / 127 / 129 / 131 / 133)
 * Hierarchy: Continue Working (if any) → Start Something New → Explore Ideas (collapsed).
 * Spec 131 — ≤3 visible decision layers; Continue Working hidden when empty.
 * Spec 133 — one discovery experience (no framework tabs / duplicate browse chains).
 */
export function CreateEstateEntrancePanel({
  onBack,
  registerBack,
  onBeginCreate,
  onSelectCreationType: _onSelectCreationType,
  onResumeCreationWorkspace,
  onStartSomethingNew,
  onOpenSavedDraft,
  onRenameDraft,
  onRenameWorkspace,
  onDuplicateDraft,
  onDeleteDraft,
  onRestoreContinuity,
  exitOriginHint,
}: Props) {
  const [prompt, setPrompt] = useState("");
  const [activeWorkspaces, setActiveWorkspaces] = useState<
    ActiveCreationWorkspaceSummary[]
  >([]);
  const [draftCount, setDraftCount] = useState(0);
  const [beginBusy, setBeginBusy] = useState(false);
  const [startNewBusy, setStartNewBusy] = useState(false);
  const [beginFeedback, setBeginFeedback] = useState<string | null>(null);
  const [beginFeedbackKind, setBeginFeedbackKind] = useState<
    "clarify" | "error" | "progress" | "confirm" | null
  >(null);
  const [pendingConfirm, setPendingConfirm] = useState<Extract<
    CreateBeginOutcome,
    { kind: "confirm" }
  > | null>(null);
  const [exploreOpen, setExploreOpen] = useState(false);
  const confirmRegionRef = useRef<HTMLDivElement | null>(null);

  const exitDestination = resolveCreateExitDestination(exitOriginHint);
  const suggestionContext = useMemo(
    () => resolveSuggestionContext(activeWorkspaces),
    [activeWorkspaces],
  );

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
    const list = listActiveCreationWorkspaces();
    setActiveWorkspaces(list);
    setDraftCount(listCreateDraftEntries().length);
  }, []);

  useEffect(() => {
    if (beginFeedbackKind !== "confirm" || !pendingConfirm) return;
    confirmRegionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
    const yes = confirmRegionRef.current?.querySelector<HTMLButtonElement>(
      '[data-testid="create-estate-confirm-yes"]',
    );
    yes?.focus();
  }, [beginFeedbackKind, pendingConfirm]);

  const hasWorkspaces = activeWorkspaces.length > 0;

  function showConfirm(
    outcome: Extract<CreateBeginOutcome, { kind: "confirm" }>,
  ) {
    setPendingConfirm(outcome);
    setBeginFeedback(outcome.message);
    setBeginFeedbackKind("confirm");
    setBeginBusy(false);
  }

  function requestCatalogConfirm(item: CreateCatalogItem) {
    const resolved = resolveCreateLauncherType(item.label);
    showConfirm(
      resolveCatalogCreateConfirm({
        label: resolved.catalogLabel,
        requestText: prompt.trim() || null,
      }),
    );
  }

  useEffect(() => {
    onRestoreContinuity?.();
    // Once on entrance mount — restore after refresh / return
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only
  }, []);

  function openConfirmed(outcome: Extract<CreateBeginOutcome, { kind: "open" }>) {
    // 103 / 105 — Event and Marketing Plan Begin resolve through Anywhere-Origin
    if (outcome.isEventDomain || outcome.isMarketingPlanDomain) {
      const anywhere = launchFromCreate({
        originalUserMessage: outcome.text,
        candidateWorkTypeId: outcome.isMarketingPlanDomain
          ? MARKETING_PLAN_WORK_TYPE_ID
          : EVENT_PLAN_WORK_TYPE_ID,
      });
      if (anywhere.decision === "clarify") {
        setBeginFeedback(anywhere.reply);
        setBeginFeedbackKind("clarify");
        setPendingConfirm(null);
        setBeginBusy(false);
        return;
      }
    }

    void (async () => {
      try {
        setBeginFeedback("Saving your workspace securely…");
        setBeginFeedbackKind("progress");
        await Promise.resolve(onBeginCreate(outcome));
        setBeginFeedback(null);
        setBeginFeedbackKind(null);
        setPendingConfirm(null);
      } catch {
        setBeginFeedback(
          "I couldn't save that creation yet. Your words are still here — Retry, or explore ideas below.",
        );
        setBeginFeedbackKind("error");
      } finally {
        setBeginBusy(false);
      }
    })();
  }

  function submitPrompt() {
    // P0 — every Begin click produces visible feedback (never silent)
    setBeginBusy(true);
    setBeginFeedback(CREATE_BEGIN_PROGRESS_MESSAGE);
    setBeginFeedbackKind("progress");
    setPendingConfirm(null);

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

    // Spec 127 / 130 — never silently create; confirm inferred type first.
    if (outcome.kind === "confirm") {
      showConfirm(outcome);
      return;
    }

    // Defensive — resolveCreateBeginOutcome no longer returns open.
    openConfirmed(outcome);
  }

  function acceptConfirm() {
    if (!pendingConfirm) return;
    setBeginBusy(true);
    openConfirmed(confirmCreateBeginToOpen(pendingConfirm));
  }

  function declineConfirm() {
    setPendingConfirm(null);
    setBeginFeedback(
      "No problem — tell me a little more about what you'd like to create, or open Explore Ideas below.",
    );
    setBeginFeedbackKind("clarify");
  }

  function cancelConfirm() {
    setPendingConfirm(null);
    setBeginFeedback(null);
    setBeginFeedbackKind(null);
  }

  return (
    <CreateEstateRoomShell onOutsideDismiss={onBack}>
      <div
        className="plan-day-morning-note flex flex-col gap-3 pb-16"
        data-testid="create-estate-entrance"
      >
        <AppBackButton
          destination={exitDestination}
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

        {/* 1 — Continue Working (Spec 131 Rule 11 — hide when empty) */}
        {hasWorkspaces ? (
          <section
            className="mt-4"
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
              <CreateWorkspaceResumeList
                onResume={onResumeCreationWorkspace}
                onRename={onRenameWorkspace ?? undefined}
              />
            </div>
          </section>
        ) : null}

        {/* 2 — Start Something New */}
        <section
          className="mt-6 flex flex-col gap-3"
          data-testid="create-estate-composer"
          aria-labelledby="create-estate-composer-heading"
        >
          <h2
            id="create-estate-composer-heading"
            className="text-lg font-semibold text-[#1f1c19]"
          >
            {CREATE_ESTATE_START_NEW_HEADING}
          </h2>
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (
                beginFeedbackKind === "clarify" ||
                beginFeedbackKind === "error" ||
                beginFeedbackKind === "confirm"
              ) {
                setBeginFeedback(null);
                setBeginFeedbackKind(null);
                setPendingConfirm(null);
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
            {hasWorkspaces ? (
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
                className="text-sm font-semibold text-[#1e4f4f] hover:underline disabled:opacity-70"
                data-testid="create-estate-start-new"
              >
                {startNewBusy ? "Starting…" : CREATE_ESTATE_START_NEW_LABEL}
              </button>
            ) : null}
            {beginFeedback ? (
              <div
                ref={confirmRegionRef}
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
                <p>{beginFeedback}</p>
                {beginFeedbackKind === "confirm" && pendingConfirm ? (
                  <div
                    className="mt-3 flex flex-col gap-2"
                    data-testid="create-estate-intent-confirm"
                    role="group"
                    aria-label="Confirm what to create"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <button
                        type="button"
                        disabled={beginBusy}
                        className="rounded-xl bg-[#3d3429] px-5 py-2.5 text-sm font-semibold text-[#f7f2ea] transition hover:bg-[#2c241c] disabled:opacity-70"
                        data-testid="create-estate-confirm-yes"
                        data-primary-action="begin"
                        onClick={acceptConfirm}
                      >
                        {createConfirmPrimaryLabel(pendingConfirm.artifactType)}
                      </button>
                      <button
                        type="button"
                        disabled={beginBusy}
                        className="rounded-xl border border-[#cfc6b8] bg-white px-5 py-2.5 text-sm font-semibold text-[#3d3429] transition hover:bg-[#f3ebe0] disabled:opacity-70"
                        data-testid="create-estate-confirm-other"
                        onClick={declineConfirm}
                      >
                        {CREATE_ESTATE_CONFIRM_OTHER}
                      </button>
                      <button
                        type="button"
                        disabled={beginBusy}
                        className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[#6b635a] transition hover:underline disabled:opacity-70"
                        data-testid="create-estate-confirm-cancel"
                        onClick={cancelConfirm}
                      >
                        {CREATE_ESTATE_CONFIRM_CANCEL}
                      </button>
                    </div>
                    {pendingConfirm.alsoConsidered &&
                    pendingConfirm.alsoConsidered.length > 0 ? (
                      <div
                        className="flex flex-col gap-1.5"
                        data-testid="create-estate-also-considered"
                      >
                        <p className="text-sm text-[#6b635a]">Also considered:</p>
                        <div className="flex flex-wrap gap-2">
                          {pendingConfirm.alsoConsidered.map((alt) => (
                            <button
                              key={alt}
                              type="button"
                              disabled={beginBusy}
                              className="rounded-full border border-[#cfc6b8] bg-white px-3 py-1.5 text-sm font-semibold text-[#3d3429] transition hover:bg-[#f3ebe0] disabled:opacity-70"
                              data-testid="create-estate-also-considered-option"
                              data-also-considered={alt}
                              onClick={() => {
                                showConfirm(
                                  switchCreateBeginConfirmType(
                                    pendingConfirm,
                                    alt,
                                  ),
                                );
                              }}
                            >
                              {createConfirmPrimaryLabel(alt)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        {/* 3 — Explore Ideas (Optional) — Spec 133 one discovery experience */}
        <details
          className="mt-6 max-w-2xl rounded-2xl border border-[#e7dfd4] bg-white/70 px-4 py-3"
          data-testid="create-estate-explore-ideas"
          data-max-decision-layers={SPARK_CREATE_MORE_WAYS_MAX_DECISION_LAYERS}
          open={exploreOpen}
          onToggle={(e) =>
            setExploreOpen((e.target as HTMLDetailsElement).open)
          }
        >
          <summary className="cursor-pointer text-lg font-semibold text-[#1f1c19]">
            {CREATE_ESTATE_EXPLORE_IDEAS_HEADING}
          </summary>
          <p className="mt-2 text-sm text-[#6b635a]">
            {CREATE_ESTATE_EXPLORE_IDEAS_HINT}
          </p>

          {exploreOpen ? (
            <CreateExploreIdeasPanel
              activeWorkspaces={activeWorkspaces}
              draftCount={draftCount}
              suggestionContext={suggestionContext}
              onResumeCreationWorkspace={onResumeCreationWorkspace}
              onRenameWorkspace={onRenameWorkspace}
              onOpenSavedDraft={onOpenSavedDraft}
              onRenameDraft={onRenameDraft}
              onDuplicateDraft={onDuplicateDraft}
              onDeleteDraft={onDeleteDraft}
              onRequestCreate={requestCatalogConfirm}
            />
          ) : null}
        </details>
      </div>
    </CreateEstateRoomShell>
  );
}
