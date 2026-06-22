import { OTHER_OPTION } from "./createTypePickers";

/** User-facing labels on the Create launcher — one decision: what to create. */
export const CREATE_LAUNCHER_TYPE_OPTIONS = [
  "Social Media Post",
  "LinkedIn Post",
  "Facebook Post",
  "Email",
  "Newsletter",
  "Blog Post",
  "Lead Magnet",
  "Workbook",
  "Workshop",
  "Presentation",
  "Sales Page",
  "Landing Page",
  "Ad Copy",
  "Video Script",
  "Podcast Outline",
  "Book Chapter",
  OTHER_OPTION,
] as const;

export type CreateLauncherDisplayType =
  (typeof CREATE_LAUNCHER_TYPE_OPTIONS)[number];

const DISPLAY_TO_CATALOG: Partial<
  Record<CreateLauncherDisplayType, string>
> = {
  "Social Media Post": "Social Post",
  Custom: OTHER_OPTION,
};

/** Map launcher label → catalog / generation type. */
export function resolveCreateLauncherType(display: string): {
  catalogLabel: string;
  customLabel?: string;
} {
  const trimmed = display.trim();
  if (!trimmed) {
    return { catalogLabel: OTHER_OPTION };
  }
  if (trimmed === OTHER_OPTION) {
    return { catalogLabel: OTHER_OPTION };
  }
  const mapped = DISPLAY_TO_CATALOG[trimmed as CreateLauncherDisplayType];
  if (mapped) {
    return { catalogLabel: mapped };
  }
  return { catalogLabel: trimmed };
}
