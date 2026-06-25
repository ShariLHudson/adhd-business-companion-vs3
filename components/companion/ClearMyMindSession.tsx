"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  CLEAR_MY_MIND_CAPTURE_BUTTON_MORE,
  CLEAR_MY_MIND_RELEASE_DONE_HINT,
  CLEAR_MY_MIND_RELEASE_DONE_LABEL,
  CLEAR_MY_MIND_SPLIT_CONFIRM,
  CLEAR_MY_MIND_SPLIT_HEADLINE,
  CLEAR_MY_MIND_SPLIT_KEEP,
  CLEAR_MY_MIND_SPLIT_SUBLINE,
  CLEAR_MY_MIND_ADD_MORE_LABEL,
  CLEAR_MY_MIND_GENTLE_FOCUS,
  CLEAR_MY_MIND_GENTLE_NEXT_PROMPT,
  CLEAR_MY_MIND_GENTLE_REST,
} from "@/lib/clearMyMindCopy";
import { shariImmediateHoldResponse, shariReleasePrompt } from "@/lib/clearMyMindCompanionVoice";
import {
  recordClearMyMindSessionIntelligence,
  recordClearMyMindSubmission,
} from "@/lib/clearMyMindIntelligence";
import {
  initialClearMyMindStage,
  stageOnAcknowledgmentContinue,
  stageOnCaptureBegin,
  stageOnReleaseComplete,
  clearMyMindShowsClusters,
  type ClearMyMindStage,
} from "@/lib/clearMyMindStages";
import {
  ROUTE_LABEL,
  routeBrainDumpEntry,
  routesForEntry,
  type ClearMindRoute,
  type RouteTrustResult,
} from "@/lib/brainDumpRouting";
import {
  isHeldThought,
  isVisibleInMentalLandscape,
} from "@/lib/thoughtLifecycle";
import type { AppSection } from "@/lib/companionUi";
import { VoiceAnswerField } from "@/components/companion/VoiceAnswerField";
import { ClearMyMindReliefClusters } from "@/components/companion/ClearMyMindReliefClusters";
import {
  detectThoughtSplitProposal,
  type ThoughtSplitProposal,
} from "@/lib/clearMyMindThoughtSplitter";
import type { ClearMyMindChoiceId } from "@/lib/clearMyMindCompanionVoice";

type Props = {
  sessionId?: string;
  stage?: ClearMyMindStage;
  onOpen?: (section: AppSection) => void;
  onSessionEntriesChange?: (entries: BrainDumpEntry[]) => void;
  onStageChange?: (stage: ClearMyMindStage) => void;
  onChoice?: (choiceId: ClearMyMindChoiceId) => void;
  selectedChoice?: ClearMyMindChoiceId | null;
};

function TrustBanner({ result }: { result: RouteTrustResult }) {
  if (!result.ok) return null;
  return (
    <div className="companion-fade-in rounded-xl border border-[#1e4f4f]/25 bg-[#1e4f4f]/[0.07] px-4 py-3 text-sm leading-relaxed text-[#2d2926]">
      <p className="font-semibold text-[#1e4f4f]">{result.headline}</p>
      <p className="mt-1">
        <span className="font-medium">Saved to:</span> {result.savedWhere}
      </p>
      <p className="mt-0.5">
        <span className="font-medium">You&apos;ll see it:</span> {result.seeWhere}
      </p>
    </div>
  );
}

