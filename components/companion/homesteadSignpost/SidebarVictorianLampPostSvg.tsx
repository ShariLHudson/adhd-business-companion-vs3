/**
 * Victorian cast-iron lamppost — matches public/images/lamp-post.svg.
 * Arm omitted; homestead-signpost__arm renders the horizontal hanger rod.
 */
export function SidebarVictorianLampPostSvg({ idPrefix }: { idPrefix: string }) {
  const iron = `${idPrefix}-lp-iron`;
  const collar = `${idPrefix}-lp-collar`;
  const brass = `${idPrefix}-lp-brass`;
  const glow = `${idPrefix}-lp-glow`;
  const bloom = `${idPrefix}-lp-bloom`;

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
        <radialGradient id={bloom} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd060" stopOpacity="0.7" />
          <stop offset="55%" stopColor="#ff8820" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ff5500" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="40" cy="68" rx="28" ry="26" fill={`url(#${bloom})`}>
        <animate
          attributeName="opacity"
          values="0.6;1;0.7;1;0.6"
          dur="3.5s"
          repeatCount="indefinite"
        />
      </ellipse>

      <polygon points="40,8 14,40 66,40" fill={`url(#${iron})`} />
      <rect x="13" y="39" width="54" height="3.5" fill={`url(#${collar})`} rx="1" />
      <circle cx="40" cy="6" r="4.5" fill={`url(#${brass})`} />
      <rect x="38" y="6" width="4" height="10" fill={`url(#${brass})`} rx="1" />

      <rect x="12" y="42" width="6" height="56" fill={`url(#${iron})`} rx="1.5" />
      <rect x="62" y="42" width="6" height="56" fill={`url(#${iron})`} rx="1.5" />
      <rect x="18" y="42" width="44" height="56" fill={`url(#${glow})`}>
        <animate
          attributeName="opacity"
          values="0.9;1;0.85;1;0.92;0.88;1"
          dur="2.2s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="38" y="42" width="4" height="56" fill="#2e2820" opacity="0.8" />
      <rect x="12" y="68" width="56" height="4" fill={`url(#${iron})`} rx="0.5" />

      <rect x="10" y="97" width="60" height="8" fill={`url(#${collar})`} rx="2.5" />
      <rect x="13" y="104" width="54" height="4" fill={`url(#${brass})`} rx="1" />

      {/* Bracket collar where the horizontal hanger rod meets the post */}
      <rect x="34" y="108" width="12" height="20" fill={`url(#${iron})`} rx="2" />
      <rect x="31" y="122" width="18" height="7" fill={`url(#${collar})`} rx="2" />

      <path d="M32,128 L28,775 L52,775 L48,128 Z" fill={`url(#${iron})`} />

      <rect x="25" y="200" width="30" height="12" fill={`url(#${collar})`} rx="2.5" />
      <rect x="25" y="310" width="30" height="12" fill={`url(#${collar})`} rx="2.5" />
      <rect x="25" y="420" width="30" height="12" fill={`url(#${collar})`} rx="2.5" />
      <rect x="25" y="530" width="30" height="12" fill={`url(#${collar})`} rx="2.5" />
      <rect x="25" y="635" width="30" height="12" fill={`url(#${collar})`} rx="2.5" />
      <rect x="27" y="255" width="26" height="6" fill={`url(#${collar})`} rx="1.5" opacity="0.65" />
      <rect x="27" y="365" width="26" height="6" fill={`url(#${collar})`} rx="1.5" opacity="0.65" />
      <rect x="27" y="475" width="26" height="6" fill={`url(#${collar})`} rx="1.5" opacity="0.65" />
      <rect x="27" y="583" width="26" height="6" fill={`url(#${collar})`} rx="1.5" opacity="0.65" />

      <path d="M28,775 L20,800 L60,800 L52,775 Z" fill={`url(#${iron})`} />
      <rect x="18" y="798" width="44" height="9" fill={`url(#${collar})`} rx="2.5" />
      <rect x="14" y="806" width="52" height="6" fill={`url(#${iron})`} rx="1.5" />
      <rect x="10" y="811" width="60" height="5" fill={`url(#${collar})`} rx="1" />
    </svg>
  );
}
