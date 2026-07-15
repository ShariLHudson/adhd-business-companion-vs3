"use client";

import { useMemo, useState } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import {
  addBrainDump,
  deleteBrainDump,
  updateBrainDump,
} from "@/lib/companionStore";
import {
  CLEAR_MY_MIND_CAPTURED_SAFE_BODY,
  CLEAR_MY_MIND_CAPTURED_SAFE_LOOK,
  CLEAR_MY_MIND_CAPTURED_SAFE_TITLE,
  CLEAR_MY_MIND_EXIT_LABEL,
  CLEAR_MY_MIND_JOURNAL_LIST_LABEL,
  CLEAR_MY_MIND_MAKE_SENSE_DEFAULT,
  CLEAR_MY_MIND_SAVE_FOR_LATER_CONFIRM,
} from "@/lib/clearMyMindCopy";
import { displayClearMyMindText } from "@/lib/clearMyMind/originalText";
import {
  buildAdaptiveNextSteps,
  type AdaptiveNextStepId,
} from "@/lib/clearMyMind/adaptiveNextSteps";
import {
  recommendAttentionItem,
  type AttentionRecommendation,
} from "@/lib/clearMyMind/attentionRecommend";
import type { ClearMyMindWorkflowId } from "@/lib/clearMyMindWorkspaceIntelligence";

export type ClearMyMindChoiceAction =
  | ClearMyMindWorkflowId
  | "convert"
  | "add-more"
  | "continue-later"
  | "exit"
  | "my-thoughts"
  | "return-welcome";

type Props = {
  thoughtCount: number;
  rawThoughts: string[];
  entries?: BrainDumpEntry[];
  saveAck?: string | null;
  analyzing?: boolean;
  onAction: (action: ClearMyMindChoiceAction) => void;
  onEntriesChanged?: () => void;
};

type UndoSnapshot = {
  kind: "merge" | "split" | "edit";
  primaryId: string;
  primaryText: string;
  removedId?: string;
  removedText?: string;
  removedCreatedAt?: string;
};

type PanelMode =
  | "list"
  | "attention"
  | "make-sense"
  | "saved";

/**
 * Post-capture: flat list first, exact words, adaptive next steps.
 * No automatic theme, category, or project.
 */
