"use client";

type Props = {
  className?: string;
  glowing?: boolean;
};

/**
 * Antique gold Estate library key — SVG, refined metallic, Spark leaf motif.
 */
export function EvidenceVaultKey({ className, glowing = false }: Props) {
  return (
    <svg
      className={[
        "evidence-vault-key",
        glowing ? "evidence-vault-key--glowing" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      viewBox="0 0 64 160"
      width="64"
      height="160"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="ev-key-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0d9a8" />
          <stop offset="38%" stopColor="#c9a46b" />
          <stop offset="72%" stopColor="#9a7340" />
          <stop offset="100%" stopColor="#d4b57a" />
        </linearGradient>
        <linearGradient id="ev-key-shine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,248,230,0.55)" />
          <stop offset="100%" stopColor="rgba(255,248,230,0)" />
        </linearGradient>
        <filter id="ev-key-soft" x="-40%" y="-20%" width="180%" height="140%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="1.4"
            floodColor="#5a3d18"
            floodOpacity="0.35"
          />
        </filter>
      </defs>

      <g filter="url(#ev-key-soft)">
        {/* Bow — ornate oval with Spark leaf */}
        <ellipse
          cx="32"
          cy="28"
          rx="18"
          ry="22"
          fill="none"
          stroke="url(#ev-key-gold)"
          strokeWidth="5"
        />
        <ellipse
          cx="32"
          cy="28"
          rx="10"
          ry="13"
          fill="none"
          stroke="url(#ev-key-gold)"
          strokeWidth="2.2"
          opacity="0.85"
        />
        <path
          d="M32 18 C34 22 36 24 32 30 C28 24 30 22 32 18 Z"
          fill="url(#ev-key-gold)"
          opacity="0.95"
        />
        <circle cx="32" cy="34" r="2.2" fill="#8a6234" opacity="0.55" />

        {/* Collar */}
        <rect
          x="24"
          y="48"
          width="16"
          height="10"
          rx="2"
          fill="url(#ev-key-gold)"
        />
        <rect
          x="22"
          y="52"
          width="20"
          height="3"
          rx="1"
          fill="#8a6234"
          opacity="0.35"
        />

        {/* Shaft */}
        <rect
          x="28.5"
          y="58"
          width="7"
          height="72"
          rx="2"
          fill="url(#ev-key-gold)"
        />
        <rect
          x="29.5"
          y="60"
          width="2"
          height="68"
          fill="url(#ev-key-shine)"
          opacity="0.7"
        />

        {/* Bit / teeth */}
        <path
          d="M35.5 118 H48 V126 H42 V132 H48 V140 H35.5 Z"
          fill="url(#ev-key-gold)"
        />
        <path
          d="M35.5 128 H40 V136 H35.5 Z"
          fill="#8a6234"
          opacity="0.28"
        />
      </g>
    </svg>
  );
}
