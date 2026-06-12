"use client";

import { useState } from "react";

import type { BarSeriesItem, PieSlice, TimeSeriesPoint } from "@/lib/founderWorkspace/analytics";

function Tooltip({
  x,
  y,
  text,
}: {
  x: number;
  y: number;
  text: string;
}) {
  return (
    <div
      className="pointer-events-none absolute z-10 rounded-md bg-[#1f1c19] px-2 py-1 text-[11px] text-white shadow-lg"
      style={{ left: x, top: y - 28 }}
    >
      {text}
    </div>
  );
}

export function AnalyticsLineChart({
  data,
  title,
  color = "#1e4f4f",
}: {
  data: TimeSeriesPoint[];
  title: string;
  color?: string;
}) {
  const [hover, setHover] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  if (!data.length) {
    return (
      <div className="rounded-xl border border-[#d4cdc3] bg-white p-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-4 text-sm text-[#6b635a]">No data in this period.</p>
      </div>
    );
  }

  const w = 320;
  const h = 140;
  const pad = 24;
  const max = Math.max(...data.map((d) => d.value), 1);
  const points = data.map((d, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - (d.value / max) * (h - pad * 2);
    return { x, y, d };
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <div className="relative rounded-xl border border-[#d4cdc3] bg-white p-4">
      <h3 className="text-sm font-semibold text-[#1f1c19]">{title}</h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full" role="img">
        <path d={path} fill="none" stroke={color} strokeWidth="2" />
        {points.map((p) => (
          <circle
            key={p.d.ts}
            cx={p.x}
            cy={p.y}
            r="5"
            fill={color}
            className="cursor-pointer"
            onMouseEnter={(e) =>
              setHover({
                x: e.clientX,
                y: e.clientY,
                text: `${p.d.label}: ${p.d.value}`,
              })
            }
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      {hover ? <Tooltip x={hover.x} y={hover.y} text={hover.text} /> : null}
    </div>
  );
}

export function AnalyticsBarChart({
  data,
  title,
}: {
  data: BarSeriesItem[];
  title: string;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="rounded-xl border border-[#d4cdc3] bg-white p-4">
      <h3 className="text-sm font-semibold text-[#1f1c19]">{title}</h3>
      <div className="mt-4 flex items-end gap-3" style={{ minHeight: 120 }}>
        {data.map((bar) => (
          <div
            key={bar.label}
            className="flex flex-1 flex-col items-center gap-1"
            onMouseEnter={() => setHover(`${bar.label}: ${bar.value}`)}
            onMouseLeave={() => setHover(null)}
          >
            <div
              className="w-full rounded-t-md transition-opacity"
              style={{
                height: `${Math.max(8, (bar.value / max) * 100)}px`,
                backgroundColor: bar.color ?? "#1e4f4f",
                opacity: hover?.startsWith(bar.label) ? 1 : 0.85,
              }}
              title={`${bar.label}: ${bar.value}`}
            />
            <span className="text-center text-[10px] text-[#6b635a]">
              {bar.label}
            </span>
          </div>
        ))}
      </div>
      {hover ? (
        <p className="mt-2 text-center text-xs font-medium text-[#1e4f4f]">
          {hover}
        </p>
      ) : null}
    </div>
  );
}

export function AnalyticsPieChart({
  data,
  title,
}: {
  data: PieSlice[];
  title: string;
}) {
  const [hover, setHover] = useState<PieSlice | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let angle = 0;
  const slices = data.map((slice) => {
    const portion = slice.value / total;
    const start = angle;
    angle += portion * 360;
    return { slice, start, end: angle };
  });

  function arcPath(start: number, end: number, r: number) {
    const s = (start - 90) * (Math.PI / 180);
    const e = (end - 90) * (Math.PI / 180);
    const x1 = 60 + r * Math.cos(s);
    const y1 = 60 + r * Math.sin(s);
    const x2 = 60 + r * Math.cos(e);
    const y2 = 60 + r * Math.sin(e);
    const large = end - start > 180 ? 1 : 0;
    return `M60,60 L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
  }

  if (!data.length) {
    return (
      <div className="rounded-xl border border-[#d4cdc3] bg-white p-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-4 text-sm text-[#6b635a]">No workspace opens recorded.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#d4cdc3] bg-white p-4">
      <h3 className="text-sm font-semibold text-[#1f1c19]">{title}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <svg viewBox="0 0 120 120" className="h-32 w-32">
          {slices.map(({ slice, start, end }) => (
            <path
              key={slice.label}
              d={arcPath(start, end, 50)}
              fill={slice.color}
              stroke="#fff"
              strokeWidth="1"
              className="cursor-pointer"
              onMouseEnter={() => setHover(slice)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
        </svg>
        <ul className="text-xs text-[#2d2926]">
          {data.map((d) => (
            <li key={d.label} className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              {d.label}: {d.value}
            </li>
          ))}
        </ul>
      </div>
      {hover ? (
        <p className="mt-2 text-xs font-medium text-[#1e4f4f]">
          {hover.label}: {hover.value} opens (
          {Math.round((hover.value / total) * 100)}%)
        </p>
      ) : null}
    </div>
  );
}
