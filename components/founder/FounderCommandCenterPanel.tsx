"use client";

import { useCallback, useMemo, useState } from "react";

import { buildFounderMissionControl } from "@/lib/founderMissionControl";
import { generateFounderFixPrompt } from "@/lib/founderCopilot";
import type { HealthTrend } from "@/lib/founderIntelligence";

export function FounderCommandCenterPanel() {
  const [refreshKey, setRefreshKey] = useState(0);
  const missionControl = useMemo(
    () => buildFounderMissionControl(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey],
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [briefExpanded, setBriefExpanded] = useState(true);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  async function copyPrompt(warningId: string) {
    const item = missionControl.topPriorities.find((p) => p.warning.id === warningId);
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

  const { dailyBrief, alerts, companionHealth } = missionControl;

  return (
    <section className="rounded-xl border border-[#1e4f4f]/30 bg-gradient-to-br from-[#1e4f4f]/8 via-white to-[#faf8f5] p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1e4f4f]">
            Founder Command Center™
          </h2>
          <p className="mt-0.5 text-xs text-[#6b635a]">
            Mission Control — what needs attention, why, and what to do next.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="text-xs font-medium text-[#1e4f4f] hover:underline"
        >
          Refresh ↻
        </button>
      </div>

      {/* Mission Control — 60-second summary */}
      <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <MissionStat label="Ecosystem" value={missionControl.ecosystemHealth} />
        <MissionStat label="User Health" value={missionControl.userHealthScore} />
        <MissionStat label="Retention" value={missionControl.retentionHealth} />
        <MissionStat
          label="Actionable"
          value={alerts.totalActionable}
          suffix=""
          isCount
        />
        <MissionStat
          label="Critical"
          value={alerts.critical.length}
          suffix=""
          isCount
          alert={alerts.critical.length > 0}
        />
        <MissionStat
          label="Misfires"
          value={missionControl.misfireCenter.misunderstandings}
          suffix=""
          isCount
        />
      </div>

      {/* Daily Brief */}
      <div className="mt-4 rounded-lg border border-[#ebe4d9] bg-white p-3">
        <button
          type="button"
          onClick={() => setBriefExpanded((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <p className="text-[10px] font-semibold uppercase text-[#1e4f4f]">
            Founder Daily Brief™
          </p>
          <span className="text-xs text-[#6b635a]">{briefExpanded ? "−" : "+"}</span>
        </button>
        {briefExpanded ? (
          <div className="mt-2 space-y-2 text-xs text-[#2d2926]">
            <p className="font-medium">{dailyBrief.greeting}</p>
            <p>
              Companion Health: <strong>{dailyBrief.companionHealthScore}/100</strong>
              {" · "}Trust: {dailyBrief.trustStatus}
              {" · "}Confidence: {dailyBrief.confidenceStatus}
              {" · "}Retention Risk: {dailyBrief.retentionRisk}
            </p>
            {dailyBrief.priorities.length > 0 ? (
              <ol className="list-decimal space-y-2 pl-4">
                {dailyBrief.priorities.map((p) => (
                  <li key={p.rank}>
                    <span className="font-medium">{p.headline}</span>
                    <p className="text-[#6b635a]">Likely cause: {p.likelyCause}</p>
                    <p>Action: {p.recommendedAction}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-[#6b635a]">No urgent priorities — ecosystem looks stable.</p>
            )}
            {dailyBrief.wins[0] ? (
              <p className="text-[#1e4f4f]">Win: {dailyBrief.wins[0]}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Companion Health */}
      <div className="mt-4">
        <SectionTitle title="Companion Health" />
        <div className="mt-2 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {companionHealth.map((card) => (
            <HealthCard key={card.label} {...card} />
          ))}
        </div>
      </div>

      {/* Top Founder Priorities */}
      {missionControl.topPriorities.length > 0 ? (
        <div className="mt-4">
          <SectionTitle title="Top Founder Priorities" subtitle="Auto-ranked by impact" />
          <ol className="mt-2 space-y-2">
            {missionControl.topPriorities.map((item, i) => (
              <li
                key={item.warning.id}
                className="rounded-lg border border-[#ebe4d9] bg-[#faf8f5] p-3 text-xs"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-[#1e4f4f]">{i + 1}.</span>
                  <SeverityBadge level={item.priority} />
                  <span className="font-semibold text-[#2d2926]">{item.copilot.problem}</span>
                </div>
                <p className="mt-1 text-[#6b635a]">
                  <span className="font-medium">Why: </span>
                  {item.copilot.likelyCause}
                </p>
                <p className="mt-1 text-[#2d2926]">
                  <span className="font-medium">Fix: </span>
                  {item.copilot.recommendation}
                </p>
                <p className="mt-1 text-[#6b635a]">
                  Confidence: {item.copilot.confidencePercent}%
                  {item.copilot.expectedImpact
                    ? ` · Impact: ${item.copilot.expectedImpact}`
                    : null}
                </p>
                <button
                  type="button"
                  onClick={() => void copyPrompt(item.warning.id)}
                  className="mt-2 font-medium text-[#1e4f4f] hover:underline"
                >
                  {copiedId === item.warning.id
                    ? "Copied Cursor prompt ✓"
                    : "Copy Cursor fix prompt →"}
                </button>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {/* Emerging Problems */}
      {missionControl.emergingRisks.length > 0 ? (
        <div className="mt-4">
          <SectionTitle title="Emerging Problems" subtitle="Trending issues — act before users complain" />
          <ul className="mt-2 space-y-2">
            {missionControl.emergingRisks.slice(0, 5).map((alert) => (
              <li
                key={alert.id}
                className="rounded-lg border border-[#ebe4d9] bg-white p-2 text-xs"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge level={alert.severity} />
                  <span className="font-semibold text-[#2d2926]">{alert.issue}</span>
                  {alert.deltaPercent != null ? (
                    <span className="text-[#a85c4a]">+{alert.deltaPercent}%</span>
                  ) : null}
                </div>
                <p className="mt-1 text-[#6b635a]">{alert.impact}</p>
                <p className="mt-1 text-[#2d2926]">{alert.recommendation}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Capability Health */}
        <div>
          <SectionTitle title="Capability Health" />
          {missionControl.capabilityHealth.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs">
              {missionControl.capabilityHealth.slice(0, 6).map((cap) => (
                <li
                  key={cap.id}
                  className={`flex justify-between rounded px-2 py-1 ${
                    cap.performance === "top"
                      ? "bg-[#1e4f4f]/10"
                      : cap.performance === "weak"
                        ? "bg-[#a85c4a]/10"
                        : ""
                  }`}
                >
                  <span className="font-medium text-[#2d2926]">{cap.label}</span>
                  <span className="text-[#6b635a]">
                    {cap.completionRate}% done · {cap.abandonmentRate}% abandon
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-[#6b635a]">No capability data yet.</p>
          )}
        </div>

        {/* Friction Heatmap */}
        <div>
          <SectionTitle title="User Friction Heatmap" />
          {missionControl.frictionHeatmap.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {missionControl.frictionHeatmap.map((f) => (
                <li key={f.source} className="text-xs">
                  <div className="flex justify-between">
                    <span className="font-medium text-[#2d2926]">{f.source}</span>
                    <span className="text-[#6b635a]">{f.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-[#ebe4d9]">
                    <div
                      className="h-1.5 rounded-full bg-[#a85c4a]"
                      style={{ width: `${f.intensity}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-[#6b635a]">No friction signals in the last 14 days.</p>
          )}
        </div>
      </div>

      {/* Misfire Center */}
      <div className="mt-4 rounded-lg border border-[#ebe4d9] bg-white p-3">
        <SectionTitle title="Companion Misfire Center™" />
        <div className="mt-2 grid gap-2 sm:grid-cols-4 text-xs">
          <MisfireStat label="Corrections" value={missionControl.misfireCenter.userCorrections} />
          <MisfireStat label="Behavioral" value={missionControl.misfireCenter.behavioralSignals} />
          <MisfireStat
            label="Trust recovered"
            value={`${missionControl.misfireCenter.recoverySuccessRate}%`}
          />
          <MisfireStat
            label="Continued"
            value={`${missionControl.misfireCenter.conversationContinuedRate}%`}
          />
        </div>
        {missionControl.misfireCenter.recentCorrections.length > 0 ? (
          <ul className="mt-2 space-y-1 text-xs text-[#6b635a]">
            <li className="font-semibold text-[#2d2926]">Recent corrections</li>
            {missionControl.misfireCenter.recentCorrections.map((phrase, i) => (
              <li key={i} className="italic">
                &ldquo;{phrase}&rdquo;
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* Trust-Safe User Communication (founder view) */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[#ebe4d9] bg-white p-3">
          <SectionTitle
            title="Recently Improved™"
            subtitle="User-facing — benefits only, no bugs or internals"
          />
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[#2d2926]">
            {missionControl.recentlyImproved.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-[#ebe4d9] bg-white p-3">
          <SectionTitle title="What's New™" subtitle="Translated for user trust" />
          <ul className="mt-2 space-y-2 text-xs text-[#2d2926]">
            {missionControl.whatsNew.items.slice(0, 3).map((item) => (
              <li key={item.area}>{item.benefit}</li>
            ))}
          </ul>
        </div>
      </div>

      {missionControl.priorityCommunication.some(
        (p) => p.communication.category === "internal_only",
      ) ? (
        <p className="mt-3 text-[10px] text-[#6b635a]">
          Trust-Safe rule: {missionControl.priorityCommunication.filter((p) => p.communication.category === "internal_only").length}{" "}
          detected issue(s) are internal-only — fix via Cursor, do not expose diagnostics to users.
        </p>
      ) : null}

      <p className="mt-3 text-[10px] text-[#6b635a]">
        Situation Atlas™: {missionControl.situationAtlas.totalEntries} situations mapped
        {missionControl.situationReviewQueue.pending.length > 0
          ? ` · ${missionControl.situationReviewQueue.pending.length} candidate(s) awaiting founder review`
          : ""}
        {missionControl.strategyIntelligence.mostViewed.length > 0
          ? ` · Top strategy: ${missionControl.strategyIntelligence.mostViewed[0]?.title}`
          : ""}
      </p>

      {missionControl.canWait.length > 0 ? (
        <p className="mt-3 text-[10px] text-[#6b635a]">
          Can wait: {missionControl.canWait.slice(0, 3).join(" · ")}
        </p>
      ) : null}
    </section>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h3 className="text-[10px] font-bold uppercase tracking-wide text-[#1e4f4f]">{title}</h3>
      {subtitle ? <p className="text-[10px] text-[#6b635a]">{subtitle}</p> : null}
    </div>
  );
}

function MissionStat({
  label,
  value,
  suffix = "/100",
  isCount,
  alert,
}: {
  label: string;
  value: number;
  suffix?: string;
  isCount?: boolean;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-2 ${alert ? "border-[#a85c4a]/40 bg-[#a85c4a]/5" : "border-[#ebe4d9] bg-white"}`}
    >
      <p className="text-[10px] font-semibold uppercase text-[#6b635a]">{label}</p>
      <p className={`mt-0.5 text-lg font-semibold ${alert ? "text-[#a85c4a]" : "text-[#1e4f4f]"}`}>
        {value}
        {!isCount ? suffix : null}
      </p>
    </div>
  );
}

function HealthCard({
  label,
  score,
  trend,
  riskLevel,
}: {
  label: string;
  score: number;
  trend: HealthTrend;
  riskLevel: "low" | "medium" | "high";
}) {
  const riskColor =
    riskLevel === "high"
      ? "text-[#a85c4a]"
      : riskLevel === "medium"
        ? "text-[#7a5c00]"
        : "text-[#1e4f4f]";
  return (
    <div className="rounded-lg border border-[#ebe4d9] bg-white p-2">
      <p className="text-[10px] font-semibold uppercase text-[#6b635a]">{label}</p>
      <p className={`mt-0.5 text-lg font-semibold ${riskColor}`}>{score}</p>
      <p className="text-[10px] text-[#6b635a]">
        {trend} · {riskLevel} risk
      </p>
    </div>
  );
}

function SeverityBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    critical: "bg-[#a85c4a] text-white",
    high: "bg-[#c47a3a] text-white",
    medium: "bg-[#7a5c00] text-white",
    low: "bg-[#6b635a] text-white",
    emerging: "bg-[#7a5c00] text-white",
  };
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${colors[level] ?? colors.medium}`}
    >
      {level}
    </span>
  );
}

function MisfireStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded border border-[#ebe4d9] bg-[#faf8f5] p-2 text-center">
      <p className="text-[10px] text-[#6b635a]">{label}</p>
      <p className="font-semibold text-[#2d2926]">{value}</p>
    </div>
  );
}
