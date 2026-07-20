"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CreationSaveStateBadge } from "@/components/companion/CreationSaveStateBadge";
import type { CanonicalCurrentFocus } from "@/lib/currentFocus";
import {
  clearFocusRecoveryBuffer,
  readFocusRecoveryBuffer,
  resolveCreationSaveState,
  writeFocusRecoveryBuffer,
  type CreationSaveState,
} from "@/lib/creationDurable";

type Props = {
  focus: CanonicalCurrentFocus;
  guidance: string | null;
  failureMessage: string | null;
  submitting?: boolean;
  /** True only after last persistCreation* verified durable. */
  lastDurableOk?: boolean | null;
  /** Preserve failed/pending answer across retry — only for this focusId */
  initialResponse?: string | null;
  /** Focus id that owns initialResponse (prevents splice onto next field) */
  failedFocusId?: string | null;
  onSubmit: (response: string) => void;
  onIdeas: () => void;
  onUnsure: () => void;
  /** 082 — Help Me Think (section-scoped). */
  onHelpThink?: () => void;
  onShowExamples?: () => void;
  onReviewThis?: () => void;
  onSkip?: () => void;
  onRetry?: () => void;
  /** Optional external save state override (tests / parent). */
  saveStateOverride?: CreationSaveState | null;
};

/**
 * 066 — Sole Creation response control. Lives inside Current Focus.
 * Atomic advance: disable → clear → parent persists → new focusId remount → empty → enable.
 * 077_005 — local recovery buffer + truthful save state (never “Saved” for LS-only).
 */
