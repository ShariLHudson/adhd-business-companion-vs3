"use client";

import { useMemo, useState } from "react";
import {
  disableDiscovery,
  nextDiscoveryQuestion,
  recordDiscoveryAnswer,
  skipDiscoveryForSession,
  type DiscoveryTopicId,
} from "@/lib/progressiveDiscovery";

export function ProgressiveDiscoveryCard({
  onOpenBusinessProfile,
  onOpenSettings,
}: {
  onOpenBusinessProfile?: () => void;
  onOpenSettings?: () => void;
}) {
  const question = useMemo(() => nextDiscoveryQuestion(), []);
  const [done, setDone] = useState(false);
  const [custom, setCustom] = useState("");

  if (!question || done) return null;

  function finish(answer: string, id: DiscoveryTopicId) {
    if (id === "business" && answer.includes("Business Profile")) {
      onOpenBusinessProfile?.();
      skipDiscoveryForSession();
      setDone(true);
      return;
    }
    recordDiscoveryAnswer(id, answer);
    setDone(true);
  }

  return (
    <div className="mb-3 rounded-2xl border border-[#d4cdc3] bg-white/90 px-4 py-3 shadow-sm">
      <p className="text-base font-semibold text-[#1f1c19]">{question.prompt}</p>
      <p className="mt-1 text-sm text-[#6b635a]">
        <span className="font-medium text-[#1e4f4f]">Why I&apos;m asking:</span>{" "}
        {question.why}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {question.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => finish(opt, question.id)}
            className="rounded-full border border-[#1e4f4f]/25 bg-white px-3 py-1.5 text-sm font-medium text-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06]"
          >
            {opt}
          </button>
        ))}
      </div>
      {question.allowCustom ? (
        <div className="mt-3 flex gap-2">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Or type your own…"
            className="min-w-0 flex-1 rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1e4f4f]"
          />
          <button
            type="button"
            disabled={!custom.trim()}
            onClick={() => finish(custom.trim(), question.id)}
            className="rounded-lg bg-[#1e4f4f] px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Save
          </button>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#9a8f82]">
        <button
          type="button"
          onClick={() => {
            skipDiscoveryForSession();
            setDone(true);
          }}
          className="font-semibold underline decoration-[#9a8f82]/40 underline-offset-2 hover:text-[#6b635a]"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={() => onOpenSettings?.()}
          className="font-semibold underline decoration-[#9a8f82]/40 underline-offset-2 hover:text-[#6b635a]"
        >
          Change later
        </button>
        <button
          type="button"
          onClick={() => {
            disableDiscovery();
            setDone(true);
          }}
          className="font-semibold underline decoration-[#9a8f82]/40 underline-offset-2 hover:text-[#6b635a]"
        >
          Turn off anytime
        </button>
      </div>
    </div>
  );
}
