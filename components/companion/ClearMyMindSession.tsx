"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addBrainDumps,
  getBrainDumps,
  type BrainDumpEntry,
} from "@/lib/companionStore";
import {
  newCaptureSessionId,
  splitCaptureInput,
} from "@/lib/clearMyMindCapture";
import {
  CLEAR_MY_MIND_CAPTURE_BUTTON,
  CLEAR_MY_MIND_CAPTURE_BUTTON_CONFIRM,
  CLEAR_MY_MIND_REVIEW_THOUGHTS_LABEL,
  CLEAR_MY_MIND_SHARE_ACK_DELAY_MS,
  CLEAR_MY_MIND_SPLIT_KEEP,
} from "@/lib/clearMyMindCopy";
import {
  noteClearMyMindCapture,
  setClearMyMindModePhase,
} from "@/lib/clearMyMind/clearMyMindMode";
import {
  clearClearMyMindDraft,
  draftStatusLabel,
  loadClearMyMindDraft,
  saveClearMyMindDraft,
  type DraftSaveStatus,
} from "@/lib/clearMyMind/captureDraft";
import { recordClearMyMindSubmission } from "@/lib/clearMyMindIntelligence";
import { recordReliefSignal } from "@/lib/reliefIntelligence";
import {
  initialClearMyMindStage,
  stageOnCaptureBegin,
  stageOnReleaseComplete,
  type ClearMyMindStage,
} from "@/lib/clearMyMindStages";
import { isVisibleInMentalLandscape } from "@/lib/thoughtLifecycle";
import { pauseClearMyMindSession } from "@/lib/clearMyMindSessionStore";
import { ClearMyMindCaptureCard } from "@/components/companion/ClearMyMindCaptureCard";
import {
  ClearMyMindCaptureChoice,
  type ClearMyMindChoiceAction,
} from "@/components/companion/ClearMyMindCaptureChoice";
import { ThoughtSeparateOffer } from "@/components/companion/ThoughtSeparateOffer";
import {
  detectThoughtSplitProposal,
  type ThoughtSplitProposal,
} from "@/lib/clearMyMindThoughtSplitter";

type CaptureSurface = "writing" | "choice";

export type ClearMyMindSessionAction =
  | "organize"
  | "visualize"
  | "filter"
  | "prioritize"
  | "convert"
  | "save"
  | "continue-later"
  | "exit"
  | "my-thoughts";

type Props = {
  sessionId?: string;
  initialSurface?: CaptureSurface;
  onSessionEntriesChange?: (entries: BrainDumpEntry[]) => void;
  onPresenceStateChange?: (state: {
    shareConfirming: boolean;
    holdAck: string | null;
    stage: ClearMyMindStage;
    lastShareItemCount: number;
    surface: CaptureSurface;
  }) => void;
  onAction?: (action: ClearMyMindSessionAction) => void;
};

/**
 * Clear My Mind capture + post-Continue choices.
 * Continue → stay in workspace. Never auto-organize.
 */
