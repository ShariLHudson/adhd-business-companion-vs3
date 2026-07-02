"use client";

import {
  SPARK_ESTATE_GUIDE_COVER_ALT,
  SPARK_ESTATE_GUIDE_COVER_SRC,
} from "@/lib/estate/sparkEstateGuide";

type Props = {
  onClick?: () => void;
  className?: string;
};

/** Guidebook cover — used in flipbook and standalone previews. */
export function EstateGuideCover({ onClick, className }: Props) {
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      className={["eg-guide-cover", className].filter(Boolean).join(" ")}
      onClick={onClick}
      aria-label={onClick ? "Open Spark Estate Guide" : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SPARK_ESTATE_GUIDE_COVER_SRC}
        alt={SPARK_ESTATE_GUIDE_COVER_ALT}
        className="eg-guide-cover__image"
        decoding="async"
      />
    </Tag>
  );
}
