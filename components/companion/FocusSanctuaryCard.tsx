"use client";

import { useState } from "react";

type Props = {
  icon?: string;
  title: string;
  description: string;
  imageUrl: string;
  onClick: () => void;
  testId?: string;
  featured?: boolean;
};

export function FocusSanctuaryCard({
  icon,
  title,
  description,
  imageUrl,
  onClick,
  testId,
  featured = false,
}: Props) {
  const [pressing, setPressing] = useState(false);

  return (
    <button
      type="button"
      data-testid={testId}
      className={[
        "focus-sanctuary-card",
        featured ? "focus-sanctuary-card--featured" : "",
        pressing ? "focus-sanctuary-card--pressing" : "",
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
      aria-label={`${title}. ${description}`}
    >
      <span
        className="focus-sanctuary-card__visual"
        style={{ backgroundImage: `url('${imageUrl}')` }}
        aria-hidden
      />
      <span className="focus-sanctuary-card__body">
        {icon ? (
          <span className="focus-sanctuary-card__icon" aria-hidden>
            {icon}
          </span>
        ) : null}
        <span className="focus-sanctuary-card__title">{title}</span>
        <span className="focus-sanctuary-card__description">{description}</span>
      </span>
      <span className="focus-sanctuary-card__glow" aria-hidden />
    </button>
  );
}
