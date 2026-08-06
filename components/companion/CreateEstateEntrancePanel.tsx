"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CreateEstateRoomShell } from "@/components/companion/CreateEstateRoomShell";
import { CreateEntryConversationPanel } from "@/components/companion/CreateEntryConversationPanel";
import { CreateFindPreviousWorkPanel } from "@/components/companion/CreateFindPreviousWorkPanel";
import { CreateWorkspaceResumeList } from "@/components/companion/CreateWorkspaceResumeList";
import { AppBackButton } from "@/components/companion/AppBackButton";
import {
  CREATE_ESTATE_AMBIGUITY_CANCEL,
  CREATE_ESTATE_CONFIRM_CANCEL,
  CREATE_ESTATE_CONFIRM_OTHER,
  CREATE_ESTATE_CONTINUE_HEADING,
  CREATE_ESTATE_ENTRANCE_INVITATION,
  CREATE_ESTATE_ENTRY_REFLECTION_PREFIX,
  CREATE_ESTATE_ENTRY_REFLECTION_QUESTION,
  CREATE_ESTATE_ENTRY_SUPPORT_CHOICE_HEADING,
  CREATE_ESTATE_ENTRY_SUPPORT_GUIDED_DESCRIPTION,
  CREATE_ESTATE_ENTRY_SUPPORT_GUIDED_LABEL,
  CREATE_ESTATE_ENTRY_SUPPORT_INDEPENDENT_DESCRIPTION,
  CREATE_ESTATE_ENTRY_SUPPORT_INDEPENDENT_LABEL,
  CREATE_ESTATE_FIND_PREVIOUS_WORK_HEADING,
  CREATE_ESTATE_FIND_PREVIOUS_WORK_HINT,
  CREATE_ESTATE_OPEN_FAILED_MESSAGE,
  CREATE_ESTATE_START_NEW_LABEL,
  CREATE_ESTATE_START_NEW_READY_MESSAGE,
  CREATE_ESTATE_WINDOW_TITLE,
} from "@/lib/createEstate/copy";
import {
  createConfirmPrimaryLabel,
} from "@/lib/createEstate/createIntentConfirmation";
import type { ActiveCreationWorkspaceSummary } from "@/lib/createEstate/listActiveCreationWorkspaces";
import { listActiveCreationWorkspaces } from "@/lib/createEstate/listActiveCreationWorkspaces";
import { getRuntimeCreationRecord } from "@/lib/currentFocus/creationRecord";
import {
  confirmCreateBeginToOpen,
  resolveCreateBeginOutcome,
  switchCreateBeginConfirmType,
  type CreateBeginOutcome,
} from "@/lib/createEstate/resolveCreateBeginOutcome";
import {
  resolveGuidedBeginOpen,
  type GuidedBeginOpenOutcome,
} from "@/lib/createEstate/createBeginOpenArbitration";
import {
  armForceNewCreateSession,
  clearForceNewCreateSession,
} from "@/lib/createEstate/forceNewCreateSession";
import {
  CREATE_BEGIN_PROGRESS_MESSAGE,
} from "@/lib/primaryActionFeedback";
import { resolveCreateExitDestination } from "@/lib/createGuidedConversation189";
import type { CreateCatalogItem } from "@/lib/createCatalog";
import { useDismissibleWindow } from "@/lib/windowDismiss";
import { tryDirectNavigationInterrupt } from "@/lib/conversationRouter/tryDirectNavigationInterrupt";
import type { EntrySupportChoice } from "@/lib/createWorkflowState";

