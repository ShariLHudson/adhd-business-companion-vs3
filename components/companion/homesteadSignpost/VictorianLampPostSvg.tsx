/** Victorian cast-iron lamp post — sidebar signpost (viewBox 0 0 223 600). */
export function VictorianLampPostSvg({ idPrefix }: { idPrefix: string }) {
  const pgF = `${idPrefix}-pgF`;
  const bgF = `${idPrefix}-bgF`;
  const gbF = `${idPrefix}-gbF`;
  const liF = `${idPrefix}-liF`;
  const cgF = `${idPrefix}-cgF`;

  return (
    <svg
      className="homestead-signpost__pole"
      viewBox="0 0 223 600"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "223px",
        height: "600px",
        overflow: "visible",
        pointerEvents: "none",
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={pgF} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0a0a0a" />
          <stop offset="12%" stopColor="#222222" />
          <stop offset="35%" stopColor="#3c3c3c" />
          <stop offset="52%" stopColor="#484848" />
          <stop offset="68%" stopColor="#3c3c3c" />
          <stop offset="88%" stopColor="#222222" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
        <linearGradient id={bgF} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#050505" />
          <stop offset="25%" stopColor="#181818" />
          <stop offset="50%" stopColor="#252525" />
          <stop offset="75%" stopColor="#181818" />
          <stop offset="100%" stopColor="#050505" />
        </linearGradient>
        <radialGradient id={gbF} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffee66" stopOpacity="1.0" />
          <stop offset="25%" stopColor="#ffbb33" stopOpacity="0.75" />
          <stop offset="55%" stopColor="#ff7700" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ff4400" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={liF} cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#fff8e0" />
          <stop offset="35%" stopColor="#ffcc44" />
          <stop offset="100%" stopColor="#aa4400" />
        </radialGradient>
        <linearGradient id={cgF} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0e0e0e" />
          <stop offset="25%" stopColor="#383838" />
          <stop offset="50%" stopColor="#4c4c4c" />
          <stop offset="75%" stopColor="#383838" />
          <stop offset="100%" stopColor="#0e0e0e" />
        </linearGradient>
      </defs>
      <ellipse cx="121" cy="55" rx="75" ry="65" fill={`url(#${gbF})`}>
        <animate
          attributeName="opacity"
          values="0.5;0.85;0.55;0.8;0.5"
          dur="4.5s"
          repeatCount="indefinite"
        />
      </ellipse>
      <rect x="4" y="578" width="56" height="7" rx="4" fill={`url(#${bgF})`} />
      <rect x="7" y="566" width="50" height="14" rx="3" fill={`url(#${bgF})`} />
      <rect x="10" y="554" width="44" height="14" rx="3" fill="#1c1c1c" />
      <rect x="12" y="556" width="40" height="2.5" fill="#404040" opacity="0.6" />
      <polygon points="6,578 58,578 53,570 11,570" fill="#121212" />
      <rect x="9" y="458" width="46" height="96" fill={`url(#${pgF})`} />
      <rect x="10" y="295" width="44" height="165" fill={`url(#${pgF})`} />
      <rect x="11" y="153" width="42" height="144" fill={`url(#${pgF})`} />
      <rect x="12" y="105" width="40" height="50" fill={`url(#${pgF})`} />
      <rect x="13" y="68" width="38" height="39" fill={`url(#${pgF})`} />
      <rect x="26" y="70" width="8" height="490" fill="#686868" opacity="0.12" />
      <rect x="9" y="70" width="3" height="490" fill="#000000" opacity="0.35" />
      <rect x="8" y="151" width="48" height="14" rx="3.5" fill={`url(#${cgF})`} />
      <rect x="10" y="152" width="44" height="5" fill="#545454" opacity="0.5" />
      <rect x="10" y="161" width="44" height="2" fill="#181818" opacity="0.7" />
      <rect x="8" y="290" width="48" height="14" rx="3.5" fill={`url(#${cgF})`} />
      <rect x="10" y="291" width="44" height="5" fill="#545454" opacity="0.5" />
      <rect x="10" y="300" width="44" height="2" fill="#181818" opacity="0.7" />
      <rect x="8" y="432" width="48" height="14" rx="3.5" fill={`url(#${cgF})`} />
      <rect x="10" y="433" width="44" height="5" fill="#545454" opacity="0.5" />
      <rect x="10" y="442" width="44" height="2" fill="#181818" opacity="0.7" />
      <rect x="7" y="538" width="50" height="15" rx="4" fill={`url(#${cgF})`} />
      <rect x="9" y="539" width="46" height="5" fill="#545454" opacity="0.5" />
      <rect x="45" y="88" width="14" height="24" rx="4" fill="#222222" stroke="#363636" strokeWidth="2" />
      <rect x="47" y="93" width="10" height="5" rx="1.5" fill="#343434" />
      <path
        d="M 51 100 C 70 90 95 74 121 58"
        stroke="#0a0a0a"
        strokeWidth="16"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 51 100 C 70 90 95 74 121 58"
        stroke="#252525"
        strokeWidth="11"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 51 100 C 70 90 95 74 121 58"
        stroke="#404040"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M 32 112 C 21 112 16 104 19 95 C 22 87 33 86 37 93 C 40 98 36 106 29 105"
        stroke="#2e2e2e"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 32 112 C 21 112 16 104 19 95 C 22 87 33 86 37 93"
        stroke="#444444"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />
      <path
        d="M 26 130 C 55 116 82 100 112 80"
        stroke="#1a1a1a"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 26 130 C 55 116 82 100 112 80"
        stroke="#333333"
        strokeWidth="2"
        fill="none"
        opacity="0.35"
      />
      <ellipse cx="121" cy="68" rx="22" ry="20" fill="#ffcc44" opacity="0.18">
        <animate
          attributeName="opacity"
          values="0.12;0.3;0.13"
          dur="3.2s"
          repeatCount="indefinite"
        />
      </ellipse>
      <polygon
        points="104,40 138,40 131,18 111,18"
        fill="#161616"
        stroke="#2a2a2a"
        strokeWidth="2"
      />
      <line x1="121" y1="18" x2="121" y2="40" stroke="#252525" strokeWidth="1.5" />
      <line x1="112" y1="19" x2="106" y2="40" stroke="#1e1e1e" strokeWidth="1" />
      <line x1="130" y1="19" x2="136" y2="40" stroke="#1e1e1e" strokeWidth="1" />
      <rect x="119" y="8" width="4" height="11" rx="2" fill="#1e1e1e" stroke="#303030" strokeWidth="0.5" />
      <circle cx="121" cy="5" r="7.5" fill="#1c1c1c" stroke="#383838" strokeWidth="2" />
      <circle cx="118.5" cy="3" r="2.5" fill="#2e2e2e" opacity="0.8" />
      <rect x="113" y="38" width="16" height="6" rx="2" fill="#1e1e1e" stroke="#333333" strokeWidth="1" />
      <rect x="104" y="40" width="34" height="60" fill={`url(#${liF})`} opacity="0.95">
        <animate
          attributeName="opacity"
          values="0.75;1.0;0.78;0.97;0.75"
          dur="5.2s"
          repeatCount="indefinite"
        />
      </rect>
      <rect
        x="104"
        y="40"
        width="34"
        height="60"
        fill="none"
        stroke="#161616"
        strokeWidth="3.5"
      />
      <line x1="115" y1="40" x2="115" y2="100" stroke="#161616" strokeWidth="2.5" />
      <line x1="127" y1="40" x2="127" y2="100" stroke="#161616" strokeWidth="2.5" />
      <line x1="104" y1="70" x2="138" y2="70" stroke="#161616" strokeWidth="3" />
      <circle cx="104" cy="40" r="3.5" fill="#1c1c1c" stroke="#2e2e2e" strokeWidth="1" />
      <circle cx="138" cy="40" r="3.5" fill="#1c1c1c" stroke="#2e2e2e" strokeWidth="1" />
      <circle cx="104" cy="100" r="3.5" fill="#1c1c1c" stroke="#2e2e2e" strokeWidth="1" />
      <circle cx="138" cy="100" r="3.5" fill="#1c1c1c" stroke="#2e2e2e" strokeWidth="1" />
      <rect x="102" y="99" width="38" height="7" rx="3" fill="#181818" stroke="#2a2a2a" strokeWidth="1.5" />
      <rect x="119" y="106" width="4" height="9" fill="#222222" />
      <path d="M 117,115 Q 121,121 125,115" stroke="#222222" strokeWidth="3" fill="none" />
    </svg>
  );
}
