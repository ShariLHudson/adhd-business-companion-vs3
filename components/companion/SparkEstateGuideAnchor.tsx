"use client";

import {
  SPARK_ESTATE_GUIDE_COVER_ALT,
  SPARK_ESTATE_GUIDE_COVER_SRC,
} from "@/lib/estate/sparkEstateGuide";

type Props = {
  onClick: () => void;
  className?: string;
};

/** Bottom-right guidebook anchor on companion screens. */
export function SparkEstateGuideAnchor({ onClick, className }: Props) {
  return (
    <button
      type="button"
      className={["spark-estate-guide-anchor", className].filter(Boolean).join(" ")}
      onClick={onClick}
      aria-label={SPARK_ESTATE_GUIDE_COVER_ALT}
      data-testid="spark-estate-guide-anchor"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SPARK_ESTATE_GUIDE_COVER_SRC}
        alt=""
        className="spark-estate-guide-anchor__cover"
        decoding="async"
      />
    </button>
  );
}
