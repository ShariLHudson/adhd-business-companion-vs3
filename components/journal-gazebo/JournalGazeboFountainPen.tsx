"use client";

type Props = {
  onClick?: () => void;
  className?: string;
  /** Lying on the desk — welcome note & workshop. */
  resting?: boolean;
  /** @deprecated Use resting */
  decorative?: boolean;
  glowing?: boolean;
  ariaLabel?: string;
};

/** Brass fountain pen — object on the desk, not a web button. */
export function JournalGazeboFountainPen({
  onClick,
  className = "",
  resting = false,
  decorative = false,
  glowing = false,
  ariaLabel = "Begin preparing your journal",
}: Props) {
  const isDecorative = decorative && !onClick;
  const Tag = isDecorative ? "span" : "button";

  return (
    <Tag
      type={isDecorative ? undefined : "button"}
      className={[
        "jg-fountain-pen",
        resting ? "jg-fountain-pen--resting" : "",
        isDecorative ? "jg-fountain-pen--decorative" : "jg-fountain-pen--interactive",
        glowing ? "jg-fountain-pen--glowing" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={isDecorative ? undefined : onClick}
      aria-hidden={isDecorative ? true : undefined}
      aria-label={isDecorative ? undefined : ariaLabel}
    >
      <span className="jg-fountain-pen__shadow" aria-hidden="true" />
      <span className="jg-fountain-pen__body" aria-hidden="true">
        <span className="jg-fountain-pen__cap" />
        <span className="jg-fountain-pen__band" />
        <span className="jg-fountain-pen__barrel" />
        <span className="jg-fountain-pen__nib" />
      </span>
    </Tag>
  );
}
