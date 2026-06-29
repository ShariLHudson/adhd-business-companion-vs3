"use client";

import { useState } from "react";
import type { MomentumNeedId } from "@/lib/momentumGames";
import { categoryArtForNeed } from "@/lib/momentumGames/categoryArt";

type Props = {
  needId: MomentumNeedId;
  title: string;
  tagline: string;
  onClick: () => void;
};

export function MomentumGamesCategoryCard({
  needId,
  title,
  tagline,
  onClick,
}: Props) {
  const [pressing, setPressing] = useState(false);

  return (
    <button
      type="button"
      className={[
        "momentum-games-category-card",
        pressing ? "momentum-games-category-card--pressing" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => {
        setPressing(true);
        window.setTimeout(() => {
          setPressing(false);
          onClick();
        }, 180);
      }}
      aria-label={`${title}. ${tagline}`}
    >
      <span
        className="momentum-games-category-card__visual"
        style={{ backgroundImage: `url('${categoryArtForNeed(needId)}')` }}
        aria-hidden
      />
      <span className="momentum-games-category-card__copy">
        <span className="momentum-games-category-card__title">{title}</span>
        <span className="momentum-games-category-card__tagline">{tagline}</span>
      </span>
      <span className="momentum-games-category-card__shimmer" aria-hidden />
    </button>
  );
}
