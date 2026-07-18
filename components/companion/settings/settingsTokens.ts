/**
 * Shared Settings surface tokens — light cards use dark readable text.
 */

export const SETTINGS_TEXT = {
  primary: "text-[#1f1c19]",
  secondary: "text-[#2c2620]",
  helper: "text-[#4b463f]",
  disabled: "text-[#5a534a]",
  accent: "text-[#1e4f4f]",
  onDark: "text-[#fff8eb]",
} as const;

export const SETTINGS_SURFACE = {
  card: "rounded-xl border border-[#d4cdc3] bg-white px-3.5 py-3",
  cardMuted: "rounded-xl border border-[#d4cdc3] bg-[#faf7f2] px-3.5 py-3",
  field:
    "mt-1 w-full min-h-11 rounded-lg border border-[#d4cdc3] bg-white px-3 py-2 text-base text-[#1f1c19] outline-none focus-visible:border-[#1e4f4f] focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/30",
} as const;
