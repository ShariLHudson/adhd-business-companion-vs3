"use client";

import type { BusinessCanvasSectionId } from "@/lib/visualFocus/businessCanvas/types";
import type { VisualFocusAnalysis } from "@/lib/visualFocus/types";
import {
  insightInviteLine,
  sequenceIntelligenceInsights,
  type SequencedInsight,
} from "@/lib/visualFocus/intelligence/insightSequence";
import { VisualFocusIntelligencePanel } from "./VisualFocusIntelligencePanel";

/**
 * Companion Insights — progressive disclosure.
 *
 * Instead of a nine-section right panel screaming on arrival, intelligence
 * is earned and revealed gently:
 *   invite   → "Here's your map. Would you like me to help analyze it?"
 *   teaser   → "✨ Companion Insights · I've found N things that might help."
 *   sequential → one insight at a time (First → Next → Risk → Opportunity…)
 *   all      → the full Companion Intelligence panel (capability preserved)
 *
 * Phase and reveal count are controlled by the parent so the toolbar's
 * Analyze menu can also drive them.
 */
export type CompanionInsightsPhase =
  | "invite"
  | "teaser"
  | "sequential"
  | "all";

export function CompanionInsightsReveal({
  analysis,
  phase,
  revealCount,
  onYes,
  onNotYet,
  onShowInsights,
  onRevealNext,
  onShowAll,
  onSectionHighlight,
  fullWidth = false,
}: {
  analysis: VisualFocusAnalysis;
  phase: CompanionInsightsPhase;
  revealCount: number;
  onYes: () => void;
  onNotYet: () => void;
  onShowInsights: () => void;
  onRevealNext: () => void;
  onShowAll: () => void;
  onSectionHighlight?: (sectionId: BusinessCanvasSectionId | null) => void;
  fullWidth?: boolean;
}) {
  const sequence = sequenceIntelligenceInsights(analysis);
  const total = sequence.length;

  const wrapClass = `flex w-full flex-col gap-3 ${
    fullWidth ? "max-w-none" : "max-w-sm lg:w-80"
  }`;

  if (phase === "all") {
    return (
      <VisualFocusIntelligencePanel
        analysis={analysis}
        onSectionHighlight={onSectionHighlight}
        fullWidth={fullWidth}
      />
    );
  }

  if (phase === "invite") {
    return (
      <aside
        className={wrapClass}
        data-testid="companion-insights-invite"
        aria-live="polite"
      >
        <div className="rounded-2xl border border-[#e7dfd4] bg-[#fffdf8] p-4 shadow-sm">
          <p className="text-base font-semibold leading-relaxed text-[#2f261f]">
            Here&rsquo;s your map. Would you like me to help analyze it?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163b3b]"
              data-testid="companion-insights-yes"
              onClick={onYes}
            >
              Yes
            </button>
            <button
              type="button"
              className="rounded-xl border border-[#c9bfb0] bg-white px-4 py-2 text-sm font-semibold text-[#6b635a] hover:bg-[#faf7f2]"
              data-testid="companion-insights-not-yet"
              onClick={onNotYet}
            >
              Not yet
            </button>
          </div>
        </div>
      </aside>
    );
  }

  if (phase === "teaser") {
    return (
      <aside
        className={wrapClass}
        data-testid="companion-insights-teaser"
        aria-live="polite"
      >
        <div className="rounded-2xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/5 p-4 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-bold text-[#1e4f4f]">
            <span aria-hidden>✨</span> Companion Insights
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[#2f261f]">
            {insightInviteLine(total)}
          </p>
          {total > 0 ? (
            <button
              type="button"
              className="mt-3 rounded-xl bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163b3b]"
              data-testid="companion-insights-show"
              onClick={onShowInsights}
            >
              Show insights
            </button>
          ) : null}
        </div>
      </aside>
    );
  }

  // phase === "sequential"
  const shown = Math.max(1, Math.min(revealCount, total));
  const visible = sequence.slice(0, shown);
  const hasMore = shown < total;

  return (
    <aside
      className={wrapClass}
      data-testid="companion-insights-sequence"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-bold text-[#1e4f4f]">
          <span aria-hidden>✨</span> Companion Insights
        </p>
        {total > 1 ? (
          <span className="text-xs font-semibold text-[#9a8f82]">
            {shown} of {total}
          </span>
        ) : null}
      </div>

      <ul className="flex flex-col gap-3">
        {visible.map((entry, index) => (
          <SequencedInsightCard
            key={`${entry.categoryId}-${index}`}
            entry={entry}
            onSectionHighlight={onSectionHighlight}
          />
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        {hasMore ? (
          <button
            type="button"
            className="rounded-xl bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163b3b]"
            data-testid="companion-insights-next"
            onClick={onRevealNext}
          >
            Show me the next one
          </button>
        ) : (
          <p
            className="text-sm text-[#6b635a]"
            data-testid="companion-insights-complete"
          >
            That&rsquo;s everything I noticed.
          </p>
        )}
        {total > 1 ? (
          <button
            type="button"
            className="rounded-xl border border-[#c9bfb0] bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#faf7f2]"
            data-testid="companion-insights-show-all"
            onClick={onShowAll}
          >
            Show all together
          </button>
        ) : null}
      </div>
    </aside>
  );
}

function SequencedInsightCard({
  entry,
  onSectionHighlight,
}: {
  entry: SequencedInsight;
  onSectionHighlight?: (sectionId: BusinessCanvasSectionId | null) => void;
}) {
  const { theme, item } = entry;
  return (
    <li
      className="overflow-hidden rounded-2xl border-2 shadow-sm"
      style={{ borderColor: theme.border }}
      data-testid={`companion-insight-card-${theme.id}`}
      tabIndex={item.sectionId ? 0 : undefined}
      onMouseEnter={() => onSectionHighlight?.(item.sectionId ?? null)}
      onMouseLeave={() => onSectionHighlight?.(null)}
      onFocus={() => onSectionHighlight?.(item.sectionId ?? null)}
      onBlur={() => onSectionHighlight?.(null)}
    >
      <header
        className="flex items-center gap-2 px-4 py-2"
        style={{ background: theme.headerBg, color: theme.headerText }}
      >
        <span className="text-base leading-none" aria-hidden>
          {theme.icon}
        </span>
        <h3 className="text-sm font-bold">{theme.title}</h3>
      </header>
      <div className="bg-[#faf7f2] p-3">
        {item.badge ? (
          <span
            className="mb-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
            style={{ background: item.badge.bg, color: item.badge.text }}
          >
            <span aria-hidden>{item.badge.emoji}</span>
            {item.badge.label}
          </span>
        ) : null}
        <p className="text-sm leading-relaxed text-[#2f261f]">{item.text}</p>
      </div>
    </li>
  );
}
