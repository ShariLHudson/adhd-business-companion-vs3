"use client";

import type { VisualFocusVisualLayout } from "@/lib/visualFocus/types";
import { BusinessCanvasVisualGrid } from "./BusinessCanvasVisualGrid";

function VisualEdge({
  from,
  to,
  label,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  label?: string;
}) {
  const x1 = from.x;
  const y1 = from.y + 4;
  const x2 = to.x;
  const y2 = to.y - 4;
  return (
    <g>
      <line
        x1={`${x1}%`}
        y1={`${y1}%`}
        x2={`${x2}%`}
        y2={`${y2}%`}
        stroke="#1e4f4f"
        strokeWidth="2"
        strokeOpacity="0.35"
        markerEnd="url(#vf-arrow)"
      />
      {label ? (
        <text
          x={`${(x1 + x2) / 2}%`}
          y={`${(y1 + y2) / 2}%`}
          fill="#6b635a"
          fontSize="10"
          textAnchor="middle"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

export function VisualFocusVisualCanvas({
  layout,
  centerTitle,
}: {
  layout: VisualFocusVisualLayout;
  centerTitle?: string;
}) {
  if (layout.layoutKind === "business-canvas-grid") {
    return (
      <BusinessCanvasVisualGrid
        layout={layout}
        centerTitle={centerTitle ?? "Business Canvas"}
      />
    );
  }

  const nodeById = new Map(layout.nodes.map((n) => [n.id, n]));

  return (
    <div
      className="relative min-h-[320px] flex-1 overflow-auto rounded-2xl border border-[#e7dfd4] bg-white p-4"
      data-testid="visual-focus-canvas"
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <marker
            id="vf-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 Z" fill="#1e4f4f" fillOpacity="0.45" />
          </marker>
        </defs>
        {layout.edges.map((edge) => {
          const from = nodeById.get(edge.fromId);
          const to = nodeById.get(edge.toId);
          if (!from || !to) return null;
          return (
            <VisualEdge
              key={`${edge.fromId}-${edge.toId}`}
              from={from}
              to={to}
              label={edge.label}
            />
          );
        })}
      </svg>

      <div className="relative min-h-[300px]">
        {layout.nodes.map((node) => (
          <div
            key={node.id}
            className="absolute max-w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 bg-white px-4 py-3 shadow-sm"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              borderColor: node.color ?? "#1e4f4f",
            }}
            data-testid={`visual-focus-node-${node.id}`}
          >
            <p className="text-sm font-semibold leading-snug text-[#1f1c19]">
              {node.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
