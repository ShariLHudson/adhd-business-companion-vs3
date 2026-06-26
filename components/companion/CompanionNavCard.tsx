"use client";

import { CompanionObjectVisual } from "@/components/companion/CompanionObjectVisual";

export type CompanionNavCardProps = {
  objectId: string;
  title: string;
  description?: string;
  tagline?: string;
  onClick?: () => void;
  href?: string;
  active?: boolean;
  className?: string;
  /** Show mini-scene (default) or compact icon. */
  visualVariant?: "mini-scene" | "icon";
};

/**
 * Warm navigation invitation — card stays, emoji goes.
 * Tiny window into the Companion Homestead™.
 */
export function CompanionNavCard({
  objectId,
  title,
  description,
  tagline,
  onClick,
  href,
  active,
  className,
  visualVariant = "mini-scene",
}: CompanionNavCardProps) {
  const body = (
    <>
      <CompanionObjectVisual
        objectId={objectId}
        size={visualVariant === "icon" ? "md" : "card"}
        variant={visualVariant}
        animate
      />
      <span className="companion-nav-card__copy min-w-0 flex-1">
        <span className="companion-nav-card__title block text-base font-semibold text-[#1f1c19]">
          {title}
        </span>
        {(tagline ?? description) ? (
          <span className="companion-nav-card__desc mt-0.5 block text-sm leading-snug text-[#6b635a]">
            {tagline ?? description}
          </span>
        ) : null}
      </span>
    </>
  );

  const cardClass = [
    "companion-nav-card",
    active ? "companion-nav-card--active" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <a href={href} onClick={onClick} className={cardClass}>
        {body}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cardClass}>
      {body}
    </button>
  );
}
