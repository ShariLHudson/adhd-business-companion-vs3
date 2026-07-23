"use client";

import {
  buildThinkingSummary,
  type ThinkingSummarySection,
} from "@/lib/strategyChamber/thinkingSummary";
import type { StrategyWorkItem } from "@/lib/strategyChamber/types";

type Props = {
  item: StrategyWorkItem;
  onClose: () => void;
  onCorrect?: (sectionId: string, nextBody: string) => void;
};

function SectionBody({
  section,
  onCorrect,
}: {
  section: ThinkingSummarySection;
  onCorrect?: (sectionId: string, nextBody: string) => void;
}) {
  if (Array.isArray(section.body)) {
    return (
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[#4b463f]">
        {section.body.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    );
  }
  return (
    <div className="mt-1">
      <p className="text-sm leading-relaxed text-[#4b463f]">{section.body}</p>
      {onCorrect ? (
        <button
          type="button"
          className="mt-1 text-xs font-semibold text-[#1e4f4f] underline"
          onClick={() => {
            const next = window.prompt("Update this note:", section.body as string);
            if (next != null && next.trim()) onCorrect(section.id, next.trim());
          }}
          data-testid={`thinking-correct-${section.id}`}
        >
          Correct this
        </button>
      ) : null}
    </div>
  );
}

/**
 * Quiet secondary panel — only sections with meaningful content.
 */
export function StrategyThinkingPanel({ item, onClose, onCorrect }: Props) {
  const sections = buildThinkingSummary(item);

  return (
    <aside
      className="mt-4 rounded-2xl border border-[#d4cdc3] bg-white/95 p-4"
      data-testid="strategy-thinking-panel"
      aria-label="My thinking so far"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-[#1f1c19]">
            My Thinking So Far
          </p>
          <p className="mt-1 text-sm text-[#6b635a]">
            A quiet summary — only what we have gathered.
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg px-2 py-1 text-sm font-semibold text-[#1e4f4f]"
          onClick={onClose}
          data-testid="strategy-thinking-close"
        >
          Close
        </button>
      </div>
      {sections.length === 0 ? (
        <p className="mt-3 text-sm text-[#6b635a]">
          Nothing gathered yet — answer the next question when you are ready.
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {sections.map((section) => (
            <div
              key={section.id}
              data-testid={`thinking-section-${section.id}`}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
                {section.label}
              </p>
              <SectionBody section={section} onCorrect={onCorrect} />
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
