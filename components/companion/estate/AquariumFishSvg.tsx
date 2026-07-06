import type {
  AquariumFishDepth,
  AquariumFishShape,
  AquariumFishSize,
  AquariumFishTone,
} from "@/lib/oceanConservatory/aquariumLifeConfig";

type AquariumFishSvgProps = {
  id: string;
  tone: AquariumFishTone;
  shape: AquariumFishShape;
  size: AquariumFishSize;
  depth: AquariumFishDepth;
};

const TONE_STOPS: Record<
  AquariumFishTone,
  { body: [string, string, string]; highlight: string; eye: string }
> = {
  yellow: {
    body: ["#c89818", "#f0d050", "#a87810"],
    highlight: "rgba(255, 240, 160, 0.55)",
    eye: "#1a1408",
  },
  blue: {
    body: ["#1458a0", "#3ca8e8", "#0c4078"],
    highlight: "rgba(180, 230, 255, 0.5)",
    eye: "#061018",
  },
  teal: {
    body: ["#0e7878", "#48c8c0", "#085858"],
    highlight: "rgba(180, 255, 248, 0.45)",
    eye: "#041010",
  },
  orange: {
    body: ["#b85818", "#f0a040", "#903810"],
    highlight: "rgba(255, 220, 160, 0.5)",
    eye: "#180c04",
  },
  silver: {
    body: ["#8898a8", "#e8f0f8", "#687888"],
    highlight: "rgba(255, 255, 255, 0.65)",
    eye: "#101820",
  },
  violet: {
    body: ["#5840a0", "#9878e0", "#402878"],
    highlight: "rgba(220, 200, 255, 0.45)",
    eye: "#100818",
  },
};

function TangFish({ gradId, tone }: { gradId: string; tone: AquariumFishTone }) {
  const palette = TONE_STOPS[tone];
  return (
    <>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={palette.body[0]} />
          <stop offset="52%" stopColor={palette.body[1]} />
          <stop offset="100%" stopColor={palette.body[2]} />
        </linearGradient>
      </defs>
      <ellipse cx="18" cy="12" rx="11" ry="8.5" fill={`url(#${gradId})`} />
      <ellipse cx="14" cy="9.5" rx="4" ry="2.2" fill={palette.highlight} />
      <path
        d="M28 12 L36 6.5 L36 17.5 Z"
        fill={`url(#${gradId})`}
        className="ocean-conservatory-aquarium-life__fish-tail"
      />
      <circle cx="10" cy="11.5" r="1.1" fill={palette.eye} opacity="0.85" />
      <path
        d="M16 4.5 L20 3.2 L22 6.2 Z"
        fill={palette.body[1]}
        opacity="0.55"
        className="ocean-conservatory-aquarium-life__fish-fin"
      />
      <path
        d="M15 19 L19 20.5 L20 17.5 Z"
        fill={palette.body[0]}
        opacity="0.45"
        className="ocean-conservatory-aquarium-life__fish-fin"
      />
    </>
  );
}

function StreamlinedFish({ gradId, tone }: { gradId: string; tone: AquariumFishTone }) {
  const palette = TONE_STOPS[tone];
  return (
    <>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={palette.body[0]} />
          <stop offset="50%" stopColor={palette.body[1]} />
          <stop offset="100%" stopColor={palette.body[2]} />
        </linearGradient>
      </defs>
      <path
        d="M4 12 C4 6.5 12 4 22 7.5 C30 10 34 12 34 12 C34 12 30 14 22 16.5 C12 19.5 4 17.5 4 12 Z"
        fill={`url(#${gradId})`}
      />
      <ellipse cx="12" cy="10.5" rx="3.2" ry="1.6" fill={palette.highlight} />
      <path
        d="M34 12 L42 7 L42 17 Z"
        fill={`url(#${gradId})`}
        className="ocean-conservatory-aquarium-life__fish-tail"
      />
      <circle cx="9" cy="11.5" r="1.15" fill={palette.eye} opacity="0.85" />
      <path
        d="M14 5.5 L18 4 L20 7.5 L16 8.5 Z"
        fill={palette.body[1]}
        opacity="0.5"
        className="ocean-conservatory-aquarium-life__fish-fin"
      />
    </>
  );
}

function MoorishFish({ gradId, tone }: { gradId: string; tone: AquariumFishTone }) {
  const palette = TONE_STOPS[tone];
  return (
    <>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={palette.body[0]} />
          <stop offset="48%" stopColor={palette.body[1]} />
          <stop offset="100%" stopColor={palette.body[2]} />
        </linearGradient>
      </defs>
      <path
        d="M6 13 C8 8 16 6.5 24 8.5 C28 9.5 30 11 30 12 C30 13 28 14.5 24 15.5 C16 17.5 8 16 6 13 Z"
        fill={`url(#${gradId})`}
      />
      <path
        d="M18 8.5 L20 1.5 L22 8.5 Z"
        fill={palette.body[1]}
        opacity="0.65"
        className="ocean-conservatory-aquarium-life__fish-fin ocean-conservatory-aquarium-life__fish-fin--dorsal"
      />
      <path
        d="M30 12 L38 8 L38 16 Z"
        fill={`url(#${gradId})`}
        className="ocean-conservatory-aquarium-life__fish-tail"
      />
      <circle cx="11" cy="12.5" r="1" fill={palette.eye} opacity="0.85" />
      <path d="M8 14 L4 16 L8 17 Z" fill={palette.body[0]} opacity="0.4" />
    </>
  );
}

function MinnowFish({ gradId, tone }: { gradId: string; tone: AquariumFishTone }) {
  const palette = TONE_STOPS[tone];
  return (
    <>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={palette.body[0]} />
          <stop offset="55%" stopColor={palette.body[1]} />
          <stop offset="100%" stopColor={palette.body[2]} />
        </linearGradient>
      </defs>
      <path
        d="M3 6 C3 3.5 7 2.5 14 3.5 C18 4 20 6 20 6 C20 6 18 8 14 8.5 C7 9.5 3 8.5 3 6 Z"
        fill={`url(#${gradId})`}
      />
      <path
        d="M20 6 L26 3.5 L26 8.5 Z"
        fill={`url(#${gradId})`}
        className="ocean-conservatory-aquarium-life__fish-tail"
      />
      <circle cx="7" cy="5.8" r="0.65" fill={palette.eye} opacity="0.8" />
    </>
  );
}

const VIEWBOX: Record<AquariumFishShape, string> = {
  tang: "0 0 38 24",
  streamlined: "0 0 44 24",
  moorish: "0 0 40 20",
  minnow: "0 0 28 12",
};

export function AquariumFishSvg({
  id,
  tone,
  shape,
  size,
  depth,
}: AquariumFishSvgProps) {
  const gradId = `ocean-fish-grad-${id}`;
  const FishShape =
    shape === "tang"
      ? TangFish
      : shape === "streamlined"
        ? StreamlinedFish
        : shape === "moorish"
          ? MoorishFish
          : MinnowFish;

  return (
    <svg
      className={`ocean-conservatory-aquarium-life__fish-svg ocean-conservatory-aquarium-life__fish-svg--${size} ocean-conservatory-aquarium-life__fish-svg--shape-${shape} ocean-conservatory-aquarium-life__fish-svg--depth-${depth}`}
      viewBox={VIEWBOX[shape]}
      aria-hidden="true"
      focusable="false"
    >
      <FishShape gradId={gradId} tone={tone} />
    </svg>
  );
}
