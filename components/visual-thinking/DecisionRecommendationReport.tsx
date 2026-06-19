"use client";

import { useMemo } from "react";
import type { PersistedDecisionCompassSession } from "@/lib/decisionCompassSessionStore";
import { buildDecisionRecommendationReport } from "@/lib/decisionRecommendationReport";
import {
  buildDecisionExplorationState,
  CONFIDENCE_META,
} from "@/lib/decisionCompassExploration";
import { VISUAL_THINKING_COLORS } from "@/lib/visualThinkingColors";

const SECTIONS = [
  {
    key: "whatWeNotice" as const,
    title: "What We Notice",
    icon: "👁️",
    tone: "decision" as const,
  },
  {
    key: "potentialAdvantages" as const,
    title: "Potential Advantages",
    icon: "✨",
    tone: "benefit" as const,
  },
  {
    key: "potentialConcerns" as const,
    title: "Potential Concerns",
    icon: "⚠️",
    tone: "concern" as const,
  },
  {
    key: "questionsWorthConsidering" as const,
    title: "Questions Worth Considering",
    icon: "💭",
    tone: "insight" as const,
  },
  {
    key: "alternativePaths" as const,
    title: "Alternative Paths",
    icon: "🔀",
    tone: "option-b" as const,
  },
];

export function DecisionRecommendationReport({
  session,
}: {
  session: PersistedDecisionCompassSession | null;
}) {
  const report = useMemo(
    () => buildDecisionRecommendationReport(session),
    [session?.lastTouchedAt, session?.sessionId, session?.recommendation],
  );
  const exploration = useMemo(
    () => (session ? buildDecisionExplorationState(session) : null),
    [session],
  );

  if (!report) return null;

  const gold = VISUAL_THINKING_COLORS.insight;
  const conf = exploration ? CONFIDENCE_META[exploration.confidence] : null;

  return (
    <div
      className="decision-recommendation-report border-t border-[#e7dfd4] bg-white/60 px-4 py-5"
      data-testid="decision-recommendation-report"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-[#1e4f4f]">
        Recommendation Report
      </p>
      <p className="mt-1 text-sm text-[#6b635a]">
        {report.overallDirection?.qualifier} — a thinking companion, not a
        verdict.
      </p>

      {report.overallDirection ? (
        <div
          className="mt-4 rounded-2xl border-2 px-4 py-4 text-center"
          style={{
            borderColor: gold.border,
            background: gold.bgGradient,
          }}
        >
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: gold.text }}>
            Overall Direction
          </p>
          <p className="mt-1 text-lg font-bold" style={{ color: gold.text }}>
            {report.overallDirection.choice}
          </p>
          <p className="mt-1 text-sm" style={{ color: gold.text }}>
            {report.overallDirection.headline}
          </p>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: gold.text }}>
            {report.overallDirection.summary}
          </p>
          {conf ? (
            <p
              className="mt-3 rounded-lg border border-white/40 bg-white/30 px-3 py-2 text-sm"
              style={{ color: gold.text }}
              data-testid="decision-confidence-badge"
            >
              {conf.emoji} <strong>{conf.label}</strong> — {conf.description}
            </p>
          ) : null}
        </div>
      ) : null}

      {exploration?.whatCouldChange.length ? (
        <div className="mt-4 rounded-xl border border-[#d4cdc3] bg-white/80 p-3">
          <p className="text-sm font-bold text-[#1e4f4f]">
            What Could Change This Recommendation?
          </p>
          <ul className="mt-2 list-none space-y-1 pl-0">
            {exploration.whatCouldChange.map((item) => (
              <li key={item} className="text-sm text-[#2d2926]">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {SECTIONS.map((section) => {
          const items = report[section.key];
          if (!items.length) return null;
          const colors = VISUAL_THINKING_COLORS[section.tone];
          return (
            <div
              key={section.key}
              className="rounded-xl border p-3"
              style={{
                borderColor: colors.border,
                background: colors.bgGradient,
              }}
            >
              <p
                className="text-sm font-bold"
                style={{ color: colors.text }}
              >
                {section.icon} {section.title}
              </p>
              <ul className="mt-2 list-none space-y-1.5 pl-0">
                {items.map((item, i) => (
                  <li
                    key={i}
                    className="rounded-lg bg-white/50 px-2.5 py-1.5 text-sm leading-snug text-[#2d2926]"
                  >
                    {item.replace(/\*\*/g, "")}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-4 rounded-lg border border-[#d4cdc3] bg-[#faf8f5] px-3 py-2 text-xs leading-relaxed text-[#6b635a]">
        {report.disclaimer}
      </p>
    </div>
  );
}
