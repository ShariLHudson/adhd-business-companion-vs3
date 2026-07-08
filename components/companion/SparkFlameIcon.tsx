/** Spark Note™ flame mark — use instead of stars or generic notification icons. */
export function SparkFlameIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 2C12 2 8 8 8 13C8 16.31 9.79 19 12 19C14.21 19 16 16.31 16 13C16 8 12 2 12 2Z"
        fill="currentColor"
      />
      <path
        d="M12 19C10.5 19 9 17.5 9 15.5C9 13 11 10 12 8C13 10 15 13 15 15.5C15 17.5 13.5 19 12 19Z"
        fill="rgba(255,236,180,0.85)"
      />
    </svg>
  );
}
