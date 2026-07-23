/**
 * Small line-art marks for Spark Card section labels — Estate-appropriate
 * replacements for emoji (📖 ✨ 🔥 🔎 🌟) that previously clashed with the
 * parchment-and-gold treasure-card aesthetic. Monochrome, inherit
 * `currentColor`, and size with the surrounding text via `1em` — see
 * docs/spark-card/SPARK_CARD_READABILITY_REAL_IMAGERY_INTERACTION_REPORT.md.
 */

/** "The Story" section mark — an open book, not a book emoji. */
export function SparkOpenBookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 6.1C10.35 4.95 7.9 4.4 4.9 4.6c-.5.03-.9.44-.9.94v12.1c0 .55.47.98 1.02.94 2.75-.2 4.9.32 6.16 1.2.5.36 1.14.36 1.64 0 1.27-.88 3.41-1.4 6.16-1.2.55.04 1.02-.39 1.02-.94V5.54c0-.5-.4-.91-.9-.94-3-.2-5.45.35-7.1 1.5-.4.28-.6.66-.7 1.08Z"
        fill="currentColor"
      />
      <path
        d="M12 7.4V18.9"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** "Today's Spark" / gallery / emphasis mark — a four-point sparkle. */
export function SparkSparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 3C12.42 6.85 13.85 9.3 17.9 9.9C13.85 10.5 12.42 12.95 12 16.8C11.58 12.95 10.15 10.5 6.1 9.9C10.15 9.3 11.58 6.85 12 3Z"
        fill="currentColor"
      />
      <path
        d="M18.6 13.6C18.78 15.15 19.4 16.2 21.2 16.5C19.4 16.8 18.78 17.85 18.6 19.4C18.42 17.85 17.8 16.8 16 16.5C17.8 16.2 18.42 15.15 18.6 13.6Z"
        fill="currentColor"
        opacity="0.75"
      />
    </svg>
  );
}

/** "Tell Me More" toggle mark — a magnifying glass, not 🔎. */
export function SparkMagnifyingGlassIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="10.4" cy="10.4" r="6.1" stroke="currentColor" strokeWidth="1.9" />
      <path
        d="M15 15L20.2 20.2"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Small compass — wayfinding / place motifs. */
export function SparkCompassIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 5.2V7.1M12 16.9V18.8M5.2 12H7.1M16.9 12H18.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M10.2 13.8 13.4 8.6 13.8 13.8 8.6 10.6Z" fill="currentColor" />
    </svg>
  );
}

/** Decorative wax-seal mark. */
export function SparkSealIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="11" r="6.4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="11" r="3.2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M9.2 16.6 8.4 20.2 12 18.6 15.6 20.2 14.8 16.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Botanical leaf — nature / quiet growth. */
export function SparkLeafIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M5.5 14.5C5.5 9.2 10.4 4.8 18.2 4.8c0 7.8-4.4 12.7-9.7 12.7-1.4 0-2.6-.4-3-.7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8.2 15.8C10.6 13.2 13.8 9.4 17.4 6.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
