"use client";

const SPARK_FLAME_SRC = "/images/ssc-presence-flame.png";
const SPARK_FLAME_FALLBACK = "/images/spark-estate-flame-only.jpg";

export type EnjoyEstateFlameProps = {
  onClick: () => void;
  className?: string;
  /** Shown to screen readers — default invites return from visitor mode. */
  ariaLabel?: string;
  /** Optional visible label beside the flame. */
  label?: string;
};

/**
 * Subtle Spark flame — the only visible affordance in Enjoy the Estate visitor mode.
 */
export function EnjoyEstateFlame({
  onClick,
  className = "",
  ariaLabel = "Return to room",
  label,
}: EnjoyEstateFlameProps) {
  return (
    <button
      type="button"
      className={["enjoy-estate-flame", className].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
      title={label ?? "Return to room"}
      onClick={onClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SPARK_FLAME_SRC}
        alt=""
        aria-hidden="true"
        className="enjoy-estate-flame__img"
        onError={(e) => {
          const img = e.currentTarget;
          if (!img.src.includes(".svg")) {
            img.src = SPARK_FLAME_FALLBACK;
          }
        }}
      />
      {label ? <span className="enjoy-estate-flame__label">{label}</span> : null}
    </button>
  );
}
