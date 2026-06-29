export type GrowthLineIconId =
  | "journal"
  | "vault"
  | "wins"
  | "portfolio"
  | "capture"
  | "reports";

type Props = {
  id: GrowthLineIconId;
  className?: string;
};

/** Refined etched line icon — brass tone, no emoji. */
export function GrowthLineIcon({ id, className }: Props) {
  const cn = ["growth-line-icon", className].filter(Boolean).join(" ");

  switch (id) {
    case "journal":
      return (
        <svg className={cn} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M7 4.5h8.5a2 2 0 0 1 2 2V19.5H7V4.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.35"
          />
          <path d="M9 8h6M9 11.5h6M9 15h4" stroke="currentColor" strokeWidth="1.15" />
        </svg>
      );
    case "vault":
      return (
        <svg className={cn} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M5.5 10.5 12 6.5l6.5 4v7.5H5.5V10.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
          <path d="M9.5 14.5h5v3.5h-5v-3.5Z" stroke="currentColor" strokeWidth="1.15" />
        </svg>
      );
    case "wins":
      return (
        <svg className={cn} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M8 5.5h8l-1.2 4.2 2.8 2.1-2.2 1.7.8 4.5L12 15.8 7.6 18l.8-4.5-2.2-1.7 2.8-2.1L8 5.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "portfolio":
      return (
        <svg className={cn} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M5 8.5h14v10H5v-10Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.35"
          />
          <path d="M8.5 8.5V6.8A1.8 1.8 0 0 1 10.3 5h3.4a1.8 1.8 0 0 1 1.8 1.8V8.5" />
          <path d="M9 12.5h6M9 15.5h4" stroke="currentColor" strokeWidth="1.15" />
        </svg>
      );
    case "capture":
      return (
        <svg className={cn} viewBox="0 0 24 24" aria-hidden="true">
          <rect
            x="5"
            y="7"
            width="14"
            height="11"
            rx="1.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.35"
          />
          <circle cx="12" cy="12.5" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.15" />
          <path d="M9 6.5h6" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
        </svg>
      );
    case "reports":
      return (
        <svg className={cn} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M7 5.5h10v13H7V5.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.35"
          />
          <path d="M9.5 9h5M9.5 12h5M9.5 15h3.5" stroke="currentColor" strokeWidth="1.15" />
        </svg>
      );
    default:
      return null;
  }
}
