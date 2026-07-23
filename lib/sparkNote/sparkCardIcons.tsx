/**
 * Spark Card icon family — small gold line-art marks used in place of emoji
 * throughout the Daily Spark card (badge, section headings, Tell Me More
 * toggle). One consistent, refined family — never playful/app-like emoji.
 * See docs/spark-card/SPARK_CARD_READABILITY_REAL_IMAGERY_INTERACTION_REPORT.md
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Small open-book mark — "The Story" section. */
export function SparkCardBookIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M12 6.5c-1.6-1.2-3.6-1.8-6-1.8v12.6c2.4 0 4.4.6 6 1.8" />
      <path d="M12 6.5c1.6-1.2 3.6-1.8 6-1.8v12.6c-2.4 0-4.4.6-6 1.8" />
      <path d="M12 6.5v12.6" />
    </svg>
  );
}

/** Small four-point sparkle mark — "Today's Spark" / "Try This" moments. */
export function SparkCardSparkleIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M12 3.5c.4 3 2 4.6 5 5-3 .4-4.6 2-5 5-.4-3-2-4.6-5-5 3-.4 4.6-2 5-5Z" />
      <path d="M19 15c.2 1.4 1 2.2 2.4 2.4-1.4.2-2.2 1-2.4 2.4-.2-1.4-1-2.2-2.4-2.4 1.4-.2 2.2-1 2.4-2.4Z" />
    </svg>
  );
}

/** Small magnifying-glass mark — "Tell Me More" reveal control. */
export function SparkCardSearchIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M19 19l-4.3-4.3" />
    </svg>
  );
}

/** Small compass-rose mark — used as a graceful last-resort visual accent
 * when both the topic photo and the category default photo fail to load
 * (never an emoji collage). */
export function SparkCardCompassIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M14.6 9.4 12 12l2.6 2.6L17.2 9.4 14.6 9.4Z" />
      <path d="M9.4 9.4 6.8 14.6 12 12 9.4 9.4Z" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
