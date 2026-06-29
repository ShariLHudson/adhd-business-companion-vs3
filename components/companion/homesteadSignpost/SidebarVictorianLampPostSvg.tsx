/**
 * Victorian cast-iron lamppost — matches public/images/lamp-post reference art.
 * Arm omitted; homestead-signpost__arm renders the horizontal hanger rod.
 */
export function SidebarVictorianLampPostSvg({ idPrefix }: { idPrefix: string }) {
  const iron = `${idPrefix}-lp-iron`;
  const collar = `${idPrefix}-lp-collar`;
  const brass = `${idPrefix}-lp-brass`;
  const glow = `${idPrefix}-lp-glow`;
  const glass = `${idPrefix}-lp-glass`;
  const shaft = `${idPrefix}-lp-shaft`;

  const shaftLeft = 26;
  const shaftRight = 54;

  return (
    <svg
      className="homestead-signpost__pole-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 820"
      preserveAspectRatio="xMidYMin meet"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={iron} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#080706" />
          <stop offset="15%" stopColor="#1c1a17" />
          <stop offset="40%" stopColor="#3a3530" />
          <stop offset="50%" stopColor="#58524a" />
          <stop offset="60%" stopColor="#3a3530" />
          <stop offset="85%" stopColor="#1c1a17" />
          <stop offset="100%" stopColor="#080706" />
        </linearGradient>
        <linearGradient id={collar} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#0e0c0a" />
          <stop offset="28%" stopColor="#484038" />
          <stop offset="50%" stopColor="#6a5e52" />
          <stop offset="72%" stopColor="#484038" />
          <stop offset="100%" stopColor="#0e0c0a" />
        </linearGradient>
        <linearGradient id={brass} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#2a1e08" />
          <stop offset="38%" stopColor="#7a6228" />
          <stop offset="52%" stopColor="#9a7e38" />
          <stop offset="100%" stopColor="#2a1e08" />
        </linearGradient>
        <radialGradient id={glow} cx="50%" cy="52%" r="50%">
          <stop offset="0%" stopColor="#fffce0" stopOpacity="1" />
          <stop offset="22%" stopColor="#ffe080" stopOpacity="0.97" />
          <stop offset="55%" stopColor="#ff9820" stopOpacity="0.82" />
          <stop offset="85%" stopColor="#c05010" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7a2800" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={glass} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#fffef8" stopOpacity="0.12" />
          <stop offset="50%" stopColor="#fff8e8" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#fffef8" stopOpacity="0.14" />
        </linearGradient>
        <linearGradient id={shaft} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#141210" />
          <stop offset="22%" stopColor="#3a3530" />
          <stop offset="48%" stopColor="#68625a" />
          <stop offset="52%" stopColor="#68625a" />
          <stop offset="78%" stopColor="#3a3530" />
          <stop offset="100%" stopColor="#141210" />
        </linearGradient>
      </defs>

      {/* Pole — uniform shaft, lantern seat, Victorian base */}
      <g className="homestead-lamppost__pole">
        {/* Uniform fluted shaft */}
        <rect
          x={shaftLeft}
          y={132}
          width={shaftRight - shaftLeft}
          height={626}
          fill={`url(#${shaft})`}
        />
        <path
          d={`M${shaftLeft + 4},145 L${shaftLeft + 4},748 M40,140 L40,752 M${shaftRight - 4},145 L${shaftRight - 4},748`}
          stroke="#141210"
          strokeWidth="0.65"
          opacity="0.42"
        />

        {/* Ornate collar bands */}
        {[198, 308, 418, 528, 633].map((y) => (
          <g key={y}>
            <path
              d={`M${shaftLeft - 3},${y} Q40,${y + 6} ${shaftRight + 3},${y} L${shaftRight + 3},${y + 10} Q40,${y + 14} ${shaftLeft - 3},${y + 10} Z`}
              fill={`url(#${collar})`}
            />
            <path
              d={`M${shaftLeft - 1},${y + 7} Q40,${y + 11} ${shaftRight + 1},${y + 7}`}
              stroke={`url(#${brass})`}
              strokeWidth="0.8"
              fill="none"
              opacity="0.65"
            />
            <path
              d={`M${shaftLeft - 3},${y + 4} Q${shaftLeft - 7},${y + 1} ${shaftLeft - 4},${y - 2}`}
              stroke="#5a5248"
              strokeWidth="1.1"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d={`M${shaftRight + 3},${y + 4} Q${shaftRight + 7},${y + 1} ${shaftRight + 4},${y - 2}`}
              stroke="#5a5248"
              strokeWidth="1.1"
              fill="none"
              strokeLinecap="round"
            />
            <rect
              x={shaftLeft + 1}
              y={y + 28}
              width={shaftRight - shaftLeft - 2}
              height="5"
              fill={`url(#${collar})`}
              rx="1.5"
              opacity="0.55"
            />
          </g>
        ))}

        {/* Victorian pedestal base */}
        <path
          d={`M${shaftLeft},758 L${shaftLeft - 4},768 Q40,774 ${shaftRight + 4},768 L${shaftRight},758 Z`}
          fill={`url(#${iron})`}
        />
        <ellipse cx="40" cy="758" rx="16" ry="2.8" fill={`url(#${brass})`} opacity="0.55" />
        <path
          d="M14,768 L10,786 Q40,794 70,786 L66,768 Z"
          fill={`url(#${collar})`}
        />
        <path
          d="M18,772 L18,782 M40,770 L40,784 M62,772 L62,782"
          stroke={`url(#${brass})`}
          strokeWidth="0.7"
          opacity="0.45"
        />
        <path
          d="M14,784 Q18,790 22,784 Q26,790 30,784 Q34,790 38,784 Q42,790 46,784 Q50,790 54,784 Q58,790 62,784 Q66,790 70,784"
          stroke={`url(#${brass})`}
          strokeWidth="0.9"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M8,786 Q12,804 18,786 Q24,804 30,786 Q36,804 42,786 Q48,804 54,786 Q60,804 66,786 Q72,804 76,786 L76,798 L8,798 Z"
          fill={`url(#${iron})`}
        />
        <rect x="6" y="796" width="68" height="6" fill={`url(#${collar})`} rx="1.5" />
        <path
          d="M10,800 Q6,810 10,816 M12,816 L16,816"
          stroke="#4a4238"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M70,800 Q74,810 70,816 M68,816 L64,816"
          stroke="#4a4238"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse cx="12" cy="816" rx="5" ry="2.4" fill={`url(#${iron})`} />
        <ellipse cx="68" cy="816" rx="5" ry="2.4" fill={`url(#${iron})`} />
        <rect x="4" y="814" width="72" height="5" fill={`url(#${collar})`} rx="1" />
        <path
          d="M8,817 Q40,821 72,817"
          stroke={`url(#${brass})`}
          strokeWidth="0.8"
          fill="none"
          opacity="0.55"
        />

        {/* Lantern seat — wide cap same visual weight as shaft, cradles the housing */}
        <path
          d={`M${shaftLeft},132 L${shaftLeft - 2},124 L14,114 Q40,104 66,114 L${shaftRight + 2},124 L${shaftRight},132 Z`}
          fill={`url(#${iron})`}
        />
        <rect x="12" y="110" width="56" height="7" fill={`url(#${collar})`} rx="2" />
        <ellipse cx="40" cy="112" rx="30" ry="4.2" fill={`url(#${brass})`} opacity="0.72" />
        <path
          d="M16,114 Q20,110 24,114 Q28,110 32,114 Q36,110 40,114 Q44,110 48,114 Q52,110 56,114 Q60,110 64,114"
          stroke={`url(#${brass})`}
          strokeWidth="1"
          fill="none"
          opacity="0.8"
        />
        <rect x="20" y="118" width="40" height="8" fill={`url(#${collar})`} rx="2" />
        <path
          d={`M20,124 Q40,130 60,124 L${shaftRight},132 L${shaftLeft},132 Z`}
          fill={`url(#${shaft})`}
        />

        {/* Sign-arm bracket */}
        <rect x="33" y="122" width="14" height="16" fill={`url(#${iron})`} rx="2" />
        <path
          d="M47,124 C58,122 66,128 68,136 C70,144 64,150 56,148"
          stroke="#4a4238"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M47,136 C52,140 58,139 64,134"
          stroke="#36302a"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="47" cy="136" r="3.8" fill={`url(#${collar})`} />
        <rect x="30" y="134" width="20" height="7" fill={`url(#${collar})`} rx="2" />
        <path
          d="M30,137 Q40,143 50,137"
          stroke={`url(#${brass})`}
          strokeWidth="0.9"
          fill="none"
          opacity="0.75"
        />
      </g>

      {/* Lantern — seated on the cap, no overscale */}
      <g className="homestead-lamppost__lantern-head">
        <circle cx="40" cy="4.5" r="3.2" fill={`url(#${brass})`} />
        <path d="M40,0.5 L42,9 L38,9 Z" fill={`url(#${brass})`} />
        <rect x="38.5" y="5" width="3" height="11" fill={`url(#${brass})`} rx="0.6" />

        <polygon points="40,9 10,43 70,43" fill={`url(#${iron})`} />
        <polygon points="40,13 19,41 61,41" fill={`url(#${collar})`} opacity="0.32" />
        <rect x="9" y="41" width="62" height="3.5" fill={`url(#${collar})`} rx="0.8" />
        <rect x="11" y="44" width="58" height="2" fill={`url(#${brass})`} opacity="0.75" rx="0.5" />

        <ellipse cx="40" cy="47.5" rx="27" ry="3.2" fill={`url(#${iron})`} />
        <path
          d="M15,47.5 Q19,43.5 23,47.5 Q27,43.5 31,47.5 Q35,43.5 39,47.5 Q43,43.5 47,47.5 Q51,43.5 55,47.5 Q59,43.5 63,47.5 Q67,43.5 71,47.5"
          stroke={`url(#${brass})`}
          strokeWidth="1.3"
          fill="none"
          opacity="0.9"
        />

        <rect x="9" y="47" width="7" height="56" fill={`url(#${iron})`} rx="2" />
        <rect x="64" y="47" width="7" height="56" fill={`url(#${iron})`} rx="2" />
        <rect x="8" y="45" width="9" height="5.5" fill={`url(#${collar})`} rx="1.5" />
        <rect x="63" y="45" width="9" height="5.5" fill={`url(#${collar})`} rx="1.5" />
        <path
          d="M9,49 Q5.5,44 9,39"
          stroke="#5a5248"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M71,49 Q74.5,44 71,39"
          stroke="#5a5248"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="10" y="62" width="5" height="3" fill={`url(#${brass})`} opacity="0.55" rx="0.5" />
        <rect x="65" y="62" width="5" height="3" fill={`url(#${brass})`} opacity="0.55" rx="0.5" />

        <rect
          className="homestead-lamppost__lantern-flame"
          x="16"
          y="47"
          width="48"
          height="56"
          fill={`url(#${glow})`}
        />

        <path
          d="M16,55 Q16,47 28,47 L52,47 Q64,47 64,55"
          stroke={`url(#${glass})`}
          strokeWidth="1.4"
          fill="none"
        />
        <rect x="28" y="47" width="2" height="56" fill="#2e2820" opacity="0.55" />
        <rect x="39" y="47" width="2.5" height="56" fill="#2e2820" opacity="0.82" />
        <rect x="50" y="47" width="2" height="56" fill="#2e2820" opacity="0.55" />
        <rect x="16" y="75" width="48" height="1.5" fill="#2e2820" opacity="0.42" />

        <rect x="9" y="73" width="62" height="4.5" fill={`url(#${iron})`} rx="0.6" />

        <path
          d="M10,100 Q16,107 22,100 Q28,107 34,100 Q40,107 46,100 Q52,107 58,100 Q64,107 70,100 L70,105 L10,105 Z"
          fill={`url(#${collar})`}
        />
        <rect x="10" y="104" width="60" height="4.5" fill={`url(#${brass})`} rx="1" opacity="0.88" />
        {/* Seat lip — overlaps mount so lantern reads bolted on */}
        <rect x="14" y="108" width="52" height="5" fill={`url(#${iron})`} rx="1.2" />
        <ellipse cx="40" cy="110" rx="28" ry="2.2" fill={`url(#${brass})`} opacity="0.5" />
      </g>
    </svg>
  );
}
