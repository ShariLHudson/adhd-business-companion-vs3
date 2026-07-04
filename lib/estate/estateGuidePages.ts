import type { EstateGuideSpreadData } from "@/data/estateGuideSpreads";
import type { EstateGuideEditorialBlock } from "@/lib/estate/estateGuideEditorial";
import { resolveEstateGuideSpreadBlocks } from "@/lib/estate/estateGuideEditorial";

export type EstateGuideRoomPageKind = "photo" | "text";

export type EstateGuideSpreadBlockSplit = {
  pageOneBlocks: EstateGuideEditorialBlock[];
  pageTwoBlocks: EstateGuideEditorialBlock[];
};

function estimateEditorialBlockWeight(block: EstateGuideEditorialBlock): number {
  if (block.type === "next-stop") return 1;
  if (block.type === "enjoy-visiting-next") {
    const items = block.visits?.length ?? block.destinations?.length ?? 0;
    return 2 + items * 0.8;
  }
  if (
    block.type === "estate-journals" ||
    block.type === "caretakers-notebook" ||
    block.type === "caretakers-observation"
  ) {
    const paras = block.paragraphs?.length ?? 0;
    const attr = block.attribution?.length ?? 0;
    return 2.5 + paras * 1.8 + attr * 0.5;
  }
  const para = block.paragraphs?.length ?? 0;
  const bullets = block.bullets?.length ?? 0;
  const closing = block.closingParagraphs?.length ?? 0;
  const moments = block.moments?.length ?? 0;
  return 1.5 + para * 1.2 + bullets * 0.6 + closing * 1.2 + moments * 2.2;
}

/** Balance caretaker copy across the photo page lower half and the text page. */
export function splitSpreadBlocksForTwoPages(
  blocks: readonly EstateGuideEditorialBlock[],
): EstateGuideSpreadBlockSplit {
  if (blocks.length === 0) {
    return { pageOneBlocks: [], pageTwoBlocks: [] };
  }
  if (blocks.length === 1) {
    return { pageOneBlocks: [...blocks], pageTwoBlocks: [] };
  }

  const weights = blocks.map(estimateEditorialBlockWeight);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const target = total * 0.48;

  let cumulative = 0;
  let splitAt = 1;
  for (let i = 0; i < blocks.length - 1; i++) {
    cumulative += weights[i]!;
    if (cumulative >= target) {
      splitAt = i + 1;
      break;
    }
    splitAt = i + 1;
  }

  if (splitAt >= blocks.length) {
    splitAt = blocks.length - 1;
  }
  if (splitAt < 1) {
    splitAt = 1;
  }

  return {
    pageOneBlocks: blocks.slice(0, splitAt) as EstateGuideEditorialBlock[],
    pageTwoBlocks: blocks.slice(splitAt) as EstateGuideEditorialBlock[],
  };
}

export function resolveBlocksForEstateGuideRoomPage(
  spread: EstateGuideSpreadData,
  pageKind: EstateGuideRoomPageKind,
): EstateGuideEditorialBlock[] {
  const { pageOneBlocks, pageTwoBlocks } = splitSpreadBlocksForTwoPages(
    resolveEstateGuideSpreadBlocks(spread),
  );
  return pageKind === "photo" ? pageOneBlocks : pageTwoBlocks;
}

export type EstateGuideBookPage = {
  spreadId: string;
  roomTitle: string;
  kind: EstateGuideRoomPageKind;
  roomPageIndex: 0 | 1;
  spread: EstateGuideSpreadData;
};

/** Each room → two flipbook pages: photograph, then caretaker copy. */
export function expandEstateGuideToBookPages(
  spreads: readonly EstateGuideSpreadData[],
): EstateGuideBookPage[] {
  const pages: EstateGuideBookPage[] = [];
  for (const spread of spreads) {
    pages.push({
      spreadId: spread.id,
      roomTitle: spread.title,
      kind: "photo",
      roomPageIndex: 0,
      spread,
    });
    pages.push({
      spreadId: spread.id,
      roomTitle: spread.title,
      kind: "text",
      roomPageIndex: 1,
      spread,
    });
  }
  return pages;
}

export function estateGuideBookPageLabel(page: EstateGuideBookPage): string {
  return `${page.roomTitle} — ${page.roomPageIndex + 1} of 2`;
}

export type EstateGuideRoomSpread = {
  spreadId: string;
  roomTitle: string;
  spread: EstateGuideSpreadData;
  photoPage: EstateGuideBookPage;
  textPage: EstateGuideBookPage;
};

/** Each room → one open-book spread (photograph page + caretaker copy page). */
export function expandEstateGuideToRoomSpreads(
  spreads: readonly EstateGuideSpreadData[],
): EstateGuideRoomSpread[] {
  return spreads.map((spread) => ({
    spreadId: spread.id,
    roomTitle: spread.title,
    spread,
    photoPage: {
      spreadId: spread.id,
      roomTitle: spread.title,
      kind: "photo",
      roomPageIndex: 0,
      spread,
    },
    textPage: {
      spreadId: spread.id,
      roomTitle: spread.title,
      kind: "text",
      roomPageIndex: 1,
      spread,
    },
  }));
}

export function estateGuideRoomSpreadLabel(
  spread: EstateGuideRoomSpread,
  spreadIndex: number,
  spreadCount: number,
): string {
  return `${spread.roomTitle} — ${spreadIndex + 1} of ${spreadCount}`;
}