export function ClearMyMindSession({
  sessionId: sessionIdProp,
  stage: stageProp,
  onOpen,
  onSessionEntriesChange,
  onStageChange,
  onChoice,
  selectedChoice = null,
}: Props) {
  const [sessionId] = useState(
    () => sessionIdProp ?? newCaptureSessionId(),
  );
  const [internalStage, setInternalStage] = useState<ClearMyMindStage>(
    initialClearMyMindStage,
  );
  const stage = stageProp ?? internalStage;
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<BrainDumpEntry[]>([]);
  const [trust, setTrust] = useState<RouteTrustResult | null>(null);
  const [splitNotice, setSplitNotice] = useState<string | null>(null);
  const [showSortQueue, setShowSortQueue] = useState(false);
  const [pendingSplit, setPendingSplit] = useState<ThoughtSplitProposal | null>(
    null,
  );
  const [usedVoice, setUsedVoice] = useState(false);
  const [usedTyping, setUsedTyping] = useState(false);
  const [holdAck, setHoldAck] = useState<string | null>(null);
  const [showGentleNext, setShowGentleNext] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);

  const setStageAndNotify = useCallback(
    (next: ClearMyMindStage) => {
      if (stageProp === undefined) {
        setInternalStage(next);
      }
      onStageChange?.(next);
    },
    [onStageChange, stageProp],
  );

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
    onSessionEntriesChange?.(sessionItems);
  }, [sessionItems, onSessionEntriesChange]);

  useEffect(() => {
    setPendingSplit((prev) => {
      if (!prev) return null;
      return input.trim() === prev.raw ? prev : null;
    });
  }, [input]);

  const unsortedItems = useMemo(
    () => sessionItems.filter(isHeldThought),
    [sessionItems],
  );

  const currentSortItem = unsortedItems[0] ?? null;

  const inCapture =
    stage === "permission" || stage === "release";
  const showClusters = clearMyMindShowsClusters(stage);

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
        refresh();
      }
    } catch {
      /* unclassified is fine */
    }
  }

  function saveThoughtParts(parts: string[], rawDump: string) {
    if (!parts.length) return;

    const all = addBrainDumps(parts, { captureSessionId: sessionId });
    const createdItems = all.slice(0, parts.length);
    const sessionSaved = all.filter(
      (e) => e.captureSessionId === sessionId && isVisibleInMentalLandscape(e),
    );

    if (sessionSaved.length > 1) {
      setSplitNotice(
        `Holding ${sessionSaved.length} separate thoughts — each one is safe here.`,
      );
    } else {
      setSplitNotice(null);
    }

    setEntries(sessionSaved);
    setInput("");
    setPendingSplit(null);
    setStageAndNotify("release");
    setHoldAck(shariImmediateHoldResponse(parts));
    setShowGentleNext(true);
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
    setStageAndNotify(stageOnCaptureBegin(stage));
  }

  function finishRelease() {
    if (sessionItems.length === 0) return;
    recordClearMyMindSessionIntelligence({
      sessionId,
      entries: sessionItems,
      usedVoice,
      submissionCount,
    });
    setShowGentleNext(false);
    setHoldAck(null);
    setShowSortQueue(false);
    setStageAndNotify(stageOnReleaseComplete(stage));
    setTrust(null);
  }

  function resumeCapture() {
    setShowSortQueue(false);
    setStageAndNotify("release");
    setPendingSplit(null);
    setInput("");
    setTrust(null);
  }

  function handleChoice(choiceId: ClearMyMindChoiceId) {
    onChoice?.(choiceId);
    if (choiceId === "explore") {
      setShowSortQueue(true);
    }
  }

  function applyRoute(route: ClearMindRoute) {
    if (!currentSortItem) return;
    const result = routeBrainDumpEntry(currentSortItem, route);
    updateBrainDump(currentSortItem.id, { sorted: true });
    setTrust(result);
    refresh();

    if (route === "focus") onOpen?.("focus-timer");
    if (route === "time-block") onOpen?.("time-block");
    if (route === "project") onOpen?.("projects");

    window.setTimeout(() => {
      setTrust(null);
      refresh();
      const remaining = getBrainDumps().filter(
        (e) =>
          e.captureSessionId === sessionId && isHeldThought(e),
      );
      if (remaining.length === 0) {
        setShowSortQueue(false);
      }
    }, 2800);
  }

  const prompt = shariReleasePrompt(sessionItems.length);

  return (
    <div className="flex flex-col gap-4" data-cmind-stage={stage}>
      {inCapture && (
        <>
          {stage === "permission" ? (
            <p className="text-base leading-relaxed text-[#6b635a]">
              You don&apos;t have to carry all of this by yourself anymore.
            </p>
          ) : null}

          <p className="text-lg font-semibold leading-snug text-[#1f1c19]">
            {prompt}
          </p>

          <VoiceAnswerField
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
            voiceProminent
            placeholder="Say it or type it — messy is welcome"
            inputClassName="clear-my-mind-capture w-full flex-1 rounded-2xl border-2 border-[#d4cdc3] bg-white px-4 py-3 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f] min-h-[3.25rem]"
            micTitle="Speak what's on your mind"
          />

          {holdAck ? (
            <div
              className="companion-fade-in rounded-2xl border border-[#c5ddd8] bg-[#f0f8f8]/90 px-4 py-3.5"
              role="status"
              aria-live="polite"
              data-testid="shari-hold-ack"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
                Shari
              </p>
              <p className="mt-1 text-base leading-relaxed text-[#2f261f]">
                {holdAck}
              </p>
            </div>
          ) : null}

          {showGentleNext && holdAck && sessionItems.length > 0 ? (
            <div
              className="companion-fade-in rounded-2xl border border-[#e7dfd4] bg-white/90 px-4 py-4"
              data-testid="gentle-next-step"
            >
              <p className="text-sm leading-relaxed text-[#5a5248]">
                {CLEAR_MY_MIND_GENTLE_NEXT_PROMPT}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowGentleNext(false);
                    onOpen?.("focus-timer");
                  }}
                  className="rounded-xl border border-[#c5ddd8] bg-[#f0f8f8] px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#e6f4f4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35"
                >
                  {CLEAR_MY_MIND_GENTLE_FOCUS}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGentleNext(false)}
                  className="rounded-xl border border-[#e7dfd4] bg-white px-4 py-2.5 text-sm font-semibold text-[#3d3630] hover:bg-[#faf7f2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35"
                >
                  {CLEAR_MY_MIND_GENTLE_REST}
                </button>
              </div>
            </div>
          ) : null}

          {sessionItems.length > 0 && stage === "release" && holdAck ? (
            <p className="text-sm font-medium text-[#1e4f4f]" role="status">
              Held safely — {sessionItems.length}{" "}
              {sessionItems.length === 1 ? "thought" : "thoughts"}.
            </p>
          ) : null}

          {splitNotice ? (
            <p className="text-sm text-[#6b635a]">{splitNotice}</p>
          ) : null}

          {pendingSplit ? (
            <div
              className="rounded-2xl border border-[#e7dfd4] bg-[#faf7f2]/90 p-4"
              data-testid="thought-split-offer"
            >
              <p className="text-base font-semibold text-[#1f1c19]">
                {CLEAR_MY_MIND_SPLIT_HEADLINE}
              </p>
              <p className="mt-1 text-sm text-[#6b635a]">
                {CLEAR_MY_MIND_SPLIT_SUBLINE}
              </p>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-[#9a8f82] marker:content-none [&::-webkit-details-marker]:hidden">
                  Preview separation
                </summary>
                <ul className="mt-2 list-none space-y-1 pl-0 text-sm text-[#6b635a]">
                  {pendingSplit.segments.map((segment, index) => (
                    <li key={`${index}-${segment}`}>{segment}</li>
                  ))}
                </ul>
              </details>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={confirmSplit}
                  className="rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  {CLEAR_MY_MIND_SPLIT_CONFIRM}
                </button>
                <button
                  type="button"
                  onClick={leaveAsIs}
                  className="rounded-xl border-2 border-[#d4cdc3] bg-white px-5 py-2.5 text-sm font-semibold text-[#3d3630]"
                >
                  {CLEAR_MY_MIND_SPLIT_KEEP}
                </button>
              </div>
            </div>
          ) : null}

          {sessionItems.length > 0 && (
            <ul className="flex flex-col gap-2" aria-label="Held thoughts">
              {sessionItems.map((entry, i) => (
                <li
                  key={entry.id}
                  className="rounded-xl border border-[#d4cdc3] bg-white/90 px-4 py-3"
                >
                  <span className="text-xs font-bold text-[#9a8f82]">
                    Held {i + 1}
                  </span>
                  <p className="mt-0.5 text-base font-medium text-[#1f1c19]">
                    {entry.text}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {sessionItems.length > 0 ? (
            <div
              className="rounded-2xl border border-[#1e4f4f]/20 bg-[#f0f8f8]/60 p-4"
              data-testid="release-done-cta"
            >
              <p className="text-sm leading-relaxed text-[#5a5248]">
                {CLEAR_MY_MIND_RELEASE_DONE_HINT}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={finishRelease}
                  className="rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#163c3c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35"
                  data-testid="release-done-button"
                >
                  {CLEAR_MY_MIND_RELEASE_DONE_LABEL}
                </button>
                <button
                  type="button"
                  disabled={!input.trim() || pendingSplit !== null}
                  onClick={addThoughts}
                  className="clear-my-mind-hold-btn rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed"
                >
                  {CLEAR_MY_MIND_CAPTURE_BUTTON_MORE}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!input.trim() || pendingSplit !== null}
                onClick={addThoughts}
                className="clear-my-mind-hold-btn rounded-xl px-6 py-3 text-base font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
              >
                {CLEAR_MY_MIND_CAPTURE_BUTTON}
              </button>
            </div>
          )}
        </>
      )}

      {stage === "received" && sessionItems.length > 0 && (
        <div className="space-y-3" data-testid="cmind-received-held">
          <p className="text-sm leading-relaxed text-[#6b635a]">
            Everything you shared is resting here safely.
          </p>
          <ul className="flex flex-col gap-2" aria-label="Held thoughts">
            {sessionItems.map((entry, i) => (
              <li
                key={entry.id}
                className="rounded-xl border border-[#e7dfd4] bg-white/80 px-4 py-3"
              >
                <span className="text-xs font-bold text-[#9a8f82]">
                  Held {i + 1}
                </span>
                <p className="mt-0.5 text-base text-[#1f1c19]">{entry.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showClusters && !showSortQueue && (
        <>
          <ClearMyMindReliefClusters
            entries={sessionItems}
            onOpen={onOpen}
            onEntriesChange={refresh}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={resumeCapture}
              className="rounded-xl border-2 border-[#1e4f4f]/30 bg-white px-5 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35"
              data-testid="add-more-thoughts-button"
            >
              {CLEAR_MY_MIND_ADD_MORE_LABEL}
            </button>
          </div>
        </>
      )}

      {showClusters && showSortQueue && (
        <p className="text-sm leading-relaxed text-[#6b635a]">
          Sorting is optional — skip any time and everything stays safely held.
        </p>
      )}

      {showClusters && showSortQueue && currentSortItem && (
        <div className="rounded-2xl border-2 border-[#1e4f4f]/30 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            {unsortedItems.length} thought{unsortedItems.length === 1 ? "" : "s"}{" "}
            — only if you want
          </p>
          <p className="mt-2 text-lg font-semibold text-[#1f1c19]">
            {currentSortItem.text}
          </p>
          <p className="mt-3 text-sm font-medium text-[#2d2926]">
            What would you like to do with this?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {routesForEntry(currentSortItem).map((route) => (
              <button
                key={route}
                type="button"
                onClick={() => applyRoute(route)}
                className="rounded-lg border border-[#1e4f4f]/30 bg-[#1e4f4f]/5 px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
              >
                {ROUTE_LABEL[route]}
              </button>
            ))}
          </div>
          {trust ? (
            <div className="mt-4">
              <TrustBanner result={trust} />
            </div>
          ) : null}
        </div>
      )}

      {stage === "choice" && selectedChoice === "rest" && (
        <div className="rounded-2xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/5 p-5">
          <p className="text-lg font-semibold text-[#1f1c19]">
            Everything is resting here.
          </p>
          <p className="mt-2 text-sm text-[#6b635a]">
            You can breathe now. It&apos;s all safely held on this device.
          </p>
        </div>
      )}
    </div>
  );
}
