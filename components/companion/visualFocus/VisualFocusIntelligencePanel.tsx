"use client";

import type { BusinessCanvasSectionId } from "@/lib/visualFocus/businessCanvas/types";
import type { VisualFocusAnalysis } from "@/lib/visualFocus/types";
import {
  buildIntelligencePanelSections,
  type EnrichedInsightItem,
} from "@/lib/visualFocus/intelligence/enrichInsights";
import {
  INTELLIGENCE_CATEGORY_ORDER,
  INTELLIGENCE_CATEGORY_THEMES,
  type IntelligenceCategoryId,
  type IntelligenceCategoryTheme,
} from "@/lib/visualFocus/intelligence/themes";

const CATEGORY_ITEMS: Record<
  IntelligenceCategoryId,
  (sections: ReturnType<typeof buildIntelligencePanelSections>) => EnrichedInsightItem[]
> = {
  summary: (s) => s.summary,
  key_relationships: (s) => s.keyRelationships,
  patterns: (s) => s.patterns,
  risks: (s) => s.risks,
  opportunities: (s) => s.opportunities,
  recommendations: (s) => s.recommendations,
  board_observations: (s) => s.boardObservations,
  what_if: (s) => s.whatIfNotes,
  next_steps: (s) => s.nextSteps,
};

const CATEGORY_EMPTY: Partial<Record<IntelligenceCategoryId, string>> = {
  risks: "No major risks flagged yet.",
  board_observations:
    "Coming soon — your canvas will feed Board of Directors review.",
  what_if:
    "Explore a business change below to see ripple effects and impact on your canvas.",
};

function InsightItem({
  item,
  onSectionHighlight,
}: {
  item: EnrichedInsightItem;
  onSectionHighlight?: (sectionId: BusinessCanvasSectionId | null) => void;
}) {
  return (
    <li
      className="rounded-xl border border-[#e7dfd4] bg-white p-3 shadow-sm"
      tabIndex={item.sectionId ? 0 : undefined}
      onMouseEnter={() =>
        onSectionHighlight?.(item.sectionId ?? null)
      }
      onMouseLeave={() => onSectionHighlight?.(null)}
      onFocus={() => onSectionHighlight?.(item.sectionId ?? null)}
      onBlur={() => onSectionHighlight?.(null)}
    >
      {item.sectionId && item.sectionLabel ? (
        <div
          className="mb-2 flex items-center gap-2 text-xs font-bold"
          style={{ color: item.sectionColor ?? "#1e4f4f" }}
        >
          <span aria-hidden>{item.sectionEmoji}</span>
          <span>{item.sectionLabel}</span>
        </div>
      ) : null}
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
    </li>
  );
}

function IntelligenceCard({
  theme,
  items,
  empty,
  onSectionHighlight,
}: {
  theme: IntelligenceCategoryTheme;
  items: EnrichedInsightItem[];
  empty?: string;
  onSectionHighlight?: (sectionId: BusinessCanvasSectionId | null) => void;
}) {
  if (items.length === 0 && !empty) return null;

  return (
    <article
      className="overflow-hidden rounded-2xl border-2 shadow-sm"
      style={{ borderColor: theme.border }}
      data-testid={`intelligence-card-${theme.id}`}
    >
      <header
        className="px-4 py-3"
        style={{ background: theme.headerBg, color: theme.headerText }}
      >
        <div className="flex items-start gap-2">
          <span className="text-lg leading-none" aria-hidden>
            {theme.icon}
          </span>
          <div>
            <h3 className="text-sm font-bold">{theme.title}</h3>
            <p className="mt-0.5 text-xs leading-snug opacity-90">
              {theme.subtitle}
            </p>
          </div>
        </div>
      </header>
      <div className="space-y-2 bg-[#faf7f2] p-3">
        {items.length === 0 && empty ? (
          <p className="px-1 text-sm text-[#9a8f82]">{empty}</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <InsightItem
                key={`${theme.id}-${index}`}
                item={item}
                onSectionHighlight={onSectionHighlight}
              />
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

export function VisualFocusIntelligencePanel({
  analysis,
  onSectionHighlight,
  fullWidth = false,
}: {
  analysis: VisualFocusAnalysis;
  /** Future Living Canvas — highlight matching Business Canvas sections on hover. */
  onSectionHighlight?: (sectionId: BusinessCanvasSectionId | null) => void;
  fullWidth?: boolean;
}) {
  const sections = buildIntelligencePanelSections(analysis);

  return (
    <aside
      className={`flex flex-col gap-4 overflow-y-auto ${
        fullWidth ? "w-full max-w-none" : "w-full max-w-sm lg:w-80"
      }`}
      data-testid="visual-focus-intelligence"
    >
      <div className="rounded-xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/5 px-3 py-2">
        <p className="text-xs font-semibold text-[#1e4f4f]">
          Companion Intelligence — scan by color and icon first, then read what
          needs your attention.
        </p>
      </div>

      {INTELLIGENCE_CATEGORY_ORDER.map((categoryId) => {
        const theme = INTELLIGENCE_CATEGORY_THEMES[categoryId];
        const items = CATEGORY_ITEMS[categoryId](sections);
        return (
          <IntelligenceCard
            key={categoryId}
            theme={theme}
            items={items}
            empty={CATEGORY_EMPTY[categoryId]}
            onSectionHighlight={onSectionHighlight}
          />
        );
      })}
    </aside>
  );
}
