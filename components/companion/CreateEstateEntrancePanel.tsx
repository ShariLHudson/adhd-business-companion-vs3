"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CreateEstateRoomShell } from "@/components/companion/CreateEstateRoomShell";
import { CreateBrowseCategoriesPanel } from "@/components/companion/CreateBrowseCategoriesPanel";
import { CreateFindPreviousWorkPanel } from "@/components/companion/CreateFindPreviousWorkPanel";
import { CreateWorkspaceResumeList } from "@/components/companion/CreateWorkspaceResumeList";
import { AppBackButton } from "@/components/companion/AppBackButton";
import {
  CREATE_ESTATE_AMBIGUITY_CANCEL,
  CREATE_ESTATE_BROWSE_CATEGORIES_HEADING,
  CREATE_ESTATE_CONFIRM_CANCEL,
  CREATE_ESTATE_CONFIRM_OTHER,
  CREATE_ESTATE_CONTINUE_HEADING,
  CREATE_ESTATE_CREATE_FROM_SCRATCH_LABEL,
  CREATE_ESTATE_DESCRIBE_PLACEHOLDER,
  CREATE_ESTATE_ENTRANCE_INVITATION,
  CREATE_ESTATE_FIND_PREVIOUS_WORK_HEADING,
  CREATE_ESTATE_FIND_PREVIOUS_WORK_HINT,
  CREATE_ESTATE_HELP_ME_CHOOSE_LABEL,
  CREATE_ESTATE_NO_SEARCH_RESULTS_MESSAGE,
  CREATE_ESTATE_OPEN_FAILED_MESSAGE,
  CREATE_ESTATE_START_CREATING_LABEL,
  CREATE_ESTATE_START_NEW_LABEL,
  CREATE_ESTATE_START_NEW_READY_MESSAGE,
  CREATE_ESTATE_UNDERSTANDING_CONTINUE_LABEL,
  CREATE_ESTATE_UNDERSTANDING_EXAMPLES_LABEL,
  CREATE_ESTATE_UNDERSTANDING_PLACEHOLDER,
  CREATE_ESTATE_UNDERSTANDING_SKIP_LABEL,
  CREATE_ESTATE_WHAT_WOULD_YOU_LIKE_HEADING,
  CREATE_ESTATE_WINDOW_TITLE,
} from "@/lib/createEstate/copy";
import {
  advanceEntranceUnderstanding,
  armEntranceUnderstandingHandoff,
  clearEntranceUnderstandingHandoff,
  startEntranceUnderstanding,
  startGuidedEntranceUnderstanding,
  type EntranceUnderstandingSession,
  type EntranceUnderstandingStep,
} from "@/lib/createEstate/entranceUnderstanding";
import {
  createConfirmPrimaryLabel,
} from "@/lib/createEstate/createIntentConfirmation";
import type { ActiveCreationWorkspaceSummary } from "@/lib/createEstate/listActiveCreationWorkspaces";
import { listActiveCreationWorkspaces } from "@/lib/createEstate/listActiveCreationWorkspaces";
import { getRuntimeCreationRecord } from "@/lib/currentFocus/creationRecord";
import {
  resolveSuggestionContext,
} from "@/lib/createEstate/contextAwareSuggestions";
import { queryExploreIdeas } from "@/lib/createEstate/exploreIdeas/search";
import type { ExploreIdeaResult } from "@/lib/createEstate/exploreIdeas/types";
import {
  confirmCreateBeginToOpen,
  resolveCatalogCreateConfirm,
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
import { SPARK_CREATE_MORE_WAYS_MAX_DECISION_LAYERS } from "@/lib/sparkCreateIntentConstitution/types";
import { resolveCreateLauncherType } from "@/lib/createLauncherTypes";
import {
  CREATE_BEGIN_PROGRESS_MESSAGE,
} from "@/lib/primaryActionFeedback";
import { resolveCreateExitDestination } from "@/lib/createGuidedConversation189";
import type { CreateCatalogItem } from "@/lib/createCatalog";
import { useDismissibleWindow } from "@/lib/windowDismiss";
import { tryDirectNavigationInterrupt } from "@/lib/conversationRouter/tryDirectNavigationInterrupt";

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
  const [prompt, setPrompt] = useState("");
  const [activeWorkspaces, setActiveWorkspaces] = useState<
    ActiveCreationWorkspaceSummary[]
  >([]);
  const [beginBusy, setBeginBusy] = useState(false);
  const [startNewBusy, setStartNewBusy] = useState(false);
  const [beginFeedback, setBeginFeedback] = useState<string | null>(null);
  const [beginFeedbackKind, setBeginFeedbackKind] = useState<
    "clarify" | "error" | "progress" | "confirm" | "understanding" | null
  >(null);
  // Chat-First Reasoning Phase 1 — the understanding conversation that runs
  // before classification (AT-1.x). The composer doubles as the answer box.
  const [understanding, setUnderstanding] =
    useState<EntranceUnderstandingSession | null>(null);
  const [understandingGuided, setUnderstandingGuided] = useState(false);
  // The completed conversation, held for the Working Memory handoff armed at
  // the moment the member confirms (never before — Rule 12 / 130).
  const completedUnderstandingRef =
    useRef<EntranceUnderstandingSession | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<Extract<
    CreateBeginOutcome,
    { kind: "confirm" }
  > | null>(null);
  const [pendingAnywhereClarify, setPendingAnywhereClarify] = useState<Extract<
    GuidedBeginOpenOutcome,
    { kind: "clarify" }
  > | null>(null);
  const [helpMeChooseOpen, setHelpMeChooseOpen] = useState(false);
  const [findPreviousWorkOpen, setFindPreviousWorkOpen] = useState(false);
  // Entrance Cleanup (2026-08) — Start Freely narrows the screen to a
  // focused writing surface once the member has engaged with the input.
  // Never hides the feedback area; reverts once blurred with empty text.
  const [composerFocused, setComposerFocused] = useState(false);
  const confirmRegionRef = useRef<HTMLDivElement | null>(null);
  const promptInputRef = useRef<HTMLTextAreaElement | null>(null);

  const exitDestination = resolveCreateExitDestination(exitOriginHint);
  const suggestionContext = useMemo(
    () => resolveSuggestionContext(activeWorkspaces),
    [activeWorkspaces],
  );

  // Part 10 — the same field doubles as natural-language search. Two
  // characters is enough to start narrowing; never a separate search box.
  // Suspended while the understanding conversation is active — the member is
  // answering a question, not searching (Rule 4: no competing UI).
  const trimmedPrompt = prompt.trim();
  const searchResults = useMemo<ExploreIdeaResult[]>(() => {
    if (trimmedPrompt.length < 2 || understanding) return [];
    return queryExploreIdeas({
      search: trimmedPrompt,
      suggestionContext,
    }).slice(0, 5);
  }, [trimmedPrompt, suggestionContext, understanding]);
  const isSearching = trimmedPrompt.length >= 2 && !understanding;

  // Entrance Cleanup (2026-08) — Start Freely: once the member has engaged
  // with the input (focused it or typed anything), narrow to a focused
  // writing surface. Reverts once blurred with the field empty again.
  const composerEngaged = composerFocused || trimmedPrompt.length > 0;

  // Spec 132 — Escape dismisses the confirm/understanding layer before
  // leaving Create.
  useDismissibleWindow({
    open: true,
    onClose: onBack,
    closeOnEscape:
      beginFeedbackKind !== "confirm" && beginFeedbackKind !== "understanding",
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

  // Spec 132 — Escape during the understanding conversation cancels the
  // conversation layer, never the room.
  useEffect(() => {
    if (beginFeedbackKind !== "understanding" || !understanding) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setUnderstanding(null);
      setUnderstandingGuided(false);
      setBeginFeedback(null);
      setBeginFeedbackKind(null);
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [beginFeedbackKind, understanding]);

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

  /** Chat-First Phase 1 — render an understanding step or hand to confirm. */
  function applyUnderstandingStep(step: EntranceUnderstandingStep) {
    if (step.kind === "question") {
      setUnderstanding(step.session);
      const parts = [
        step.acknowledgment,
        step.intro,
        step.question.prompt,
      ].filter((part): part is string => Boolean(part));
      setBeginFeedback(parts.join("\n\n"));
      setBeginFeedbackKind("understanding");
      setBeginBusy(false);
      return;
    }

    // Understanding complete — classification ran on the enriched
    // conversation; the member's wording stays the identity. The 130 gate
    // is unchanged: confirm before anything exists.
    setUnderstanding(null);
    setUnderstandingGuided(false);
    completedUnderstandingRef.current = step.session;
    const outcome = step.outcome;

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
    if (outcome.kind === "confirm") {
      showConfirm(
        step.acknowledgment
          ? { ...outcome, message: `${step.acknowledgment}\n\n${outcome.message}` }
          : outcome,
      );
      return;
    }
    // Defensive — resolveCreateBeginOutcome no longer returns open.
    openConfirmed(outcome);
  }

  function skipUnderstandingQuestion() {
    if (!understanding) return;
    applyUnderstandingStep(
      advanceEntranceUnderstanding(understanding, "", { skip: true }),
    );
  }

  function cancelUnderstandingToExamples() {
    setUnderstanding(null);
    setUnderstandingGuided(false);
    setBeginFeedback(null);
    setBeginFeedbackKind(null);
    setHelpMeChooseOpen(true);
  }

  function requestCatalogConfirm(item: CreateCatalogItem) {
    // A choice from suggested chips, search results, or Browse More /
    // Help Me Choose all land here — the confirm gate never differs by path.
    // A catalog pick is not an understanding conversation — never carry a
    // stale one into its Working Memory handoff.
    completedUnderstandingRef.current = null;
    setUnderstanding(null);
    setUnderstandingGuided(false);
    setHelpMeChooseOpen(false);
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
    opts?: { forceNewArmed?: boolean },
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
      // Resuming existing work — entrance answers must never overwrite the
      // resumed record's own memory.
      clearEntranceUnderstandingHandoff();
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

    void (async () => {
      try {
        // Progress only — do not claim durable "saved" before persist ack.
        setBeginFeedback(CREATE_BEGIN_PROGRESS_MESSAGE);
        setBeginFeedbackKind("progress");
        const opened = await Promise.resolve(
          onBeginCreate(outcome, { canonicalWorkId }),
        );
        if (opened === false) {
          clearEntranceUnderstandingHandoff();
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
        clearEntranceUnderstandingHandoff();
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

  function submitPrompt() {
    // Chat-First Phase 1 — mid-conversation, the composer text is the answer
    // to the current understanding question, nothing else.
    if (understanding) {
      const answer = prompt;
      setPrompt("");
      setBeginBusy(true);
      setBeginFeedback(CREATE_BEGIN_PROGRESS_MESSAGE);
      setBeginFeedbackKind("progress");
      applyUnderstandingStep(advanceEntranceUnderstanding(understanding, answer));
      return;
    }

    // Direct Estate navigation outranks Create intent — never append as content.
    const navInterrupt = tryDirectNavigationInterrupt(prompt);
    if (navInterrupt.interrupted && onDirectNavigationInterrupt) {
      const navText = navInterrupt.userText;
      setPrompt("");
      setPendingConfirm(null);
      setPendingAnywhereClarify(null);
      setBeginFeedback(null);
      setBeginFeedbackKind(null);
      setBeginBusy(true);
      setBeginFeedback("Taking you there…");
      setBeginFeedbackKind("progress");
      void Promise.resolve(
        onDirectNavigationInterrupt({
          userText: navText,
          destinationId: navInterrupt.destinationId,
          label: navInterrupt.label,
        }),
      ).then((handled) => {
        if (handled === false) {
          setBeginBusy(false);
          setBeginFeedback(null);
          setBeginFeedbackKind(null);
          setPrompt(navText);
          return;
        }
        setBeginBusy(false);
        setBeginFeedback(null);
        setBeginFeedbackKind(null);
      });
      return;
    }

    // P0 — every Start Creating click produces visible feedback (never silent)
    setBeginBusy(true);
    setBeginFeedback(CREATE_BEGIN_PROGRESS_MESSAGE);
    setBeginFeedbackKind("progress");
    setPendingConfirm(null);

    // Chat-First Phase 1 — understanding before classification (AT-1.1).
    // startEntranceUnderstanding returns null only for empty text; keep the
    // classifier's own empty-clarify handling for that case.
    const step = startEntranceUnderstanding(prompt);
    if (!step) {
      const outcome = resolveCreateBeginOutcome(prompt);
      if (outcome.kind === "clarify") {
        setBeginFeedback(outcome.message);
        setBeginFeedbackKind("clarify");
        setBeginBusy(false);
        // Empty Start Freely click — make the next action obvious instead of
        // leaving the member wondering what happened (live-testing gap).
        if (outcome.reason === "empty") {
          promptInputRef.current?.focus();
        }
        return;
      }
      setBeginFeedback(
        outcome.kind === "error" ? outcome.message : null,
      );
      setBeginFeedbackKind(outcome.kind === "error" ? "error" : null);
      setBeginBusy(false);
      return;
    }

    completedUnderstandingRef.current = null;
    setUnderstandingGuided(false);
    applyUnderstandingStep(step);
  }

  function acceptConfirm() {
    if (!pendingConfirm) return;
    // Chat-First Phase 1 — the member said yes: arm the understanding
    // answers so the workflow seed site writes them into Working Memory
    // (Rule 8; never armed before consent).
    if (completedUnderstandingRef.current) {
      armEntranceUnderstandingHandoff(completedUnderstandingRef.current);
    }
    setBeginBusy(true);
    openConfirmed(confirmCreateBeginToOpen(pendingConfirm));
  }

  function declineConfirm() {
    setPendingConfirm(null);
    setBeginFeedback(
      "No problem — tell me a little more about what you'd like to create, or use Help Me Choose below.",
    );
    setBeginFeedbackKind("clarify");
  }

  function cancelConfirm() {
    setPendingConfirm(null);
    setBeginFeedback(null);
    setBeginFeedbackKind(null);
  }

  function clearFeedbackOnEdit() {
    if (
      beginFeedbackKind === "clarify" ||
      beginFeedbackKind === "error" ||
      beginFeedbackKind === "confirm"
    ) {
      setBeginFeedback(null);
      setBeginFeedbackKind(null);
      setPendingConfirm(null);
      setPendingAnywhereClarify(null);
    }
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

        {/* 2 — What would you like to create? (Part 1 — the default screen) */}
        <section
          className="mt-6 flex flex-col gap-3"
          data-testid="create-estate-composer"
          aria-labelledby="create-estate-composer-heading"
        >
          <h2
            id="create-estate-composer-heading"
            className="text-lg font-semibold text-[#1f1c19]"
          >
            {CREATE_ESTATE_WHAT_WOULD_YOU_LIKE_HEADING}
          </h2>
          <textarea
            ref={promptInputRef}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              clearFeedbackOnEdit();
            }}
            onFocus={() => setComposerFocused(true)}
            onBlur={() => setComposerFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!beginBusy) submitPrompt();
              }
            }}
            rows={3}
            placeholder={
              understanding
                ? CREATE_ESTATE_UNDERSTANDING_PLACEHOLDER
                : CREATE_ESTATE_DESCRIBE_PLACEHOLDER
            }
            className="w-full max-w-2xl resize-y rounded-2xl border border-[#cfc6b8] bg-white/95 px-4 py-4 text-lg leading-relaxed text-[#1f1c19] shadow-sm placeholder:text-[#9a8f82] focus:border-[#8a7a68] focus:outline-none focus:ring-2 focus:ring-[#c4b8a8]/60"
            data-testid="create-estate-nl-input"
            aria-label={CREATE_ESTATE_DESCRIBE_PLACEHOLDER}
            disabled={beginBusy}
          />

          {/* Part 10 — the description field doubles as natural-language search. */}
          {isSearching ? (
            searchResults.length > 0 ? (
              <ul
                className="flex max-w-2xl flex-col gap-1.5"
                data-testid="create-estate-search-results"
                aria-label="Matching ideas"
              >
                {searchResults.map((result) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      disabled={beginBusy}
                      className="flex w-full items-center gap-2 rounded-xl border border-[#e7dfd4] bg-white/90 px-4 py-2.5 text-left text-base text-[#1f1c19] transition hover:border-[#cfc6b8] disabled:opacity-70"
                      data-testid="create-estate-search-result"
                      onClick={() => {
                        if (result.catalogItem) {
                          requestCatalogConfirm(result.catalogItem);
                        }
                      }}
                    >
                      <span aria-hidden="true">{result.emoji}</span>
                      <span className="font-semibold">{result.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div
                className="flex max-w-2xl flex-col gap-2"
                data-testid="create-estate-search-empty"
              >
                <p className="text-sm leading-relaxed text-[#6b635a]">
                  {CREATE_ESTATE_NO_SEARCH_RESULTS_MESSAGE}
                </p>
                <button
                  type="button"
                  disabled={beginBusy}
                  onClick={submitPrompt}
                  className="self-start rounded-xl border border-[#cfc6b8] bg-white px-4 py-2 text-sm font-semibold text-[#3d3429] transition hover:bg-[#f3ebe0] disabled:opacity-70"
                  data-testid="create-estate-create-from-scratch"
                >
                  {CREATE_ESTATE_CREATE_FROM_SCRATCH_LABEL}
                </button>
              </div>
            )
          ) : null}

          <div className="flex flex-col items-start gap-3">
            {/* Universal Reasoning Journey Build Order Step 1 (Founder,
                2026-08-06) — the front door is one question and one action.
                No Start Freely / Start With Guidance / Categories choice
                precedes it (removed). "Help me figure this out" starts the
                SAME understanding conversation as typing (entry-path
                consistency) — it does not open a competing surface. The
                category browser is reachable only from inside that
                conversation's own examples fallback (cancelUnderstandingToExamples),
                never as a first-screen choice. */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={submitPrompt}
                disabled={beginBusy}
                aria-busy={beginBusy}
                className="self-start rounded-xl bg-[#3d3429] px-6 py-3 text-base font-semibold text-[#f7f2ea] transition enabled:hover:bg-[#2c241c] disabled:cursor-wait disabled:opacity-70"
                data-testid="create-estate-start-creating"
                data-primary-action="begin"
              >
                {beginBusy
                  ? "Beginning…"
                  : understanding
                    ? CREATE_ESTATE_UNDERSTANDING_CONTINUE_LABEL
                    : CREATE_ESTATE_START_CREATING_LABEL}
              </button>

              {!composerEngaged && !understanding ? (
                <button
                  type="button"
                  disabled={beginBusy}
                  onClick={() => {
                    completedUnderstandingRef.current = null;
                    setUnderstandingGuided(true);
                    applyUnderstandingStep(startGuidedEntranceUnderstanding());
                  }}
                  className="text-base font-semibold text-[#1e4f4f] transition hover:underline disabled:opacity-70"
                  data-testid="create-estate-help-me-choose"
                >
                  {CREATE_ESTATE_HELP_ME_CHOOSE_LABEL}
                </button>
              ) : null}
            </div>

            {/* Categories only appear when the member doesn't know what they
                need or explicitly asks for examples — reached solely via the
                understanding conversation's own fallback, never a first-screen
                click target. Same CreateBrowseCategoriesPanel / requestCatalogConfirm
                gate as before; only its trigger moved. */}
            {helpMeChooseOpen ? (
              <div
                className="max-w-2xl rounded-2xl border border-[#e7dfd4] bg-white/80 px-4 py-3"
                data-testid="create-estate-browse-categories"
                data-max-decision-layers={SPARK_CREATE_MORE_WAYS_MAX_DECISION_LAYERS}
              >
                <h4 className="text-sm font-semibold text-[#1f1c19]">
                  {CREATE_ESTATE_BROWSE_CATEGORIES_HEADING}
                </h4>
                <div className="mt-2">
                  <CreateBrowseCategoriesPanel
                    mode="guided"
                    onRequestCreate={requestCatalogConfirm}
                  />
                </div>
              </div>
            ) : null}

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
                        setPrompt("");
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
                <p className="whitespace-pre-line">{beginFeedback}</p>
                {/* Chat-First Phase 1 — the understanding conversation's
                    quiet companions: skip is always safe; the examples
                    fallback appears only on the guided path (categories are
                    never exposed first — 133 supersession). */}
                {beginFeedbackKind === "understanding" && understanding ? (
                  <div
                    className="mt-3 flex flex-wrap items-center gap-3"
                    data-testid="create-estate-understanding-controls"
                  >
                    <button
                      type="button"
                      disabled={beginBusy}
                      className="rounded-xl px-4 py-2 text-sm font-semibold text-[#6b635a] transition hover:underline disabled:opacity-70"
                      data-testid="create-estate-understanding-skip"
                      onClick={skipUnderstandingQuestion}
                    >
                      {CREATE_ESTATE_UNDERSTANDING_SKIP_LABEL}
                    </button>
                    {understandingGuided ? (
                      <button
                        type="button"
                        disabled={beginBusy}
                        className="rounded-xl px-4 py-2 text-sm font-semibold text-[#1e4f4f] transition hover:underline disabled:opacity-70"
                        data-testid="create-estate-understanding-examples"
                        onClick={cancelUnderstandingToExamples}
                      >
                        {CREATE_ESTATE_UNDERSTANDING_EXAMPLES_LABEL}
                      </button>
                    ) : null}
                  </div>
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
                        if (!beginBusy) submitPrompt();
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
