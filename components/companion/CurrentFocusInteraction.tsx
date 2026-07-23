"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CreationSaveStateBadge } from "@/components/companion/CreationSaveStateBadge";
import type { CanonicalCurrentFocus } from "@/lib/currentFocus";
import {
  expandSectionIdea,
  generateSectionIdeas,
  markSectionIdeaAppended,
  type SectionIdeaSuggestion,
  type SectionIdeasSessionState,
} from "@/lib/currentFocus/sectionIdeas";
import {
  resolveSectionEditorSeed,
  sectionEditorContentKey,
} from "@/lib/currentFocus/sectionEditorContent";
import {
  clearFocusRecoveryBuffer,
  readFocusRecoveryBuffer,
  resolveCreationSaveState,
  writeFocusRecoveryBuffer,
  type CreationSaveState,
} from "@/lib/creationDurable";

type IdeasPanelState =
  | {
      status: "loading";
      intro: string;
      suggestions: SectionIdeaSuggestion[];
      session: SectionIdeasSessionState | null;
    }
  | {
      status: "ready";
      intro: string;
      suggestions: SectionIdeaSuggestion[];
      session: SectionIdeasSessionState;
      notice?: string;
      exhausted?: boolean;
    }
  | {
      status: "expanded";
      intro: string;
      suggestions: SectionIdeaSuggestion[];
      session: SectionIdeasSessionState;
      original: SectionIdeaSuggestion;
      expanded: SectionIdeaSuggestion;
      notice?: string;
    }
  | {
      status: "error";
      intro: string;
      suggestions: SectionIdeaSuggestion[];
      session: SectionIdeasSessionState | null;
      errorMessage: string;
    };

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
  /** Optional parent side-effect; ideas UI is owned here. */
  onIdeas?: () => void;
  onUnsure: () => void;
  /** 082 — Help Me Think (section-scoped). */
  onHelpThink?: () => void;
  onShowExamples?: () => void;
  onReviewThis?: () => void;
  onSkip?: () => void;
  onRetry?: () => void;
  /** Optional external save state override (tests / parent). */
  saveStateOverride?: CreationSaveState | null;
  /** UWE work type id — selects the package section-ideas catalog. */
  workTypeId?: string | null;
};
/**
 * 066 / 098 — Sole Creation response control inside Current Focus.
 * Editor is bound per workId + sectionId — never a shared draft buffer.
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
  workTypeId = null,
}: Props) {
  const contentKey = sectionEditorContentKey(focus);
  const [draft, setDraft] = useState(() => resolveSectionEditorSeed(focus));
  const [localLocked, setLocalLocked] = useState(false);
  const [recoveredOnce, setRecoveredOnce] = useState(() =>
    Boolean(
      typeof window !== "undefined" &&
        readFocusRecoveryBuffer(focus.creationId, focus.focusId),
    ),
  );
  const [assistOpen, setAssistOpen] = useState(false);
  const [ideasPanel, setIdeasPanel] = useState<IdeasPanelState | null>(null);
  const [selectedIdeaIndex, setSelectedIdeaIndex] = useState(0);
  const contentKeyRef = useRef(contentKey);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const ideasPanelRef = useRef<HTMLDivElement | null>(null);
  const autosaveTimer = useRef<number | null>(null);
  /** Ignore autosave until after a section bind reset commits. */
  const bindGenerationRef = useRef(0);
  const ideasInFlightRef = useRef(false);

  // Rebind only when workId+sectionId changes — never carry prior section draft.
  useLayoutEffect(() => {
    contentKeyRef.current = contentKey;
    bindGenerationRef.current += 1;

    const seed = resolveSectionEditorSeed(focus);
    setDraft(seed);
    setRecoveredOnce(
      Boolean(readFocusRecoveryBuffer(focus.creationId, focus.focusId)),
    );
    setAssistOpen(false);
    setIdeasPanel(null);
    setSelectedIdeaIndex(0);
    ideasInFlightRef.current = false;
    setLocalLocked(false);

    if (autosaveTimer.current) {
      window.clearTimeout(autosaveTimer.current);
      autosaveTimer.current = null;
    }
    // focus fields are read when contentKey changes (section switch / remount).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: identity key only
  }, [contentKey]);

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
    const generation = bindGenerationRef.current;
    const boundFocusId = focus.focusId;
    const boundCreationId = focus.creationId;
    const boundKey = contentKey;

    if (autosaveTimer.current) {
      window.clearTimeout(autosaveTimer.current);
    }
    autosaveTimer.current = window.setTimeout(() => {
      // Drop stale writes if the member already switched sections.
      if (
        bindGenerationRef.current !== generation ||
        contentKeyRef.current !== boundKey
      ) {
        return;
      }
      writeFocusRecoveryBuffer({
        creationId: boundCreationId,
        focusId: boundFocusId,
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
    contentKey,
    focus.creationId,
    focus.focusId,
    localLocked,
    submitting,
  ]);

  useEffect(() => {
    if (!localLocked && !submitting && !draft) {
      textareaRef.current?.focus();
    }
  }, [contentKey, localLocked, submitting, draft]);

  const locked = Boolean(submitting) || localLocked;
  // 127 req 23 — Unsaved only when draft differs from last saved section content.
  const savedBaseline =
    typeof focus.savedContent === "string" ? focus.savedContent : "";
  const draftDiffersFromSaved = draft.trim() !== savedBaseline.trim();
  const saveState =
    saveStateOverride ??
    resolveCreationSaveState({
      submitting: Boolean(submitting) || localLocked,
      failureMessage,
      lastDurableOk,
      dirty: draftDiffersFromSaved,
      hasLocalRecovery: recoveredOnce && draftDiffersFromSaved,
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

  function scrollIdeasPanelIntoView() {
    window.requestAnimationFrame(() => {
      const panel = ideasPanelRef.current;
      if (panel && typeof panel.scrollIntoView === "function") {
        panel.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
      panel?.focus?.();
    });
  }

  function runIdeasRequest(
    mode: "initial" | "more" | "refresh" = "initial",
  ) {
    if (locked || ideasInFlightRef.current) return;
    ideasInFlightRef.current = true;
    setAssistOpen(true);
    const priorReady =
      ideasPanel &&
      (ideasPanel.status === "ready" || ideasPanel.status === "expanded")
        ? ideasPanel
        : null;
    const priorSession = priorReady?.session ?? null;
    const priorSuggestions = priorReady?.suggestions ?? [];
    setIdeasPanel({
      status: "loading",
      intro:
        mode === "more"
          ? "Gathering a few more ideas…"
          : mode === "refresh"
            ? "Refreshing ideas…"
            : "Gathering a few ideas for this section…",
      suggestions: priorSuggestions,
      session: priorSession,
    });
    onIdeas?.();

    window.setTimeout(() => {
      const result = generateSectionIdeas(
        { ...focus, workTypeId },
        {
          existingAnswer: draft,
          mode,
          session: priorSession,
        },
      );
      if (!result.ok) {
        setIdeasPanel({
          status: "error",
          intro: "",
          suggestions: [],
          session: priorSession,
          errorMessage:
            result.errorMessage ||
            "I couldn’t gather ideas just now. Your writing is still here.",
        });
      } else if (
        result.exhausted &&
        result.suggestions.length === 0 &&
        priorSuggestions.length > 0
      ) {
        setIdeasPanel({
          status: "ready",
          intro: result.intro,
          suggestions: priorSuggestions,
          session: {
            ...(priorSession ?? result.session),
            shownIds: result.session.shownIds,
            visibleIds: priorSuggestions.map((s) => s.id),
            appendedIds:
              priorSession?.appendedIds ?? result.session.appendedIds ?? [],
          },
          notice:
            result.notice ||
            "You’ve seen the available ideas for this section. You can expand one of them, add one, or return later.",
          exhausted: true,
        });
      } else {
        setIdeasPanel({
          status: "ready",
          intro: result.intro,
          suggestions: result.suggestions,
          session: result.session,
          notice: result.notice,
          exhausted: result.exhausted,
        });
        if (mode !== "more") {
          setSelectedIdeaIndex(0);
        }
      }
      ideasInFlightRef.current = false;
      scrollIdeasPanelIntoView();
    }, 0);
  }

  function selectedSuggestion(): SectionIdeaSuggestion | null {
    if (!ideasPanel || ideasPanel.status !== "ready") return null;
    return ideasPanel.suggestions[selectedIdeaIndex] ?? null;
  }

  function applyIdeaText(
    text: string,
    mode: "append",
    ideaId?: string | null,
  ) {
    const next = draft.trim() ? `${draft.trim()}\n\n${text}` : text;
    setDraft(next);
    writeFocusRecoveryBuffer({
      creationId: focus.creationId,
      focusId: focus.focusId,
      text: next,
    });
    setRecoveredOnce(true);
    if (ideaId && ideasPanel && ideasPanel.session) {
      const nextSession = markSectionIdeaAppended(ideasPanel.session, ideaId);
      setIdeasPanel({ ...ideasPanel, session: nextSession });
    }
  }

  function addSelectedIdeaToAnswer() {
    const idea = selectedSuggestion();
    if (!idea) return;
    applyIdeaText(idea.text, "append", idea.id);
  }

  function expandSelectedIdea() {
    const idea = selectedSuggestion();
    if (!idea || !ideasPanel || ideasPanel.status !== "ready") return;
    const result = expandSectionIdea({ ...focus, workTypeId }, idea);
    if (!result.ok) return;
    setIdeasPanel({
      status: "expanded",
      intro: "Here’s a more developed version — nothing is added until you choose.",
      suggestions: ideasPanel.suggestions,
      session: {
        ...ideasPanel.session,
        selectedIdeaId: idea.id,
      },
      original: result.original,
      expanded: result.expanded,
    });
    scrollIdeasPanelIntoView();
  }

  function closeIdeasPanel() {
    setIdeasPanel(null);
    // Return focus to the writing surface after assistance closes.
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus?.();
    });
  }

  return (
    <div
      className="mt-3 flex flex-col gap-3"
      data-testid="current-focus-interaction"
      data-focus-id={focus.focusId}
      data-creation-id={focus.creationId}
      data-section-id={focus.sectionId ?? undefined}
      data-content-key={contentKey}
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
        key={contentKey}
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={6}
        disabled={locked}
        placeholder="Write here…"
        className="w-full resize-y rounded-xl border border-[#cfc6b8] bg-white px-3 py-3 text-base leading-relaxed text-[#1f1c19] placeholder:text-[#9a8f82] focus:border-[#8a7a68] focus:outline-none focus:ring-2 focus:ring-[#c4b8a8]/50"
        data-testid="current-focus-response"
        data-section-id={focus.sectionId ?? undefined}
        data-content-key={contentKey}
        data-initial-empty={draft === "" ? "true" : "false"}
        aria-label={`Writing ${focus.title}`}
      />

      {guidance && !ideasPanel ? (
        <p
          className="rounded-xl bg-[#f0f5f5] px-3 py-2 text-sm leading-relaxed text-[#1e4f4f]"
          data-testid="current-focus-guidance"
        >
          {guidance}
        </p>
      ) : null}

      {ideasPanel ? (
        <div
          ref={ideasPanelRef}
          tabIndex={-1}
          role="region"
          aria-live="polite"
          aria-busy={ideasPanel.status === "loading" ? true : undefined}
          aria-label="Ideas for this section"
          className="rounded-xl border border-[#c5d4d4] bg-[#f0f5f5] px-3 py-3 text-sm leading-relaxed text-[#1e4f4f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/40"
          data-testid="current-focus-ideas-panel"
          data-ideas-status={ideasPanel.status}
        >
          {ideasPanel.status === "loading" ? (
            <p data-testid="current-focus-ideas-loading" role="status">
              {ideasPanel.intro}
            </p>
          ) : null}
          {ideasPanel.status === "error" ? (
            <div data-testid="current-focus-ideas-error">
              <p role="alert">{ideasPanel.errorMessage}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                  onClick={() => runIdeasRequest("refresh")}
                  data-testid="current-focus-ideas-retry"
                >
                  Refresh Ideas
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#1e4f4f]/35 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                  onClick={closeIdeasPanel}
                  data-testid="current-focus-ideas-close"
                >
                  Close
                </button>
              </div>
            </div>
          ) : null}
          {ideasPanel.status === "expanded" ? (
            <div
              data-testid="current-focus-ideas-expanded"
              aria-label="Expanded idea view"
            >
              <p data-testid="current-focus-ideas-intro" role="status">
                {ideasPanel.intro}
              </p>
              <div className="mt-2 rounded-lg border border-[#1e4f4f]/25 bg-white/80 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#1e4f4f]/80">
                  Original idea
                </p>
                <p data-testid="current-focus-idea-original">
                  {ideasPanel.original.text}
                </p>
              </div>
              <div className="mt-2 rounded-lg border border-[#1e4f4f] bg-white px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#1e4f4f]/80">
                  Expanded idea
                </p>
                <pre
                  className="whitespace-pre-wrap font-sans text-[#1f1c19]"
                  data-testid="current-focus-idea-expanded"
                  tabIndex={0}
                >
                  {ideasPanel.expanded.text}
                </pre>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                  onClick={() =>
                    applyIdeaText(
                      ideasPanel.expanded.text,
                      "append",
                      ideasPanel.original.id,
                    )
                  }
                  data-testid="current-focus-ideas-add-expanded"
                >
                  Add Expanded Idea
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#1e4f4f]/35 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                  onClick={() =>
                    applyIdeaText(
                      ideasPanel.original.text,
                      "append",
                      ideasPanel.original.id,
                    )
                  }
                  data-testid="current-focus-ideas-add-original"
                >
                  Add Original Idea
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#1e4f4f]/35 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                  onClick={() =>
                    setIdeasPanel({
                      status: "ready",
                      intro:
                        "Here are your ideas again — nothing is applied until you choose.",
                      suggestions: ideasPanel.suggestions,
                      session: ideasPanel.session,
                    })
                  }
                  data-testid="current-focus-ideas-back"
                >
                  Back to Ideas
                </button>
                <button
                  type="button"
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#6b635a] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                  onClick={closeIdeasPanel}
                  data-testid="current-focus-ideas-close"
                >
                  Close
                </button>
              </div>
            </div>
          ) : null}
          {ideasPanel.status === "ready" ? (
            <div>
              <p data-testid="current-focus-ideas-intro">{ideasPanel.intro}</p>
              {ideasPanel.notice ? (
                <p
                  className="mt-2 rounded-lg bg-white/70 px-3 py-2"
                  data-testid="current-focus-ideas-notice"
                  role="status"
                >
                  {ideasPanel.notice}
                </p>
              ) : null}
              <ul
                className="mt-2 flex flex-col gap-2"
                role="listbox"
                aria-label="Suggested ideas"
                aria-activedescendant={
                  ideasPanel.suggestions[selectedIdeaIndex]
                    ? `current-focus-idea-${ideasPanel.suggestions[selectedIdeaIndex].id}`
                    : undefined
                }
              >
                {ideasPanel.suggestions.map((idea, index) => {
                  const selected = index === selectedIdeaIndex;
                  return (
                    <li key={idea.id}>
                      <button
                        type="button"
                        id={`current-focus-idea-${idea.id}`}
                        role="option"
                        aria-selected={selected}
                        onClick={() => setSelectedIdeaIndex(index)}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setSelectedIdeaIndex((i) =>
                              Math.min(
                                i + 1,
                                ideasPanel.suggestions.length - 1,
                              ),
                            );
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setSelectedIdeaIndex((i) => Math.max(i - 1, 0));
                          } else if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedIdeaIndex(index);
                          }
                        }}
                        className={
                          selected
                            ? "w-full rounded-lg border border-[#1e4f4f] bg-white px-3 py-2 text-left text-[#1f1c19] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                            : "w-full rounded-lg border border-transparent bg-white/70 px-3 py-2 text-left text-[#1f1c19] hover:border-[#1e4f4f]/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                        }
                        data-testid={`current-focus-idea-option-${index}`}
                        data-idea-id={idea.id}
                      >
                        <span className="mr-2 font-semibold text-[#1e4f4f]">
                          {index + 1}.
                        </span>
                        {idea.text}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                  onClick={addSelectedIdeaToAnswer}
                  data-testid="current-focus-ideas-add"
                >
                  Add to My Answer
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#1e4f4f]/35 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                  onClick={expandSelectedIdea}
                  data-testid="current-focus-ideas-expand"
                >
                  Expand This Idea
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#1e4f4f]/35 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f] disabled:opacity-40"
                  onClick={() => runIdeasRequest("more")}
                  data-testid="current-focus-ideas-more"
                  disabled={Boolean(ideasPanel.exhausted)}
                  aria-label="More Ideas"
                >
                  More Ideas
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#1e4f4f]/35 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                  onClick={() => runIdeasRequest("refresh")}
                  data-testid="current-focus-ideas-retry"
                  aria-label="Refresh Ideas"
                >
                  Refresh Ideas
                </button>
                <button
                  type="button"
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#6b635a] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                  onClick={closeIdeasPanel}
                  data-testid="current-focus-ideas-close"
                >
                  Close
                </button>
              </div>
            </div>
          ) : null}
        </div>
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
                disabled={locked || ideasPanel?.status === "loading"}
                aria-busy={ideasPanel?.status === "loading"}
                onClick={runIdeasRequest}
                className="rounded-lg px-2.5 py-1.5 text-sm text-[#4b463f] hover:bg-[#faf7f2] disabled:opacity-40"
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
