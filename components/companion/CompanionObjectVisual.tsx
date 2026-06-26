"use client";

import { companionObjectById } from "@/lib/companionUniverse/libraries/objectLibrary";

export type CompanionObjectSize = "xs" | "sm" | "md" | "lg" | "card";

export type CompanionObjectVisualProps = {
  objectId: string;
  size?: CompanionObjectSize;
  /** Mini-scene card crop vs compact icon square. */
  variant?: "mini-scene" | "icon";
  className?: string;
  /** Overrides registry signature object for screen readers. */
  label?: string;
  /** Subtle life — steam, flicker, breeze. Respects reduced motion. */
  animate?: boolean;
};

const SIZE_CLASS: Record<CompanionObjectSize, string> = {
  xs: "companion-object-visual--xs",
  sm: "companion-object-visual--sm",
  md: "companion-object-visual--md",
  lg: "companion-object-visual--lg",
  card: "companion-object-visual--card",
};

/**
 * Renders a Signature Object™ mini-scene or icon placeholder.
 * CSS homestead scenes until PNG/SVG art lands in the Object Library.
 */
export function CompanionObjectVisual({
  objectId,
  size = "sm",
  variant = "mini-scene",
  className,
  label,
  animate,
}: CompanionObjectVisualProps) {
  const entry = companionObjectById(objectId);
  const motion =
    animate ?? (entry?.motionCompatible === true && variant === "mini-scene");

  return (
    <span
      className={[
        "companion-object-visual",
        SIZE_CLASS[size],
        variant === "icon" ? "companion-object-visual--icon" : "",
        motion ? "companion-object-visual--alive" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-companion-object={objectId}
      data-companion-room={entry?.room ?? "living-room"}
      role="img"
      aria-label={label ?? entry?.signatureObject ?? objectId}
    />
  );
}

export function CompanionObjectLabel({
  objectId,
  label,
  size = "xs",
  className,
}: {
  objectId: string;
  label: string;
  size?: CompanionObjectSize;
  className?: string;
}) {
  return (
    <span
      className={["inline-flex items-center gap-2", className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      <CompanionObjectVisual objectId={objectId} size={size} variant="icon" />
      <span>{label}</span>
    </span>
  );
}