type Props = {
  onBack: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
  /**
   * P0 — Begin must open workspace or show clarify.
   * Parent executes the open path; return false when mount fails.
   */
  onBeginCreate: (
    outcome: Extract<CreateBeginOutcome, { kind: "open" }>,
    opts?: {
      /**
       * Fix C (2026-08-05 audit) — set only when a guided domain
       * (Event/Marketing/Business/Facebook Community) already minted a
       * canonical UWE work id via resolveGuidedBeginOpen. Binds whichever
       * surface actually opens to that identity instead of leaving it
       * orphaned or double-minted under a second id.
       */
      canonicalWorkId?: string | null;
      /**
       * Conversational Create Entrance (2026-08-06) — "How would you like
       * to work?" captured from the new entry conversation. Hook field per
       * the Intelligence-Ready Architecture rule: recorded on the
       * RuntimeCreationRecord, not yet consumed by any Build Type's Current
       * Focus pacing.
       */
      entrySupportChoice?: EntrySupportChoice;
    },
  ) => boolean | void | Promise<boolean | void>;
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
  /**
   * Direct Estate navigation interrupt — runs before Create intent classification.
   * Return true when navigation was handled (composer must not append the phrase).
   */
  onDirectNavigationInterrupt?: (input: {
    userText: string;
    destinationId: string;
    label: string;
  }) => boolean | void | Promise<boolean | void>;
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
 * Welcome Home → Create (056 / 127 / 129 / 131 / 133 / Create Simplification).
 * Hierarchy: Continue Working (if any) → What would you like to create? →
 * Find Previous Work (collapsed) → Browse More (collapsed).
 *
 * Create Simplification & Category Evaluation — the default screen answers
 * one question ("What would you like to create?") with ≤4 suggested choices
 * and no source filters. Previous work and full category browsing are both
 * optional, collapsed, and never shown by default (Parts 1–4).
 */
export function CreateEstateEntrancePanel({
  onBack,
  registerBack,
  onBeginCreate,
  onSelectCreationType: _onSelectCreationType,
  onResumeCreationWorkspace,
  onStartSomethingNew,
  onDirectNavigationInterrupt,
  onOpenSavedDraft,
  onRenameDraft,
  onRenameWorkspace,
  onDuplicateDraft,
  onDeleteDraft,
  onRestoreContinuity,
  exitOriginHint,
}: Props) {
  const [activeWorkspaces, setActiveWorkspaces] = useState<
    ActiveCreationWorkspaceSummary[]
  >([]);
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
  const [pendingAnywhereClarify, setPendingAnywhereClarify] = useState<Extract<
    GuidedBeginOpenOutcome,
    { kind: "clarify" }
  > | null>(null);
  const [findPreviousWorkOpen, setFindPreviousWorkOpen] = useState(false);
  // Conversational Create Entrance (2026-08-06) — the composer is
  // "engaged" once the member has sent their opening message; narrows the
  // screen the same way the old focused-input state used to (hides Find
  // Previous Work / Start New while a conversation is underway).
  const [composerEngaged, setComposerEngaged] = useState(false);
  // The last text handed to submitPrompt — lets Retry resubmit without a
  // shared textarea to read from (the conversation panel owns its own).
  const [lastSubmittedText, setLastSubmittedText] = useState("");
  // The resolved "open" outcome, awaiting the guided/independent choice —
  // set once Yes is clicked on the reflection step, before openConfirmed.
  const [pendingOpenOutcome, setPendingOpenOutcome] = useState<Extract<
    CreateBeginOutcome,
    { kind: "open" }
  > | null>(null);
  const [entrySupportChoice, setEntrySupportChoice] =
    useState<EntrySupportChoice>(null);
  const confirmRegionRef = useRef<HTMLDivElement | null>(null);

  const exitDestination = resolveCreateExitDestination(exitOriginHint);

  // Spec 132 — Escape dismisses the confirm layer before leaving Create.
  useDismissibleWindow({
    open: true,
    onClose: onBack,
    closeOnEscape: beginFeedbackKind !== "confirm",
  });

  useEffect(() => {
    if (beginFeedbackKind !== "confirm" || !pendingConfirm) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setPendingConfirm(null);
      setBeginFeedback(null);
      setBeginFeedbackKind(null);
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [beginFeedbackKind, pendingConfirm]);

  useEffect(() => {
    if (!registerBack) return;
    registerBack(() => false);
    return () => registerBack(null);
  }, [registerBack]);

  useEffect(() => {
    const list = listActiveCreationWorkspaces();
    setActiveWorkspaces(list);
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

  useEffect(() => {
    onRestoreContinuity?.();
    // Once on entrance mount — restore after refresh / return
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only
  }, []);

  function resumeWorkId(workId: string, artifactType: string): boolean {
    // Create Reasoning-First Migration, Phase 1C (2026-08-05) — same
    // Working Memory preference as registerCreationDestinationWorkspace;
    // this is the ambiguity-clarify resume path's own construction site,
    // so it needs the same fallback wired here too.
    const nextAction =
      getRuntimeCreationRecord(workId)?.workingMemory?.nextHelpfulStep ||
      "Continue";
    const result = onResumeCreationWorkspace({
      id: workId,
      title: artifactType,
      kindLabel: artifactType,
      phaseLabel: "In progress",
      updatedAt: new Date().toISOString(),
      eventRecordId: workId,
      creationRecordId: workId,
      projectHomeId: null,
      nextAction,
    });
    if (result && typeof result === "object" && "ok" in result) {
      return Boolean(result.ok);
    }
    return true;
  }

  function openConfirmed(
    outcome: Extract<CreateBeginOutcome, { kind: "open" }>,
    opts?: {
      forceNewArmed?: boolean;
      /** Falls back to the entrySupportChoice state when omitted — the
       * anywhere-clarify continuation calls (acceptAnywhereStartNew) don't
       * pass it explicitly and rely on that fallback. */
      entrySupportChoice?: EntrySupportChoice;
    },
  ) {
    setPendingAnywhereClarify(null);

    const guided = resolveGuidedBeginOpen({
      outcome,
      forceNewArmed: opts?.forceNewArmed,
    });

    if (guided.kind === "clarify") {
      setPendingAnywhereClarify(guided);
      setBeginFeedback(guided.reply);
      setBeginFeedbackKind("clarify");
      setPendingConfirm(null);
      setBeginBusy(false);
      return;
    }

    if (guided.kind === "continue_existing") {
      void (async () => {
        try {
          setBeginFeedback(CREATE_BEGIN_PROGRESS_MESSAGE);
          setBeginFeedbackKind("progress");
          const ok = resumeWorkId(guided.workId, outcome.artifactType);
          if (!ok) {
            setBeginFeedback(CREATE_ESTATE_OPEN_FAILED_MESSAGE);
            setBeginFeedbackKind("error");
            return;
          }
          clearForceNewCreateSession();
          setBeginFeedback(null);
          setBeginFeedbackKind(null);
          setPendingConfirm(null);
        } catch {
          setBeginFeedback(CREATE_ESTATE_OPEN_FAILED_MESSAGE);
          setBeginFeedbackKind("error");
        } finally {
          setBeginBusy(false);
        }
      })();
      return;
    }

    // Fix C — a guided domain (open_new) may have already minted a
    // canonical UWE work id above. Carry it through so whichever surface
    // onBeginCreate opens binds to that identity instead of orphaning it.
    const canonicalWorkId =
      guided.kind === "open_new" ? guided.resolution.workId : null;
    const effectiveSupportChoice =
      opts?.entrySupportChoice ?? entrySupportChoice;

    void (async () => {
      try {
        // Progress only — do not claim durable "saved" before persist ack.
        setBeginFeedback(CREATE_BEGIN_PROGRESS_MESSAGE);
        setBeginFeedbackKind("progress");
        const opened = await Promise.resolve(
          onBeginCreate(outcome, {
            canonicalWorkId,
            entrySupportChoice: effectiveSupportChoice,
          }),
        );
        if (opened === false) {
          setBeginFeedback(CREATE_ESTATE_OPEN_FAILED_MESSAGE);
          setBeginFeedbackKind("error");
          return;
        }
        clearForceNewCreateSession();
        setBeginFeedback(null);
        setBeginFeedbackKind(null);
        setPendingConfirm(null);
        setPendingAnywhereClarify(null);
      } catch {
        setBeginFeedback(CREATE_ESTATE_OPEN_FAILED_MESSAGE);
        setBeginFeedbackKind("error");
      } finally {
        setBeginBusy(false);
      }
    })();
  }

  function acceptAnywhereContinue() {
    if (!pendingAnywhereClarify?.resolution.workId) return;
    setBeginBusy(true);
    const workId = pendingAnywhereClarify.resolution.workId;
    const artifactType = pendingAnywhereClarify.outcome.artifactType;
    setPendingAnywhereClarify(null);
    void (async () => {
      try {
        setBeginFeedback(CREATE_BEGIN_PROGRESS_MESSAGE);
        setBeginFeedbackKind("progress");
        const ok = resumeWorkId(workId, artifactType);
        if (!ok) {
          setBeginFeedback(CREATE_ESTATE_OPEN_FAILED_MESSAGE);
          setBeginFeedbackKind("error");
          return;
        }
        clearForceNewCreateSession();
        setBeginFeedback(null);
        setBeginFeedbackKind(null);
      } catch {
        setBeginFeedback(CREATE_ESTATE_OPEN_FAILED_MESSAGE);
        setBeginFeedbackKind("error");
      } finally {
        setBeginBusy(false);
      }
    })();
  }

  function acceptAnywhereStartNew() {
    if (!pendingAnywhereClarify) return;
    const outcome = pendingAnywhereClarify.outcome;
    armForceNewCreateSession();
    setPendingAnywhereClarify(null);
    setBeginBusy(true);
    openConfirmed(outcome, { forceNewArmed: true });
  }

  function cancelAnywhereClarify() {
    setPendingAnywhereClarify(null);
    setBeginFeedback(null);
    setBeginFeedbackKind(null);
  }

  /**
   * Checked once, against the conversation's opening message only, before
   * any acknowledgment is shown — Estate navigation phrases outrank Create
   * intent and must never be swallowed into the new conversation. Returns
   * true when handled (the panel does nothing further with that turn).
   */
  function handleOpeningMessage(text: string): boolean {
    const navInterrupt = tryDirectNavigationInterrupt(text);
    if (!navInterrupt.interrupted || !onDirectNavigationInterrupt) return false;
    const navText = navInterrupt.userText;
    setPendingConfirm(null);
    setPendingAnywhereClarify(null);
    setBeginBusy(true);
    setBeginFeedback("Taking you there…");
    setBeginFeedbackKind("progress");
    void Promise.resolve(
      onDirectNavigationInterrupt({
        userText: navText,
        destinationId: navInterrupt.destinationId,
        label: navInterrupt.label,
      }),
    ).then(() => {
      setBeginBusy(false);
      setBeginFeedback(null);
      setBeginFeedbackKind(null);
    });
    return true;
  }

  function submitPrompt(text: string) {
    setLastSubmittedText(text);

    // P0 — every Begin produces visible feedback (never silent)
    setBeginBusy(true);
    setBeginFeedback(CREATE_BEGIN_PROGRESS_MESSAGE);
    setBeginFeedbackKind("progress");
    setPendingConfirm(null);

    const outcome = resolveCreateBeginOutcome(text);

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
    // Conversational Create Entrance (2026-08-06) — the guided/independent
    // choice sits between confirming intent and actually opening; hold the
    // resolved outcome until that choice is made instead of opening here.
    setPendingOpenOutcome(confirmCreateBeginToOpen(pendingConfirm));
    setPendingConfirm(null);
    setBeginFeedback(null);
    setBeginFeedbackKind(null);
  }

  function chooseSupportAndOpen(choice: Exclude<EntrySupportChoice, null>) {
    if (!pendingOpenOutcome) return;
    const outcome = pendingOpenOutcome;
    setEntrySupportChoice(choice);
    setPendingOpenOutcome(null);
    setBeginBusy(true);
    openConfirmed(outcome, { entrySupportChoice: choice });
  }

  function declineConfirm() {
    setPendingConfirm(null);
    setBeginFeedback(
      "No problem — tell me a little more about what you'd like to create.",
    );
    setBeginFeedbackKind("clarify");
  }

  function cancelConfirm() {
    setPendingConfirm(null);
    setPendingOpenOutcome(null);
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
          {CREATE_ESTATE_ENTRANCE_INVITATION}
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

        {/* 2 — Conversational Create Entrance (2026-08-06). Replaces Start
            Freely / Start With Guidance / Browse Categories with a single
            open conversation — no categories, no template grid, no section
            UI until the conversation earns that next step. */}
        <section
          className="mt-6 flex flex-col gap-3"
          data-testid="create-estate-composer"
        >
          <CreateEntryConversationPanel
            onReady={submitPrompt}
            onOpeningMessage={handleOpeningMessage}
            onEngagementChange={setComposerEngaged}
            disabled={
              beginBusy ||
              beginFeedbackKind === "confirm" ||
              Boolean(pendingOpenOutcome)
            }
          />

          <div className="flex flex-col items-start gap-3">
            {!composerEngaged && hasWorkspaces ? (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={startNewBusy || beginBusy}
                  aria-busy={startNewBusy}
                  onClick={() => {
                    setStartNewBusy(true);
                    void (async () => {
                      try {
                        armForceNewCreateSession();
                        setPendingConfirm(null);
                        setPendingAnywhereClarify(null);
                        await Promise.resolve(onStartSomethingNew());
                        // Establish usable new-create state — not input-clear only.
                        setBeginFeedback(CREATE_ESTATE_START_NEW_READY_MESSAGE);
                        setBeginFeedbackKind("clarify");
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
              </div>
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
                {beginFeedbackKind === "confirm" ? (
                  <p className="mb-1 font-semibold text-[#1f1c19]">
                    {CREATE_ESTATE_ENTRY_REFLECTION_PREFIX}
                  </p>
                ) : null}
                <p>{beginFeedback}</p>
                {beginFeedbackKind === "confirm" ? (
                  <p className="mt-1">{CREATE_ESTATE_ENTRY_REFLECTION_QUESTION}</p>
                ) : null}
                {beginFeedbackKind === "clarify" && pendingAnywhereClarify ? (
                  <div
                    className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
                    data-testid="create-estate-anywhere-clarify"
                    role="group"
                    aria-label="Continue existing or start new"
                  >
                    {pendingAnywhereClarify.resolution.workId ? (
                      <button
                        type="button"
                        disabled={beginBusy}
                        className="rounded-xl bg-[#3d3429] px-5 py-2.5 text-sm font-semibold text-[#f7f2ea] transition hover:bg-[#2c241c] disabled:opacity-70"
                        data-testid="create-estate-ambiguity-continue"
                        data-primary-action="continue"
                        onClick={acceptAnywhereContinue}
                      >
                        {pendingAnywhereClarify.continueLabel}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={beginBusy}
                      className="rounded-xl border border-[#cfc6b8] bg-white px-5 py-2.5 text-sm font-semibold text-[#3d3429] transition hover:bg-[#f3ebe0] disabled:opacity-70"
                      data-testid="create-estate-ambiguity-start-new"
                      data-primary-action="begin"
                      onClick={acceptAnywhereStartNew}
                    >
                      {pendingAnywhereClarify.startNewLabel}
                    </button>
                    <button
                      type="button"
                      disabled={beginBusy}
                      className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[#6b635a] transition hover:underline disabled:opacity-70"
                      data-testid="create-estate-ambiguity-cancel"
                      onClick={cancelAnywhereClarify}
                    >
                      {CREATE_ESTATE_AMBIGUITY_CANCEL}
                    </button>
                  </div>
                ) : null}
                {beginFeedbackKind === "error" ? (
                  <div className="mt-3">
                    <button
                      type="button"
                      disabled={beginBusy}
                      className="rounded-xl bg-[#3d3429] px-5 py-2.5 text-sm font-semibold text-[#f7f2ea] transition hover:bg-[#2c241c] disabled:opacity-70"
                      data-testid="create-estate-begin-retry"
                      data-primary-action="begin"
                      onClick={() => {
                        if (pendingConfirm) {
                          acceptConfirm();
                          return;
                        }
                        if (!beginBusy) submitPrompt(lastSubmittedText);
                      }}
                    >
                      Retry
                    </button>
                  </div>
                ) : null}
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

            {/* Conversational Create Entrance (2026-08-06) — "how much
                support," not "which thing." Sits between confirming intent
                and actually opening (chooseSupportAndOpen), before
                onBeginCreate ever fires. */}
            {pendingOpenOutcome ? (
              <div
                className="max-w-2xl rounded-xl border border-[#d4cdc3] bg-[#faf7f2] px-4 py-3"
                data-testid="create-estate-support-choice"
                role="group"
                aria-label={CREATE_ESTATE_ENTRY_SUPPORT_CHOICE_HEADING}
              >
                <p className="font-semibold text-[#1f1c19]">
                  {CREATE_ESTATE_ENTRY_SUPPORT_CHOICE_HEADING}
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    disabled={beginBusy}
                    className="flex max-w-xs flex-col items-start gap-1 rounded-xl border border-[#cfc6b8] bg-white px-5 py-3 text-left transition hover:bg-[#f3ebe0] disabled:opacity-70"
                    data-testid="create-estate-support-guided"
                    data-primary-action="begin"
                    onClick={() => chooseSupportAndOpen("guided")}
                  >
                    <span className="text-base font-semibold text-[#3d3429]">
                      {CREATE_ESTATE_ENTRY_SUPPORT_GUIDED_LABEL}
                    </span>
                    <span className="text-sm text-[#6b635a]">
                      {CREATE_ESTATE_ENTRY_SUPPORT_GUIDED_DESCRIPTION}
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={beginBusy}
                    className="flex max-w-xs flex-col items-start gap-1 rounded-xl border border-[#cfc6b8] bg-white px-5 py-3 text-left transition hover:bg-[#f3ebe0] disabled:opacity-70"
                    data-testid="create-estate-support-independent"
                    data-primary-action="begin"
                    onClick={() => chooseSupportAndOpen("independent")}
                  >
                    <span className="text-base font-semibold text-[#3d3429]">
                      {CREATE_ESTATE_ENTRY_SUPPORT_INDEPENDENT_LABEL}
                    </span>
                    <span className="text-sm text-[#6b635a]">
                      {CREATE_ESTATE_ENTRY_SUPPORT_INDEPENDENT_DESCRIPTION}
                    </span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* 3 — Find Previous Work (Part 2 — separate from idea discovery).
            Entrance Cleanup (2026-08) — steps aside while Start Freely is
            engaged, per the same composerEngaged rule as Start With
            Guidance above; the old separate "Browse More" section (Part 4)
            is retired — its category picker is now the single mount nested
            inside Start With Guidance. */}
        {!composerEngaged ? (
          <details
            className="mt-6 max-w-2xl rounded-2xl border border-[#e7dfd4] bg-white/70 px-4 py-3"
            data-testid="create-estate-find-previous-work"
            open={findPreviousWorkOpen}
            onToggle={(e) =>
              setFindPreviousWorkOpen((e.target as HTMLDetailsElement).open)
            }
          >
            <summary className="cursor-pointer text-lg font-semibold text-[#1f1c19]">
              {CREATE_ESTATE_FIND_PREVIOUS_WORK_HEADING}
            </summary>
            <p className="mt-2 text-sm text-[#6b635a]">
              {CREATE_ESTATE_FIND_PREVIOUS_WORK_HINT}
            </p>

            {findPreviousWorkOpen ? (
              <div className="mt-3">
                <CreateFindPreviousWorkPanel
                  onOpen={onOpenSavedDraft}
                  onRename={onRenameDraft}
                  onDuplicate={onDuplicateDraft}
                  onDelete={onDeleteDraft}
                />
              </div>
            ) : null}
          </details>
        ) : null}
      </div>
    </CreateEstateRoomShell>
  );
}
