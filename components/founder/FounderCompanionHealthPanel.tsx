"use client";

import { useMemo, useState } from "react";

import { buildFounderIntelligenceDashboard } from "@/lib/founderIntelligence";
import { generateFounderFixPrompt } from "@/lib/founderCopilot";

export function FounderCompanionHealthPanel() {
  const dashboard = useMemo(() => buildFounderIntelligenceDashboard(), []);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const topPriority = dashboard.founderPriorities[0];

  async function copyPrompt(warningId: string) {
    const item = dashboard.founderPriorities.find((p) => p.warning.id === warningId);
    if (!item) return;
    const prompt = generateFounderFixPrompt(item);
    try {
      await navigator.clipboard.writeText(prompt.markdown);
      setCopiedId(warningId);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <section className="rounded-xl border border-[#1e4f4f]/25 bg-gradient-to-br from-[#1e4f4f]/5 to-white p-4 shadow-sm">
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
        Companion Health Dashboard
      </h2>
      <p className="mt-0.5 text-xs text-[#6b635a]">
        Ecosystem health, early warnings, and founder copilot priorities.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <ScoreCard label="Ecosystem" value={dashboard.ecosystemHealthScore} />
        <ScoreCard label="Trust" value={dashboard.trustScore} />
        <ScoreCard label="Accuracy" value={dashboard.companionAccuracyScore} />
        <ScoreCard label="Confidence" value={dashboard.confidenceScore} />
        <ScoreCard label="Momentum" value={dashboard.momentumScore} />
        <ScoreCard label="Retention" value={dashboard.retentionScore} />
      </div>

      {topPriority ? (
        <div className="mt-4 rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3">
          <p className="text-[10px] font-semibold uppercase text-[#a85c4a]">
            Top priority — {topPriority.priority}
          </p>
          <p className="mt-1 text-sm font-semibold text-[#1f1c19]">
            {topPriority.copilot.problem}
          </p>
          <p className="mt-1 text-xs text-[#6b635a]">{topPriority.copilot.likelyCause}</p>
          <p className="mt-2 text-xs text-[#2d2926]">
            <span className="font-medium">Fix: </span>
            {topPriority.copilot.recommendation}
          </p>
          <button
            type="button"
            onClick={() => void copyPrompt(topPriority.warning.id)}
            className="mt-2 text-xs font-medium text-[#1e4f4f] hover:underline"
          >
            {copiedId === topPriority.warning.id
              ? "Copied Cursor prompt ✓"
              : "Copy Cursor fix prompt →"}
          </button>
        </div>
      ) : (
        <p className="mt-3 text-xs text-[#6b635a]">No active warnings — companion health looks stable.</p>
      )}

      {dashboard.topEmergingIssues.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Emerging issues</li>
          {dashboard.topEmergingIssues.slice(0, 3).map((w) => (
            <li key={w.id}>· {w.title}</li>
          ))}
        </ul>
      ) : null}

      {dashboard.topFailingCapabilities.length > 0 ? (
        <ul className="mt-2 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Failing capabilities</li>
          {dashboard.topFailingCapabilities.slice(0, 3).map((c) => (
            <li key={c.id}>
              {c.label}: {c.dismissRate}% dismissed
            </li>
          ))}
        </ul>
      ) : null}

      {dashboard.topSuccessfulCapabilities.length > 0 ? (
        <ul className="mt-2 space-y-1 text-xs text-[#6b635a]">
          <li className="font-semibold text-[#2d2926]">Top performers</li>
          {dashboard.topSuccessfulCapabilities.slice(0, 3).map((c) => (
            <li key={c.id}>
              {c.label}: {c.completionRate}% completion
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  const color =
    value >= 70 ? "text-[#1e4f4f]" : value >= 45 ? "text-[#7a5c00]" : "text-[#a85c4a]";
  return (
    <div className="rounded-lg border border-[#ebe4d9] bg-white p-2">
      <p className="text-[10px] font-semibold uppercase text-[#6b635a]">{label}</p>
      <p className={`mt-0.5 text-lg font-semibold ${color}`}>{value}</p>
    </div>
  );
}
