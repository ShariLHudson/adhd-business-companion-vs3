/** Sideways S-curve wrought iron — repeats along the sign hanger bar. */
export function SignpostArmRailingSvg({ idPrefix }: { idPrefix: string }) {
  const iron = `${idPrefix}-iron`;
  const patternId = `${idPrefix}-pattern`;

  return (
    <svg
      className="homestead-signpost__arm-railing"
      viewBox="0 0 100 16"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={iron} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#1a1816" />
          <stop offset="45%" stopColor="#68625a" />
          <stop offset="100%" stopColor="#1a1816" />
        </linearGradient>
        <pattern
          id={patternId}
          width="32"
          height="16"
          patternUnits="userSpaceOnUse"
          viewBox="0 0 32 16"
        >
          {/* Sideways S — one lobe up, one lobe down, anchored on the bar */}
          <path
            d="M 0,13.5 C 0,6 10,4 16,10 C 22,16 32,16 32,13.5"
            fill="none"
            stroke={`url(#${iron})`}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </pattern>
      </defs>
      <rect width="100%" height="16" fill={`url(#${patternId})`} />
    </svg>
  );
}
