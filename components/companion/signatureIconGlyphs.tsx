import type { ReactNode } from "react";
import type { SignatureIconId } from "@/lib/signatureIcons";

const STROKE = 1.75;

type GlyphProps = {
  className?: string;
};

function strokeProps() {
  return {
    stroke: "currentColor",
    strokeWidth: STROKE,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
}

function HomeCottageGlyph() {
  const s = strokeProps();
  return (
    <>
      <path d="M4.5 11.5 12 5l7.5 6.5" {...s} />
      <path d="M6.5 11.5V18.5h11V11.5" {...s} />
      <path d="M9.5 18.5v-4.5h5v4.5" {...s} />
      <rect
        className="signature-icon__window-glow"
        x="10.25"
        y="12.25"
        width="3.5"
        height="3.5"
        rx="0.6"
        fill="currentColor"
        opacity="0.32"
      />
      <path d="M11 13.5h2M11 15h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </>
  );
}

function ClearMindBrainGlyph() {
  const s = strokeProps();
  return (
    <>
      <path
        d="M12 5.5c-2.2 0-4 1.4-4 3.4 0 .9.4 1.7 1 2.2-.3.5-.5 1.1-.5 1.7 0 1.8 1.6 3.2 3.5 3.2.5 0 1-.1 1.4-.3.4.2.9.3 1.4.3 1.9 0 3.5-1.4 3.5-3.2 0-.6-.2-1.2-.5-1.7.6-.5 1-1.3 1-2.2 0-2-1.8-3.4-4-3.4Z"
        {...s}
      />
      <path d="M12 8.2v5.8" {...s} opacity="0.45" />
      <circle className="signature-icon__sparkle signature-icon__sparkle--1" cx="6.2" cy="7.2" r="0.55" fill="currentColor" />
      <circle className="signature-icon__sparkle signature-icon__sparkle--2" cx="17.8" cy="8" r="0.5" fill="currentColor" />
      <path className="signature-icon__sparkle signature-icon__sparkle--3" d="M5 11.5l1.2-1.2M18.5 11l-1.1-1.1" {...s} opacity="0.7" />
    </>
  );
}

function PlanMyDayGlyph() {
  const s = strokeProps();
  return (
    <>
      <rect x="6" y="4.5" width="12" height="15" rx="1.5" {...s} />
      <path d="M8.5 8.5h7M8.5 11.5h5.5M8.5 14.5h4" {...s} opacity="0.45" />
      <path d="M8.2 17.2l1.4 1.4 3.2-3.4" {...s} />
    </>
  );
}

function FocusLanternBrainGlyph() {
  const s = strokeProps();
  return (
    <>
      <path
        className="signature-icon__lantern-glow"
        d="M12 4.5c-1.2 0-2.2.8-2.2 1.8v1.2c0 .6.4 1.1.9 1.3v.8c0 .5.6.9 1.3.9s1.3-.4 1.3-.9v-.8c.5-.2.9-.7.9-1.3V6.3c0-1-1-1.8-2.2-1.8Z"
        {...s}
      />
      <path d="M10.2 9.8h3.6M11.2 11.1h1.6" {...s} opacity="0.5" />
      <ellipse className="signature-icon__lantern-rays" cx="12" cy="12.8" rx="4.2" ry="1.2" fill="currentColor" opacity="0.12" />
      <path
        d="M8.8 14.8c.8-1.6 2-2.6 3.2-2.6s2.4 1 3.2 2.6c.5 1 .2 2.2-.8 2.9-1 .7-2.4.7-3.4 0-1-.7-1.3-1.9-.8-2.9Z"
        {...s}
      />
    </>
  );
}

function PeacefulPathGlyph() {
  const s = strokeProps();
  return (
    <>
      <path
        className="signature-icon__path-glow"
        d="M5 17.5c2.2-1.2 3.5-2.8 4.2-4.6.8-1.9 1.4-3.1 2.8-4.2 1.4-1.1 3.2-1.5 5-1.1"
        {...s}
      />
      <path d="M6.5 6.8c1 .2 1.8.8 2.4 1.6M16.8 6.2c-.8.5-1.4 1.2-1.8 2" {...s} opacity="0.55" />
      <path d="M4.5 18.5h15" {...s} opacity="0.35" />
      <circle cx="17.5" cy="7.2" r="1.1" {...s} />
      <path d="M16.8 5.2v1.6M18.4 6.8h-1.6" {...s} opacity="0.55" />
    </>
  );
}

function MomentumBlocksGlyph() {
  const s = strokeProps();
  return (
    <>
      <rect x="7" y="13.5" width="5.5" height="3.5" rx="0.6" {...s} />
      <g className="signature-icon__block-tip">
        <rect x="11.5" y="9.2" width="5.5" height="3.5" rx="0.6" {...s} />
      </g>
      <path d="M8.2 13.5V12.2M9.8 13.5V12.2M11.4 13.5V12.2" {...s} opacity="0.4" />
    </>
  );
}

function LibraryJournalGlyph() {
  const s = strokeProps();
  return (
    <>
      <path d="M6 6.5c0-1 .8-1.8 1.8-1.8H12v14.6H7.8c-1 0-1.8-.8-1.8-1.8V6.5Z" {...s} />
      <path d="M12 4.7h4.2c1 0 1.8.8 1.8 1.8v12.8H12" {...s} />
      <path className="signature-icon__page-glow" d="M8 8.5h3M8 11h3M8 13.5h2.2" {...s} opacity="0.55" />
      <path className="signature-icon__page-glow signature-icon__page-glow--r" d="M13.5 8.5H16M13.5 11H16M13.5 13.5H15.2" {...s} opacity="0.55" />
    </>
  );
}

function StudyLampGlyph() {
  const s = strokeProps();
  return (
    <>
      <path className="signature-icon__lamp-glow" d="M8.5 8.2c0-1.5 1.5-2.7 3.5-2.7s3.5 1.2 3.5 2.7v1.2H8.5V8.2Z" {...s} />
      <path d="M7.5 9.4h9M12 9.4v1.8" {...s} />
      <ellipse className="signature-icon__lamp-light" cx="12" cy="13.5" rx="4.5" ry="1.4" fill="currentColor" opacity="0.14" />
      <path d="M7.5 15.2h9l-.8 2.3H8.3l-.8-2.3Z" {...s} />
      <path d="M8.8 17.5h6.4" {...s} opacity="0.45" />
    </>
  );
}

function JournalPenGlyph() {
  const s = strokeProps();
  return (
    <>
      <path d="M6.5 7c0-.8.7-1.5 1.5-1.5H12v13H8c-.8 0-1.5-.7-1.5-1.5V7Z" {...s} />
      <path d="M12 5.5h4c.8 0 1.5.7 1.5 1.5v11H12" {...s} />
      <path d="M8.2 9h2.8M8.2 11.5h2.2" {...s} opacity="0.4" />
      <path d="M14.2 8.2l2.8 2.8-5.2 5.2-2.4.6.6-2.4 4.2-6.2Z" {...s} />
      <path d="M15.6 9.6l1.4 1.4" {...s} opacity="0.55" />
    </>
  );
}

function VoiceWavesGlyph() {
  const s = strokeProps();
  return (
    <>
      <rect x="10" y="7.5" width="4" height="7.5" rx="2" {...s} />
      <path d="M11.2 15v2.2c0 .7.6 1.3 1.3 1.3h0c.7 0 1.3-.6 1.3-1.3V15" {...s} />
      <path className="signature-icon__wave signature-icon__wave--1" d="M6.5 11.5c-.8-.8-.8-2.2 0-3" {...s} />
      <path className="signature-icon__wave signature-icon__wave--2" d="M4.8 11.5c-1.4-1.4-1.4-3.8 0-5.2" {...s} opacity="0.65" />
      <path className="signature-icon__wave signature-icon__wave--3" d="M17.5 11.5c.8-.8.8-2.2 0-3" {...s} />
      <path className="signature-icon__wave signature-icon__wave--4" d="M19.2 11.5c1.4-1.4 1.4-3.8 0-5.2" {...s} opacity="0.65" />
    </>
  );
}

function CommunityChairsGlyph() {
  const s = strokeProps();
  return (
    <>
      <path d="M12 6.8c.8 0 1.5.6 1.5 1.4v1.6H10.5V8.2c0-.8.7-1.4 1.5-1.4Z" {...s} />
      <path d="M9.8 9.8h4.4l.8 2.8H9l.8-2.8Z" {...s} />
      <path d="M7.2 14.2c.7 0 1.2.5 1.2 1.2v2.1H6v-2.1c0-.7.5-1.2 1.2-1.2Z" {...s} />
      <path d="M6.2 15.8h3.2l.5 2.5H5.7l.5-2.5Z" {...s} />
      <path d="M15.6 14.2c.7 0 1.2.5 1.2 1.2v2.1H14.4v-2.1c0-.7.5-1.2 1.2-1.2Z" {...s} />
      <path d="M14.6 15.8h3.2l.5 2.5H14.1l.5-2.5Z" {...s} />
      <path d="M10.2 17.8h3.6" {...s} opacity="0.35" />
    </>
  );
}

function LearnGrowTreeGlyph() {
  const s = strokeProps();
  return (
    <>
      <path d="M6 7c0-.8.7-1.5 1.5-1.5H12v12.5H7.5c-.8 0-1.5-.7-1.5-1.5V7Z" {...s} />
      <path d="M12 5.5h4.5c.8 0 1.5.7 1.5 1.5v10.5H12" {...s} />
      <g className="signature-icon__leaf-sway">
        <path d="M12 8.8c0-1.5 1-2.6 2.2-2.6 1 0 1.8.7 1.8 1.6 0 1.3-1.2 2.2-2.4 2.8-1 .5-1.6.2-1.6-.8Z" {...s} />
        <path d="M12 10.2v2.2" {...s} />
      </g>
    </>
  );
}

function SupportHandsGlyph() {
  const s = strokeProps();
  return (
    <>
      <path d="M8.2 9.2c-.8-.5-1.8-.2-2.2.6-.5.9-.1 2 .9 2.5l2.4 1.2" {...s} />
      <path d="M15.8 9.2c.8-.5 1.8-.2 2.2.6.5.9.1 2-.9 2.5l-2.4 1.2" {...s} />
      <path d="M9.5 11.8c1 1.2 2.2 1.8 2.5 1.8s1.5-.6 2.5-1.8" {...s} />
      <path d="M10.8 14.8c.8.8 2 .8 2.8 0" {...s} opacity="0.55" />
    </>
  );
}

function DecisionCompassGlyph() {
  const s = strokeProps();
  return (
    <>
      <circle cx="12" cy="12" r="6.8" {...s} />
      <circle className="signature-icon__compass-glow" cx="12" cy="12" r="1.4" fill="currentColor" opacity="0.28" />
      <g className="signature-icon__compass-needle">
        <path d="M12 6.8 13.1 12 12 17.2 10.9 12 12 6.8Z" {...s} />
      </g>
      <path d="M12 5.2v1.2M12 17.6v1.2M5.2 12h1.2M17.6 12h1.2" {...s} opacity="0.45" />
    </>
  );
}

function AdhdToolkitGlyph() {
  const s = strokeProps();
  return (
    <>
      <path d="M5.5 8.5h13l-1.2 10H6.7L5.5 8.5Z" {...s} />
      <path d="M7.5 8.2V6.8c0-.7.6-1.3 1.3-1.3h6.4c.7 0 1.3.6 1.3 1.3v1.4" {...s} />
      <path d="M8.5 12.2h1.8M11.1 12.2h1.8M13.7 12.2h1.8" stroke="#1e4f4f" strokeWidth="2" strokeLinecap="round" />
      <path d="M8.8 15.2h2M11.8 15.2h2.2" stroke="#c96a3f" strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

function SettingsKeyGearGlyph() {
  const s = strokeProps();
  return (
    <>
      <circle cx="15.2" cy="8.8" r="2.6" {...s} />
      <path d="M15.2 6.2v1M15.2 10.6v1M12.6 8.8h1M16.8 8.8h1" {...s} opacity="0.45" />
      <path
        d="M7.5 16.2c0-2.2 1.5-3.8 3.2-3.8.9 0 1.7.4 2.2 1.1.5-.7 1.3-1.1 2.2-1.1 1.7 0 3.2 1.6 3.2 3.8 0 1.5-.8 2.8-2 3.5H9.5c-1.2-.7-2-2-2-3.5Z"
        {...s}
      />
      <circle cx="9.8" cy="15.2" r="1" {...s} />
      <path d="M9.8 14.2v2" {...s} />
    </>
  );
}

const GLYPHS: Record<SignatureIconId, (props: GlyphProps) => ReactNode> = {
  "home-cottage": HomeCottageGlyph,
  "clear-mind-brain": ClearMindBrainGlyph,
  "plan-my-day": PlanMyDayGlyph,
  "focus-lantern-brain": FocusLanternBrainGlyph,
  "peaceful-path": PeacefulPathGlyph,
  "momentum-blocks": MomentumBlocksGlyph,
  "library-journal": LibraryJournalGlyph,
  "study-lamp": StudyLampGlyph,
  "journal-pen": JournalPenGlyph,
  "voice-waves": VoiceWavesGlyph,
  "community-chairs": CommunityChairsGlyph,
  "learn-grow-tree": LearnGrowTreeGlyph,
  "support-hands": SupportHandsGlyph,
  "decision-compass": DecisionCompassGlyph,
  "adhd-toolkit": AdhdToolkitGlyph,
  "settings-key-gear": SettingsKeyGearGlyph,
};

export function SignatureIconGlyph({
  iconId,
  className,
}: {
  iconId: SignatureIconId;
  className?: string;
}) {
  const Glyph = GLYPHS[iconId];
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <Glyph />
    </svg>
  );
}
