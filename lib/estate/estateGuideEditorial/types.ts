/**
 * Spark Estate Guidebook™ — editorial block system.
 * Coffee-table spreads compose optional premium blocks — not one repeated template.
 */

export const ESTATE_GUIDE_EDITORIAL_BLOCK_TYPES = [
  "around-the-estate",
  "estate-tradition",
  "found-among-archives",
  "from-sharis-notebook",
  "stewards-note",
  "curators-note",
  "leave-remembering-one-thing",
  "estate-saying",
] as const;

export type EstateGuideEditorialBlockType =
  (typeof ESTATE_GUIDE_EDITORIAL_BLOCK_TYPES)[number];

export type EstateGuideAroundTheEstateBlock = {
  type: "around-the-estate";
  id?: string;
  title?: string;
  paragraphs: string[];
  visitReasons?: string[];
};

export type EstateGuideEstateTraditionBlock = {
  type: "estate-tradition";
  id?: string;
  title?: string;
  paragraphs: string[];
};

export type EstateGuideFoundAmongArchivesBlock = {
  type: "found-among-archives";
  id?: string;
  title?: string;
  paragraphs: string[];
  source?: string;
};

export type EstateGuideFromSharisNotebookBlock = {
  type: "from-sharis-notebook";
  id?: string;
  title?: string;
  paragraphs?: string[];
  prompts?: string[];
};

export type EstateGuideStewardsNoteBlock = {
  type: "stewards-note";
  id?: string;
  paragraphs: string[];
};

export type EstateGuideCuratorsNoteBlock = {
  type: "curators-note";
  id?: string;
  paragraphs: string[];
};

export type EstateGuideLeaveRememberingBlock = {
  type: "leave-remembering-one-thing";
  id?: string;
  line: string;
};

export type EstateGuideEstateSayingBlock = {
  type: "estate-saying";
  id?: string;
  quote: string;
  attribution?: string;
};

export type EstateGuideEditorialBlock =
  | EstateGuideAroundTheEstateBlock
  | EstateGuideEstateTraditionBlock
  | EstateGuideFoundAmongArchivesBlock
  | EstateGuideFromSharisNotebookBlock
  | EstateGuideStewardsNoteBlock
  | EstateGuideCuratorsNoteBlock
  | EstateGuideLeaveRememberingBlock
  | EstateGuideEstateSayingBlock;

export type EstateGuideSpreadData = {
  id: string;
  title: string;
  image: string;
  /** Estate directory place id for background fallbacks — defaults to `id` */
  imagePlaceId?: string;
  tagline: string;
  leftBlocks: EstateGuideEditorialBlock[];
  rightBlocks: EstateGuideEditorialBlock[];
};

export function isEstateGuideEditorialBlockType(
  value: string,
): value is EstateGuideEditorialBlockType {
  return (ESTATE_GUIDE_EDITORIAL_BLOCK_TYPES as readonly string[]).includes(value);
}

export function validateEstateGuideSpread(
  spread: EstateGuideSpreadData,
): string[] {
  const errors: string[] = [];
  if (!spread.leftBlocks.length && !spread.rightBlocks.length) {
    errors.push(`${spread.id}: spread has no editorial blocks`);
  }
  for (const [side, blocks] of [
    ["left", spread.leftBlocks],
    ["right", spread.rightBlocks],
  ] as const) {
    for (const block of blocks) {
      if (!isEstateGuideEditorialBlockType(block.type)) {
        errors.push(`${spread.id}: unknown block on ${side}`);
      }
    }
  }
  return errors;
}
