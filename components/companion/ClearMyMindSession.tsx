"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addBrainDumps,
  getBrainDumps,
  updateBrainDump,
  type BrainDumpEntry,
} from "@/lib/companionStore";
import {
  newCaptureSessionId,
  splitCaptureInput,
} from "@/lib/clearMyMindCapture";
import {
  CLEAR_MY_MIND_CAPTURE_BUTTON,
  CLEAR_MY_MIND_CAPTURE_BUTTON_CONFIRM,
  CLEAR_MY_MIND_SHARE_ACK_DELAY_MS,
  CLEAR_MY_MIND_SHARE_CONFIRM_MS,
  CLEAR_MY_MIND_SPLIT_KEEP,
} from "@/lib/clearMyMindCopy";
import { shariImmediateHoldResponse, shariReleasePrompt } from "@/lib/clearMyMindCompanionVoice";
import { recordClearMyMindSubmission } from "@/lib/clearMyMindIntelligence";
import {
  getReliefCompanionHints,
  recordReliefSignal,
} from "@/lib/reliefIntelligence";
import {
  initialClearMyMindStage,
  stageOnCaptureBegin,
  type ClearMyMindStage,
} from "@/lib/clearMyMindStages";
import { isVisibleInMentalLandscape } from "@/lib/thoughtLifecycle";
import { getThinkingSpaceThoughts } from "@/lib/thinkingSpace";
import {
  collectionLabelFromAiCategory,
  setThoughtCollectionSuggestion,
  SUGGESTED_COLLECTION_AI_CONFIDENCE,
} from "@/lib/thinkingSpace/thoughtCollectionAuthority";
import { VoiceAnswerField } from "@/components/companion/VoiceAnswerField";
import { ClearMyMindCaptureInvite } from "@/components/companion/ClearMyMindCaptureInvite";
import { ThoughtSeparateOffer } from "@/components/companion/ThoughtSeparateOffer";
import {
  detectThoughtSplitProposal,
  type ThoughtSplitProposal,
} from "@/lib/clearMyMindThoughtSplitter";

type Props = {
  sessionId?: string;
  onSessionEntriesChange?: (entries: BrainDumpEntry[]) => void;
  onPresenceStateChange?: (state: {
    shareConfirming: boolean;
    holdAck: string | null;
  }) => void;
  onOpenMyThoughts?: () => void;
  onTotalThoughtCountChange?: (count: number) => void;
};

/**
 * Clear My Mind™ — continuous capture only. Organization lives in My Thoughts™.
 */
