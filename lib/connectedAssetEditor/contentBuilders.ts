/**
 * 054 — Build editable document content from templates / plain text.
 */

import { getEventAssetTemplate } from "@/lib/eventsIntelligence/eventCapabilityRegistry";
import type { ConnectedAssetBlock } from "./types";

function blockId(i: number): string {
  return `blk-${i}-${Math.random().toString(36).slice(2, 6)}`;
}

export function blocksFromOutline(
  outline: readonly string[],
): ConnectedAssetBlock[] {
  return outline.map((title, order) => ({
    id: blockId(order),
    title,
    body: "",
    order,
  }));
}

export function plainTextFromBlocks(blocks: ConnectedAssetBlock[]): string {
  return blocks
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((b) => {
      const head = b.title.trim();
      const body = b.body.trim();
      if (head && body) return `${head}\n${body}`;
      return head || body;
    })
    .filter(Boolean)
    .join("\n\n");
}

export function blocksFromPlainText(text: string): ConnectedAssetBlock[] {
  const parts = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) {
    return [{ id: blockId(0), title: "Draft", body: "", order: 0 }];
  }
  return parts.map((part, order) => {
    const [first, ...rest] = part.split("\n");
    return {
      id: blockId(order),
      title: (first ?? "Section").trim(),
      body: rest.join("\n").trim(),
      order,
    };
  });
}

export function initialBlocksForAsset(input: {
  assetTypeId: string;
  templateId?: string | null;
  seedPlainText?: string | null;
}): ConnectedAssetBlock[] {
  if (input.seedPlainText?.trim()) {
    return blocksFromPlainText(input.seedPlainText);
  }
  if (input.templateId) {
    const tpl = getEventAssetTemplate(input.templateId);
    if (tpl?.starterOutline.length) {
      return blocksFromOutline(tpl.starterOutline);
    }
  }
  // Sensible empty shell per common types
  if (input.assetTypeId === "agenda") {
    return blocksFromOutline([
      "Welcome",
      "Core session",
      "Break",
      "Practice / discussion",
      "Close",
    ]);
  }
  return [{ id: blockId(0), title: "Draft", body: "", order: 0 }];
}
