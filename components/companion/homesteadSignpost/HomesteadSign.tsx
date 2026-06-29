"use client";

import { companionNavHref } from "@/lib/companionNavUrl";
import type { HomesteadSignpostItem } from "@/lib/homesteadSignpost";
import type { CoachingMode } from "@/lib/companionPrompt";

type Props = {
  item: HomesteadSignpostItem;
  active: boolean;
  swayIndex: number;
  onSelect: (nav: HomesteadSignpostItem["id"], mode?: CoachingMode) => void;
};

/** Handcrafted wooden hanging sign — text only, no icons. */
export function HomesteadSign({ item, active, swayIndex, onSelect }: Props) {
  const href = companionNavHref(item.id, item.mode);

  return (
    <a
      href={href}
      data-nav-id={item.id}
      data-sign-tier={item.tier}
      {...(item.mode ? { "data-nav-mode": item.mode } : {})}
      onClick={(e) => {
        e.preventDefault();
        onSelect(item.id, item.mode);
      }}
      title={item.label}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={[
        "homestead-sign",
        item.tier === "knowledge" ? "homestead-sign--knowledge" : "homestead-sign--destination",
        active ? "homestead-sign--active" : "",
        `homestead-sign--sway-${(swayIndex % 5) + 1}`,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="homestead-sign__hanger" aria-hidden="true" />
      <span className="homestead-sign__board">
        <span className="homestead-sign__label">{item.label}</span>
      </span>
    </a>
  );
}
