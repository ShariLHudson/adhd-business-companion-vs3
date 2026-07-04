"use client";

type Props = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

/** Flame mark only — cropped from SSC logo (no wordmark). */
const SPARK_FLAME_SRC = "/images/spark-estate-flame-only.jpg";
const SPARK_FLAME_FALLBACK = "/images/spark-estate-flame.svg";

export function JournalGazeboSparkFlame({ className = "", size = "md" }: Props) {
  const sizeClass =
    size === "lg"
      ? "jg-spark-flame-img--lg"
      : size === "sm"
        ? "jg-spark-flame-img--sm"
        : "jg-spark-flame-img--md";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SPARK_FLAME_SRC}
      alt=""
      aria-hidden="true"
      className={["jg-spark-flame-img", sizeClass, className].filter(Boolean).join(" ")}
      onError={(e) => {
        const img = e.currentTarget;
        if (!img.src.includes(".svg")) {
          img.src = SPARK_FLAME_FALLBACK;
        }
      }}
    />
  );
}
