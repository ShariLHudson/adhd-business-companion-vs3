/** Show CSS-gradient Living Border placeholders (dev layout only). */
export function showLivingBorderPlaceholders(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_LIVING_BORDER_DEBUG === "true";
}
