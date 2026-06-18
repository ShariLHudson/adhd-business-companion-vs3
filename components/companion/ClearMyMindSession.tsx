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
  ROUTE_LABEL,
  routeBrainDumpEntry,
  routesForEntry,
  type ClearMindRoute,
  type RouteTrustResult,
} from "@/lib/brainDumpRouting";
import { normalizeCategory } from "@/lib/brainDumpCategories";
import type { AppSection } from "@/lib/companionUi";
import { VoiceAnswerField } from "@/components/companion/VoiceAnswerField";

type Props = {
  sessionId?: string;
  onOpen?: (section: AppSection) => void;
  onSessionComplete?: () => void;
  onViewLibrary?: () => void;
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
        <span className="font-medium">You'll see it:</span> {result.seeWhere}
      </p>
    </div>
  );
}

export function ClearMyMindSession({
  sessionId: sessionIdProp,
  onOpen,
  onSessionComplete,
  onViewLibrary,
}: Props) {
  const [sessionId] = useState(
    () => sessionIdProp ?? newCaptureSessionId(),
  );
  const [phase, setPhase] = useState<CapturePhase>("first");
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<BrainDumpEntry[]>([]);
  const [trust, setTrust] = useState<RouteTrustResult | null>(null);
  const [splitNotice, setSplitNotice] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setEntries(
      getBrainDumps().filter(
        (e) => e.captureSessionId === sessionId && !e.done,
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

  const unsortedItems = useMemo(
    () => sessionItems.filter((e) => !e.sorted && !e.routedAction),
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

  function addThoughts() {
    const parts = splitCaptureInput(input);
    if (!parts.length) return;

    const all = addBrainDumps(parts, { captureSessionId: sessionId });
    const sessionSaved = all.filter(
      (e) => e.captureSessionId === sessionId && !e.done,
    );

    if (sessionSaved.length > 1) {
      setSplitNotice(
        `I saved ${sessionSaved.length} separate items — one thought per card.`,
      );
    } else {
      setSplitNotice(null);
    }

    setEntries(sessionSaved);
    setInput("");
    setPhase("more");
    const lastId = sessionSaved[sessionSaved.length - 1]?.id;
    if (lastId) void classify(lastId, parts[parts.length - 1]!);

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

  function finishCapture() {
    if (sessionItems.length === 0) return;
    setPhase("sorting");
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
          e.captureSessionId === sessionId &&
          !e.done &&
          !e.sorted &&
          !e.routedAction,
      );
      if (remaining.length === 0) {
        setPhase("complete");
        onSessionComplete?.();
      }
    }, 2800);
  }

  const prompt = capturePrompt(phase, sessionItems.length);

  return (
    <div className="flex flex-col gap-4">
      {phase !== "complete" && (
        <>
          <p className="text-lg font-semibold leading-snug text-[#1f1c19]">
            {prompt}
          </p>
          {phase !== "sorting" && (
            <p className="text-sm text-[#6b635a]">
              One thing at a time — not a list. Short is perfect.
            </p>
          )}
        </>
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
            placeholder="e.g. Need to schedule my ultrasound"
            inputClassName="w-full rounded-2xl border-2 border-[#d4cdc3] bg-white px-4 py-3 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            micTitle={prompt}
          />
          {splitNotice ? (
            <p className="text-sm text-[#6b635a]">{splitNotice}</p>
          ) : null}
          {sessionItems.length > 0 && (
            <p className="text-sm text-[#6b635a]">
              Saved on this device. Open <strong>Library</strong> to find them.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!input.trim()}
              onClick={addThoughts}
              className="rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white disabled:bg-[#9aaba8]"
            >
              {sessionItems.length === 0 ? "Capture" : "Add another"}
            </button>
            {sessionItems.length > 0 && (
              <button
                type="button"
                onClick={finishCapture}
                className="rounded-xl border-2 border-[#1e4f4f] bg-white px-5 py-2.5 text-sm font-semibold text-[#1e4f4f]"
              >
                I&apos;m done capturing
              </button>
            )}
          </div>
        </>
      )}

      {sessionItems.length > 0 && phase !== "sorting" && (
        <ul className="flex flex-col gap-2">
          {sessionItems.map((entry, i) => (
            <li
              key={entry.id}
              className="rounded-xl border border-[#d4cdc3] bg-white/90 px-4 py-3"
            >
              <span className="text-xs font-bold text-[#9a8f82]">
                Item {i + 1}
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
                  Sorting…
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {phase === "sorting" && (
        <p className="text-sm leading-relaxed text-[#6b635a]">
          These cards are saved. Sorting just helps you decide what to do with
          each one. You can skip any — they&apos;ll stay in your Library.
        </p>
      )}

      {phase === "sorting" && currentSortItem && (
        <div className="rounded-2xl border-2 border-[#1e4f4f]/30 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            {unsortedItems.length} item{unsortedItems.length === 1 ? "" : "s"}{" "}
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

      {phase === "sorting" && !currentSortItem && sessionItems.length > 0 && (
        <p className="text-sm text-[#6b635a]">All items sorted for now.</p>
      )}

      {phase === "complete" && (
        <div className="rounded-2xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/5 p-5">
          <p className="text-lg font-semibold text-[#1f1c19]">
            Your mind is a little clearer.
          </p>
          <p className="mt-2 text-sm text-[#6b635a]">
            Everything is saved separately — come back anytime in your library.
          </p>
        </div>
      )}

      {onViewLibrary && sessionItems.length > 0 && phase !== "sorting" && (
        <button
          type="button"
          onClick={onViewLibrary}
          className="self-start text-sm font-semibold text-[#1e4f4f] hover:underline"
        >
          View all saved items →
        </button>
      )}
    </div>
  );
}
