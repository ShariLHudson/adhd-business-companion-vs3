/**
 * Extract conversational story snippets from Estate Guide spreads.
 */

import {
  ESTATE_GUIDE_SPREADS,
  getEstateGuideSpread,
} from "@/lib/sparkEstateGuide";
import type { EstateGuideEditorialBlock } from "@/lib/estate/estateGuideEditorial";
import type { EstateGuideStoryPick } from "./types";

function paragraphsFromBlock(block: EstateGuideEditorialBlock): string[] {
  if ("paragraphs" in block && Array.isArray(block.paragraphs)) {
    return block.paragraphs.filter((p) => p.trim().length > 0);
  }
  if ("moments" in block && Array.isArray(block.moments)) {
    return block.moments.flatMap((m) => m.paragraphs ?? []).filter(Boolean);
  }
  return [];
}

function toConversationalSnippet(paragraphs: string[], maxParagraphs = 3): string {
  const selected = paragraphs
    .slice(0, maxParagraphs)
    .map((p) => p.replace(/^["']|["']$/g, "").trim())
    .filter((p) => p.length > 8);
  return selected.join("\n\n");
}

function teaserFromParagraphs(paragraphs: string[]): string {
  const first = paragraphs.find((p) => p.length > 20);
  if (!first) return "a quiet story from the Estate";
  const trimmed = first.length > 90 ? `${first.slice(0, 87).trim()}…` : first;
  return trimmed.toLowerCase().replace(/\.$/, "");
}

export function buildStoryPick(spreadId: string, reason: string): EstateGuideStoryPick | null {
  const spread = getEstateGuideSpread(spreadId);
  if (!spread) return null;

  const block =
    spread.blocks.find((b) => paragraphsFromBlock(b).length >= 2) ?? spread.blocks[0];
  if (!block) return null;

  const paragraphs = paragraphsFromBlock(block);
  if (paragraphs.length === 0) return null;

  return {
    spreadId: spread.id,
    title: spread.title,
    placeId: spread.imagePlaceId ?? null,
    teaser: teaserFromParagraphs(paragraphs),
    conversationalSnippet: toConversationalSnippet(paragraphs),
    blockType: block.type,
    reason,
  };
}

export function listAvailableSpreadIds(): string[] {
  return ESTATE_GUIDE_SPREADS.map((s) => s.id);
}

export function storyTitle(spreadId: string): string {
  return getEstateGuideSpread(spreadId)?.title ?? spreadId;
}