export function ClearMyMindCaptureChoice({
  thoughtCount,
  rawThoughts,
  entries = [],
  saveAck,
  onAction,
  onEntriesChanged,
}: Props) {
  const [mode, setMode] = useState<PanelMode>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [undo, setUndo] = useState<UndoSnapshot | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [attention, setAttention] = useState<AttentionRecommendation | null>(
    null,
  );
  const [attentionExcluded, setAttentionExcluded] = useState<Set<string>>(
    () => new Set(),
  );

  const ordered = useMemo(
    () =>
      [...entries].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [entries],
  );

  const adaptive = useMemo(
    () => buildAdaptiveNextSteps(ordered),
    [ordered],
  );

  const journalFallback =
    ordered.length > 0
      ? ordered.map((e) => displayClearMyMindText(e))
      : rawThoughts;

  function refresh() {
    onEntriesChanged?.();
  }

  function startEdit(entry: BrainDumpEntry) {
    setEditingId(entry.id);
    setEditText(displayClearMyMindText(entry));
  }

  function saveEdit(id: string) {
    const trimmed = editText.trim();
    if (!trimmed) return;
    const prev = ordered.find((e) => e.id === id);
    if (prev) {
      setUndo({
        kind: "edit",
        primaryId: id,
        primaryText: displayClearMyMindText(prev),
      });
    }
    updateBrainDump(id, { text: trimmed, originalText: trimmed });
    setEditingId(null);
    refresh();
  }

  function mergeWithPrevious(index: number) {
    if (index <= 0) return;
    const current = ordered[index]!;
    const previous = ordered[index - 1]!;
    const combined = `${displayClearMyMindText(previous)}\n${displayClearMyMindText(current)}`.trim();
    setUndo({
      kind: "merge",
      primaryId: previous.id,
      primaryText: displayClearMyMindText(previous),
      removedId: current.id,
      removedText: displayClearMyMindText(current),
      removedCreatedAt: current.createdAt,
    });
    updateBrainDump(previous.id, { text: combined, originalText: combined });
    deleteBrainDump(current.id);
    refresh();
  }

  function mergeWithNext(index: number) {
    if (index >= ordered.length - 1) return;
    mergeWithPrevious(index + 1);
  }

  function splitThought(entry: BrainDumpEntry) {
    const text = displayClearMyMindText(entry);
    const parts = text
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length < 2) {
      const comma = text
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      if (comma.length < 2) return;
      applySplit(entry, comma);
      return;
    }
    applySplit(entry, parts);
  }

  function applySplit(entry: BrainDumpEntry, parts: string[]) {
    setUndo({
      kind: "split",
      primaryId: entry.id,
      primaryText: displayClearMyMindText(entry),
    });
    updateBrainDump(entry.id, {
      text: parts[0]!,
      originalText: parts[0]!,
    });
    for (const part of parts.slice(1)) {
      addBrainDump(part, { captureSessionId: entry.captureSessionId });
    }
    refresh();
  }

  function undoLast() {
    if (!undo) return;
    if (undo.kind === "edit" || undo.kind === "split") {
      updateBrainDump(undo.primaryId, {
        text: undo.primaryText,
        originalText: undo.primaryText,
      });
    }
    if (undo.kind === "merge" && undo.removedId && undo.removedText) {
      updateBrainDump(undo.primaryId, {
        text: undo.primaryText,
        originalText: undo.primaryText,
      });
      addBrainDump(undo.removedText, {
        captureSessionId: ordered[0]?.captureSessionId,
      });
    }
    setUndo(null);
    refresh();
  }

  function handleStep(id: AdaptiveNextStepId) {
    switch (id) {
      case "keep-adding":
        onAction("add-more");
        return;
      case "save-for-later":
        setMode("saved");
        onAction("continue-later");
        return;
      case "make-next-step":
      case "help-me-choose":
      case "help-decide-attention":
      case "start-with-this": {
        const rec = recommendAttentionItem(ordered, attentionExcluded);
        setAttention(rec);
        setMode("attention");
        return;
      }
      case "show-another": {
        if (attention?.entryId) {
          const nextExcluded = new Set(attentionExcluded);
          nextExcluded.add(attention.entryId);
          setAttentionExcluded(nextExcluded);
          setAttention(recommendAttentionItem(ordered, nextExcluded));
        }
        return;
      }
      case "help-make-sense":
      case "organize-life-area":
        setMode("make-sense");
        return;
      case "choose-different-view":
      case "keep-flat-list":
      case "keep-separate":
      case "keep-loose-list":
        setMode("list");
        return;
      case "turn-into-project":
        onAction("convert");
        return;
      case "return-welcome":
        onAction("return-welcome");
        return;
      case "stay-here":
        setMode("list");
        return;
      default:
        return;
    }
  }

  if (mode === "saved") {
    return (
      <section
        className="clear-my-mind-capture-choice clear-my-mind-panel__content"
        data-testid="clear-my-mind-capture-choice"
        data-cmind-mode="saved"
      >
        <h2 className="clear-my-mind-capture-choice__next-title">
          {CLEAR_MY_MIND_SAVE_FOR_LATER_CONFIRM}
        </h2>
        <ul className="clear-my-mind-capture-choice__suggestions">
          <li>
            <button
              type="button"
              className="clear-my-mind-capture-choice__suggestion clear-my-mind-capture-choice__suggestion--lead"
              data-testid="cmm-return-welcome"
              onClick={() => onAction("return-welcome")}
            >
              Return to Welcome Home
            </button>
          </li>
          <li>
            <button
              type="button"
              className="clear-my-mind-capture-choice__suggestion"
              data-testid="cmm-stay-here"
              onClick={() => setMode("list")}
            >
              Stay Here
            </button>
          </li>
        </ul>
      </section>
    );
  }

  if (mode === "attention" && attention) {
    return (
      <section
        className="clear-my-mind-capture-choice clear-my-mind-panel__content"
        data-testid="clear-my-mind-attention"
      >
        <h2 className="clear-my-mind-capture-choice__next-title">
          Help Me Decide What Deserves Attention First
        </h2>
        <p className="clear-my-mind-capture-choice__insight">{attention.reason}</p>
        <ul className="clear-my-mind-capture-choice__suggestions">
          {attention.hasRecommendation ? (
            <>
              <li>
                <button
                  type="button"
                  className="clear-my-mind-capture-choice__suggestion clear-my-mind-capture-choice__suggestion--lead"
                  data-testid="cmm-start-with-this"
                  onClick={() => onAction("prioritize")}
                >
                  Start With This
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="clear-my-mind-capture-choice__suggestion"
                  data-testid="cmm-show-another"
                  onClick={() => handleStep("show-another")}
                >
                  Show Me Another Option
                </button>
              </li>
            </>
          ) : null}
          <li>
            <button
              type="button"
              className="clear-my-mind-capture-choice__suggestion"
              data-testid="cmm-attention-save-later"
              onClick={() => handleStep("save-for-later")}
            >
              Save Everything for Later
            </button>
          </li>
          <li>
            <button
              type="button"
              className="clear-my-mind-capture-choice__suggestion clear-my-mind-capture-choice__suggestion--quiet"
              onClick={() => setMode("list")}
            >
              Back to list
            </button>
          </li>
        </ul>
      </section>
    );
  }

  if (mode === "make-sense") {
    return (
      <section
        className="clear-my-mind-capture-choice clear-my-mind-panel__content"
        data-testid="clear-my-mind-make-sense"
      >
        <h2 className="clear-my-mind-capture-choice__next-title">
          Help Me Make Sense of These
        </h2>
        <p className="clear-my-mind-capture-choice__insight">
          {CLEAR_MY_MIND_MAKE_SENSE_DEFAULT}
        </p>
        <ul className="clear-my-mind-capture-choice__suggestions">
          <li>
            <button
              type="button"
              className="clear-my-mind-capture-choice__suggestion clear-my-mind-capture-choice__suggestion--lead"
              data-testid="cmm-organize-life-area"
              onClick={() => onAction("organize")}
            >
              Organize by Life Area
            </button>
          </li>
          <li>
            <button
              type="button"
              className="clear-my-mind-capture-choice__suggestion"
              data-testid="cmm-choose-different-view"
              onClick={() => onAction("filter")}
            >
              Choose a Different View
            </button>
          </li>
          <li>
            <button
              type="button"
              className="clear-my-mind-capture-choice__suggestion"
              data-testid="cmm-keep-flat-list"
              onClick={() => setMode("list")}
            >
              Keep the Flat List
            </button>
          </li>
        </ul>
      </section>
    );
  }

  return (
    <section
      className="clear-my-mind-capture-choice clear-my-mind-capture-choice--conversation clear-my-mind-panel__content"
      data-testid="clear-my-mind-capture-choice"
      data-cmind-mode="capture-choice"
      data-adaptive-kind={adaptive.kind}
    >
      <header className="clear-my-mind-capture-choice__safe">
        <h2
          className="clear-my-mind-capture-choice__next-title"
          data-testid="cmm-safe-title"
        >
          {CLEAR_MY_MIND_CAPTURED_SAFE_TITLE}
        </h2>
        <p className="clear-my-mind-capture-choice__insight">
          {CLEAR_MY_MIND_CAPTURED_SAFE_BODY}
        </p>
        <p className="clear-my-mind-capture-choice__thinking">
          {CLEAR_MY_MIND_CAPTURED_SAFE_LOOK}
        </p>
        <p className="clear-my-mind-capture-choice__count">
          {thoughtCount} thought{thoughtCount === 1 ? "" : "s"} captured —
          still yours, exactly as you wrote them.
        </p>
      </header>

      {saveAck ? (
        <p className="clear-my-mind-capture-choice__ack" role="status">
          {saveAck}
        </p>
      ) : null}

      {(ordered.length > 0 || journalFallback.length > 0) && (
        <div
          className="clear-my-mind-capture-choice__journal"
          data-testid="cmm-flat-list"
        >
          <div className="clear-my-mind-capture-choice__journal-toolbar">
            <p className="clear-my-mind-capture-choice__journal-label">
              {CLEAR_MY_MIND_JOURNAL_LIST_LABEL}
            </p>
            {undo ? (
              <button
                type="button"
                className="clear-my-mind-capture-choice__undo"
                data-testid="cmm-undo"
                onClick={undoLast}
              >
                Undo
              </button>
            ) : null}
          </div>
          <ol className="clear-my-mind-capture-choice__journal-list">
            {ordered.length > 0
              ? ordered.map((entry, index) => (
                  <li
                    key={entry.id}
                    className="clear-my-mind-capture-choice__journal-item"
                    data-testid={`cmm-thought-${entry.id}`}
                  >
                    {editingId === entry.id ? (
                      <div className="clear-my-mind-capture-choice__edit">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          className="clear-my-mind-capture-choice__edit-field"
                          data-testid={`cmm-edit-field-${entry.id}`}
                        />
                        <button
                          type="button"
                          onClick={() => saveEdit(entry.id)}
                          data-testid={`cmm-edit-save-${entry.id}`}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="clear-my-mind-capture-choice__journal-text">
                          {displayClearMyMindText(entry)}
                        </p>
                        <div className="clear-my-mind-capture-choice__item-actions">
                          <button
                            type="button"
                            onClick={() => startEdit(entry)}
                            data-testid={`cmm-edit-${entry.id}`}
                          >
                            Edit
                          </button>
                          {index > 0 ? (
                            <button
                              type="button"
                              onClick={() => mergeWithPrevious(index)}
                              data-testid={`cmm-merge-prev-${entry.id}`}
                            >
                              Merge With Previous
                            </button>
                          ) : null}
                          {index < ordered.length - 1 ? (
                            <button
                              type="button"
                              onClick={() => mergeWithNext(index)}
                              data-testid={`cmm-merge-next-${entry.id}`}
                            >
                              Merge With Next
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => splitThought(entry)}
                            data-testid={`cmm-split-${entry.id}`}
                          >
                            Split This Thought
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))
              : journalFallback.map((thought, index) => (
                  <li key={`${index}-${thought.slice(0, 24)}`}>{thought}</li>
                ))}
          </ol>
        </div>
      )}

      <div className="clear-my-mind-capture-choice__next">
        <h2 className="clear-my-mind-capture-choice__next-title">
          {adaptive.headline}
        </h2>
        <p className="clear-my-mind-capture-choice__insight">{adaptive.body}</p>
        <ul className="clear-my-mind-capture-choice__suggestions">
          {adaptive.primary.map((step) => (
            <li key={step.id}>
              <button
                type="button"
                className={`clear-my-mind-capture-choice__suggestion${
                  step.primary
                    ? " clear-my-mind-capture-choice__suggestion--lead"
                    : ""
                }`}
                data-testid={`cmm-step-${step.id}`}
                onClick={() => handleStep(step.id)}
              >
                <span className="clear-my-mind-capture-choice__action-label">
                  {step.label}
                </span>
                {step.explanation ? (
                  <span className="clear-my-mind-capture-choice__action-reason">
                    {step.explanation}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="clear-my-mind-capture-choice__more-toggle"
          data-testid="cmm-more-ways"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((v) => !v)}
        >
          More Ways to Work With These
        </button>
        {moreOpen ? (
          <ul className="clear-my-mind-capture-choice__suggestions clear-my-mind-capture-choice__suggestions--more">
            {adaptive.moreWays.map((step) => (
              <li key={step.id}>
                <button
                  type="button"
                  className="clear-my-mind-capture-choice__suggestion clear-my-mind-capture-choice__suggestion--quiet"
                  data-testid={`cmm-more-${step.id}`}
                  onClick={() => handleStep(step.id)}
                >
                  {step.label}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="clear-my-mind-capture-choice__suggestion clear-my-mind-capture-choice__suggestion--quiet"
                data-testid="cmm-my-thoughts"
                onClick={() => onAction("my-thoughts")}
              >
                Look Through My Thoughts
              </button>
            </li>
            <li>
              <button
                type="button"
                className="clear-my-mind-capture-choice__suggestion clear-my-mind-capture-choice__suggestion--quiet"
                data-testid="cmm-exit"
                onClick={() => onAction("exit")}
              >
                {CLEAR_MY_MIND_EXIT_LABEL}
              </button>
            </li>
          </ul>
        ) : null}
      </div>
    </section>
  );
}