export function CurrentFocusInteraction({
  focus,
  guidance,
  failureMessage,
  submitting,
  lastDurableOk = null,
  initialResponse = null,
  failedFocusId = null,
  onSubmit,
  onIdeas,
  onUnsure,
  onHelpThink,
  onShowExamples,
  onReviewThis,
  onSkip,
  onRetry,
  saveStateOverride = null,
}: Props) {
  const recovered =
    typeof window !== "undefined"
      ? readFocusRecoveryBuffer(focus.creationId, focus.focusId)
      : null;
  const [draft, setDraft] = useState(() => recovered ?? "");
  const [localLocked, setLocalLocked] = useState(false);
  const [recoveredOnce, setRecoveredOnce] = useState(() => Boolean(recovered));
  const focusIdRef = useRef(focus.focusId);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const autosaveTimer = useRef<number | null>(null);

  // Synchronous reset when focus advances (before paint — no leftover Outcomes text)
  if (focusIdRef.current !== focus.focusId) {
    focusIdRef.current = focus.focusId;
    const nextRecovered =
      typeof window !== "undefined"
        ? readFocusRecoveryBuffer(focus.creationId, focus.focusId)
        : null;
    setDraft(nextRecovered ?? "");
    setRecoveredOnce(Boolean(nextRecovered));
    if (localLocked) {
      setLocalLocked(false);
    }
  }

  // Failure on same Focus: unlock + restore answer for Retry
  useLayoutEffect(() => {
    if (failureMessage && failedFocusId === focus.focusId) {
      setLocalLocked(false);
      if (initialResponse?.trim()) {
        setDraft(initialResponse);
        writeFocusRecoveryBuffer({
          creationId: focus.creationId,
          focusId: focus.focusId,
          text: initialResponse,
        });
      }
    }
  }, [
    failureMessage,
    initialResponse,
    failedFocusId,
    focus.focusId,
    focus.creationId,
  ]);

  // Autosave draft to local recovery buffer (truthful: not durable)
  useEffect(() => {
    if (localLocked || submitting) return;
    if (autosaveTimer.current) {
      window.clearTimeout(autosaveTimer.current);
    }
    autosaveTimer.current = window.setTimeout(() => {
      writeFocusRecoveryBuffer({
        creationId: focus.creationId,
        focusId: focus.focusId,
        text: draft,
      });
      if (draft.trim()) setRecoveredOnce(true);
    }, 450);
    return () => {
      if (autosaveTimer.current) {
        window.clearTimeout(autosaveTimer.current);
      }
    };
  }, [
    draft,
    focus.creationId,
    focus.focusId,
    localLocked,
    submitting,
  ]);

  // After unlock on a fresh focus, focus the empty textarea
  useEffect(() => {
    if (!localLocked && !submitting && !draft) {
      textareaRef.current?.focus();
    }
  }, [focus.focusId, localLocked, submitting, draft]);

  const locked = Boolean(submitting) || localLocked;
  const saveState =
    saveStateOverride ??
    resolveCreationSaveState({
      submitting: Boolean(submitting) || localLocked,
      failureMessage,
      lastDurableOk,
      dirty: Boolean(draft.trim()),
      hasLocalRecovery: recoveredOnce && Boolean(draft.trim()),
    });

  function handleSubmit() {
    const answer = draft.trim();
    if (!answer || locked) return;
    // 1) immediately disable  2) clear controlled state  3) parent persists + advances
    setLocalLocked(true);
    setDraft("");
    clearFocusRecoveryBuffer(focus.creationId, focus.focusId);
    setRecoveredOnce(false);
    onSubmit(answer);
  }

  return (
    <div
      className="mt-3 flex flex-col gap-3"
      data-testid="current-focus-interaction"
      data-focus-id={focus.focusId}
      data-creation-id={focus.creationId}
      data-focus-locked={locked ? "true" : "false"}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        {focus.introductoryGuidance ? (
          <p
            className="text-sm leading-relaxed text-[#4b463f]"
            data-testid="current-focus-intro"
          >
            {focus.introductoryGuidance}
          </p>
        ) : (
          <span />
        )}
        <CreationSaveStateBadge state={saveState} />
      </div>

      <p
        className="text-base font-medium leading-relaxed text-[#1f1c19]"
        data-testid="current-focus-prompt"
      >
        {focus.prompt}
      </p>

      <textarea
        key={focus.focusId}
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={4}
        disabled={locked}
        placeholder="Answer here…"
        className="w-full resize-y rounded-xl border border-[#cfc6b8] bg-white px-3 py-3 text-base leading-relaxed text-[#1f1c19] placeholder:text-[#9a8f82] focus:border-[#8a7a68] focus:outline-none focus:ring-2 focus:ring-[#c4b8a8]/50"
        data-testid="current-focus-response"
        data-initial-empty={draft === "" ? "true" : "false"}
        aria-label="Current Focus response"
      />

      {guidance ? (
        <p
          className="rounded-xl bg-[#f0f5f5] px-3 py-2 text-sm leading-relaxed text-[#1e4f4f]"
          data-testid="current-focus-guidance"
        >
          {guidance}
        </p>
      ) : null}

      {failureMessage ? (
        <div
          className="rounded-xl border border-[#c9a27a] bg-[#fff8f0] px-3 py-2 text-sm text-[#5c4030]"
          data-testid="current-focus-failure"
        >
          <p>{failureMessage}</p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 text-sm font-semibold text-[#1e4f4f] underline"
              data-testid="current-focus-retry"
            >
              Retry
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={locked || !draft.trim()}
          onClick={handleSubmit}
          className="rounded-xl border border-[#1e4f4f]/35 bg-white px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5] disabled:opacity-40"
          data-testid="current-focus-save"
        >
          Save
        </button>
        <button
          type="button"
          disabled={locked || !draft.trim()}
          onClick={handleSubmit}
          className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:opacity-40"
          data-testid="current-focus-submit"
        >
          {focus.completionCriteria || "Continue"}
        </button>
        {onHelpThink ? (
          <button
            type="button"
            disabled={locked}
            onClick={onHelpThink}
            className="rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-sm font-semibold text-[#4b463f] hover:bg-[#faf7f2]"
            data-testid="current-focus-help-think"
          >
            Help me think
          </button>
        ) : null}
        <button
          type="button"
          disabled={locked}
          onClick={onIdeas}
          className="rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-sm font-semibold text-[#4b463f] hover:bg-[#faf7f2]"
          data-testid="current-focus-ideas"
        >
          Give me ideas
        </button>
        <button
          type="button"
          disabled={locked}
          onClick={onUnsure}
          className="rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-sm font-semibold text-[#4b463f] hover:bg-[#faf7f2]"
          data-testid="current-focus-unsure"
        >
          I&apos;m not sure
        </button>
        {onShowExamples ? (
          <button
            type="button"
            disabled={locked}
            onClick={onShowExamples}
            className="rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-sm font-semibold text-[#4b463f] hover:bg-[#faf7f2]"
            data-testid="current-focus-examples"
          >
            Show examples
          </button>
        ) : null}
        {onReviewThis ? (
          <button
            type="button"
            disabled={locked}
            onClick={onReviewThis}
            className="rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-sm font-semibold text-[#4b463f] hover:bg-[#faf7f2]"
            data-testid="current-focus-review"
          >
            Review this
          </button>
        ) : null}
        {onSkip ? (
          <button
            type="button"
            disabled={locked}
            onClick={onSkip}
            className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#6b635a] hover:underline"
            data-testid="current-focus-skip"
          >
            Skip for now
          </button>
        ) : null}
      </div>
    </div>
  );
}