export function ClearMyMindSession({
  sessionId: sessionIdProp,
  onSessionEntriesChange,
  onPresenceStateChange,
  onOpenMyThoughts,
  onTotalThoughtCountChange,
}: Props) {
  const [sessionId] = useState(
    () => sessionIdProp ?? newCaptureSessionId(),
  );
  const [stage, setStage] = useState<ClearMyMindStage>(initialClearMyMindStage);
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<BrainDumpEntry[]>([]);
  const [splitNotice, setSplitNotice] = useState<string | null>(null);
  const [pendingSplit, setPendingSplit] = useState<ThoughtSplitProposal | null>(
    null,
  );
  const [usedVoice, setUsedVoice] = useState(false);
  const [usedTyping, setUsedTyping] = useState(false);
  const [holdAck, setHoldAck] = useState<string | null>(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [shareConfirming, setShareConfirming] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const totalThoughtCount = useMemo(() => getThinkingSpaceThoughts().length, [
    sessionItems,
    submissionCount,
  ]);

  useEffect(() => {
    onPresenceStateChange?.({ shareConfirming, holdAck });
  }, [shareConfirming, holdAck, onPresenceStateChange]);

  useEffect(() => {
    onSessionEntriesChange?.(sessionItems);
  }, [sessionItems, onSessionEntriesChange]);

  useEffect(() => {
    onTotalThoughtCountChange?.(totalThoughtCount);
  }, [totalThoughtCount, onTotalThoughtCountChange]);

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

  async function classify(id: string, note: string) {
    try {
      const res = await fetch("/api/braindump-classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: note }),
      });
      const data = await res.json();
      if (res.ok) {
        updateBrainDump(id, {
          topic: data.topic,
          category: data.category,
          contextType: data.contextType,
          suggestion: data.suggestion,
        });
        const collectionLabel = collectionLabelFromAiCategory(
          data.category,
          data.topic,
        );
        if (collectionLabel) {
          setThoughtCollectionSuggestion(
            id,
            collectionLabel,
            SUGGESTED_COLLECTION_AI_CONFIDENCE,
          );
        }
        refresh();
      }
    } catch {
      /* unclassified is fine */
    }
  }

  function focusCaptureInput() {
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  function saveThoughtParts(parts: string[], rawDump: string) {
    if (!parts.length) return;

    setShareConfirming(true);

    const all = addBrainDumps(parts, { captureSessionId: sessionId });
    const createdItems = all.slice(0, parts.length);
    const sessionSaved = all.filter(
      (e) => e.captureSessionId === sessionId && isVisibleInMentalLandscape(e),
    );

    setSplitNotice(null);

    setEntries(sessionSaved);
    setInput("");
    setPendingSplit(null);
    setStage(stageOnCaptureBegin(stage));

    const nextSubmission = submissionCount + 1;
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

    const ack = shariImmediateHoldResponse({
      parts,
      submissionIndex: nextSubmission,
      hints: getReliefCompanionHints(),
    });
    window.setTimeout(() => {
      setHoldAck(ack);
    }, CLEAR_MY_MIND_SHARE_ACK_DELAY_MS);

    window.setTimeout(() => {
      setShareConfirming(false);
      focusCaptureInput();
    }, CLEAR_MY_MIND_SHARE_CONFIRM_MS);

    setSubmissionCount((n) => n + 1);

    recordClearMyMindSubmission({
      sessionId,
      rawDumpText: rawDump,
      extractedItems: parts,
      entries: createdItems,
      usedVoice,
      usedTyping,
    });

    createdItems.forEach((item, index) => {
      const itemId = item.id;
      const text = parts[index];
      if (itemId && text) {
        void classify(itemId, text);
      }
    });

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

  function addThoughts() {
    const raw = input.trim();
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

  const prompt = shariReleasePrompt(submissionCount);

  const shareDisabled =
    shareConfirming || !input.trim() || pendingSplit !== null;

  return (
    <div className="flex flex-col gap-4" data-cmind-mode="capture">
      <p className="text-lg font-semibold leading-snug text-[#1f1c19]">
        {prompt}
      </p>

      <VoiceAnswerField
        value={input}
        inputRef={inputRef}
        onChange={(value) => {
          setInput(value);
          if (value.trim()) {
            setUsedTyping(true);
            beginRelease();
          }
        }}
        onFocus={beginRelease}
        onVoiceUsed={() => setUsedVoice(true)}
        voiceProminent
        placeholder="Say it or type it — messy is welcome"
        inputClassName="clear-my-mind-capture w-full flex-1 rounded-2xl border-2 border-[#d4cdc3] bg-white px-4 py-3 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f] min-h-[3.25rem]"
        micTitle="Speak what's on your mind"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={shareDisabled}
          onClick={addThoughts}
          aria-live="polite"
          data-testid="share-capture-button"
          data-share-confirming={shareConfirming ? "true" : "false"}
          className={`clear-my-mind-hold-btn rounded-xl px-6 py-3 text-base font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${
            shareConfirming ? "is-confirming" : ""
          }`}
        >
          {shareConfirming
            ? CLEAR_MY_MIND_CAPTURE_BUTTON_CONFIRM
            : CLEAR_MY_MIND_CAPTURE_BUTTON}
        </button>
      </div>

      {splitNotice ? (
        <p className="text-sm text-[#6b635a]">{splitNotice}</p>
      ) : null}

      {pendingSplit ? (
        <ThoughtSeparateOffer
          segments={pendingSplit.segments}
          onConfirm={confirmSplit}
          onDecline={leaveAsIs}
          declineLabel={CLEAR_MY_MIND_SPLIT_KEEP}
          testId="thought-split-offer"
        />
      ) : null}

      {onOpenMyThoughts ? (
        <ClearMyMindCaptureInvite
          totalThoughtCount={totalThoughtCount}
          sessionShareCount={submissionCount}
          sessionId={sessionId}
          onOpenMyThoughts={onOpenMyThoughts}
        />
      ) : null}
    </div>
  );
}
