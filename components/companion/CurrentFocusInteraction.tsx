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
 * 066 / 098 — Sole Creation response control inside Current Focus.
 * One primary decision while writing: save this section.
 * Secondary assistance lives behind progressive disclosure (T-003 max 3 choices).
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
  const seedContent = () =>
    recovered ?? focus.savedContent?.trim() ?? "";
  const [draft, setDraft] = useState(seedContent);
  const [localLocked, setLocalLocked] = useState(false);
  const [recoveredOnce, setRecoveredOnce] = useState(() => Boolean(recovered));
  const [assistOpen, setAssistOpen] = useState(false);
  const focusIdRef = useRef(focus.focusId);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const autosaveTimer = useRef<number | null>(null);

  // Synchronous reset when focus advances (before paint — no leftover prior section)
  if (focusIdRef.current !== focus.focusId) {
    focusIdRef.current = focus.focusId;
    const nextRecovered =
      typeof window !== "undefined"
        ? readFocusRecoveryBuffer(focus.creationId, focus.focusId)
        : null;
    setDraft(nextRecovered ?? focus.savedContent?.trim() ?? "");
    setRecoveredOnce(Boolean(nextRecovered));
    setAssistOpen(false);
    if (localLocked) {
      setLocalLocked(false);
    }
  }

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
      data-section-mode="writing"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p
          className="text-sm leading-relaxed text-[#4b463f]"
          data-testid="current-focus-writing-intent"
        >
          You&apos;re writing this section. Everything else can wait.
        </p>
        <CreationSaveStateBadge state={saveState} />
      </div>

      <p
        className="text-base font-medium leading-relaxed text-[#1f1c19]"
        data-testid="current-focus-prompt"
      >
        {focus.prompt}
      </p>

      <textarea
        key={`${focus.creationId}:${focus.sectionId ?? focus.focusId}`}
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={6}
        disabled={locked}
        placeholder="Write here…"
        className="w-full resize-y rounded-xl border border-[#cfc6b8] bg-white px-3 py-3 text-base leading-relaxed text-[#1f1c19] placeholder:text-[#9a8f82] focus:border-[#8a7a68] focus:outline-none focus:ring-2 focus:ring-[#c4b8a8]/50"
        data-testid="current-focus-response"
        data-section-id={focus.sectionId ?? undefined}
        data-initial-empty={draft === "" ? "true" : "false"}
        aria-label={`Writing ${focus.title}`}
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

      {/* One primary action — Spec 103 / 098 UX */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={locked || !draft.trim()}
          onClick={handleSubmit}
          className="rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:opacity-40"
          data-testid="current-focus-save"
          data-primary-action="save-section"
        >
          Save this section
        </button>
        {/* Alias for race / legacy tests that click submit */}
        <button
          type="button"
          hidden
          tabIndex={-1}
          aria-hidden="true"
          disabled={locked || !draft.trim()}
          onClick={handleSubmit}
          data-testid="current-focus-submit"
        >
          Save this section
        </button>
      </div>

      <div
        className="border-t border-[#e7dfd4] pt-2"
        data-testid="current-focus-assist-disclosure"
      >
        <button
          type="button"
          disabled={locked}
          aria-expanded={assistOpen}
          onClick={() => setAssistOpen((o) => !o)}
          className="text-sm font-medium text-[#6b635a] underline-offset-2 hover:text-[#1e4f4f] hover:underline disabled:opacity-40"
          data-testid="current-focus-need-a-hand"
        >
          {assistOpen ? "Hide help" : "Need a hand?"}
        </button>
        {assistOpen ? (
          <div
            className="mt-2 flex flex-col gap-1.5"
            role="group"
            aria-label="Optional help for this section"
          >
            <p className="text-xs leading-relaxed text-[#9a8f82]">
              Optional — only if you want company while you write.
            </p>
            <div className="flex flex-wrap gap-2">
              {onHelpThink ? (
                <button
                  type="button"
                  disabled={locked}
                  onClick={onHelpThink}
                  className="rounded-lg px-2.5 py-1.5 text-sm text-[#4b463f] hover:bg-[#faf7f2]"
                  data-testid="current-focus-help-think"
                >
                  Help me think
                </button>
              ) : null}
              <button
                type="button"
                disabled={locked}
                onClick={onIdeas}
                className="rounded-lg px-2.5 py-1.5 text-sm text-[#4b463f] hover:bg-[#faf7f2]"
                data-testid="current-focus-ideas"
              >
                Give me ideas
              </button>
              {onShowExamples ? (
                <button
                  type="button"
                  disabled={locked}
                  onClick={onShowExamples}
                  className="rounded-lg px-2.5 py-1.5 text-sm text-[#4b463f] hover:bg-[#faf7f2]"
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
                  className="rounded-lg px-2.5 py-1.5 text-sm text-[#4b463f] hover:bg-[#faf7f2]"
                  data-testid="current-focus-review"
                >
                  Review this
                </button>
              ) : null}
              <button
                type="button"
                disabled={locked}
                onClick={onUnsure}
                className="rounded-lg px-2.5 py-1.5 text-sm text-[#4b463f] hover:bg-[#faf7f2]"
                data-testid="current-focus-unsure"
              >
                I&apos;m not sure
              </button>
              {onSkip ? (
                <button
                  type="button"
                  disabled={locked}
                  onClick={onSkip}
                  className="rounded-lg px-2.5 py-1.5 text-sm text-[#6b635a] hover:underline"
                  data-testid="current-focus-skip"
                >
                  Skip for now
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
