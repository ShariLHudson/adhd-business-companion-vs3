"use client";

type Props = {
  imageUrl: string;
  /** Nested tool plaques use a shorter strip. */
  compact?: boolean;
};

/** Soft atmosphere strip — top of a destination plaque, not a full image tile. */
export function FocusHubPlaqueStrip({ imageUrl, compact = false }: Props) {
  return (
    <span
      className={[
        "focus-hub-plaque__strip",
        compact ? "focus-hub-plaque__strip--compact" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ backgroundImage: `url('${imageUrl}')` }}
      aria-hidden
    />
  );
}
