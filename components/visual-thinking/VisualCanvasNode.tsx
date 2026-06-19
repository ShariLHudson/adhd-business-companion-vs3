"use client";

import { useState } from "react";
import {
  VISUAL_THINKING_COLORS,
  type VisualThinkingTone,
} from "@/lib/visualThinkingColors";
import type { VisualThinkingNode } from "@/lib/visualThinkingEngine";

export function VisualCanvasNode({
  node,
  size = "md",
  className = "",
}: {
  node: VisualThinkingNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const palette = VISUAL_THINKING_COLORS[node.tone];
  const isLarge = size === "lg";
  const isDecision = node.kind === "decision";
  const isOption = node.kind === "option";
  const isRec = node.kind === "recommendation";

  const padding = isLarge ? "px-6 py-5" : isDecision ? "px-5 py-4" : "px-4 py-3";
  const titleSize = isLarge
    ? "text-lg sm:text-xl"
    : isDecision
      ? "text-base sm:text-lg"
      : "text-sm sm:text-base";

  return (
    <div
      className={`visual-canvas-node companion-fade-in relative ${className}`}
      style={{
        background: palette.bgGradient,
        borderColor: palette.border,
        boxShadow: node.recommended
          ? `${palette.shadow}, 0 0 0 3px rgba(252, 211, 77, 0.65)`
          : palette.shadow,
      }}
      data-testid={`canvas-node-${node.id}`}
    >
      <div
        className={`rounded-3xl border-2 ${padding} ${
          isDecision ? "rounded-full text-center" : "rounded-2xl"
        } ${node.recommended ? "ring-2 ring-amber-300 ring-offset-2" : ""}`}
      >
        <div className="flex items-start gap-2">
          <span
            className={`shrink-0 ${isLarge ? "text-2xl" : "text-lg"}`}
            aria-hidden
          >
            {node.icon}
          </span>
          <div className="min-w-0 flex-1">
            {!isOption && !isDecision ? (
              <p className="text-xs font-bold uppercase tracking-wide opacity-70">
                {node.title}
              </p>
            ) : null}
            <p
              className={`font-semibold leading-snug ${titleSize}`}
              style={{ color: palette.text }}
            >
              {isOption || isDecision || isRec ? (
                <>
                  <span className="sr-only">{node.title}</span>
                  <span aria-hidden>{isOption ? node.icon : ""} </span>
                  {node.title}
                </>
              ) : (
                node.title
              )}
            </p>
            {node.items.length > 0 ? (
              <ul className="mt-2 space-y-1.5">
                {node.items.map((item, i) => (
                  <li
                    key={i}
                    className="text-sm leading-snug opacity-90"
                    style={{ color: palette.text }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
            {node.moreCount > 0 ? (
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="mt-2 text-xs font-semibold underline opacity-80"
                style={{ color: palette.text }}
              >
                {expanded ? "Less" : `+${node.moreCount} more`}
              </button>
            ) : null}
          </div>
        </div>
      </div>
      {node.recommended ? (
        <span className="absolute -top-2 -right-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950 shadow">
          ⭐
        </span>
      ) : null}
    </div>
  );
}

export function VisualConnector({
  tone,
  className = "",
}: {
  tone: VisualThinkingTone;
  className?: string;
}) {
  const color = VISUAL_THINKING_COLORS[tone].connector;
  return (
    <svg
      className={`pointer-events-none ${className}`}
      aria-hidden
      fill="none"
      viewBox="0 0 120 80"
    >
      <path
        d="M 10 40 Q 60 0 110 40"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
