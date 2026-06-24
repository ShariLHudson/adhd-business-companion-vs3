"use client";

import type { BusinessCanvasHealthOverview } from "@/lib/visualFocus/businessCanvas/impactModel/types";
import { sectionTitleForHealth } from "@/lib/visualFocus/businessCanvas/impactModel/sectionStrength";
import { themeForSection } from "@/lib/visualFocus/businessCanvas/sectionTheme";

function barColor(score: number): string {
  if (score >= 85) return "#16a34a";
  if (score >= 66) return "#0d9488";
  if (score >= 36) return "#d97706";
  return "#94a3b8";
}

export function BusinessCanvasHealthOverviewPanel({
  health,
}: {
  health: BusinessCanvasHealthOverview;
}) {
  return (
    <section
      className="rounded-2xl border border-[#e7dfd4] bg-white p-4"
      data-testid="business-canvas-health-overview"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-[#1e4f4f]">Business Health</h3>
          <p className="mt-1 text-xs text-[#6b635a]">
            How much the Companion has to work with in each section — not a grade.
          </p>
        </div>
        <div className="rounded-full bg-[#1e4f4f]/10 px-3 py-1 text-xs font-bold text-[#1e4f4f]">
          {health.overallConfidence}% overall confidence
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {health.sections.map((section) => {
          const theme = themeForSection(section.sectionId);
          return (
            <li key={section.sectionId}>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-[#1f1c19]">
                  <span aria-hidden>{theme.emoji} </span>
                  {sectionTitleForHealth(section.sectionId)}
                </span>
                <span className="flex items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 font-bold"
                    style={{
                      background: `${barColor(section.overall)}18`,
                      color: barColor(section.overall),
                    }}
                  >
                    {section.userLabelText}
                  </span>
                  <span className="font-bold text-[#6b635a]">{section.overall}%</span>
                </span>
              </div>
              <div
                className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#f3ebe0]"
                role="presentation"
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${section.overall}%`,
                    backgroundColor: barColor(section.overall),
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs text-[#6b635a]">
        {health.strongCount} strong area{health.strongCount === 1 ? "" : "s"} ·{" "}
        {health.needsDetailCount} need{health.needsDetailCount === 1 ? "s" : ""} more
        detail
      </p>
    </section>
  );
}
