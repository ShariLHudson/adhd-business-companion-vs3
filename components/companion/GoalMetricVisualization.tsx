"use client";

import { useEffect, useState } from "react";
import {
  formatMetricProgressLabel,
  metricProgressPercent,
  type OutcomeGoalSubMetric,
} from "@/lib/goals/outcomeGoals";
import {
  getGoalProgressStyle,
  type GoalProgressStyle,
} from "@/lib/goals/goalProgressStyle";

function ChangeIndicator({ label }: { label?: string }) {
  if (!label) return null;
  return (
    <p
      className="mt-0.5 text-xs tabular-nums text-[#6b635a]"
      data-testid="metric-change-indicator"
    >
      {label}
    </p>
  );
}

function useGoalProgressStyle(): GoalProgressStyle {
  const [style, setStyle] = useState<GoalProgressStyle>(() =>
    getGoalProgressStyle(),
  );
  useEffect(() => {
    const sync = () => setStyle(getGoalProgressStyle());
    window.addEventListener("companion-prefs-updated", sync);
    return () => window.removeEventListener("companion-prefs-updated", sync);
  }, []);
  return style;
}

function ProgressBarViz({
  metric,
  pct,
  label,
}: {
  metric: OutcomeGoalSubMetric;
  pct: number;
  label: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-[#6b635a]">{metric.label}</p>
        <p className="text-xs tabular-nums text-[#9a8f82]">{pct}%</p>
      </div>
      <p className="text-base font-bold tabular-nums text-[#1e4f4f]">{label}</p>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#e7dfd4]">
        <div
          className="h-full rounded-full bg-[#1e4f4f] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function RingViz({
  pct,
  label,
  metricLabel,
  donut,
}: {
  pct: number;
  label: string;
  metricLabel: string;
  donut: boolean;
}) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="flex items-center gap-3">
      <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden>
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="#e7dfd4"
          strokeWidth={donut ? 8 : 6}
        />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="#1e4f4f"
          strokeWidth={donut ? 8 : 6}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
        />
        <text
          x="36"
          y="40"
          textAnchor="middle"
          className="fill-[#1e4f4f] text-[11px] font-bold"
        >
          {pct}%
        </text>
      </svg>
      <div>
        <p className="text-xs font-semibold text-[#6b635a]">{metricLabel}</p>
        <p className="text-sm font-bold tabular-nums text-[#1e4f4f]">{label}</p>
      </div>
    </div>
  );
}

function DashboardCardViz({
  metric,
  pct,
  label,
}: {
  metric: OutcomeGoalSubMetric;
  pct: number;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/80 px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
        {metric.label}
      </p>
      <p className="mt-1 text-lg font-bold tabular-nums text-[#1e4f4f]">{label}</p>
      <p className="mt-0.5 text-xs text-[#6b635a]">{pct}% complete</p>
    </div>
  );
}

function LineGraphViz({
  metric,
  label,
}: {
  metric: OutcomeGoalSubMetric;
  label: string;
}) {
  const logs = [...metric.progressLogs].sort((a, b) =>
    a.loggedAt.localeCompare(b.loggedAt),
  );
  let running = 0;
  const points = logs.map((log, i) => {
    running = Math.max(0, running + log.amount);
    return { x: i, y: running };
  });
  if (points.length === 0) {
    points.push({ x: 0, y: metric.currentValue });
  } else if (points[points.length - 1]!.y !== metric.currentValue) {
    points.push({ x: points.length, y: metric.currentValue });
  }
  const maxY = Math.max(metric.targetValue, ...points.map((p) => p.y), 1);
  const w = 120;
  const h = 40;
  const path = points
    .map((p, i) => {
      const x = points.length <= 1 ? w / 2 : (p.x / Math.max(points.length - 1, 1)) * w;
      const y = h - (p.y / maxY) * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-[#6b635a]">{metric.label}</p>
        <p className="text-xs tabular-nums text-[#9a8f82]">
          {metricProgressPercent(metric)}%
        </p>
      </div>
      <p className="text-sm font-bold tabular-nums text-[#1e4f4f]">{label}</p>
      <svg width={w} height={h} className="mt-1" aria-hidden>
        <path d={path} fill="none" stroke="#1e4f4f" strokeWidth="2" />
      </svg>
    </div>
  );
}

export function GoalMetricVisualization({
  metric,
  style: styleOverride,
  changeLabel,
}: {
  metric: OutcomeGoalSubMetric;
  style?: GoalProgressStyle;
  changeLabel?: string;
}) {
  const prefStyle = useGoalProgressStyle();
  const style = styleOverride ?? prefStyle;
  const pct = metricProgressPercent(metric);
  const label = formatMetricProgressLabel(metric);

  switch (style) {
    case "compact-numbers":
      return (
        <div data-testid={`goal-metric-${metric.id}`}>
          <p className="text-xs font-semibold text-[#6b635a]">{metric.label}</p>
          <p className="text-base font-bold tabular-nums text-[#1e4f4f]">
            {label}
          </p>
          <ChangeIndicator label={changeLabel} />
        </div>
      );
    case "circular":
      return (
        <div data-testid={`goal-metric-${metric.id}`}>
          <RingViz
            pct={pct}
            label={label}
            metricLabel={metric.label}
            donut={false}
          />
          <ChangeIndicator label={changeLabel} />
        </div>
      );
    case "donut":
      return (
        <div data-testid={`goal-metric-${metric.id}`}>
          <RingViz
            pct={pct}
            label={label}
            metricLabel={metric.label}
            donut
          />
          <ChangeIndicator label={changeLabel} />
        </div>
      );
    case "dashboard-cards":
      return (
        <div data-testid={`goal-metric-${metric.id}`}>
          <DashboardCardViz metric={metric} pct={pct} label={label} />
          <ChangeIndicator label={changeLabel} />
        </div>
      );
    case "line-graph":
      return (
        <div data-testid={`goal-metric-${metric.id}`}>
          <LineGraphViz metric={metric} label={label} />
          <ChangeIndicator label={changeLabel} />
        </div>
      );
    case "progress-bars":
    default:
      return (
        <div data-testid={`goal-metric-${metric.id}`}>
          <ProgressBarViz metric={metric} pct={pct} label={label} />
          <ChangeIndicator label={changeLabel} />
        </div>
      );
  }
}