export function ClearMyMindSession({
  sessionId: sessionIdProp,
  initialSurface = "writing",
  onSessionEntriesChange,
  onPresenceStateChange,
  onAction,
}: Props) {
  const [sessionId] = useState(() => sessionIdProp ?? newCaptureSessionId());
  const [stage, setStage] = useState<ClearMyMindStage>(initialClearMyMindStage);
  const [surface, setSurface] = useState<CaptureSurface>(initialSurface);
  const [input, setInput] = useState(() => {
    const draft = loadClearMyMindDraft();
    return draft?.text ?? "";
  });
  const [entries, setEntries] = useState<BrainDumpEntry[]>([]);
  const [pendingSplit, setPendingSplit] = useState<ThoughtSplitProposal | null>(
    null,
  );
  const [usedVoice, setUsedVoice] = useState(false);
  const [usedTyping, setUsedTyping] = useState(false);
  const [holdAck, setHoldAck] = useState<string | null>(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [lastShareItemCount, setLastShareItemCount] = useState(0);
  const [shareConfirming, setShareConfirming] = useState(false);
  const [rawThoughts, setRawThoughts] = useState<string[]>([]);
  const [saveAck, setSaveAck] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<DraftSaveStatus>("idle");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const draftVersionRef = useRef(loadClearMyMindDraft()?.version ?? 0);
  const draftTimerRef = useRef<number | null>(null);

  const refresh = useCallback(() => {
    setEntries(
      getBrainDumps().filter(
        (e) => e.captureSessionId === sessionId && isVisibleInMentalLandscape(e),
      ),
    );
  }, [sessionId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sessionItems = useMemo(
    () =>
      [...entries].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [entries],
  );

  useEffect(() => {
    onPresenceStateChange?.({
      shareConfirming,
      holdAck,
      stage,
      lastShareItemCount,
      surface,
    });
  }, [
    shareConfirming,
    holdAck,
    stage,
    lastShareItemCount,
    surface,
    onPresenceStateChange,
  ]);

  useEffect(() => {
    onSessionEntriesChange?.(sessionItems);
  }, [sessionItems, onSessionEntriesChange]);

  useEffect(() => {
    pauseClearMyMindSession({
      sessionId,
      phase: surface === "choice" ? "choice" : "capture",
      rawCaptureTexts:
        rawThoughts.length > 0
          ? rawThoughts
          : sessionItems.map((e) => e.text),
    });
  }, [sessionId, surface, rawThoughts, sessionItems]);

  useEffect(() => {
    return () => {
      if (submissionCount > 0) {
        recordReliefSignal({
          kind: "session-ended",
          sessionId,
          shareCount: submissionCount,
        });
      }
    };
  }, [sessionId, submissionCount]);

  useEffect(() => {
    setPendingSplit((prev) => {
      if (!prev) return null;
      return input.trim() === prev.raw ? prev : null;
    });
  }, [input]);

  /** Continuous autosave — never wait for Continue. */
  useEffect(() => {
    if (surface !== "writing") return;
    if (draftTimerRef.current) {
      window.clearTimeout(draftTimerRef.current);
    }
    if (input.trim()) setDraftStatus("saving");
    draftTimerRef.current = window.setTimeout(() => {
      draftVersionRef.current += 1;
      const result = saveClearMyMindDraft({
        text: input,
        version: draftVersionRef.current,
        sessionId,
      });
      if (result.ok) {
        setDraftStatus(input.trim() ? "saved" : "idle");
      } else if (!result.blockedByNewer) {
        setDraftStatus("error");
      }
    }, 400);
    return () => {
      if (draftTimerRef.current) {
        window.clearTimeout(draftTimerRef.current);
      }
    };
  }, [input, sessionId, surface]);

  function focusCaptureInput() {
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  function saveThoughtParts(parts: string[], rawDump: string) {
    if (!parts.length) return;

    setShareConfirming(true);
    setHoldAck(null);
    setSaveAck(null);
    setLastShareItemCount(parts.length);

    const all = addBrainDumps(parts, { captureSessionId: sessionId });
    const createdItems = all.slice(0, parts.length);
    const sessionSaved = all.filter(
      (e) => e.captureSessionId === sessionId && isVisibleInMentalLandscape(e),
    );

    setEntries(sessionSaved);
    setRawThoughts(sessionSaved.map((e) => e.originalText ?? e.text));
    setInput("");
    clearClearMyMindDraft();
    draftVersionRef.current += 1;
    setDraftStatus("idle");
    setPendingSplit(null);
    setStage(stageOnReleaseComplete(stageOnCaptureBegin(stage)));

    const nextSubmission = submissionCount + 1;
    noteClearMyMindCapture(parts.length);
    if (nextSubmission > 1) {
      recordReliefSignal({ kind: "continued-capture", sessionId });
    }

    recordReliefSignal({
      kind: "share",
      mode: usedVoice && usedTyping ? "mixed" : usedVoice ? "voice" : "typing",
      wordCount: rawDump.split(/\s+/).filter(Boolean).length,
      itemCount: parts.length,
      sessionId,
    });

    window.setTimeout(() => {
      setHoldAck(null);
      setStage("understanding");
      setShareConfirming(false);
      setSurface("choice");
      setClearMyMindModePhase("capture");
    }, CLEAR_MY_MIND_SHARE_ACK_DELAY_MS);

    setSubmissionCount((n) => n + 1);

    recordClearMyMindSubmission({
      sessionId,
      rawDumpText: rawDump,
      extractedItems: parts,
      entries: createdItems,
      usedVoice,
      usedTyping,
    });

    pauseClearMyMindSession({
      sessionId,
      phase: "choice",
      rawCaptureTexts: sessionSaved.map((e) => e.originalText ?? e.text),
    });

    // Capture first — no automatic categorization until the member asks.

    void import("@/lib/ecosystem/eventTrackingEngine").then(
      ({ trackEcosystemEvent }) => {
        trackEcosystemEvent({
          eventType: "feature.brain_dump_used",
          feature: "brain-dump",
          metadata: {
            entryKind: "capture",
            count: sessionSaved.length,
            sessionId,
          },
        });
      },
    );
  }

  function handleContinue() {
    // Snapshot before any state clear — never parse after input is wiped.
    const rawSnapshot = input;
    const raw = rawSnapshot.trim();
    const parts = splitCaptureInput(raw);
    if (!parts.length) return;

    if (parts.length === 1) {
      const proposal = detectThoughtSplitProposal(parts[0]!);
      if (proposal) {
        setPendingSplit(proposal);
        return;
      }
    }

    saveThoughtParts(parts, raw);
  }

  function handleReviewThoughts() {
    if (shareConfirming || pendingSplit) return;
    const raw = input.trim();
    if (raw) {
      const parts = splitCaptureInput(raw);
      if (parts.length === 1) {
        const proposal = detectThoughtSplitProposal(parts[0]!);
        if (proposal) {
          setPendingSplit(proposal);
          return;
        }
      }
      if (parts.length) {
        saveThoughtParts(parts, raw);
        return;
      }
    }
    if (sessionItems.length === 0 && rawThoughts.length === 0) return;
    setSurface("choice");
    setClearMyMindModePhase("capture");
    pauseClearMyMindSession({
      sessionId,
      phase: "choice",
      rawCaptureTexts:
        rawThoughts.length > 0
          ? rawThoughts
          : sessionItems.map((e) => e.text),
    });
  }

  function confirmSplit() {
    if (!pendingSplit) return;
    saveThoughtParts(pendingSplit.segments, pendingSplit.raw);
  }

  function leaveAsIs() {
    if (!pendingSplit) return;
    saveThoughtParts([pendingSplit.raw], pendingSplit.raw);
  }

  function beginRelease() {
    setStage(stageOnCaptureBegin(stage));
  }

  function handleChoice(action: ClearMyMindChoiceAction) {
    if (action === "add-more") {
      setSurface("writing");
      setSaveAck(null);
      setClearMyMindModePhase("capture");
      focusCaptureInput();
      return;
    }
    if (action === "save") {
      onAction?.("save");
      return;
    }

    const phaseMap: Partial<
      Record<ClearMyMindChoiceAction, Parameters<typeof setClearMyMindModePhase>[0]>
    > = {
      organize: "organize",
      visualize: "visual",
      filter: "action",
      prioritize: "action",
      convert: "action",
      create: "action",
      "continue-later": "follow-up",
      exit: "session-end",
    };
    if (action === "my-thoughts") {
      onAction?.("my-thoughts");
      return;
    }
    if (action === "return-welcome") {
      onAction?.("exit");
      return;
    }
    const phase = phaseMap[action];
    if (phase) setClearMyMindModePhase(phase);
    onAction?.(action === "create" ? "convert" : action);
  }

  const continueDisabled =
    shareConfirming || !input.trim() || pendingSplit !== null;
  const hasReviewableThoughts =
    sessionItems.length > 0 || rawThoughts.length > 0;
  const reviewDisabled =
    shareConfirming ||
    pendingSplit !== null ||
    (!input.trim() && !hasReviewableThoughts);

  if (surface === "choice") {
    return (
      <ClearMyMindCaptureChoice
        thoughtCount={sessionItems.length || rawThoughts.length}
        rawThoughts={
          rawThoughts.length > 0
            ? rawThoughts
            : sessionItems.map((e) => e.originalText ?? e.text)
        }
        entries={sessionItems}
        saveAck={saveAck}
        onAction={handleChoice}
        onEntriesChanged={refresh}
      />
    );
  }

  const draftLabel = draftStatusLabel(draftStatus);

  return (
    <div
      className="clear-my-mind-session clear-my-mind-session--capture-workspace flex flex-col gap-4"
      data-cmind-mode="capture"
    >
      <ClearMyMindCaptureCard
        value={input}
        onChange={(value) => {
          setInput(value);
          if (value.trim()) {
            setUsedTyping(true);
            beginRelease();
          }
        }}
        onFocus={beginRelease}
        onVoiceUsed={() => setUsedVoice(true)}
        inputRef={inputRef}
        shareConfirming={shareConfirming}
        expansive
        draftStatusLabel={draftLabel}
      />

      <div className="clear-my-mind-save-row">
        <button
          type="button"
          disabled={continueDisabled}
          onClick={handleContinue}
          aria-live="polite"
          data-testid="share-capture-button"
          data-share-confirming={shareConfirming ? "true" : "false"}
          className={`clear-my-mind-release-btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c4a882]/35 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${
            shareConfirming ? "is-confirming" : ""
          }`}
        >
          {shareConfirming
            ? CLEAR_MY_MIND_CAPTURE_BUTTON_CONFIRM
            : CLEAR_MY_MIND_CAPTURE_BUTTON}
        </button>
        <button
          type="button"
          disabled={reviewDisabled}
          onClick={handleReviewThoughts}
          data-testid="review-thoughts-button"
          className="clear-my-mind-review-btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c4a882]/35 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
        >
          {CLEAR_MY_MIND_REVIEW_THOUGHTS_LABEL}
        </button>
      </div>

      {pendingSplit ? (
        <ThoughtSeparateOffer
          segments={pendingSplit.segments}
          onConfirm={confirmSplit}
          onDecline={leaveAsIs}
          declineLabel={CLEAR_MY_MIND_SPLIT_KEEP}
          testId="thought-split-offer"
        />
      ) : null}
    </div>
  );
}
