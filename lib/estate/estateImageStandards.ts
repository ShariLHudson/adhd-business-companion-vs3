/**
 * Estate Image Bible — Spark Estate Image Standards
 *
 * Append ESTATE_IMAGE_BRAND_PROMPT to every room-plate and scene-generation prompt.
 *
 * @see docs/estate/ESTATE_IMAGE_BIBLE.md
 */

/** Master brand-consistency block for image generators. */
export const ESTATE_IMAGE_BRAND_PROMPT = `SPARK ESTATE IMAGE STANDARDS (mandatory):

Brand consistency: Every coffee mug, teacup, travel mug, or drinking vessel visible anywhere in the Spark Estate must display the official Spark flame logo. Never leave mugs blank. Never substitute another emblem. Keep the logo centered, correctly proportioned, and facing the viewer whenever practical. This branding rule applies consistently across every Estate room and all future image variations.

Journals and ledgers: Leather-bound with subtle Spark Estate branding (debossed or foil flame). Never generic store-brand notebooks.

Writing instruments: Black-and-gold luxury pens only (Montblanc-style — black barrel, gold clip and trim). No plastic ballpoints, no novelty pens.

Brass hardware: Warm antique brass (#c4a574 family) — consistent pulls, lamps, hinges, drawer plates, hooks, and accents. Match Momentum Institute drawer brass.

Room signage: Elegant estate serif typography on plaques; warm cream or brass lettering on dark wood. No sans-serif app UI fonts in the scene.

Photography: Photorealistic, warm natural light, premium entrepreneurial estate, calm and uncluttered. No cartoon, no clip art, no stock-watermark logos, no neon, no gamified UI.

Physical plausibility: One handle per mug/cup. Correct human-scale proportions. No floating objects. No impossible architecture.

Decorative objects must reinforce this room's purpose — not random clutter.

Lanterns, candles, fireplaces: soft warm flicker implied; never strobe or harsh pulse. Respect still photography — gentle glow only.`;

export const ESTATE_BRASS_PALETTE = {
  primary: "#c4a574",
  deep: "#b8956a",
  highlight: "#e8d4a8",
} as const;

export const ESTATE_IMAGE_PLAUSIBILITY_RULES = [
  "One handle per mug or cup — never two handles on a single vessel",
  "Spark flame logo centered on drinking vessel face when visible",
  "Black-and-gold luxury pens only — Montblanc-style",
  "Warm antique brass hardware consistent across rooms",
  "No blank mugs, no substitute emblems on cups",
  "No generic clip art, stock logos, or placeholder icons",
] as const;

/**
 * Build a full Estate room-plate prompt: room-specific description + brand block.
 */
export function buildEstateRoomImagePrompt(roomDescription: string): string {
  const room = roomDescription.trim();
  if (!room) return ESTATE_IMAGE_BRAND_PROMPT;
  return `${room}\n\n${ESTATE_IMAGE_BRAND_PROMPT}`;
}
