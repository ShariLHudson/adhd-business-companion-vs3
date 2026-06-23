"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addBrainDumps,
  getBrainDumps,
  updateBrainDump,
  type BrainDumpEntry,
} from "@/lib/companionStore";
import {
  captureAck,
  capturePrompt,
  newCaptureSessionId,
  splitCaptureInput,
  type CapturePhase,
} from "@/lib/clearMyMindCapture";
import {
  CLEAR_MY_MIND_CAPTURE_EXAMPLE,
  CLEAR_MY_MIND_HELD_HINT,
  CLEAR_MY_MIND_SEE_HELD_LABEL,
  CLEAR_MY_MIND_ADD_MORE_LABEL,
  CLEAR_MY_MIND_SPLIT_CONFIRM,
  CLEAR_MY_MIND_SPLIT_HEADLINE,
  CLEAR_MY_MIND_SPLIT_KEEP,
  CLEAR_MY_MIND_SPLIT_SUBLINE,
} from "@/lib/clearMyMindCopy";
import {
  ROUTE_LABEL,
  routeBrainDumpEntry,
  routesForEntry,
  type ClearMindRoute,
  type RouteTrustResult,
} from "@/lib/brainDumpRouting";
import { normalizeCategory } from "@/lib/brainDumpCategories";
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

type Props = {
  sessionId?: string;
  onOpen?: (section: AppSection) => void;
  onSessionEntriesChange?: (entries: BrainDumpEntry[]) => void;
  onLandscapeActiveChange?: (active: boolean) => void;
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
  onOpen,
  onSessionEntriesChange,
  onLandscapeActiveChange,
}: Props) {
  const [sessionId] = useState(
    () => sessionIdProp ?? newCaptureSessionId(),
  );
  const [phase, setPhase] = useState<CapturePhase>("first");
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<BrainDumpEntry[]>([]);
  const [trust, setTrust] = useState<RouteTrustResult | null>(null);
  const [splitNotice, setSplitNotice] = useState<string | null>(null);
  const [showSortQueue, setShowSortQueue] = useState(false);
  const [pendingSplit, setPendingSplit] = useState<ThoughtSplitProposal | null>(
    null,
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

  const inReliefView = phase === "sorting" && !showSortQueue;

  useEffect(() => {
    onLandscapeActiveChange?.(inReliefView);
  }, [inReliefView, onLandscapeActiveChange]);

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

  function saveThoughtParts(parts: string[]) {
    if (!parts.length) return;

    const all = addBrainDumps(parts, { captureSessionId: sessionId });
    const createdItems = all.slice(0, parts.length);
    const sessionSaved = all.filter(
      (e) => e.captureSessionId === sessionId && isVisibleInMentalLandscape(e),
    );

    if (sessionSaved.length > 1) {
      setSplitNotice(
        `Held ${sessionSaved.length} separate thoughts — each one is safe here.`,
      );
    } else {
      setSplitNotice(null);
    }

    setEntries(sessionSaved);
    setInput("");
    setPendingSplit(null);
    setPhase("more");
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
    const parts = splitCaptureInput(input);
    if (!parts.length) return;

    if (parts.length === 1) {
      const proposal = detectThoughtSplitProposal(parts[0]!);
      if (proposal) {
        setPendingSplit(proposal);
        return;
      }
    }

    saveThoughtParts(parts);
  }

  function confirmSplit() {
    if (!pendingSplit) return;
    saveThoughtParts(pendingSplit.segments);
  }

  function leaveAsIs() {
    if (!pendingSplit) return;
    saveThoughtParts([pendingSplit.raw]);
  }

  function finishCapture() {
    if (sessionItems.length === 0) return;
    setShowSortQueue(false);
    setPhase("sorting");
    setTrust(null);
  }

  function resumeCapture() {
    setShowSortQueue(false);
    setPhase("more");
    setPendingSplit(null);
    setInput("");
    setTrust(null);
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
        setPhase("complete");
      }
    }, 2800);
  }

  const prompt = capturePrompt(phase, sessionItems.length);

  return (
    <div className="flex flex-col gap-4">
      {phase !== "complete" && !inReliefView && (
        <p className="text-lg font-semibold leading-snug text-[#1f1c19]">
          {prompt}
        </p>
      )}

      {(phase === "first" || phase === "more") && (
        <>
          {sessionItems.length > 0 && (
            <p className="text-sm font-medium text-[#1e4f4f]">
              {captureAck(sessionItems.length)}
            </p>
          )}
          <VoiceAnswerField
            value={input}
            onChange={setInput}
            placeholder={CLEAR_MY_MIND_CAPTURE_EXAMPLE}
            inputClassName="w-full rounded-2xl border-2 border-[#d4cdc3] bg-white px-4 py-3 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            micTitle={prompt}
          />
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
            <ul className="flex flex-col gap-2">
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
                  {entry.category ? (
                    <span className="mt-1 inline-block rounded-full bg-[#1e4f4f]/10 px-2 py-0.5 text-xs font-semibold text-[#1e4f4f]">
                      {normalizeCategory(entry.category)}
                    </span>
                  ) : (
                    <span className="mt-1 inline-block text-xs text-[#9a8f82]">
                      Holding…
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {sessionItems.length > 0 ? (
            <div
              className="rounded-2xl border border-[#1e4f4f]/25 bg-[#f0f8f8]/80 p-4"
              data-testid="see-whats-held-cta"
            >
              <p className="text-sm leading-relaxed text-[#5a5248]">
                {CLEAR_MY_MIND_HELD_HINT}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={finishCapture}
                  className="rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#163c3c]"
                  data-testid="see-whats-held-button"
                >
                  {CLEAR_MY_MIND_SEE_HELD_LABEL}
                </button>
                <button
                  type="button"
                  disabled={!input.trim() || pendingSplit !== null}
                  onClick={addThoughts}
                  className="rounded-xl border-2 border-[#d4cdc3] bg-white px-5 py-2.5 text-sm font-semibold text-[#3d3630] disabled:opacity-50"
                >
                  {sessionItems.length === 0 ? "Capture" : "Add another"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!input.trim() || pendingSplit !== null}
                onClick={addThoughts}
                className="rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white disabled:bg-[#9aaba8]"
              >
                Capture
              </button>
            </div>
          )}
        </>
      )}

      {phase === "sorting" && !showSortQueue && (
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

      {phase === "sorting" && showSortQueue && (
        <p className="text-sm leading-relaxed text-[#6b635a]">
          These thoughts are still safely held. Sorting is optional — skip any
          time and they&apos;ll stay with you.
        </p>
      )}

      {phase === "sorting" && showSortQueue && currentSortItem && (
        <div className="rounded-2xl border-2 border-[#1e4f4f]/30 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            {unsortedItems.length} thought{unsortedItems.length === 1 ? "" : "s"}{" "}
            left to sort
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

      {phase === "sorting" && showSortQueue && !currentSortItem && sessionItems.length > 0 && (
        <p className="text-sm text-[#6b635a]">
          All set for now — your thoughts are still held.
        </p>
      )}

      {phase === "complete" && (
        <div className="rounded-2xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/5 p-5">
          <p className="text-lg font-semibold text-[#1f1c19]">
            Everything is resting here.
          </p>
          <p className="mt-2 text-sm text-[#6b635a]">
            Your thoughts are safely held on this device — come back whenever you
            need.
          </p>
        </div>
      )}
    </div>
  );
}
