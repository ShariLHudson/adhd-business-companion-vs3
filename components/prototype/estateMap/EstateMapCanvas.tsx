"use client";

import { useCallback, useEffect, useState } from "react";
import { ESTATE_LOCATIONS, REGION_LABELS } from "./estateMapData";
import type { EstateLocation } from "./types";

type EstateMapCanvasProps = {
  onSelect: (location: EstateLocation) => void;
  headingMessage: string | null;
};

export function EstateMapCanvas({ onSelect, headingMessage }: EstateMapCanvasProps) {
  const [hovered, setHovered] = useState<EstateLocation | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  const active = hovered ?? ESTATE_LOCATIONS.find((l) => l.id === focused) ?? null;

  return (
    <div className="em-canvas">
      <svg
        className="em-canvas__svg"
        viewBox="0 0 100 100"
        role="img"
        aria-label="Spark Estate map"
      >
        <defs>
          <linearGradient id="em-grass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8faa8a" />
            <stop offset="100%" stopColor="#6d8f6e" />
          </linearGradient>
          <linearGradient id="em-path" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d4c4a8" />
            <stop offset="100%" stopColor="#c9b896" />
          </linearGradient>
          <linearGradient id="em-water" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a8c4c8" />
            <stop offset="100%" stopColor="#7aa0a8" />
          </linearGradient>
          <filter id="em-soft">
            <feGaussianBlur stdDeviation="0.3" />
          </filter>
        </defs>

        {/* Estate grounds */}
        <ellipse cx="50" cy="52" rx="46" ry="40" fill="url(#em-grass)" opacity="0.85" />
        <ellipse cx="50" cy="50" rx="38" ry="32" fill="#9ab89a" opacity="0.35" />

        {/* Paths */}
        <path
          d="M 50 48 Q 35 55 22 62 Q 18 44 24 36"
          fill="none"
          stroke="url(#em-path)"
          strokeWidth="1.2"
          opacity="0.7"
        />
        <path
          d="M 50 48 Q 62 58 72 42 Q 78 52 68 58"
          fill="none"
          stroke="url(#em-path)"
          strokeWidth="1.1"
          opacity="0.65"
        />
        <path
          d="M 50 48 Q 48 30 50 22 Q 58 18 72 18"
          fill="none"
          stroke="url(#em-path)"
          strokeWidth="1"
          opacity="0.6"
        />

        {/* Pond / east water */}
        <ellipse cx="76" cy="54" rx="6" ry="4" fill="url(#em-water)" opacity="0.75" />

        {/* Southwest — stables & white fencing */}
        <rect x="16" y="58" width="10" height="6" rx="0.5" fill="#b8a088" opacity="0.8" />
        <path
          d="M 14 64 L 28 64 L 28 65 L 14 65 Z M 16 64 L 16 66 M 20 64 L 20 66 M 24 64 L 24 66"
          stroke="#f5f0e6"
          strokeWidth="0.35"
          fill="none"
          opacity="0.9"
        />
        <ellipse cx="20" cy="68" rx="1.2" ry="0.8" fill="#e8e0d4" opacity="0.9" />
        <ellipse cx="24" cy="69" rx="1.2" ry="0.8" fill="#f0ebe3" opacity="0.9" />

        {/* Orchard dots */}
        <g opacity="0.7">
          {[44, 48, 52, 56, 60].map((x) => (
            <circle key={x} cx={x} cy="74" r="1.1" fill="#7a9a62" />
          ))}
        </g>

        {/* Observatory hill */}
        <ellipse cx="74" cy="20" rx="8" ry="4" fill="#8a9a82" opacity="0.5" />
        <circle cx="74" cy="17" r="1.8" fill="#c9b896" opacity="0.85" />

        {/* Mountain cabin area */}
        <path d="M 10 24 L 14 20 L 18 24 Z" fill="#a89078" opacity="0.75" />

        {/* Region labels */}
        {REGION_LABELS.map((region) => (
          <text
            key={region.id}
            x={region.x}
            y={region.y}
            className="em-canvas__region-label"
            textAnchor="middle"
          >
            {region.label}
          </text>
        ))}

        {/* Welcome House — center */}
        <rect x="47" y="45" width="6" height="5" rx="0.4" fill="#d4c8b4" opacity="0.9" />
        <polygon points="47,45 50,42 53,45" fill="#c4b4a0" opacity="0.9" />
      </svg>

      {/* Clickable location zones */}
      {ESTATE_LOCATIONS.map((location) => (
        <button
          key={location.id}
          type="button"
          className={`em-location${location.youAreHere ? " em-location--here" : ""}`}
          style={{ left: `${location.x}%`, top: `${location.y}%` }}
          aria-label={`${location.name}. ${location.tagline}`}
          onClick={() => onSelect(location)}
          onMouseEnter={() => setHovered(location)}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setFocused(location.id)}
          onBlur={() => setFocused(null)}
        >
          <span className="em-location__dot" aria-hidden />
          {location.youAreHere && (
            <span className="em-location__here-label">You are here</span>
          )}
        </button>
      ))}

      {active && (
        <div
          className="em-tooltip"
          style={{ left: `${active.x}%`, top: `${active.y - 8}%` }}
          role="tooltip"
        >
          <span className="em-tooltip__name">{active.name}</span>
          <span className="em-tooltip__tagline">{active.tagline}</span>
        </div>
      )}

      {headingMessage && (
        <p className="em-heading-toast" role="status">
          {headingMessage}
        </p>
      )}
    </div>
  );
}
